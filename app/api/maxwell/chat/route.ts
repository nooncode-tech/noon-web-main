import { NextResponse } from "next/server";
import { z } from "zod";
import { chatWithOpenAI, type ChatMessage } from "@/lib/api-ia";
import { getAuthenticatedViewer } from "@/lib/auth/session";
import { viewerOwnsStudioSession } from "@/lib/auth/ownership";
import {
  createStudioSession,
  getStudioSession,
  updateStudioSessionStatus,
  appendStudioMessage,
  getStudioMessagesForOpenAI,
} from "@/lib/maxwell/repositories";
import { canReceiveMessage } from "@/lib/maxwell/state-machine";
import { MAXWELL_CHAT_SYSTEM_PROMPT } from "@/lib/maxwell/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const READY_TOKEN = "[READY_FOR_PROTOTYPE]";
const PROJECT_NAME_REGEX = /\[PROJECT_NAME:\s*([^\]]+)\]/;
const PROJECT_TYPE_REGEX =
  /\[PROJECT_TYPE:\s*(web_landing|ecommerce|webapp_system|mobile|saas_ai_automation)\s*\]/i;
const COMPLEXITY_REGEX = /\[COMPLEXITY:\s*(bajo|medio|alto)\s*\]/i;

type ValidProjectType =
  | "web_landing"
  | "ecommerce"
  | "webapp_system"
  | "mobile"
  | "saas_ai_automation";
type ValidComplexity = "bajo" | "medio" | "alto";

function extractSignals(raw: string): {
  clean: string;
  readyForPrototype: boolean;
  projectName: string | null;
  projectType: ValidProjectType | null;
  complexityHint: ValidComplexity | null;
  thinkingHint: string | null;
} {
  const readyForPrototype = raw.includes(READY_TOKEN);
  const projectNameMatch = PROJECT_NAME_REGEX.exec(raw);
  const projectTypeMatch = PROJECT_TYPE_REGEX.exec(raw);
  const complexityMatch = COMPLEXITY_REGEX.exec(raw);

  let thinkingHint: string | null = null;
  let clean = raw;

  const thinkMatch = /<think>([\s\S]*?)<\/think>/i.exec(raw);
  if (thinkMatch) {
    thinkingHint = thinkMatch[1].trim();
    clean = clean.replace(thinkMatch[0], "");
  }

  clean = clean
    .replace(READY_TOKEN, "")
    .replace(PROJECT_NAME_REGEX, "")
    .replace(PROJECT_TYPE_REGEX, "")
    .replace(COMPLEXITY_REGEX, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return {
    clean,
    readyForPrototype,
    projectName: projectNameMatch ? projectNameMatch[1].trim() : null,
    projectType: projectTypeMatch
      ? (projectTypeMatch[1].toLowerCase() as ValidProjectType)
      : null,
    complexityHint: complexityMatch
      ? (complexityMatch[1].toLowerCase() as ValidComplexity)
      : null,
    thinkingHint,
  };
}

const chatRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(4000).optional(),
    session_id: z.string().optional(),
    prompt: z.string().trim().min(1).max(4000).optional(),
  })
  .refine((data) => data.message || data.prompt, {
    message: "Either 'message' or 'prompt' is required.",
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = chatRequestSchema.parse(body);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "OpenAI API key is not configured." },
        { status: 503 },
      );
    }

    const viewer = await getAuthenticatedViewer();
    if (!viewer) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    const userText = (parsed.message ?? parsed.prompt)!;

    let session = null;
    if (parsed.session_id) {
      session = await getStudioSession(parsed.session_id);
      if (!session) {
        return NextResponse.json({ message: "Session not found." }, { status: 404 });
      }
      if (!viewerOwnsStudioSession(viewer, session)) {
        return NextResponse.json({ message: "Forbidden." }, { status: 403 });
      }
    } else {
      session = await createStudioSession({
        initialPrompt: userText,
        ownerEmail: viewer.email,
        ownerName: viewer.name,
        ownerImage: viewer.image,
      });
    }

    if (session.status === "generating_prototype") {
      session = await updateStudioSessionStatus(session.id, "clarifying");
    } else if (session.status === "revision_requested") {
      session = await updateStudioSessionStatus(session.id, "prototype_ready");
    }

    if (!canReceiveMessage(session.status)) {
      return NextResponse.json(
        {
          message: `Session is in state "${session.status}" and cannot receive messages.`,
        },
        { status: 409 },
      );
    }

    if (session.status === "intake") {
      session = await updateStudioSessionStatus(session.id, "clarifying");
    }

    await appendStudioMessage({
      studioSessionId: session.id,
      role: "user",
      content: userText,
      messageType: "chat",
    });

    const dbHistory = await getStudioMessagesForOpenAI(session.id);
    const historyForOpenAI = dbHistory.slice(0, -1);

    const { reply: rawReply } = await chatWithOpenAI({
      prompt: userText,
      history: historyForOpenAI as ChatMessage[],
      systemPrompt: MAXWELL_CHAT_SYSTEM_PROMPT,
    });

    const {
      clean,
      readyForPrototype,
      projectName,
      projectType,
      complexityHint,
      thinkingHint,
    } = extractSignals(rawReply);

    await appendStudioMessage({
      studioSessionId: session.id,
      role: "assistant",
      content: clean,
      messageType: "chat",
    });

    if (thinkingHint) {
      await appendStudioMessage({
        studioSessionId: session.id,
        role: "assistant",
        content: thinkingHint,
        messageType: "thinking",
      });
    }

    const sessionUpdate: Record<string, string> = {};
    if (projectName) sessionUpdate.goalSummary = projectName;
    if (projectType) sessionUpdate.projectType = projectType;
    if (complexityHint) sessionUpdate.complexityHint = complexityHint;

    if (Object.keys(sessionUpdate).length > 0) {
      session = await updateStudioSessionStatus(
        session.id,
        session.status,
        sessionUpdate,
      );
    }

    if (readyForPrototype && session.status === "clarifying") {
      session = await updateStudioSessionStatus(
        session.id,
        "generating_prototype",
      );
    }

    return NextResponse.json({
      reply: clean,
      thinking: thinkingHint,
      readyForPrototype,
      session_id: session.id,
      session_status: session.status,
      project_name: session.goalSummary,
      corrections_used: session.correctionsUsed,
      max_corrections: session.maxCorrections,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request.", fieldErrors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("Maxwell chat error:", error);
    return NextResponse.json(
      { message: "Maxwell could not respond right now. Please try again." },
      { status: 500 },
    );
  }
}

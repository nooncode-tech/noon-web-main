import { NextResponse } from "next/server";
import { z } from "zod";
import { chatWithOpenAI, type ChatMessage } from "@/lib/api-ia";
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

// ── Internal signal parsers ──────────────────────────────────────────────────

const READY_TOKEN = "[READY_FOR_PROTOTYPE]";
const PROJECT_NAME_REGEX = /\[PROJECT_NAME:\s*([^\]]+)\]/;

function extractSignals(raw: string): {
  clean: string;
  readyForPrototype: boolean;
  projectName: string | null;
  thinkingHint: string | null;
} {
  const readyForPrototype = raw.includes(READY_TOKEN);

  const projectNameMatch = PROJECT_NAME_REGEX.exec(raw);
  const projectName = projectNameMatch ? projectNameMatch[1].trim() : null;

  // Extract <think>...</think> block if present (some models emit this)
  let thinkingHint: string | null = null;
  let clean = raw;

  const thinkMatch = /<think>([\s\S]*?)<\/think>/i.exec(raw);
  if (thinkMatch) {
    thinkingHint = thinkMatch[1].trim();
    clean = clean.replace(thinkMatch[0], "");
  }

  // Strip all internal tokens from the visible reply
  clean = clean
    .replace(READY_TOKEN, "")
    .replace(PROJECT_NAME_REGEX, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { clean, readyForPrototype, projectName, thinkingHint };
}

// ── Schema ───────────────────────────────────────────────────────────────────

const chatRequestSchema = z
  .object({
    // Studio path
    message: z.string().trim().min(1).max(4000).optional(),
    session_id: z.string().optional(),
    // Legacy path (modal — backward compatible)
    prompt: z.string().trim().min(1).max(4000).optional(),
    history: z
      .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
      .optional()
      .default([]),
  })
  .refine((d) => d.message || d.prompt, {
    message: "Either 'message' or 'prompt' is required.",
  });

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = chatRequestSchema.parse(body);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ message: "OpenAI API key is not configured." }, { status: 503 });
    }

    const userText = (parsed.message ?? parsed.prompt)!;
    const isStudioRequest = !!parsed.session_id || !!parsed.message;

    // ── Studio path: session-aware, new prompt ──────────────────────────────

    if (isStudioRequest) {
      let session = parsed.session_id ? getStudioSession(parsed.session_id) : null;

      if (!session) {
        session = createStudioSession({ initialPrompt: userText });
      }

      // Auto-recover sessions stuck in generating_prototype or revision_requested
      // (happens when v0 fails mid-generation and the DB status was never reset)
      if (session.status === "generating_prototype" || session.status === "revision_requested") {
        session = updateStudioSessionStatus(session.id, "clarifying");
      }

      if (!canReceiveMessage(session.status)) {
        return NextResponse.json(
          { message: `Session is in state "${session.status}" and cannot receive messages.` },
          { status: 409 }
        );
      }

      if (session.status === "intake") {
        session = updateStudioSessionStatus(session.id, "clarifying");
      }

      appendStudioMessage({
        studioSessionId: session.id,
        role: "user",
        content: userText,
        messageType: "chat",
      });

      const dbHistory = getStudioMessagesForOpenAI(session.id);
      const historyForOpenAI = dbHistory.slice(0, -1);

      const { reply: rawReply } = await chatWithOpenAI({
        prompt: userText,
        history: historyForOpenAI as ChatMessage[],
        systemPrompt: MAXWELL_CHAT_SYSTEM_PROMPT,
      });

      const { clean, readyForPrototype, projectName, thinkingHint } = extractSignals(rawReply);

      // Persist clean reply
      appendStudioMessage({
        studioSessionId: session.id,
        role: "assistant",
        content: clean,
        messageType: "chat",
      });

      // Persist thinking hint if present
      if (thinkingHint) {
        appendStudioMessage({
          studioSessionId: session.id,
          role: "assistant",
          content: thinkingHint,
          messageType: "thinking",
        });
      }

      // Update project name if Maxwell extracted one
      if (projectName) {
        session = updateStudioSessionStatus(session.id, session.status, {
          goalSummary: projectName,
        });
      }

      // Transition clarifying → generating_prototype
      if (readyForPrototype && session.status === "clarifying") {
        session = updateStudioSessionStatus(session.id, "generating_prototype");
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
    }

    // ── Legacy path: stateless modal ────────────────────────────────────────

    const { reply: rawReply } = await chatWithOpenAI({
      prompt: userText,
      history: parsed.history as ChatMessage[],
      systemPrompt: MAXWELL_CHAT_SYSTEM_PROMPT,
    });

    const { clean, readyForPrototype } = extractSignals(rawReply);

    return NextResponse.json({ reply: clean, readyForPrototype });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request.", fieldErrors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Maxwell chat error:", error);
    return NextResponse.json(
      { message: "Maxwell could not respond right now. Please try again." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { chatWithOpenAI, type ChatMessage } from "@/lib/api-ia";
import { getAuthenticatedViewer } from "@/lib/auth/session";
import { viewerOwnsStudioSession } from "@/lib/auth/ownership";
import {
  getStudioSession,
  getStudioMessagesForOpenAI,
  getStudioVersions,
  createProposalRequest,
  updateStudioSessionStatus,
  appendStudioMessage,
} from "@/lib/maxwell/repositories";
import { assertCanRequestProposal, MaxwellGuardError } from "@/lib/maxwell/studio-guards";
import { MAXWELL_PROPOSAL_SYSTEM_PROMPT } from "@/lib/maxwell/prompts";
import { buildProposalContext, validateProposalDraft } from "@/lib/maxwell/proposal-rules";
import { classifyProposalCase } from "@/lib/maxwell/proposal-lifecycle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const proposalRequestSchema = z.object({
  session_id: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id } = proposalRequestSchema.parse(body);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "OpenAI API key is not configured." },
        { status: 503 },
      );
    }

    const viewer = await getAuthenticatedViewer();
    if (!viewer) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const session = await getStudioSession(session_id);
    if (!session) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }
    if (!viewerOwnsStudioSession(viewer, session)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    try {
      assertCanRequestProposal(session);
    } catch (error) {
      if (error instanceof MaxwellGuardError) {
        return NextResponse.json(
          { message: error.message, code: error.code },
          { status: 409 },
        );
      }
      throw error;
    }

    if (session.status === "prototype_ready") {
      await updateStudioSessionStatus(session.id, "approved_for_proposal");
    }

    await updateStudioSessionStatus(session.id, "proposal_pending_review", {
      proposalRequestedAt: new Date().toISOString(),
    });

    const dbMessages = await getStudioMessagesForOpenAI(session.id);
    const dbVersions = await getStudioVersions(session.id);
    const richContext = buildProposalContext(session, dbMessages, dbVersions);

    const { reply: draftContent } = await chatWithOpenAI({
      prompt: richContext,
      history: [] as ChatMessage[],
      systemPrompt: MAXWELL_PROPOSAL_SYSTEM_PROMPT,
    });

    const warnings = validateProposalDraft(draftContent);
    if (warnings.length > 0) {
      console.warn(
        `[Maxwell Proposal] Draft for session ${session.id} has ${warnings.length} review flag(s):\n${warnings.join("\n")}`,
      );
    }

    const draftWithFlags =
      warnings.length > 0
        ? `${draftContent}\n\n---\n\n_PM Review Flags (internal only):_\n${warnings
            .map((warning) => `- ${warning}`)
            .join("\n")}`
        : draftContent;

    const proposalRequest = await createProposalRequest({
      studioSessionId: session.id,
      draftContent: draftWithFlags,
      caseClassification: classifyProposalCase({ warningCount: warnings.length }),
      deliveryRecipient: session.ownerEmail,
    });

    await appendStudioMessage({
      studioSessionId: session.id,
      role: "user",
      content: "Formal proposal requested.",
      messageType: "proposal_request",
    });

    return NextResponse.json({
      proposal_request_id: proposalRequest.id,
      status: proposalRequest.status,
      session_id: session.id,
      session_status: "proposal_pending_review",
      review_flags: warnings.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    }

    console.error("Maxwell proposal error:", error);
    return NextResponse.json(
      { message: "Could not generate proposal right now. Please try again." },
      { status: 500 },
    );
  }
}

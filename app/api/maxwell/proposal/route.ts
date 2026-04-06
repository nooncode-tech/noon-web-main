import { NextResponse } from "next/server";
import { z } from "zod";
import { chatWithOpenAI, type ChatMessage } from "@/lib/api-ia";
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Schema ────────────────────────────────────────────────────────────────────

const proposalRequestSchema = z.object({
  // Studio path
  session_id: z.string().optional(),
  // Legacy path
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional()
    .default([]),
  initialPrompt: z.string().optional().default(""),
});

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, history, initialPrompt } = proposalRequestSchema.parse(body);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ message: "OpenAI API key is not configured." }, { status: 503 });
    }

    // ── Studio path ────────────────────────────────────────────────────────

    if (session_id) {
      const session = getStudioSession(session_id);

      if (!session) {
        return NextResponse.json({ message: "Session not found." }, { status: 404 });
      }

      try {
        assertCanRequestProposal(session);
      } catch (err) {
        if (err instanceof MaxwellGuardError) {
          return NextResponse.json({ message: err.message, code: err.code }, { status: 409 });
        }
        throw err;
      }

      // Auto-approve if coming from prototype_ready (skip-to-proposal shortcut)
      if (session.status === "prototype_ready") {
        updateStudioSessionStatus(session.id, "approved_for_proposal");
      }

      // Transition → proposal_pending_review
      updateStudioSessionStatus(session.id, "proposal_pending_review", {
        proposalRequestedAt: new Date().toISOString(),
      });

      // Load conversation history and version history from DB
      const dbMessages = getStudioMessagesForOpenAI(session.id);
      const dbVersions = getStudioVersions(session.id);

      // Build rich context for the AI
      const richContext = buildProposalContext(session, dbMessages, dbVersions);

      const { reply: draftContent } = await chatWithOpenAI({
        prompt: richContext,
        history: [],
        systemPrompt: MAXWELL_PROPOSAL_SYSTEM_PROMPT,
      });

      // Validate draft against commercial rules — log warnings for PM reviewer
      const warnings = validateProposalDraft(draftContent);
      if (warnings.length > 0) {
        console.warn(
          `[Maxwell Proposal] Draft for session ${session.id} has ${warnings.length} review flag(s):\n` +
            warnings.join("\n")
        );
      }

      // Append warnings to draft as hidden PM notes (prefixed with [REVIEW])
      const draftWithFlags =
        warnings.length > 0
          ? `${draftContent}\n\n---\n\n_PM Review Flags (internal only):_\n${warnings.map((w) => `- ${w}`).join("\n")}`
          : draftContent;

      // Persist proposal request (draft goes to PM review, never sent directly)
      const proposalRequest = createProposalRequest({
        studioSessionId: session.id,
        draftContent: draftWithFlags,
      });

      // Log proposal request message in conversation
      appendStudioMessage({
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
    }

    // ── Legacy path: stateless modal (backward compatible) ────────────────

    const legacyContext =
      history.length > 0
        ? history.map((m) => `${m.role === "user" ? "Client" : "Maxwell"}: ${m.content}`).join("\n")
        : initialPrompt;

    const { reply } = await chatWithOpenAI({
      prompt: `Generate a formal project proposal based on this conversation:\n\n${legacyContext}`,
      history: history as ChatMessage[],
      systemPrompt: MAXWELL_PROPOSAL_SYSTEM_PROMPT,
    });

    return NextResponse.json({ proposal: reply });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    }
    console.error("Maxwell proposal error:", error);
    return NextResponse.json(
      { message: "Could not generate proposal right now. Please try again." },
      { status: 500 }
    );
  }
}

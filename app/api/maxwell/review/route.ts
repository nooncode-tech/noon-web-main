import { NextResponse } from "next/server";
import { z } from "zod";
import { getReviewRequestAccess } from "@/lib/auth/review";
import {
  appendProposalReviewEvent,
  createProposalRequestVersion,
  getProposalRequest,
  getStudioSession,
  updateProposalDraftContent,
  updateProposalRequest,
  updateProposalRequestStatus,
  updateStudioSessionStatus,
} from "@/lib/maxwell/repositories";
import { stripInternalReviewFlags } from "@/lib/maxwell/proposal-content";
import {
  ProposalEmailConfigurationError,
  ProposalEmailSendError,
  sendProposalEmail,
} from "@/lib/maxwell/proposal-email";
import { buildPublicProposalUrl } from "@/lib/maxwell/public-url";
import { assertProposalNotSent, MaxwellGuardError } from "@/lib/maxwell/studio-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const approveSchema = z.object({
  action: z.literal("approve_and_send"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1).optional(),
  delivery_recipient: z.string().email().optional(),
  case_classification: z.enum(["normal", "special"]).optional(),
  notes: z.string().optional(),
});

const editSchema = z.object({
  action: z.literal("edit"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1).optional(),
  draft_content: z.string().min(1),
  delivery_recipient: z.string().email().optional(),
  case_classification: z.enum(["normal", "special"]).optional(),
  notes: z.string().optional(),
});

const newVersionSchema = z.object({
  action: z.literal("create_new_version"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1).optional(),
  draft_content: z.string().min(1).optional(),
  delivery_recipient: z.string().email().optional(),
  case_classification: z.enum(["normal", "special"]).optional(),
  notes: z.string().optional(),
});

const returnSchema = z.object({
  action: z.literal("return_to_draft"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1).optional(),
  notes: z.string().min(1, "A reason is required when returning to draft"),
});

const escalateSchema = z.object({
  action: z.literal("escalate"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1).optional(),
  notes: z.string().min(1, "Escalation reason is required"),
});

const reviewSchema = z.discriminatedUnion("action", [
  approveSchema,
  editSchema,
  newVersionSchema,
  returnSchema,
  escalateSchema,
]);

export async function GET(request: Request) {
  const access = await getReviewRequestAccess(request);
  if (!access.authorized) {
    const status = access.reason === "sign_in_required" ? 401 : 403;
    return NextResponse.json({ message: "Unauthorized." }, { status });
  }

  const { searchParams } = new URL(request.url);
  const proposalRequestId = searchParams.get("id");

  if (!proposalRequestId) {
    return NextResponse.json(
      { message: "Missing required query parameter: id" },
      { status: 400 }
    );
  }

  const proposal = await getProposalRequest(proposalRequestId);
  if (!proposal) {
    return NextResponse.json({ message: "Proposal request not found." }, { status: 404 });
  }

  const session = await getStudioSession(proposal.studioSessionId);

  return NextResponse.json({
    proposal_request: proposal,
    session: session ?? null,
  });
}

export async function POST(request: Request) {
  const access = await getReviewRequestAccess(request);
  if (!access.authorized) {
    const status = access.reason === "sign_in_required" ? 401 : 403;
    return NextResponse.json({ message: "Unauthorized." }, { status });
  }

  try {
    const body = await request.json();
    const payload = reviewSchema.parse(body);
    const actor = payload.actor ?? access.actor;

    const proposal = await getProposalRequest(payload.proposal_request_id);
    if (!proposal) {
      return NextResponse.json({ message: "Proposal request not found." }, { status: 404 });
    }

    if (payload.action !== "create_new_version") {
      try {
        assertProposalNotSent(proposal.status);
      } catch (err) {
        if (err instanceof MaxwellGuardError) {
          return NextResponse.json({ message: err.message, code: err.code }, { status: 409 });
        }
        throw err;
      }
    }

    const session = await getStudioSession(proposal.studioSessionId);
    if (!session) {
      return NextResponse.json({ message: "Associated session not found." }, { status: 404 });
    }

    if (payload.action === "approve_and_send") {
      const deliveryRecipient = payload.delivery_recipient ?? proposal.deliveryRecipient;
      if (!deliveryRecipient) {
        return NextResponse.json(
          { message: "A delivery recipient email is required before sending the proposal." },
          { status: 400 }
        );
      }

      const publicUrl = buildPublicProposalUrl(proposal.publicToken, request);

      let emailResult;
      try {
        emailResult = await sendProposalEmail({
          proposalId: proposal.id,
          versionNumber: proposal.versionNumber,
          to: deliveryRecipient,
          publicUrl,
          projectTitle: session.goalSummary ?? session.initialPrompt ?? `Proposal ${proposal.id}`,
        });
      } catch (error) {
        await appendProposalReviewEvent({
          proposalRequestId: proposal.id,
          action: "delivery_failed",
          actor,
          notes: error instanceof Error ? error.message : "Unknown delivery error.",
        });

        if (error instanceof ProposalEmailConfigurationError) {
          return NextResponse.json(
            { message: error.message, code: "EMAIL_NOT_CONFIGURED" },
            { status: 503 }
          );
        }

        if (error instanceof ProposalEmailSendError) {
          return NextResponse.json(
            { message: error.message, code: "EMAIL_SEND_FAILED" },
            { status: 502 }
          );
        }

        throw error;
      }

      const sentAt = new Date().toISOString();
      const updated = await updateProposalRequestStatus(proposal.id, "sent", {
        reviewerId: actor,
        sentAt,
        deliveryStatus: "sent",
        deliveryRecipient,
        caseClassification: payload.case_classification ?? proposal.caseClassification,
      });

      await updateStudioSessionStatus(session.id, "proposal_sent");

      await appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "approve_and_send",
        actor,
        notes:
          payload.notes ??
          `Delivered to ${deliveryRecipient} via ${emailResult.provider} (${emailResult.messageId}).`,
      });

      await appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "sent",
        actor,
        notes: `Email delivered via ${emailResult.provider} (${emailResult.messageId}).`,
      });

      return NextResponse.json({
        proposal_request: updated,
        session_status: "proposal_sent",
        public_url: publicUrl,
        message: "Proposal approved and sent by email.",
      });
    }

    if (payload.action === "edit") {
      const sanitizedDraft = stripInternalReviewFlags(payload.draft_content);
      await updateProposalDraftContent(proposal.id, sanitizedDraft);

      const updated = await updateProposalRequest(proposal.id, {
        status: "under_review",
        reviewerId: actor,
        caseClassification: payload.case_classification,
        deliveryRecipient: payload.delivery_recipient,
      });

      await appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "edit",
        actor,
        notes: payload.notes,
      });

      return NextResponse.json({
        proposal_request: updated,
        message: "Draft updated and marked as under review.",
      });
    }

    if (payload.action === "create_new_version") {
      if (proposal.status !== "sent" && proposal.status !== "expired") {
        return NextResponse.json(
          {
            message:
              "A new commercial version can only be created from a sent or expired proposal.",
          },
          { status: 409 }
        );
      }

      const nextDraft =
        payload.draft_content
          ? stripInternalReviewFlags(payload.draft_content)
          : stripInternalReviewFlags(proposal.draftContent);

      const nextProposal = await createProposalRequestVersion({
        proposalRequestId: proposal.id,
        draftContent: nextDraft,
        caseClassification: payload.case_classification ?? proposal.caseClassification,
        deliveryRecipient: payload.delivery_recipient ?? proposal.deliveryRecipient,
      });

      await appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "new_version_created",
        actor,
        notes:
          payload.notes ??
          `Created proposal version ${nextProposal.versionNumber} (${nextProposal.id}).`,
      });

      await appendProposalReviewEvent({
        proposalRequestId: nextProposal.id,
        action: "created",
        actor,
        notes: `Created from prior commercial version ${proposal.id}.`,
      });

      return NextResponse.json({
        proposal_request: nextProposal,
        public_url: buildPublicProposalUrl(nextProposal.publicToken, request),
        message: "New commercial proposal version created.",
      });
    }

    if (payload.action === "return_to_draft") {
      const updated = await updateProposalRequestStatus(proposal.id, "returned", {
        reviewerId: actor,
      });

      await updateStudioSessionStatus(session.id, "approved_for_proposal");

      await appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "return_to_draft",
        actor,
        notes: payload.notes,
      });

      return NextResponse.json({
        proposal_request: updated,
        session_status: "approved_for_proposal",
        message: "Proposal returned to draft for revision.",
      });
    }

    if (payload.action === "escalate") {
      const updated = await updateProposalRequestStatus(proposal.id, "escalated", {
        reviewerId: actor,
      });

      await appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "escalate",
        actor,
        notes: payload.notes,
      });

      return NextResponse.json({
        proposal_request: updated,
        message: "Proposal escalated for senior review.",
      });
    }

    return NextResponse.json({ message: "Unsupported action." }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request.", fieldErrors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Maxwell review error:", error);
    return NextResponse.json(
      { message: "Review action failed. Please try again." },
      { status: 500 }
    );
  }
}

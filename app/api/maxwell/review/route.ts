/**
 * app/api/maxwell/review/route.ts
 *
 * Cola de revisión humana para propuestas Maxwell Studio.
 * Solo accesible por el equipo interno de Noon (PM / admin).
 *
 * Acciones disponibles:
 *   approve_and_send  → Aprueba el draft y lo marca como enviado al cliente.
 *   edit              → Actualiza el draft_content y pasa a under_review.
 *   return_to_draft   → Devuelve a pending_review con nota del PM.
 *   escalate          → Marca como escalado para revisión superior.
 *
 * Auth: requiere REVIEW_API_SECRET en la cabecera Authorization.
 * En producción esto se reemplaza por un sistema de autenticación real.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getProposalRequest,
  updateProposalRequestStatus,
  updateProposalDraftContent,
  appendProposalReviewEvent,
  updateStudioSessionStatus,
  getStudioSession,
} from "@/lib/maxwell/repositories";
import {
  assertProposalNotSent,
  MaxwellGuardError,
} from "@/lib/maxwell/studio-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Auth helper ───────────────────────────────────────────────────────────────

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVIEW_API_SECRET;
  // If no secret is configured, block all access in production
  if (!secret) return process.env.NODE_ENV !== "production";
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const approveSchema = z.object({
  action: z.literal("approve_and_send"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1),
  notes: z.string().optional(),
});

const editSchema = z.object({
  action: z.literal("edit"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1),
  draft_content: z.string().min(1),
  notes: z.string().optional(),
});

const returnSchema = z.object({
  action: z.literal("return_to_draft"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1),
  notes: z.string().min(1, "A reason is required when returning to draft"),
});

const escalateSchema = z.object({
  action: z.literal("escalate"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1),
  notes: z.string().min(1, "Escalation reason is required"),
});

const reviewSchema = z.discriminatedUnion("action", [
  approveSchema,
  editSchema,
  returnSchema,
  escalateSchema,
]);

// ── GET — fetch proposal details for the review UI ────────────────────────────

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const proposalRequestId = searchParams.get("id");

  if (!proposalRequestId) {
    return NextResponse.json(
      { message: "Missing required query parameter: id" },
      { status: 400 }
    );
  }

  const proposal = getProposalRequest(proposalRequestId);
  if (!proposal) {
    return NextResponse.json({ message: "Proposal request not found." }, { status: 404 });
  }

  const session = getStudioSession(proposal.studioSessionId);

  return NextResponse.json({
    proposal_request: proposal,
    session: session ?? null,
  });
}

// ── POST — PM review action ───────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = reviewSchema.parse(body);

    const proposal = getProposalRequest(payload.proposal_request_id);
    if (!proposal) {
      return NextResponse.json({ message: "Proposal request not found." }, { status: 404 });
    }

    // Guard: cannot act on a proposal that was already sent
    try {
      assertProposalNotSent(proposal.status);
    } catch (err) {
      if (err instanceof MaxwellGuardError) {
        return NextResponse.json({ message: err.message, code: err.code }, { status: 409 });
      }
      throw err;
    }

    const session = getStudioSession(proposal.studioSessionId);
    if (!session) {
      return NextResponse.json({ message: "Associated session not found." }, { status: 404 });
    }

    // ── approve_and_send ───────────────────────────────────────────────────

    if (payload.action === "approve_and_send") {
      // Mark proposal as sent
      const updated = updateProposalRequestStatus(proposal.id, "sent", {
        reviewerId: payload.actor,
      });

      // Transition session → proposal_sent
      updateStudioSessionStatus(session.id, "proposal_sent");

      // Record the review event
      appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "approve_and_send",
        actor: payload.actor,
        notes: payload.notes,
      });

      return NextResponse.json({
        proposal_request: updated,
        session_status: "proposal_sent",
        message: "Proposal approved and marked as sent.",
      });
    }

    // ── edit ───────────────────────────────────────────────────────────────

    if (payload.action === "edit") {
      // Update draft content
      updateProposalDraftContent(proposal.id, payload.draft_content);

      // Mark as under_review
      const updated = updateProposalRequestStatus(proposal.id, "under_review", {
        reviewerId: payload.actor,
      });

      appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "edit",
        actor: payload.actor,
        notes: payload.notes,
      });

      return NextResponse.json({
        proposal_request: updated,
        message: "Draft updated and marked as under review.",
      });
    }

    // ── return_to_draft ────────────────────────────────────────────────────

    if (payload.action === "return_to_draft") {
      const updated = updateProposalRequestStatus(proposal.id, "returned", {
        reviewerId: payload.actor,
      });

      // Session stays in proposal_pending_review — PM will re-trigger generation
      // or manually edit before re-submitting

      appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "return_to_draft",
        actor: payload.actor,
        notes: payload.notes,
      });

      return NextResponse.json({
        proposal_request: updated,
        message: "Proposal returned to draft for revision.",
      });
    }

    // ── escalate ───────────────────────────────────────────────────────────

    if (payload.action === "escalate") {
      const updated = updateProposalRequestStatus(proposal.id, "escalated", {
        reviewerId: payload.actor,
      });

      appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "escalate",
        actor: payload.actor,
        notes: payload.notes,
      });

      return NextResponse.json({
        proposal_request: updated,
        message: "Proposal escalated for senior review.",
      });
    }

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

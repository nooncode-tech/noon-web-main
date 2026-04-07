/**
 * app/api/maxwell/payment/route.ts
 *
 * Payment boundary for Maxwell Studio.
 * Browser access must come from an allowlisted internal reviewer session.
 * REVIEW_API_SECRET remains supported only for automation and server-to-server calls.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getReviewRequestAccess } from "@/lib/auth/review";
import {
  getProposalRequest,
  getStudioSession,
  updateStudioSessionStatus,
  getClientWorkspaceBySession,
  createClientWorkspace,
  activateClientWorkspace,
  getLatestProposalRequest,
  updateProposalRequestStatus,
} from "@/lib/maxwell/repositories";
import {
  assertSessionAwaitingPayment,
  assertWorkspaceNotProvisioned,
  MaxwellGuardError,
} from "@/lib/maxwell/studio-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const markPendingSchema = z.object({
  action: z.literal("mark_payment_pending"),
  proposal_request_id: z.string().min(1),
});

const submitEvidenceSchema = z.object({
  action: z.literal("submit_payment_evidence"),
  proposal_request_id: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

const verifyPaymentSchema = z.object({
  action: z.literal("verify_payment"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1).optional(),
  payment_reference: z.string().max(200).optional(),
  summary: z.string().max(500).optional(),
});

const expireProposalSchema = z.object({
  action: z.literal("expire_proposal"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1).optional(),
});

const confirmPaymentSchema = z.object({
  action: z.literal("confirm_payment"),
  session_id: z.string().min(1),
  payment_status: z.enum(["confirmed", "failed", "refunded"]),
  summary: z.string().max(500).optional(),
  payment_reference: z.string().max(200).optional(),
});

const paymentSchema = z.discriminatedUnion("action", [
  markPendingSchema,
  submitEvidenceSchema,
  verifyPaymentSchema,
  expireProposalSchema,
  confirmPaymentSchema,
]);

export async function GET(request: Request) {
  const access = await getReviewRequestAccess(request);
  if (!access.authorized) {
    const status = access.reason === "sign_in_required" ? 401 : 403;
    return NextResponse.json({ message: "Unauthorized." }, { status });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { message: "Missing required query parameter: session_id" },
      { status: 400 },
    );
  }

  const session = await getStudioSession(sessionId);
  if (!session) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }

  const workspace = await getClientWorkspaceBySession(sessionId);
  const proposal = await getLatestProposalRequest(sessionId);

  return NextResponse.json({
    session_id: session.id,
    session_status: session.status,
    proposal_status: proposal?.status ?? null,
    workspace: workspace ?? null,
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
    const payload = paymentSchema.parse(body);
    const actor = "actor" in payload ? payload.actor ?? access.actor : access.actor;

    if (payload.action === "mark_payment_pending") {
      const proposal = await getProposalRequest(payload.proposal_request_id);
      if (!proposal) {
        return NextResponse.json({ message: "Proposal request not found." }, { status: 404 });
      }
      if (proposal.status !== "sent") {
        return NextResponse.json(
          { message: "Only a sent proposal can move into payment pending." },
          { status: 409 },
        );
      }

      const updated = await updateProposalRequestStatus(payload.proposal_request_id, "payment_pending");
      return NextResponse.json({
        message: "Proposal marked as payment pending.",
        proposal_status: updated.status,
        expires_at: updated.expiresAt,
      });
    }

    if (payload.action === "submit_payment_evidence") {
      const proposal = await updateProposalRequestStatus(
        payload.proposal_request_id,
        "payment_under_verification",
      );
      return NextResponse.json({
        message: "Payment evidence submitted. Under verification.",
        proposal_status: proposal.status,
      });
    }

    if (payload.action === "verify_payment") {
      const proposal = await getProposalRequest(payload.proposal_request_id);
      if (!proposal) {
        return NextResponse.json({ message: "Proposal request not found." }, { status: 404 });
      }

      const session = await getStudioSession(proposal.studioSessionId);
      if (!session) {
        return NextResponse.json({ message: "Associated session not found." }, { status: 404 });
      }

      try {
        assertSessionAwaitingPayment(session);
      } catch (error) {
        if (error instanceof MaxwellGuardError) {
          return NextResponse.json({ message: error.message, code: error.code }, { status: 409 });
        }
        throw error;
      }

      const existingWorkspace = await getClientWorkspaceBySession(session.id);

      try {
        assertWorkspaceNotProvisioned(existingWorkspace);
      } catch (error) {
        if (error instanceof MaxwellGuardError) {
          return NextResponse.json({
            message: "Workspace already provisioned.",
            code: error.code,
            workspace: existingWorkspace,
            proposal_status: "paid",
          });
        }
        throw error;
      }

      await updateProposalRequestStatus(payload.proposal_request_id, "paid", {
        reviewerId: actor,
      });
      await updateStudioSessionStatus(session.id, "converted");

      const workspaceToActivate =
        existingWorkspace ??
        (await createClientWorkspace({ studioSessionId: session.id, paymentStatus: "confirmed" }));

      const activeWorkspace = await activateClientWorkspace(
        workspaceToActivate.id,
        payload.summary ?? `Payment verified. Reference: ${payload.payment_reference ?? "N/A"}`,
      );

      return NextResponse.json({
        message: "Payment verified. Workspace activated.",
        workspace: activeWorkspace,
        session_status: "converted",
        proposal_status: "paid",
      });
    }

    if (payload.action === "expire_proposal") {
      const proposal = await updateProposalRequestStatus(payload.proposal_request_id, "expired", {
        reviewerId: actor,
      });
      return NextResponse.json({
        message: "Proposal marked as expired.",
        proposal_status: proposal.status,
      });
    }

    if (payload.action === "confirm_payment") {
      const session = await getStudioSession(payload.session_id);
      if (!session) {
        return NextResponse.json({ message: "Session not found." }, { status: 404 });
      }

      const existingWorkspace = await getClientWorkspaceBySession(session.id);

      try {
        assertWorkspaceNotProvisioned(existingWorkspace);
      } catch (error) {
        if (error instanceof MaxwellGuardError) {
          return NextResponse.json({
            message: "Workspace already provisioned.",
            code: error.code,
            workspace: existingWorkspace,
            session_status: session.status,
          });
        }
        throw error;
      }

      if (payload.payment_status !== "confirmed") {
        return NextResponse.json({
          message: `Payment ${payload.payment_status}. Workspace remains unavailable until confirmation.`,
          workspace: existingWorkspace ?? null,
          session_status: session.status,
        });
      }

      try {
        assertSessionAwaitingPayment(session);
      } catch (error) {
        if (error instanceof MaxwellGuardError) {
          return NextResponse.json({ message: error.message, code: error.code }, { status: 409 });
        }
        throw error;
      }

      await updateStudioSessionStatus(session.id, "converted");
      const workspaceToActivate =
        existingWorkspace ??
        (await createClientWorkspace({ studioSessionId: session.id, paymentStatus: "confirmed" }));
      const activeWorkspace = await activateClientWorkspace(
        workspaceToActivate.id,
        payload.summary ?? `Project activated. Reference: ${payload.payment_reference ?? "N/A"}`,
      );

      return NextResponse.json({
        message: "Payment confirmed. Workspace activated.",
        workspace: activeWorkspace,
        session_status: "converted",
      });
    }

    return NextResponse.json({ message: "Unsupported action." }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request.", fieldErrors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Maxwell payment error:", error);
    return NextResponse.json(
      { message: "Payment action failed. Please try again." },
      { status: 500 },
    );
  }
}

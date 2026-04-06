/**
 * app/api/maxwell/payment/route.ts
 *
 * Frontera de pago y activación de workspace para Maxwell Studio.
 *
 * Acciones POST:
 *   confirm_payment          → Activa workspace, convierte sesión (pago verificado por Noon).
 *   mark_payment_pending     → Propuesta enviada → esperando pago del cliente.
 *   submit_payment_evidence  → Cliente reporta que pagó → bajo verificación.
 *   verify_payment           → Noon confirma pago → activa workspace + convierte sesión.
 *   expire_proposal          → Propuesta expirada sin pago.
 *
 * GET: consulta estado de workspace por session_id.
 *
 * Auth: requiere REVIEW_API_SECRET (mismo que /review).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getProposalRequest,
  getStudioSession,
  updateStudioSessionStatus,
  getClientWorkspaceBySession,
  createClientWorkspace,
  activateClientWorkspace,
  getLatestProposalRequest,
  updateProposalRequestStatus,
  updateProposalExpiry,
} from "@/lib/maxwell/repositories";
import {
  assertSessionAwaitingPayment,
  assertWorkspaceNotActive,
  MaxwellGuardError,
} from "@/lib/maxwell/studio-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Auth helper ───────────────────────────────────────────────────────────────

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVIEW_API_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const markPendingSchema = z.object({
  action: z.literal("mark_payment_pending"),
  proposal_request_id: z.string().min(1),
  /** Days until proposal expires. Default 14. */
  expires_in_days: z.number().int().min(1).max(90).optional(),
});

const submitEvidenceSchema = z.object({
  action: z.literal("submit_payment_evidence"),
  proposal_request_id: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

const verifyPaymentSchema = z.object({
  action: z.literal("verify_payment"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1),
  payment_reference: z.string().max(200).optional(),
  summary: z.string().max(500).optional(),
});

const expireProposalSchema = z.object({
  action: z.literal("expire_proposal"),
  proposal_request_id: z.string().min(1),
  actor: z.string().min(1),
});

// Legacy direct confirm (kept for backward compat)
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

// ── GET — workspace status ────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ message: "Missing required query parameter: session_id" }, { status: 400 });
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

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = paymentSchema.parse(body);

    // ── mark_payment_pending ──────────────────────────────────────────────────

    if (payload.action === "mark_payment_pending") {
      const proposal = await updateProposalRequestStatus(payload.proposal_request_id, "payment_pending");
      const expiresAt = new Date(
        Date.now() + (payload.expires_in_days ?? 15) * 24 * 60 * 60 * 1000
      ).toISOString();
      await updateProposalExpiry(proposal.id, expiresAt);
      return NextResponse.json({
        message: "Proposal marked as payment pending.",
        proposal_status: "payment_pending",
        expires_at: expiresAt,
      });
    }

    // ── submit_payment_evidence ───────────────────────────────────────────────

    if (payload.action === "submit_payment_evidence") {
      const proposal = await updateProposalRequestStatus(
        payload.proposal_request_id,
        "payment_under_verification"
      );
      return NextResponse.json({
        message: "Payment evidence submitted. Under verification.",
        proposal_status: proposal.status,
      });
    }

    // ── verify_payment ────────────────────────────────────────────────────────

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
      } catch (err) {
        if (err instanceof MaxwellGuardError) {
          return NextResponse.json({ message: err.message, code: err.code }, { status: 409 });
        }
        throw err;
      }

      const existingWorkspace = await getClientWorkspaceBySession(session.id);

      try {
        assertWorkspaceNotActive(existingWorkspace);
      } catch (err) {
        if (err instanceof MaxwellGuardError) {
          return NextResponse.json({
            message: "Workspace already active.",
            code: err.code,
            workspace: existingWorkspace,
            proposal_status: "paid",
          });
        }
        throw err;
      }

      await updateProposalRequestStatus(payload.proposal_request_id, "paid", {
        reviewerId: payload.actor,
      });
      await updateStudioSessionStatus(session.id, "converted");

      const workspaceToActivate =
        existingWorkspace ??
        await createClientWorkspace({ studioSessionId: session.id, paymentStatus: "confirmed" });

      const activeWorkspace = await activateClientWorkspace(
        workspaceToActivate.id,
        payload.summary ?? `Payment verified. Reference: ${payload.payment_reference ?? "N/A"}`
      );

      return NextResponse.json({
        message: "Payment verified. Workspace activated.",
        workspace: activeWorkspace,
        session_status: "converted",
        proposal_status: "paid",
      });
    }

    // ── expire_proposal ───────────────────────────────────────────────────────

    if (payload.action === "expire_proposal") {
      const proposal = await updateProposalRequestStatus(
        payload.proposal_request_id,
        "expired",
        { reviewerId: payload.actor }
      );
      return NextResponse.json({
        message: "Proposal marked as expired.",
        proposal_status: proposal.status,
      });
    }

    // ── confirm_payment (legacy) ──────────────────────────────────────────────

    if (payload.action === "confirm_payment") {
      const session = await getStudioSession(payload.session_id);
      if (!session) {
        return NextResponse.json({ message: "Session not found." }, { status: 404 });
      }

      const existingWorkspace = await getClientWorkspaceBySession(session.id);

      try {
        assertWorkspaceNotActive(existingWorkspace);
      } catch (err) {
        if (err instanceof MaxwellGuardError) {
          return NextResponse.json({
            message: "Workspace is already active.",
            code: err.code,
            workspace: existingWorkspace,
            session_status: session.status,
          });
        }
        throw err;
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
      } catch (err) {
        if (err instanceof MaxwellGuardError) {
          return NextResponse.json({ message: err.message, code: err.code }, { status: 409 });
        }
        throw err;
      }

      await updateStudioSessionStatus(session.id, "converted");
      const workspaceToActivate =
        existingWorkspace ??
        await createClientWorkspace({ studioSessionId: session.id, paymentStatus: "confirmed" });
      const activeWorkspace = await activateClientWorkspace(
        workspaceToActivate.id,
        payload.summary ?? `Project activated. Reference: ${payload.payment_reference ?? "N/A"}`
      );

      return NextResponse.json({
        message: "Payment confirmed. Workspace activated.",
        workspace: activeWorkspace,
        session_status: "converted",
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request.", fieldErrors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Maxwell payment error:", error);
    return NextResponse.json(
      { message: "Payment action failed. Please try again." },
      { status: 500 }
    );
  }
}

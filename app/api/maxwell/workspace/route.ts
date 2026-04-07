import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedViewer } from "@/lib/auth/session";
import { viewerOwnsStudioSession } from "@/lib/auth/ownership";
import {
  getStudioSession,
  getClientWorkspaceBySession,
  getWorkspaceUpdates,
  createWorkspaceUpdate,
  updateClientWorkspaceStatus,
  appendPaymentEvent,
  getPaymentEvents,
} from "@/lib/maxwell/repositories";
import type { WorkspaceStatus } from "@/lib/maxwell/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVIEW_API_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

const addUpdateSchema = z.object({
  action: z.literal("add_update"),
  workspace_id: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().max(4000).optional(),
  update_type: z.enum(["status_update", "milestone", "material", "note"]).optional(),
  material_url: z.string().url().optional(),
  is_client_visible: z.boolean().optional(),
  created_by: z.string().min(1),
});

const changeStatusSchema = z.object({
  action: z.literal("change_status"),
  workspace_id: z.string().min(1),
  status: z.enum(["active", "paused", "closed"]),
  summary: z.string().max(500).optional(),
});

const logPaymentSchema = z.object({
  action: z.literal("log_payment"),
  session_id: z.string().min(1),
  event_type: z.enum([
    "initiated",
    "received",
    "confirmed",
    "failed",
    "refund_initiated",
    "refunded",
  ]),
  amount_usd: z.number().positive().optional(),
  reference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  created_by: z.string().min(1),
});

const workspaceActionSchema = z.discriminatedUnion("action", [
  addUpdateSchema,
  changeStatusSchema,
  logPaymentSchema,
]);

export async function GET(request: Request) {
  const viewer = await getAuthenticatedViewer();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const isInternal = isAuthorized(request);

  if (!sessionId) {
    return NextResponse.json({ message: "Missing session_id." }, { status: 400 });
  }
  if (!viewer && !isInternal) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const session = await getStudioSession(sessionId);
  if (!session) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }
  if (!isInternal && viewer && !viewerOwnsStudioSession(viewer, session)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const workspace = await getClientWorkspaceBySession(sessionId);
  if (!workspace) {
    return NextResponse.json({ message: "Workspace not found." }, { status: 404 });
  }

  const updates = await getWorkspaceUpdates(workspace.id, {
    clientVisibleOnly: !isInternal,
  });
  const paymentEvents = isInternal ? await getPaymentEvents(sessionId) : [];

  return NextResponse.json({
    workspace,
    project_name: session.goalSummary,
    updates,
    ...(isInternal ? { payment_events: paymentEvents } : {}),
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = workspaceActionSchema.parse(body);

    if (payload.action === "add_update") {
      const update = await createWorkspaceUpdate({
        clientWorkspaceId: payload.workspace_id,
        title: payload.title,
        content: payload.content,
        updateType: payload.update_type,
        materialUrl: payload.material_url,
        isClientVisible: payload.is_client_visible,
        createdBy: payload.created_by,
      });
      return NextResponse.json({ update, message: "Update added." });
    }

    if (payload.action === "change_status") {
      const updated = await updateClientWorkspaceStatus(
        payload.workspace_id,
        payload.status as WorkspaceStatus,
        payload.summary,
      );
      return NextResponse.json({
        workspace: updated,
        message: `Status changed to ${payload.status}.`,
      });
    }

    const event = await appendPaymentEvent({
      studioSessionId: payload.session_id,
      eventType: payload.event_type,
      amountUsd: payload.amount_usd,
      reference: payload.reference,
      notes: payload.notes,
      createdBy: payload.created_by,
    });
    return NextResponse.json({ event, message: "Payment event logged." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request.", fieldErrors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("Workspace error:", error);
    return NextResponse.json(
      { message: "Action failed. Please try again." },
      { status: 500 },
    );
  }
}

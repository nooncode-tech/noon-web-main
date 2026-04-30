import { NextResponse } from "next/server";
import { getAuthenticatedViewer } from "@/lib/auth/session";
import { listStudioSessionsForOwner, softDeleteStudioSession } from "@/lib/maxwell/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getAuthenticatedViewer();
  if (!viewer) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const sessions = await listStudioSessionsForOwner(viewer.email);
  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      initial_prompt: s.initialPrompt,
      status: s.status,
      goal_summary: s.goalSummary,
      updated_at: s.updatedAt,
    })),
  });
}

export async function DELETE(request: Request) {
  const viewer = await getAuthenticatedViewer();
  if (!viewer) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ message: "session_id is required." }, { status: 400 });
  }

  const deleted = await softDeleteStudioSession(sessionId, viewer.email);
  if (!deleted) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getStudioSession, getStudioMessages, getStudioVersions } from "@/lib/maxwell/repositories";
import type { MessageType } from "@/lib/maxwell/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toUiType(messageType: MessageType): "thinking" | "system_event" | undefined {
  if (messageType === "thinking") return "thinking";
  if (messageType === "system_event" || messageType === "prototype_announcement") return "system_event";
  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ message: "session_id is required." }, { status: 400 });
  }

  const session = await getStudioSession(sessionId);
  if (!session) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }

  const dbMessages = await getStudioMessages(sessionId);
  const dbVersions = await getStudioVersions(sessionId);

  const messages = dbMessages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role,
      content: m.content,
      ...(toUiType(m.messageType) ? { type: toUiType(m.messageType) } : {}),
    }));

  const versions = dbVersions.map((v) => ({
    chatId: v.v0ChatId,
    demoUrl: v.previewUrl,
    versionNumber: v.versionNumber,
  }));

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      goalSummary: session.goalSummary,
      correctionsUsed: session.correctionsUsed,
      maxCorrections: session.maxCorrections,
    },
    messages,
    versions,
  });
}

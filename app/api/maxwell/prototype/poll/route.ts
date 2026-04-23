import { NextResponse } from "next/server";
import { z } from "zod";
import { getV0PrototypeStatus } from "@/lib/api-ia";
import { getAuthenticatedViewer } from "@/lib/auth/session";
import { viewerOwnsStudioSession } from "@/lib/auth/ownership";
import {
  getStudioSession,
  createStudioVersion,
  updateStudioSessionStatus,
  appendStudioMessage,
} from "@/lib/maxwell/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");
    const sessionId = searchParams.get("session_id");
    const action = searchParams.get("action");
    const prompt = searchParams.get("prompt");

    if (!chatId || !sessionId || !action) {
      return NextResponse.json({ message: "Missing query params" }, { status: 400 });
    }

    if (!process.env.V0_API_KEY) {
      return NextResponse.json({ message: "V0 API key is not configured." }, { status: 503 });
    }

    const viewer = await getAuthenticatedViewer();
    if (!viewer) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const session = await getStudioSession(sessionId);
    if (!session) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }
    if (!viewerOwnsStudioSession(viewer, session)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    // Call v0 API to check status
    const statusResult = await getV0PrototypeStatus(chatId);

    if (statusResult.status === "pending") {
      return NextResponse.json({ status: "pending" });
    }

    if (statusResult.status === "failed") {
      // Revert status to clarifying
      await updateStudioSessionStatus(session.id, "clarifying");
      return NextResponse.json({ status: "failed" });
    }

    if (statusResult.status === "completed") {
      if (!statusResult.demoUrl) {
         await updateStudioSessionStatus(session.id, "clarifying");
         return NextResponse.json({ status: "failed", message: "Demo URL is missing." });
      }

      // Generation successful. Commit to Database.
      const version = await createStudioVersion({
        studioSessionId: session.id,
        previewUrl: statusResult.demoUrl,
        v0ChatId: chatId,
        changeSummary: action === "update" && prompt ? prompt : undefined,
        source: action === "update" ? "correction" : "initial",
      });

      if (action === "create") {
        await appendStudioMessage({
          studioSessionId: session.id,
          role: "assistant",
          content: `Prototype Version ${version.versionNumber} generated.`,
          messageType: "prototype_announcement",
        });
        await updateStudioSessionStatus(session.id, "prototype_ready");

        return NextResponse.json({
          status: "completed",
          chatId: chatId,
          demoUrl: statusResult.demoUrl,
          session_id: session.id,
          session_status: "prototype_ready",
          version_number: version.versionNumber,
          corrections_used: session.correctionsUsed,
          max_corrections: session.maxCorrections,
        });
      } else if (action === "update") {
        if (prompt) {
          await appendStudioMessage({
            studioSessionId: session.id,
            role: "user",
            content: prompt,
            messageType: "correction_request",
          });
        }
    
        await updateStudioSessionStatus(session.id, "revision_applied");
        await updateStudioSessionStatus(session.id, "prototype_ready");

        return NextResponse.json({
          status: "completed",
          chatId: chatId,
          demoUrl: statusResult.demoUrl,
          session_id: session.id,
          session_status: "prototype_ready",
          version_number: version.versionNumber,
          corrections_used: session.correctionsUsed,
          max_corrections: session.maxCorrections,
        });
      }
    }

    return NextResponse.json({ status: "unknown" });
  } catch (error) {
    console.error("Poll endpoint error:", error);
    return NextResponse.json(
      { message: "Could not poll the prototype status right now.", status: "error" },
      { status: 500 }
    );
  }
}

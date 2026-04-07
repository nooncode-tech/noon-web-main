import { NextResponse } from "next/server";
import { z } from "zod";
import { createV0Prototype, updateV0Prototype } from "@/lib/api-ia";
import { getAuthenticatedViewer } from "@/lib/auth/session";
import { viewerOwnsStudioSession } from "@/lib/auth/ownership";
import { V0_PROTOTYPE_SYSTEM_PROMPT } from "@/lib/maxwell/prompts";
import {
  getStudioSession,
  createStudioVersion,
  incrementCorrectionsUsed,
  updateStudioSessionStatus,
  appendStudioMessage,
} from "@/lib/maxwell/repositories";
import { assertCanRequestCorrection, MaxwellGuardError } from "@/lib/maxwell/studio-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const studioCreateSchema = z.object({
  action: z.literal("create"),
  prompt: z.string().trim().min(1).max(8000),
  session_id: z.string(),
});

const studioUpdateSchema = z.object({
  action: z.literal("update"),
  chatId: z.string().min(1),
  prompt: z.string().trim().min(1).max(4000),
  session_id: z.string(),
});

const requestSchema = z.discriminatedUnion("action", [
  studioCreateSchema,
  studioUpdateSchema,
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = requestSchema.parse(body);

    if (!process.env.V0_API_KEY) {
      return NextResponse.json({ message: "V0 API key is not configured." }, { status: 503 });
    }

    const viewer = await getAuthenticatedViewer();
    if (!viewer) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const session = await getStudioSession(payload.session_id);
    if (!session) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }
    if (!viewerOwnsStudioSession(viewer, session)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    if (payload.action === "create") {
      await updateStudioSessionStatus(session.id, "generating_prototype");

      let result: Awaited<ReturnType<typeof createV0Prototype>>;
      try {
        result = await createV0Prototype({
          prompt: payload.prompt,
          systemPrompt: V0_PROTOTYPE_SYSTEM_PROMPT,
        });
      } catch (v0Error) {
        console.error("v0 prototype creation failed:", v0Error);
        const stuckSession = await getStudioSession(payload.session_id);
        if (stuckSession?.status === "generating_prototype") {
          await updateStudioSessionStatus(stuckSession.id, "clarifying");
        }
        return NextResponse.json(
          { message: "Could not generate the prototype right now. Please try again." },
          { status: 500 },
        );
      }

      const version = await createStudioVersion({
        studioSessionId: session.id,
        previewUrl: result.demoUrl,
        v0ChatId: result.chatId,
        source: "initial",
      });

      await appendStudioMessage({
        studioSessionId: session.id,
        role: "assistant",
        content: `Prototype Version ${version.versionNumber} generated.`,
        messageType: "prototype_announcement",
      });

      await updateStudioSessionStatus(session.id, "prototype_ready");

      return NextResponse.json({
        chatId: result.chatId,
        demoUrl: result.demoUrl,
        session_id: session.id,
        session_status: "prototype_ready",
        version_number: version.versionNumber,
        corrections_used: session.correctionsUsed,
        max_corrections: session.maxCorrections,
      });
    }

    try {
      assertCanRequestCorrection(session);
    } catch (error) {
      if (error instanceof MaxwellGuardError) {
        return NextResponse.json(
          { message: error.message, code: error.code },
          { status: 409 },
        );
      }
      throw error;
    }

    await updateStudioSessionStatus(session.id, "revision_requested");

    let result: Awaited<ReturnType<typeof updateV0Prototype>>;
    try {
      result = await updateV0Prototype({ chatId: payload.chatId, prompt: payload.prompt });
    } catch (v0Error) {
      console.error("v0 prototype update failed:", v0Error);
      await updateStudioSessionStatus(session.id, "prototype_ready");
      return NextResponse.json(
        { message: "Could not apply the adjustment right now. Please try again." },
        { status: 500 },
      );
    }

    const updatedSession = await incrementCorrectionsUsed(session.id);
    const version = await createStudioVersion({
      studioSessionId: session.id,
      previewUrl: result.demoUrl,
      v0ChatId: result.chatId,
      changeSummary: payload.prompt,
      source: "correction",
    });

    await appendStudioMessage({
      studioSessionId: session.id,
      role: "user",
      content: payload.prompt,
      messageType: "correction_request",
    });

    await updateStudioSessionStatus(session.id, "revision_applied");
    await updateStudioSessionStatus(session.id, "prototype_ready");

    return NextResponse.json({
      chatId: result.chatId,
      demoUrl: result.demoUrl,
      session_id: session.id,
      session_status: "prototype_ready",
      version_number: version.versionNumber,
      corrections_used: updatedSession.correctionsUsed,
      max_corrections: updatedSession.maxCorrections,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request.", fieldErrors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Maxwell prototype error:", error);
    return NextResponse.json(
      { message: "Could not generate the prototype right now. Please try again." },
      { status: 500 },
    );
  }
}

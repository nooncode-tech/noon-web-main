import { NextResponse } from "next/server";
import { z } from "zod";
import { createV0Prototype, updateV0Prototype } from "@/lib/api-ia";
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

// ── Schema ───────────────────────────────────────────────────────────────────

const studioCreateSchema = z.object({
  action: z.literal("create"),
  prompt: z.string().trim().min(1).max(8000),
  session_id: z.string().optional(),
});

const studioUpdateSchema = z.object({
  action: z.literal("update"),
  chatId: z.string().min(1),
  prompt: z.string().trim().min(1).max(4000),
  session_id: z.string().optional(),
});

const requestSchema = z.discriminatedUnion("action", [studioCreateSchema, studioUpdateSchema]);

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = requestSchema.parse(body);

    if (!process.env.V0_API_KEY) {
      return NextResponse.json({ message: "V0 API key is not configured." }, { status: 503 });
    }

    // ── Create: initial prototype ──────────────────────────────────────────

    if (payload.action === "create") {
      // Studio path: transition to generating_prototype before calling v0
      const sessionIdForCreate = payload.session_id;
      if (sessionIdForCreate) {
        const sessionPre = getStudioSession(sessionIdForCreate);
        if (sessionPre) {
          updateStudioSessionStatus(sessionPre.id, "generating_prototype");
        }
      }

      let result: Awaited<ReturnType<typeof createV0Prototype>>;
      try {
        result = await createV0Prototype({
          prompt: payload.prompt,
          systemPrompt: V0_PROTOTYPE_SYSTEM_PROMPT,
        });
      } catch (v0Error) {
        console.error("v0 prototype creation failed:", v0Error);
        // Reset session to clarifying so the client can continue chatting
        if (sessionIdForCreate) {
          const stuckSession = getStudioSession(sessionIdForCreate);
          if (stuckSession && stuckSession.status === "generating_prototype") {
            updateStudioSessionStatus(stuckSession.id, "clarifying");
          }
        }
        return NextResponse.json(
          { message: "Could not generate the prototype right now. Please try again." },
          { status: 500 }
        );
      }

      // Studio path: persist version if session provided
      if (sessionIdForCreate) {
        const session = getStudioSession(sessionIdForCreate);
        if (session) {
          const version = createStudioVersion({
            studioSessionId: session.id,
            previewUrl: result.demoUrl,
            v0ChatId: result.chatId,
            source: "initial",
          });

          // Log prototype announcement message
          appendStudioMessage({
            studioSessionId: session.id,
            role: "assistant",
            content: `Prototype Version ${version.versionNumber} generated.`,
            messageType: "prototype_announcement",
          });

          // Transition → prototype_ready
          updateStudioSessionStatus(session.id, "prototype_ready");

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
      }

      // Legacy path (no session)
      return NextResponse.json(result);
    }

    // ── Update: correction ─────────────────────────────────────────────────

    // Studio path with guard
    if (payload.session_id) {
      const session = getStudioSession(payload.session_id);

      if (session) {
        try {
          assertCanRequestCorrection(session);
        } catch (err) {
          if (err instanceof MaxwellGuardError) {
            return NextResponse.json({ message: err.message, code: err.code }, { status: 409 });
          }
          throw err;
        }

        // Transition → revision_requested
        updateStudioSessionStatus(session.id, "revision_requested");

        let result: Awaited<ReturnType<typeof updateV0Prototype>>;
        try {
          result = await updateV0Prototype({ chatId: payload.chatId, prompt: payload.prompt });
        } catch (v0Error) {
          console.error("v0 prototype update failed:", v0Error);
          // Reset session back to prototype_ready so client can retry or approve
          updateStudioSessionStatus(session.id, "prototype_ready");
          return NextResponse.json(
            { message: "Could not apply the adjustment right now. Please try again." },
            { status: 500 }
          );
        }

        // Persist correction version
        const updatedSession = incrementCorrectionsUsed(session.id);
        const version = createStudioVersion({
          studioSessionId: session.id,
          previewUrl: result.demoUrl,
          v0ChatId: result.chatId,
          changeSummary: payload.prompt,
          source: "correction",
        });

        // Log correction message
        appendStudioMessage({
          studioSessionId: session.id,
          role: "user",
          content: payload.prompt,
          messageType: "correction_request",
        });

        // Transition → prototype_ready
        updateStudioSessionStatus(session.id, "prototype_ready");

        return NextResponse.json({
          chatId: result.chatId,
          demoUrl: result.demoUrl,
          session_id: session.id,
          session_status: "prototype_ready",
          version_number: version.versionNumber,
          corrections_used: updatedSession.correctionsUsed,
          max_corrections: updatedSession.maxCorrections,
        });
      }
    }

    // Legacy path (no session)
    const result = await updateV0Prototype({ chatId: payload.chatId, prompt: payload.prompt });
    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request.", fieldErrors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Maxwell prototype error:", error);

    return NextResponse.json(
      { message: "Could not generate the prototype right now. Please try again." },
      { status: 500 }
    );
  }
}

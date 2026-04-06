import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { maxwellSessionCookieName, maxwellSessionSchema } from "@/lib/maxwell";
import { getMaxwellSession, upsertMaxwellSession } from "@/lib/server/noon-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sessionId = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${maxwellSessionCookieName}=`))
    ?.split("=")[1];

  const session = await getMaxwellSession(sessionId ?? null);

  return NextResponse.json(
    {
      session,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const cookieSessionId = request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${maxwellSessionCookieName}=`))
      ?.split("=")[1];
    const body = await request.json();
    const payload = maxwellSessionSchema.parse(body);
    const session = await upsertMaxwellSession({
      ...payload,
      sessionId: cookieSessionId ?? null,
    });

    const response = NextResponse.json(
      {
        session,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set({
      name: maxwellSessionCookieName,
      value: session.id,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Describe the build in a bit more detail before continuing.",
          fieldErrors: error.flatten().fieldErrors,
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.error("Maxwell session capture failed.", error);

    return NextResponse.json(
      {
        message: "Maxwell could not save your prompt right now. Please try again.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

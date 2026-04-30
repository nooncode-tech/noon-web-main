import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const maybeCode = "code" in error ? (error as { code?: unknown }).code : null;
  return typeof maybeCode === "string" ? maybeCode : null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Unknown database error.";
}

export async function GET() {
  const startedAt = Date.now();

  try {
    const sql = getDb();
    await sql`SELECT 1 AS ok`;

    return NextResponse.json(
      {
        service: "database",
        healthy: true,
        latency_ms: Date.now() - startedAt,
        checked_at: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        service: "database",
        healthy: false,
        latency_ms: Date.now() - startedAt,
        checked_at: new Date().toISOString(),
        error_code: getErrorCode(error),
        message: getErrorMessage(error),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

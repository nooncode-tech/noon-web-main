import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceHealth = {
  healthy: boolean;
  latency_ms?: number;
  error_code?: string | null;
  message?: string;
};

function getErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const maybeCode = "code" in error ? (error as { code?: unknown }).code : null;
  return typeof maybeCode === "string" ? maybeCode : null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Unknown error.";
}

async function checkDatabase(): Promise<ServiceHealth> {
  const startedAt = Date.now();
  try {
    const sql = getDb();
    await sql`SELECT 1 AS ok`;
    return { healthy: true, latency_ms: Date.now() - startedAt };
  } catch (error) {
    return {
      healthy: false,
      latency_ms: Date.now() - startedAt,
      error_code: getErrorCode(error),
      message: getErrorMessage(error),
    };
  }
}

function checkRequiredEnv(name: string): ServiceHealth {
  if (process.env[name]?.trim()) {
    return { healthy: true };
  }
  return {
    healthy: false,
    error_code: "MISSING_ENV",
    message: `${name} is not configured.`,
  };
}

export async function GET() {
  const checkedAt = new Date().toISOString();
  const database = await checkDatabase();
  const openai = checkRequiredEnv("OPENAI_API_KEY");
  const v0 = checkRequiredEnv("V0_API_KEY");

  const healthy = database.healthy && openai.healthy && v0.healthy;

  return NextResponse.json(
    {
      service: "api",
      healthy,
      checked_at: checkedAt,
      dependencies: {
        database,
        openai,
        v0,
      },
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

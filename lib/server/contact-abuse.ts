import { createHash, createHmac } from "node:crypto";
import { getDb } from "@/lib/server/db";

export const CONTACT_FORM_MIN_COMPLETION_MS = 2500;
export const CONTACT_RATE_LIMIT_SHORT_WINDOW_MS = 10 * 60 * 1000;
export const CONTACT_RATE_LIMIT_SHORT_WINDOW_MAX = 3;
export const CONTACT_RATE_LIMIT_DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
export const CONTACT_RATE_LIMIT_DAY_WINDOW_MAX = 8;
export const CONTACT_RATE_LIMIT_EMAIL_WINDOW_MAX = 4;
export const CONTACT_DUPLICATE_WINDOW_MS = 12 * 60 * 60 * 1000;
export const CONTACT_RATE_LIMIT_RETRY_AFTER_SECONDS = 10 * 60;

export type ContactSecurityMetadata = {
  ipHash: string | null;
  userAgent: string | null;
  originHost: string | null;
};

export type ContactSubmissionAssessment =
  | {
      outcome: "allow";
      metadata: ContactSecurityMetadata;
    }
  | {
      outcome: "accept_ignored";
      reason: "honeypot" | "too_fast";
    }
  | {
      outcome: "block";
      reason: "ip_short_window" | "ip_day_window" | "email_day_window" | "duplicate";
      message: string;
      retryAfterSeconds: number;
      metadata: ContactSecurityMetadata;
    };

type AssessContactSubmissionInput = {
  email: string;
  brief: string;
  startedAt?: number | null;
  honeypotValue?: string;
  headers: Headers;
  now?: Date;
};

function normalizeOptionalHeader(value: string | null, maxLength: number) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

export function extractRequestIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstForwardedIp = forwardedFor
      .split(",")
      .map((segment) => segment.trim())
      .find(Boolean);

    if (firstForwardedIp) {
      return firstForwardedIp;
    }
  }

  return (
    normalizeOptionalHeader(headers.get("cf-connecting-ip"), 128) ??
    normalizeOptionalHeader(headers.get("x-real-ip"), 128)
  );
}

function buildContactHash(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  const secret = process.env.AUTH_SECRET?.trim();

  if (secret) {
    return createHmac("sha256", secret).update(normalizedValue).digest("hex");
  }

  return createHash("sha256").update(normalizedValue).digest("hex");
}

export function extractContactSecurityMetadata(headers: Headers): ContactSecurityMetadata {
  const requestIp = extractRequestIp(headers);
  const userAgent = normalizeOptionalHeader(headers.get("user-agent"), 512);
  const originHeader = normalizeOptionalHeader(headers.get("origin"), 512);
  const refererHeader = normalizeOptionalHeader(headers.get("referer"), 512);
  const originCandidate = originHeader ?? refererHeader;

  let originHost: string | null = null;
  if (originCandidate) {
    try {
      originHost = new URL(originCandidate).host.slice(0, 255);
    } catch {
      originHost = originCandidate.slice(0, 255);
    }
  }

  return {
    ipHash: requestIp ? buildContactHash(requestIp) : null,
    userAgent,
    originHost,
  };
}

async function countContactLeads(
  whereClause: string,
  values: Array<string | number | Date>
) {
  const sql = getDb();
  const result = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM contact_leads WHERE ${whereClause}`,
    values
  );

  return result[0]?.count ?? 0;
}

export async function assessContactSubmission(
  input: AssessContactSubmissionInput
): Promise<ContactSubmissionAssessment> {
  const now = input.now ?? new Date();
  const metadata = extractContactSecurityMetadata(input.headers);
  const trimmedHoneypot = input.honeypotValue?.trim();

  if (trimmedHoneypot) {
    return {
      outcome: "accept_ignored",
      reason: "honeypot",
    };
  }

  if (
    typeof input.startedAt === "number" &&
    Number.isFinite(input.startedAt) &&
    input.startedAt > 0 &&
    now.getTime() - input.startedAt < CONTACT_FORM_MIN_COMPLETION_MS
  ) {
    return {
      outcome: "accept_ignored",
      reason: "too_fast",
    };
  }

  const shortWindowStart = new Date(now.getTime() - CONTACT_RATE_LIMIT_SHORT_WINDOW_MS);
  const dayWindowStart = new Date(now.getTime() - CONTACT_RATE_LIMIT_DAY_WINDOW_MS);
  const duplicateWindowStart = new Date(now.getTime() - CONTACT_DUPLICATE_WINDOW_MS);
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedBrief = input.brief.trim();

  const [recentIpHits, dailyIpHits, dailyEmailHits, duplicateHits] = await Promise.all([
    metadata.ipHash
      ? countContactLeads("ip_hash = $1 AND created_at >= $2", [metadata.ipHash, shortWindowStart])
      : Promise.resolve(0),
    metadata.ipHash
      ? countContactLeads("ip_hash = $1 AND created_at >= $2", [metadata.ipHash, dayWindowStart])
      : Promise.resolve(0),
    countContactLeads("LOWER(email) = $1 AND created_at >= $2", [normalizedEmail, dayWindowStart]),
    countContactLeads("LOWER(email) = $1 AND brief = $2 AND created_at >= $3", [
      normalizedEmail,
      normalizedBrief,
      duplicateWindowStart,
    ]),
  ]);

  if (recentIpHits >= CONTACT_RATE_LIMIT_SHORT_WINDOW_MAX) {
    return {
      outcome: "block",
      reason: "ip_short_window",
      message: "Too many contact attempts from this network. Please wait a few minutes and try again.",
      retryAfterSeconds: CONTACT_RATE_LIMIT_RETRY_AFTER_SECONDS,
      metadata,
    };
  }

  if (dailyIpHits >= CONTACT_RATE_LIMIT_DAY_WINDOW_MAX) {
    return {
      outcome: "block",
      reason: "ip_day_window",
      message: "This network has reached the contact limit for today. Please try again later.",
      retryAfterSeconds: CONTACT_RATE_LIMIT_RETRY_AFTER_SECONDS,
      metadata,
    };
  }

  if (dailyEmailHits >= CONTACT_RATE_LIMIT_EMAIL_WINDOW_MAX) {
    return {
      outcome: "block",
      reason: "email_day_window",
      message: "This email has already sent several inquiries today. Please wait before sending another one.",
      retryAfterSeconds: CONTACT_RATE_LIMIT_RETRY_AFTER_SECONDS,
      metadata,
    };
  }

  if (duplicateHits > 0) {
    return {
      outcome: "block",
      reason: "duplicate",
      message: "This inquiry was already received recently. Please wait for Noon to review it before sending it again.",
      retryAfterSeconds: CONTACT_RATE_LIMIT_RETRY_AFTER_SECONDS,
      metadata,
    };
  }

  return {
    outcome: "allow",
    metadata,
  };
}

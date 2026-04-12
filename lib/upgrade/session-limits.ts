/**
 * lib/upgrade/session-limits.ts
 * Business rule: max 3 new sessions in a rolling 30-day window per user.
 *
 * Decision:
 *   - "New session" = any session where created_at is within the last 30 days,
 *     regardless of current status (including error, transferred, proposal_sent).
 *   - Archived sessions DO count — they were previously active sessions.
 *   - Re-opening the same URL reuses an existing session → does NOT consume a slot.
 *   - The check is done server-side before creating a new session record.
 */

import { getDb } from "@/lib/server/db";

const MAX_SESSIONS_PER_WINDOW = 3;
const WINDOW_DAYS = 30;

export type SessionLimitResult =
  | { allowed: true; used: number; remaining: number }
  | { allowed: false; used: number; resetAt: string };

/**
 * Check whether a user can create a new /upgrade session.
 * Does NOT count an existing session for the same URL (reuse path).
 */
export async function checkSessionLimit(ownerEmail: string): Promise<SessionLimitResult> {
  const sql = getDb();
  const windowStart = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const rows = await sql<{ count: string; oldest_in_window: string | null }[]>`
    SELECT
      COUNT(*)::text                                  AS count,
      MIN(created_at)::text                           AS oldest_in_window
    FROM website_upgrade_session
    WHERE owner_email   = ${ownerEmail}
      AND created_at   >= ${windowStart.toISOString()}
  `;

  const used = parseInt(rows[0]?.count ?? "0", 10);
  const oldest = rows[0]?.oldest_in_window ?? null;

  if (used < MAX_SESSIONS_PER_WINDOW) {
    return { allowed: true, used, remaining: MAX_SESSIONS_PER_WINDOW - used };
  }

  // Calculate when the oldest session in the window exits the 30-day period
  const resetAt = oldest
    ? new Date(new Date(oldest).getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  return { allowed: false, used, resetAt };
}

export const SESSION_LIMIT = MAX_SESSIONS_PER_WINDOW;
export const SESSION_WINDOW_DAYS = WINDOW_DAYS;

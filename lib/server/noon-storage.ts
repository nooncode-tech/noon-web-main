import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { ContactSubmissionInput, ContactTypeOption, ContactInquiryKey } from "@/lib/contact";
import type { MaxwellSessionInput } from "@/lib/maxwell";

type MaxwellSessionRow = {
  id: string;
  prompt: string;
  source: string | null;
  status: string;
  first_prompt_captured_at: string;
  updated_at: string;
};

export type ContactLeadRecord = {
  id: string;
  inquiry: ContactInquiryKey;
  contactType: ContactTypeOption;
  name: string;
  email: string;
  brief: string;
  budget: string | null;
  timeline: string | null;
  source: string | null;
  status: string;
  createdAt: string;
};

export type MaxwellSessionRecord = {
  id: string;
  prompt: string;
  source: string | null;
  status: string;
  firstPromptCapturedAt: string;
  updatedAt: string;
};

const runtimeDirectory = path.join(process.cwd(), ".data");
const runtimeDatabasePath = path.join(runtimeDirectory, "noon.sqlite");

let database: DatabaseSync | null = null;

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getDatabase() {
  if (database) {
    return database;
  }

  fs.mkdirSync(runtimeDirectory, { recursive: true });
  database = new DatabaseSync(runtimeDatabasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;

    -- -------------------------------------------------------------------------
    -- Legacy tables (preserved)
    -- -------------------------------------------------------------------------

    CREATE TABLE IF NOT EXISTS contact_leads (
      id TEXT PRIMARY KEY,
      inquiry TEXT NOT NULL,
      contact_type TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      brief TEXT NOT NULL,
      budget_range TEXT,
      timeline TEXT,
      source TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at
      ON contact_leads (created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_contact_leads_inquiry
      ON contact_leads (inquiry);

    CREATE TABLE IF NOT EXISTS maxwell_sessions (
      id TEXT PRIMARY KEY,
      prompt TEXT NOT NULL,
      source TEXT,
      status TEXT NOT NULL DEFAULT 'captured',
      first_prompt_captured_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_maxwell_sessions_updated_at
      ON maxwell_sessions (updated_at DESC);

    -- -------------------------------------------------------------------------
    -- Maxwell Studio tables
    -- -------------------------------------------------------------------------

    CREATE TABLE IF NOT EXISTS studio_session (
      id                      TEXT PRIMARY KEY,
      initial_prompt          TEXT NOT NULL,
      status                  TEXT NOT NULL DEFAULT 'intake',
      project_type            TEXT,
      goal_summary            TEXT,
      complexity_hint         TEXT,
      language                TEXT NOT NULL DEFAULT 'en',
      corrections_used        INTEGER NOT NULL DEFAULT 0,
      max_corrections         INTEGER NOT NULL DEFAULT 2,
      proposal_requested_at   TEXT,
      created_at              TEXT NOT NULL,
      updated_at              TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_studio_session_updated_at
      ON studio_session (updated_at DESC);

    CREATE TABLE IF NOT EXISTS studio_message (
      id                TEXT PRIMARY KEY,
      studio_session_id TEXT NOT NULL,
      role              TEXT NOT NULL,
      message_type      TEXT NOT NULL DEFAULT 'chat',
      content           TEXT NOT NULL,
      created_at        TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_studio_message_session
      ON studio_message (studio_session_id, created_at ASC);

    CREATE TABLE IF NOT EXISTS studio_brief (
      id                TEXT PRIMARY KEY,
      studio_session_id TEXT NOT NULL UNIQUE,
      objective         TEXT,
      users             TEXT,
      core_flow         TEXT,
      style_direction   TEXT,
      integrations      TEXT,
      assumptions       TEXT,
      constraints       TEXT,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS studio_version (
      id                TEXT PRIMARY KEY,
      studio_session_id TEXT NOT NULL,
      version_number    INTEGER NOT NULL,
      preview_url       TEXT NOT NULL,
      v0_chat_id        TEXT NOT NULL,
      change_summary    TEXT,
      source            TEXT NOT NULL DEFAULT 'initial',
      created_at        TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_studio_version_session
      ON studio_version (studio_session_id, version_number DESC);

    CREATE TABLE IF NOT EXISTS proposal_request (
      id                TEXT PRIMARY KEY,
      studio_session_id TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'pending_review',
      review_required   INTEGER NOT NULL DEFAULT 1,
      reviewer_id       TEXT,
      draft_content     TEXT,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_proposal_request_session
      ON proposal_request (studio_session_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS proposal_review_event (
      id                  TEXT PRIMARY KEY,
      proposal_request_id TEXT NOT NULL,
      action              TEXT NOT NULL,
      actor               TEXT NOT NULL,
      notes               TEXT,
      created_at          TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_proposal_review_event_request
      ON proposal_review_event (proposal_request_id, created_at ASC);

    CREATE TABLE IF NOT EXISTS client_workspace (
      id                    TEXT PRIMARY KEY,
      studio_session_id     TEXT NOT NULL,
      payment_status        TEXT NOT NULL DEFAULT 'pending',
      workspace_status      TEXT NOT NULL DEFAULT 'inactive',
      latest_update_summary TEXT,
      created_at            TEXT NOT NULL,
      updated_at            TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspace_update (
      id                  TEXT PRIMARY KEY,
      client_workspace_id TEXT NOT NULL,
      title               TEXT NOT NULL,
      content             TEXT,
      update_type         TEXT NOT NULL DEFAULT 'status_update',
      material_url        TEXT,
      is_client_visible   INTEGER NOT NULL DEFAULT 1,
      created_by          TEXT NOT NULL,
      created_at          TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_workspace_update_workspace
      ON workspace_update (client_workspace_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS payment_event (
      id                TEXT PRIMARY KEY,
      studio_session_id TEXT NOT NULL,
      event_type        TEXT NOT NULL,
      amount_usd        REAL,
      reference         TEXT,
      notes             TEXT,
      created_by        TEXT NOT NULL,
      created_at        TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_payment_event_session
      ON payment_event (studio_session_id, created_at ASC);
  `);

  // ── Safe column migrations (idempotent) ──────────────────────────────────────
  // SQLite doesn't support IF NOT EXISTS on ALTER TABLE ADD COLUMN,
  // so we wrap each migration in a try/catch.
  try { database.exec("ALTER TABLE proposal_request ADD COLUMN expires_at TEXT"); } catch {}

  return database;
}

function mapMaxwellSession(row: MaxwellSessionRow): MaxwellSessionRecord {
  return {
    id: row.id,
    prompt: row.prompt,
    source: row.source,
    status: row.status,
    firstPromptCapturedAt: row.first_prompt_captured_at,
    updatedAt: row.updated_at,
  };
}

export function saveContactLead(input: ContactSubmissionInput): ContactLeadRecord {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO contact_leads (
      id,
      inquiry,
      contact_type,
      full_name,
      email,
      brief,
      budget_range,
      timeline,
      source,
      status,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
  `).run(
    id,
    input.inquiry,
    input.contactType,
    input.name.trim(),
    input.email.trim(),
    input.brief.trim(),
    normalizeOptionalText(input.budget),
    normalizeOptionalText(input.timeline),
    normalizeOptionalText(input.source),
    createdAt
  );

  return {
    id,
    inquiry: input.inquiry,
    contactType: input.contactType,
    name: input.name.trim(),
    email: input.email.trim(),
    brief: input.brief.trim(),
    budget: normalizeOptionalText(input.budget),
    timeline: normalizeOptionalText(input.timeline),
    source: normalizeOptionalText(input.source),
    status: "new",
    createdAt,
  };
}

export function getMaxwellSession(sessionId?: string | null) {
  if (!sessionId) {
    return null;
  }

  const db = getDatabase();
  const row = db
    .prepare(`
      SELECT
        id,
        prompt,
        source,
        status,
        first_prompt_captured_at,
        updated_at
      FROM maxwell_sessions
      WHERE id = ?
    `)
    .get(sessionId) as MaxwellSessionRow | undefined;

  return row ? mapMaxwellSession(row) : null;
}

export function upsertMaxwellSession(input: MaxwellSessionInput & { sessionId?: string | null }) {
  const db = getDatabase();
  const existingSession = input.sessionId ? getMaxwellSession(input.sessionId) : null;
  const nextPrompt = input.prompt.trim();
  const nextSource = normalizeOptionalText(input.source);

  if (existingSession) {
    const updatedAt = new Date().toISOString();

    db.prepare(`
      UPDATE maxwell_sessions
      SET
        prompt = ?,
        source = COALESCE(?, source),
        updated_at = ?
      WHERE id = ?
    `).run(nextPrompt, nextSource, updatedAt, existingSession.id);

    return {
      ...existingSession,
      prompt: nextPrompt,
      source: nextSource ?? existingSession.source,
      updatedAt,
    };
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO maxwell_sessions (
      id,
      prompt,
      source,
      status,
      first_prompt_captured_at,
      updated_at
    ) VALUES (?, ?, ?, 'captured', ?, ?)
  `).run(id, nextPrompt, nextSource, createdAt, createdAt);

  return {
    id,
    prompt: nextPrompt,
    source: nextSource,
    status: "captured",
    firstPromptCapturedAt: createdAt,
    updatedAt: createdAt,
  };
}

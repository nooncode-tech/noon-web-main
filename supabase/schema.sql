-- ============================================================================
-- Noon — Schema completo para Supabase (PostgreSQL)
-- Ejecutar una sola vez en: Supabase → SQL Editor → New query → Run
-- ============================================================================

-- contact_leads
CREATE TABLE IF NOT EXISTS contact_leads (
  id               TEXT PRIMARY KEY,
  inquiry          TEXT NOT NULL,
  contact_type     TEXT NOT NULL,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  brief            TEXT NOT NULL,
  budget_range     TEXT,
  timeline         TEXT,
  source           TEXT,
  status           TEXT NOT NULL DEFAULT 'new',
  created_at       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON contact_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_inquiry    ON contact_leads (inquiry);

-- maxwell_sessions
CREATE TABLE IF NOT EXISTS maxwell_sessions (
  id                        TEXT PRIMARY KEY,
  prompt                    TEXT NOT NULL,
  source                    TEXT,
  status                    TEXT NOT NULL DEFAULT 'captured',
  first_prompt_captured_at  TEXT NOT NULL,
  updated_at                TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_maxwell_sessions_updated_at ON maxwell_sessions (updated_at DESC);

-- studio_session
CREATE TABLE IF NOT EXISTS studio_session (
  id                    TEXT PRIMARY KEY,
  initial_prompt        TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'intake',
  project_type          TEXT,
  goal_summary          TEXT,
  complexity_hint       TEXT,
  language              TEXT NOT NULL DEFAULT 'en',
  corrections_used      INTEGER NOT NULL DEFAULT 0,
  max_corrections       INTEGER NOT NULL DEFAULT 2,
  proposal_requested_at TEXT,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_session_updated_at ON studio_session (updated_at DESC);

-- studio_message
CREATE TABLE IF NOT EXISTS studio_message (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL,
  role              TEXT NOT NULL,
  message_type      TEXT NOT NULL DEFAULT 'chat',
  content           TEXT NOT NULL,
  created_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_message_session ON studio_message (studio_session_id, created_at ASC);

-- studio_brief
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

-- studio_version
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

CREATE INDEX IF NOT EXISTS idx_studio_version_session ON studio_version (studio_session_id, version_number DESC);

-- proposal_request
CREATE TABLE IF NOT EXISTS proposal_request (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending_review',
  review_required   INTEGER NOT NULL DEFAULT 1,
  reviewer_id       TEXT,
  draft_content     TEXT,
  expires_at        TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_proposal_request_session ON proposal_request (studio_session_id, created_at DESC);

-- proposal_review_event
CREATE TABLE IF NOT EXISTS proposal_review_event (
  id                  TEXT PRIMARY KEY,
  proposal_request_id TEXT NOT NULL,
  action              TEXT NOT NULL,
  actor               TEXT NOT NULL,
  notes               TEXT,
  created_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_proposal_review_event_request ON proposal_review_event (proposal_request_id, created_at ASC);

-- client_workspace
CREATE TABLE IF NOT EXISTS client_workspace (
  id                    TEXT PRIMARY KEY,
  studio_session_id     TEXT NOT NULL,
  payment_status        TEXT NOT NULL DEFAULT 'pending',
  workspace_status      TEXT NOT NULL DEFAULT 'inactive',
  latest_update_summary TEXT,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

-- workspace_update
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

CREATE INDEX IF NOT EXISTS idx_workspace_update_workspace ON workspace_update (client_workspace_id, created_at DESC);

-- payment_event
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

CREATE INDEX IF NOT EXISTS idx_payment_event_session ON payment_event (studio_session_id, created_at ASC);

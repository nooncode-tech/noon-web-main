-- ============================================================================
-- Migration 008 · website_upgrade module
-- Creates all tables for the /upgrade ("Upgrade Your Website") feature.
-- Naming convention: website_upgrade_*
-- ============================================================================

-- ----------------------------------------------------------------------------
-- website_upgrade_session
-- One row per user+URL combination (same URL = reuse session)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_upgrade_session (
  id                  TEXT PRIMARY KEY,
  owner_email         TEXT NOT NULL,
  owner_name          TEXT,

  -- Input
  website_url         TEXT NOT NULL,     -- canonical/normalized URL (used as dedup key)
  website_url_raw     TEXT NOT NULL,     -- original URL as typed by user
  mode                TEXT NOT NULL DEFAULT 'best_judgment',
  context_note        TEXT,              -- free-text note (mode = specific_note)
  questions_answers   JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{question, answer}]

  -- Lifecycle
  status              TEXT NOT NULL DEFAULT 'pending',

  -- Corrections (shared limit with main flow — counted here, applied on studio transfer)
  corrections_used    INTEGER NOT NULL DEFAULT 0,

  -- Traceability
  source              TEXT NOT NULL DEFAULT 'website_upgrade',

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL,
  updated_at          TIMESTAMPTZ NOT NULL,
  last_activity_at    TIMESTAMPTZ NOT NULL,
  archived_at         TIMESTAMPTZ,

  CONSTRAINT website_upgrade_session_mode_check CHECK (mode IN (
    'answer_questions', 'best_judgment', 'specific_note'
  )),
  CONSTRAINT website_upgrade_session_status_check CHECK (status IN (
    'pending',       -- created, questions being answered (or skipped)
    'crawling',      -- actively crawling the website
    'analyzing',     -- AI analyzing crawled content
    'audit_ready',   -- audit complete, awaiting user action
    'generating',    -- generating the upgraded version
    'version_ready', -- upgraded version ready, awaiting CTA
    'transferred',   -- context transferred to Maxwell Studio
    'proposal_sent', -- proposal requested from this session
    'archived',      -- 30 days inactivity → archived
    'error'          -- unrecoverable error (can retry)
  )),
  CONSTRAINT website_upgrade_session_corrections_non_negative CHECK (corrections_used >= 0)
);

CREATE INDEX IF NOT EXISTS idx_wus_owner_email        ON website_upgrade_session (owner_email, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_wus_created_at         ON website_upgrade_session (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wus_status             ON website_upgrade_session (status, updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wus_owner_url   ON website_upgrade_session (owner_email, website_url)
  WHERE status NOT IN ('archived');

-- ----------------------------------------------------------------------------
-- website_upgrade_page
-- Individual pages crawled during the audit phase
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_upgrade_page (
  id                         TEXT PRIMARY KEY,
  website_upgrade_session_id TEXT NOT NULL REFERENCES website_upgrade_session(id) ON DELETE CASCADE,

  url                        TEXT NOT NULL,
  title                      TEXT,
  content_text               TEXT,       -- extracted visible text (truncated to 100 KB)
  page_type                  TEXT NOT NULL DEFAULT 'other',  -- home|about|services|contact|pricing|landing|other
  crawl_order                INTEGER NOT NULL DEFAULT 0,
  crawl_depth                INTEGER NOT NULL DEFAULT 0,
  created_at                 TIMESTAMPTZ NOT NULL,

  CONSTRAINT website_upgrade_page_type_check CHECK (page_type IN (
    'home', 'about', 'services', 'contact', 'pricing', 'landing', 'other'
  ))
);

CREATE INDEX IF NOT EXISTS idx_wup_session ON website_upgrade_page (website_upgrade_session_id, crawl_order ASC);

-- ----------------------------------------------------------------------------
-- website_upgrade_audit
-- One audit result per session (AI-generated analysis)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_upgrade_audit (
  id                         TEXT PRIMARY KEY,
  website_upgrade_session_id TEXT NOT NULL UNIQUE REFERENCES website_upgrade_session(id) ON DELETE CASCADE,

  audit_json                 JSONB NOT NULL DEFAULT '{}'::jsonb,  -- structured audit report
  summary                    TEXT NOT NULL,                        -- human-readable lead summary
  pages_analyzed             INTEGER NOT NULL DEFAULT 0,

  created_at                 TIMESTAMPTZ NOT NULL,
  updated_at                 TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wua_session ON website_upgrade_audit (website_upgrade_session_id);

-- ----------------------------------------------------------------------------
-- website_upgrade_version
-- Upgraded website version generated by AI (can have corrections)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_upgrade_version (
  id                         TEXT PRIMARY KEY,
  website_upgrade_session_id TEXT NOT NULL REFERENCES website_upgrade_session(id) ON DELETE CASCADE,

  version_number             INTEGER NOT NULL DEFAULT 1,
  version_json               JSONB NOT NULL DEFAULT '{}'::jsonb,  -- structured upgraded version
  summary                    TEXT NOT NULL,                        -- concise description of changes
  is_correction              BOOLEAN NOT NULL DEFAULT FALSE,

  created_at                 TIMESTAMPTZ NOT NULL,

  CONSTRAINT website_upgrade_version_positive CHECK (version_number > 0),
  CONSTRAINT website_upgrade_version_session_version_key UNIQUE (website_upgrade_session_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_wuv_session ON website_upgrade_version (website_upgrade_session_id, version_number DESC);

-- ----------------------------------------------------------------------------
-- website_upgrade_event
-- Immutable action log for history, traceability, and reporting
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_upgrade_event (
  id                         TEXT PRIMARY KEY,
  website_upgrade_session_id TEXT NOT NULL REFERENCES website_upgrade_session(id) ON DELETE CASCADE,

  event_type                 TEXT NOT NULL,
  metadata                   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                 TIMESTAMPTZ NOT NULL,

  CONSTRAINT website_upgrade_event_type_check CHECK (event_type IN (
    'session_created',
    'session_resumed',
    'question_answered',
    'crawl_started',
    'crawl_completed',
    'crawl_failed',
    'audit_started',
    'audit_completed',
    'audit_failed',
    'generate_started',
    'generate_completed',
    'generate_failed',
    'correction_applied',
    'handoff_to_maxwell',
    'proposal_requested',
    'session_archived'
  ))
);

CREATE INDEX IF NOT EXISTS idx_wue_session ON website_upgrade_event (website_upgrade_session_id, created_at ASC);

-- ----------------------------------------------------------------------------
-- RLS: revoke public access, grant only to service_role (same pattern as all other tables)
-- ----------------------------------------------------------------------------
ALTER TABLE website_upgrade_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_upgrade_page    ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_upgrade_audit   ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_upgrade_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_upgrade_event   ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON website_upgrade_session FROM anon, authenticated;
REVOKE ALL ON website_upgrade_page    FROM anon, authenticated;
REVOKE ALL ON website_upgrade_audit   FROM anon, authenticated;
REVOKE ALL ON website_upgrade_version FROM anon, authenticated;
REVOKE ALL ON website_upgrade_event   FROM anon, authenticated;

GRANT ALL ON website_upgrade_session TO service_role;
GRANT ALL ON website_upgrade_page    TO service_role;
GRANT ALL ON website_upgrade_audit   TO service_role;
GRANT ALL ON website_upgrade_version TO service_role;
GRANT ALL ON website_upgrade_event   TO service_role;

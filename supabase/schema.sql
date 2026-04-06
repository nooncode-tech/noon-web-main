-- ============================================================================
-- Noon — Greenfield schema for Supabase (PostgreSQL)
-- Use this file only for empty environments.
-- Existing environments must apply the files in /supabase/migrations first.
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
  created_at       TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON contact_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_inquiry ON contact_leads (inquiry);

-- maxwell_sessions (legacy modal flow)
CREATE TABLE IF NOT EXISTS maxwell_sessions (
  id                        TEXT PRIMARY KEY,
  prompt                    TEXT NOT NULL,
  source                    TEXT,
  status                    TEXT NOT NULL DEFAULT 'captured',
  first_prompt_captured_at  TIMESTAMPTZ NOT NULL,
  updated_at                TIMESTAMPTZ NOT NULL
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
  proposal_requested_at TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL,
  updated_at            TIMESTAMPTZ NOT NULL,

  CONSTRAINT studio_session_status_check CHECK (status IN (
    'intake', 'clarifying', 'generating_prototype', 'prototype_ready',
    'revision_requested', 'revision_applied', 'approved_for_proposal',
    'proposal_pending_review', 'proposal_sent', 'converted'
  )),
  CONSTRAINT studio_session_corrections_check CHECK (corrections_used <= max_corrections),
  CONSTRAINT studio_session_max_corrections_positive_check CHECK (max_corrections > 0)
);

CREATE INDEX IF NOT EXISTS idx_studio_session_updated_at ON studio_session (updated_at DESC);

-- studio_message
CREATE TABLE IF NOT EXISTS studio_message (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id) ON DELETE CASCADE,
  role              TEXT NOT NULL,
  message_type      TEXT NOT NULL DEFAULT 'chat',
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL,

  CONSTRAINT studio_message_role_check CHECK (role IN ('user', 'assistant', 'system')),
  CONSTRAINT studio_message_type_check CHECK (message_type IN (
    'chat', 'thinking', 'correction_request', 'prototype_announcement',
    'approval', 'proposal_request', 'system_event'
  ))
);

CREATE INDEX IF NOT EXISTS idx_studio_message_session ON studio_message (studio_session_id, created_at ASC);

-- studio_brief
CREATE TABLE IF NOT EXISTS studio_brief (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL UNIQUE REFERENCES studio_session(id) ON DELETE CASCADE,
  objective         TEXT,
  users             TEXT,
  core_flow         TEXT,
  style_direction   TEXT,
  integrations      TEXT,
  assumptions       TEXT,
  constraints       TEXT,
  platform          TEXT,
  primary_user      TEXT,
  answers_json      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL,
  updated_at        TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_brief_session ON studio_brief (studio_session_id);

-- studio_version
CREATE TABLE IF NOT EXISTS studio_version (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id) ON DELETE CASCADE,
  version_number    INTEGER NOT NULL,
  preview_url       TEXT NOT NULL,
  v0_chat_id        TEXT NOT NULL,
  change_summary    TEXT,
  source            TEXT NOT NULL DEFAULT 'initial',
  created_at        TIMESTAMPTZ NOT NULL,

  CONSTRAINT studio_version_source_check CHECK (source IN ('initial', 'correction', 'agent_override')),
  CONSTRAINT studio_version_session_version_key UNIQUE (studio_session_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_studio_version_session ON studio_version (studio_session_id, version_number DESC);

-- proposal_request
CREATE TABLE IF NOT EXISTS proposal_request (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'pending_review',
  review_required   BOOLEAN NOT NULL DEFAULT TRUE,
  reviewer_id       TEXT,
  draft_content     TEXT,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL,
  updated_at        TIMESTAMPTZ NOT NULL,

  CONSTRAINT proposal_request_status_check CHECK (status IN (
    'pending_review', 'under_review', 'approved', 'sent',
    'payment_pending', 'payment_under_verification', 'paid',
    'expired', 'returned', 'escalated'
  ))
);

CREATE INDEX IF NOT EXISTS idx_proposal_request_session ON proposal_request (studio_session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposal_request_status ON proposal_request (status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_proposal_request_active_per_session
  ON proposal_request (studio_session_id)
  WHERE status IN (
    'pending_review',
    'under_review',
    'approved',
    'payment_pending',
    'payment_under_verification',
    'escalated'
  );

-- proposal_review_event
CREATE TABLE IF NOT EXISTS proposal_review_event (
  id                  TEXT PRIMARY KEY,
  proposal_request_id TEXT NOT NULL REFERENCES proposal_request(id) ON DELETE CASCADE,
  action              TEXT NOT NULL,
  actor               TEXT NOT NULL,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL,

  CONSTRAINT proposal_review_event_action_check CHECK (action IN (
    'created',
    'approve_and_send',
    'edit',
    'return_to_draft',
    'escalate',
    'reviewed',
    'approved',
    'sent',
    'edited',
    'returned'
  ))
);

CREATE INDEX IF NOT EXISTS idx_proposal_review_event_request ON proposal_review_event (proposal_request_id, created_at ASC);

-- client_workspace
CREATE TABLE IF NOT EXISTS client_workspace (
  id                    TEXT PRIMARY KEY,
  studio_session_id     TEXT NOT NULL UNIQUE REFERENCES studio_session(id) ON DELETE CASCADE,
  payment_status        TEXT NOT NULL DEFAULT 'pending',
  workspace_status      TEXT NOT NULL DEFAULT 'inactive',
  latest_update_summary TEXT,
  created_at            TIMESTAMPTZ NOT NULL,
  updated_at            TIMESTAMPTZ NOT NULL,

  CONSTRAINT client_workspace_payment_status_check CHECK (payment_status IN (
    'pending', 'confirmed', 'failed', 'refunded'
  )),
  CONSTRAINT client_workspace_status_check CHECK (workspace_status IN (
    'inactive', 'active', 'paused', 'closed'
  )),
  CONSTRAINT client_workspace_confirmed_activation_check CHECK (
    NOT (workspace_status = 'active' AND payment_status <> 'confirmed')
  )
);

CREATE INDEX IF NOT EXISTS idx_client_workspace_updated_at ON client_workspace (updated_at DESC);

-- workspace_update
CREATE TABLE IF NOT EXISTS workspace_update (
  id                  TEXT PRIMARY KEY,
  client_workspace_id TEXT NOT NULL REFERENCES client_workspace(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  content             TEXT,
  update_type         TEXT NOT NULL DEFAULT 'status_update',
  material_url        TEXT,
  is_client_visible   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by          TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL,

  CONSTRAINT workspace_update_type_check CHECK (update_type IN (
    'status_update', 'milestone', 'material', 'note'
  ))
);

CREATE INDEX IF NOT EXISTS idx_workspace_update_workspace ON workspace_update (client_workspace_id, created_at DESC);

-- payment_event
CREATE TABLE IF NOT EXISTS payment_event (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL,
  amount_usd        NUMERIC(10,2),
  reference         TEXT,
  notes             TEXT,
  created_by        TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL,

  CONSTRAINT payment_event_type_check CHECK (event_type IN (
    'initiated', 'received', 'confirmed', 'failed', 'refund_initiated', 'refunded'
  ))
);

CREATE INDEX IF NOT EXISTS idx_payment_event_session ON payment_event (studio_session_id, created_at ASC);

-- studio_event
CREATE TABLE IF NOT EXISTS studio_event (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL,
  from_status       TEXT,
  to_status         TEXT,
  actor             TEXT,
  payload_json      JSONB,
  created_at        TIMESTAMPTZ NOT NULL,

  CONSTRAINT studio_event_type_check CHECK (event_type IN (
    'session_created',
    'status_transition',
    'brief_updated',
    'system_recovery',
    'proposal_requested',
    'proposal_reviewed',
    'payment_recorded',
    'workspace_updated'
  ))
);

CREATE INDEX IF NOT EXISTS idx_studio_event_session ON studio_event (studio_session_id, created_at DESC);

-- ============================================================================
-- Harden Maxwell Studio schema in-place.
-- Run 20260406_000_preflight_maxwell_schema.sql first.
-- ============================================================================

BEGIN;

-- ============================================================================
-- New columns required by the structured brief / operational audit trail
-- ============================================================================

ALTER TABLE IF EXISTS studio_brief
  ADD COLUMN IF NOT EXISTS platform TEXT,
  ADD COLUMN IF NOT EXISTS primary_user TEXT,
  ADD COLUMN IF NOT EXISTS answers_json JSONB,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

UPDATE studio_brief
SET answers_json = '{}'::jsonb
WHERE answers_json IS NULL;

-- ============================================================================
-- Type hardening
-- ============================================================================

ALTER TABLE IF EXISTS contact_leads
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;

ALTER TABLE IF EXISTS maxwell_sessions
  ALTER COLUMN first_prompt_captured_at TYPE TIMESTAMPTZ USING first_prompt_captured_at::timestamptz,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at::timestamptz;

ALTER TABLE IF EXISTS studio_session
  ALTER COLUMN proposal_requested_at TYPE TIMESTAMPTZ USING proposal_requested_at::timestamptz,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at::timestamptz;

ALTER TABLE IF EXISTS studio_message
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;

ALTER TABLE IF EXISTS studio_brief
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at::timestamptz;

UPDATE studio_brief
SET created_at = COALESCE(created_at, updated_at)
WHERE created_at IS NULL;

ALTER TABLE IF EXISTS studio_brief
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN answers_json SET DEFAULT '{}'::jsonb,
  ALTER COLUMN answers_json SET NOT NULL;

ALTER TABLE IF EXISTS studio_version
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;

ALTER TABLE IF EXISTS proposal_request
  ALTER COLUMN review_required TYPE BOOLEAN USING (
    CASE
      WHEN review_required IS NULL THEN TRUE
      WHEN review_required::text IN ('1', 'true', 't') THEN TRUE
      ELSE FALSE
    END
  ),
  ALTER COLUMN expires_at TYPE TIMESTAMPTZ USING expires_at::timestamptz,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at::timestamptz;

ALTER TABLE IF EXISTS proposal_request
  ALTER COLUMN review_required SET DEFAULT TRUE,
  ALTER COLUMN review_required SET NOT NULL;

ALTER TABLE IF EXISTS proposal_review_event
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;

ALTER TABLE IF EXISTS client_workspace
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at::timestamptz;

ALTER TABLE IF EXISTS workspace_update
  ALTER COLUMN is_client_visible TYPE BOOLEAN USING (
    CASE
      WHEN is_client_visible IS NULL THEN TRUE
      WHEN is_client_visible::text IN ('1', 'true', 't') THEN TRUE
      ELSE FALSE
    END
  ),
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;

ALTER TABLE IF EXISTS workspace_update
  ALTER COLUMN is_client_visible SET DEFAULT TRUE,
  ALTER COLUMN is_client_visible SET NOT NULL;

ALTER TABLE IF EXISTS payment_event
  ALTER COLUMN amount_usd TYPE NUMERIC(10,2) USING NULLIF(amount_usd::text, '')::NUMERIC(10,2),
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::timestamptz;

-- ============================================================================
-- Referential integrity
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_message_session_fk'
  ) THEN
    ALTER TABLE studio_message
      ADD CONSTRAINT studio_message_session_fk
      FOREIGN KEY (studio_session_id) REFERENCES studio_session(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_brief_session_fk'
  ) THEN
    ALTER TABLE studio_brief
      ADD CONSTRAINT studio_brief_session_fk
      FOREIGN KEY (studio_session_id) REFERENCES studio_session(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_version_session_fk'
  ) THEN
    ALTER TABLE studio_version
      ADD CONSTRAINT studio_version_session_fk
      FOREIGN KEY (studio_session_id) REFERENCES studio_session(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_request_session_fk'
  ) THEN
    ALTER TABLE proposal_request
      ADD CONSTRAINT proposal_request_session_fk
      FOREIGN KEY (studio_session_id) REFERENCES studio_session(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_review_event_request_fk'
  ) THEN
    ALTER TABLE proposal_review_event
      ADD CONSTRAINT proposal_review_event_request_fk
      FOREIGN KEY (proposal_request_id) REFERENCES proposal_request(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_workspace_session_fk'
  ) THEN
    ALTER TABLE client_workspace
      ADD CONSTRAINT client_workspace_session_fk
      FOREIGN KEY (studio_session_id) REFERENCES studio_session(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workspace_update_workspace_fk'
  ) THEN
    ALTER TABLE workspace_update
      ADD CONSTRAINT workspace_update_workspace_fk
      FOREIGN KEY (client_workspace_id) REFERENCES client_workspace(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_event_session_fk'
  ) THEN
    ALTER TABLE payment_event
      ADD CONSTRAINT payment_event_session_fk
      FOREIGN KEY (studio_session_id) REFERENCES studio_session(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- Enum and business-rule constraints
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_session_status_check'
  ) THEN
    ALTER TABLE studio_session
      ADD CONSTRAINT studio_session_status_check CHECK (status IN (
        'intake', 'clarifying', 'generating_prototype', 'prototype_ready',
        'revision_requested', 'revision_applied', 'approved_for_proposal',
        'proposal_pending_review', 'proposal_sent', 'converted'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_session_corrections_check'
  ) THEN
    ALTER TABLE studio_session
      ADD CONSTRAINT studio_session_corrections_check CHECK (corrections_used <= max_corrections);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_session_max_corrections_positive_check'
  ) THEN
    ALTER TABLE studio_session
      ADD CONSTRAINT studio_session_max_corrections_positive_check CHECK (max_corrections > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_message_role_check'
  ) THEN
    ALTER TABLE studio_message
      ADD CONSTRAINT studio_message_role_check CHECK (role IN ('user', 'assistant', 'system'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_message_type_check'
  ) THEN
    ALTER TABLE studio_message
      ADD CONSTRAINT studio_message_type_check CHECK (message_type IN (
        'chat', 'thinking', 'correction_request', 'prototype_announcement',
        'approval', 'proposal_request', 'system_event'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_version_source_check'
  ) THEN
    ALTER TABLE studio_version
      ADD CONSTRAINT studio_version_source_check CHECK (source IN ('initial', 'correction', 'agent_override'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_request_status_check'
  ) THEN
    ALTER TABLE proposal_request
      ADD CONSTRAINT proposal_request_status_check CHECK (status IN (
        'pending_review', 'under_review', 'approved', 'sent',
        'payment_pending', 'payment_under_verification', 'paid',
        'expired', 'returned', 'escalated'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_review_event_action_check'
  ) THEN
    ALTER TABLE proposal_review_event
      ADD CONSTRAINT proposal_review_event_action_check CHECK (action IN (
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
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_workspace_payment_status_check'
  ) THEN
    ALTER TABLE client_workspace
      ADD CONSTRAINT client_workspace_payment_status_check CHECK (payment_status IN (
        'pending', 'confirmed', 'failed', 'refunded'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_workspace_status_check'
  ) THEN
    ALTER TABLE client_workspace
      ADD CONSTRAINT client_workspace_status_check CHECK (workspace_status IN (
        'inactive', 'active', 'paused', 'closed'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_workspace_confirmed_activation_check'
  ) THEN
    ALTER TABLE client_workspace
      ADD CONSTRAINT client_workspace_confirmed_activation_check CHECK (
        NOT (workspace_status = 'active' AND payment_status <> 'confirmed')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workspace_update_type_check'
  ) THEN
    ALTER TABLE workspace_update
      ADD CONSTRAINT workspace_update_type_check CHECK (update_type IN (
        'status_update', 'milestone', 'material', 'note'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_event_type_check'
  ) THEN
    ALTER TABLE payment_event
      ADD CONSTRAINT payment_event_type_check CHECK (event_type IN (
        'initiated', 'received', 'confirmed', 'failed', 'refund_initiated', 'refunded'
      ));
  END IF;
END $$;

-- ============================================================================
-- Uniqueness hardening
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_version_session_version_key'
  ) THEN
    ALTER TABLE studio_version
      ADD CONSTRAINT studio_version_session_version_key
      UNIQUE (studio_session_id, version_number);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_brief_session_key'
  ) THEN
    ALTER TABLE studio_brief
      ADD CONSTRAINT studio_brief_session_key
      UNIQUE (studio_session_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_workspace_session_key'
  ) THEN
    ALTER TABLE client_workspace
      ADD CONSTRAINT client_workspace_session_key
      UNIQUE (studio_session_id);
  END IF;
END $$;

-- ============================================================================
-- New operational timeline table
-- ============================================================================

CREATE TABLE IF NOT EXISTS studio_event (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL,
  from_status       TEXT,
  to_status         TEXT,
  actor             TEXT,
  payload_json      JSONB,
  created_at        TIMESTAMPTZ NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'studio_event_type_check'
  ) THEN
    ALTER TABLE studio_event
      ADD CONSTRAINT studio_event_type_check CHECK (event_type IN (
        'session_created',
        'status_transition',
        'brief_updated',
        'system_recovery',
        'proposal_requested',
        'proposal_reviewed',
        'payment_recorded',
        'workspace_updated'
      ));
  END IF;
END $$;

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON contact_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_inquiry ON contact_leads (inquiry);
CREATE INDEX IF NOT EXISTS idx_maxwell_sessions_updated_at ON maxwell_sessions (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_session_updated_at ON studio_session (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_message_session ON studio_message (studio_session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_studio_brief_session ON studio_brief (studio_session_id);
CREATE INDEX IF NOT EXISTS idx_studio_version_session ON studio_version (studio_session_id, version_number DESC);
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
CREATE INDEX IF NOT EXISTS idx_proposal_review_event_request ON proposal_review_event (proposal_request_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_client_workspace_updated_at ON client_workspace (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspace_update_workspace ON workspace_update (client_workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_event_session ON payment_event (studio_session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_studio_event_session ON studio_event (studio_session_id, created_at DESC);

COMMIT;

-- ============================================================================
-- Persist Maxwell Studio message feedback and regenerated-message events.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS studio_message_feedback (
  id                TEXT PRIMARY KEY,
  studio_message_id TEXT NOT NULL REFERENCES studio_message(id) ON DELETE CASCADE,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id) ON DELETE CASCADE,
  viewer_email      TEXT NOT NULL,
  feedback          TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL,
  updated_at        TIMESTAMPTZ NOT NULL,

  CONSTRAINT studio_message_feedback_value_check CHECK (feedback IN ('up', 'down')),
  CONSTRAINT studio_message_feedback_message_viewer_key UNIQUE (studio_message_id, viewer_email)
);

CREATE INDEX IF NOT EXISTS idx_studio_message_feedback_session
  ON studio_message_feedback (studio_session_id, updated_at DESC);

ALTER TABLE IF EXISTS studio_message_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE studio_message_feedback FROM anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE studio_message_feedback TO service_role;

ALTER TABLE IF EXISTS studio_event
  DROP CONSTRAINT IF EXISTS studio_event_type_check;

ALTER TABLE IF EXISTS studio_event
  ADD CONSTRAINT studio_event_type_check CHECK (event_type IN (
    'session_created',
    'status_transition',
    'brief_updated',
    'system_recovery',
    'message_regenerated',
    'proposal_requested',
    'proposal_reviewed',
    'payment_recorded',
    'workspace_updated'
  ));

COMMIT;

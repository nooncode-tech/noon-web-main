-- ============================================================================
-- Harden proposal runtime for delivery, first-open validity and review SLA.
-- ============================================================================

BEGIN;

ALTER TABLE IF EXISTS proposal_request
  ADD COLUMN IF NOT EXISTS version_number INTEGER,
  ADD COLUMN IF NOT EXISTS public_token TEXT,
  ADD COLUMN IF NOT EXISTS case_classification TEXT,
  ADD COLUMN IF NOT EXISTS delivery_channel TEXT,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT,
  ADD COLUMN IF NOT EXISTS delivery_recipient TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_reminded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_escalated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_send_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS supersedes_proposal_request_id TEXT REFERENCES proposal_request(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS superseded_by_proposal_request_id TEXT REFERENCES proposal_request(id) ON DELETE SET NULL;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY studio_session_id
      ORDER BY created_at ASC, id ASC
    ) AS next_version_number
  FROM proposal_request
)
UPDATE proposal_request pr
SET version_number = ranked.next_version_number
FROM ranked
WHERE pr.id = ranked.id
  AND (pr.version_number IS NULL OR pr.version_number <= 0);

UPDATE proposal_request
SET public_token = COALESCE(public_token, id)
WHERE public_token IS NULL;

UPDATE proposal_request
SET case_classification = COALESCE(case_classification, 'normal'),
    delivery_channel = COALESCE(delivery_channel, 'email'),
    delivery_status = COALESCE(
      delivery_status,
      CASE
        WHEN first_opened_at IS NOT NULL THEN 'opened'
        WHEN status IN ('sent', 'payment_pending', 'payment_under_verification', 'paid', 'expired')
          THEN 'sent'
        ELSE 'pending_review'
      END
    ),
    review_notified_at = COALESCE(review_notified_at, created_at),
    auto_send_due_at = COALESCE(
      auto_send_due_at,
      COALESCE(review_notified_at, created_at) + INTERVAL '15 minutes'
    ),
    sent_at = COALESCE(
      sent_at,
      CASE
        WHEN status IN ('sent', 'payment_pending', 'payment_under_verification', 'paid', 'expired')
          THEN updated_at
        ELSE NULL
      END
    )
WHERE
  case_classification IS NULL
  OR delivery_channel IS NULL
  OR delivery_status IS NULL
  OR review_notified_at IS NULL
  OR auto_send_due_at IS NULL
  OR public_token IS NULL
  OR version_number IS NULL
  OR (sent_at IS NULL AND status IN ('sent', 'payment_pending', 'payment_under_verification', 'paid', 'expired'));

ALTER TABLE IF EXISTS proposal_request
  ALTER COLUMN version_number SET DEFAULT 1,
  ALTER COLUMN version_number SET NOT NULL,
  ALTER COLUMN public_token SET NOT NULL,
  ALTER COLUMN case_classification SET DEFAULT 'normal',
  ALTER COLUMN case_classification SET NOT NULL,
  ALTER COLUMN delivery_channel SET DEFAULT 'email',
  ALTER COLUMN delivery_channel SET NOT NULL,
  ALTER COLUMN delivery_status SET DEFAULT 'pending_review',
  ALTER COLUMN delivery_status SET NOT NULL,
  ALTER COLUMN review_notified_at SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_request_version_positive_check'
  ) THEN
    ALTER TABLE proposal_request DROP CONSTRAINT proposal_request_version_positive_check;
  END IF;

  ALTER TABLE proposal_request
    ADD CONSTRAINT proposal_request_version_positive_check
    CHECK (version_number > 0);
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_request_case_classification_check'
  ) THEN
    ALTER TABLE proposal_request DROP CONSTRAINT proposal_request_case_classification_check;
  END IF;

  ALTER TABLE proposal_request
    ADD CONSTRAINT proposal_request_case_classification_check
    CHECK (case_classification IN ('normal', 'special'));
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_request_delivery_channel_check'
  ) THEN
    ALTER TABLE proposal_request DROP CONSTRAINT proposal_request_delivery_channel_check;
  END IF;

  ALTER TABLE proposal_request
    ADD CONSTRAINT proposal_request_delivery_channel_check
    CHECK (delivery_channel IN ('email'));
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_request_delivery_status_check'
  ) THEN
    ALTER TABLE proposal_request DROP CONSTRAINT proposal_request_delivery_status_check;
  END IF;

  ALTER TABLE proposal_request
    ADD CONSTRAINT proposal_request_delivery_status_check
    CHECK (delivery_status IN ('pending_review', 'sent', 'opened'));
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_review_event_action_check'
  ) THEN
    ALTER TABLE proposal_review_event DROP CONSTRAINT proposal_review_event_action_check;
  END IF;

  ALTER TABLE proposal_review_event
    ADD CONSTRAINT proposal_review_event_action_check CHECK (action IN (
      'created',
      'approve_and_send',
      'edit',
      'create_new_version',
      'return_to_draft',
      'escalate',
      'reviewed',
      'approved',
      'sent',
      'edited',
      'returned',
      'sla_reminder',
      'sla_escalated',
      'sla_auto_sent',
      'sla_blocked_special',
      'opened',
      'new_version_created'
    ));
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_proposal_request_public_token
  ON proposal_request (public_token);

CREATE UNIQUE INDEX IF NOT EXISTS idx_proposal_request_session_version
  ON proposal_request (studio_session_id, version_number);

COMMIT;

BEGIN;

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
      'sla_blocked_delivery',
      'delivery_failed',
      'opened',
      'new_version_created'
    ));
END $$;

COMMIT;

-- Record website <-> Noon App bridge events in the existing proposal review
-- event audit trail.

ALTER TABLE proposal_review_event
  DROP CONSTRAINT IF EXISTS proposal_review_event_action_check;

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
    'returned',
    'review_flags_detected',
    'delivery_failed',
    'new_version_created',
    'noon_app_inbound_sent',
    'noon_app_inbound_failed',
    'noon_app_approved',
    'noon_app_changes_requested',
    'noon_app_rejected',
    'noon_app_cancelled',
    'noon_app_payment_sent',
    'noon_app_payment_failed'
  ));

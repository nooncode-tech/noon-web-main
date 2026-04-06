-- ============================================================================
-- Preflight checks for Maxwell schema hardening.
-- Run this file first. If any query returns rows, fix that data before applying
-- 20260406_001_harden_maxwell_schema.sql.
-- ============================================================================

-- Duplicate client workspaces per studio session
SELECT
  'duplicate_client_workspace_per_session' AS check_name,
  studio_session_id,
  COUNT(*) AS row_count
FROM client_workspace
GROUP BY studio_session_id
HAVING COUNT(*) > 1;

-- Duplicate studio versions inside the same session
SELECT
  'duplicate_studio_version_number' AS check_name,
  studio_session_id,
  version_number,
  COUNT(*) AS row_count
FROM studio_version
GROUP BY studio_session_id, version_number
HAVING COUNT(*) > 1;

-- More than one active proposal per session
SELECT
  'duplicate_active_proposal_request' AS check_name,
  studio_session_id,
  COUNT(*) AS row_count
FROM proposal_request
WHERE status IN (
  'pending_review',
  'under_review',
  'approved',
  'payment_pending',
  'payment_under_verification',
  'escalated'
)
GROUP BY studio_session_id
HAVING COUNT(*) > 1;

-- Corrections over the allowed limit
SELECT
  'invalid_corrections_counter' AS check_name,
  id,
  corrections_used,
  max_corrections
FROM studio_session
WHERE corrections_used > max_corrections;

-- Active workspace without confirmed payment
SELECT
  'invalid_workspace_activation' AS check_name,
  id,
  studio_session_id,
  payment_status,
  workspace_status
FROM client_workspace
WHERE workspace_status = 'active'
  AND payment_status <> 'confirmed';

-- Orphan studio messages
SELECT
  'orphan_studio_message' AS check_name,
  sm.id,
  sm.studio_session_id
FROM studio_message sm
LEFT JOIN studio_session ss ON ss.id = sm.studio_session_id
WHERE ss.id IS NULL;

-- Orphan studio brief rows
SELECT
  'orphan_studio_brief' AS check_name,
  sb.id,
  sb.studio_session_id
FROM studio_brief sb
LEFT JOIN studio_session ss ON ss.id = sb.studio_session_id
WHERE ss.id IS NULL;

-- Orphan studio version rows
SELECT
  'orphan_studio_version' AS check_name,
  sv.id,
  sv.studio_session_id
FROM studio_version sv
LEFT JOIN studio_session ss ON ss.id = sv.studio_session_id
WHERE ss.id IS NULL;

-- Orphan proposal requests
SELECT
  'orphan_proposal_request' AS check_name,
  pr.id,
  pr.studio_session_id
FROM proposal_request pr
LEFT JOIN studio_session ss ON ss.id = pr.studio_session_id
WHERE ss.id IS NULL;

-- Orphan review events
SELECT
  'orphan_proposal_review_event' AS check_name,
  pre.id,
  pre.proposal_request_id
FROM proposal_review_event pre
LEFT JOIN proposal_request pr ON pr.id = pre.proposal_request_id
WHERE pr.id IS NULL;

-- Orphan workspaces
SELECT
  'orphan_client_workspace' AS check_name,
  cw.id,
  cw.studio_session_id
FROM client_workspace cw
LEFT JOIN studio_session ss ON ss.id = cw.studio_session_id
WHERE ss.id IS NULL;

-- Orphan workspace updates
SELECT
  'orphan_workspace_update' AS check_name,
  wu.id,
  wu.client_workspace_id
FROM workspace_update wu
LEFT JOIN client_workspace cw ON cw.id = wu.client_workspace_id
WHERE cw.id IS NULL;

-- Orphan payment events
SELECT
  'orphan_payment_event' AS check_name,
  pe.id,
  pe.studio_session_id
FROM payment_event pe
LEFT JOIN studio_session ss ON ss.id = pe.studio_session_id
WHERE ss.id IS NULL;

-- Invalid session statuses
SELECT
  'invalid_studio_session_status' AS check_name,
  id,
  status
FROM studio_session
WHERE status NOT IN (
  'intake', 'clarifying', 'generating_prototype', 'prototype_ready',
  'revision_requested', 'revision_applied', 'approved_for_proposal',
  'proposal_pending_review', 'proposal_sent', 'converted'
);

-- Invalid proposal statuses
SELECT
  'invalid_proposal_request_status' AS check_name,
  id,
  status
FROM proposal_request
WHERE status NOT IN (
  'pending_review', 'under_review', 'approved', 'sent',
  'payment_pending', 'payment_under_verification', 'paid',
  'expired', 'returned', 'escalated'
);

-- Invalid workspace statuses
SELECT
  'invalid_client_workspace_status' AS check_name,
  id,
  workspace_status
FROM client_workspace
WHERE workspace_status NOT IN ('inactive', 'active', 'paused', 'closed');

-- Invalid payment statuses
SELECT
  'invalid_client_workspace_payment_status' AS check_name,
  id,
  payment_status
FROM client_workspace
WHERE payment_status NOT IN ('pending', 'confirmed', 'failed', 'refunded');

-- Invalid message roles
SELECT
  'invalid_studio_message_role' AS check_name,
  id,
  role
FROM studio_message
WHERE role NOT IN ('user', 'assistant', 'system');

-- Invalid message types
SELECT
  'invalid_studio_message_type' AS check_name,
  id,
  message_type
FROM studio_message
WHERE message_type NOT IN (
  'chat', 'thinking', 'correction_request', 'prototype_announcement',
  'approval', 'proposal_request', 'system_event'
);

-- Invalid version sources
SELECT
  'invalid_studio_version_source' AS check_name,
  id,
  source
FROM studio_version
WHERE source NOT IN ('initial', 'correction', 'agent_override');

-- Invalid workspace update types
SELECT
  'invalid_workspace_update_type' AS check_name,
  id,
  update_type
FROM workspace_update
WHERE update_type NOT IN ('status_update', 'milestone', 'material', 'note');

-- Invalid payment event types
SELECT
  'invalid_payment_event_type' AS check_name,
  id,
  event_type
FROM payment_event
WHERE event_type NOT IN ('initiated', 'received', 'confirmed', 'failed', 'refund_initiated', 'refunded');

-- Invalid proposal review actions
SELECT
  'invalid_proposal_review_event_action' AS check_name,
  id,
  action
FROM proposal_review_event
WHERE action NOT IN (
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
);

-- Timestamp strings that do not look ISO-like
SELECT
  'non_iso_studio_session_created_at' AS check_name,
  id,
  created_at
FROM studio_session
WHERE created_at::text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T| )';

SELECT
  'non_iso_studio_session_updated_at' AS check_name,
  id,
  updated_at
FROM studio_session
WHERE updated_at::text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T| )';

SELECT
  'non_iso_studio_message_created_at' AS check_name,
  id,
  created_at
FROM studio_message
WHERE created_at::text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T| )';

SELECT
  'non_iso_proposal_request_created_at' AS check_name,
  id,
  created_at
FROM proposal_request
WHERE created_at::text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T| )';

SELECT
  'non_iso_proposal_request_updated_at' AS check_name,
  id,
  updated_at
FROM proposal_request
WHERE updated_at::text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T| )';

SELECT
  'non_iso_client_workspace_created_at' AS check_name,
  id,
  created_at
FROM client_workspace
WHERE created_at::text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T| )';

SELECT
  'non_iso_client_workspace_updated_at' AS check_name,
  id,
  updated_at
FROM client_workspace
WHERE updated_at::text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T| )';

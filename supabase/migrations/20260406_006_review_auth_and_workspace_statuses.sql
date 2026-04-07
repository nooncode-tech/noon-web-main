BEGIN;

UPDATE client_workspace
SET workspace_status = CASE workspace_status
  WHEN 'inactive' THEN 'in_preparation'
  WHEN 'paused' THEN 'active'
  WHEN 'closed' THEN 'delivered'
  ELSE workspace_status
END
WHERE workspace_status IN ('inactive', 'paused', 'closed');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_workspace_status_check'
  ) THEN
    ALTER TABLE client_workspace DROP CONSTRAINT client_workspace_status_check;
  END IF;
END $$;

ALTER TABLE client_workspace
  ALTER COLUMN workspace_status SET DEFAULT 'active';

ALTER TABLE client_workspace
  ADD CONSTRAINT client_workspace_status_check CHECK (
    workspace_status IN (
      'active',
      'in_preparation',
      'in_development',
      'in_review',
      'delivered'
    )
  );

COMMIT;

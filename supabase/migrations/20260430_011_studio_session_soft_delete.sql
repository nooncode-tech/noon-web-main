-- Soft-delete for Maxwell Studio sessions (user can remove chats from their list).
-- Quota logic still counts versions from deleted rows (abuse prevention).

ALTER TABLE studio_session
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_studio_session_owner_active
  ON studio_session (owner_email, updated_at DESC)
  WHERE deleted_at IS NULL;

ALTER TABLE IF EXISTS studio_session
  ADD COLUMN IF NOT EXISTS owner_email TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_image TEXT;

CREATE INDEX IF NOT EXISTS idx_studio_session_owner_email
  ON studio_session (owner_email, updated_at DESC);

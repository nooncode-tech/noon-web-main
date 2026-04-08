ALTER TABLE IF EXISTS contact_leads
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS origin_host TEXT;

CREATE INDEX IF NOT EXISTS idx_contact_leads_ip_hash_created_at
  ON contact_leads (ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_leads_email_created_at
  ON contact_leads (email, created_at DESC);

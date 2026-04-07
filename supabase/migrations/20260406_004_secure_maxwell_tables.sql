-- ============================================================================
-- Lock Maxwell-owned tables behind backend-only access.
-- Explicitly excludes prototypes, conversations, and messages.
-- ============================================================================

BEGIN;

-- Row Level Security ensures anon/authenticated cannot read or mutate Maxwell
-- data through Supabase APIs. The app uses direct server-side DATABASE_URL access.
ALTER TABLE IF EXISTS contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS maxwell_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS studio_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS studio_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS studio_brief ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS studio_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proposal_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proposal_review_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspace_update ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS studio_event ENABLE ROW LEVEL SECURITY;

-- Remove broad API access from anon/authenticated. Direct backend access uses
-- the database connection instead of Supabase client-side roles.
REVOKE ALL ON TABLE contact_leads FROM anon, authenticated;
REVOKE ALL ON TABLE maxwell_sessions FROM anon, authenticated;
REVOKE ALL ON TABLE studio_session FROM anon, authenticated;
REVOKE ALL ON TABLE studio_message FROM anon, authenticated;
REVOKE ALL ON TABLE studio_brief FROM anon, authenticated;
REVOKE ALL ON TABLE studio_version FROM anon, authenticated;
REVOKE ALL ON TABLE proposal_request FROM anon, authenticated;
REVOKE ALL ON TABLE proposal_review_event FROM anon, authenticated;
REVOKE ALL ON TABLE client_workspace FROM anon, authenticated;
REVOKE ALL ON TABLE workspace_update FROM anon, authenticated;
REVOKE ALL ON TABLE payment_event FROM anon, authenticated;
REVOKE ALL ON TABLE studio_event FROM anon, authenticated;

-- Keep service_role access explicit for controlled server-side operations that
-- may still flow through Supabase infrastructure.
GRANT ALL PRIVILEGES ON TABLE contact_leads TO service_role;
GRANT ALL PRIVILEGES ON TABLE maxwell_sessions TO service_role;
GRANT ALL PRIVILEGES ON TABLE studio_session TO service_role;
GRANT ALL PRIVILEGES ON TABLE studio_message TO service_role;
GRANT ALL PRIVILEGES ON TABLE studio_brief TO service_role;
GRANT ALL PRIVILEGES ON TABLE studio_version TO service_role;
GRANT ALL PRIVILEGES ON TABLE proposal_request TO service_role;
GRANT ALL PRIVILEGES ON TABLE proposal_review_event TO service_role;
GRANT ALL PRIVILEGES ON TABLE client_workspace TO service_role;
GRANT ALL PRIVILEGES ON TABLE workspace_update TO service_role;
GRANT ALL PRIVILEGES ON TABLE payment_event TO service_role;
GRANT ALL PRIVILEGES ON TABLE studio_event TO service_role;

COMMIT;

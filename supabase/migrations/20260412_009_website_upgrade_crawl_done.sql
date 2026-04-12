-- ============================================================================
-- Migration 009 · add crawl_done status to website_upgrade_session
-- Needed for the "answer_questions" mode: crawl completes first, then the
-- user answers up to 5 questions before the AI analysis begins.
-- ============================================================================

ALTER TABLE website_upgrade_session
  DROP CONSTRAINT website_upgrade_session_status_check;

ALTER TABLE website_upgrade_session
  ADD CONSTRAINT website_upgrade_session_status_check CHECK (status IN (
    'pending',       -- created, questions being answered (or skipped)
    'crawling',      -- actively crawling the website
    'crawl_done',    -- crawl complete; waiting for questions to be answered (answer_questions mode)
    'analyzing',     -- AI analyzing crawled content
    'audit_ready',   -- audit complete, awaiting user action
    'generating',    -- generating the upgraded version
    'version_ready', -- upgraded version ready, awaiting CTA
    'transferred',   -- context transferred to Maxwell Studio
    'proposal_sent', -- proposal requested from this session
    'archived',      -- 30 days inactivity → archived
    'error'          -- unrecoverable error (can retry)
  ));

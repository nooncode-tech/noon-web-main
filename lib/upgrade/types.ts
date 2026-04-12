/**
 * lib/upgrade/types.ts
 * TypeScript types for the /upgrade ("Upgrade Your Website") module.
 */

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export type UpgradeMode = "answer_questions" | "best_judgment" | "specific_note";

export type UpgradeSessionStatus =
  | "pending"       // created, may be answering questions
  | "crawling"      // crawling the target website
  | "crawl_done"    // crawl complete; waiting for Q&A (answer_questions mode)
  | "analyzing"     // AI analyzing crawled content
  | "audit_ready"   // audit done, awaiting user action
  | "generating"    // generating the upgraded version
  | "version_ready" // upgraded version ready, awaiting CTA
  | "transferred"   // context handed off to Maxwell Studio
  | "proposal_sent" // proposal requested from this session
  | "archived"      // 30-day inactivity → archived
  | "error";        // unrecoverable error (can retry)

export type QuestionAnswer = {
  question: string;
  answer: string;
};

export type UpgradeSession = {
  id: string;
  ownerEmail: string;
  ownerName: string | null;
  websiteUrl: string;       // normalized/canonical
  websiteUrlRaw: string;    // original as typed
  mode: UpgradeMode;
  contextNote: string | null;
  questionsAnswers: QuestionAnswer[];
  status: UpgradeSessionStatus;
  correctionsUsed: number;
  source: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  archivedAt: string | null;
};

// ---------------------------------------------------------------------------
// Crawled pages
// ---------------------------------------------------------------------------

export type PageType = "home" | "about" | "services" | "contact" | "pricing" | "landing" | "other";

export type UpgradePage = {
  id: string;
  websiteUpgradeSessionId: string;
  url: string;
  title: string | null;
  contentText: string | null;
  pageType: PageType;
  crawlOrder: number;
  crawlDepth: number;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export type AuditSection = {
  title: string;
  score: number;      // 1-10
  findings: string[]; // bullet findings
  priority: "high" | "medium" | "low";
};

export type AuditJson = {
  overallScore: number;       // 1-10
  strengths: string[];
  criticalIssues: string[];
  sections: AuditSection[];   // messaging, design, UX, CRO, trust, content clarity
  topRecommendations: string[]; // top 5 actionable recommendations
};

export type UpgradeAudit = {
  id: string;
  websiteUpgradeSessionId: string;
  auditJson: AuditJson;
  summary: string;
  pagesAnalyzed: number;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Upgraded version
// ---------------------------------------------------------------------------

export type PageSection = {
  name: string;           // e.g. "Hero", "About", "Services CTA"
  current: string;        // current copy/description
  upgraded: string;       // upgraded copy/description
  changeRationale: string;
};

export type VersionJson = {
  headline: string;          // upgraded main headline
  subheadline: string;
  valueProposition: string;  // clear value prop
  ctaText: string;           // primary CTA copy
  pageSections: PageSection[];
  keyChanges: string[];      // concise list of what changed and why
  toneGuidance: string;      // tone/voice direction
};

export type UpgradeVersion = {
  id: string;
  websiteUpgradeSessionId: string;
  versionNumber: number;
  versionJson: VersionJson;
  summary: string;
  isCorrection: boolean;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type UpgradeEventType =
  | "session_created"
  | "session_resumed"
  | "question_answered"
  | "crawl_started"
  | "crawl_completed"
  | "crawl_failed"
  | "audit_started"
  | "audit_completed"
  | "audit_failed"
  | "generate_started"
  | "generate_completed"
  | "generate_failed"
  | "correction_applied"
  | "handoff_to_maxwell"
  | "proposal_requested"
  | "session_archived";

export type UpgradeEvent = {
  id: string;
  websiteUpgradeSessionId: string;
  eventType: UpgradeEventType;
  metadata: Record<string, unknown>;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// API payloads
// ---------------------------------------------------------------------------

export type CreateSessionPayload = {
  websiteUrl: string;
  mode: UpgradeMode;
  contextNote?: string;
};

export type AnswerQuestionPayload = {
  question: string;
  answer: string;
};

export type SessionWithDetails = UpgradeSession & {
  audit: UpgradeAudit | null;
  latestVersion: UpgradeVersion | null;
  pageCount: number;
};

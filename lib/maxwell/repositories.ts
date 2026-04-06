/**
 * lib/maxwell/repositories.ts
 * Capa de persistencia para Maxwell Studio.
 * Todas las operaciones de DB de las entidades Studio pasan por aquí.
 */

import { getDatabase } from "@/lib/server/noon-storage";

// ============================================================================
// Types
// ============================================================================

export type StudioStatus =
  | "intake"
  | "clarifying"
  | "generating_prototype"
  | "prototype_ready"
  | "revision_requested"
  | "revision_applied"
  | "approved_for_proposal"
  | "proposal_pending_review"
  | "proposal_sent"
  | "converted";

export type MessageRole = "user" | "assistant" | "system";

export type MessageType =
  | "chat"
  | "thinking"
  | "correction_request"
  | "prototype_announcement"
  | "approval"
  | "proposal_request"
  | "system_event";

export type VersionSource = "initial" | "correction" | "agent_override";

export type ProposalStatus =
  | "pending_review"
  | "under_review"
  | "approved"
  | "sent"
  | "payment_pending"
  | "payment_under_verification"
  | "paid"
  | "expired"
  | "returned"
  | "escalated";

export type WorkspacePaymentStatus = "pending" | "confirmed" | "failed" | "refunded";
export type WorkspaceStatus = "inactive" | "active" | "paused" | "closed";
export type WorkspaceUpdateType = "status_update" | "milestone" | "material" | "note";
export type PaymentEventType =
  | "initiated"
  | "received"
  | "confirmed"
  | "failed"
  | "refund_initiated"
  | "refunded";

export type ClientWorkspace = {
  id: string;
  studioSessionId: string;
  paymentStatus: WorkspacePaymentStatus;
  workspaceStatus: WorkspaceStatus;
  latestUpdateSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceUpdate = {
  id: string;
  clientWorkspaceId: string;
  title: string;
  content: string | null;
  updateType: WorkspaceUpdateType;
  materialUrl: string | null;
  isClientVisible: boolean;
  createdBy: string;
  createdAt: string;
};

export type PaymentEvent = {
  id: string;
  studioSessionId: string;
  eventType: PaymentEventType;
  amountUsd: number | null;
  reference: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
};

// ── Entity types ──────────────────────────────────────────────────────────────

export type StudioSession = {
  id: string;
  initialPrompt: string;
  status: StudioStatus;
  projectType: string | null;
  goalSummary: string | null;
  complexityHint: string | null;
  language: string;
  correctionsUsed: number;
  maxCorrections: number;
  proposalRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudioMessage = {
  id: string;
  studioSessionId: string;
  role: MessageRole;
  messageType: MessageType;
  content: string;
  createdAt: string;
};

export type StudioVersion = {
  id: string;
  studioSessionId: string;
  versionNumber: number;
  previewUrl: string;
  v0ChatId: string;
  changeSummary: string | null;
  source: VersionSource;
  createdAt: string;
};

export type ProposalRequest = {
  id: string;
  studioSessionId: string;
  status: ProposalStatus;
  reviewRequired: boolean;
  reviewerId: string | null;
  draftContent: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProposalWithSession = ProposalRequest & {
  sessionGoalSummary: string | null;
  sessionInitialPrompt: string;
  sessionStatus: StudioStatus;
};

export type ProposalReviewEvent = {
  id: string;
  proposalRequestId: string;
  action: string;
  actor: string;
  notes: string | null;
  createdAt: string;
};

// ── Raw row types (SQLite returns plain objects) ──────────────────────────────

type StudioSessionRow = {
  id: string;
  initial_prompt: string;
  status: string;
  project_type: string | null;
  goal_summary: string | null;
  complexity_hint: string | null;
  language: string;
  corrections_used: number;
  max_corrections: number;
  proposal_requested_at: string | null;
  created_at: string;
  updated_at: string;
};

type StudioMessageRow = {
  id: string;
  studio_session_id: string;
  role: string;
  message_type: string;
  content: string;
  created_at: string;
};

type StudioVersionRow = {
  id: string;
  studio_session_id: string;
  version_number: number;
  preview_url: string;
  v0_chat_id: string;
  change_summary: string | null;
  source: string;
  created_at: string;
};

type ProposalRequestRow = {
  id: string;
  studio_session_id: string;
  status: string;
  review_required: number;
  reviewer_id: string | null;
  draft_content: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type ClientWorkspaceRow = {
  id: string;
  studio_session_id: string;
  payment_status: string;
  workspace_status: string;
  latest_update_summary: string | null;
  created_at: string;
  updated_at: string;
};

type WorkspaceUpdateRow = {
  id: string;
  client_workspace_id: string;
  title: string;
  content: string | null;
  update_type: string;
  material_url: string | null;
  is_client_visible: number;
  created_by: string;
  created_at: string;
};

type PaymentEventRow = {
  id: string;
  studio_session_id: string;
  event_type: string;
  amount_usd: number | null;
  reference: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
};

// ============================================================================
// Mappers
// ============================================================================

function mapSession(row: StudioSessionRow): StudioSession {
  return {
    id: row.id,
    initialPrompt: row.initial_prompt,
    status: row.status as StudioStatus,
    projectType: row.project_type,
    goalSummary: row.goal_summary,
    complexityHint: row.complexity_hint,
    language: row.language,
    correctionsUsed: row.corrections_used,
    maxCorrections: row.max_corrections,
    proposalRequestedAt: row.proposal_requested_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: StudioMessageRow): StudioMessage {
  return {
    id: row.id,
    studioSessionId: row.studio_session_id,
    role: row.role as MessageRole,
    messageType: row.message_type as MessageType,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapVersion(row: StudioVersionRow): StudioVersion {
  return {
    id: row.id,
    studioSessionId: row.studio_session_id,
    versionNumber: row.version_number,
    previewUrl: row.preview_url,
    v0ChatId: row.v0_chat_id,
    changeSummary: row.change_summary,
    source: row.source as VersionSource,
    createdAt: row.created_at,
  };
}

function mapProposalRequest(row: ProposalRequestRow): ProposalRequest {
  return {
    id: row.id,
    studioSessionId: row.studio_session_id,
    status: row.status as ProposalStatus,
    reviewRequired: row.review_required === 1,
    reviewerId: row.reviewer_id,
    draftContent: row.draft_content,
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapClientWorkspace(row: ClientWorkspaceRow): ClientWorkspace {
  return {
    id: row.id,
    studioSessionId: row.studio_session_id,
    paymentStatus: row.payment_status as WorkspacePaymentStatus,
    workspaceStatus: row.workspace_status as WorkspaceStatus,
    latestUpdateSummary: row.latest_update_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWorkspaceUpdate(row: WorkspaceUpdateRow): WorkspaceUpdate {
  return {
    id: row.id,
    clientWorkspaceId: row.client_workspace_id,
    title: row.title,
    content: row.content,
    updateType: row.update_type as WorkspaceUpdateType,
    materialUrl: row.material_url,
    isClientVisible: row.is_client_visible === 1,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function mapPaymentEvent(row: PaymentEventRow): PaymentEvent {
  return {
    id: row.id,
    studioSessionId: row.studio_session_id,
    eventType: row.event_type as PaymentEventType,
    amountUsd: row.amount_usd,
    reference: row.reference,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

// ============================================================================
// studio_session
// ============================================================================

export function createStudioSession(input: {
  initialPrompt: string;
  language?: string;
}): StudioSession {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO studio_session (
      id, initial_prompt, status, language,
      corrections_used, max_corrections, created_at, updated_at
    ) VALUES (?, ?, 'intake', ?, 0, 2, ?, ?)
  `).run(id, input.initialPrompt.trim(), input.language ?? "en", now, now);

  return getStudioSessionOrThrow(id);
}

export function getStudioSession(id: string): StudioSession | null {
  const db = getDatabase();
  const row = db
    .prepare(`SELECT * FROM studio_session WHERE id = ?`)
    .get(id) as StudioSessionRow | undefined;
  return row ? mapSession(row) : null;
}

function getStudioSessionOrThrow(id: string): StudioSession {
  const session = getStudioSession(id);
  if (!session) throw new Error(`studio_session ${id} not found`);
  return session;
}

export function updateStudioSessionStatus(
  id: string,
  status: StudioStatus,
  extra?: Partial<Pick<StudioSession, "goalSummary" | "projectType" | "proposalRequestedAt">>
): StudioSession {
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE studio_session
    SET status = ?,
        goal_summary = COALESCE(?, goal_summary),
        project_type = COALESCE(?, project_type),
        proposal_requested_at = COALESCE(?, proposal_requested_at),
        updated_at = ?
    WHERE id = ?
  `).run(
    status,
    extra?.goalSummary ?? null,
    extra?.projectType ?? null,
    extra?.proposalRequestedAt ?? null,
    now,
    id
  );

  return getStudioSessionOrThrow(id);
}

export function incrementCorrectionsUsed(id: string): StudioSession {
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE studio_session
    SET corrections_used = corrections_used + 1,
        updated_at = ?
    WHERE id = ?
  `).run(now, id);

  return getStudioSessionOrThrow(id);
}

// ============================================================================
// studio_message
// ============================================================================

export function appendStudioMessage(input: {
  studioSessionId: string;
  role: MessageRole;
  content: string;
  messageType?: MessageType;
}): StudioMessage {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO studio_message (id, studio_session_id, role, message_type, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.studioSessionId,
    input.role,
    input.messageType ?? "chat",
    input.content,
    now
  );

  return {
    id,
    studioSessionId: input.studioSessionId,
    role: input.role,
    messageType: input.messageType ?? "chat",
    content: input.content,
    createdAt: now,
  };
}

export function getStudioMessages(studioSessionId: string): StudioMessage[] {
  const db = getDatabase();
  const rows = db
    .prepare(`
      SELECT * FROM studio_message
      WHERE studio_session_id = ?
      ORDER BY created_at ASC
    `)
    .all(studioSessionId) as StudioMessageRow[];
  return rows.map(mapMessage);
}

/** Returns messages formatted for OpenAI: only user/assistant chat messages. */
export function getStudioMessagesForOpenAI(
  studioSessionId: string
): { role: "user" | "assistant"; content: string }[] {
  const messages = getStudioMessages(studioSessionId);
  return messages
    .filter((m) => m.role !== "system" && m.messageType === "chat")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

// ============================================================================
// studio_version
// ============================================================================

export function createStudioVersion(input: {
  studioSessionId: string;
  previewUrl: string;
  v0ChatId: string;
  changeSummary?: string;
  source: VersionSource;
}): StudioVersion {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Determine next version number
  const lastVersion = db
    .prepare(`
      SELECT MAX(version_number) as max_version
      FROM studio_version
      WHERE studio_session_id = ?
    `)
    .get(input.studioSessionId) as { max_version: number | null };

  const versionNumber = (lastVersion.max_version ?? 0) + 1;

  db.prepare(`
    INSERT INTO studio_version (
      id, studio_session_id, version_number,
      preview_url, v0_chat_id, change_summary, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.studioSessionId,
    versionNumber,
    input.previewUrl,
    input.v0ChatId,
    input.changeSummary ?? null,
    input.source,
    now
  );

  return {
    id,
    studioSessionId: input.studioSessionId,
    versionNumber,
    previewUrl: input.previewUrl,
    v0ChatId: input.v0ChatId,
    changeSummary: input.changeSummary ?? null,
    source: input.source,
    createdAt: now,
  };
}

export function getStudioVersions(studioSessionId: string): StudioVersion[] {
  const db = getDatabase();
  const rows = db
    .prepare(`
      SELECT * FROM studio_version
      WHERE studio_session_id = ?
      ORDER BY version_number ASC
    `)
    .all(studioSessionId) as StudioVersionRow[];
  return rows.map(mapVersion);
}

export function getLatestStudioVersion(studioSessionId: string): StudioVersion | null {
  const db = getDatabase();
  const row = db
    .prepare(`
      SELECT * FROM studio_version
      WHERE studio_session_id = ?
      ORDER BY version_number DESC
      LIMIT 1
    `)
    .get(studioSessionId) as StudioVersionRow | undefined;
  return row ? mapVersion(row) : null;
}

// ============================================================================
// proposal_request
// ============================================================================

export function createProposalRequest(input: {
  studioSessionId: string;
  draftContent: string;
}): ProposalRequest {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO proposal_request (
      id, studio_session_id, status, review_required,
      draft_content, created_at, updated_at
    ) VALUES (?, ?, 'pending_review', 1, ?, ?, ?)
  `).run(id, input.studioSessionId, input.draftContent, now, now);

  return {
    id,
    studioSessionId: input.studioSessionId,
    status: "pending_review",
    reviewRequired: true,
    reviewerId: null,
    draftContent: input.draftContent,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getProposalRequest(id: string): ProposalRequest | null {
  const db = getDatabase();
  const row = db
    .prepare(`SELECT * FROM proposal_request WHERE id = ?`)
    .get(id) as ProposalRequestRow | undefined;
  return row ? mapProposalRequest(row) : null;
}

export function updateProposalDraftContent(id: string, draftContent: string): ProposalRequest {
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE proposal_request
    SET draft_content = ?, updated_at = ?
    WHERE id = ?
  `).run(draftContent, now, id);

  const row = db
    .prepare(`SELECT * FROM proposal_request WHERE id = ?`)
    .get(id) as ProposalRequestRow | undefined;
  if (!row) throw new Error(`proposal_request ${id} not found`);
  return mapProposalRequest(row);
}

/**
 * Returns all proposal requests joined with their session, newest first.
 * Optionally filtered by status.
 */
export function getProposalRequestsWithSession(opts?: {
  statuses?: ProposalStatus[];
  limit?: number;
}): ProposalWithSession[] {
  const db = getDatabase();
  const limit = opts?.limit ?? 100;

  const statusFilter =
    opts?.statuses && opts.statuses.length > 0
      ? `AND pr.status IN (${opts.statuses.map(() => "?").join(",")})`
      : "";

  const params: unknown[] = opts?.statuses ?? [];
  params.push(limit);

  const rows = db
    .prepare(`
      SELECT
        pr.*,
        ss.goal_summary  AS session_goal_summary,
        ss.initial_prompt AS session_initial_prompt,
        ss.status        AS session_status
      FROM proposal_request pr
      JOIN studio_session ss ON ss.id = pr.studio_session_id
      WHERE 1=1 ${statusFilter}
      ORDER BY pr.created_at DESC
      LIMIT ?
    `)
    .all(...(params as Parameters<typeof db.prepare>[0][])) as (ProposalRequestRow & {
      session_goal_summary: string | null;
      session_initial_prompt: string;
      session_status: string;
    })[];

  return rows.map((row) => ({
    ...mapProposalRequest(row),
    sessionGoalSummary: row.session_goal_summary,
    sessionInitialPrompt: row.session_initial_prompt,
    sessionStatus: row.session_status as StudioStatus,
  }));
}

/**
 * Sets expires_at on a proposal request.
 */
export function updateProposalExpiry(id: string, expiresAt: string): ProposalRequest {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.prepare(`UPDATE proposal_request SET expires_at = ?, updated_at = ? WHERE id = ?`).run(
    expiresAt, now, id
  );
  const row = db.prepare(`SELECT * FROM proposal_request WHERE id = ?`).get(id) as ProposalRequestRow | undefined;
  if (!row) throw new Error(`proposal_request ${id} not found`);
  return mapProposalRequest(row);
}

export function getLatestProposalRequest(studioSessionId: string): ProposalRequest | null {
  const db = getDatabase();
  const row = db
    .prepare(`
      SELECT * FROM proposal_request
      WHERE studio_session_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `)
    .get(studioSessionId) as ProposalRequestRow | undefined;
  return row ? mapProposalRequest(row) : null;
}

export function updateProposalRequestStatus(
  id: string,
  status: ProposalStatus,
  extra?: { reviewerId?: string; notes?: string }
): ProposalRequest {
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE proposal_request
    SET status = ?,
        reviewer_id = COALESCE(?, reviewer_id),
        updated_at = ?
    WHERE id = ?
  `).run(status, extra?.reviewerId ?? null, now, id);

  const row = db
    .prepare(`SELECT * FROM proposal_request WHERE id = ?`)
    .get(id) as ProposalRequestRow | undefined;

  if (!row) throw new Error(`proposal_request ${id} not found`);
  return mapProposalRequest(row);
}

export function appendProposalReviewEvent(input: {
  proposalRequestId: string;
  action: string;
  actor: string;
  notes?: string;
}): ProposalReviewEvent {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO proposal_review_event (id, proposal_request_id, action, actor, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, input.proposalRequestId, input.action, input.actor, input.notes ?? null, now);

  return {
    id,
    proposalRequestId: input.proposalRequestId,
    action: input.action,
    actor: input.actor,
    notes: input.notes ?? null,
    createdAt: now,
  };
}

// ============================================================================
// client_workspace
// ============================================================================

/**
 * Creates a workspace record. Must only be called after payment is confirmed.
 * The session must be in `converted` status (enforced at the API layer).
 */
export function createClientWorkspace(input: {
  studioSessionId: string;
  paymentStatus: WorkspacePaymentStatus;
}): ClientWorkspace {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO client_workspace (
      id, studio_session_id, payment_status, workspace_status,
      created_at, updated_at
    ) VALUES (?, ?, ?, 'inactive', ?, ?)
  `).run(id, input.studioSessionId, input.paymentStatus, now, now);

  return {
    id,
    studioSessionId: input.studioSessionId,
    paymentStatus: input.paymentStatus,
    workspaceStatus: "inactive",
    latestUpdateSummary: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getClientWorkspace(id: string): ClientWorkspace | null {
  const db = getDatabase();
  const row = db
    .prepare(`SELECT * FROM client_workspace WHERE id = ?`)
    .get(id) as ClientWorkspaceRow | undefined;
  return row ? mapClientWorkspace(row) : null;
}

export function getClientWorkspaceBySession(
  studioSessionId: string
): ClientWorkspace | null {
  const db = getDatabase();
  const row = db
    .prepare(`
      SELECT * FROM client_workspace
      WHERE studio_session_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `)
    .get(studioSessionId) as ClientWorkspaceRow | undefined;
  return row ? mapClientWorkspace(row) : null;
}

/**
 * Activates a workspace: sets payment_status = 'confirmed', workspace_status = 'active'.
 * Only valid when called after payment confirmation — enforced at the API layer.
 */
export function activateClientWorkspace(
  id: string,
  latestUpdateSummary?: string
): ClientWorkspace {
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE client_workspace
    SET payment_status = 'confirmed',
        workspace_status = 'active',
        latest_update_summary = COALESCE(?, latest_update_summary),
        updated_at = ?
    WHERE id = ?
  `).run(latestUpdateSummary ?? null, now, id);

  const row = db
    .prepare(`SELECT * FROM client_workspace WHERE id = ?`)
    .get(id) as ClientWorkspaceRow | undefined;
  if (!row) throw new Error(`client_workspace ${id} not found`);
  return mapClientWorkspace(row);
}

export function updateClientWorkspaceStatus(
  id: string,
  status: WorkspaceStatus,
  latestUpdateSummary?: string
): ClientWorkspace {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE client_workspace
    SET workspace_status = ?,
        latest_update_summary = COALESCE(?, latest_update_summary),
        updated_at = ?
    WHERE id = ?
  `).run(status, latestUpdateSummary ?? null, now, id);
  const row = db
    .prepare(`SELECT * FROM client_workspace WHERE id = ?`)
    .get(id) as ClientWorkspaceRow | undefined;
  if (!row) throw new Error(`client_workspace ${id} not found`);
  return mapClientWorkspace(row);
}

// ============================================================================
// workspace_update
// ============================================================================

export function createWorkspaceUpdate(input: {
  clientWorkspaceId: string;
  title: string;
  content?: string;
  updateType?: WorkspaceUpdateType;
  materialUrl?: string;
  isClientVisible?: boolean;
  createdBy: string;
}): WorkspaceUpdate {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO workspace_update (
      id, client_workspace_id, title, content,
      update_type, material_url, is_client_visible, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.clientWorkspaceId,
    input.title,
    input.content ?? null,
    input.updateType ?? "status_update",
    input.materialUrl ?? null,
    input.isClientVisible !== false ? 1 : 0,
    input.createdBy,
    now
  );

  return {
    id,
    clientWorkspaceId: input.clientWorkspaceId,
    title: input.title,
    content: input.content ?? null,
    updateType: input.updateType ?? "status_update",
    materialUrl: input.materialUrl ?? null,
    isClientVisible: input.isClientVisible !== false,
    createdBy: input.createdBy,
    createdAt: now,
  };
}

export function getWorkspaceUpdates(
  clientWorkspaceId: string,
  opts?: { clientVisibleOnly?: boolean }
): WorkspaceUpdate[] {
  const db = getDatabase();
  const visibilityClause = opts?.clientVisibleOnly ? "AND is_client_visible = 1" : "";
  const rows = db
    .prepare(`
      SELECT * FROM workspace_update
      WHERE client_workspace_id = ? ${visibilityClause}
      ORDER BY created_at DESC
    `)
    .all(clientWorkspaceId) as WorkspaceUpdateRow[];
  return rows.map(mapWorkspaceUpdate);
}

// ============================================================================
// payment_event
// ============================================================================

export function appendPaymentEvent(input: {
  studioSessionId: string;
  eventType: PaymentEventType;
  amountUsd?: number;
  reference?: string;
  notes?: string;
  createdBy: string;
}): PaymentEvent {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO payment_event (
      id, studio_session_id, event_type, amount_usd,
      reference, notes, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.studioSessionId,
    input.eventType,
    input.amountUsd ?? null,
    input.reference ?? null,
    input.notes ?? null,
    input.createdBy,
    now
  );

  return {
    id,
    studioSessionId: input.studioSessionId,
    eventType: input.eventType,
    amountUsd: input.amountUsd ?? null,
    reference: input.reference ?? null,
    notes: input.notes ?? null,
    createdBy: input.createdBy,
    createdAt: now,
  };
}

export function getPaymentEvents(studioSessionId: string): PaymentEvent[] {
  const db = getDatabase();
  const rows = db
    .prepare(`
      SELECT * FROM payment_event
      WHERE studio_session_id = ?
      ORDER BY created_at ASC
    `)
    .all(studioSessionId) as PaymentEventRow[];
  return rows.map(mapPaymentEvent);
}

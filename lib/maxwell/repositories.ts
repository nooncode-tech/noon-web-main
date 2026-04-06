/**
 * lib/maxwell/repositories.ts
 * Capa de persistencia para Maxwell Studio.
 * Migrado de SQLite (node:sqlite) a PostgreSQL (postgres.js / Supabase).
 * Todas las funciones son async.
 */

import { getDb } from "@/lib/server/db";
import { assertValidTransition } from "./state-machine";

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

export type StudioBrief = {
  id: string;
  studioSessionId: string;
  objective: string | null;
  users: string | null;
  coreFlow: string | null;
  styleDirection: string | null;
  integrations: string | null;
  assumptions: string | null;
  constraints: string | null;
  platform: string | null;
  primaryUser: string | null;
  answersJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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

export type StudioEventType =
  | "session_created"
  | "status_transition"
  | "brief_updated"
  | "system_recovery"
  | "proposal_requested"
  | "proposal_reviewed"
  | "payment_recorded"
  | "workspace_updated";

export type StudioEvent = {
  id: string;
  studioSessionId: string;
  eventType: StudioEventType;
  fromStatus: StudioStatus | null;
  toStatus: StudioStatus | null;
  actor: string | null;
  payloadJson: Record<string, unknown> | null;
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

// ============================================================================
// Raw row types (postgres.js returns snake_case)
// ============================================================================

type SessionRow = {
  id: string; initial_prompt: string; status: string;
  project_type: string | null; goal_summary: string | null;
  complexity_hint: string | null; language: string;
  corrections_used: number; max_corrections: number;
  proposal_requested_at: string | Date | null; created_at: string | Date; updated_at: string | Date;
};

type MessageRow = {
  id: string; studio_session_id: string; role: string;
  message_type: string; content: string; created_at: string | Date;
};

type BriefRow = {
  id: string; studio_session_id: string; objective: string | null;
  users: string | null; core_flow: string | null;
  style_direction: string | null; integrations: string | null;
  assumptions: string | null; constraints: string | null;
  platform: string | null; primary_user: string | null;
  answers_json: unknown; created_at: string | Date; updated_at: string | Date;
};

type VersionRow = {
  id: string; studio_session_id: string; version_number: number;
  preview_url: string; v0_chat_id: string; change_summary: string | null;
  source: string; created_at: string | Date;
};

type ProposalRow = {
  id: string; studio_session_id: string; status: string;
  review_required: boolean | number; reviewer_id: string | null;
  draft_content: string | null; expires_at: string | Date | null;
  created_at: string | Date; updated_at: string | Date;
};

type WorkspaceRow = {
  id: string; studio_session_id: string; payment_status: string;
  workspace_status: string; latest_update_summary: string | null;
  created_at: string | Date; updated_at: string | Date;
};

type UpdateRow = {
  id: string; client_workspace_id: string; title: string;
  content: string | null; update_type: string; material_url: string | null;
  is_client_visible: boolean | number; created_by: string; created_at: string | Date;
};

type PaymentEventRow = {
  id: string; studio_session_id: string; event_type: string;
  amount_usd: number | string | null; reference: string | null;
  notes: string | null; created_by: string; created_at: string | Date;
};

type EventRow = {
  id: string; studio_session_id: string; event_type: string;
  from_status: string | null; to_status: string | null;
  actor: string | null; payload_json: unknown; created_at: string | Date;
};

// ============================================================================
// Mappers
// ============================================================================

const ACTIVE_PROPOSAL_STATUSES: ProposalStatus[] = [
  "pending_review",
  "under_review",
  "approved",
  "payment_pending",
  "payment_under_verification",
  "escalated",
];

function toIsoTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function toBoolean(value: boolean | number | null | undefined): boolean {
  if (typeof value === "boolean") return value;
  return Number(value) === 1;
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  return typeof value === "number" ? value : Number(value);
}

function toJsonObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function mapSession(r: SessionRow): StudioSession {
  return {
    id: r.id, initialPrompt: r.initial_prompt, status: r.status as StudioStatus,
    projectType: r.project_type, goalSummary: r.goal_summary,
    complexityHint: r.complexity_hint, language: r.language,
    correctionsUsed: Number(r.corrections_used), maxCorrections: Number(r.max_corrections),
    proposalRequestedAt: toIsoTimestamp(r.proposal_requested_at),
    createdAt: toIsoTimestamp(r.created_at)!,
    updatedAt: toIsoTimestamp(r.updated_at)!,
  };
}

function mapMessage(r: MessageRow): StudioMessage {
  return {
    id: r.id, studioSessionId: r.studio_session_id,
    role: r.role as MessageRole, messageType: r.message_type as MessageType,
    content: r.content, createdAt: toIsoTimestamp(r.created_at)!,
  };
}

function mapBrief(r: BriefRow): StudioBrief {
  return {
    id: r.id,
    studioSessionId: r.studio_session_id,
    objective: r.objective,
    users: r.users,
    coreFlow: r.core_flow,
    styleDirection: r.style_direction,
    integrations: r.integrations,
    assumptions: r.assumptions,
    constraints: r.constraints,
    platform: r.platform,
    primaryUser: r.primary_user,
    answersJson: toJsonObject(r.answers_json),
    createdAt: toIsoTimestamp(r.created_at)!,
    updatedAt: toIsoTimestamp(r.updated_at)!,
  };
}

function mapVersion(r: VersionRow): StudioVersion {
  return {
    id: r.id, studioSessionId: r.studio_session_id,
    versionNumber: Number(r.version_number), previewUrl: r.preview_url,
    v0ChatId: r.v0_chat_id, changeSummary: r.change_summary,
    source: r.source as VersionSource, createdAt: toIsoTimestamp(r.created_at)!,
  };
}

function mapProposal(r: ProposalRow): ProposalRequest {
  return {
    id: r.id, studioSessionId: r.studio_session_id,
    status: r.status as ProposalStatus, reviewRequired: toBoolean(r.review_required),
    reviewerId: r.reviewer_id, draftContent: r.draft_content,
    expiresAt: toIsoTimestamp(r.expires_at),
    createdAt: toIsoTimestamp(r.created_at)!,
    updatedAt: toIsoTimestamp(r.updated_at)!,
  };
}

function mapWorkspace(r: WorkspaceRow): ClientWorkspace {
  return {
    id: r.id, studioSessionId: r.studio_session_id,
    paymentStatus: r.payment_status as WorkspacePaymentStatus,
    workspaceStatus: r.workspace_status as WorkspaceStatus,
    latestUpdateSummary: r.latest_update_summary,
    createdAt: toIsoTimestamp(r.created_at)!,
    updatedAt: toIsoTimestamp(r.updated_at)!,
  };
}

function mapUpdate(r: UpdateRow): WorkspaceUpdate {
  return {
    id: r.id, clientWorkspaceId: r.client_workspace_id, title: r.title,
    content: r.content, updateType: r.update_type as WorkspaceUpdateType,
    materialUrl: r.material_url, isClientVisible: toBoolean(r.is_client_visible),
    createdBy: r.created_by, createdAt: toIsoTimestamp(r.created_at)!,
  };
}

function mapPaymentEvent(r: PaymentEventRow): PaymentEvent {
  return {
    id: r.id, studioSessionId: r.studio_session_id,
    eventType: r.event_type as PaymentEventType, amountUsd: toNumber(r.amount_usd),
    reference: r.reference, notes: r.notes,
    createdBy: r.created_by, createdAt: toIsoTimestamp(r.created_at)!,
  };
}

function mapEvent(r: EventRow): StudioEvent {
  return {
    id: r.id,
    studioSessionId: r.studio_session_id,
    eventType: r.event_type as StudioEventType,
    fromStatus: (r.from_status as StudioStatus | null) ?? null,
    toStatus: (r.to_status as StudioStatus | null) ?? null,
    actor: r.actor,
    payloadJson: r.payload_json && typeof r.payload_json === "object" && !Array.isArray(r.payload_json)
      ? (r.payload_json as Record<string, unknown>)
      : null,
    createdAt: toIsoTimestamp(r.created_at)!,
  };
}

// ============================================================================
// studio_session
// ============================================================================

export async function createStudioSession(input: {
  initialPrompt: string;
  language?: string;
}): Promise<StudioSession> {
  const sql = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const lang = input.language ?? "en";

  await sql`
    INSERT INTO studio_session (
      id, initial_prompt, status, language,
      corrections_used, max_corrections, created_at, updated_at
    ) VALUES (
      ${id}, ${input.initialPrompt.trim()}, 'intake', ${lang}, 0, 2, ${now}, ${now}
    )
  `;

  return (await getStudioSession(id))!;
}

export async function getStudioSession(id: string): Promise<StudioSession | null> {
  const sql = getDb();
  const rows = await sql<SessionRow[]>`SELECT * FROM studio_session WHERE id = ${id}`;
  return rows[0] ? mapSession(rows[0]) : null;
}

export async function updateStudioSessionStatus(
  id: string,
  status: StudioStatus,
  extra?: Partial<Pick<StudioSession, "goalSummary" | "projectType" | "proposalRequestedAt">>
): Promise<StudioSession> {
  const current = await getStudioSession(id);
  if (!current) {
    throw new Error(`Studio session not found: ${id}`);
  }

  if (current.status !== status) {
    assertValidTransition(current.status, status);
  }

  const sql = getDb();
  const now = new Date().toISOString();

  await sql`
    UPDATE studio_session
    SET status = ${status},
        goal_summary      = COALESCE(${extra?.goalSummary ?? null}, goal_summary),
        project_type      = COALESCE(${extra?.projectType ?? null}, project_type),
        proposal_requested_at = COALESCE(${extra?.proposalRequestedAt ?? null}, proposal_requested_at),
        updated_at = ${now}
    WHERE id = ${id}
  `;

  return (await getStudioSession(id))!;
}

export async function incrementCorrectionsUsed(id: string): Promise<StudioSession> {
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`
    UPDATE studio_session
    SET corrections_used = corrections_used + 1, updated_at = ${now}
    WHERE id = ${id}
  `;
  return (await getStudioSession(id))!;
}

// ============================================================================
// studio_message
// ============================================================================

export async function appendStudioMessage(input: {
  studioSessionId: string;
  role: MessageRole;
  content: string;
  messageType?: MessageType;
}): Promise<StudioMessage> {
  const sql = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const messageType = input.messageType ?? "chat";

  await sql`
    INSERT INTO studio_message (id, studio_session_id, role, message_type, content, created_at)
    VALUES (${id}, ${input.studioSessionId}, ${input.role}, ${messageType}, ${input.content}, ${now})
  `;

  return {
    id, studioSessionId: input.studioSessionId,
    role: input.role, messageType, content: input.content, createdAt: now,
  };
}

export async function getStudioMessages(studioSessionId: string): Promise<StudioMessage[]> {
  const sql = getDb();
  const rows = await sql<MessageRow[]>`
    SELECT * FROM studio_message
    WHERE studio_session_id = ${studioSessionId}
    ORDER BY created_at ASC
  `;
  return rows.map(mapMessage);
}

export async function getStudioMessagesForOpenAI(
  studioSessionId: string
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const messages = await getStudioMessages(studioSessionId);
  return messages
    .filter((m) => m.role !== "system" && m.messageType === "chat")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

// ============================================================================
// studio_brief
// ============================================================================

export async function getStudioBrief(studioSessionId: string): Promise<StudioBrief | null> {
  const sql = getDb();
  const rows = await sql<BriefRow[]>`
    SELECT * FROM studio_brief
    WHERE studio_session_id = ${studioSessionId}
  `;
  return rows[0] ? mapBrief(rows[0]) : null;
}

export async function upsertStudioBrief(input: {
  studioSessionId: string;
  objective?: string | null;
  users?: string | null;
  coreFlow?: string | null;
  styleDirection?: string | null;
  integrations?: string | null;
  assumptions?: string | null;
  constraints?: string | null;
  platform?: string | null;
  primaryUser?: string | null;
  answersJson?: Record<string, unknown>;
}): Promise<StudioBrief> {
  const sql = getDb();
  const existing = await getStudioBrief(input.studioSessionId);
  const now = new Date().toISOString();

  if (existing) {
    const rows = await sql<BriefRow[]>`
      UPDATE studio_brief
      SET objective = COALESCE(${input.objective ?? null}, objective),
          users = COALESCE(${input.users ?? null}, users),
          core_flow = COALESCE(${input.coreFlow ?? null}, core_flow),
          style_direction = COALESCE(${input.styleDirection ?? null}, style_direction),
          integrations = COALESCE(${input.integrations ?? null}, integrations),
          assumptions = COALESCE(${input.assumptions ?? null}, assumptions),
          constraints = COALESCE(${input.constraints ?? null}, constraints),
          platform = COALESCE(${input.platform ?? null}, platform),
          primary_user = COALESCE(${input.primaryUser ?? null}, primary_user),
          answers_json = CASE
            WHEN ${JSON.stringify(input.answersJson ?? null)}::jsonb IS NULL THEN answers_json
            ELSE answers_json || ${JSON.stringify(input.answersJson ?? {})}::jsonb
          END,
          updated_at = ${now}
      WHERE studio_session_id = ${input.studioSessionId}
      RETURNING *
    `;
    return mapBrief(rows[0]);
  }

  const id = crypto.randomUUID();
  const rows = await sql<BriefRow[]>`
    INSERT INTO studio_brief (
      id, studio_session_id, objective, users, core_flow,
      style_direction, integrations, assumptions, constraints,
      platform, primary_user, answers_json, created_at, updated_at
    ) VALUES (
      ${id}, ${input.studioSessionId}, ${input.objective ?? null}, ${input.users ?? null}, ${input.coreFlow ?? null},
      ${input.styleDirection ?? null}, ${input.integrations ?? null}, ${input.assumptions ?? null}, ${input.constraints ?? null},
      ${input.platform ?? null}, ${input.primaryUser ?? null}, ${JSON.stringify(input.answersJson ?? {})}::jsonb, ${now}, ${now}
    )
    RETURNING *
  `;
  return mapBrief(rows[0]);
}

// ============================================================================
// studio_version
// ============================================================================

export async function createStudioVersion(input: {
  studioSessionId: string;
  previewUrl: string;
  v0ChatId: string;
  changeSummary?: string;
  source: VersionSource;
}): Promise<StudioVersion> {
  const sql = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const row = await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(hashtext(${input.studioSessionId}))`;

    const maxRows = await tx<{ max_version: number | null }[]>`
      SELECT MAX(version_number) AS max_version
      FROM studio_version
      WHERE studio_session_id = ${input.studioSessionId}
    `;
    const versionNumber = (maxRows[0]?.max_version ?? 0) + 1;

    const rows = await tx<VersionRow[]>`
      INSERT INTO studio_version (
        id, studio_session_id, version_number,
        preview_url, v0_chat_id, change_summary, source, created_at
      ) VALUES (
        ${id}, ${input.studioSessionId}, ${versionNumber},
        ${input.previewUrl}, ${input.v0ChatId}, ${input.changeSummary ?? null},
        ${input.source}, ${now}
      )
      RETURNING *
    `;

    return rows[0];
  });

  return mapVersion(row);
}

export async function getStudioVersions(studioSessionId: string): Promise<StudioVersion[]> {
  const sql = getDb();
  const rows = await sql<VersionRow[]>`
    SELECT * FROM studio_version
    WHERE studio_session_id = ${studioSessionId}
    ORDER BY version_number ASC
  `;
  return rows.map(mapVersion);
}

export async function getLatestStudioVersion(studioSessionId: string): Promise<StudioVersion | null> {
  const sql = getDb();
  const rows = await sql<VersionRow[]>`
    SELECT * FROM studio_version
    WHERE studio_session_id = ${studioSessionId}
    ORDER BY version_number DESC
    LIMIT 1
  `;
  return rows[0] ? mapVersion(rows[0]) : null;
}

// ============================================================================
// proposal_request
// ============================================================================

export async function createProposalRequest(input: {
  studioSessionId: string;
  draftContent: string;
}): Promise<ProposalRequest> {
  const sql = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const row = await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(hashtext(${input.studioSessionId}))`;

    const existing = await tx<ProposalRow[]>`
      SELECT * FROM proposal_request
      WHERE studio_session_id = ${input.studioSessionId}
        AND status = ANY(${tx.array(ACTIVE_PROPOSAL_STATUSES)})
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (existing[0]) {
      return existing[0];
    }

    const rows = await tx<ProposalRow[]>`
      INSERT INTO proposal_request (
        id, studio_session_id, status,
        draft_content, created_at, updated_at
      ) VALUES (${id}, ${input.studioSessionId}, 'pending_review', ${input.draftContent}, ${now}, ${now})
      RETURNING *
    `;

    return rows[0];
  });

  return mapProposal(row);
}

export async function getProposalRequest(id: string): Promise<ProposalRequest | null> {
  const sql = getDb();
  const rows = await sql<ProposalRow[]>`SELECT * FROM proposal_request WHERE id = ${id}`;
  return rows[0] ? mapProposal(rows[0]) : null;
}

export async function updateProposalDraftContent(id: string, draftContent: string): Promise<ProposalRequest> {
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`UPDATE proposal_request SET draft_content = ${draftContent}, updated_at = ${now} WHERE id = ${id}`;
  return (await getProposalRequest(id))!;
}

export async function getLatestProposalRequest(studioSessionId: string): Promise<ProposalRequest | null> {
  const sql = getDb();
  const rows = await sql<ProposalRow[]>`
    SELECT * FROM proposal_request
    WHERE studio_session_id = ${studioSessionId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return rows[0] ? mapProposal(rows[0]) : null;
}

export async function updateProposalRequestStatus(
  id: string,
  status: ProposalStatus,
  extra?: { reviewerId?: string }
): Promise<ProposalRequest> {
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`
    UPDATE proposal_request
    SET status = ${status},
        reviewer_id = COALESCE(${extra?.reviewerId ?? null}, reviewer_id),
        updated_at = ${now}
    WHERE id = ${id}
  `;
  return (await getProposalRequest(id))!;
}

export async function updateProposalExpiry(id: string, expiresAt: string): Promise<ProposalRequest> {
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`UPDATE proposal_request SET expires_at = ${expiresAt}, updated_at = ${now} WHERE id = ${id}`;
  return (await getProposalRequest(id))!;
}

export async function getProposalRequestsWithSession(opts?: {
  statuses?: ProposalStatus[];
  limit?: number;
}): Promise<ProposalWithSession[]> {
  const sql = getDb();
  const limit = opts?.limit ?? 100;
  const statuses = opts?.statuses;

  type JoinedRow = ProposalRow & {
    session_goal_summary: string | null;
    session_initial_prompt: string;
    session_status: string;
  };

  const rows = statuses && statuses.length > 0
    ? await sql<JoinedRow[]>`
        SELECT pr.*, ss.goal_summary AS session_goal_summary,
               ss.initial_prompt AS session_initial_prompt, ss.status AS session_status
        FROM proposal_request pr
        JOIN studio_session ss ON ss.id = pr.studio_session_id
        WHERE pr.status = ANY(${sql.array(statuses)})
        ORDER BY pr.created_at DESC
        LIMIT ${limit}
      `
    : await sql<JoinedRow[]>`
        SELECT pr.*, ss.goal_summary AS session_goal_summary,
               ss.initial_prompt AS session_initial_prompt, ss.status AS session_status
        FROM proposal_request pr
        JOIN studio_session ss ON ss.id = pr.studio_session_id
        ORDER BY pr.created_at DESC
        LIMIT ${limit}
      `;

  return rows.map((row) => ({
    ...mapProposal(row),
    sessionGoalSummary: row.session_goal_summary,
    sessionInitialPrompt: row.session_initial_prompt,
    sessionStatus: row.session_status as StudioStatus,
  }));
}

export async function appendProposalReviewEvent(input: {
  proposalRequestId: string;
  action: string;
  actor: string;
  notes?: string;
}): Promise<ProposalReviewEvent> {
  const sql = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO proposal_review_event (id, proposal_request_id, action, actor, notes, created_at)
    VALUES (${id}, ${input.proposalRequestId}, ${input.action}, ${input.actor}, ${input.notes ?? null}, ${now})
  `;

  return {
    id, proposalRequestId: input.proposalRequestId,
    action: input.action, actor: input.actor,
    notes: input.notes ?? null, createdAt: now,
  };
}

// ============================================================================
// client_workspace
// ============================================================================

export async function createClientWorkspace(input: {
  studioSessionId: string;
  paymentStatus: WorkspacePaymentStatus;
}): Promise<ClientWorkspace> {
  const sql = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const row = await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(hashtext(${input.studioSessionId}))`;

    const existing = await tx<WorkspaceRow[]>`
      SELECT * FROM client_workspace
      WHERE studio_session_id = ${input.studioSessionId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (existing[0]) {
      return existing[0];
    }

    const rows = await tx<WorkspaceRow[]>`
      INSERT INTO client_workspace (
        id, studio_session_id, payment_status, workspace_status, created_at, updated_at
      ) VALUES (${id}, ${input.studioSessionId}, ${input.paymentStatus}, 'inactive', ${now}, ${now})
      RETURNING *
    `;

    return rows[0];
  });

  return mapWorkspace(row);
}

export async function getClientWorkspace(id: string): Promise<ClientWorkspace | null> {
  const sql = getDb();
  const rows = await sql<WorkspaceRow[]>`SELECT * FROM client_workspace WHERE id = ${id}`;
  return rows[0] ? mapWorkspace(rows[0]) : null;
}

export async function getClientWorkspaceBySession(studioSessionId: string): Promise<ClientWorkspace | null> {
  const sql = getDb();
  const rows = await sql<WorkspaceRow[]>`
    SELECT * FROM client_workspace
    WHERE studio_session_id = ${studioSessionId}
    ORDER BY created_at DESC LIMIT 1
  `;
  return rows[0] ? mapWorkspace(rows[0]) : null;
}

export async function activateClientWorkspace(id: string, latestUpdateSummary?: string): Promise<ClientWorkspace> {
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`
    UPDATE client_workspace
    SET payment_status = 'confirmed', workspace_status = 'active',
        latest_update_summary = COALESCE(${latestUpdateSummary ?? null}, latest_update_summary),
        updated_at = ${now}
    WHERE id = ${id}
  `;
  return (await getClientWorkspace(id))!;
}

export async function updateClientWorkspaceStatus(
  id: string,
  status: WorkspaceStatus,
  latestUpdateSummary?: string
): Promise<ClientWorkspace> {
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`
    UPDATE client_workspace
    SET workspace_status = ${status},
        latest_update_summary = COALESCE(${latestUpdateSummary ?? null}, latest_update_summary),
        updated_at = ${now}
    WHERE id = ${id}
  `;
  return (await getClientWorkspace(id))!;
}

// ============================================================================
// workspace_update
// ============================================================================

export async function createWorkspaceUpdate(input: {
  clientWorkspaceId: string;
  title: string;
  content?: string;
  updateType?: WorkspaceUpdateType;
  materialUrl?: string;
  isClientVisible?: boolean;
  createdBy: string;
}): Promise<WorkspaceUpdate> {
  const sql = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const updateType = input.updateType ?? "status_update";
  const isClientVisible = input.isClientVisible !== false;

  await sql`
    INSERT INTO workspace_update (
      id, client_workspace_id, title, content,
      update_type, material_url, is_client_visible, created_by, created_at
    ) VALUES (
      ${id}, ${input.clientWorkspaceId}, ${input.title}, ${input.content ?? null},
      ${updateType}, ${input.materialUrl ?? null}, ${isClientVisible}, ${input.createdBy}, ${now}
    )
  `;

  return {
    id, clientWorkspaceId: input.clientWorkspaceId, title: input.title,
    content: input.content ?? null, updateType,
    materialUrl: input.materialUrl ?? null, isClientVisible: input.isClientVisible !== false,
    createdBy: input.createdBy, createdAt: now,
  };
}

export async function getWorkspaceUpdates(
  clientWorkspaceId: string,
  opts?: { clientVisibleOnly?: boolean }
): Promise<WorkspaceUpdate[]> {
  const sql = getDb();
  const rows = opts?.clientVisibleOnly
    ? await sql<UpdateRow[]>`
        SELECT * FROM workspace_update
        WHERE client_workspace_id = ${clientWorkspaceId} AND is_client_visible IS TRUE
        ORDER BY created_at DESC
      `
    : await sql<UpdateRow[]>`
        SELECT * FROM workspace_update
        WHERE client_workspace_id = ${clientWorkspaceId}
        ORDER BY created_at DESC
      `;
  return rows.map(mapUpdate);
}

// ============================================================================
// payment_event
// ============================================================================

export async function appendPaymentEvent(input: {
  studioSessionId: string;
  eventType: PaymentEventType;
  amountUsd?: number;
  reference?: string;
  notes?: string;
  createdBy: string;
}): Promise<PaymentEvent> {
  const sql = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO payment_event (
      id, studio_session_id, event_type, amount_usd,
      reference, notes, created_by, created_at
    ) VALUES (
      ${id}, ${input.studioSessionId}, ${input.eventType}, ${input.amountUsd ?? null},
      ${input.reference ?? null}, ${input.notes ?? null}, ${input.createdBy}, ${now}
    )
  `;

  return {
    id, studioSessionId: input.studioSessionId, eventType: input.eventType,
    amountUsd: input.amountUsd ?? null, reference: input.reference ?? null,
    notes: input.notes ?? null, createdBy: input.createdBy, createdAt: now,
  };
}

export async function getPaymentEvents(studioSessionId: string): Promise<PaymentEvent[]> {
  const sql = getDb();
  const rows = await sql<PaymentEventRow[]>`
    SELECT * FROM payment_event
    WHERE studio_session_id = ${studioSessionId}
    ORDER BY created_at ASC
  `;
  return rows.map(mapPaymentEvent);
}

// ============================================================================
// studio_event
// ============================================================================

export async function appendStudioEvent(input: {
  studioSessionId: string;
  eventType: StudioEventType;
  fromStatus?: StudioStatus | null;
  toStatus?: StudioStatus | null;
  actor?: string | null;
  payloadJson?: Record<string, unknown> | null;
}): Promise<StudioEvent> {
  const sql = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const rows = await sql<EventRow[]>`
    INSERT INTO studio_event (
      id, studio_session_id, event_type,
      from_status, to_status, actor, payload_json, created_at
    ) VALUES (
      ${id}, ${input.studioSessionId}, ${input.eventType},
      ${input.fromStatus ?? null}, ${input.toStatus ?? null},
      ${input.actor ?? null}, ${JSON.stringify(input.payloadJson ?? null)}::jsonb, ${now}
    )
    RETURNING *
  `;

  return mapEvent(rows[0]);
}

export async function getStudioEvents(studioSessionId: string): Promise<StudioEvent[]> {
  const sql = getDb();
  const rows = await sql<EventRow[]>`
    SELECT * FROM studio_event
    WHERE studio_session_id = ${studioSessionId}
    ORDER BY created_at ASC
  `;
  return rows.map(mapEvent);
}

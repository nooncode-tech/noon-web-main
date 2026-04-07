import type { ProposalCaseClassification, ProposalRequest } from "./repositories";

export const PROPOSAL_VALIDITY_DAYS = 15;
export const PROPOSAL_REVIEW_REMINDER_MINUTES = 5;
export const PROPOSAL_REVIEW_ESCALATION_MINUTES = 10;
export const PROPOSAL_REVIEW_AUTO_SEND_MINUTES = 15;

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

type ClassifyProposalCaseInput = {
  warningCount: number;
  forcedClassification?: ProposalCaseClassification;
};

export type ProposalReviewTimeline = {
  reviewNotifiedAt: string;
  reminderDueAt: string;
  escalationDueAt: string;
  autoSendDueAt: string;
};

export type ProposalReviewSlaDecision = {
  shouldRemind: boolean;
  shouldEscalate: boolean;
  shouldAutoSend: boolean;
  blockedReason: "special_case" | "missing_recipient" | null;
};

type ProposalReviewSlaInput = Pick<
  ProposalRequest,
  | "status"
  | "caseClassification"
  | "deliveryRecipient"
  | "reviewNotifiedAt"
  | "reviewRemindedAt"
  | "reviewEscalatedAt"
  | "autoSendDueAt"
  | "sentAt"
>;

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * MINUTE_MS).toISOString();
}

export function buildProposalReviewTimeline(reviewNotifiedAt: string): ProposalReviewTimeline {
  return {
    reviewNotifiedAt,
    reminderDueAt: addMinutes(reviewNotifiedAt, PROPOSAL_REVIEW_REMINDER_MINUTES),
    escalationDueAt: addMinutes(reviewNotifiedAt, PROPOSAL_REVIEW_ESCALATION_MINUTES),
    autoSendDueAt: addMinutes(reviewNotifiedAt, PROPOSAL_REVIEW_AUTO_SEND_MINUTES),
  };
}

export function deriveProposalExpiry(firstOpenedAt: string, validityDays = PROPOSAL_VALIDITY_DAYS): string {
  return new Date(new Date(firstOpenedAt).getTime() + validityDays * DAY_MS).toISOString();
}

export function classifyProposalCase({
  warningCount,
  forcedClassification,
}: ClassifyProposalCaseInput): ProposalCaseClassification {
  if (forcedClassification) {
    return forcedClassification;
  }
  return warningCount > 0 ? "special" : "normal";
}

export function evaluateProposalReviewSla(
  proposal: ProposalReviewSlaInput,
  now = new Date().toISOString()
): ProposalReviewSlaDecision {
  if (proposal.status !== "pending_review" || proposal.sentAt) {
    return {
      shouldRemind: false,
      shouldEscalate: false,
      shouldAutoSend: false,
      blockedReason: null,
    };
  }

  const timeline = buildProposalReviewTimeline(proposal.reviewNotifiedAt);
  const remindDue = new Date(timeline.reminderDueAt).getTime();
  const escalateDue = new Date(timeline.escalationDueAt).getTime();
  const autoSendDue = new Date(proposal.autoSendDueAt ?? timeline.autoSendDueAt).getTime();
  const nowMs = new Date(now).getTime();

  const shouldRemind = !proposal.reviewRemindedAt && nowMs >= remindDue;
  const shouldEscalate = !proposal.reviewEscalatedAt && nowMs >= escalateDue;

  if (nowMs < autoSendDue) {
    return {
      shouldRemind,
      shouldEscalate,
      shouldAutoSend: false,
      blockedReason: null,
    };
  }

  if (proposal.caseClassification === "special") {
    return {
      shouldRemind,
      shouldEscalate,
      shouldAutoSend: false,
      blockedReason: "special_case",
    };
  }

  if (!proposal.deliveryRecipient) {
    return {
      shouldRemind,
      shouldEscalate,
      shouldAutoSend: false,
      blockedReason: "missing_recipient",
    };
  }

  return {
    shouldRemind,
    shouldEscalate,
    shouldAutoSend: true,
    blockedReason: null,
  };
}

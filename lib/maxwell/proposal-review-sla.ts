import {
  appendProposalReviewEvent,
  getProposalRequestsWithSession,
  updateProposalRequest,
  updateProposalRequestStatus,
  updateStudioSessionStatus,
  type ProposalWithSession,
} from "./repositories";
import { evaluateProposalReviewSla } from "./proposal-lifecycle";
import {
  ProposalEmailConfigurationError,
  ProposalEmailSendError,
  sendProposalEmail,
} from "./proposal-email";

export type ProposalReviewSlaResult = {
  evaluated: number;
  reminded: number;
  escalated: number;
  autoSent: number;
  blocked: number;
  affectedProposalIds: string[];
};

type ProcessProposalReviewSlaOptions = {
  now?: string;
  publicBaseUrl?: string | null;
};

function isPendingReviewProposal(proposal: ProposalWithSession): boolean {
  return proposal.status === "pending_review";
}

function buildPublicProposalUrlFromBase(publicBaseUrl: string | null | undefined, publicToken: string): string {
  if (!publicBaseUrl) {
    throw new ProposalEmailConfigurationError(
      "A public base URL is required to auto-send proposals. Set MAXWELL_PUBLIC_BASE_URL or NEXT_PUBLIC_SITE_URL."
    );
  }

  return new URL(`/maxwell/proposal/${publicToken}`, publicBaseUrl).toString();
}

export async function processProposalReviewSla(
  options: ProcessProposalReviewSlaOptions = {}
): Promise<ProposalReviewSlaResult> {
  const now = options.now ?? new Date().toISOString();
  const proposals = await getProposalRequestsWithSession({
    statuses: ["pending_review"],
    limit: 200,
  });

  const result: ProposalReviewSlaResult = {
    evaluated: proposals.length,
    reminded: 0,
    escalated: 0,
    autoSent: 0,
    blocked: 0,
    affectedProposalIds: [],
  };

  for (const proposal of proposals) {
    if (!isPendingReviewProposal(proposal)) {
      continue;
    }

    const decision = evaluateProposalReviewSla(proposal, now);
    let touched = false;

    if (decision.shouldRemind) {
      await updateProposalRequest(proposal.id, { reviewRemindedAt: now });
      await appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "sla_reminder",
        actor: "system",
        notes: "Proposal review reminder fired after 5 minutes without resolution.",
      });
      result.reminded += 1;
      touched = true;
    }

    if (decision.shouldEscalate) {
      await updateProposalRequest(proposal.id, { reviewEscalatedAt: now });
      await appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "sla_escalated",
        actor: "system",
        notes: "Proposal review escalated after 10 minutes without resolution.",
      });
      result.escalated += 1;
      touched = true;
    }

    if (decision.shouldAutoSend) {
      try {
        const publicUrl = buildPublicProposalUrlFromBase(options.publicBaseUrl, proposal.publicToken);
        const emailResult = await sendProposalEmail({
          proposalId: proposal.id,
          versionNumber: proposal.versionNumber,
          to: proposal.deliveryRecipient!,
          publicUrl,
          projectTitle:
            proposal.sessionGoalSummary ?? proposal.sessionInitialPrompt ?? `Proposal ${proposal.id}`,
        });

        const sentAt = now;
        await updateProposalRequestStatus(proposal.id, "sent", {
          reviewerId: "system",
          sentAt,
          deliveryStatus: "sent",
        });

        if (proposal.sessionStatus === "proposal_pending_review") {
          await updateStudioSessionStatus(proposal.studioSessionId, "proposal_sent");
        }

        await appendProposalReviewEvent({
          proposalRequestId: proposal.id,
          action: "sla_auto_sent",
          actor: "system",
          notes: `Normal case auto-sent to ${proposal.deliveryRecipient} via ${emailResult.provider} (${emailResult.messageId}).`,
        });

        await appendProposalReviewEvent({
          proposalRequestId: proposal.id,
          action: "sent",
          actor: "system",
          notes: `Email delivered via ${emailResult.provider} (${emailResult.messageId}).`,
        });

        result.autoSent += 1;
        touched = true;
      } catch (error) {
        await appendProposalReviewEvent({
          proposalRequestId: proposal.id,
          action: "sla_blocked_delivery",
          actor: "system",
          notes: error instanceof Error ? error.message : "Unknown delivery error.",
        });

        await appendProposalReviewEvent({
          proposalRequestId: proposal.id,
          action: "delivery_failed",
          actor: "system",
          notes:
            error instanceof ProposalEmailConfigurationError || error instanceof ProposalEmailSendError
              ? error.message
              : "Auto-send failed before the proposal could be delivered.",
        });

        result.blocked += 1;
        touched = true;
      }
    } else if (decision.blockedReason && (decision.shouldEscalate || !proposal.reviewEscalatedAt)) {
      await appendProposalReviewEvent({
        proposalRequestId: proposal.id,
        action: "sla_blocked_special",
        actor: "system",
        notes:
          decision.blockedReason === "special_case"
            ? "Auto-send blocked because the proposal is classified as special."
            : "Auto-send blocked because no delivery recipient email is stored.",
      });
      result.blocked += 1;
      touched = true;
    }

    if (touched) {
      result.affectedProposalIds.push(proposal.id);
    }
  }

  return result;
}

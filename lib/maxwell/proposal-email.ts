import { PROPOSAL_VALIDITY_DAYS } from "./proposal-lifecycle";

export class ProposalEmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProposalEmailConfigurationError";
  }
}

export class ProposalEmailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProposalEmailSendError";
  }
}

export type SendProposalEmailInput = {
  proposalId: string;
  versionNumber: number;
  to: string;
  publicUrl: string;
  projectTitle: string;
};

export type ProposalEmailResult = {
  provider: "resend";
  messageId: string;
};

type ResendConfig = {
  provider: "resend";
  apiKey: string;
  from: string;
  replyTo: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getProposalEmailConfig(): ResendConfig {
  const provider = process.env.MAIL_PROVIDER?.trim().toLowerCase() || "resend";
  if (provider !== "resend") {
    throw new ProposalEmailConfigurationError(
      `Unsupported MAIL_PROVIDER "${provider}". Configure MAIL_PROVIDER=resend.`
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim();
  const replyTo = process.env.MAIL_REPLY_TO?.trim() || null;

  if (!apiKey) {
    throw new ProposalEmailConfigurationError("RESEND_API_KEY is not configured.");
  }

  if (!from) {
    throw new ProposalEmailConfigurationError("MAIL_FROM is not configured.");
  }

  return {
    provider: "resend",
    apiKey,
    from,
    replyTo,
  };
}

export function isProposalEmailConfigured(): boolean {
  try {
    getProposalEmailConfig();
    return true;
  } catch {
    return false;
  }
}

function buildProposalEmailSubject(projectTitle: string, versionNumber: number): string {
  return `Your Noon proposal${projectTitle ? ` - ${projectTitle}` : ""} (v${versionNumber})`;
}

function buildProposalEmailText(input: SendProposalEmailInput): string {
  return [
    "Your Noon project proposal is ready.",
    "",
    `Project: ${input.projectTitle}`,
    `Proposal version: v${input.versionNumber}`,
    `Validity: ${PROPOSAL_VALIDITY_DAYS} days from the first time you open the proposal link.`,
    "",
    `Open your proposal: ${input.publicUrl}`,
    "",
    "If you would prefer direct assistance, you can reply to this email and the Noon team will help you.",
  ].join("\n");
}

function buildProposalEmailHtml(input: SendProposalEmailInput): string {
  const projectTitle = escapeHtml(input.projectTitle);
  const publicUrl = escapeHtml(input.publicUrl);

  return `
    <div style="font-family: Arial, sans-serif; background:#f6f3ee; margin:0; padding:32px;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e5ddd1; border-radius:16px; padding:32px;">
        <p style="margin:0 0 8px; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#8a7f71;">Noon proposal</p>
        <h1 style="margin:0 0 12px; font-size:28px; line-height:1.2; color:#171412;">Your proposal is ready</h1>
        <p style="margin:0 0 20px; font-size:16px; line-height:1.6; color:#3c342f;">
          Project: <strong>${projectTitle}</strong><br />
          Proposal version: <strong>v${input.versionNumber}</strong>
        </p>
        <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#3c342f;">
          This link stays valid for ${PROPOSAL_VALIDITY_DAYS} days starting from the first time you open it.
        </p>
        <p style="margin:0 0 28px;">
          <a
            href="${publicUrl}"
            style="display:inline-block; background:#171412; color:#ffffff; text-decoration:none; padding:14px 22px; border-radius:999px; font-size:14px; font-weight:600;"
          >
            Open proposal
          </a>
        </p>
        <p style="margin:0; font-size:14px; line-height:1.6; color:#6a6057;">
          If you prefer direct assistance, reply to this email and the Noon team will help you.
        </p>
      </div>
    </div>
  `.trim();
}

export async function sendProposalEmail(input: SendProposalEmailInput): Promise<ProposalEmailResult> {
  const config = getProposalEmailConfig();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `maxwell-proposal-${input.proposalId}-v${input.versionNumber}`,
    },
    body: JSON.stringify({
      from: config.from,
      to: [input.to],
      subject: buildProposalEmailSubject(input.projectTitle, input.versionNumber),
      html: buildProposalEmailHtml(input),
      text: buildProposalEmailText(input),
      replyTo: config.replyTo ?? undefined,
      tags: [
        { name: "flow", value: "maxwell_proposal" },
        { name: "proposal_id", value: input.proposalId },
        { name: "proposal_version", value: String(input.versionNumber) },
      ],
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new ProposalEmailSendError(
      `Resend email send failed with status ${response.status}: ${responseText}`
    );
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) {
    throw new ProposalEmailSendError("Resend email send succeeded without a message id.");
  }

  return {
    provider: "resend",
    messageId: data.id,
  };
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getReviewPageAccess } from "../_actions/auth";
import { ReviewLogin } from "../_components/review-login";
import { StatusBadge } from "../_components/status-badge";
import { ReviewActions } from "./_components/review-actions";
import {
  getProposalRequest,
  getStudioSession,
  getStudioMessages,
  getStudioVersions,
  getClientWorkspaceBySession,
} from "@/lib/maxwell/repositories";

export const metadata: Metadata = {
  title: "Proposal Review - Noon",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function isExpiringSoon(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
}

type Props = { params: Promise<{ id: string }> };

export default async function ProposalReviewPage({ params }: Props) {
  const { id } = await params;
  const access = await getReviewPageAccess();
  if (!access.authorized) {
    return (
      <ReviewLogin
        reason={access.reason}
        redirectTo={`/maxwell/review/${id}`}
        viewerEmail={access.viewer?.email ?? null}
      />
    );
  }

  const proposal = await getProposalRequest(id);
  if (!proposal) notFound();

  const session = await getStudioSession(proposal.studioSessionId);
  const messages = session ? (await getStudioMessages(session.id)).filter((m) => m.messageType === "chat") : [];
  const versions = session ? await getStudioVersions(session.id) : [];
  const workspace = session ? await getClientWorkspaceBySession(session.id) : null;

  const projectTitle = session?.goalSummary ?? session?.initialPrompt ?? "Proposal";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href="/maxwell/review"
            className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Back
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-mono text-muted-foreground">
              noon / review / <span className="font-medium">{id.slice(0, 8)}</span>
            </p>
            <h1 className="truncate text-lg font-display leading-tight">{projectTitle}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {session && (
              <span className="hidden rounded bg-secondary/60 px-2 py-1 font-mono text-[10px] text-muted-foreground sm:inline">
                session: {session.status}
              </span>
            )}
            <StatusBadge status={proposal.status} />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Proposal draft
              </h2>
              {proposal.expiresAt && (
                <span
                  className={`text-xs font-medium ${
                    isExpiringSoon(proposal.expiresAt) ? "text-orange-500" : "text-muted-foreground"
                  }`}
                >
                  Expires {formatDate(proposal.expiresAt)}
                </span>
              )}
            </div>
            {proposal.draftContent ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/80">
                  {proposal.draftContent}
                </pre>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">No draft content yet.</p>
            )}
          </div>

          {messages.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Conversation ({messages.length} messages)
              </h2>
              <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-secondary/30 text-foreground/80"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Session
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Version</dt>
                <dd className="mt-0.5">v{proposal.versionNumber}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Case</dt>
                <dd className="mt-0.5 capitalize">{proposal.caseClassification}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Status</dt>
                <dd className="mt-0.5 font-mono text-xs">{session?.status ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Recipient</dt>
                <dd className="mt-0.5 text-xs">{proposal.deliveryRecipient ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Corrections</dt>
                <dd className="mt-0.5">{session?.correctionsUsed ?? 0} / {session?.maxCorrections ?? 2}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Prototypes</dt>
                <dd className="mt-0.5">{versions.length} version{versions.length !== 1 ? "s" : ""}</dd>
              </div>
              {versions.length > 0 && (
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Latest preview</dt>
                  <dd className="mt-0.5">
                    <a
                      href={versions[versions.length - 1].previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-xs text-blue-500 hover:underline"
                    >
                      {"Open ->"}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Created</dt>
                <dd className="mt-0.5 text-xs">{formatDate(proposal.createdAt)}</dd>
              </div>
              {proposal.sentAt && (
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Sent</dt>
                  <dd className="mt-0.5 text-xs">{formatDate(proposal.sentAt)}</dd>
                </div>
              )}
              {proposal.firstOpenedAt && (
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">First opened</dt>
                  <dd className="mt-0.5 text-xs">{formatDate(proposal.firstOpenedAt)}</dd>
                </div>
              )}
              {proposal.expiresAt && (
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Validity</dt>
                  <dd
                    className={`mt-0.5 text-xs font-medium ${
                      isExpiringSoon(proposal.expiresAt) ? "text-orange-500" : ""
                    }`}
                  >
                    15 days · expires {formatDate(proposal.expiresAt)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Public proposal</dt>
                <dd className="mt-0.5">
                  <a
                    href={`/maxwell/proposal/${proposal.publicToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-xs text-blue-500 hover:underline"
                  >
                    {"Open public view ->"}
                  </a>
                </dd>
              </div>
              {workspace && (
                <div className="border-t border-border pt-1">
                  <dt className="mb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    Workspace
                  </dt>
                  <dd>
                    <Link
                      href={`/maxwell/review/workspace/${workspace.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary/50"
                    >
                      {"Manage workspace ->"}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Actions
            </h2>
            <ReviewActions proposal={proposal} actorEmail={access.viewer.email} />
          </div>

          {session?.initialPrompt && (
            <div className="rounded-xl border border-border bg-secondary/20 p-5">
              <h2 className="mb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Original request
              </h2>
              <p className="line-clamp-4 text-sm leading-relaxed text-foreground/70">
                {session.initialPrompt}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

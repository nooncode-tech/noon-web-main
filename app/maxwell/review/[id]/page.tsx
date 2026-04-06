import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isReviewAuthorized } from "../_actions/auth";
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
  title: "Proposal Review — Noon",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(iso));
}

type Props = { params: Promise<{ id: string }> };

export default async function ProposalReviewPage({ params }: Props) {
  const authorized = await isReviewAuthorized();
  if (!authorized) return <ReviewLogin />;

  const { id } = await params;
  const proposal = getProposalRequest(id);
  if (!proposal) notFound();

  const session = getStudioSession(proposal.studioSessionId);
  const messages = session ? getStudioMessages(session.id).filter((m) => m.messageType === "chat") : [];
  const versions = session ? getStudioVersions(session.id) : [];
  const workspace = session ? getClientWorkspaceBySession(session.id) : null;

  const reviewToken = process.env.REVIEW_API_SECRET ?? "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href="/maxwell/review"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
          <div className="flex-1">
            <p className="text-xs font-mono text-muted-foreground">
              noon / review / {id.slice(0, 8)}
            </p>
            <h1 className="text-lg font-display leading-tight">
              {session?.goalSummary ?? session?.initialPrompt ?? "Proposal"}
            </h1>
          </div>
          <StatusBadge status={proposal.status} />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[1fr_360px]">

        {/* Left — draft content */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Proposal draft
            </h2>
            {proposal.draftContent ? (
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/80">
                {proposal.draftContent}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground italic">No draft content yet.</p>
            )}
          </div>

          {/* Conversation */}
          {messages.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Conversation ({messages.length} messages)
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
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

        {/* Right — context + actions */}
        <div className="space-y-5">

          {/* Session metadata */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Session
            </h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="font-mono text-xs">{session?.status ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Corrections used</dt>
                <dd>{session?.correctionsUsed ?? 0} / {session?.maxCorrections ?? 2}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Prototype versions</dt>
                <dd>{versions.length}</dd>
              </div>
              {versions.length > 0 && (
                <div>
                  <dt className="text-xs text-muted-foreground">Latest preview</dt>
                  <dd>
                    <a
                      href={versions[versions.length - 1].previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline break-all"
                    >
                      Open ↗
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd className="text-xs">{formatDate(proposal.createdAt)}</dd>
              </div>
              {proposal.expiresAt && (
                <div>
                  <dt className="text-xs text-muted-foreground">Expires</dt>
                  <dd className="text-xs text-orange-500">{formatDate(proposal.expiresAt)}</dd>
                </div>
              )}
              {workspace && (
                <div>
                  <dt className="text-xs text-muted-foreground">Workspace</dt>
                  <dd>
                    <Link
                      href={`/maxwell/review/workspace/${workspace.id}`}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Manage workspace →
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Actions
            </h2>
            <ReviewActions proposal={proposal} reviewToken={reviewToken} />
          </div>

        </div>
      </div>
    </div>
  );
}

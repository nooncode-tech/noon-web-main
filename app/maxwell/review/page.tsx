import Link from "next/link";
import type { Metadata } from "next";
import { isReviewAuthorized } from "./_actions/auth";
import { ReviewLogin } from "./_components/review-login";
import { StatusBadge } from "./_components/status-badge";
import { getProposalRequestsWithSession } from "@/lib/maxwell/repositories";
import type { ProposalStatus, ProposalWithSession } from "@/lib/maxwell/repositories";

export const metadata: Metadata = {
  title: "Review Panel — Noon",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ── Status grouping ───────────────────────────────────────────────────────────

const NEEDS_ATTENTION: ProposalStatus[] = ["pending_review", "payment_under_verification"];
const IN_PROGRESS: ProposalStatus[] = ["under_review", "sent", "payment_pending"];
const CLOSED: ProposalStatus[] = ["paid", "expired", "returned", "escalated"];

function groupProposals(proposals: ProposalWithSession[]) {
  return {
    needsAttention: proposals.filter((p) => NEEDS_ATTENTION.includes(p.status)),
    inProgress:     proposals.filter((p) => IN_PROGRESS.includes(p.status)),
    closed:         proposals.filter((p) => CLOSED.includes(p.status)),
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(iso));
}

// ── Proposal card ─────────────────────────────────────────────────────────────

function ProposalCard({ proposal }: { proposal: ProposalWithSession }) {
  return (
    <Link
      href={`/maxwell/review/${proposal.id}`}
      className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-secondary/30"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug line-clamp-2">
          {proposal.sessionGoalSummary ?? proposal.sessionInitialPrompt}
        </p>
        <StatusBadge status={proposal.status} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>ID: <code className="font-mono">{proposal.id.slice(0, 8)}</code></span>
        <span>{formatDate(proposal.createdAt)}</span>
        {proposal.expiresAt && (
          <span className="text-orange-500">
            Expires {formatDate(proposal.expiresAt)}
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({
  title,
  proposals,
  emptyMessage,
}: {
  title: string;
  proposals: ProposalWithSession[];
  emptyMessage: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {title}
        <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">
          {proposals.length}
        </span>
      </h2>
      {proposals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {proposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ReviewPage({ searchParams }: Props) {
  const authorized = await isReviewAuthorized();
  if (!authorized) {
    const { error } = await searchParams;
    return <ReviewLogin error={error === "invalid"} />;
  }

  const proposals = getProposalRequestsWithSession({ limit: 200 });
  const { needsAttention, inProgress, closed } = groupProposals(proposals);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-mono text-muted-foreground">noon / maxwell</p>
            <h1 className="text-lg font-display">Review Panel</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {proposals.length} proposal{proposals.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        <Section
          title="Needs attention"
          proposals={needsAttention}
          emptyMessage="Nothing pending review."
        />
        <Section
          title="In progress"
          proposals={inProgress}
          emptyMessage="No active proposals."
        />
        <Section
          title="Closed"
          proposals={closed}
          emptyMessage="No closed proposals yet."
        />
      </div>
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { buildSignInHref } from "@/lib/auth/redirect";
import {
  getStudioSession,
  getClientWorkspaceBySession,
  getWorkspaceUpdates,
} from "@/lib/maxwell/repositories";
import type { WorkspaceUpdate, WorkspaceStatus } from "@/lib/maxwell/repositories";
import { getContactHref } from "@/lib/site-config";
import { viewerOwnsStudioSession } from "@/lib/auth/ownership";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;
  const session = await getStudioSession(sessionId);
  const name = session?.goalSummary ?? "Your Project";
  return {
    title: `${name} — Workspace`,
    robots: { index: false, follow: false },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(iso));
}

const STATUS_CONFIG: Record<WorkspaceStatus, { label: string; color: string; description: string }> = {
  inactive: {
    label:       "Setting up",
    color:       "bg-yellow-500/10 text-yellow-600 border-yellow-500/25",
    description: "Your project is being configured.",
  },
  active: {
    label:       "Active",
    color:       "bg-emerald-500/10 text-emerald-600 border-emerald-500/25",
    description: "Your project is underway.",
  },
  paused: {
    label:       "On hold",
    color:       "bg-orange-500/10 text-orange-600 border-orange-500/25",
    description: "Work is temporarily paused.",
  },
  closed: {
    label:       "Closed",
    color:       "bg-zinc-500/10 text-zinc-500 border-zinc-500/25",
    description: "This project has been completed or closed.",
  },
};

const UPDATE_ICON: Record<string, string> = {
  status_update: "●",
  milestone:     "◆",
  material:      "↗",
  note:          "○",
};

const UPDATE_LABEL: Record<string, string> = {
  status_update: "Update",
  milestone:     "Milestone",
  material:      "Material",
  note:          "Note",
};

// ── Components ────────────────────────────────────────────────────────────────

function UpdateCard({ update }: { update: WorkspaceUpdate }) {
  return (
    <div className="relative pl-6">
      <span className="absolute left-0 top-1.5 text-xs text-muted-foreground/60 select-none">
        {UPDATE_ICON[update.updateType] ?? "●"}
      </span>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {UPDATE_LABEL[update.updateType] ?? update.updateType}
          </span>
          <span className="text-[10px] text-muted-foreground/50">{formatDate(update.createdAt)}</span>
        </div>
        <p className="text-sm font-medium leading-snug">{update.title}</p>
        {update.content && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {update.content}
          </p>
        )}
        {update.materialUrl && (
          <a
            href={update.materialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
          >
            Open link ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ sessionId: string }> };

export default async function WorkspacePage({ params }: Props) {
  const { sessionId } = await params;
  const sessionData = await auth();
  const viewerEmail = sessionData?.user?.email?.trim().toLowerCase();

  if (!viewerEmail) {
    redirect(buildSignInHref(`/maxwell/workspace/${encodeURIComponent(sessionId)}`));
  }

  const session = await getStudioSession(sessionId);
  if (!session) notFound();
  if (!viewerOwnsStudioSession({ email: viewerEmail }, session)) notFound();

  const workspace = await getClientWorkspaceBySession(sessionId);
  if (!workspace || workspace.workspaceStatus === "inactive") notFound();

  const updates   = await getWorkspaceUpdates(workspace.id, { clientVisibleOnly: true });
  const materials = updates.filter((u) => u.updateType === "material");
  const timeline  = updates.filter((u) => u.updateType !== "material");

  const statusCfg = STATUS_CONFIG[workspace.workspaceStatus];

  const contactHref = getContactHref({
    inquiry: "project-update",
    source:  "workspace",
    draft:   session.goalSummary ?? undefined,
  });

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-mono text-muted-foreground">noon / workspace</p>
              <h1 className="text-xl font-display leading-tight">
                {session.goalSummary ?? session.initialPrompt}
              </h1>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Status description + latest update */}
          <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {workspace.latestUpdateSummary ?? statusCfg.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-10">

        {/* Materials */}
        {materials.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Materials
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {materials.map((m) => (
                <a
                  key={m.id}
                  href={m.materialUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:bg-secondary/30"
                >
                  <span className="mt-0.5 shrink-0 text-sm">↗</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{m.title}</p>
                    {m.content && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{m.content}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        <section>
          <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Project updates
          </h2>
          {timeline.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              Updates will appear here as your project progresses.
            </p>
          ) : (
            <div className="space-y-4">
              {[...timeline].reverse().map((u) => (
                <UpdateCard key={u.id} update={u} />
              ))}
            </div>
          )}
        </section>

        {/* Contact */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-sm font-medium">Need to reach us?</h2>
          <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
            Your project manager is available for questions, feedback, or schedule changes.
          </p>
          <Link
            href={contactHref}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Contact Noon team
          </Link>
        </section>

      </div>
    </div>
  );
}

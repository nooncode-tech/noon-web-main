import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getStudioSession,
  getClientWorkspaceBySession,
  getWorkspaceUpdates,
} from "@/lib/maxwell/repositories";
import type { WorkspaceUpdate, WorkspaceStatus } from "@/lib/maxwell/repositories";
import { getContactHref } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;
  const session = getStudioSession(sessionId);
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

const STATUS_LABEL: Record<WorkspaceStatus, string> = {
  inactive: "Setting up",
  active:   "Active",
  paused:   "On hold",
  closed:   "Closed",
};

const STATUS_COLOR: Record<WorkspaceStatus, string> = {
  inactive: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  active:   "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  paused:   "bg-orange-500/15 text-orange-600 border-orange-500/30",
  closed:   "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
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
      {/* Timeline dot */}
      <span className="absolute left-0 top-1 text-xs text-muted-foreground select-none">
        {UPDATE_ICON[update.updateType] ?? "●"}
      </span>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {UPDATE_LABEL[update.updateType] ?? update.updateType}
          </span>
          <span className="text-[10px] text-muted-foreground/60">{formatDate(update.createdAt)}</span>
        </div>
        <p className="text-sm font-medium">{update.title}</p>
        {update.content && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {update.content}
          </p>
        )}
        {update.materialUrl && (
          <a
            href={update.materialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
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

  const session = getStudioSession(sessionId);
  if (!session) notFound();

  const workspace = getClientWorkspaceBySession(sessionId);
  if (!workspace || workspace.workspaceStatus === "inactive") notFound();

  const updates = getWorkspaceUpdates(workspace.id, { clientVisibleOnly: true });
  const materials = updates.filter((u) => u.updateType === "material");
  const timeline = updates.filter((u) => u.updateType !== "material");

  const contactHref = getContactHref({
    inquiry: "project-update",
    source: "workspace",
    draft: session.goalSummary ?? undefined,
  });

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-mono text-muted-foreground">
                noon / workspace
              </p>
              <h1 className="text-xl font-display leading-tight">
                {session.goalSummary ?? session.initialPrompt}
              </h1>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[workspace.workspaceStatus]}`}
            >
              {STATUS_LABEL[workspace.workspaceStatus]}
            </span>
          </div>

          {workspace.latestUpdateSummary && (
            <p className="mt-3 text-sm text-muted-foreground">
              {workspace.latestUpdateSummary}
            </p>
          )}
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
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-secondary/30"
                >
                  <span className="text-lg">↗</span>
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    {m.content && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{m.content}</p>
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
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Updates will appear here as your project progresses.
            </p>
          ) : (
            <div className="space-y-4">
              {timeline.map((u) => (
                <UpdateCard key={u.id} update={u} />
              ))}
            </div>
          )}
        </section>

        {/* Contact */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-sm font-medium">Need to reach us?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
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

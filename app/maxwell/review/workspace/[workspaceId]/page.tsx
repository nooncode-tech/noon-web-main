import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isReviewAuthorized } from "../../_actions/auth";
import { ReviewLogin } from "../../_components/review-login";
import { WorkspaceForm } from "./_components/workspace-form";
import {
  getClientWorkspace,
  getStudioSession,
  getWorkspaceUpdates,
  getPaymentEvents,
} from "@/lib/maxwell/repositories";
import type { WorkspaceUpdate } from "@/lib/maxwell/repositories";

export const metadata: Metadata = {
  title: "Workspace Management — Noon",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(iso));
}

const TYPE_ICON: Record<string, string> = {
  status_update: "●",
  milestone: "◆",
  material: "↗",
  note: "○",
};

function UpdateRow({ update }: { update: WorkspaceUpdate }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <span className="mt-0.5 text-xs text-muted-foreground">{TYPE_ICON[update.updateType] ?? "●"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-medium">{update.title}</p>
          {!update.isClientVisible && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              internal
            </span>
          )}
        </div>
        {update.content && (
          <p className="text-xs text-muted-foreground line-clamp-2">{update.content}</p>
        )}
        {update.materialUrl && (
          <a href={update.materialUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline">
            {update.materialUrl}
          </a>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground/60">
          {update.createdBy} · {formatDate(update.createdAt)}
        </p>
      </div>
    </div>
  );
}

type Props = { params: Promise<{ workspaceId: string }> };

export default async function WorkspaceManagePage({ params }: Props) {
  const authorized = await isReviewAuthorized();
  if (!authorized) return <ReviewLogin />;

  const { workspaceId } = await params;
  const workspace = await getClientWorkspace(workspaceId);
  if (!workspace) notFound();

  const session = await getStudioSession(workspace.studioSessionId);
  const updates = await getWorkspaceUpdates(workspaceId);
  const paymentEvents = await getPaymentEvents(workspace.studioSessionId);
  const reviewToken = process.env.REVIEW_API_SECRET ?? "";

  const workspaceUrl = `/maxwell/workspace/${workspace.studioSessionId}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link href="/maxwell/review"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Review panel
          </Link>
          <div className="flex-1">
            <p className="text-xs font-mono text-muted-foreground">workspace / {workspaceId.slice(0, 8)}</p>
            <h1 className="text-lg font-display">{session?.goalSummary ?? "Workspace"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Status: <strong>{workspace.workspaceStatus}</strong>
            </span>
            <a
              href={workspaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-secondary/50"
            >
              Client view ↗
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-8 lg:grid-cols-[1fr_380px]">

        {/* Left — update history */}
        <div className="space-y-6">

          {/* Updates */}
          <section>
            <h2 className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Updates ({updates.length})
            </h2>
            {updates.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No updates yet.
              </p>
            ) : (
              <div className="space-y-3">
                {updates.map((u) => <UpdateRow key={u.id} update={u} />)}
              </div>
            )}
          </section>

          {/* Payment events */}
          {paymentEvents.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Payment history
              </h2>
              <div className="space-y-2">
                {paymentEvents.map((e) => (
                  <div key={e.id} className="rounded-xl border border-border bg-card px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium capitalize">{e.eventType.replace("_", " ")}</span>
                      {e.amountUsd && (
                        <span className="text-sm font-mono">${e.amountUsd.toLocaleString()} USD</span>
                      )}
                    </div>
                    {e.reference && (
                      <p className="text-xs text-muted-foreground">Ref: {e.reference}</p>
                    )}
                    {e.notes && <p className="text-xs text-muted-foreground">{e.notes}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {e.createdBy} · {formatDate(e.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right — management form */}
        <div>
          <WorkspaceForm
            workspaceId={workspaceId}
            sessionId={workspace.studioSessionId}
            reviewToken={reviewToken}
          />
        </div>

      </div>
    </div>
  );
}

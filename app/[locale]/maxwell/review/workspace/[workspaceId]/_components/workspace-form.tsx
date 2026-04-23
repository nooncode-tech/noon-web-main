"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  WORKSPACE_STATUS_META,
  WORKSPACE_STATUS_VALUES,
  type WorkspaceStatus,
} from "@/lib/maxwell/workspace-status";

type Props = {
  workspaceId: string;
  actorEmail: string;
  currentStatus: WorkspaceStatus;
};

export function WorkspaceForm({
  workspaceId,
  actorEmail,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<WorkspaceStatus>(currentStatus);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updateType, setUpdateType] = useState<"status_update" | "milestone" | "material" | "note">("status_update");
  const [materialUrl, setMaterialUrl] = useState("");
  const [clientVisible, setClientVisible] = useState(true);
  const [statusSummary, setStatusSummary] = useState("");

  async function submitUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/maxwell/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_update",
          workspace_id: workspaceId,
          title: title.trim(),
          content: content.trim() || undefined,
          update_type: updateType,
          material_url: materialUrl.trim() || undefined,
          is_client_visible: clientVisible,
          created_by: actorEmail,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed.");

      setSuccess("Update added.");
      setTitle("");
      setContent("");
      setMaterialUrl("");
      setUpdateType("status_update");
      setClientVisible(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus() {
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/maxwell/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_status",
          workspace_id: workspaceId,
          status: selectedStatus,
          summary: statusSummary.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed.");

      setSuccess("Workspace status updated.");
      setStatusSummary("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Add update
        </h2>
        <form onSubmit={submitUpdate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium">Type</label>
              <select
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value as typeof updateType)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
              >
                <option value="status_update">Status update</option>
                <option value="milestone">Milestone</option>
                <option value="material">Material / Link</option>
                <option value="note">Internal note</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={clientVisible}
                  onChange={(e) => setClientVisible(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Visible to client
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Development kickoff complete"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Content (optional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Details for this update..."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </div>

          {updateType === "material" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium">URL</label>
              <input
                type="url"
                value={materialUrl}
                onChange={(e) => setMaterialUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="site-primary-action rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {busy ? "Saving..." : "Add update"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Workspace status
        </h2>

        <div className="mb-4 rounded-xl border border-border bg-secondary/20 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Current
          </p>
          <p className="mt-1 text-sm font-medium">
            {WORKSPACE_STATUS_META[currentStatus].label}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {WORKSPACE_STATUS_META[currentStatus].description}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">New status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as WorkspaceStatus)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            >
              {WORKSPACE_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {WORKSPACE_STATUS_META[status].label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Latest update summary (optional)</span>
            <textarea
              value={statusSummary}
              onChange={(e) => setStatusSummary(e.target.value)}
              rows={3}
              placeholder="What should the client see with this status change?"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </label>

          <button
            type="button"
            disabled={busy || selectedStatus === currentStatus}
            onClick={changeStatus}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary/50 disabled:opacity-40"
          >
            {busy ? "Updating..." : "Update workspace status"}
          </button>
        </div>
      </div>
    </div>
  );
}

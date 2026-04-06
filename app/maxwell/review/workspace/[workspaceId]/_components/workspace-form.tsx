"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  workspaceId: string;
  sessionId: string;
  reviewToken: string;
};

export function WorkspaceForm({ workspaceId, sessionId, reviewToken }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updateType, setUpdateType] = useState<"status_update" | "milestone" | "material" | "note">("status_update");
  const [materialUrl, setMaterialUrl] = useState("");
  const [clientVisible, setClientVisible] = useState(true);

  async function submitUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/maxwell/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${reviewToken}`,
        },
        body: JSON.stringify({
          action: "add_update",
          workspace_id: workspaceId,
          title: title.trim(),
          content: content.trim() || undefined,
          update_type: updateType,
          material_url: materialUrl.trim() || undefined,
          is_client_visible: clientVisible,
          created_by: "pm",
        }),
      });
      const data = await res.json() as { message?: string };
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

  async function changeStatus(status: "paused" | "closed") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/maxwell/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${reviewToken}`,
        },
        body: JSON.stringify({
          action: "change_status",
          workspace_id: workspaceId,
          status,
        }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* Add update */}
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
            <label className="mb-1.5 block text-xs font-medium">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Design phase completed"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Content (optional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Details for this update…"
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
                placeholder="https://…"
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
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            {busy ? "Saving…" : "Add update"}
          </button>
        </form>
      </div>

      {/* Status controls */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Workspace status
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => changeStatus("paused")}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary/50 disabled:opacity-40"
          >
            Pause project
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => changeStatus("closed")}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-40"
          >
            Close workspace
          </button>
        </div>
      </div>

    </div>
  );
}

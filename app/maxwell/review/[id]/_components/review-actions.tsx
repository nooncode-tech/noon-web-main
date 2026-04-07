"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProposalRequest } from "@/lib/maxwell/repositories";

type ReviewAction =
  | "approve_and_send"
  | "edit"
  | "create_new_version"
  | "return_to_draft"
  | "escalate";
type PaymentAction = "mark_payment_pending" | "verify_payment" | "expire_proposal";

type Props = {
  proposal: ProposalRequest;
  actorEmail: string;
  cleanedDraftContent: string;
  defaultRecipient: string | null;
  recipientRequired: boolean;
};

function ActionButton({
  label,
  onClick,
  variant = "default",
  disabled,
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "danger" | "ghost";
  disabled?: boolean;
}) {
  const cls = {
    default: "border border-border bg-background hover:bg-secondary/50 text-foreground",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    danger: "border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
  }[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${cls}`}
    >
      {label}
    </button>
  );
}

export function ReviewActions({
  proposal,
  actorEmail,
  cleanedDraftContent,
  defaultRecipient,
  recipientRequired,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [editContent, setEditContent] = useState(cleanedDraftContent);
  const [deliveryRecipient, setDeliveryRecipient] = useState(defaultRecipient ?? "");
  const [caseClassification, setCaseClassification] = useState(proposal.caseClassification);
  const [mode, setMode] = useState<ReviewAction | PaymentAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function callReviewApi(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/maxwell/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Action failed.");
      router.refresh();
      setMode(null);
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  async function callPaymentApi(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/maxwell/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Action failed.");
      router.refresh();
      setMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  const status = proposal.status;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(status === "pending_review" || status === "under_review" || status === "approved") && (
          <>
            <ActionButton
              label="Approve & send"
              variant="primary"
              disabled={busy}
              onClick={() => setMode("approve_and_send")}
            />
            <ActionButton label="Edit draft" disabled={busy} onClick={() => setMode("edit")} />
            <ActionButton
              label="Return to draft"
              variant="ghost"
              disabled={busy}
              onClick={() => setMode("return_to_draft")}
            />
            <ActionButton
              label="Escalate"
              variant="danger"
              disabled={busy}
              onClick={() => setMode("escalate")}
            />
          </>
        )}

        {(status === "sent" || status === "expired") && (
          <ActionButton
            label="Create new version"
            disabled={busy}
            onClick={() => setMode("create_new_version")}
          />
        )}

        {status === "sent" && (
          <ActionButton
            label="Mark payment pending"
            variant="primary"
            disabled={busy}
            onClick={() =>
              callPaymentApi({
                action: "mark_payment_pending",
                proposal_request_id: proposal.id,
              })
            }
          />
        )}

        {status === "payment_pending" && (
          <>
            <ActionButton
              label="Mark under verification"
              disabled={busy}
              onClick={() =>
                callPaymentApi({
                  action: "submit_payment_evidence",
                  proposal_request_id: proposal.id,
                })
              }
            />
            <ActionButton
              label="Expire proposal"
              variant="danger"
              disabled={busy}
              onClick={() => setMode("expire_proposal")}
            />
          </>
        )}

        {status === "payment_under_verification" && (
          <>
            <ActionButton
              label="Confirm payment"
              variant="primary"
              disabled={busy}
              onClick={() => setMode("verify_payment")}
            />
            <ActionButton
              label="Expire proposal"
              variant="danger"
              disabled={busy}
              onClick={() => setMode("expire_proposal")}
            />
          </>
        )}
      </div>

      {(mode === "approve_and_send" || mode === "edit" || mode === "create_new_version") && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">
            {mode === "approve_and_send" && "Approve and send"}
            {mode === "edit" && "Edit draft"}
            {mode === "create_new_version" && "Create a new commercial version"}
          </p>

          {mode !== "approve_and_send" && (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={20}
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-foreground/30"
            />
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Recipient email</span>
              <input
                type="email"
                value={deliveryRecipient}
                onChange={(e) => setDeliveryRecipient(e.target.value)}
                placeholder="client@example.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
              />
              {recipientRequired && !deliveryRecipient.trim() && (
                <span className="block text-[11px] text-amber-700">
                  Required before approving and sending this proposal.
                </span>
              )}
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Case classification</span>
              <select
                value={caseClassification}
                onChange={(e) => setCaseClassification(e.target.value as ProposalRequest["caseClassification"])}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
              >
                <option value="normal">Normal</option>
                <option value="special">Special</option>
              </select>
            </label>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={mode === "approve_and_send" ? "Optional note" : "Optional internal note"}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
          />

          <div className="flex gap-2">
            <ActionButton
              label={
                busy
                  ? mode === "approve_and_send"
                    ? "Sending..."
                    : mode === "create_new_version"
                      ? "Creating..."
                      : "Saving..."
                  : mode === "approve_and_send"
                    ? "Approve & send"
                    : mode === "create_new_version"
                      ? "Create version"
                      : "Save changes"
              }
              variant="primary"
              disabled={
                busy ||
                (mode === "approve_and_send" && !deliveryRecipient.trim()) ||
                (mode !== "approve_and_send" && !editContent.trim())
              }
              onClick={() =>
                callReviewApi({
                  action: mode,
                  proposal_request_id: proposal.id,
                  actor: actorEmail,
                  draft_content: mode === "approve_and_send" ? undefined : editContent,
                  delivery_recipient: deliveryRecipient.trim() || undefined,
                  case_classification: caseClassification,
                  notes: notes.trim() || undefined,
                })
              }
            />
            <ActionButton label="Cancel" variant="ghost" disabled={busy} onClick={() => setMode(null)} />
          </div>
        </div>
      )}

      {(mode === "return_to_draft" || mode === "escalate") && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">
            {mode === "escalate" ? "Escalation reason" : "Return reason"}{" "}
            <span className="text-red-500">*</span>
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Required..."
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
          />
          <div className="flex gap-2">
            <ActionButton
              label={busy ? "Submitting..." : mode === "escalate" ? "Escalate" : "Return"}
              variant={mode === "escalate" ? "danger" : "default"}
              disabled={busy || !notes.trim()}
              onClick={() =>
                callReviewApi({
                  action: mode,
                  proposal_request_id: proposal.id,
                  actor: actorEmail,
                  notes,
                })
              }
            />
            <ActionButton label="Cancel" variant="ghost" disabled={busy} onClick={() => setMode(null)} />
          </div>
        </div>
      )}

      {mode === "verify_payment" && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">Confirm payment</p>
          <input
            type="text"
            placeholder="Payment reference (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
          />
          <div className="flex gap-2">
            <ActionButton
              label={busy ? "Confirming..." : "Confirm & activate workspace"}
              variant="primary"
              disabled={busy}
              onClick={() =>
                callPaymentApi({
                  action: "verify_payment",
                  proposal_request_id: proposal.id,
                  actor: actorEmail,
                  payment_reference: notes || undefined,
                })
              }
            />
            <ActionButton label="Cancel" variant="ghost" disabled={busy} onClick={() => setMode(null)} />
          </div>
        </div>
      )}

      {mode === "expire_proposal" && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-red-600">Expire this proposal?</p>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-2">
            <ActionButton
              label={busy ? "Expiring..." : "Yes, expire"}
              variant="danger"
              disabled={busy}
              onClick={() =>
                callPaymentApi({
                  action: "expire_proposal",
                  proposal_request_id: proposal.id,
                  actor: actorEmail,
                })
              }
            />
            <ActionButton label="Cancel" variant="ghost" disabled={busy} onClick={() => setMode(null)} />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

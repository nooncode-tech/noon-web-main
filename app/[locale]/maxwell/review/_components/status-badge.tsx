import type { ProposalStatus } from "@/lib/maxwell/repositories";

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; className: string }
> = {
  pending_review:             { label: "Pending review",       className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" },
  under_review:               { label: "Under review",         className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  approved:                   { label: "Approved",             className: "bg-green-500/15 text-green-600 border-green-500/30" },
  sent:                       { label: "Sent",                 className: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30" },
  payment_pending:            { label: "Payment pending",      className: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  payment_under_verification: { label: "Verifying payment",   className: "bg-purple-500/15 text-purple-600 border-purple-500/30" },
  paid:                       { label: "Paid",                 className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  expired:                    { label: "Expired",              className: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30" },
  returned:                   { label: "Returned",             className: "bg-red-500/15 text-red-600 border-red-500/30" },
  escalated:                  { label: "Escalated",            className: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-border text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

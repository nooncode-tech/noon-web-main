export const WORKSPACE_STATUS_VALUES = [
  "active",
  "in_preparation",
  "in_development",
  "in_review",
  "delivered",
] as const;

export type WorkspaceStatus = (typeof WORKSPACE_STATUS_VALUES)[number];

export const WORKSPACE_STATUS_META: Record<
  WorkspaceStatus,
  { label: string; description: string; color: string }
> = {
  active: {
    label: "Active",
    description: "Your project is active inside Noon and ready to move through execution.",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25",
  },
  in_preparation: {
    label: "In Preparation",
    description: "Kickoff, scoping handoff, and preparation work are underway.",
    color: "bg-amber-500/10 text-amber-700 border-amber-500/25",
  },
  in_development: {
    label: "In Development",
    description: "The Noon development team is actively building the approved scope.",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/25",
  },
  in_review: {
    label: "In Review",
    description: "The project is in internal review, QA, or final validation before delivery.",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/25",
  },
  delivered: {
    label: "Delivered",
    description: "The project has been delivered with the agreed final materials and handoff.",
    color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/25",
  },
};

"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  CircleDashed,
  MessageSquare,
  Monitor,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import { siteRoutes } from "@/lib/site-config";
import { STUDIO_STATUS_META } from "@/lib/maxwell/studio-status";
import type { StudioPhase, ActiveView } from "./studio-shell";

// ============================================================================
// Phase label map
// ============================================================================

const phaseLabels: Record<StudioPhase, string> = {
  intake: `${STUDIO_STATUS_META.intake.label}...`,
  clarifying: STUDIO_STATUS_META.clarifying.label,
  generating_prototype: `${STUDIO_STATUS_META.generating_prototype.label}...`,
  prototype_ready: STUDIO_STATUS_META.prototype_ready.label,
  revision_requested: `${STUDIO_STATUS_META.revision_requested.label}...`,
  revision_applied: STUDIO_STATUS_META.revision_applied.label,
  approved_for_proposal: STUDIO_STATUS_META.approved_for_proposal.label,
  proposal_pending_review: STUDIO_STATUS_META.proposal_pending_review.label,
  proposal_sent: STUDIO_STATUS_META.proposal_sent.label,
  converted: "Project active",
};

const phaseIsActive = (phase: StudioPhase) =>
  phase === "generating_prototype" || phase === "revision_requested";

// ============================================================================
// CorrectionCounter
// ============================================================================

function CorrectionCounter({ used, max }: { used: number; max: number }) {
  const allUsed = used >= max;

  return (
    <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-mono text-muted-foreground transition-colors duration-300">
      {allUsed ? (
        "Adjustments complete"
      ) : (
        <>
          {Array.from({ length: max }).map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i < used ? "var(--foreground)" : "var(--border)" }}
            />
          ))}
          <span className="ml-1">
            {used}/{max}
          </span>
        </>
      )}
    </div>
  );
}

// ============================================================================
// ViewToggle (mobile)
// ============================================================================

function ViewToggle({
  activeView,
  onToggle,
  hasWorkspace,
}: {
  activeView: ActiveView;
  onToggle: (v: ActiveView) => void;
  hasWorkspace: boolean;
}) {
  return (
    <div
      className="flex lg:hidden items-center rounded-full border border-border p-0.5 text-xs"
      style={{ backgroundColor: "var(--secondary)" }}
    >
      <button
        type="button"
        onClick={() => onToggle("chat")}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors"
        style={
          activeView === "chat"
            ? { backgroundColor: "var(--background)", color: "var(--foreground)" }
            : { color: "var(--muted-foreground)" }
        }
      >
        <MessageSquare className="w-3 h-3" />
        Chat
      </button>
      <button
        type="button"
        onClick={() => onToggle("preview")}
        disabled={!hasWorkspace}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors disabled:opacity-40"
        style={
          activeView === "preview"
            ? { backgroundColor: "var(--background)", color: "var(--foreground)" }
            : { color: "var(--muted-foreground)" }
        }
      >
        <Monitor className="w-3 h-3" />
        Preview
        {hasWorkspace && activeView !== "preview" && (
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/70 animate-pulse" />
        )}
      </button>
    </div>
  );
}

// ============================================================================
// StudioHeader
// ============================================================================

type StudioHeaderProps = {
  projectName: string;
  phase: StudioPhase;
  correctionsUsed: number;
  maxCorrections: number;
  agentHref: string;
  viewerEmail: string;
  activeView: ActiveView;
  onToggleView: (v: ActiveView) => void;
  hasPrototype: boolean;
  hasWorkspace: boolean;
};

export function StudioHeader({
  projectName,
  phase,
  correctionsUsed,
  maxCorrections,
  agentHref,
  viewerEmail,
  activeView,
  onToggleView,
  hasPrototype,
  hasWorkspace,
}: StudioHeaderProps) {
  const isProcessing = phaseIsActive(phase);
  const label = phaseLabels[phase];
  const displayName = projectName || "Maxwell Studio";

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border/70 bg-background/95 px-4 py-2.5 shrink-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link
          href={siteRoutes.home}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label="Back to Noon"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p
            className="truncate text-[13px] font-display leading-none transition-all duration-500"
            title={displayName}
          >
            {displayName}
          </p>
          {hasWorkspace && (
            <p className="mt-1 hidden truncate text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/65 sm:block">
              {viewerEmail}
            </p>
          )}
        </div>
      </div>

      <div className="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground sm:flex">
        <CircleDashed className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
        <span>Drafts</span>
        <span>/</span>
        <button
          type="button"
          className="inline-flex max-w-[220px] items-center gap-1 truncate rounded-md px-1 py-0.5 transition-colors hover:bg-secondary hover:text-foreground"
          title={displayName}
        >
          <span className="truncate">{displayName}</span>
          <ChevronDown className="h-3 w-3 shrink-0" />
        </button>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground lg:flex">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${isProcessing ? "animate-pulse" : ""}`}
            style={{ backgroundColor: isProcessing ? "var(--foreground)" : "var(--muted-foreground)" }}
          />
          <span className="truncate">{label}</span>
        </div>

        <ViewToggle
          activeView={activeView}
          onToggle={onToggleView}
          hasWorkspace={hasWorkspace}
        />

        {hasPrototype && (
          <CorrectionCounter used={correctionsUsed} max={maxCorrections} />
        )}

        <Link
          href={agentHref}
          className="hidden items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground sm:flex"
        >
          <User className="h-3 w-3" />
          Talk to agent
        </Link>
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground md:flex"
        >
          <Share2 className="h-3 w-3" />
          Share
        </button>
      </div>
    </header>
  );
}

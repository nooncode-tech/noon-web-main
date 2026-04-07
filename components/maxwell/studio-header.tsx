"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, User, MessageSquare, Monitor } from "lucide-react";
import { siteRoutes } from "@/lib/site-config";
import { siteStatusTones, siteTones } from "@/lib/site-tones";
import type { StudioPhase, ActiveView } from "./studio-shell";

// ============================================================================
// Phase label map
// ============================================================================

const phaseLabels: Record<StudioPhase, string> = {
  intake: "Starting...",
  clarifying: "Clarifying",
  generating_prototype: "Building prototype...",
  prototype_ready: "Prototype ready",
  revision_requested: "Applying adjustment...",
  revision_applied: "Adjustment applied",
  approved_for_proposal: "Approved",
  proposal_pending_review: "Proposal in review",
  proposal_sent: "Proposal sent",
  converted: "Project active",
};

const phaseIsActive = (phase: StudioPhase) =>
  phase === "generating_prototype" || phase === "revision_requested";

// ============================================================================
// CorrectionCounter
// ============================================================================

function CorrectionCounter({ used, max }: { used: number; max: number }) {
  const allUsed = used >= max;
  const tone = allUsed ? siteTones.services : siteTones.brand;

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono border transition-colors duration-300"
      style={{
        backgroundColor: tone.surface,
        borderColor: tone.border,
        color: tone.accent,
      }}
    >
      {allUsed ? (
        "Adjustments complete"
      ) : (
        <>
          {Array.from({ length: max }).map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i < used ? tone.accent : tone.border }}
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
  hasPrototype,
}: {
  activeView: ActiveView;
  onToggle: (v: ActiveView) => void;
  hasPrototype: boolean;
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
        disabled={!hasPrototype}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors disabled:opacity-40"
        style={
          activeView === "preview"
            ? { backgroundColor: "var(--background)", color: "var(--foreground)" }
            : { color: "var(--muted-foreground)" }
        }
      >
        <Monitor className="w-3 h-3" />
        Preview
        {hasPrototype && activeView !== "preview" && (
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: siteTones.brand.accent }}
          />
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
}: StudioHeaderProps) {
  const isProcessing = phaseIsActive(phase);
  const label = phaseLabels[phase];
  const displayName = projectName || "Maxwell Studio";

  return (
    <header
      className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0"
      style={{ backgroundColor: siteTones.brand.surface }}
    >
      {/* Back */}
      <Link
        href={siteRoutes.maxwell}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-background transition-colors shrink-0"
        aria-label="Back to Maxwell"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
      </Link>

      {/* Brand icon */}
      <div
        className="flex items-center justify-center w-8 h-8 rounded-xl border shrink-0"
        style={{ backgroundColor: siteTones.brand.accent, borderColor: siteTones.brand.border }}
      >
        <Sparkles className="w-4 h-4" style={{ color: siteTones.brand.contrast }} />
      </div>

      {/* Identity + status */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-display leading-none truncate transition-all duration-500"
          title={displayName}
        >
          {displayName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${isProcessing ? "animate-pulse" : ""}`}
            style={{
              backgroundColor: isProcessing
                ? siteTones.data.accent
                : siteStatusTones.availability.accent,
            }}
          />
          <span className="text-xs text-muted-foreground truncate">{label}</span>
        </div>
        <p className="mt-1 hidden truncate text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/65 sm:block">
          {viewerEmail}
        </p>
      </div>

      {/* View toggle (mobile) */}
      <ViewToggle
        activeView={activeView}
        onToggle={onToggleView}
        hasPrototype={hasPrototype}
      />

      {/* Correction counter (desktop, shown when prototype is active) */}
      {hasPrototype && (
        <CorrectionCounter used={correctionsUsed} max={maxCorrections} />
      )}

      {/* Talk to agent */}
      <Link
        href={agentHref}
        className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-background transition-colors shrink-0"
      >
        <User className="w-3 h-3" />
        Talk to agent
      </Link>
    </header>
  );
}

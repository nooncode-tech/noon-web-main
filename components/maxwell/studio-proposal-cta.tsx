"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle, RotateCcw, FileText, User,
  ArrowRight, Clock, Loader2,
} from "lucide-react";
import type { StudioPhase } from "./studio-shell";

// ============================================================================
// Types
// ============================================================================

type StudioProposalCtaProps = {
  phase: StudioPhase;
  correctionsUsed: number;
  maxCorrections: number;
  onApprove: () => void;
  onRequestCorrection: (prompt: string) => void;
  onRequestProposal: () => void;
  agentHref: string;
};

// ============================================================================
// Correction input inline
// ============================================================================

function InlineCorrectionInput({
  remaining,
  onSubmit,
  onCancel,
}: {
  remaining: number;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Describe what to adjust —{" "}
        <span className="text-foreground/80">
          {remaining} {remaining === 1 ? "adjustment" : "adjustments"} remaining
        </span>
      </p>
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && value.trim()) {
              e.preventDefault();
              onSubmit(value.trim());
            }
            if (e.key === "Escape") onCancel();
          }}
          placeholder="e.g. Use a darker color scheme, add a pricing section..."
          rows={2}
          autoFocus
          className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground/20 transition-colors"
        />
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => value.trim() && onSubmit(value.trim())}
            disabled={!value.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#131313] text-foreground disabled:opacity-40 transition-colors hover:bg-foreground/10"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-muted-foreground hover:bg-secondary transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// StudioProposalCta
// ============================================================================

export function StudioProposalCta({
  phase,
  correctionsUsed,
  maxCorrections,
  onApprove,
  onRequestCorrection,
  onRequestProposal,
  agentHref,
}: StudioProposalCtaProps) {
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  const canCorrect = phase === "prototype_ready" && correctionsUsed < maxCorrections;
  const allUsed = correctionsUsed >= maxCorrections;
  const remaining = maxCorrections - correctionsUsed;

  // ── Generating state ──────────────────────────────────────────────────────

  if (phase === "generating_prototype" || phase === "revision_requested") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-[#050505] p-4">
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-muted-foreground" />
        <p className="text-sm text-foreground/90">
          {phase === "generating_prototype"
            ? "Building the initial prototype..."
            : "Applying your adjustment..."}
        </p>
      </div>
    );
  }

  // ── Proposal pending review ───────────────────────────────────────────────

  if (phase === "proposal_pending_review" || phase === "proposal_sent") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-[#050505] p-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-border/70 bg-[#131313] text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium mb-0.5">Proposal under review</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A Noon Project Manager is reviewing this before sending it to you.
          </p>
          <Link
            href={agentHref}
            className="inline-flex items-center gap-1.5 mt-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <User className="w-3 h-3" />
            Talk to an agent directly
          </Link>
        </div>
      </div>
    );
  }

  // ── Approved for proposal ─────────────────────────────────────────────────

  if (phase === "approved_for_proposal") {
    return (
      <div className="rounded-2xl border border-border/70 bg-[#050505] p-4 space-y-3">
        <div>
          <p className="text-sm font-medium mb-0.5">
            Prototype approved
          </p>
          <p className="text-xs text-muted-foreground">
            Request the formal proposal — the Noon team reviews it before sending.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRequestProposal}
            className="inline-flex items-center gap-2 rounded-full bg-[#131313] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10"
          >
            <FileText className="w-3.5 h-3.5" />
            Request formal proposal
          </button>
          <Link
            href={agentHref}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            Talk to agent
          </Link>
        </div>
      </div>
    );
  }

  // ── Prototype ready ───────────────────────────────────────────────────────

  if (phase !== "prototype_ready") return null;

  // Correction input open
  if (showCorrectionInput) {
    return (
      <div className="rounded-2xl border border-border/70 bg-[#050505] p-4">
        <InlineCorrectionInput
          remaining={remaining}
          onSubmit={(text) => {
            setShowCorrectionInput(false);
            onRequestCorrection(text);
          }}
          onCancel={() => setShowCorrectionInput(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-[#050505] p-4 space-y-3">
      {/* Status line */}
      <p className="text-xs text-muted-foreground">
        {allUsed
          ? "Adjustments complete — approve to move forward."
          : `Prototype ready. ${remaining} adjustment${remaining === 1 ? "" : "s"} available.`}
      </p>

      {/* Primary actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="inline-flex items-center gap-2 rounded-full bg-[#131313] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Approve prototype
        </button>

        {canCorrect && (
          <button
            type="button"
            onClick={() => setShowCorrectionInput(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Request adjustment
            <span
              className="rounded-full border border-border/70 bg-[#131313] px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
            >
              {remaining}
            </span>
          </button>
        )}
      </div>

      {/* Secondary actions */}
      <div className="flex flex-wrap items-center gap-3 pt-0.5 border-t border-border/50">
        <button
          type="button"
          onClick={onRequestProposal}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileText className="w-3 h-3" />
          Skip to proposal
        </button>
        <Link
          href={agentHref}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <User className="w-3 h-3" />
          Talk to agent
        </Link>
      </div>
    </div>
  );
}

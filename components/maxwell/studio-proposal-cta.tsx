"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle, RotateCcw, FileText, User,
  ArrowRight, Clock, Loader2,
} from "lucide-react";
import { siteTones } from "@/lib/site-tones";
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
        <span style={{ color: siteTones.brand.accent }}>
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
            className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
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
      <div
        className="rounded-2xl border p-4 flex items-center gap-3"
        style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
      >
        <Loader2
          className="w-4 h-4 animate-spin shrink-0"
          style={{ color: siteTones.brand.accent }}
        />
        <p className="text-sm" style={{ color: siteTones.brandDeep.accent }}>
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
      <div
        className="rounded-2xl border p-4 flex items-start gap-3"
        style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: siteTones.brand.accent }}
        >
          <Clock className="w-3.5 h-3.5" style={{ color: siteTones.brand.contrast }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium mb-0.5">Proposal under review</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A Noon Project Manager is reviewing this before sending it to you.
          </p>
          <Link
            href={agentHref}
            className="inline-flex items-center gap-1.5 mt-2 text-xs hover:underline transition-colors"
            style={{ color: siteTones.brand.accent }}
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
      <div
        className="rounded-2xl border p-4 space-y-3"
        style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
      >
        <div>
          <p className="text-sm font-medium mb-0.5" style={{ color: siteTones.brandDeep.accent }}>
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
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
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
      <div
        className="rounded-2xl border p-4"
        style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
      >
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
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
    >
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
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
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
              className="text-xs font-mono rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: siteTones.brand.surface, color: siteTones.brand.accent }}
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

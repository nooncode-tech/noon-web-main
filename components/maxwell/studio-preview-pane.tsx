"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Monitor, ExternalLink, CheckCircle, RotateCcw,
  FileText, User, ArrowRight, Loader2, AlertCircle, RefreshCw, Smartphone,
} from "lucide-react";
import { siteTones } from "@/lib/site-tones";
import type { StudioPhase, PrototypeVersion } from "./studio-shell";

// ============================================================================
// Placeholder — no prototype yet
// ============================================================================

function PreviewPlaceholder({ phase }: { phase: StudioPhase }) {
  const isGenerating = phase === "generating_prototype";

  return (
    <div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      style={{ backgroundColor: siteTones.brand.mutedSurface ?? "var(--secondary)" }}
    >
      <div
        className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-5 transition-all duration-500 ${isGenerating ? "scale-110" : "scale-100"}`}
        style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
      >
        {isGenerating ? (
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: siteTones.brand.accent }} />
        ) : (
          <Monitor className="w-7 h-7" style={{ color: siteTones.brand.accent }} />
        )}
      </div>

      <p className="text-base font-display mb-2">
        {isGenerating ? "Building prototype..." : "Preview panel"}
      </p>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {isGenerating
          ? "Maxwell is generating an initial version based on what you've discussed. This usually takes 20–40 seconds."
          : "The interactive prototype will appear here once Maxwell has enough context to build it. Keep chatting to refine the idea."}
      </p>

      {isGenerating && (
        <div className="mt-6 flex gap-2 items-center">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="rounded-full animate-pulse transition-all duration-300"
              style={{
                backgroundColor: siteTones.brand.accent,
                width: i === 2 ? "10px" : "6px",
                height: i === 2 ? "10px" : "6px",
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      )}

      {!isGenerating && (
        <p className="text-xs text-muted-foreground mt-4 font-mono opacity-50">
          preview · waiting
        </p>
      )}
    </div>
  );
}

// ============================================================================
// PreviewFailed — prototype generation error state
// ============================================================================

function PreviewFailed({
  onRetry,
  agentHref,
}: {
  onRetry: () => void;
  agentHref: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full text-center px-8"
      style={{ backgroundColor: siteTones.brand.mutedSurface ?? "var(--secondary)" }}
    >
      <div
        className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-5"
        style={{ backgroundColor: siteTones.services.surface, borderColor: siteTones.services.border }}
      >
        <AlertCircle className="w-7 h-7" style={{ color: siteTones.services.accent }} />
      </div>
      <p className="text-base font-display mb-2">Preview not available</p>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
        The interactive preview couldn't be generated right now. This is usually temporary.
        You can try again or continue chatting to refine the idea.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
        <Link
          href={agentHref}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
        >
          <User className="w-3.5 h-3.5" />
          Talk to agent
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mt-6 font-mono opacity-50">
        preview · unavailable
      </p>
    </div>
  );
}

// ============================================================================
// VersionSwitcher — chips for v1, v2, v3 Current
// ============================================================================

function VersionSwitcher({
  versions,
  selectedIndex,
  onSelect,
}: {
  versions: PrototypeVersion[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  if (versions.length <= 1) return null;

  const latestIndex = versions.length - 1;

  return (
    <div className="flex items-center gap-1">
      {versions.map((v, i) => {
        const isSelected = i === selectedIndex;
        const isLatest = i === latestIndex;

        return (
          <button
            key={v.versionNumber}
            type="button"
            onClick={() => onSelect(i)}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono transition-all"
            style={
              isSelected
                ? { backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }
                : { backgroundColor: siteTones.brand.surface, color: "var(--muted-foreground)", border: `1px solid ${siteTones.brand.border}` }
            }
          >
            v{v.versionNumber}
            {isLatest && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: isSelected ? siteTones.brand.contrast : siteTones.brand.accent }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// CorrectionInput
// ============================================================================

function CorrectionInput({
  onSubmit,
  remaining,
}: {
  onSubmit: (prompt: string) => void;
  remaining: number;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="px-4 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground mb-2">
        What would you like adjusted?{" "}
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
              setValue("");
            }
          }}
          placeholder="e.g. Make the header darker, add a pricing section..."
          rows={2}
          className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50"
        />
        <button
          type="button"
          onClick={() => {
            if (value.trim()) {
              onSubmit(value.trim());
              setValue("");
            }
          }}
          disabled={!value.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 self-end shrink-0"
          style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// StudioPreviewPane
// ============================================================================

type StudioPreviewPaneProps = {
  prototypeVersions: PrototypeVersion[];
  selectedVersionIndex: number;
  onSelectVersion: (index: number) => void;
  phase: StudioPhase;
  prototypeFailed: boolean;
  correctionsUsed: number;
  maxCorrections: number;
  onApprove: () => void;
  onRequestCorrection: (prompt: string) => void;
  onRequestProposal: () => void;
  onRetryPrototype: () => void;
  agentHref: string;
};

export function StudioPreviewPane({
  prototypeVersions,
  selectedVersionIndex,
  onSelectVersion,
  phase,
  prototypeFailed,
  correctionsUsed,
  maxCorrections,
  onApprove,
  onRequestCorrection,
  onRequestProposal,
  onRetryPrototype,
  agentHref,
}: StudioPreviewPaneProps) {
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  const currentVersion = prototypeVersions[prototypeVersions.length - 1] ?? null;
  const selectedVersion = prototypeVersions[selectedVersionIndex] ?? currentVersion;

  const canCorrect =
    phase === "prototype_ready" && correctionsUsed < maxCorrections;
  const canApprove = phase === "prototype_ready";
  const canRequestProposal = phase === "approved_for_proposal";
  const isRevising = phase === "revision_requested";
  const isPendingReview = phase === "proposal_pending_review" || phase === "proposal_sent";
  const correctionsExhausted = correctionsUsed >= maxCorrections;

  // Reset correction input when phase leaves prototype_ready
  useEffect(() => {
    if (phase !== "prototype_ready") setShowCorrectionInput(false);
  }, [phase]);

  if (!currentVersion) {
    return (
      <div
        className="h-full"
        style={{ backgroundColor: siteTones.brand.mutedSurface ?? "var(--secondary)" }}
      >
        {prototypeFailed ? (
          <PreviewFailed onRetry={onRetryPrototype} agentHref={agentHref} />
        ) : (
          <PreviewPlaceholder phase={phase} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Preview bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b shrink-0 gap-3"
        style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
      >
        {/* Left: traffic lights + version switcher or status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>

          {isRevising ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-muted-foreground">Applying adjustment...</span>
              <Loader2 className="w-3 h-3 animate-spin" style={{ color: siteTones.brand.accent }} />
            </div>
          ) : (
            <VersionSwitcher
              versions={prototypeVersions}
              selectedIndex={selectedVersionIndex}
              onSelect={onSelectVersion}
            />
          )}

          {/* Fallback label when only one version and not revising */}
          {!isRevising && prototypeVersions.length === 1 && (
            <span className="text-xs font-mono text-muted-foreground">
              Version {currentVersion.versionNumber}
            </span>
          )}
        </div>

        {/* Right: open full screen */}
        <a
          href={selectedVersion.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Open full screen
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Corrections exhausted banner */}
      {correctionsExhausted && canApprove && (
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 border-b shrink-0 text-xs"
          style={{
            backgroundColor: siteTones.services.surface,
            borderColor: siteTones.services.border,
            color: siteTones.services.accent,
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Adjustments complete — approve to move forward or request the formal proposal.</span>
        </div>
      )}

      {/* iframe (desktop) / open card (mobile) */}
      <div className="flex-1 relative overflow-hidden">
        {isRevising && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: siteTones.brand.accent }} />
              <p className="text-sm text-muted-foreground">Applying adjustment...</p>
            </div>
          </div>
        )}
        {/* Desktop: iframe */}
        <iframe
          src={selectedVersion.demoUrl}
          className="hidden lg:block w-full h-full border-0"
          title={`Maxwell prototype version ${selectedVersion.versionNumber}`}
        />
        {/* Mobile: open-in-browser card */}
        <div
          className="flex lg:hidden flex-col items-center justify-center h-full px-8 text-center"
          style={{ backgroundColor: siteTones.brand.mutedSurface ?? "var(--secondary)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-5"
            style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
          >
            <Smartphone className="w-7 h-7" style={{ color: siteTones.brand.accent }} />
          </div>
          <p className="text-base font-display mb-2">
            Version {selectedVersion.versionNumber} ready
          </p>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
            The prototype opens in your browser for the best experience on mobile.
          </p>
          <a
            href={selectedVersion.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
          >
            <ExternalLink className="w-4 h-4" />
            Open prototype
          </a>
          <p className="text-xs text-muted-foreground mt-4 font-mono opacity-50">
            opens in a new tab
          </p>
        </div>
      </div>

      {/* Actions bar */}
      {(canApprove || canRequestProposal || isPendingReview) && (
        <div
          className="shrink-0 border-t"
          style={{ borderColor: siteTones.brand.border }}
        >
          {/* Prototype ready — approve or adjust */}
          {canApprove && !showCorrectionInput && (
            <div
              className="flex flex-wrap items-center gap-3 px-4 py-3"
              style={{ backgroundColor: siteTones.brand.surface }}
            >
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
                    className="text-xs rounded-full px-1.5 py-0.5 font-mono"
                    style={{ backgroundColor: siteTones.brand.surface, color: siteTones.brand.accent }}
                  >
                    {maxCorrections - correctionsUsed} left
                  </span>
                </button>
              )}

              <Link
                href={agentHref}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
              >
                <User className="w-3 h-3" />
                Talk to agent
              </Link>
            </div>
          )}

          {/* Correction input */}
          {canApprove && showCorrectionInput && (
            <CorrectionInput
              remaining={maxCorrections - correctionsUsed}
              onSubmit={(prompt) => {
                setShowCorrectionInput(false);
                onRequestCorrection(prompt);
              }}
            />
          )}

          {/* Approved — request proposal */}
          {canRequestProposal && (
            <div
              className="px-4 py-4"
              style={{ backgroundColor: siteTones.brand.surface }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: siteTones.brandDeep.accent }}>
                Prototype approved
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Request the formal proposal — the Noon team reviews it before sending.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onRequestProposal}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
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
          )}

          {/* Proposal in review */}
          {isPendingReview && (
            <div
              className="flex items-start gap-3 px-4 py-4"
              style={{ backgroundColor: siteTones.brand.surface }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: siteTones.brand.accent }}
              >
                <User className="w-4 h-4" style={{ color: siteTones.brand.contrast }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5">Proposal under review</p>
                <p className="text-xs text-muted-foreground">
                  A Noon Project Manager is reviewing this before sending it to you. You'll receive it shortly.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { siteTones } from "@/lib/site-tones";
import { StudioThinkingBlock } from "./studio-thinking-block";
import { StudioCorrectionBar } from "./studio-correction-bar";
import { StudioProposalCta } from "./studio-proposal-cta";
import type { ChatMessage, StudioPhase } from "./studio-shell";

// ============================================================================
// Message sub-components
// ============================================================================

function ThinkingDots() {
  return (
    <div className="flex justify-start">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 mr-3 mt-0.5"
        style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: siteTones.brand.accent }} />
      </div>
      <div
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3"
        style={{
          backgroundColor: siteTones.brand.surface,
          border: `1px solid ${siteTones.brand.border}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: siteTones.brand.accent,
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 mr-3 mt-0.5"
        style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: siteTones.brand.accent }} />
      </div>
      <div
        className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
        style={{
          backgroundColor: siteTones.brand.surface,
          border: `1px solid ${siteTones.brand.border}`,
          color: siteTones.brandDeep.accent,
        }}
      >
        {content}
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground">
        {content}
      </div>
    </div>
  );
}

// ============================================================================
// StudioChatPane
// ============================================================================

type StudioChatPaneProps = {
  messages: ChatMessage[];
  isThinking: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  canSend: boolean;
  // Phase-aware props
  phase: StudioPhase;
  correctionsUsed: number;
  maxCorrections: number;
  prototypeVersionNumber: number;
  onApprove: () => void;
  onRequestCorrection: (prompt: string) => void;
  onRequestProposal: () => void;
  agentHref: string;
};

export function StudioChatPane({
  messages,
  isThinking,
  input,
  onInputChange,
  onSend,
  inputRef,
  canSend,
  phase,
  correctionsUsed,
  maxCorrections,
  prototypeVersionNumber,
  onApprove,
  onRequestCorrection,
  onRequestProposal,
  agentHref,
}: StudioChatPaneProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const showActionZone =
    phase === "prototype_ready" ||
    phase === "revision_requested" ||
    phase === "approved_for_proposal" ||
    phase === "proposal_pending_review" ||
    phase === "proposal_sent" ||
    phase === "generating_prototype";

  const showCorrectionBar =
    prototypeVersionNumber > 0 &&
    (phase === "prototype_ready" ||
      phase === "revision_requested" ||
      phase === "approved_for_proposal");

  // Scroll to bottom on new messages or phase change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, phase]);

  // Focus input when idle
  useEffect(() => {
    if (canSend) setTimeout(() => inputRef.current?.focus(), 50);
  }, [canSend, inputRef]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => {
          if (msg.role === "user") return <UserMessage key={i} content={msg.content} />;
          if (msg.type === "thinking") return <StudioThinkingBlock key={i} content={msg.content} />;
          return <AssistantMessage key={i} content={msg.content} />;
        })}
        {isThinking && <ThinkingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Correction bar — version + dot indicators */}
      {showCorrectionBar && (
        <StudioCorrectionBar
          phase={phase}
          versionNumber={prototypeVersionNumber}
          correctionsUsed={correctionsUsed}
          maxCorrections={maxCorrections}
        />
      )}

      {/* Action zone — CTAs for prototype_ready, approved, proposal states */}
      {showActionZone && (
        <div className="shrink-0 px-4 py-3 border-t border-border">
          <StudioProposalCta
            phase={phase}
            correctionsUsed={correctionsUsed}
            maxCorrections={maxCorrections}
            onApprove={onApprove}
            onRequestCorrection={onRequestCorrection}
            onRequestProposal={onRequestProposal}
            agentHref={agentHref}
          />
        </div>
      )}

      {/* Text input */}
      {canSend && (
        <div className="shrink-0 border-t border-border px-3 py-3 sm:px-4">
          <div className="flex gap-3 items-end rounded-xl border border-border bg-secondary/20 px-3 py-2.5 sm:px-4 sm:py-3 focus-within:border-foreground/20 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !("ontouchstart" in window)) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Reply to Maxwell..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 max-h-32"
            />
            <button
              type="button"
              onClick={onSend}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
              style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

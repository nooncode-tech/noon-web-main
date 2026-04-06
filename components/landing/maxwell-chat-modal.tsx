"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, LoaderCircle, Sparkles, X,
  ExternalLink, CheckCircle, RotateCcw, FileText, User,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { getContactHref } from "@/lib/site-config";
import { siteStatusTones, siteTones } from "@/lib/site-tones";

// ============================================================================
// Types
// ============================================================================

type ChatMessage = { role: "user" | "assistant"; content: string };

type Phase =
  | "discovery"           // Maxwell asking questions
  | "generating"          // Maxwell building prototype (silently uses V0)
  | "prototype_shown"     // Prototype visible — can correct or approve
  | "approved"            // Prototype approved — can request proposal
  | "generating_proposal" // Generating proposal
  | "proposal_shown";     // Proposal ready

type MaxwellChatModalProps = {
  isOpen: boolean;
  initialPrompt: string;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
};

const MAX_CORRECTIONS = 2;

// ============================================================================
// Helpers
// ============================================================================

function PhaseBar({ phase }: { phase: Phase }) {
  const steps = [
    { keys: ["discovery", "generating"] as Phase[], label: "Discovery" },
    { keys: ["prototype_shown", "approved"] as Phase[], label: "Prototype" },
    { keys: ["generating_proposal", "proposal_shown"] as Phase[], label: "Proposal" },
  ];

  const activeIndex = steps.findIndex((s) => (s.keys as string[]).includes(phase));

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i <= activeIndex ? siteTones.brand.accent : siteTones.brand.border }}
            />
            <span
              className="text-xs transition-colors duration-300"
              style={{ color: i <= activeIndex ? siteTones.brand.accent : "var(--muted-foreground)" }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-6 h-px transition-colors duration-300"
              style={{ backgroundColor: i < activeIndex ? siteTones.brand.accent : siteTones.brand.border }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function TypingDots() {
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
        style={{ backgroundColor: siteTones.brand.surface, border: `1px solid ${siteTones.brand.border}` }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: siteTones.brand.accent, animationDelay: `${i * 150}ms` }}
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
        className="max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
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
      <div className="max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground">
        {content}
      </div>
    </div>
  );
}

// ============================================================================
// Main
// ============================================================================

export function MaxwellChatModal({
  isOpen,
  initialPrompt,
  onClose,
  onOpenChange,
}: MaxwellChatModalProps) {
  const [phase, setPhase] = useState<Phase>("discovery");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  // Prototype (internal — client never sees V0)
  const [prototypeState, setPrototypeState] = useState<{ chatId: string; demoUrl: string } | null>(null);
  const [correctionsUsed, setCorrectionsUsed] = useState(0);
  const [correctionInput, setCorrectionInput] = useState("");
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  // Proposal
  const [proposal, setProposal] = useState<string | null>(null);
  const [proposalExpanded, setProposalExpanded] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevPromptRef = useRef("");

  const contactHref = getContactHref({ inquiry: "new-project", draft: initialPrompt, source: "maxwell" });
  const agentHref = getContactHref({ inquiry: "new-project", draft: initialPrompt, source: "maxwell-agent" });

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isThinking, phase]);

  // Focus input
  useEffect(() => {
    if (isOpen && !isThinking && phase === "discovery") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isThinking, phase]);

  // Escape + nav hide
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.addEventListener("keydown", handler);
      document.body.classList.add("maxwell-open");
    } else {
      document.body.classList.remove("maxwell-open");
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.classList.remove("maxwell-open");
    };
  }, [isOpen, onClose]);

  // Reset when a new prompt starts
  useEffect(() => {
    if (initialPrompt && initialPrompt !== prevPromptRef.current) {
      prevPromptRef.current = initialPrompt;
      setPhase("discovery");
      setChatHistory([]);
      setHasStarted(false);
      setFollowUp("");
      setPrototypeState(null);
      setCorrectionsUsed(0);
      setCorrectionInput("");
      setShowCorrectionInput(false);
      setProposal(null);
    }
  }, [initialPrompt]);

  // Kick off conversation
  useEffect(() => {
    if (!isOpen || !initialPrompt || hasStarted) return;
    setHasStarted(true);
    const userMsg: ChatMessage = { role: "user", content: initialPrompt };
    setChatHistory([userMsg]);
    void persistSession(initialPrompt);
    void sendToMaxwell(initialPrompt, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialPrompt]);

  async function persistSession(p: string) {
    try {
      await fetch("/api/maxwell/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p, source: "maxwell" }),
      });
    } catch { /* silent */ }
  }

  // Send message to Maxwell (OpenAI). If readyForPrototype, silently trigger V0.
  async function sendToMaxwell(userMessage: string, history: ChatMessage[]) {
    setIsThinking(true);
    try {
      const res = await fetch("/api/maxwell/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage, history }),
      });
      const data = (await res.json()) as {
        reply?: string;
        message?: string;
        readyForPrototype?: boolean;
      };
      const reply = data.reply ?? data.message ?? "I couldn't respond right now. Please try again.";

      setChatHistory((prev) => [...prev, { role: "assistant", content: reply }]);

      // If Maxwell is ready → silently build prototype in background
      if (data.readyForPrototype) {
        void buildPrototypeSilently([...history, { role: "user", content: userMessage }, { role: "assistant", content: reply }]);
      }
    } finally {
      setIsThinking(false);
    }
  }

  // Build prototype with V0 — client only sees Maxwell messages
  async function buildPrototypeSilently(history: ChatMessage[]) {
    setPhase("generating");

    // Maxwell announces it's working
    const buildingMsg = "Give me a moment — I'm putting together an initial version of what we discussed.";
    setChatHistory((prev) => [...prev, { role: "assistant", content: buildingMsg }]);

    try {
      const contextPrompt = history
        .map((m) => `${m.role === "user" ? "Client" : "Maxwell"}: ${m.content}`)
        .join("\n");

      const res = await fetch("/api/maxwell/prototype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          prompt: `Based on this conversation, create a prototype:\n\n${contextPrompt}`,
        }),
      });
      const data = (await res.json()) as { chatId?: string; demoUrl?: string };

      if (data.chatId && data.demoUrl) {
        setPrototypeState({ chatId: data.chatId, demoUrl: data.demoUrl });
        setPhase("prototype_shown");
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Here's an initial version based on everything we've discussed. Take a look — you can ask me to adjust anything before we move forward.",
          },
        ]);
      } else {
        setPhase("discovery");
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I wasn't able to generate the initial version right now. Let's keep refining the idea and I'll try again shortly.",
          },
        ]);
      }
    } catch {
      setPhase("discovery");
    }
  }

  function handleFollowUp() {
    const msg = followUp.trim();
    if (!msg || isThinking) return;
    setFollowUp("");
    const updated: ChatMessage[] = [...chatHistory, { role: "user", content: msg }];
    setChatHistory(updated);
    void sendToMaxwell(msg, chatHistory);
  }

  async function handleRequestCorrection() {
    const msg = correctionInput.trim();
    if (!msg || !prototypeState) return;
    const newCount = correctionsUsed + 1;
    setCorrectionsUsed(newCount);
    setCorrectionInput("");
    setShowCorrectionInput(false);
    setPhase("generating");

    setChatHistory((prev) => [...prev, { role: "user", content: msg }]);
    setChatHistory((prev) => [
      ...prev,
      { role: "assistant", content: "Got it — let me adjust that for you." },
    ]);

    try {
      const res = await fetch("/api/maxwell/prototype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", chatId: prototypeState.chatId, prompt: msg }),
      });
      const data = (await res.json()) as { chatId?: string; demoUrl?: string };
      if (data.demoUrl) setPrototypeState({ chatId: prototypeState.chatId, demoUrl: data.demoUrl });
      setPhase("prototype_shown");

      const remaining = MAX_CORRECTIONS - newCount;
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            remaining > 0
              ? `Here's the updated version. You have ${remaining} more adjustment${remaining === 1 ? "" : "s"} available before we finalize it.`
              : "Here's the updated version. This is the final revision — ready to approve and move forward whenever you are.",
        },
      ]);
    } catch {
      setPhase("prototype_shown");
    }
  }

  function handleApprovePrototype() {
    setPhase("approved");
    setChatHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "The initial version is approved. Whenever you're ready, I can put together the formal proposal — scope, deliverables, timeline, and payment options. The Noon team will review it before it reaches you.",
      },
    ]);
  }

  async function handleRequestProposal() {
    setPhase("generating_proposal");
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: "I'd like to receive the formal proposal." },
      {
        role: "assistant",
        content:
          "On it. I'm drafting the proposal now based on everything we've covered.",
      },
    ]);

    try {
      const res = await fetch("/api/maxwell/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: chatHistory, initialPrompt }),
      });
      const data = (await res.json()) as { proposal?: string };
      if (data.proposal) {
        setProposal(data.proposal);
        setPhase("proposal_shown");
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Here's your proposal. Before it's formally sent, a Noon Project Manager will review it to make sure everything is clear and aligned. You'll receive the final version shortly after.\n\nIf you'd prefer to speak directly with someone from the team, you can always reach out to a human agent.",
          },
        ]);
      }
    } catch {
      setPhase("approved");
    }
  }

  if (!initialPrompt) return null;

  const canCorrect = phase === "prototype_shown" && correctionsUsed < MAX_CORRECTIONS;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10 transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 flex flex-col w-full h-full max-w-5xl rounded-2xl overflow-hidden border border-border shadow-2xl"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 px-6 py-4 border-b border-border shrink-0"
          style={{ backgroundColor: siteTones.brand.surface }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0"
            style={{ backgroundColor: siteTones.brand.accent, borderColor: siteTones.brand.border }}
          >
            <Sparkles className="w-4 h-4" style={{ color: siteTones.brand.contrast }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-display leading-none mb-1">Maxwell</p>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: siteStatusTones.availability.accent }}
              />
              <span className="text-xs text-muted-foreground">
                {isThinking || phase === "generating" || phase === "generating_proposal"
                  ? "Working on it..."
                  : "Available · Noon AI assistant"}
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <PhaseBar phase={phase} />
          </div>

          <Link
            href={agentHref}
            onClick={onClose}
            className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 text-xs text-muted-foreground transition-colors hover:bg-secondary"
          >
            <User className="w-3 h-3" />
            Talk to an agent
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {chatHistory.map((msg, i) =>
              msg.role === "user"
                ? <UserMessage key={i} content={msg.content} />
                : <AssistantMessage key={i} content={msg.content} />
            )}

            {(isThinking || phase === "generating" || phase === "generating_proposal") && (
              <TypingDots />
            )}

            {/* Prototype viewer */}
            {(phase === "prototype_shown" || phase === "approved") && prototypeState && (
              <div className="rounded-2xl border border-border overflow-hidden">
                {/* Bar */}
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      preview · version {correctionsUsed + 1}
                    </span>
                  </div>
                  <a
                    href={prototypeState.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Open full screen
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* iframe */}
                <iframe
                  src={prototypeState.demoUrl}
                  className="w-full border-0"
                  style={{ height: "320px" }}
                  title="Maxwell preview"
                />

                {/* Actions */}
                {phase === "prototype_shown" && (
                  <>
                    <div
                      className="flex flex-wrap items-center gap-3 px-4 py-3 border-t"
                      style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
                    >
                      <button
                        type="button"
                        onClick={handleApprovePrototype}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                        style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Looks good — approve
                      </button>

                      {canCorrect && (
                        <button
                          type="button"
                          onClick={() => setShowCorrectionInput((v) => !v)}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Request an adjustment
                          <span
                            className="text-xs rounded-full px-1.5 py-0.5"
                            style={{ backgroundColor: siteTones.brand.surface, color: siteTones.brand.accent }}
                          >
                            {MAX_CORRECTIONS - correctionsUsed} left
                          </span>
                        </button>
                      )}
                    </div>

                    {showCorrectionInput && (
                      <div className="px-4 py-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">What would you like me to adjust?</p>
                        <div className="flex gap-2">
                          <textarea
                            value={correctionInput}
                            onChange={(e) => setCorrectionInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void handleRequestCorrection();
                              }
                            }}
                            placeholder="e.g. Make the colors darker, add a pricing section..."
                            rows={2}
                            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50"
                          />
                          <button
                            type="button"
                            onClick={handleRequestCorrection}
                            disabled={!correctionInput.trim()}
                            className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
                            style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Request proposal CTA */}
            {phase === "approved" && (
              <div
                className="rounded-2xl p-5 border"
                style={{ backgroundColor: siteTones.brand.surface, borderColor: siteTones.brand.border }}
              >
                <p className="text-sm font-medium mb-1" style={{ color: siteTones.brandDeep.accent }}>
                  Ready for the next step
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Request the formal proposal and the Noon team will review it before sending it to you.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleRequestProposal}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                    style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
                  >
                    <FileText className="w-4 h-4" />
                    Request formal proposal
                  </button>
                  <Link
                    href={agentHref}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Talk to an agent instead
                  </Link>
                </div>
              </div>
            )}

            {/* Proposal */}
            {phase === "proposal_shown" && proposal && (
              <div className="rounded-2xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setProposalExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 border-b border-border text-sm font-medium hover:bg-secondary/30 transition-colors"
                  style={{ backgroundColor: siteTones.brand.surface }}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: siteTones.brand.accent }} />
                    Draft Proposal — Under PM Review
                  </div>
                  {proposalExpanded
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {proposalExpanded && (
                  <div className="px-5 py-4">
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap mb-4"
                      style={{ color: siteTones.brandDeep.accent }}
                    >
                      {proposal}
                    </div>

                    <div
                      className="flex items-start gap-3 rounded-xl p-4 mb-4"
                      style={{ backgroundColor: siteTones.brand.surface, border: `1px solid ${siteTones.brand.border}` }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: siteTones.brand.accent }}
                      >
                        <User className="w-3.5 h-3.5" style={{ color: siteTones.brand.contrast }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-0.5">Under PM Review</p>
                        <p className="text-xs text-muted-foreground">
                          A Noon Project Manager is reviewing this to ensure everything is clear and aligned before it's formally sent to you.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={contactHref}
                        onClick={onClose}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                        style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
                      >
                        Continue with Contact
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href={agentHref}
                        onClick={onClose}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Talk to an agent
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input */}
        {(phase === "discovery" || phase === "prototype_shown" || phase === "approved") && !isThinking && (
          <div className="shrink-0 border-t border-border px-6 py-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3 items-end rounded-xl border border-border bg-secondary/20 px-4 py-3 focus-within:border-foreground/20 transition-colors">
                <textarea
                  ref={inputRef}
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleFollowUp();
                    }
                  }}
                  placeholder="Reply to Maxwell... (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 max-h-32"
                />
                <button
                  type="button"
                  onClick={handleFollowUp}
                  disabled={!followUp.trim()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                  style={{ backgroundColor: siteTones.brand.accent, color: siteTones.brand.contrast }}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

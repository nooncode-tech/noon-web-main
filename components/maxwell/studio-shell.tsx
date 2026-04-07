"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StudioHeader } from "./studio-header";
import { StudioChatPane } from "./studio-chat-pane";
import { StudioPreviewPane } from "./studio-preview-pane";
import { getContactHref, siteRoutes } from "@/lib/site-config";

// ============================================================================
// Types
// ============================================================================

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  type?: "chat" | "thinking" | "system_event";
};

export type StudioPhase =
  | "intake"
  | "clarifying"
  | "generating_prototype"
  | "prototype_ready"
  | "revision_requested"
  | "revision_applied"
  | "approved_for_proposal"
  | "proposal_pending_review"
  | "proposal_sent"
  | "converted";

export type PrototypeVersion = {
  chatId: string;
  demoUrl: string;
  versionNumber: number;
};

export type ActiveView = "chat" | "preview";

const MAX_CORRECTIONS = 2;

// ============================================================================
// StudioShell
// ============================================================================

type StudioShellProps = {
  initialPrompt: string;
  initialSessionId?: string;
  viewerEmail: string;
};

export function StudioShell({
  initialPrompt,
  initialSessionId,
  viewerEmail,
}: StudioShellProps) {
  const router = useRouter();

  // Phase & state
  const [phase, setPhase] = useState<StudioPhase>("intake");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRehydrating, setIsRehydrating] = useState(!!initialSessionId);
  const [input, setInput] = useState("");

  // Session (persisted in DB)
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);

  // Prototype
  const [prototypeVersions, setPrototypeVersions] = useState<PrototypeVersion[]>([]);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(0);
  const [correctionsUsed, setCorrectionsUsed] = useState(0);
  const [activeView, setActiveView] = useState<ActiveView>("chat");
  const [prototypeFailed, setPrototypeFailed] = useState(false);

  // Project name (Maxwell will eventually extract this)
  const [projectName, setProjectName] = useState<string>("");

  // Derived
  const currentVersion = prototypeVersions[prototypeVersions.length - 1] ?? null;
  const selectedVersion = prototypeVersions[selectedVersionIndex] ?? currentVersion;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasStartedRef = useRef(false);

  const agentHref = getContactHref({
    inquiry: "new-project",
    draft: initialPrompt,
    source: "maxwell-studio-agent",
  });

  // ── URL persistence: once we have a session_id, embed it in the URL ────────

  useEffect(() => {
    if (sessionId && !initialSessionId) {
      router.replace(`${siteRoutes.maxwellStudio}?session_id=${sessionId}`);
    }
    // Only runs when sessionId is first set from a new session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Kick off on mount ──────────────────────────────────────────────────────

  useEffect(() => {
    if (hasStartedRef.current) return;

    // Rehydration path: restore from DB
    if (initialSessionId) {
      hasStartedRef.current = true;
      void rehydrateSession(initialSessionId);
      return;
    }

    // Fresh session path: start conversation with prompt
    if (!initialPrompt.trim()) {
      router.replace(siteRoutes.maxwell);
      return;
    }

    hasStartedRef.current = true;
    setMessages([{ role: "user", content: initialPrompt }]);
    setPhase("clarifying");
    void sendToMaxwell(initialPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, initialSessionId]);

  // Switch to preview tab when first prototype arrives (mobile UX)
  useEffect(() => {
    if (prototypeVersions.length > 0) {
      setActiveView("preview");
      // Always select the latest version when a new one is added
      setSelectedVersionIndex(prototypeVersions.length - 1);
    }
  }, [prototypeVersions.length]);

  // ── Rehydration ─────────────────────────────────────────────────────────────

  async function rehydrateSession(id: string) {
    setIsRehydrating(true);
    try {
      const res = await fetch(`/api/maxwell/studio/session?session_id=${id}`);
      if (!res.ok) {
        router.replace(siteRoutes.maxwell);
        return;
      }

      const data = (await res.json()) as {
        session: {
          id: string;
          status: StudioPhase;
          goalSummary: string | null;
          correctionsUsed: number;
          maxCorrections: number;
        };
        messages: ChatMessage[];
        versions: PrototypeVersion[];
      };

      setSessionId(data.session.id);
      setPhase(data.session.status);
      setProjectName(data.session.goalSummary ?? "");
      setCorrectionsUsed(data.session.correctionsUsed);
      setMessages(data.messages);
      setPrototypeVersions(data.versions);

      if (data.versions.length > 0) {
        setSelectedVersionIndex(data.versions.length - 1);
        setActiveView("preview");
      }
    } catch {
      router.replace(siteRoutes.maxwell);
    } finally {
      setIsRehydrating(false);
    }
  }

  // ── Chat ────────────────────────────────────────────────────────────────────

  async function sendToMaxwell(userMessage: string) {
    setIsThinking(true);
    try {
      const res = await fetch("/api/maxwell/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          ...(sessionId ? { session_id: sessionId } : {}),
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        thinking?: string | null;
        message?: string;
        readyForPrototype?: boolean;
        session_id?: string;
        project_name?: string | null;
        corrections_used?: number;
      };

      // Store session_id on first response
      const effectiveSessionId = data.session_id ?? sessionId;
      if (data.session_id && !sessionId) setSessionId(data.session_id);

      // Update project name if Maxwell extracted one
      if (data.project_name && !projectName) {
        setProjectName(data.project_name);
      }

      const reply =
        data.reply ?? data.message ?? "Maxwell couldn't respond right now. Please try again.";

      // Show thinking block before the reply if present
      setMessages((prev) => [
        ...prev,
        ...(data.thinking ? [{ role: "assistant" as const, content: data.thinking, type: "thinking" as const }] : []),
        { role: "assistant", content: reply },
      ]);

      if (data.readyForPrototype) {
        void buildPrototype(userMessage, reply, effectiveSessionId ?? null);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maxwell couldn't respond right now. Your session is preserved — please try again.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleSend() {
    const msg = input.trim();
    if (!msg || isThinking) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    void sendToMaxwell(msg);
  }

  // ── Prototype ────────────────────────────────────────────────────────────────

  async function buildPrototype(
    lastUserMsg: string,
    lastAssistantMsg: string,
    effectiveSessionId: string | null,
  ) {
    setPhase("generating_prototype");
    setPrototypeFailed(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Give me a moment — I'm putting together an initial version based on what we've discussed.",
        type: "system_event",
      },
    ]);

    try {
      // Build context from current UI messages
      const contextLines = messages
        .concat(
          { role: "user", content: lastUserMsg },
          { role: "assistant", content: lastAssistantMsg }
        )
        .map((m) => `${m.role === "user" ? "Client" : "Maxwell"}: ${m.content}`)
        .join("\n");

      const res = await fetch("/api/maxwell/prototype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          prompt: `Based on this conversation, create a prototype:\n\n${contextLines}`,
          ...(effectiveSessionId ? { session_id: effectiveSessionId } : {}),
        }),
      });
      const data = (await res.json()) as {
        chatId?: string;
        demoUrl?: string;
        version_number?: number;
        corrections_used?: number;
        message?: string;
      };

      if (data.chatId && data.demoUrl) {
        const newVersion: PrototypeVersion = {
          chatId: data.chatId,
          demoUrl: data.demoUrl,
          versionNumber: data.version_number ?? 1,
        };
        setPrototypeVersions((prev) => [...prev, newVersion]);
        if (data.corrections_used !== undefined) setCorrectionsUsed(data.corrections_used);
        setPhase("prototype_ready");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Here's Version 1 based on everything we've covered. Take a look — you can request up to 2 adjustments before moving to the proposal.",
          },
        ]);
      } else {
        setPhase("clarifying");
        setPrototypeFailed(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I wasn't able to generate the preview right now — it may be a temporary issue. You can try again or continue chatting to refine the idea.",
          },
        ]);
      }
    } catch {
      setPhase("clarifying");
      setPrototypeFailed(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "The preview couldn't be generated right now. Your session is intact — you can try again or continue chatting.",
        },
      ]);
    }
  }

  // ── Corrections ────────────────────────────────────────────────────────────

  async function handleRequestCorrection(correctionPrompt: string) {
    if (!currentVersion || correctionsUsed >= MAX_CORRECTIONS) return;

    setPhase("revision_requested");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: correctionPrompt },
      { role: "assistant", content: "Got it — adjusting that for you." },
    ]);

    try {
      const res = await fetch("/api/maxwell/prototype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          chatId: currentVersion.chatId,
          prompt: correctionPrompt,
          ...(sessionId ? { session_id: sessionId } : {}),
        }),
      });
      const data = (await res.json()) as {
        chatId?: string;
        demoUrl?: string;
        version_number?: number;
        corrections_used?: number;
        code?: string;
        message?: string;
      };

      // Hard guard hit on server
      if (data.code === "MAX_CORRECTIONS_REACHED") {
        setPhase("prototype_ready");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message ?? "No more adjustments available." },
        ]);
        return;
      }

      if (data.demoUrl && currentVersion) {
        const updatedVersion: PrototypeVersion = {
          chatId: currentVersion.chatId,
          demoUrl: data.demoUrl,
          versionNumber: data.version_number ?? currentVersion.versionNumber + 1,
        };
        setPrototypeVersions((prev) => [...prev, updatedVersion]);
      }

      const newCount = data.corrections_used ?? correctionsUsed + 1;
      setCorrectionsUsed(newCount);
      setPhase("prototype_ready");

      const remaining = MAX_CORRECTIONS - newCount;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            remaining > 0
              ? `Here's the updated version (Version ${data.version_number ?? (currentVersion?.versionNumber ?? 0) + 1}). You have ${remaining} adjustment${remaining === 1 ? "" : "s"} remaining.`
              : "Here's the final adjusted version. Adjustments are complete — approve to move forward or request the formal proposal.",
        },
      ]);
    } catch {
      setPhase("prototype_ready");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "The adjustment didn't go through. Your session is intact — please try again.",
        },
      ]);
    }
  }

  // ── Approve ────────────────────────────────────────────────────────────────

  function handleApprove() {
    setPhase("approved_for_proposal");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Prototype approved. Whenever you're ready, request the formal proposal — scope, deliverables, timeline, and investment. The Noon team reviews it before it reaches you.",
      },
    ]);
  }

  // ── Proposal ───────────────────────────────────────────────────────────────

  async function handleRequestProposal() {
    setPhase("proposal_pending_review");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "I'd like the formal proposal." },
      {
        role: "assistant",
        content: "On it — drafting the proposal based on everything we've covered.",
      },
    ]);

    try {
      const body = sessionId
        ? { session_id: sessionId }
        : { history: messages, initialPrompt };

      const res = await fetch("/api/maxwell/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        // Studio path
        proposal_request_id?: string;
        status?: string;
        // Legacy path
        proposal?: string;
        message?: string;
      };

      if (data.proposal_request_id || data.proposal) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Your proposal has been drafted and is now in review with the Noon team. A Project Manager will verify everything before the formal version is sent by email. For standard cases, that usually happens in under 20 minutes.\n\nIf you'd prefer to speak directly with someone, use the 'Talk to agent' button above.",
          },
        ]);
      }
    } catch {
      setPhase("approved_for_proposal");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Couldn't generate the proposal right now. Please try again.",
        },
      ]);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isRehydrating) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-sm">Restoring your session…</p>
        </div>
      </div>
    );
  }

  const canSendMessage =
    phase === "intake" ||
    phase === "clarifying" ||
    phase === "prototype_ready" ||
    phase === "approved_for_proposal";

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <StudioHeader
        projectName={projectName}
        phase={phase}
        correctionsUsed={correctionsUsed}
        maxCorrections={MAX_CORRECTIONS}
        agentHref={agentHref}
        viewerEmail={viewerEmail}
        activeView={activeView}
        onToggleView={setActiveView}
        hasPrototype={prototypeVersions.length > 0}
      />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat pane — always visible on desktop; toggled on mobile */}
        <div
          className={`
            flex flex-col border-r border-border
            w-full lg:w-[420px] xl:w-[480px] shrink-0
            ${activeView === "chat" ? "flex" : "hidden lg:flex"}
          `}
        >
          <StudioChatPane
            messages={messages}
            isThinking={isThinking}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            inputRef={inputRef}
            canSend={canSendMessage && !isThinking}
            phase={phase}
            correctionsUsed={correctionsUsed}
            maxCorrections={MAX_CORRECTIONS}
            prototypeVersionNumber={currentVersion?.versionNumber ?? 0}
            onApprove={handleApprove}
            onRequestCorrection={handleRequestCorrection}
            onRequestProposal={handleRequestProposal}
            agentHref={agentHref}
          />
        </div>

        {/* Preview pane — fills remaining space on desktop; toggled on mobile */}
        <div
          className={`
            flex-1 flex flex-col
            ${activeView === "preview" ? "flex" : "hidden lg:flex"}
          `}
        >
          <StudioPreviewPane
            prototypeVersions={prototypeVersions}
            selectedVersionIndex={selectedVersionIndex}
            onSelectVersion={setSelectedVersionIndex}
            phase={phase}
            prototypeFailed={prototypeFailed}
            correctionsUsed={correctionsUsed}
            maxCorrections={MAX_CORRECTIONS}
            onApprove={handleApprove}
            onRequestCorrection={handleRequestCorrection}
            onRequestProposal={handleRequestProposal}
            onRetryPrototype={() => {
              const lastUserMsg = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
              const lastAssistantMsg = messages.filter((m) => m.role === "assistant").at(-1)?.content ?? "";
              void buildPrototype(lastUserMsg, lastAssistantMsg, sessionId);
            }}
            agentHref={agentHref}
          />
        </div>
      </div>
    </div>
  );
}

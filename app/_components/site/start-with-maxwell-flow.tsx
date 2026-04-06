"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageCard } from "@/app/_components/site/page-card";
import { getContactHref, siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";

const maxwellPromptSuggestions = [
  "Build a reservation platform for my business",
  "Create an operations dashboard for my team",
  "I need an AI assistant for customer support",
  "Build custom software for my workflow",
];

type MaxwellSessionRecord = {
  id: string;
  prompt: string;
  source: string | null;
  status: string;
  firstPromptCapturedAt: string;
  updatedAt: string;
};

type StartWithMaxwellFlowProps = {
  initialPrompt: string;
};

function formatTimestamp(value?: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function StartWithMaxwellFlow({ initialPrompt }: StartWithMaxwellFlowProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [session, setSession] = useState<MaxwellSessionRecord | null>(null);
  const [isBootstrappingSession, setIsBootstrappingSession] = useState(true);

  const trimmedPrompt = prompt.trim();
  const sessionSavedAt = formatTimestamp(session?.updatedAt);

  const contactHref = useMemo(
    () =>
      getContactHref({
        inquiry: "new-project",
        draft: trimmedPrompt || session?.prompt,
        source: "maxwell",
      }),
    [session?.prompt, trimmedPrompt]
  );

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      try {
        const response = await fetch("/api/maxwell/session", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { session: MaxwellSessionRecord | null };
        if (cancelled || !payload.session) return;
        setSession(payload.session);
        if (!initialPrompt.trim()) {
          setPrompt((current) => (current.trim() ? current : payload.session!.prompt));
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setIsBootstrappingSession(false);
      }
    }
    void loadSession();
    return () => { cancelled = true; };
  }, [initialPrompt]);

  function openMaxwell() {
    if (!trimmedPrompt) return;
    router.push(`${siteRoutes.maxwellStudio}?prompt=${encodeURIComponent(trimmedPrompt)}`);
  }

  const currentDirection = useMemo(() => {
    if (!trimmedPrompt) {
      return "Maxwell uses the first prompt to structure the request and preserve a reliable starting point for the next step.";
    }
    if (session && session.prompt === trimmedPrompt) {
      return "This prompt is already saved in Maxwell, so the same request can continue without retyping it.";
    }
    return "The first prompt can be captured before the next step, so the request stays intact while the session deepens.";
  }, [session, trimmedPrompt]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[10px] border border-border bg-card p-6 lg:p-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-mono text-muted-foreground">
            <Sparkles className="h-4 w-4" style={{ color: siteTones.brand.accent }} />
            Maxwell intake
          </div>

          <h2 className="mb-3 text-2xl font-display lg:text-3xl">Describe what you want to build.</h2>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
            Start with your idea. Maxwell helps structure the request, clarify what needs to be built, and move the conversation toward the right next step.
          </p>

          <div className="rounded-[10px] border border-border bg-background p-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  openMaxwell();
                }
              }}
              placeholder="Describe what you want to build..."
              rows={7}
              className="min-h-[176px] w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/55 lg:text-[15px]"
              aria-label="Project prompt for Maxwell"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {maxwellPromptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="h-11 rounded-full px-6 text-sm"
              onClick={openMaxwell}
              disabled={!trimmedPrompt}
            >
              Start building with Maxwell
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-6 text-sm">
              <Link href={siteRoutes.templates}>View templates</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            You can begin without signing in. This version preserves the first prompt on this device so the next step can continue with the same context.
          </p>
        </div>

        {/* Sidebar */}
        <div className="grid gap-6">
          <PageCard
            eyebrow="Current Direction"
            title={session ? "The first prompt is preserved." : "Maxwell starts with the first prompt."}
            description={currentDirection}
            tone={siteTones.brand}
          >
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Prompt remains editable before you continue.</li>
              <li>The first message is persisted once you confirm it.</li>
              <li>Context can continue into Contact or the next review step.</li>
            </ul>
          </PageCard>

          <PageCard
            eyebrow="Session Continuity"
            title={session ? "Session saved on this device." : "No saved session yet."}
            description={
              session
                ? "Maxwell now has a stored starting point instead of a temporary front-end-only draft."
                : "Once the first prompt is captured, Maxwell will keep that same request available when you return."
            }
            tone={siteTones.brandStructural}
          >
            {isBootstrappingSession ? (
              <p className="text-sm text-muted-foreground">Checking for an existing Maxwell session...</p>
            ) : session ? (
              <div className="space-y-4">
                <div className="rounded-[10px] border border-border bg-background px-4 py-4 text-sm text-muted-foreground">
                  <p className="mb-2 text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
                    Preserved prompt
                  </p>
                  <p className="[overflow-wrap:anywhere] leading-relaxed">{session.prompt}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Session ID:</span> {session.id.slice(0, 8)}
                  </p>
                  {sessionSavedAt ? (
                    <p>
                      <span className="font-medium text-foreground">Last saved:</span> {sessionSavedAt}
                    </p>
                  ) : null}
                </div>
                <Button asChild size="sm" variant="outline" className="h-10 rounded-full px-4 text-sm">
                  <Link href={contactHref}>
                    Continue with Contact
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Save the first prompt to create a persistent Maxwell session before you move forward.
              </p>
            )}
          </PageCard>
        </div>
      </div>

    </>
  );
}

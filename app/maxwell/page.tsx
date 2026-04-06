"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { siteRoutes } from "@/lib/site-config";
import { siteStatusTones, siteTones } from "@/lib/site-tones";

// ============================================================================
// Suggested prompts — 4 examples, concise and direct
// ============================================================================

const SUGGESTED_PROMPTS = [
  "Build a client portal with subscription billing",
  "Create an AI assistant for internal operations",
  "Build a mobile app for field service management",
  "Create an e-commerce platform for my business",
];

// ============================================================================
// Gate component — handles redirect when prompt present
// ============================================================================

function MaxwellGateContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const incomingPrompt = params.get("prompt") ?? "";

  const [prompt, setPrompt] = useState(incomingPrompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If a prompt arrives via URL, redirect immediately to Studio
  useEffect(() => {
    if (incomingPrompt.trim()) {
      router.replace(
        `${siteRoutes.maxwellStudio}?prompt=${encodeURIComponent(incomingPrompt.trim())}`
      );
    }
  }, [incomingPrompt, router]);

  function submit() {
    const p = prompt.trim();
    if (!p) return;
    router.push(`${siteRoutes.maxwellStudio}?prompt=${encodeURIComponent(p)}`);
  }

  // While redirecting, show nothing (avoids flash)
  if (incomingPrompt.trim()) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: siteStatusTones.availability.accent }}
          />
          Opening Maxwell Studio…
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <div className="mx-auto w-full max-w-2xl px-6 py-16 lg:py-24">

        {/* Header */}
        <div className="mb-10">
          <div className="mb-5 flex items-center gap-2.5">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: siteTones.brand.accent }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: siteTones.brand.contrast }} />
            </span>
            <span className="text-sm font-mono text-muted-foreground">Maxwell</span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                color:           siteStatusTones.availability.accent,
                backgroundColor: siteStatusTones.availability.surface,
                border:          `1px solid ${siteStatusTones.availability.border}`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: siteStatusTones.availability.accent }}
              />
              Available
            </span>
          </div>
          <h1 className="text-3xl font-display tracking-tight lg:text-4xl">
            What do you want to build?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Describe your idea. Maxwell structures it into a clear direction, generates an advanced prototype, and prepares a formal proposal for your review.
          </p>
        </div>

        {/* Input */}
        <div className="rounded-xl border border-border bg-card p-3">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Describe what you want to build…"
            rows={5}
            className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 lg:text-[15px]"
            aria-label="Project description"
            autoFocus
          />
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2.5">
            <p className="text-xs text-muted-foreground/60">Press Enter to continue</p>
            <button
              type="button"
              onClick={submit}
              disabled={!prompt.trim()}
              aria-label="Start with Maxwell"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Suggested prompts */}
        <div className="mt-5">
          <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
            Try a prompt
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-secondary hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// Page export
// ============================================================================

export default function MaxwellPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full animate-pulse bg-primary" />
          Loading…
        </div>
      </div>
    }>
      <SitePageFrame>
        <MaxwellGateContent />
      </SitePageFrame>
    </Suspense>
  );
}

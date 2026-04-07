"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { siteRoutes } from "@/lib/site-config";
import { siteStatusTones, siteTones } from "@/lib/site-tones";
import { buildSignInHref } from "@/lib/auth/redirect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SUGGESTED_PROMPTS = [
  "Build a client portal with subscription billing",
  "Create an AI assistant for internal operations",
  "Build a mobile app for field service management",
  "Create an e-commerce platform for my business",
];

type MaxwellGateProps = {
  incomingPrompt: string;
  isAuthenticated: boolean;
  viewerEmail?: string | null;
};

function buildStudioHref(prompt: string) {
  return `${siteRoutes.maxwellStudio}?prompt=${encodeURIComponent(prompt.trim())}`;
}

export function MaxwellGate({
  incomingPrompt,
  isAuthenticated,
  viewerEmail,
}: MaxwellGateProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState(incomingPrompt);
  const [showAuthDialog, setShowAuthDialog] = useState(
    Boolean(incomingPrompt.trim() && !isAuthenticated),
  );

  const trimmedPrompt = prompt.trim();
  const signInHref = useMemo(
    () => buildSignInHref(buildStudioHref(trimmedPrompt || incomingPrompt || "")),
    [incomingPrompt, trimmedPrompt],
  );

  useEffect(() => {
    if (incomingPrompt.trim() && isAuthenticated) {
      router.replace(buildStudioHref(incomingPrompt));
    }
  }, [incomingPrompt, isAuthenticated, router]);

  function submit() {
    if (!trimmedPrompt) return;

    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    router.push(buildStudioHref(trimmedPrompt));
  }

  if (incomingPrompt.trim() && isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span
            className="h-2 w-2 animate-pulse rounded-full"
            style={{ backgroundColor: siteStatusTones.availability.accent }}
          />
          Opening Maxwell Studio…
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="flex min-h-[calc(100vh-4rem)] flex-col justify-center">
        <div className="mx-auto w-full max-w-2xl px-6 py-16 lg:py-24">
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-2.5">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: siteTones.brand.accent }}
              >
                <Sparkles
                  className="h-3.5 w-3.5"
                  style={{ color: siteTones.brand.contrast }}
                />
              </span>
              <span className="text-sm font-mono text-muted-foreground">Maxwell</span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  color: siteStatusTones.availability.accent,
                  backgroundColor: siteStatusTones.availability.surface,
                  border: `1px solid ${siteStatusTones.availability.border}`,
                }}
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ backgroundColor: siteStatusTones.availability.accent }}
                />
                Available
              </span>
            </div>
            <h1 className="text-3xl font-display tracking-tight lg:text-4xl">
              What do you want to build?
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Describe your idea. Maxwell structures it into a clear direction,
              generates an advanced prototype, and prepares a formal proposal for
              your review.
            </p>
            {viewerEmail ? (
              <p className="mt-4 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground/70">
                Signed in as {viewerEmail}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
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
                disabled={!trimmedPrompt}
                aria-label="Start with Maxwell"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
              Try a prompt
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setPrompt(suggestion)}
                  className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-secondary hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-md rounded-[28px] border-border bg-card p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display tracking-tight">
              Sign in before starting Maxwell
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Noon now asks for Google sign-in before the first prompt is sent, so
              your session, proposal, and workspace stay tied to one verified account.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                <LockKeyhole className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-foreground">Your prompt is preserved</p>
                <p className="mt-1 leading-relaxed">
                  After signing in, Maxwell will continue directly with this idea.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={signInHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continue with Google
            </Link>
            <button
              type="button"
              onClick={() => setShowAuthDialog(false)}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Not now
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

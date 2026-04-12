"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildSignInHref } from "@/lib/auth/redirect";

type UpgradeInputProps = {
  isAuthenticated: boolean;
  /** Pre-filled URL from localStorage restore after auth */
  initialUrl?: string;
  initialMode?: "answer_questions" | "best_judgment" | "specific_note";
  initialNote?: string;
};

const MODES = [
  {
    value: "best_judgment" as const,
    label: "Use Noon's best judgment",
    description: "We analyze your site and recommend improvements automatically.",
  },
  {
    value: "answer_questions" as const,
    label: "Answer a few questions",
    description: "Tell us a bit about your goals — up to 5 quick questions.",
  },
  {
    value: "specific_note" as const,
    label: "Add a specific note",
    description: "Share something specific you'd like us to focus on.",
  },
] as const;

const STORAGE_KEY = "noon_upgrade_pending";

function savePending(url: string, mode: string, note: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, mode, note }));
  } catch {
    // ignore storage errors
  }
}

function clearPending() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function UpgradeInput({
  isAuthenticated,
  initialUrl = "",
  initialMode = "best_judgment",
  initialNote = "",
}: UpgradeInputProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [url, setUrl] = useState(initialUrl);
  const [mode, setMode] = useState<"answer_questions" | "best_judgment" | "specific_note">(
    initialMode
  );
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Restore note from localStorage after signin redirect (only for specific_note mode)
  useEffect(() => {
    if (initialMode === "specific_note" && !initialNote) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const pending = JSON.parse(raw) as { url?: string; mode?: string; note?: string };
          if (pending.note && pending.mode === "specific_note") {
            setNote(pending.note);
          }
        }
      } catch {
        // ignore
      }
    }
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trimmedUrl = url.trim();
  const canSubmit = trimmedUrl.length > 0 && !isSubmitting && !isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    // If not authenticated, save state and redirect to sign-in
    if (!isAuthenticated) {
      savePending(trimmedUrl, mode, note);
      const redirectTo = `/upgrade?url=${encodeURIComponent(trimmedUrl)}&mode=${mode}`;
      router.push(buildSignInHref(redirectTo));
      return;
    }

    clearPending();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: trimmedUrl,
          mode,
          contextNote: mode === "specific_note" ? note : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      startTransition(() => {
        router.push(`/upgrade/${data.session.id}`);
      });
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-6">
      {/* URL input */}
      <div className="space-y-2">
        <label htmlFor="website-url" className="text-sm font-medium text-foreground">
          Your website URL
        </label>
        <div className="relative">
          <Globe
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="website-url"
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourwebsite.com"
            autoComplete="url"
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Mode selector */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">How should we approach it?</legend>
        <div className="grid gap-2">
          {MODES.map((m) => (
            <label
              key={m.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                mode === m.value
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={m.value}
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
                className="mt-0.5 accent-foreground"
                disabled={isSubmitting}
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium text-foreground">{m.label}</span>
                <span className="block text-xs text-muted-foreground">{m.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Specific note textarea */}
      {mode === "specific_note" && (
        <div className="space-y-2">
          <label htmlFor="context-note" className="text-sm font-medium text-foreground">
            Your note
          </label>
          <textarea
            id="context-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Focus on making the hero section clearer and improving trust signals…"
            rows={3}
            maxLength={2000}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow resize-none"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground text-right">{note.length}/2000</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full gap-2"
        size="lg"
      >
        {isSubmitting || isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting…
          </>
        ) : (
          <>
            Analyze my website
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {!isAuthenticated && (
        <p className="text-center text-xs text-muted-foreground">
          You'll be asked to sign in before the analysis starts.
        </p>
      )}
    </form>
  );
}

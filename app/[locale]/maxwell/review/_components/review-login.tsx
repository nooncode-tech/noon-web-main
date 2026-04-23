import { signInWithGoogleAction, signOutAction } from "@/app/[locale]/signin/actions";
import type { ReviewAccessReason } from "@/lib/auth/review";

type Props = {
  reason: ReviewAccessReason;
  redirectTo: string;
  viewerEmail?: string | null;
};

const COPY: Record<
  ReviewAccessReason,
  { title: string; body: string; cta: string; showSignOut?: boolean }
> = {
  sign_in_required: {
    title: "Sign in to access Review",
    body: "Internal review is restricted to verified Noon team accounts.",
    cta: "Continue with Google",
  },
  not_allowed: {
    title: "This account does not have review access",
    body: "Sign in with an allowlisted Noon review account to open the internal panel.",
    cta: "Switch Google account",
    showSignOut: true,
  },
  not_configured: {
    title: "Review access is not configured",
    body: "Set REVIEW_ALLOWED_EMAILS before enabling the internal review panel.",
    cta: "Continue with Google",
    showSignOut: true,
  },
};

export function ReviewLogin({ reason, redirectTo, viewerEmail }: Props) {
  const copy = COPY[reason];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <p className="mb-1 text-xs font-mono text-muted-foreground">noon / maxwell</p>
          <h1 className="text-xl font-display">{copy.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
          {viewerEmail && (
            <p className="mt-3 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{viewerEmail}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <form action={signInWithGoogleAction}>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              type="submit"
              className="site-primary-action w-full rounded-lg px-4 py-2.5 text-sm font-medium"
            >
              {copy.cta}
            </button>
          </form>

          {copy.showSignOut && viewerEmail && (
            <form action={signOutAction}>
              <input type="hidden" name="redirectTo" value={`/signin?redirectTo=${encodeURIComponent(redirectTo)}`} />
              <button
                type="submit"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

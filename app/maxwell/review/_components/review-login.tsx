import { loginAction } from "../_actions/auth";

export function ReviewLogin({ error }: { error?: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-mono text-muted-foreground mb-1">noon / maxwell</p>
          <h1 className="text-xl font-display">Review Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Internal access only.</p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
            Invalid access token.
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="token" className="mb-1.5 block text-sm font-medium">
              Access token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

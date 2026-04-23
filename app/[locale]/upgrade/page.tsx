import { Suspense } from "react";
import { auth } from "@/auth";
import { UpgradeInput } from "@/components/upgrade/upgrade-input";
import { UpgradeSessionList } from "@/components/upgrade/upgrade-session-list";
import { listUserSessions } from "@/lib/upgrade/repositories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade Your Website | Noon",
  description:
    "Get an AI-powered audit of your website and a fully upgraded version, then bring it to life with Noon.",
};

type Props = {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{ url?: string; mode?: string }>;
};

async function UpgradePageContent({ params, searchParams }: Props) {
  void params;
  const [{ url = "", mode = "" }, session] = await Promise.all([searchParams, auth()]);
  const isAuthenticated = Boolean(session?.user?.email);
  const sessions = isAuthenticated && session?.user?.email
    ? await listUserSessions(session.user.email)
    : [];

  // Restore pre-auth state from URL params (set by UpgradeInput before signin redirect)
  const initialUrl = decodeURIComponent(url);
  const initialMode = mode === "answer_questions" ? "answer_questions" : "best_judgment";

  return (
    <section aria-labelledby="upgrade-entry-title" className="mx-auto w-full max-w-[1180px] px-5 lg:px-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="text-center">
          <div className="mb-5">
            <h1 id="upgrade-entry-title" className="site-hero-title mx-auto max-w-xl text-foreground">
              Upgrade a live website with Maxwell.
            </h1>
            <p className="site-hero-copy mx-auto mt-4 max-w-xl text-muted-foreground">
              Paste your website URL so we can analyze it, identify conversion, UI/UX, and other
              key improvements, and generate an upgraded version with all those improvements
              applied.
            </p>
            <div className="site-meta-label mx-auto mt-4 grid max-w-xl grid-cols-3 gap-2 font-mono text-muted-foreground">
              {["Scan", "Diagnose", "Generate"].map((item) => (
                <span
                  key={item}
                  className="liquid-glass-pill inline-flex items-center justify-center gap-2 rounded-full px-2.5 py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <UpgradeInput
          isAuthenticated={isAuthenticated}
          initialUrl={initialUrl}
          initialMode={initialMode}
        />

        {sessions.length > 0 && <UpgradeSessionList sessions={sessions} />}
      </div>
    </section>
  );
}

export default function UpgradePage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1180px] px-5 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)] lg:gap-16">
            <div>
              <div className="mb-3 h-8 w-64 animate-pulse rounded-lg bg-muted" />
              <div className="mb-10 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
              <div className="h-72 w-full max-w-xl animate-pulse rounded-[10px] bg-muted/40" />
            </div>
            <div className="hidden h-[420px] w-full rounded-[10px] bg-muted/30 lg:block" />
          </div>
        </div>
      }
    >
      <UpgradePageContent {...props} />
    </Suspense>
  );
}

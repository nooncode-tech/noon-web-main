import { Suspense } from "react";
import { auth } from "@/auth";
import { UpgradeInput } from "@/components/upgrade/upgrade-input";
import { UpgradeSessionList } from "@/components/upgrade/upgrade-session-list";
import { listUserSessions } from "@/lib/upgrade/repositories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade Your Website · Noon",
  description:
    "Get an AI-powered audit of your website and a fully upgraded version — then bring it to life with Noon.",
};

type Props = {
  searchParams: Promise<{ url?: string; mode?: string }>;
};

async function UpgradePageContent({ searchParams }: Props) {
  const [{ url = "", mode = "" }, session] = await Promise.all([searchParams, auth()]);
  const isAuthenticated = Boolean(session?.user?.email);
  const sessions = isAuthenticated && session?.user?.email
    ? await listUserSessions(session.user.email)
    : [];

  // Restore pre-auth state from URL params (set by UpgradeInput before signin redirect)
  const initialUrl = decodeURIComponent(url);
  const initialMode =
    mode === "answer_questions" || mode === "specific_note"
      ? (mode as "answer_questions" | "specific_note")
      : "best_judgment";

  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Upgrade Your Website
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-md">
          Enter your website URL and we'll audit it, then generate an upgraded version with
          improved messaging, clearer copy, and better conversion. From there, you can build it
          with Maxwell or request a proposal.
        </p>
      </div>

      <UpgradeInput
        isAuthenticated={isAuthenticated}
        initialUrl={initialUrl}
        initialMode={initialMode}
      />

      {sessions.length > 0 && <UpgradeSessionList sessions={sessions} />}
    </div>
  );
}

export default function UpgradePage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4">
          <div className="h-8 w-64 rounded-lg bg-muted animate-pulse mb-3" />
          <div className="h-4 w-96 rounded bg-muted animate-pulse mb-10" />
          <div className="h-12 w-full rounded-lg bg-muted animate-pulse" />
        </div>
      }
    >
      <UpgradePageContent {...props} />
    </Suspense>
  );
}

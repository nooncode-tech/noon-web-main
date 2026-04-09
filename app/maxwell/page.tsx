import { Suspense } from "react";
import { auth } from "@/auth";
import { Navigation } from "@/components/landing/navigation";
import { FloatingTechElements } from "@/components/landing/floating-tech-elements";
import { MaxwellGate } from "@/components/maxwell/maxwell-gate";

type Props = {
  searchParams: Promise<{ prompt?: string }>;
};

async function MaxwellPageContent({ searchParams }: Props) {
  const [{ prompt = "" }, session] = await Promise.all([searchParams, auth()]);
  const viewerEmail = session?.user?.email ?? null;

  return (
    <MaxwellGate
      incomingPrompt={decodeURIComponent(prompt)}
      isAuthenticated={Boolean(viewerEmail)}
      viewerEmail={viewerEmail}
    />
  );
}

export default function MaxwellPage(props: Props) {
  return (
    <main className="page-grid-background noise-overlay relative h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] hidden md:block">
        <div
          className="absolute inset-3 rounded-[10px] border border-foreground/10"
          style={{ boxShadow: "0 0 0 9999px var(--background)" }}
        />
      </div>
      <FloatingTechElements />
      <Navigation />
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center pt-28 lg:pt-32">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Loading…
            </div>
          </div>
        }
      >
        <div className="relative z-10 h-full pt-28 lg:pt-32">
          <MaxwellPageContent {...props} />
        </div>
      </Suspense>
    </main>
  );
}

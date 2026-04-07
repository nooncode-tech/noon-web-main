import { Suspense } from "react";
import { auth } from "@/auth";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
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
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Loading…
          </div>
        </div>
      }
    >
      <SitePageFrame>
        <MaxwellPageContent {...props} />
      </SitePageFrame>
    </Suspense>
  );
}

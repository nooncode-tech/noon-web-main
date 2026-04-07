import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudioShell } from "@/components/maxwell/studio-shell";
import { buildSignInHref } from "@/lib/auth/redirect";
import { siteRoutes } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Maxwell Studio — Noon",
  description: "Build your software idea with Maxwell.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ prompt?: string; session_id?: string }>;
};

export default async function MaxwellStudioPage({ searchParams }: Props) {
  const { prompt = "", session_id } = await searchParams;
  const session = await auth();
  const viewerEmail = session?.user?.email ?? null;

  if (!viewerEmail) {
    if (session_id || prompt.trim()) {
      const redirectTo = session_id
        ? `${siteRoutes.maxwellStudio}?session_id=${encodeURIComponent(session_id)}`
        : `${siteRoutes.maxwellStudio}?prompt=${encodeURIComponent(prompt)}`;
      redirect(buildSignInHref(redirectTo));
    }
    redirect(siteRoutes.maxwell);
  }

  return (
    <StudioShell
      initialPrompt={decodeURIComponent(prompt)}
      initialSessionId={session_id}
      viewerEmail={viewerEmail}
    />
  );
}

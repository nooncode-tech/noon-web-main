import type { Metadata } from "next";
import { StudioShell } from "@/components/maxwell/studio-shell";

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
  return (
    <StudioShell
      initialPrompt={decodeURIComponent(prompt)}
      initialSessionId={session_id}
    />
  );
}

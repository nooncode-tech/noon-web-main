import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { siteRoutes } from "@/lib/site-config";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ prompt?: string }>;
};

export const metadata: Metadata = {
  title: "Maxwell Studio - Noon",
  description: "Continue into Maxwell Studio.",
  robots: { index: false, follow: false },
};

export default async function MaxwellPage({ params, searchParams }: Props) {
  const [{ locale }, { prompt = "" }] = await Promise.all([params, searchParams]);
  const baseHref = `/${locale}${siteRoutes.maxwellStudio}`;
  const trimmedPrompt = prompt.trim();
  const destination = trimmedPrompt
    ? `${baseHref}?prompt=${encodeURIComponent(trimmedPrompt)}`
    : baseHref;

  redirect(destination);
}

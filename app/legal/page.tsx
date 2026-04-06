import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, Cookie, Scale } from "lucide-react";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";

export const metadata: Metadata = {
  title: "Legal | Noon",
  description: "Legal documents, policies, and compliance information.",
};

const legalDocs = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "How we collect, use, and protect your data",
    icon: Shield,
    updated: "March 31, 2026",
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    description: "Rules for using our services",
    icon: FileText,
    updated: "March 31, 2026",
  },
  {
    slug: "cookies-policy",
    title: "Cookies Policy",
    description: "How we use cookies and tracking",
    icon: Cookie,
    updated: "March 31, 2026",
  },
  {
    slug: "legal-notice",
    title: "Legal Notice",
    description: "Company information and disclaimers",
    icon: Scale,
    updated: "March 31, 2026",
  },
];

export default function LegalPage() {
  return (
    <SitePageFrame>
      <div className="mx-auto max-w-4xl px-6 py-24">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Legal
          </p>
          <h1 className="mb-4 text-4xl font-medium tracking-tight md:text-5xl">
            Legal Documents
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Policies and terms that govern our services
          </p>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {legalDocs.map((doc) => {
            const Icon = doc.icon;
            return (
              <Link
                key={doc.slug}
                href={`/${doc.slug}`}
                className="group flex gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <div className="min-w-0">
                  <h2 className="mb-1 font-medium group-hover:underline">{doc.title}</h2>
                  <p className="mb-2 text-sm text-muted-foreground">{doc.description}</p>
                  <p className="text-xs text-muted-foreground/70">Updated {doc.updated}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-lg font-medium">Questions?</h2>
          <p className="mb-4 text-muted-foreground">
            Contact us at{" "}
            <a
              href="mailto:noon.message@gmail.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              noon.message@gmail.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Wilmington, Delaware, United States
          </p>
        </div>
      </div>
    </SitePageFrame>
  );
}

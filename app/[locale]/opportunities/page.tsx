"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Handshake, Network, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageCard } from "@/app/_components/site/page-card";
import { PageSection } from "@/app/_components/site/page-section";
import { SiteCtaBlock } from "@/app/_components/site/site-cta-block";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { getContactHref, siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";

const LOCALES = ["en", "es", "fr", "de"];

type OpportunityArea = {
  title: string;
  description: string;
  examples: string[];
  icon: LucideIcon;
  tone: typeof siteTones.brand;
};

const opportunityAreas: OpportunityArea[] = [
  {
    title: "Collaborations",
    description:
      "For people, studios, operators, or companies that see a practical way to work with Noon on client or product initiatives.",
    examples: ["Strategic partnerships", "Project collaboration", "Shared delivery opportunities"],
    icon: Handshake,
    tone: siteTones.gateway,
  },
  {
    title: "Working with Noon",
    description:
      "For independent builders, specialists, and technical profiles who may fit future project needs without forcing a traditional hiring path.",
    examples: ["Frontend", "Backend", "Design", "AI", "Operations"],
    icon: BriefcaseBusiness,
    tone: siteTones.brand,
  },
  {
    title: "Specialist availability",
    description:
      "For software, hardware, infrastructure, or operational technology support that could strengthen Noon engagements when the fit is clear.",
    examples: ["Remote support", "On-site availability", "Hybrid technical work"],
    icon: Network,
    tone: siteTones.data,
  },
  {
    title: "Future opportunities",
    description:
      "For relationships that are not active roles today but may become relevant as Noon expands its services, products, and delivery network.",
    examples: ["Future roles", "Advisory relationships", "Regional availability"],
    icon: Sparkles,
    tone: siteTones.services,
  },
];

export default function OpportunitiesPage() {
  const params = useParams();
  const paramLocale = typeof params?.locale === "string" ? params.locale : null;
  const locale = (paramLocale && LOCALES.includes(paramLocale) ? paramLocale : "en");
  const lp = (href: string) => `/${locale}${href}`;
  const contactHref = lp(getContactHref({ inquiry: "general", source: "opportunities" }));

  const { ref: headerRef, isVisible: headerVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SitePageFrame>
      <section ref={headerRef} className="site-hero-section pb-4 lg:pb-5">
        <div className="site-shell">
          <div className="w-full">
            <div className="rounded-[9px] bg-[#f9f9f9]/95 p-6 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-[#131313]/92 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] sm:p-8 lg:p-10">
              <h1
                className={`site-hero-title mx-auto mb-5 max-w-4xl transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                A place for future ways to work with Noon.
              </h1>
              <p
                className={`site-hero-copy mx-auto mb-8 max-w-4xl text-muted-foreground transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                Opportunities is intentionally broader than a careers page. It is for collaborations,
                specialist availability, future roles, and practical ways to connect when there is a
                real reason to work together.
              </p>
              <div
                className={`flex flex-wrap justify-center gap-4 transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                <Link
                  href={contactHref}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
                >
                  Contact Noon
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageSection
        eyebrow="Areas"
        title="What belongs here"
        description="This page keeps opportunity-related conversations out of the primary navigation while still giving them a clear, permanent home."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {opportunityAreas.map((area) => {
            const Icon = area.icon;

            return (
              <PageCard
                key={area.title}
                title={area.title}
                description={area.description}
                tone={area.tone}
                compact
                iconPlacement="corner"
                icon={
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[8px] border"
                    style={{
                      borderColor: area.tone.border,
                      backgroundColor: area.tone.surface,
                      color: area.tone.accent,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {area.examples.map((example) => (
                    <span
                      key={example}
                      className="rounded-full border border-foreground/10 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </PageCard>
            );
          })}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Positioning"
        title="Not just a hiring page"
        description="Noon can use this space for formal roles later, but the current purpose is broader: useful collaboration, technical availability, and future relationship paths."
        className="bg-secondary/30"
      >
        <div className="site-section-copy max-w-3xl rounded-[10px] border border-foreground/10 bg-background/70 p-6 text-muted-foreground lg:p-8">
          <p>
            If there is a concrete reason to connect, use the existing contact route and explain the
            opportunity clearly. Noon can route the conversation after reviewing the context.
          </p>
        </div>
      </PageSection>

      <SiteCtaBlock
        title="Share the opportunity clearly."
        description="Use the general contact method. No separate application system or special flow is being introduced here."
        blockHref={lp(siteRoutes.home)}
        className="!pt-8 !pb-10 lg:!pt-10 lg:!pb-12"
      />
    </SitePageFrame>
  );
}

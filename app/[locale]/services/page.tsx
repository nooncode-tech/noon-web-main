"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ClipboardCheck, Code2, Headphones, RefreshCw } from "lucide-react";
import { PageCard } from "@/app/_components/site/page-card";
import { PageSection } from "@/app/_components/site/page-section";
import { SiteCtaBlock } from "@/app/_components/site/site-cta-block";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { getContactHref, siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";

const LOCALES = ["en", "es", "fr", "de"];

type ServiceItem = {
  name: string;
  summary: string;
  details: string[];
  href: string;
  linkLabel: string;
  icon: LucideIcon;
  tone: typeof siteTones.brand;
};

type DecisionItem = {
  label: string;
  description: string;
  tone: typeof siteTones.brand;
};

export default function ServicesPage() {
  const params = useParams();
  const paramLocale = typeof params?.locale === "string" ? params.locale : null;
  const locale = (paramLocale && LOCALES.includes(paramLocale) ? paramLocale : "en");
  const lp = (href: string) => `/${locale}${href}`;

  const contactHref = lp(getContactHref({ inquiry: "general", source: "services" }));

  const services: ServiceItem[] = [
    {
      name: "Custom Development",
      summary:
        "New software built around your business logic, users, workflows, and operational constraints.",
      details: [
        "Best for internal tools, customer portals, platforms, automations, dashboards, and products that need a real codebase.",
        "Noon helps clarify the problem, shape the scope, and turn the work into production-minded software.",
      ],
      href: lp(getContactHref({ inquiry: "new-project", source: "custom-development" })),
      linkLabel: "Discuss custom development",
      icon: Code2,
      tone: siteTones.brand,
    },
    {
      name: "Upgrade",
      summary:
        "Improve an existing website or product surface when the current version is underperforming, unclear, or dated.",
      details: [
        "Use this when you already have something live and need a stronger version, not a vague redesign request.",
        "The existing Upgrade flow remains available as the structured starting point for this service.",
      ],
      href: lp(siteRoutes.upgrade),
      linkLabel: "Open Upgrade",
      icon: RefreshCw,
      tone: siteTones.services,
    },
    {
      name: "Engineering Support",
      summary:
        "Technical support capacity for software, hardware, infrastructure, and technology operations.",
      details: [
        "Support can involve one person or several, depending on the need and scope.",
        "Engagements may be remote, on-site, or hybrid. Physical interventions are handled by request and availability.",
      ],
      href: lp(getContactHref({ inquiry: "general", source: "engineering-support" })),
      linkLabel: "Contact Noon",
      icon: Headphones,
      tone: siteTones.gateway,
    },
    {
      name: "Business Technology Audit",
      summary:
        "A diagnostic review of the business technology and operational setup before deciding what should change.",
      details: [
        "Best when the problem is real but the right technical move is not yet clear.",
        "The audit looks at technology, operations, constraints, and practical next steps. It uses the general contact route.",
      ],
      href: lp(getContactHref({ inquiry: "general", source: "business-technology-audit" })),
      linkLabel: "Request an audit conversation",
      icon: ClipboardCheck,
      tone: siteTones.data,
    },
  ];

  const decisionGuide: DecisionItem[] = [
    {
      label: "You need Custom Development",
      description:
        "when the business needs a new system, workflow, platform, product, or integration built around specific logic.",
      tone: siteTones.brand,
    },
    {
      label: "You need Upgrade",
      description:
        "when something already exists and the goal is to improve clarity, structure, conversion, performance, or product quality.",
      tone: siteTones.services,
    },
    {
      label: "You need Engineering Support",
      description:
        "when the business needs technical capacity across software, hardware, infrastructure, or operational technology.",
      tone: siteTones.gateway,
    },
    {
      label: "You need Business Technology Audit",
      description:
        "when the symptoms are visible but the real bottleneck, priority, or implementation path needs diagnosis first.",
      tone: siteTones.data,
    },
  ];

  const { ref: headerRef, isVisible: headerVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SitePageFrame>
      <section ref={headerRef} className="site-hero-section pb-4 lg:pb-5">
        <div className="site-shell">
          <div className="w-full">
            <div className="rounded-[9px] bg-[#f9f9f9]/95 p-6 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-[#131313]/92 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] sm:p-8 lg:p-10">
              <h1
                className={`site-hero-title mb-5 transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                Four ways Noon helps teams move from problem to working software.
              </h1>
              <p
                className={`site-hero-copy mx-auto mb-8 max-w-4xl text-muted-foreground transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                Noon covers four primary needs: building new software, upgrading what already exists,
                supporting the technology operation, and auditing the business technology stack before
                decisions are made.
              </p>
              <div
                className={`flex flex-wrap justify-center gap-4 transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                <Link
                  href="#services-offer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
                >
                  Review services
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={contactHref}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  Contact Noon
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageSection
        id="services-offer"
        eyebrow="Offer"
        title="The service architecture"
        description="The order below is intentional: first define whether the work is a new build, an upgrade, ongoing support, or a diagnostic audit."
        className="pt-4 pb-8 lg:pt-5 lg:pb-10"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <PageCard
                key={service.name}
                title={service.name}
                description={service.summary}
                href={service.href}
                linkLabel={service.linkLabel}
                tone={service.tone}
                compact
                iconPlacement="corner"
                alignActionBottom
                icon={
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[8px] border"
                    style={{
                      borderColor: service.tone.border,
                      backgroundColor: service.tone.surface,
                      color: service.tone.accent,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                }
              >
                <ul className="space-y-2">
                  {service.details.map((detail) => (
                    <li key={detail} className="flex gap-2.5 text-sm leading-6 text-muted-foreground">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: service.tone.accent }}
                      />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </PageCard>
            );
          })}
        </div>
      </PageSection>

      <PageSection
        id="which-service"
        eyebrow="Decision guide"
        title="Which service do you need?"
        description="Use this as a practical first filter. Noon can still adjust the route after reviewing the context."
        className="bg-secondary/30 py-8 lg:py-10"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {decisionGuide.map((item, index) => (
            <div key={item.label} className="rounded-[10px] border border-foreground/10 bg-background/70 p-5 lg:p-6">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-xs font-mono"
                  style={{ backgroundColor: item.tone.surface, color: item.tone.accent }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-medium text-foreground">{item.label}</h3>
              </div>
              <p className="site-card-copy text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </PageSection>

      <SiteCtaBlock
        title="Start building your idea with Maxwell here"
        blockHref={lp(siteRoutes.home)}
        className="pt-8 pb-10 lg:pt-10 lg:pb-12"
      />
    </SitePageFrame>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import {
  ArrowRight,
  type LucideIcon,
  Mail,
  MessageSquare,
  Users,
  BriefcaseBusiness,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { ContactIntakeForm } from "@/app/_components/site/contact-intake-form";
import { FaqSection } from "@/components/landing/faq-section";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { contactInbox, normalizeContactInquiry, type ContactInquiryKey } from "@/lib/contact";
import { getContactHref, getStartWithMaxwellHref } from "@/lib/site-config";
import { siteChromeDots, siteTones } from "@/lib/site-tones";

const LOCALES = ["en", "es", "fr", "de"];

type InquiryPathMeta = {
  key: ContactInquiryKey;
  matches: readonly ContactInquiryKey[];
  icon: LucideIcon;
  tone: typeof siteTones.brand;
};

const inquiryPathMeta: ReadonlyArray<InquiryPathMeta> = [
  {
    key: "new-project",
    matches: ["new-project", "solutions", "capabilities", "what-we-build", "technology", "templates"],
    icon: MessageSquare,
    tone: siteTones.brand,
  },
  {
    key: "general",
    matches: ["general", "about", "legal"],
    icon: Users,
    tone: siteTones.client,
  },
  {
    key: "seller",
    matches: ["seller", "developer"],
    icon: BriefcaseBusiness,
    tone: siteTones.gateway,
  },
  {
    key: "next-product",
    matches: ["investor", "next-product"],
    icon: TrendingUp,
    tone: siteTones.data,
  },
] as const;

function ConnectionHubVisual({ routingLabels }: { routingLabels: string[] }) {
  const [activeNode, setActiveNode] = useState(0);
  const { ref: hubRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveNode((current) => (current + 1) % 4);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [isVisible]);

  const nodes = [
    { label: "Project", angle: 0, tone: inquiryPathMeta[0].tone },
    { label: "General", angle: 90, tone: inquiryPathMeta[1].tone },
    { label: "Partner", angle: 180, tone: inquiryPathMeta[2].tone },
    { label: "Next", angle: 270, tone: inquiryPathMeta[3].tone },
  ];
  const activeTone = nodes[activeNode].tone;

  return (
    <div
      ref={hubRef}
      className={`overflow-hidden rounded-2xl border border-border bg-card transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-border bg-secondary/30 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.red }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.amber }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.green }} />
        </div>
        <span className="text-xs font-mono text-muted-foreground">contact.routing</span>
      </div>

      <div className="relative flex items-center justify-center p-8">
        <div className="relative h-48 w-48">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
            {nodes.map((node, index) => {
              const rad = (node.angle * Math.PI) / 180;
              const x2 = 50 + Math.cos(rad) * 35;
              const y2 = 50 + Math.sin(rad) * 35;

              return (
                <line
                  key={node.label}
                  x1="50"
                  y1="50"
                  x2={x2}
                  y2={y2}
                  className="transition-all duration-500"
                  stroke={index === activeNode ? node.tone.accent : "rgba(24, 21, 18, 0.12)"}
                  strokeWidth={index === activeNode ? "1.5" : "1"}
                  strokeDasharray={index === activeNode ? "0" : "3 2"}
                />
              );
            })}
          </svg>

          <div
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg"
            style={{ backgroundColor: siteTones.brand.accent }}
          >
            <span className="text-xs font-mono font-medium text-white">Noon</span>
          </div>

          {nodes.map((node, index) => {
            const rad = (node.angle * Math.PI) / 180;
            const x = 50 + Math.cos(rad) * 42;
            const y = 50 + Math.sin(rad) * 42;

            return (
              <div
                key={node.label}
                className={`absolute flex h-14 w-14 items-center justify-center rounded-xl border transition-all duration-500 ${
                  index === activeNode ? "scale-110" : "scale-100"
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  borderColor: node.tone.border,
                  backgroundColor: index === activeNode ? node.tone.accent : node.tone.surface,
                  color: index === activeNode ? node.tone.contrast : node.tone.accent,
                  boxShadow: index === activeNode ? `0 18px 30px -24px ${node.tone.shadow}` : "none",
                }}
              >
                <span className="text-center text-[9px] font-mono">{node.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2"
          style={{ backgroundColor: activeTone.surface, border: `1px solid ${activeTone.border}` }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: activeTone.accent }} />
          <span className="text-xs" style={{ color: activeTone.accent }}>
            {routingLabels[activeNode]}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageSkeleton />}>
      <ContactPageContent />
    </Suspense>
  );
}

function ContactPageSkeleton() {
  return (
    <SitePageFrame>
      <section className="site-hero-section">
        <div className="site-shell">
          <div className="max-w-3xl">
            <div className="mb-6 h-6 w-32 animate-pulse rounded bg-secondary" />
            <div className="mb-6 h-12 w-64 animate-pulse rounded bg-secondary" />
            <div className="h-6 w-96 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </section>
    </SitePageFrame>
  );
}

function ContactPageContent() {
  const params = useParams();
  const paramLocale = typeof params?.locale === "string" ? params.locale : null;
  const locale = (paramLocale && LOCALES.includes(paramLocale) ? paramLocale : "en");

  const searchParams = useSearchParams();
  const inquiry = searchParams.get("inquiry") || undefined;
  const draft = searchParams.get("draft") || "";
  const source = searchParams.get("source") || undefined;

  const t = useTranslations("contact");

  const inquiryPathsRaw = t.raw("inquiryPaths") as Array<{ title: string; description: string }>;
  const inquiryPaths = inquiryPathMeta.map((meta, i) => ({
    ...meta,
    title: inquiryPathsRaw[i]?.title ?? "",
    description: inquiryPathsRaw[i]?.description ?? "",
  }));

  const routingLabels = [
    t("routing.project"),
    t("routing.general"),
    t("routing.partner"),
    t("routing.next"),
  ];

  const normalizedInquiry = normalizeContactInquiry(inquiry);
  const trimmedDraft = draft.trim();
  const canReturnToMaxwell = trimmedDraft.length > 0 || source === "maxwell";
  const maxwellReturnHref = getStartWithMaxwellHref(trimmedDraft || undefined);

  const { ref: headerRef, isVisible: headerVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SitePageFrame>
      <section ref={headerRef} className="site-hero-section">
        <div className="site-shell">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span
                className={`mb-6 inline-flex items-center gap-3 text-sm font-mono text-muted-foreground transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                <span className="h-px w-8" style={{ backgroundColor: siteTones.brand.accent }} />
                {t("hero.eyebrow")}
              </span>
              <h1
                className={`mb-6 text-4xl font-display tracking-tight transition-all duration-700 lg:text-5xl ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                {t("hero.headline")}
              </h1>
              <p
                className={`mb-4 text-base leading-relaxed text-muted-foreground transition-all duration-700 lg:text-lg ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                {t("hero.description")}
              </p>
              <p
                className={`mb-8 text-sm text-muted-foreground transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "260ms" }}
              >
                {t("hero.responseTime")}
              </p>
              <div
                className={`flex flex-wrap gap-4 transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "320ms" }}
              >
                <a
                  href={`mailto:${contactInbox}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
                >
                  <Mail className="h-4 w-4" />
                  {contactInbox}
                </a>
                {canReturnToMaxwell ? (
                  <Link
                    href={maxwellReturnHref}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {t("continueWithMaxwell")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div>
              <ConnectionHubVisual routingLabels={routingLabels} />
            </div>
          </div>
        </div>
      </section>

      {/* Routes first — user chooses path, form pre-fills */}
      <section className="site-section bg-secondary/30">
        <div className="site-shell">
          <div className="mb-10 max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
              <span className="h-px w-8" style={{ backgroundColor: siteTones.brand.accent }} />
              {t("routes.eyebrow")}
            </span>
            <h2 className="text-2xl font-display tracking-tight lg:text-3xl">{t("routes.headline")}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {inquiryPaths.map((path, index) => (
              <InquiryPathCard
                key={path.key}
                path={path}
                index={index}
                isSelected={Boolean(normalizedInquiry && path.matches.includes(normalizedInquiry))}
                draft={trimmedDraft}
                source={source}
                openRouteLabel={t("openRoute")}
              />
            ))}
          </div>
        </div>
      </section>

      <FaqSection />

      {/* Form after routes */}
      <section id="contact-intake" className="site-section">
        <div className="site-shell">
          <ContactIntakeForm
            initialInquiry={normalizedInquiry}
            initialDraft={trimmedDraft}
            initialSource={source}
          />
        </div>
      </section>
    </SitePageFrame>
  );
}

function InquiryPathCard({
  path,
  index,
  isSelected,
  draft,
  source,
  openRouteLabel,
}: {
  path: InquiryPathMeta & { title: string; description: string };
  index: number;
  isSelected: boolean;
  draft: string;
  source?: string;
  openRouteLabel: string;
}) {
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLAnchorElement>({ threshold: 0.2 });
  const Icon = path.icon;
  const tone = path.tone;

  return (
    <Link
      ref={cardRef}
      href={getContactHref({ inquiry: path.key, draft, source })}
      className={`group flex flex-col rounded-xl border bg-card p-6 transition-all duration-700 hover:border-foreground/20 ${
        isSelected ? "border-foreground/20 bg-card/95" : "border-border"
      } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      style={{
        transitionDelay: `${index * 80}ms`,
        borderColor: isSelected ? tone.border : undefined,
        boxShadow: isSelected ? `0 20px 40px -34px ${tone.shadow}` : undefined,
      }}
    >
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300"
        style={{
          borderColor: tone.border,
          backgroundColor: isSelected ? tone.accent : tone.surface,
          color: isSelected ? tone.contrast : tone.accent,
        }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-lg font-display">{path.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{path.description}</p>
      <div className="mt-auto pt-4">
        <span
          className="inline-flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
          style={{ color: isSelected ? tone.accent : undefined }}
        >
          {openRouteLabel}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

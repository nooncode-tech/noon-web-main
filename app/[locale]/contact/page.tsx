"use client";

import { Suspense } from "react";
import {
  ArrowRight,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { SiteCtaBlock } from "@/app/_components/site/site-cta-block";
import { ContactIntakeForm } from "@/app/_components/site/contact-intake-form";
import { FaqSection } from "@/components/landing/faq-section";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { contactInbox, normalizeContactInquiry } from "@/lib/contact";
import { getStartWithMaxwellHref, siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";

const LOCALES = ["en", "es", "fr", "de"];

function ContactProcessPanel({ responseTime }: { responseTime: string }) {
  const steps = [
    {
      label: "Route",
      description: "Pick the closest request type so it reaches the right review path.",
    },
    {
      label: "Review",
      description: responseTime,
    },
    {
      label: "Next step",
      description: "Noon replies with clarification, proposal direction, or direct guidance.",
    },
  ];

  return (
    <div className="liquid-glass-card rounded-[10px] p-5 lg:p-6">
      <p className="mb-5 text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
        How it moves
      </p>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.label} className="grid grid-cols-[2rem_1fr] gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[8px] border text-xs font-mono"
              style={{
                borderColor: siteTones.brand.border,
                backgroundColor: index === 0 ? siteTones.brand.accent : siteTones.brand.surface,
                color: index === 0 ? siteTones.brand.contrast : siteTones.brand.accent,
              }}
            >
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="site-card-copy mt-1 text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
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
  const searchParams = useSearchParams();
  const inquiry = searchParams.get("inquiry") || undefined;
  const draft = searchParams.get("draft") || "";
  const source = searchParams.get("source") || undefined;

  const t = useTranslations("contact");

  const normalizedInquiry = normalizeContactInquiry(inquiry);
  const trimmedDraft = draft.trim();
  const canReturnToMaxwell = trimmedDraft.length > 0 || source === "maxwell";
  const maxwellReturnHref = getStartWithMaxwellHref(trimmedDraft || undefined);
  const paramLocale = typeof params?.locale === "string" ? params.locale : null;
  const locale = (paramLocale && LOCALES.includes(paramLocale) ? paramLocale : "en");
  const lp = (href: string) => `/${locale}${href}`;

  const { ref: headerRef, isVisible: headerVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SitePageFrame>
      <section ref={headerRef} className="site-hero-section pb-4 lg:pb-5">
        <div className="site-shell">
          <div className="grid w-full items-start gap-8 lg:grid-cols-[minmax(0,420px)_820px] lg:justify-between lg:gap-10">
            <div className="space-y-5">
              <h1
                className={`site-hero-title transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                {t("hero.headline")}
              </h1>
              <p
                className={`site-hero-copy text-muted-foreground transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                {t("hero.description")}
              </p>
              <p
                className={`text-sm text-muted-foreground transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "260ms" }}
              >
                {t("hero.responseTime")}
              </p>
              <div
                className={`flex flex-wrap gap-3 transition-all duration-700 ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "320ms" }}
              >
                <a
                  href={`mailto:${contactInbox}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
                >
                  <Mail className="h-4 w-4" />
                  {contactInbox}
                </a>
                {canReturnToMaxwell ? (
                  <Link
                    href={maxwellReturnHref}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {t("continueWithMaxwell")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
              <div
                className={`hidden transition-all duration-700 lg:block ${
                  headerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "380ms" }}
              >
                <ContactProcessPanel responseTime={t("hero.responseTime")} />
              </div>
            </div>

            <div id="contact-intake" className="min-w-0 w-full lg:w-[820px] lg:justify-self-end">
              <ContactIntakeForm
                initialInquiry={normalizedInquiry}
                initialDraft={trimmedDraft}
                initialSource={source}
                layout="stacked"
                showGuidance={false}
              />
            </div>
          </div>
        </div>
      </section>

      <FaqSection />

      <SiteCtaBlock
        title="Start building your idea with Maxwell here"
        blockHref={lp(siteRoutes.home)}
        className="!pt-8 !pb-10 lg:!pt-10 lg:!pb-12"
      />
    </SitePageFrame>
  );
}

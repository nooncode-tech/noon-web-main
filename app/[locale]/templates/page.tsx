"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { templates } from "@/data/templates";
import { siteRoutes } from "@/lib/site-config";
import { siteChromeDots, siteTones } from "@/lib/site-tones";
import { TemplateCard as AnimatedTemplateCard } from "@/components/landing/explore-builds-section";

const templateBrandTone = siteTones.brand;

const LOCALES = ["en", "es", "fr", "de"];

// ============================================================================
// TEMPLATE PREVIEW VISUAL
// ============================================================================

function TemplatePreviewVisual() {
  const [activeTemplate, setActiveTemplate] = useState(0);
  const { ref: previewRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  const templatePreviews = [
    { name: "Dashboard", tone: siteTones.client },
    { name: "Portal",    tone: siteTones.brand },
    { name: "Platform",  tone: siteTones.data },
  ] as const;

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveTemplate((prev) => (prev + 1) % templatePreviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible, templatePreviews.length]);

  const activeTone = templatePreviews[activeTemplate].tone;

  return (
    <div
      ref={previewRef}
      className={`rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.red }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.amber }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.green }} />
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: activeTone.accent }} />
          template.preview
        </span>
      </div>

      {/* Template browser */}
      <div className="p-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-secondary/50 rounded-lg">
          {templatePreviews.map((template, index) => (
            <button
              key={template.name}
              onClick={() => setActiveTemplate(index)}
              className={`flex-1 rounded-md border border-transparent px-3 py-2 text-xs font-medium transition-all duration-300 ${index === activeTemplate ? "shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              style={
                index === activeTemplate
                  ? { backgroundColor: template.tone.surface, borderColor: template.tone.border, color: template.tone.accent }
                  : undefined
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: template.tone.accent, opacity: index === activeTemplate ? 1 : 0.45 }}
                />
                {template.name}
              </span>
            </button>
          ))}
        </div>

        {/* Preview window */}
        <div className="relative rounded-xl border border-border bg-background overflow-hidden aspect-[4/3]">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: siteChromeDots.red }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: siteChromeDots.amber }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: siteChromeDots.green }} />
            </div>
            <div className="flex-1 mx-2 h-4 bg-secondary rounded-md" />
          </div>

          <div className="p-3 h-full">
            {/* Dashboard preview */}
            {activeTemplate === 0 && (
              <div className={`space-y-2 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <div className="flex justify-between items-center">
                  <div className="w-12 h-2 bg-foreground/80 rounded" />
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-1.5 bg-secondary rounded" />)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg border p-2"
                      style={i === 1 ? { borderColor: templatePreviews[0].tone.border, backgroundColor: templatePreviews[0].tone.surface } : undefined}
                    >
                      <div className="mb-1 h-1 w-full rounded" style={i === 1 ? { backgroundColor: templatePreviews[0].tone.accent } : undefined} />
                      <div className="w-2/3 h-3 bg-foreground/10 rounded" />
                    </div>
                  ))}
                </div>
                <div className="h-12 bg-secondary rounded-lg mt-2" />
              </div>
            )}

            {/* Portal preview */}
            {activeTemplate === 1 && (
              <div className={`flex gap-2 h-full transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <div className="w-16 bg-secondary rounded-lg p-2 space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-2 rounded ${i === 1 ? "" : "bg-foreground/20"}`}
                      style={i === 1 ? { backgroundColor: templatePreviews[1].tone.accent } : undefined} />
                  ))}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 rounded-lg border" style={{ borderColor: templatePreviews[1].tone.border, backgroundColor: templatePreviews[1].tone.surface }} />
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {[1, 2, 3, 4].map(i => <div key={i} className="aspect-video bg-secondary rounded-lg" />)}
                  </div>
                </div>
              </div>
            )}

            {/* Platform preview */}
            {activeTemplate === 2 && (
              <div className={`space-y-2 h-full transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-2 bg-foreground rounded" />
                  <div className="flex gap-2">
                    <div className="w-16 h-5 bg-secondary rounded-full" />
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: templatePreviews[2].tone.accent }} />
                  </div>
                </div>
                <div className="mt-3 h-16 rounded-lg border" style={{ borderColor: templatePreviews[2].tone.border, backgroundColor: templatePreviews[2].tone.surface }} />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 rounded-lg"
                      style={i === 2 ? { backgroundColor: templatePreviews[2].tone.surface, border: `1px solid ${templatePreviews[2].tone.border}` } : undefined} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Template info */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {templatePreviews[activeTemplate].name} template
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1"
            style={{ borderColor: activeTone.border, backgroundColor: activeTone.surface, color: activeTone.accent }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTone.accent }} />
            <span className="text-[10px]">Ready to customize</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function TemplatesPage() {
  const params = useParams();
  const paramLocale = typeof params?.locale === "string" ? params.locale : null;
  const locale = (paramLocale && LOCALES.includes(paramLocale) ? paramLocale : "en");
  const lp = (href: string) => `/${locale}${href}`;

  const t = useTranslations("templates");

  const { ref: headerRef, isVisible: headerVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SitePageFrame>
      {/* Hero */}
      <section ref={headerRef} className="site-hero-section">
        <div className="site-shell">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span
                className={`inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <span className="w-8 h-px" style={{ backgroundColor: templateBrandTone.accent }} />
                {t("hero.eyebrow")}
              </span>
              <h1
                className={`text-4xl lg:text-5xl font-display tracking-tight mb-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "100ms" }}
              >
                {t("hero.headline")}
              </h1>
              <p
                className={`text-base lg:text-lg text-muted-foreground leading-relaxed mb-8 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "200ms" }}
              >
                {t("hero.description")}
              </p>
              <div
                className={`flex flex-wrap gap-4 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "300ms" }}
              >
                <Link
                  href={siteRoutes.maxwell}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
                >
                  {t("hero.startWithMaxwell")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={lp(siteRoutes.services)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  {t("hero.viewServices")}
                </Link>
              </div>
            </div>

            {/* Template Preview Visual */}
            <div className="hidden lg:block">
              <TemplatePreviewVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Templates by category */}
      <section className="site-section bg-secondary/30">
        <div className="site-shell">
          <div className="flex items-center justify-between mb-10">
            <span className="liquid-glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: templateBrandTone.accent }} />
              {t("allTemplates")}
            </span>
            <span className="text-xs font-mono" style={{ color: templateBrandTone.accent }}>
              {templates.length} templates
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template, index) => (
              <AnimatedTemplateCard key={template.slug} template={template} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section-lg bg-foreground text-background">
        <div className="site-shell text-center">
          <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
            {t("cta.headline")}
          </h2>
          <p className="text-background/70 mb-8 max-w-md mx-auto">
            {t("cta.description")}
          </p>
          <Link
            href={siteRoutes.maxwell}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
          >
            {t("cta.startWithMaxwell")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SitePageFrame>
  );
}


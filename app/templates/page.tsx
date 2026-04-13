"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { templateCategories, templates } from "@/data/templates";
import { siteRoutes } from "@/lib/site-config";
import { siteChromeDots, siteTones } from "@/lib/site-tones";
import { TemplateCard as AnimatedTemplateCard } from "@/components/landing/explore-builds-section";

type TemplateItem = (typeof templates)[number];
type TemplateCategory = (typeof templateCategories)[number];

const templateBrandTone = siteTones.brand;
const templateTonePrimary = siteTones.brand;
const templateToneStructural = siteTones.client;
const templateToneLifted = siteTones.data;
const templateToneOperational = siteTones.gateway;
const templateToneCommerce = siteTones.services;

const templateCategoryTones: Record<
  TemplateCategory,
  { accent: string; border: string; surface: string }
> = {
  SaaS: templateTonePrimary,
  Dashboards: templateToneStructural,
  "Internal tools": templateToneOperational,
  "AI assistants": templateToneLifted,
  Marketplaces: templateToneCommerce,
  "Booking platforms": templateToneCommerce,
  "E-commerce": templateToneCommerce,
  "Mobile apps": templateToneLifted,
};

// Group templates by category
function getTemplatesByCategory() {
  const grouped: Record<TemplateCategory, TemplateItem[]> = {} as Record<TemplateCategory, TemplateItem[]>;
  for (const category of templateCategories) {
    grouped[category] = templates.filter((t) => t.category === category);
  }
  return grouped;
}

// ============================================================================
// TEMPLATE PREVIEW VISUAL
// ============================================================================

function TemplatePreviewVisual() {
  const [activeTemplate, setActiveTemplate] = useState(0);
  const { ref: previewRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  const templatePreviews = [
    { name: "Dashboard", tone: templateToneStructural },
    { name: "Portal",    tone: templateTonePrimary },
    { name: "Platform",  tone: templateToneLifted },
  ] as const;

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveTemplate((prev) => (prev + 1) % templatePreviews.length);
    }, 2500);
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
  const templatesByCategory = getTemplatesByCategory();
  const categoriesWithTemplates = templateCategories.filter(
    (cat) => templatesByCategory[cat]?.length > 0
  );

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
                Templates
              </span>
              <h1
                className={`text-4xl lg:text-5xl font-display tracking-tight mb-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "100ms" }}
              >
                Choose a starting point
              </h1>
              <p
                className={`text-base lg:text-lg text-muted-foreground leading-relaxed mb-8 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "200ms" }}
              >
                Structured baselines to accelerate scoping and delivery.
                Not themes, not boxed products, just credible starting points.
              </p>
              <div
                className={`flex flex-wrap gap-4 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "300ms" }}
              >
                <Link
                  href={siteRoutes.maxwell}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
                >
                  Start with Maxwell
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={siteRoutes.services}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  View services
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

      {/* Categories */}
      <section className="site-section bg-secondary/30">
        <div className="site-shell">
          <div className="flex items-center justify-between mb-8">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
              <span className="w-8 h-px" style={{ backgroundColor: templateBrandTone.accent }} />
              Categories
            </span>
            <span className="text-sm" style={{ color: templateBrandTone.accent }}>
              {categoriesWithTemplates.length} categories
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categoriesWithTemplates.map((category, index) => (
              <CategoryCard
                key={category}
                category={category}
                templates={templatesByCategory[category]}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All Templates — animated mockup cards */}
      <section className="site-section">
        <div className="site-shell">
          <div className="flex items-center justify-between mb-8">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
              <span className="w-8 h-px" style={{ backgroundColor: templateBrandTone.accent }} />
              All templates
            </span>
            <span className="text-sm" style={{ color: templateBrandTone.accent }}>
              {templates.length} templates
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            Not sure which template fits?
          </h2>
          <p className="text-background/70 mb-8 max-w-md mx-auto">
            Let Maxwell help you find the right starting point.
          </p>
          <Link
            href={siteRoutes.maxwell}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
          >
            Start with Maxwell
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SitePageFrame>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function CategoryCard({
  category,
  templates: categoryTemplates,
  index,
}: {
  category: TemplateCategory;
  templates: TemplateItem[];
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLAnchorElement>({ threshold: 0.15 });
  const firstTemplate = categoryTemplates[0];
  const tone = templateCategoryTones[category];

  return (
    <Link
      ref={cardRef}
      href={`#${category.toLowerCase().replace(/\s+/g, "-")}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{
        transitionDelay: `${index * 55}ms`,
        borderColor: isHovered ? tone.border : "var(--border)",
        boxShadow: isHovered ? `0 24px 48px -28px ${tone.border}` : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/40">
        {firstTemplate?.image && (
          <Image
            src={firstTemplate.image}
            alt={category}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
          />
        )}
        {/* Gradient overlay — stronger on hover */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to top, ${tone.accent}cc 0%, transparent 60%)`,
            opacity: isHovered ? 0.7 : 0.35,
          }}
        />
        {/* Top badge */}
        <div className="absolute left-3 top-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-mono backdrop-blur-sm transition-all duration-300"
            style={{
              borderColor: tone.border,
              backgroundColor: isHovered ? tone.surface : "rgba(255,255,255,0.85)",
              color: tone.accent,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: tone.accent }} />
            {categoryTemplates.length} template{categoryTemplates.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <h3 className="text-sm font-medium">{category}</h3>
        <span
          className="text-[10px] font-mono transition-colors duration-300"
          style={{ color: isHovered ? tone.accent : "var(--muted-foreground)" }}
        >
          →
        </span>
      </div>

      {/* Accent bar bottom */}
      <div
        className="absolute bottom-0 left-0 h-[2px] transition-all duration-500"
        style={{ backgroundColor: tone.accent, width: isHovered ? "100%" : "0%" }}
      />
    </Link>
  );
}

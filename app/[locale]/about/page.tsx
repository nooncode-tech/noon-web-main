"use client";

import { useState } from "react";
import { ArrowRight, Code2, Route, Zap, Terminal, Shield, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";
import { FaqSection } from "@/components/landing/faq-section";

const LOCALES = ["en", "es", "fr", "de"];

const technologyGroups = [
  { title: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind"], tone: siteTones.client },
  { title: "Backend", items: ["Node.js", "Python", "PostgreSQL"], tone: siteTones.brandDeep },
  { title: "AI", items: ["OpenAI", "Embeddings", "Workflow automation"], tone: siteTones.data },
  { title: "Infrastructure", items: ["Vercel", "Supabase", "Edge"], tone: siteTones.gateway },
  { title: "Commerce", items: ["Stripe", "Subscriptions", "Marketplace"], tone: siteTones.services },
  { title: "Mobile", items: ["Flutter", "Native integrations"], tone: siteTones.client },
];


// ============================================================================
// SPOTLIGHT CARD
// ============================================================================

function SpotlightCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - card.left, y: e.clientY - card.top });
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      className={`relative rounded-xl border border-foreground/8 bg-card/80 overflow-hidden group cursor-default transition-all duration-700 hover:border-foreground/16 hover:shadow-sm ${className} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            width: 400,
            height: 400,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, oklch(0.3 0.02 60 / 0.08) 0%, transparent 70%)",
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function AboutPage() {
  const t = useTranslations("about");
  const params = useParams();
  const paramLocale = typeof params?.locale === "string" ? params.locale : null;
  const locale = (paramLocale && LOCALES.includes(paramLocale) ? paramLocale : null) ?? "en";

  const lp = (href: string) => `/${locale}${href}`;

  type PrincipleItem = { number: string; title: string; description: string };
  type OptimizeItem = { title: string; description: string };
  const principles = t.raw("operatingModel.principles") as PrincipleItem[];
  const notNoon = t.raw("operatingModel.notNoon") as string[];
  const optimizeFor = t.raw("criteria.items") as OptimizeItem[];

  const { ref: headerRef, isVisible: headerVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SitePageFrame>
      {/* Hero */}
      <section ref={headerRef} className="site-hero-section">
        <div className="site-shell">
          <div className="max-w-3xl">
            <span
              className={`inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <span className="w-8 h-px" style={{ backgroundColor: siteTones.brand.accent }} />
              {t("hero.eyebrow")}
            </span>
            <h1
              className={`text-4xl lg:text-5xl font-display tracking-tight mb-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "100ms" }}
            >
              {t("hero.headline")}
              <br />
              <span className="text-muted-foreground">{t("hero.headlineMuted")}</span>
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
                {t("cta.viewServices")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Thesis - Bento Grid */}
      <section className="site-section-lg">
        <div className="site-shell">
          <div className="max-w-3xl mb-12">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-secondary/50 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: siteTones.brand.accent }} />
              {t("thesis.eyebrow")}
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight">
              {t("thesis.headline")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
            <SpotlightCard className="md:col-span-2 lg:col-span-7 p-6 lg:p-8" delay={0}>
              <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-5">
                <Code2 className="w-6 h-6" />
              </div>
              <span className="inline-block text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full mb-4">
                {t("thesis.productionGrade")}
              </span>
              <h3 className="text-2xl lg:text-3xl font-display mb-4">
                {t("thesis.mainTitle")}
              </h3>
              <p className="text-base lg:text-[17px] text-muted-foreground leading-relaxed max-w-xl mb-6">
                {t("thesis.mainDescription")}
              </p>
              <div className="bg-foreground/5 rounded-xl p-4 lg:p-5 font-mono text-sm border border-border">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Terminal className="w-4 h-4" />
                  <span>your-project/</span>
                </div>
                <div className="space-y-1.5">
                  {["src/", "  components/", "  app/", "  api/", "package.json"].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 ${i === 0 || i === 2 ? "text-foreground" : "text-muted-foreground/60"}`}>
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>

            <div className="md:col-span-2 lg:col-span-5 grid gap-4 lg:gap-6">
              <SpotlightCard className="p-6 lg:p-7" delay={100}>
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Route className="w-5 h-5" />
                </div>
                <h3 className="text-lg lg:text-xl font-display mb-3">{t("thesis.clearProcess")}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-6">{t("thesis.clearProcessDescription")}</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className={`h-1.5 flex-1 rounded-full ${step <= 3 ? "bg-foreground" : "bg-foreground/20"}`} />
                  ))}
                </div>
              </SpotlightCard>

              <SpotlightCard className="p-6 lg:p-7" delay={200}>
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg lg:text-xl font-display mb-3">{t("thesis.aiAccelerated")}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-6">{t("thesis.aiAcceleratedDescription")}</p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{t("thesis.maxwellProcessing")}</span>
                </div>
              </SpotlightCard>
            </div>

            <SpotlightCard className="lg:col-span-6 p-6 lg:p-7" delay={300}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display">{t("thesis.enterpriseReady")}</h3>
                  <p className="text-sm text-muted-foreground">{t("thesis.enterpriseReadyDescription")}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="lg:col-span-6 p-6 lg:p-7" delay={400}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display">{t("thesis.codeOwnership")}</h3>
                  <p className="text-sm text-muted-foreground">{t("thesis.codeOwnershipDescription")}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Criteria */}
      <section className="site-section-lg bg-secondary/30">
        <div className="site-shell">
          <div className="max-w-2xl mb-10">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-secondary/50 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: siteTones.brand.accent }} />
              {t("criteria.eyebrow")}
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight">
              {t("criteria.headline")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {optimizeFor.map((item, index) => (
              <OptimizeCard key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Operating Model */}
      <section className="site-section-lg">
        <div className="site-shell">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-secondary/50 px-3 py-1 text-xs font-mono text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: siteTones.brand.accent }} />
                {t("operatingModel.eyebrow")}
              </span>
              <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-8">
                {t("operatingModel.headline")}
              </h2>
              <div className="space-y-8">
                {principles.map((principle, index) => (
                  <PrincipleItem key={principle.number} principle={principle} index={index} />
                ))}
              </div>
            </div>

            <div>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-secondary/50 px-3 py-1 text-xs font-mono text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: siteTones.brand.accent }} />
                {t("operatingModel.boundariesEyebrow")}
              </span>
              <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-8">
                {t("operatingModel.boundariesHeadline")}
              </h2>
              <div className="space-y-4">
                {notNoon.map((item, index) => (
                  <NotNoonItem key={index} text={item} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" className="site-section-lg bg-secondary/30">
        <div className="site-shell">
          <div className="max-w-2xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-secondary/50 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: siteTones.brand.accent }} />
              {t("stack.eyebrow")}
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
              {t("stack.headline")}
            </h2>
            <p className="text-muted-foreground">{t("stack.description")}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {technologyGroups.map((group, index) => (
              <TechCard key={group.title} group={group} index={index} inStack={t("stack.inStack")} tools={t("stack.tools")} />
            ))}
          </div>
        </div>
      </section>

      <FaqSection />

      {/* CTA */}
      <section className="site-section-lg bg-foreground text-background relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] translate-x-1/3 -translate-y-1/3 rounded-full opacity-[0.12] blur-[80px]" style={{ background: "radial-gradient(circle, #6a63f2 0%, transparent 70%)" }} />
        <div className="site-shell text-center relative z-10">
          <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
            {t("cta.headline")}
          </h2>
          <p className="text-background/70 mb-8 max-w-md mx-auto">
            {t("cta.description")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={siteRoutes.maxwell}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
            >
              {t("cta.startWithMaxwell")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={lp(siteRoutes.services)}
              className="inline-flex items-center gap-2 rounded-full border border-background/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-background/10"
            >
              {t("cta.viewServices")}
            </Link>
          </div>
        </div>
      </section>
    </SitePageFrame>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PrincipleItem({ principle, index }: { principle: { number: string; title: string; description: string }; index: number }) {
  const { ref, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });
  return (
    <div
      ref={ref}
      className={`flex items-start gap-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <span className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center font-mono text-sm text-muted-foreground shrink-0">
        {principle.number}
      </span>
      <div>
        <h3 className="text-lg font-display mb-2">{principle.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{principle.description}</p>
      </div>
    </div>
  );
}

function NotNoonItem({ text, index }: { text: string; index: number }) {
  const { ref, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });
  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 p-4 rounded-xl border border-foreground/8 bg-card/80 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <X className="w-3 h-3 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function OptimizeCard({ item, index }: { item: { title: string; description: string }; index: number }) {
  const { ref, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={`rounded-xl border border-foreground/8 bg-card/80 p-6 transition-all duration-700 hover:border-foreground/14 hover:shadow-sm ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <span className="text-xs font-mono text-muted-foreground mb-3 block">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="text-base font-display mb-2">{item.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
    </div>
  );
}

function TechCard({ group, index, inStack, tools }: {
  group: (typeof technologyGroups)[0];
  index: number;
  inStack: string;
  tools: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`group relative rounded-xl border border-foreground/8 bg-card/80 p-5 transition-all duration-700 overflow-hidden ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{
        transitionDelay: `${index * 80}ms`,
        borderColor: isHovered ? group.tone.border : undefined,
        boxShadow: isHovered ? `0 20px 40px -34px ${group.tone.shadow}` : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-display">{group.title}</h3>
        <span
          className={`flex items-center gap-1.5 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          style={{ color: group.tone.accent }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: group.tone.accent }} />
          <span className="text-[9px] font-mono">{inStack}</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {group.items.map((item, i) => (
          <span
            key={item}
            className="rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all duration-300"
            style={{
              transitionDelay: `${i * 50}ms`,
              borderColor: isHovered ? group.tone.border : "color-mix(in srgb, var(--foreground) 8%, transparent)",
              backgroundColor: isHovered ? group.tone.strongSurface : "color-mix(in srgb, var(--foreground) 4%, transparent)",
              color: isHovered ? group.tone.accent : "color-mix(in srgb, var(--foreground) 62%, transparent)",
            }}
          >
            {item}
          </span>
        ))}
      </div>
      <div className={`mt-4 transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: isHovered ? `${60 + index * 10}%` : "0%", backgroundColor: group.tone.accent }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground font-mono">{group.items.length} {tools}</span>
        </div>
      </div>
    </div>
  );
}

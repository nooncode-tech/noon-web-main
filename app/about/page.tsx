"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Code2, Route, Zap, Terminal, Shield, X } from "lucide-react";
import Link from "next/link";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { siteRoutes } from "@/lib/site-config";
import { siteChromeDots, siteTones } from "@/lib/site-tones";
import { FaqSection } from "@/components/landing/faq-section";

// ============================================================================
// DATA
// ============================================================================

const principles = [
  {
    number: "01",
    title: "Start from the problem",
    description: "Most valuable conversations start with operational friction, not a stack wishlist.",
  },
  {
    number: "02",
    title: "Translate to a real build path",
    description: "The path becomes explicit enough to scope and deliver: internal system, product, workflow, or custom architecture.",
  },
  {
    number: "03",
    title: "Execute with AI as leverage",
    description: "AI compresses repetitive work but does not remove the need for architecture or product judgment.",
  },
];

const notNoon = [
  "No-code shortcuts that collapse when logic gets serious",
  "Generic marketplace for every kind of interest",
  "Product theater hiding weak delivery behind polish",
];

const optimizeFor = [
  {
    title: "Scope before execution",
    description: "Direction is defined and agreed before production code is written. Ambiguity is resolved at the start, not during development.",
  },
  {
    title: "Working software, not documentation",
    description: "Every project ends with deployed, runnable code — not specs, wireframes, or prototypes delivered as a final product.",
  },
  {
    title: "Explicit exclusions",
    description: "What is not included is clearly stated. Vague scope is the main cause of misaligned expectations; we eliminate it by design.",
  },
  {
    title: "Judgment, not blind execution",
    description: "The right question is what should be built, not just what was asked for. Product judgment is part of every project.",
  },
];

const technologyGroups = [
  { title: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind"], tone: siteTones.client },
  { title: "Backend", items: ["Node.js", "Python", "PostgreSQL"], tone: siteTones.brandDeep },
  { title: "AI", items: ["OpenAI", "Embeddings", "Workflow automation"], tone: siteTones.data },
  { title: "Infrastructure", items: ["Vercel", "Supabase", "Edge"], tone: siteTones.gateway },
  { title: "Commerce", items: ["Stripe", "Subscriptions", "Marketplace"], tone: siteTones.services },
  { title: "Mobile", items: ["Flutter", "Native integrations"], tone: siteTones.client },
];

// ============================================================================
// OPERATING METRICS
// ============================================================================

function OperatingMetrics() {
  const { ref: metricsRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  const metrics = [
    { label: "Code-first delivery", value: "100%", description: "Every project ships as production code" },
    { label: "Scope direction", value: "Clear", description: "The first direction is defined before build work starts" },
    { label: "AI-assisted workflows", value: "Active", description: "Tooling accelerates execution without replacing judgment" },
  ];

  return (
    <div
      ref={metricsRef}
      className={`grid gap-4 md:grid-cols-3 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`relative rounded-2xl border border-border bg-card p-6 overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: `${index * 150}ms` }}
        >
          {/* Animated background bar */}
          <div 
            className="absolute bottom-0 left-0 h-1 transition-all duration-1000"
            style={{ 
              width: isVisible ? "100%" : "0%",
              transitionDelay: `${index * 200 + 500}ms`,
              backgroundColor: "#1200c5"
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-baseline gap-1 mb-2">
              <span 
                className={`text-4xl font-display transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
                style={{ transitionDelay: `${index * 150 + 200}ms` }}
              >
                {metric.value}
              </span>
            </div>
            <h3 className="text-sm font-medium mb-1">{metric.label}</h3>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ARCHITECTURE DIAGRAM
// ============================================================================

function ArchitectureDiagram() {
  const [activeLayer, setActiveLayer] = useState(0);
  const { ref: diagramRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveLayer((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const layers = [
    { name: "Client", items: ["Web", "Mobile", "API"], tone: siteTones.client },
    { name: "Gateway", items: ["Auth", "Rate Limit", "Cache"], tone: siteTones.gateway },
    { name: "Services", items: ["Core", "AI", "Events"], tone: siteTones.services },
    { name: "Data", items: ["DB", "Storage", "Search"], tone: siteTones.data },
  ];

  return (
    <div
      ref={diagramRef}
      className={`rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.red }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.amber }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.green }} />
        </div>
        <span className="text-xs font-mono text-muted-foreground">architecture.sys</span>
      </div>

      {/* Diagram */}
      <div className="p-5 space-y-2">
        {layers.map((layer, index) => (
          <div
            key={layer.name}
            className={`rounded-xl border p-3 transition-all duration-500 ${index === activeLayer ? "scale-[1.02]" : "scale-100"} ${index <= activeLayer || isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
            style={{
              transitionDelay: `${index * 100}ms`,
              borderColor: layer.tone.border,
              backgroundColor: layer.tone.surface,
              boxShadow: index === activeLayer ? `0 20px 36px -28px ${layer.tone.shadow}` : "none",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground">{layer.name}</span>
              {index === activeLayer && (
                <span className="flex items-center gap-1.5" style={{ color: layer.tone.accent }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: layer.tone.accent }} />
                  <span className="text-[10px]">Active</span>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {layer.items.map((item, i) => (
                <div
                  key={item}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-center text-[10px] font-mono transition-all duration-300 ${index === activeLayer ? "text-foreground" : "text-muted-foreground"}`}
                  style={{
                    transitionDelay: `${i * 50}ms`,
                    backgroundColor: index === activeLayer ? layer.tone.mutedSurface : "rgba(255, 255, 255, 0.6)",
                    border: `1px solid ${index === activeLayer ? layer.tone.border : "rgba(24, 21, 18, 0.06)"}`,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Data flow indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="flex-1 h-px bg-foreground/15" />
          <span className="text-[10px] text-muted-foreground font-mono">Data Flow</span>
          <div className="flex-1 h-px bg-foreground/15" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTS
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
    setMousePos({
      x: e.clientX - card.left,
      y: e.clientY - card.top,
    });
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      className={`relative rounded-xl border border-border bg-card overflow-hidden group cursor-default transition-all duration-700 hover:border-foreground/20 ${className} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Spotlight effect */}
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
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function AboutPage() {
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
              Company
            </span>
            <h1 
              className={`text-4xl lg:text-5xl font-display tracking-tight mb-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "100ms" }}
            >
              A code-first company
              <br />
              <span className="text-muted-foreground">built around real delivery.</span>
            </h1>
            <p 
              className={`text-base lg:text-lg text-muted-foreground leading-relaxed mb-8 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "200ms" }}
            >
              Noon turns ambiguous software demand into concrete scope and delivers it in code. 
              Execution quality, product judgment, AI-assisted leverage.
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
                href={siteRoutes.contact}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Contact Noon
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Thesis - Bento Grid */}
      <section className="site-section-lg">
        <div className="site-shell">
          <div className="max-w-3xl mb-12">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-8 h-px" style={{ backgroundColor: siteTones.brand.accent }} />
              Thesis
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight">
              Why the model exists
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
            {/* Large card - Main thesis */}
            <SpotlightCard className="md:col-span-2 lg:col-span-7 p-6 lg:p-8" delay={0}>
              <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-5">
                <Code2 className="w-6 h-6" />
              </div>
              <span className="inline-block text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full mb-4">
                Production-grade
              </span>
              <h3 className="text-2xl lg:text-3xl font-display mb-4">
                Turn ambiguity into real delivery.
              </h3>
              <p className="text-base lg:text-[17px] text-muted-foreground leading-relaxed max-w-xl mb-6">
                Noon is built for situations where the need is real but the software shape is still unclear. 
                The job is to turn that ambiguity into scoped, production-minded execution.
              </p>
              {/* Code preview */}
              <div className="bg-foreground/5 rounded-xl p-4 lg:p-5 font-mono text-sm border border-border">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Terminal className="w-4 h-4" />
                  <span>your-project/</span>
                </div>
                <div className="space-y-1.5">
                  {["src/", "  components/", "  app/", "  api/", "package.json"].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 ${i === 0 || i === 2 ? "text-foreground" : "text-muted-foreground/60"}`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>

            {/* Right column */}
            <div className="md:col-span-2 lg:col-span-5 grid gap-4 lg:gap-6">
              {/* Clear process */}
              <SpotlightCard className="p-6 lg:p-7" delay={100}>
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Route className="w-5 h-5" />
                </div>
                <h3 className="text-lg lg:text-xl font-display mb-3">
                  Clear process
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-6">
                  From initial conversation to deployment, every step is transparent.
                </p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full ${step <= 3 ? "bg-foreground" : "bg-foreground/20"}`}
                    />
                  ))}
                </div>
              </SpotlightCard>

              {/* AI-accelerated */}
              <SpotlightCard className="p-6 lg:p-7" delay={200}>
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg lg:text-xl font-display mb-3">
                  AI-accelerated
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-6">
                  Maxwell handles scoping, and our tools accelerate development without sacrificing quality.
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Maxwell processing</span>
                </div>
              </SpotlightCard>
            </div>

            {/* Bottom row - horizontal cards */}
            <SpotlightCard className="lg:col-span-6 p-6 lg:p-7" delay={300}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display">Enterprise-ready</h3>
                  <p className="text-sm text-muted-foreground">Built for scale, security, and long-term maintainability.</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="lg:col-span-6 p-6 lg:p-7" delay={400}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display">Code ownership</h3>
                  <p className="text-sm text-muted-foreground">
                    Ownership depends on the engagement model, while client data remains the client&apos;s.
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Operating Model */}
      <section className="site-section-lg bg-secondary/30">
        <div className="site-shell">
          {/* Metrics visualization */}
          <OperatingMetrics />
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mt-16">
            {/* Left: principles */}
            <div>
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
                <span className="w-8 h-px" style={{ backgroundColor: siteTones.brand.accent }} />
                Operating model
              </span>
              <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-8">
                How we work
              </h2>
              
              <div className="space-y-8">
                {principles.map((principle, index) => (
                  <PrincipleItem key={principle.number} principle={principle} index={index} />
                ))}
              </div>
            </div>

            {/* Right: what we're not */}
            <div>
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
                <span className="w-8 h-px" style={{ backgroundColor: siteTones.brand.accent }} />
                Boundaries
              </span>
              <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-8">
                What Noon is not
              </h2>
              
              <div className="space-y-4">
                {notNoon.map((item, index) => (
                  <NotNoonItem key={item} text={item} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we optimize for */}
      <section className="site-section-lg">
        <div className="site-shell">
          <div className="max-w-2xl mb-10">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-8 h-px" style={{ backgroundColor: siteTones.brand.accent }} />
              Criteria
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight">
              What we focus on
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {optimizeFor.map((item, index) => (
              <OptimizeCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" className="site-section-lg">
        <div className="site-shell">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-8 h-px" style={{ backgroundColor: siteTones.brand.accent }} />
              Stack
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
              Technology we use
            </h2>
            <p className="text-muted-foreground">
              Technology choices follow the product, not the other way around.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(500px,0.95fr)] lg:gap-12 xl:gap-16">
            <div className="grid gap-4 sm:grid-cols-2">
              {technologyGroups.map((group, index) => (
                <TechCard key={group.title} group={group} index={index} />
              ))}
            </div>

            <div className="hidden lg:block lg:sticky lg:top-8">
              <ArchitectureDiagram />
            </div>
          </div>
        </div>
      </section>

      <FaqSection />

      {/* CTA */}
      <section className="site-section-lg bg-foreground text-background">
        <div className="site-shell text-center">
          <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
            Ready to build?
          </h2>
          <p className="text-background/70 mb-8 max-w-md mx-auto">
            Start a conversation with Maxwell or reach out directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={siteRoutes.maxwell}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
            >
              Start with Maxwell
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={siteRoutes.services}
              className="inline-flex items-center gap-2 rounded-full border border-background/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-background/10"
            >
              View services
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

function PrincipleItem({ principle, index }: { principle: typeof principles[0]; index: number }) {
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
      className={`flex items-start gap-3 p-4 rounded-xl border border-border bg-card transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <X className="w-3 h-3 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function OptimizeCard({ item, index }: { item: typeof optimizeFor[0]; index: number }) {
  const { ref, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`rounded-xl border border-border bg-card p-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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

function TechCard({ group, index }: { group: typeof technologyGroups[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`group relative rounded-xl border border-border bg-card p-5 transition-all duration-700 hover:border-foreground/20 overflow-hidden ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{
        transitionDelay: `${index * 80}ms`,
        borderColor: isHovered ? group.tone.border : undefined,
        boxShadow: isHovered ? `0 20px 40px -34px ${group.tone.shadow}` : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with activity indicator */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-display">{group.title}</h3>
        <span
          className={`flex items-center gap-1.5 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          style={{ color: group.tone.accent }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: group.tone.accent }} />
          <span className="text-[9px] font-mono">In stack</span>
        </span>
      </div>
      
      {/* Tech items with stagger animation */}
      <div className="flex flex-wrap gap-1.5">
        {group.items.map((item, i) => (
          <span
            key={item}
            className="rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all duration-300"
            style={{
              transitionDelay: `${i * 50}ms`,
              borderColor: isHovered ? group.tone.border : "rgba(24, 21, 18, 0.08)",
              backgroundColor: isHovered ? group.tone.strongSurface : "rgba(24, 21, 18, 0.04)",
              color: isHovered ? group.tone.accent : "rgba(24, 21, 18, 0.62)",
            }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Usage bar */}
      <div className={`mt-4 transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: isHovered ? `${60 + index * 10}%` : "0%",
                backgroundColor: group.tone.accent,
              }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground font-mono">{group.items.length} tools</span>
        </div>
      </div>
    </div>
  );
}

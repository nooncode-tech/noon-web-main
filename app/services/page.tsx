"use client";

import { Fragment, useEffect, useState, memo } from "react";
import { ArrowRight, Bot, Globe, Smartphone, Wrench, RefreshCw, LayoutDashboard, Rocket, Puzzle } from "lucide-react";
import Link from "next/link";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { siteRoutes } from "@/lib/site-config";
import { siteChromeDots, siteTones } from "@/lib/site-tones";

const servicesEyebrowTone = siteTones.brand;

// ============================================================================
// PREVIEW MOCKUPS (same style as home)
// ============================================================================

function AIPreviewMockup({ isActive }: { isActive: boolean }) {
  return (
    <div className={`w-full h-full rounded-xl bg-background border border-border overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="p-3 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: siteChromeDots.red }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: siteChromeDots.amber }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: siteChromeDots.green }} />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground ml-2">AI Workflow</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-3">
          {["Input", "Process", "Output"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <span className="text-[9px] font-mono text-muted-foreground">{step}</span>
              </div>
              {i < 2 && (
                <div className={`w-6 h-px bg-foreground/20 transition-all duration-300 ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} style={{ transitionDelay: `${i * 150 + 100}ms` }} />
              )}
            </div>
          ))}
        </div>
        <div className={`flex items-center gap-2 pt-3 border-t border-border transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '500ms' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: siteTones.gateway.accent }} />
          <span className="text-[10px]" style={{ color: siteTones.gateway.accent }}>Automation running</span>
        </div>
      </div>
    </div>
  );
}

function WebPreviewMockup({ isActive }: { isActive: boolean }) {
  return (
    <div className={`w-full h-full rounded-xl bg-background border border-border overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: siteChromeDots.red }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: siteChromeDots.amber }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: siteChromeDots.green }} />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-secondary rounded-md px-2 py-1 text-[9px] text-muted-foreground font-mono">
            yourdomain.com
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className={`flex justify-between items-center transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '150ms' }}>
          <div className="w-10 h-2.5 bg-foreground rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="w-8 h-2 bg-foreground/20 rounded" />)}
          </div>
        </div>
        <div className={`mt-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '250ms' }}>
          <div className="w-20 h-3 bg-foreground/80 rounded mb-2" />
          <div className="w-28 h-2.5 bg-foreground/30 rounded mb-3" />
          <div className="w-12 h-5 bg-foreground rounded-full" />
        </div>
        <div className={`grid grid-cols-3 gap-2 mt-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '350ms' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-square bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobilePreviewMockup({ isActive }: { isActive: boolean }) {
  return (
    <div className={`w-full h-full flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="w-24 h-44 bg-foreground rounded-[1.6rem] p-1.5 shadow-lg">
        <div className="w-full h-full bg-background rounded-[1.2rem] overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-2.5 bg-foreground rounded-b-xl" />
          <div className="pt-4 px-2 pb-2 h-full flex flex-col">
            <div className={`flex justify-between items-center mb-3 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '150ms' }}>
              <span className="text-[6px] font-mono">9:41</span>
              <div className="flex gap-0.5">
                <div className="w-2 h-1.5 bg-foreground/50 rounded-sm" />
                <div className="w-2 h-1.5 bg-foreground/50 rounded-sm" />
              </div>
            </div>
            <div className={`flex items-center gap-2 mb-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: siteTones.data.surface }} />
              <div className="w-10 h-2 bg-foreground/80 rounded" />
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={`bg-secondary rounded-lg p-2 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                  style={{ transitionDelay: `${250 + i * 100}ms` }}
                >
                  <div className="w-full h-1.5 bg-foreground/20 rounded mb-1" />
                  <div className="w-2/3 h-1.5 bg-foreground/10 rounded" />
                </div>
              ))}
            </div>
            <div className={`flex justify-around pt-2 border-t border-border transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '550ms' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-3 h-3 rounded ${i === 1 ? 'bg-foreground' : 'bg-foreground/20'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomPreviewMockup({ isActive }: { isActive: boolean }) {
  return (
    <div className={`w-full h-full rounded-xl bg-background border border-border overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="p-3 h-full flex flex-col">
        <div className={`flex items-center justify-between mb-3 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-foreground/60" />
            <span className="text-[10px] font-mono text-muted-foreground">Custom System</span>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px]"
            style={{ color: siteTones.brandDeep.accent, backgroundColor: siteTones.brandDeep.surface }}
          >
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: siteTones.brandDeep.accent }} />
            Active
          </span>
        </div>
        <div className="flex-1 space-y-2">
          {[
            { width: "85%", delay: 150 },
            { width: "70%", delay: 250 },
            { width: "90%", delay: 350 },
            { width: "60%", delay: 450 },
          ].map((line, i) => (
            <div 
              key={i}
              className={`h-2.5 bg-secondary rounded transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ width: line.width, transitionDelay: `${line.delay}ms` }}
            />
          ))}
        </div>
        <div className={`flex items-center gap-2 pt-3 border-t border-border transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '550ms' }}>
          <span className="text-[9px] text-muted-foreground">Integrates with:</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-5 h-5 rounded bg-secondary flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-sm bg-foreground/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DATA
// ============================================================================

const buildCategories = [
  {
    number: "01",
    slug: "ai-and-automation",
    title: "AI & Automation",
    description: "Intelligent assistants, workflow automation, and AI-powered tooling for teams that need speed without losing operational control.",
    icon: Bot,
    examples: ["AI assistants", "Automated workflows", "Smart integrations"],
    PreviewMockup: AIPreviewMockup,
    tone: siteTones.gateway,
  },
  {
    number: "02",
    slug: "web-solutions",
    title: "Web Solutions",
    description: "From customer-facing experiences to internal platforms, built as real software with production-grade architecture.",
    icon: Globe,
    examples: ["Web platforms", "Dashboards", "Portals"],
    PreviewMockup: WebPreviewMockup,
    tone: siteTones.client,
  },
  {
    number: "03",
    slug: "mobile-solutions",
    title: "Mobile Solutions",
    description: "Native and cross-platform mobile applications focused on clear flows and operational reliability.",
    icon: Smartphone,
    examples: ["iOS apps", "Android apps", "Cross-platform"],
    PreviewMockup: MobilePreviewMockup,
    tone: siteTones.data,
  },
  {
    number: "04",
    slug: "custom-software",
    title: "Custom Software",
    description: "Software shaped around your internal logic and non-standard workflows when generic systems stop being useful.",
    icon: Wrench,
    examples: ["Internal tools", "Custom integrations", "Business systems"],
    PreviewMockup: CustomPreviewMockup,
    tone: siteTones.brandDeep,
  },
];

const solutionPaths = [
  {
    icon: RefreshCw,
    problem: "Manual work that should be automated",
    summary: "AI-assisted workflows for teams losing time to repetitive work and human bottlenecks.",
    signals: ["Copying data between tools", "Progress depends on one operator"],
    tone: siteTones.gateway,
  },
  {
    icon: LayoutDashboard,
    problem: "Operations that need one central system",
    summary: "Dashboards and portals that consolidate data, workflows, and reporting into one surface.",
    signals: ["Data across disconnected tools", "No clear source of truth"],
    tone: siteTones.client,
  },
  {
    icon: Rocket,
    problem: "A product that needs to launch as real software",
    summary: "Production-minded builds for founders who understand the problem and need something real.",
    signals: ["Customer problem is validated", "Bottleneck is execution"],
    tone: siteTones.brand,
  },
  {
    icon: Puzzle,
    problem: "Workflows that generic tools don't fit",
    summary: "Custom software built around business logic that breaks inside generic tools.",
    signals: ["Relying on workarounds", "Off-the-shelf tools don't fit"],
    tone: siteTones.data,
  },
];

const processSteps = [
  {
    number: "01",
    diagramLabel: "Constraint",
    title: "Clarify the constraint",
    description: "Isolate the business problem and the bottleneck that justifies software work.",
    status: "Clarifying the constraint",
    output: "A clear problem statement and the bottleneck worth solving in software.",
    tone: siteTones.services,
  },
  {
    number: "02",
    diagramLabel: "Path",
    title: "Translate to software path",
    description: "Choose the right shape: workflow system, platform, product, or custom architecture.",
    status: "Mapping the software path",
    output: "A recommended software direction matched to the actual operating need.",
    tone: siteTones.brand,
  },
  {
    number: "03",
    diagramLabel: "Delivery",
    title: "Move into scoped delivery",
    description: "Turn direction into proposal, build scope, and delivery plan.",
    status: "Preparing scoped delivery",
    output: "Proposal, build scope, and delivery plan ready for execution.",
    tone: siteTones.data,
  },
];

// ============================================================================
// PROCESS FLOW DIAGRAM
// ============================================================================

function ProcessFlowDiagram() {
  const [activeStep, setActiveStep] = useState(0);
  const { ref: diagramRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % processSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);
  const currentStep = processSteps[activeStep];

  return (
    <div
      ref={diagramRef}
      className={`relative rounded-2xl border border-border bg-card p-6 overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: siteChromeDots.red }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: siteChromeDots.amber }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: siteChromeDots.green }} />
        </div>
        <span className="text-xs font-mono text-muted-foreground ml-2">process.flow</span>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          {processSteps.map((step, index) => (
            <Fragment key={step.number}>
              <div className={`flex min-w-0 flex-1 items-center gap-3 transition-all duration-500 sm:block ${index <= activeStep ? "opacity-100" : "opacity-50"}`}>
                <div
                  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xs font-mono transition-all duration-300 sm:mx-auto ${
                    index === activeStep
                      ? "text-white shadow-sm"
                      : index < activeStep
                        ? "text-foreground"
                        : "bg-background text-muted-foreground"
                  }`}
                  style={{
                    borderColor: index <= activeStep ? step.tone.border : undefined,
                    backgroundColor:
                      index === activeStep
                        ? step.tone.accent
                        : index < activeStep
                          ? step.tone.surface
                          : undefined,
                    boxShadow: index === activeStep ? `0 16px 28px -22px ${step.tone.shadow}` : "none",
                  }}
                >
                  <span
                    className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: index === activeStep ? "#ffffff" : step.tone.accent }}
                  />
                  {step.number}
                </div>
                <div className="min-w-0 sm:mt-3 sm:text-center">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] transition-colors duration-300">
                    <span
                      className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
                      style={{ backgroundColor: step.tone.accent, opacity: index <= activeStep ? 1 : 0.5 }}
                    />
                    <span
                      className={index === activeStep ? "" : "text-muted-foreground"}
                      style={index <= activeStep ? { color: step.tone.accent } : undefined}
                    >
                      {step.diagramLabel}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {step.output}
                  </p>
                </div>
              </div>
              {index < processSteps.length - 1 && (
                <div className="ml-5 h-8 w-px shrink-0 sm:ml-0 sm:mt-5 sm:h-px sm:flex-1">
                  <div
                    className="h-full w-full transition-all duration-500"
                    style={{
                      backgroundColor: activeStep > index ? processSteps[index + 1].tone.accent : "rgba(24, 21, 18, 0.12)",
                    }}
                  />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div
          className="rounded-xl border bg-secondary/30 p-4"
          style={{ borderColor: currentStep.tone.border }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <span
                className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em]"
                style={{ color: currentStep.tone.accent }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: currentStep.tone.accent }}
                />
                Current focus
              </span>
              <h3 className="mt-2 text-base font-display">
                {currentStep.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {currentStep.description}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-mono"
              style={{
                color: currentStep.tone.contrast,
                borderColor: currentStep.tone.accent,
                backgroundColor: currentStep.tone.accent,
              }}
            >
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: currentStep.tone.contrast }}
              />
              {currentStep.status}
            </span>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <span
              className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em]"
              style={{ color: currentStep.tone.accent }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: currentStep.tone.accent }}
              />
              Output
            </span>
            <p className="mt-2 text-sm leading-relaxed">
              {currentStep.output}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================ 
// COMPONENTS
// ============================================================================

function ProcessStep({ 
  step, 
  index, 
  isLast 
}: { 
  step: (typeof processSteps)[number]; 
  index: number;
  isLast: boolean;
}) {
  const { ref: stepRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div
      ref={stepRef}
      className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Number with line */}
        <div className="flex flex-col items-center">
          <span
            className="relative flex h-10 w-10 items-center justify-center rounded-full border font-mono text-sm text-muted-foreground"
            style={{
              borderColor: step.tone.border,
              backgroundColor: step.tone.surface,
              boxShadow: `0 12px 24px -24px ${step.tone.shadow}`,
              color: step.tone.accent,
            }}
          >
            <span
              className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: step.tone.accent }}
            />
            {step.number}
          </span>
          {!isLast && (
            <div
              className="mt-3 h-full min-h-[60px] w-px"
              style={{ backgroundColor: step.tone.border }}
            />
          )}
        </div>
        
        {/* Content */}
        <div className="pb-8">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-display">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: step.tone.accent }}
            />
            {step.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
          <p className="mt-3 inline-flex items-start gap-2 text-[11px] font-mono uppercase tracking-[0.16em]">
            <span
              className="mt-[0.15rem] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: step.tone.accent }}
            />
            <span style={{ color: step.tone.accent }}>Output: {step.output}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================ 
// COMPONENTS
// ============================================================================
const CategoryCard = memo(function CategoryCard({ 
  category, 
  index 
}: { 
  category: typeof buildCategories[0]; 
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });
  const Icon = category.icon;
  const PreviewMockup = category.PreviewMockup;
  const tone = category.tone;

  return (
    <div
      ref={cardRef}
      className={`group transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-14 py-10 lg:py-14 border-b border-foreground/10">
        {/* Number + Icon */}
        <div className="shrink-0 flex items-start gap-4">
          <span className="font-mono text-sm" style={{ color: tone.accent }}>{category.number}</span>
          <div
            className="w-11 h-11 rounded-lg border flex items-center justify-center transition-colors duration-300"
            style={{
              borderColor: tone.border,
              backgroundColor: isHovered ? tone.accent : tone.surface,
              color: isHovered ? tone.contrast : tone.accent,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          <div>
            <h3 className="text-xl lg:text-2xl font-display mb-3 group-hover:translate-x-1 transition-transform duration-300">
              {category.title}
            </h3>
            <p className="text-sm lg:text-[15px] text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          </div>
          
          {/* Preview / Examples */}
          <div className="relative h-36 lg:h-44">
            {/* Default: examples */}
            <div className={`absolute inset-0 flex flex-wrap gap-2 content-start transition-all duration-300 ${isHovered ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {category.examples.map((example, i) => (
                <span 
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full border transition-colors duration-300"
                  style={{
                    borderColor: tone.border,
                    backgroundColor: isHovered ? tone.surface : "rgba(24, 21, 18, 0.04)",
                    color: isHovered ? tone.accent : "rgba(24, 21, 18, 0.62)",
                  }}
                >
                  {example}
                </span>
              ))}
            </div>
            
            {/* Hover: mockup */}
            <div className={`absolute inset-0 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <PreviewMockup isActive={isHovered} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function SolutionCard({ 
  solution, 
  index 
}: { 
  solution: typeof solutionPaths[0]; 
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });
  const Icon = solution.icon;
  const tone = solution.tone;

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-xl border border-border bg-card p-6 transition-all duration-700 hover:border-foreground/20 overflow-hidden ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{
        transitionDelay: `${index * 100}ms`,
        borderColor: isHovered ? tone.border : undefined,
        boxShadow: isHovered ? `0 22px 40px -34px ${tone.shadow}` : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <svg className="w-full h-full" viewBox="0 0 64 64">
          <path d="M64 0 L64 64 L0 0 Z" fill="currentColor" className="text-foreground/5" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-colors duration-300"
              style={{
                borderColor: tone.border,
                backgroundColor: isHovered ? tone.accent : tone.surface,
                color: isHovered ? tone.contrast : tone.accent,
              }}
            >
              <Icon className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "scale-110" : "scale-100"}`} />
            </div>
            {/* Status indicator */}
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card transition-all duration-300"
              style={{
                backgroundColor: isHovered ? tone.accent : "rgba(24, 21, 18, 0.18)",
                transform: isHovered ? "scale(1)" : "scale(0.75)",
              }}
            />
          </div>
          <h3 className="text-base font-display leading-tight pt-2">
            {solution.problem}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {solution.summary}
        </p>
        
        {/* Signal indicators with animation */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Signals</span>
          {solution.signals.map((signal, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-2 text-xs transition-all duration-300 ${isHovered ? "text-foreground translate-x-1" : "text-muted-foreground translate-x-0"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300"
                style={{ backgroundColor: isHovered ? tone.accent : "rgba(24, 21, 18, 0.24)" }}
              />
              {signal}
            </div>
          ))}
        </div>

        {/* Bottom progress */}
        <div className={`mt-4 pt-4 border-t border-border transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Match score</span>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: isHovered ? `${70 + index * 8}%` : "0%",
                  backgroundColor: tone.accent,
                }}
              />
            </div>
            <span className="text-[10px] font-mono" style={{ color: isHovered ? tone.accent : undefined }}>{70 + index * 8}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function ServicesPage() {
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
              <span className="w-8 h-px" style={{ backgroundColor: servicesEyebrowTone.accent }} />
              Services
            </span>
            <h1 
              className={`text-4xl lg:text-5xl font-display tracking-tight mb-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "100ms" }}
            >
              What we build and
              <br />
              <span className="text-muted-foreground">how we approach it.</span>
            </h1>
            <p 
              className={`text-base lg:text-lg text-muted-foreground leading-relaxed mb-8 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "200ms" }}
            >
              AI systems, web platforms, mobile applications, and custom internal software. 
              Every project starts from a real business problem.
            </p>
            <div 
              className={`flex flex-wrap gap-4 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "300ms" }}
            >
              <Link
                href={siteRoutes.maxwell}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
              >
                Start a conversation
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={siteRoutes.templates}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                View templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Build Categories */}
      <section id="what-we-build" className="site-section-lg">
        <div className="site-shell">
          <div className="max-w-3xl mb-12">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-8 h-px" style={{ backgroundColor: servicesEyebrowTone.accent }} />
              Build categories
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
              What we build
            </h2>
            <p className="text-muted-foreground">
              Four primary categories of software, each with its own implementation discipline.
            </p>
          </div>

          <div>
            {buildCategories.map((category, index) => (
              <CategoryCard key={category.slug} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Solution Paths */}
      <section id="solution-paths" className="site-section-lg bg-secondary/30">
        <div className="site-shell">
          <div className="max-w-3xl mb-12">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-8 h-px" style={{ backgroundColor: servicesEyebrowTone.accent }} />
              Solution paths
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
              How we approach problems
            </h2>
            <p className="text-muted-foreground">
              When the software category is not yet obvious, start from the operational pain.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {solutionPaths.map((solution, index) => (
              <SolutionCard key={solution.problem} solution={solution} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="site-section-lg">
        <div className="site-shell">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-8 h-px" style={{ backgroundColor: servicesEyebrowTone.accent }} />
              Process
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
              From problem to delivery
            </h2>
            <p className="text-muted-foreground">
              Every engagement follows a structured path that reduces ambiguity and moves toward an executable scope.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-8 lg:mt-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12 xl:gap-16">
            <div className="lg:sticky lg:top-8">
              <ProcessFlowDiagram />
            </div>

            <div>
              {processSteps.map((step, index) => (
                <ProcessStep 
                  key={step.number} 
                  step={step} 
                  index={index} 
                  isLast={index === processSteps.length - 1}
                />
              ))}

              <div className="rounded-2xl border border-border bg-secondary/30 p-6" style={{ borderColor: processSteps[1].tone.border }}>
                <span
                  className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em]"
                  style={{ color: processSteps[1].tone.accent }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: processSteps[1].tone.accent }} />
                  Best entry point
                </span>
                <h3 className="mt-3 text-xl font-display tracking-tight">
                  Start with Maxwell when the problem is real but the software shape is still unclear.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Maxwell helps turn ambiguity into direction before proposal, scope, and delivery planning.
                </p>
                <Link
                  href={siteRoutes.maxwell}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
                >
                  Start with Maxwell
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section-lg bg-foreground text-background">
        <div className="site-shell text-center">
          <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
            Ready to start?
          </h2>
          <p className="text-background/70 mb-8 max-w-md mx-auto">
            Choose the entry point that fits where you are in the process.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={siteRoutes.maxwell}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
            >
              Open Maxwell
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={siteRoutes.templates}
              className="inline-flex items-center gap-2 rounded-full border border-background/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-background/10"
            >
              Browse templates
            </Link>
            <Link
              href={siteRoutes.contact}
              className="inline-flex items-center gap-2 rounded-full border border-background/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-background/10"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </SitePageFrame>
  );
}

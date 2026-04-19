"use client";

import { Fragment, useEffect, useState, memo } from "react";
import { ArrowRight, Bot, Globe, Smartphone, Wrench, RefreshCw, LayoutDashboard, Rocket, Puzzle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { SiteCtaBlock } from "@/app/_components/site/site-cta-block";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { FaqSection } from "@/components/landing/faq-section";
import { siteRoutes } from "@/lib/site-config";
import { siteChromeDots, siteTones } from "@/lib/site-tones";

const servicesEyebrowTone = siteTones.brand;
const LOCALES = ["en", "es", "fr", "de"];

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
// STATIC METADATA (no translatable text)
// ============================================================================

const buildCategoryMeta = [
  { number: "01", slug: "ai-and-automation", icon: Bot, PreviewMockup: AIPreviewMockup, tone: siteTones.gateway },
  { number: "02", slug: "web-solutions", icon: Globe, PreviewMockup: WebPreviewMockup, tone: siteTones.client },
  { number: "03", slug: "mobile-solutions", icon: Smartphone, PreviewMockup: MobilePreviewMockup, tone: siteTones.data },
  { number: "04", slug: "custom-software", icon: Wrench, PreviewMockup: CustomPreviewMockup, tone: siteTones.brandDeep },
];

const solutionMeta = [
  { icon: RefreshCw, tone: siteTones.gateway },
  { icon: LayoutDashboard, tone: siteTones.client },
  { icon: Rocket, tone: siteTones.brand },
  { icon: Puzzle, tone: siteTones.data },
];

const processMeta = [
  { number: "01", tone: siteTones.services },
  { number: "02", tone: siteTones.brand },
  { number: "03", tone: siteTones.data },
];

// ============================================================================
// TYPES
// ============================================================================

type BuildCategory = typeof buildCategoryMeta[0] & {
  title: string;
  description: string;
  examples: string[];
};

type SolutionPath = typeof solutionMeta[0] & {
  problem: string;
  summary: string;
  signals: string[];
};

type ProcessStep = typeof processMeta[0] & {
  diagramLabel: string;
  title: string;
  description: string;
  status: string;
  output: string;
};

// ============================================================================
// PROCESS FLOW DIAGRAM
// ============================================================================

function ProcessFlowDiagram({ processSteps }: { processSteps: ProcessStep[] }) {
  const [activeStep, setActiveStep] = useState(0);
  const { ref: diagramRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % processSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible, processSteps.length]);

  const currentStep = processSteps[activeStep];

  return (
    <div
      ref={diagramRef}
      className={`relative rounded-2xl border border-foreground/8 bg-card/80 p-6 overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
                      backgroundColor: activeStep > index ? processSteps[index + 1].tone.accent : "color-mix(in srgb, var(--foreground) 12%, transparent)",
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
  step: ProcessStep;
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

const CategoryCard = memo(function CategoryCard({
  category,
  index
}: {
  category: BuildCategory;
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
                    backgroundColor: isHovered ? tone.surface : "color-mix(in srgb, var(--foreground) 4%, transparent)",
                    color: isHovered ? tone.accent : "color-mix(in srgb, var(--foreground) 62%, transparent)",
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
  index,
  fitLabel,
}: {
  solution: SolutionPath;
  index: number;
  fitLabel: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });
  const Icon = solution.icon;
  const tone = solution.tone;

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-xl border border-foreground/8 bg-card/80 p-6 transition-all duration-700 overflow-hidden ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
                backgroundColor: isHovered ? tone.accent : "color-mix(in srgb, var(--foreground) 18%, transparent)",
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
                style={{ backgroundColor: isHovered ? tone.accent : "color-mix(in srgb, var(--foreground) 24%, transparent)" }}
              />
              {signal}
            </div>
          ))}
        </div>

        {/* Bottom fit label */}
        <div className={`mt-4 pt-4 border-t border-border transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${tone.accent}18`, color: tone.accent }}
          >
            {fitLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function ServicesPage() {
  const params = useParams();
  const paramLocale = typeof params?.locale === "string" ? params.locale : null;
  const locale = (paramLocale && LOCALES.includes(paramLocale) ? paramLocale : "en");
  const lp = (href: string) => `/${locale}${href}`;

  const t = useTranslations("services");

  const serviceTypes = t.raw("serviceTypes") as Array<{ title: string; description: string; examples: string[] }>;
  const problemItems = t.raw("problemAreas.items") as Array<{ problem: string; summary: string; signals: string[] }>;
  const processStepsRaw = t.raw("process.steps") as Array<{ diagramLabel: string; title: string; description: string; status: string; output: string }>;
  const fitLabels = t.raw("fitLabels") as string[];

  const buildCategories: BuildCategory[] = buildCategoryMeta.map((meta, i) => ({
    ...meta,
    title: serviceTypes[i]?.title ?? "",
    description: serviceTypes[i]?.description ?? "",
    examples: serviceTypes[i]?.examples ?? [],
  }));

  const solutionPaths: SolutionPath[] = solutionMeta.map((meta, i) => ({
    ...meta,
    problem: problemItems[i]?.problem ?? "",
    summary: problemItems[i]?.summary ?? "",
    signals: problemItems[i]?.signals ?? [],
  }));

  const processSteps: ProcessStep[] = processMeta.map((meta, i) => ({
    ...meta,
    diagramLabel: processStepsRaw[i]?.diagramLabel ?? "",
    title: processStepsRaw[i]?.title ?? "",
    description: processStepsRaw[i]?.description ?? "",
    status: processStepsRaw[i]?.status ?? "",
    output: processStepsRaw[i]?.output ?? "",
  }));

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
                href={lp(siteRoutes.templates)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                {t("hero.viewTemplates")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Paths — first so users self-identify */}
      <section id="solution-paths" className="site-section-lg bg-secondary/30">
        <div className="site-shell">
          <div className="max-w-3xl mb-12">
            <span className="mb-6 liquid-glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: servicesEyebrowTone.accent }} />
              {t("problemAreas.eyebrow")}
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
              {t("problemAreas.headline")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {solutionPaths.map((solution, index) => (
              <SolutionCard
                key={index}
                solution={solution}
                index={index}
                fitLabel={fitLabels[Math.min(index, fitLabels.length - 1)] ?? ""}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Build Categories */}
      <section id="what-we-build" className="site-section-lg">
        <div className="site-shell">
          <div className="max-w-3xl mb-12">
            <span className="mb-6 liquid-glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: servicesEyebrowTone.accent }} />
              {t("whatWeBuildEyebrow")}
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
              {t("whatWeBuildHeadline")}
            </h2>
          </div>

          <div>
            {buildCategories.map((category, index) => (
              <CategoryCard key={category.slug} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="site-section-lg bg-secondary/30">
        <div className="site-shell">
          <div className="max-w-2xl">
            <span className="mb-6 liquid-glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: servicesEyebrowTone.accent }} />
              {t("process.eyebrow")}
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
              {t("process.headline")}
            </h2>
          </div>

          <div className="mt-10 grid items-start gap-8 lg:mt-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12 xl:gap-16">
            <div className="lg:sticky lg:top-8">
              <ProcessFlowDiagram processSteps={processSteps} />
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

            </div>
          </div>
        </div>
      </section>

      <FaqSection />

      <SiteCtaBlock
        title={t("cta.headline")}
        description={t("cta.description")}
        primaryAction={{ label: t("cta.startWithMaxwell"), href: siteRoutes.maxwell }}
      />
    </SitePageFrame>
  );
}

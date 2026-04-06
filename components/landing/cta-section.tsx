"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { ArrowRight, CheckCircle2, Code2, Lightbulb, Rocket } from "lucide-react";
import { getStartWithMaxwellHref, siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";

function DeployFlowAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const { ref: containerRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  const steps = [
    { icon: Lightbulb, label: "Idea", tone: siteTones.services },
    { icon: Code2, label: "Code", tone: siteTones.brand },
    { icon: Rocket, label: "Deploy", tone: siteTones.data },
    { icon: CheckCircle2, label: "Live", tone: siteTones.gateway },
  ];

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center">
      <div className="absolute inset-0 rounded-[10px] border border-[#d9e1ff] bg-white" />

      <div className="relative flex flex-col items-center gap-4 py-7">
        <div className="flex items-start gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep >= index;
            const isCurrent = activeStep === index;

            return (
              <div key={step.label} className="flex items-start gap-3">
                <div className="flex min-w-12 flex-col items-center gap-2">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-[10px] transition-all duration-500 ${
                      isActive ? "" : "bg-slate-100 text-slate-400"
                    } ${isCurrent ? "scale-[1.02]" : "scale-100"}`}
                    style={
                      isActive
                        ? {
                            backgroundColor: step.tone.strongSurface,
                            color: step.tone.accent,
                            border: `1px solid ${step.tone.border}`,
                          }
                        : undefined
                    }
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-[11px] font-mono leading-none transition-all duration-300 ${
                      isActive ? "text-[#04122b]" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="mt-6 h-px w-8 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{
                        width: activeStep > index ? "100%" : "0%",
                        transitionDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative h-24 w-64 overflow-hidden rounded-[10px] border border-white/10 bg-[#04122b]">
          <div className="absolute inset-0 flex flex-col p-3.5">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="h-2 w-2 rounded-full bg-green-400" />
              </div>
              <span className="ml-2 font-mono text-[10px] text-background/50">noon deploy</span>
            </div>

            <div className="flex-1 space-y-1.5 overflow-hidden">
              <div
                className={`flex items-center gap-2 transition-all duration-300 ${
                  activeStep >= 0 ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`}
              >
                <span className="text-[11px]" style={{ color: siteTones.gateway.accent }}>$</span>
                <span className="font-mono text-[11px] text-background/90">noon build --prod</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-all duration-300 ${
                  activeStep >= 1 ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <span className="text-[11px]" style={{ color: siteTones.brandStructural.accent }}>i</span>
                <span className="font-mono text-[11px] text-background/70">Compiling 42 modules...</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-all duration-300 ${
                  activeStep >= 2 ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                <span className="text-[11px]" style={{ color: siteTones.data.accent }}>+</span>
                <span className="font-mono text-[11px] text-background/70">Deploying to edge...</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-all duration-300 ${
                  activeStep >= 3 ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: "600ms" }}
              >
                <span className="font-mono text-[10px]" style={{ color: siteTones.gateway.accent }}>[ok]</span>
                <span className="font-mono text-[11px]" style={{ color: siteTones.gateway.accent }}>Live at yourdomain.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CtaSection() {
  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div
          className={`relative rounded-[10px] border border-[#3b2af0]/55 bg-[#1200c5] transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="relative z-10 px-8 py-10 lg:px-10 lg:py-12">
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-10">
              <div className="max-w-xl flex-1">
                <h2 className="mb-5 text-3xl font-display tracking-tight leading-[0.98] text-white lg:text-[2.625rem]">
                  Ready to build
                  <br />
                  something real?
                </h2>

                <p className="mb-7 text-base leading-relaxed text-white/78 lg:text-[17px]">
                  Tell Maxwell what you want to create. From idea to production-ready software,
                  we handle the rest.
                </p>

                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="group h-11 rounded-full bg-white px-6 text-sm text-[#04122b] hover:bg-white/92"
                  >
                    <Link href={getStartWithMaxwellHref()}>
                      Start with Maxwell
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-11 rounded-full border-white/24 bg-white/8 px-6 text-sm text-white hover:bg-white/12 hover:text-white"
                  >
                    <Link href={siteRoutes.templates}>View templates</Link>
                  </Button>
                </div>

                <p className="mt-6 font-mono text-sm text-white/68">
                  Start a conversation, no commitment required
                </p>
              </div>

              <div className="hidden h-[280px] w-[400px] items-center justify-center lg:flex">
                <DeployFlowAnimation />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

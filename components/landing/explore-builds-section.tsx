"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { ArrowRight } from "lucide-react";
import { getTemplateHref, siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";
import { templates } from "@/data/templates";

// ============================================================================
// Category tone map
// ============================================================================

const categoryTone = (category: string) => {
  switch (category) {
    case "SaaS": return siteTones.brand;
    case "Dashboards": return siteTones.client;
    case "Internal tools": return siteTones.gateway;
    case "AI assistants": return siteTones.data;
    case "Marketplaces": return siteTones.services;
    case "Booking platforms": return siteTones.services;
    case "E-commerce": return siteTones.services;
    case "Mobile apps": return siteTones.data;
    default: return siteTones.brand;
  }
};

// ============================================================================
// Per-category animated mockups
// ============================================================================

function SaaSMockup({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/30">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-foreground/15" />
          <span className="w-2 h-2 rounded-full bg-foreground/15" />
          <span className="w-2 h-2 rounded-full bg-foreground/15" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground ml-1">client-portal</span>
      </div>
      <div className="flex h-full">
        <div className="w-14 border-r border-border bg-secondary/20 py-3 space-y-2 px-2">
          {["Home", "Proj", "Bill", "Sett"].map((l, i) => (
            <div key={l} className={`rounded-md px-1.5 py-1 text-[9px] transition-all duration-300 ${active && i === 0 ? "text-white" : "text-muted-foreground"}`}
              style={active && i === 0 ? { backgroundColor: siteTones.brand.accent, transitionDelay: `${150 + i * 80}ms` } : { transitionDelay: `${150 + i * 80}ms` }}>
              {l}
            </div>
          ))}
        </div>
        <div className="flex-1 p-3 space-y-2">
          <div className={`h-2.5 w-24 rounded bg-foreground/80 transition-all duration-300 ${active ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "200ms" }} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[siteTones.brand, siteTones.data, siteTones.gateway, siteTones.services].map((t, i) => (
              <div key={i} className={`rounded-lg border p-2 transition-all duration-300 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                style={{ borderColor: t.border, backgroundColor: t.surface, transitionDelay: `${250 + i * 80}ms` }}>
                <div className="h-1 w-8 rounded mb-1" style={{ backgroundColor: t.accent }} />
                <div className="h-3 w-12 rounded bg-foreground/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
        <span className="text-[10px] font-mono text-muted-foreground">operations · live</span>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: siteTones.gateway.accent }} />
      </div>
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {[{ v: "$47K", l: "Revenue" }, { v: "1.2K", l: "Orders" }, { v: "+23%", l: "Growth" }].map((s, i) => (
            <div key={s.l} className={`bg-secondary/50 rounded-lg p-2 transition-all duration-300 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
              style={{ transitionDelay: `${180 + i * 80}ms` }}>
              <p className="text-[8px] text-muted-foreground">{s.l}</p>
              <p className="text-xs font-semibold">{s.v}</p>
            </div>
          ))}
        </div>
        <div className={`h-16 rounded-lg bg-secondary/30 overflow-hidden transition-all duration-500 ${active ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "400ms" }}>
          <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
            <path d="M0,40 Q40,32 80,24 T160,18 T200,10"
              fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground/40"
              style={{ strokeDasharray: 300, strokeDashoffset: active ? 0 : 300, transition: "stroke-dashoffset 1s ease-out 0.5s" }} />
          </svg>
        </div>
        <div className="space-y-1">
          {[1, 2].map(i => (
            <div key={i} className={`h-5 rounded bg-secondary/50 transition-all duration-300 ${active ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: `${550 + i * 80}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowMockup({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/30">
        <span className="text-[10px] font-mono text-muted-foreground">approval queue</span>
        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: siteTones.gateway.surface, color: siteTones.gateway.accent }}>12 pending</span>
      </div>
      <div className="p-3 space-y-1.5">
        {[
          { label: "Design review", status: "Pending", i: 0 },
          { label: "Budget approval", status: "Approved", i: 1 },
          { label: "Legal clearance", status: "Escalated", i: 2 },
        ].map(({ label, status, i }) => (
          <div key={label} className={`flex items-center justify-between rounded-lg border border-border px-3 py-2 transition-all duration-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
            style={{ transitionDelay: `${180 + i * 100}ms` }}>
            <span className="text-[10px]">{label}</span>
            <span className="text-[9px] rounded-full px-2 py-0.5" style={{
              backgroundColor: status === "Approved" ? siteTones.gateway.surface : status === "Escalated" ? siteTones.services.surface : "var(--secondary)",
              color: status === "Approved" ? siteTones.gateway.accent : status === "Escalated" ? siteTones.services.accent : "var(--muted-foreground)",
            }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIMockup({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/30">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: siteTones.data.accent }} />
        <span className="text-[10px] font-mono text-muted-foreground">AI assistant · online</span>
      </div>
      <div className="p-3 space-y-2">
        <div className={`flex justify-end transition-all duration-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`} style={{ transitionDelay: "200ms" }}>
          <div className="bg-foreground text-background text-[10px] px-3 py-1.5 rounded-2xl rounded-tr-sm max-w-[75%]">How do I reset my password?</div>
        </div>
        <div className={`flex justify-start transition-all duration-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`} style={{ transitionDelay: "400ms" }}>
          <div className="text-[10px] px-3 py-1.5 rounded-2xl rounded-tl-sm max-w-[80%] border border-border bg-secondary/30">I can help! I'll send a reset link to your email right now.</div>
        </div>
        <div className={`flex gap-1 px-3 transition-all duration-300 ${active ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "600ms" }}>
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketplaceMockup({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
        <span className="text-[10px] font-mono text-muted-foreground">marketplace</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-foreground text-background">Cart (3)</span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`rounded-lg overflow-hidden border border-border transition-all duration-300 ${active ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            style={{ transitionDelay: `${180 + i * 80}ms` }}>
            <div className="aspect-square bg-secondary/50 flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-foreground/10" />
            </div>
            <div className="p-1.5">
              <div className="h-1.5 bg-foreground/10 rounded w-3/4 mb-1" />
              <div className="h-1.5 bg-foreground/20 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingMockup({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/30">
        <span className="text-[10px] font-mono text-muted-foreground">reservations · Apr 2026</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-7 gap-0.5">
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} className="text-center text-[8px] text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: 21 }, (_, i) => i + 1).map(d => (
            <div key={d} className={`aspect-square flex items-center justify-center rounded text-[9px] transition-all duration-200 ${active && (d === 8 || d === 12 || d === 15) ? "text-white" : "text-foreground/60 hover:bg-secondary"}`}
              style={active && (d === 8 || d === 12 || d === 15) ? { backgroundColor: siteTones.services.accent, transitionDelay: `${200 + d * 20}ms` } : {}}>
              {d}
            </div>
          ))}
        </div>
        <div className={`rounded-lg border px-3 py-2 text-[10px] transition-all duration-300 ${active ? "opacity-100" : "opacity-0"}`}
          style={{ borderColor: siteTones.services.border, backgroundColor: siteTones.services.surface, color: siteTones.services.accent, transitionDelay: "500ms" }}>
          Apr 8 — 2 slots available
        </div>
      </div>
    </div>
  );
}

function EcommerceMockup({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
        <span className="text-[10px] font-mono text-muted-foreground">storefront</span>
        <span className="text-[9px] text-muted-foreground">24 orders today</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <div className="w-16 h-16 rounded-lg bg-secondary/50 shrink-0" />
          <div className="flex-1 space-y-1.5 pt-0.5">
            <div className="h-2 bg-foreground/80 rounded w-3/4" />
            <div className="h-1.5 bg-foreground/20 rounded w-1/2" />
            <div className={`mt-1 h-2 rounded w-12 transition-all duration-300 ${active ? "opacity-100" : "opacity-0"}`}
              style={{ backgroundColor: siteTones.services.accent, transitionDelay: "300ms" }} />
          </div>
        </div>
        {[1, 2].map(i => (
          <div key={i} className={`flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 transition-all duration-300 ${active ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: `${300 + i * 100}ms` }}>
            <div className="w-7 h-7 rounded bg-secondary/60 shrink-0" />
            <div className="flex-1">
              <div className="h-1.5 bg-foreground/20 rounded w-2/3 mb-1" />
              <div className="h-1.5 bg-foreground/10 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileMockup({ active }: { active: boolean }) {
  return (
    <div className={`absolute inset-4 flex items-center justify-center transition-all duration-500 ${active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      <div className="w-24 bg-background rounded-2xl border-2 border-border overflow-hidden shadow-xl">
        <div className="flex items-center justify-center py-1 border-b border-border">
          <div className="w-6 h-1 rounded-full bg-foreground/20" />
        </div>
        <div className="p-2 space-y-1.5">
          <div className={`rounded-lg p-1.5 transition-all duration-300 ${active ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundColor: siteTones.data.surface, transitionDelay: "200ms" }}>
            <div className="h-1 rounded mb-1" style={{ backgroundColor: siteTones.data.accent, width: "60%" }} />
            <div className="h-1 bg-foreground/10 rounded w-4/5" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-6 rounded-lg bg-secondary/50 flex items-center gap-1.5 px-2 transition-all duration-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
              style={{ transitionDelay: `${250 + i * 80}ms` }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: siteTones.data.accent }} />
              <div className="h-1 bg-foreground/15 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Assign mockup by category
const MockupByCategory: Record<string, React.ComponentType<{ active: boolean }>> = {
  "SaaS": SaaSMockup,
  "Dashboards": DashboardMockup,
  "Internal tools": WorkflowMockup,
  "AI assistants": AIMockup,
  "Marketplaces": MarketplaceMockup,
  "Booking platforms": BookingMockup,
  "E-commerce": EcommerceMockup,
  "Mobile apps": MobileMockup,
};

// ============================================================================
// Template Card
// ============================================================================

function TemplateCard({ template, index }: { template: typeof templates[number]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const { ref, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.15 });
  const tone = categoryTone(template.category);
  const Mockup = MockupByCategory[template.category] ?? SaaSMockup;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative flex flex-col bg-background/88 border border-foreground/8 rounded-[10px] overflow-hidden transition-all duration-700 hover:border-foreground/14 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Mockup preview area */}
      <div className={`relative h-44 lg:h-52 overflow-hidden bg-foreground/[0.035] transition-colors duration-500 ${hovered ? "bg-foreground/[0.06]" : ""}`}>
        <Mockup active={hovered} />
        {/* Default icon state */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-400 ${hovered ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}>
          <div
            className="w-12 h-12 rounded-[10px] border flex items-center justify-center"
            style={{ backgroundColor: tone.surface, borderColor: tone.border }}
          >
            <span className="text-xs font-mono" style={{ color: tone.accent }}>
              {template.category.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 lg:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base lg:text-lg font-display leading-snug pr-2">{template.name}</h3>
          <span
            className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full border"
            style={{ backgroundColor: tone.surface, borderColor: tone.border, color: tone.accent }}
          >
            {template.category}
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {template.summary}
        </p>

        {/* Best fit tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {template.bestFit.map((tag) => (
            <span key={tag} className="text-[11px] text-foreground/60 bg-secondary/60 px-2.5 py-1 rounded-full border border-foreground/6">
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={getTemplateHref(template.slug)}
          className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all duration-300"
        >
          Use this template
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// ExploreBuildsSection
// ============================================================================

export function ExploreBuildsSection() {
  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.08 });

  return (
    <section
      id="explore-what-you-can-build"
      ref={sectionRef}
      className="relative py-20 lg:py-24 bg-secondary/30"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 lg:mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Templates
            </span>
            <h2
              className={`text-3xl lg:text-4xl font-display tracking-tight mb-4 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Start from a proven baseline.
            </h2>
            <p
              className={`text-base lg:text-[17px] text-muted-foreground leading-relaxed transition-all duration-700 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Structured starting points that accelerate scoping and delivery — not themes, not boxed products. Hover to see them come alive.
            </p>
          </div>
          <Link
            href={siteRoutes.templates}
            className={`inline-flex items-center gap-2 text-sm font-medium text-foreground shrink-0 transition-all duration-700 delay-200 hover:gap-3 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            View all templates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Template grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {templates.map((template, index) => (
            <TemplateCard key={template.slug} template={template} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

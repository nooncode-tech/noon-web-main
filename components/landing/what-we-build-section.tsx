"use client";

import { useState } from "react";
import { Bot, Globe, Smartphone, Cog } from "lucide-react";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { siteTones } from "@/lib/site-tones";

// Preview Mockup Components
function AIPreviewMockup({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-0 bg-background rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
      <div className="p-2.5 h-full flex flex-col">
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground ml-2">AI Workflow</span>
        </div>
        
        {/* Flow visualization */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {["Input", "Process", "Output"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <span className="text-[8px] font-mono text-muted-foreground">{step}</span>
              </div>
              {i < 2 && (
                <div className={`w-4 h-px bg-foreground/20 transition-all duration-300 ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} style={{ transitionDelay: `${i * 150 + 100}ms` }} />
              )}
            </div>
          ))}
        </div>
        
        {/* Bottom indicator */}
        <div className={`flex items-center gap-2 pt-3 border-t border-border transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '500ms' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: siteTones.gateway.accent }} />
          <span className="text-[10px] text-muted-foreground">Automation running</span>
        </div>
      </div>
    </div>
  );
}

function WebPreviewMockup({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-0 bg-background rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-secondary rounded-md px-2 py-1 text-[9px] text-muted-foreground font-mono">
            yourdomain.com
          </div>
        </div>
      </div>
      
      {/* Page content */}
      <div className="p-2.5 space-y-1.5">
        {/* Nav */}
        <div className={`flex justify-between items-center transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '150ms' }}>
          <div className="w-8 h-2 bg-foreground rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="w-6 h-1.5 bg-foreground/20 rounded" />)}
          </div>
        </div>
        
        {/* Hero */}
        <div className={`mt-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '250ms' }}>
          <div className="w-16 h-2.5 bg-foreground/80 rounded mb-2" />
          <div className="w-24 h-2 bg-foreground/30 rounded mb-3" />
          <div className="w-10 h-4 bg-foreground rounded-full" />
        </div>
        
        {/* Grid */}
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
    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
      {/* Phone frame */}
      <div className="w-20 h-36 bg-foreground rounded-[1.4rem] p-1.5 shadow-sm">
        <div className="w-full h-full bg-background rounded-[16px] overflow-hidden relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-foreground rounded-b-xl" />
          
          {/* App content */}
          <div className="pt-3.5 px-1.5 pb-1.5 h-full flex flex-col">
            {/* Status bar */}
            <div className={`flex justify-between items-center mb-2 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '150ms' }}>
              <span className="text-[5px] font-mono">9:41</span>
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1 bg-foreground/50 rounded-sm" />
                <div className="w-1.5 h-1 bg-foreground/50 rounded-sm" />
              </div>
            </div>
            
            {/* Header */}
            <div className={`flex items-center gap-2 mb-3 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <div className="w-8 h-1.5 bg-foreground/80 rounded" />
            </div>
            
            {/* Cards */}
            <div className="flex-1 space-y-2 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={`bg-secondary rounded-lg p-1.5 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                  style={{ transitionDelay: `${250 + i * 100}ms` }}
                >
                  <div className="w-full h-1 bg-foreground/20 rounded mb-1" />
                  <div className="w-2/3 h-1 bg-foreground/10 rounded" />
                </div>
              ))}
            </div>
            
            {/* Tab bar */}
            <div className={`flex justify-around pt-2 border-t border-border transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '550ms' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-2.5 h-2.5 rounded ${i === 1 ? 'bg-foreground' : 'bg-foreground/20'}`} />
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
    <div className={`absolute inset-0 bg-background rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
      <div className="p-2 h-full flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between mb-2.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-1.5">
            <Cog className="w-3 h-3 text-foreground/60" />
            <span className="text-[8px] font-mono text-muted-foreground">Custom System</span>
          </div>
          <span
            className="rounded-full px-1.5 py-0.5 text-[7px]"
            style={{
              color: siteTones.gateway.accent,
              backgroundColor: siteTones.gateway.surface,
            }}
          >
            Active
          </span>
        </div>
        
        {/* Code blocks */}
        <div className="flex-1 space-y-1.5">
          {[
            { width: "80%", delay: 150 },
            { width: "65%", delay: 250 },
            { width: "90%", delay: 350 },
            { width: "55%", delay: 450 },
          ].map((line, i) => (
            <div 
              key={i}
              className={`h-2 bg-secondary rounded transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ width: line.width, transitionDelay: `${line.delay}ms` }}
            />
          ))}
        </div>
        
        {/* Integration icons */}
        <div className={`flex items-center gap-2 pt-2 border-t border-border transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '550ms' }}>
          <span className="text-[8px] text-muted-foreground">Integrates with:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
            <div key={i} className="w-4 h-4 rounded bg-secondary flex items-center justify-center">
                <div className="w-2 h-2 rounded-sm bg-foreground/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const categories = [
  {
    number: "01",
    title: "AI & Automation",
    description: "Intelligent assistants, automated workflows, and AI-powered tools that transform how your business operates.",
    icon: Bot,
    examples: ["AI assistants", "Automated workflows", "Smart integrations"],
    PreviewMockup: AIPreviewMockup,
    previewClassName: "absolute -top-3 right-0 h-30 w-36 lg:h-32 lg:w-40",
  },
  {
    number: "02",
    title: "Web Solutions",
    description: "From landing pages to complex platforms. Full-stack web applications built with modern technologies.",
    icon: Globe,
    examples: ["Web platforms", "Dashboards", "E-commerce"],
    PreviewMockup: WebPreviewMockup,
    previewClassName: "absolute -top-3 right-0 h-30 w-36 lg:h-32 lg:w-40",
  },
  {
    number: "03",
    title: "Mobile Solutions",
    description: "Native and cross-platform mobile applications that deliver exceptional user experiences.",
    icon: Smartphone,
    examples: ["iOS apps", "Android apps", "Cross-platform"],
    PreviewMockup: MobilePreviewMockup,
    previewClassName: "absolute -top-4 right-1 h-30 w-32 lg:h-32 lg:w-36",
  },
  {
    number: "04",
    title: "Custom Software",
    description: "Tailored software solutions that fit your unique business needs and workflows.",
    icon: Cog,
    examples: ["Internal tools", "Custom integrations", "Business logic"],
    PreviewMockup: CustomPreviewMockup,
    previewClassName: "absolute -top-2 right-1 h-26 w-32 lg:h-28 lg:w-34",
  },
];

function CategoryCard({ category, index }: { category: typeof categories[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });
  const Icon = category.icon;
  const PreviewMockup = category.PreviewMockup;
  const previewClassName = category.previewClassName ?? "absolute -top-3 right-0 h-30 w-36 lg:h-32 lg:w-40";

  return (
    <div
      ref={cardRef}
      className={`group relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-14 py-8 lg:py-14 border-b border-foreground/10">
        {/* Number */}
        <div className="shrink-0 flex items-start gap-4">
          <span className="font-mono text-sm text-muted-foreground">{category.number}</span>
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="text-xl lg:text-2xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-500">
              {category.title}
            </h3>
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          </div>
          
          {/* Preview Card on Hover */}
          <div className="relative lg:justify-end lg:pt-2">
            {/* Default examples */}
            <div className={`flex flex-wrap gap-2 transition-all duration-300 ${isHovered ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {category.examples.map((example, i) => (
                <span 
                  key={i}
                  className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border"
                >
                  {example}
                </span>
              ))}
            </div>
            
            {/* Preview mockup on hover */}
            <div className={`${previewClassName} z-10 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <PreviewMockup isActive={isHovered} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatWeBuildSection() {
  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="what-we-build"
      ref={sectionRef}
      className="relative py-20 lg:py-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 lg:mb-16 max-w-3xl">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            What we build
          </span>
          <h2
            className={`text-3xl lg:text-4xl font-display tracking-tight mb-5 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            From idea to real software.
            <br />
            <span className="text-muted-foreground">Built in code, not templates.</span>
          </h2>
          <p className="text-base lg:text-[17px] text-muted-foreground leading-relaxed">
            We build custom software across AI, web, mobile, and internal operations, always shaped around real business use.
          </p>
        </div>

        {/* Categories List */}
        <div>
          {categories.map((category, index) => (
            <CategoryCard key={category.number} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

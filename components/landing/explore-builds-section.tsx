"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { ArrowRight, Bot, BarChart3, Store } from "lucide-react";
import { getTemplateHref } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";

// Card Skeleton for shimmer loading
function CardSkeleton({ index }: { index: number }) {
  return (
    <div 
      className="bg-background/85 border border-foreground/8 rounded-[10px] overflow-hidden animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Preview area */}
      <div className="h-52 lg:h-60 bg-foreground/[0.03] shimmer" />
      
      {/* Content */}
      <div className="p-6 lg:p-8 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="shimmer h-8 w-40 rounded-lg" />
            <div className="shimmer h-4 w-32 rounded" />
          </div>
          <div className="shimmer h-6 w-24 rounded-full" />
        </div>
        
        <div className="space-y-2">
          <div className="shimmer h-4 w-full rounded" />
          <div className="shimmer h-4 w-5/6 rounded" />
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer h-7 w-28 rounded-full" />
          ))}
        </div>
        
        <div className="shimmer h-5 w-44 rounded pt-4" />
      </div>
    </div>
  );
}

// Animated UI Mockup Components
function AIChatMockup({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
        <div className="w-2 h-2 rounded-full bg-foreground/20" />
        <div className="w-2 h-2 rounded-full bg-foreground/20" />
        <div className="w-2 h-2 rounded-full bg-foreground/20" />
        <span className="ml-2 text-xs font-mono text-muted-foreground">AI Assistant</span>
      </div>
      
      {/* Chat Messages */}
      <div className="p-4 space-y-3">
        {/* User message */}
        <div className={`flex justify-end transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: '200ms' }}>
          <div className="bg-foreground text-background text-xs px-3 py-2 rounded-2xl rounded-tr-sm max-w-[70%]">
            How can I reset my password?
          </div>
        </div>
        
        {/* AI response */}
        <div className={`flex justify-start transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '400ms' }}>
          <div className="bg-secondary text-foreground text-xs px-3 py-2 rounded-2xl rounded-tl-sm max-w-[80%]">
            <span className={`inline-block ${isActive ? 'animate-pulse' : ''}`}>I can help you with that! Let me send you a reset link...</span>
          </div>
        </div>
        
        {/* Typing indicator */}
        <div className={`flex justify-start transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '600ms' }}>
          <div className="flex gap-1 px-3 py-2">
            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
      
      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-background">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <span className="text-xs text-muted-foreground">Type a message...</span>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <span className="text-xs font-mono text-muted-foreground">Operations Dashboard</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Live</span>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: siteTones.gateway.accent }} />
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 p-3">
        {[
          { label: "Revenue", value: "$47.2K", change: "+12%" },
          { label: "Orders", value: "1,284", change: "+8%" },
          { label: "Users", value: "892", change: "+23%" },
        ].map((stat, i) => (
          <div 
            key={stat.label}
            className={`bg-secondary/50 rounded-lg p-2 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${200 + i * 100}ms` }}
          >
            <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            <p className="text-sm font-semibold">{stat.value}</p>
            <p className="text-[9px]" style={{ color: siteTones.gateway.accent }}>{stat.change}</p>
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="px-3 pb-3">
        <div className={`h-20 bg-secondary/30 rounded-lg overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '500ms' }}>
          <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M0,45 Q20,40 40,35 T80,30 T120,20 T160,25 T200,15" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`text-foreground ${isActive ? 'animate-draw-line' : ''}`}
              style={{
                strokeDasharray: 300,
                strokeDashoffset: isActive ? 0 : 300,
                transition: 'stroke-dashoffset 1s ease-out 0.6s'
              }}
            />
            <path 
              d="M0,45 Q20,40 40,35 T80,30 T120,20 T160,25 T200,15 L200,60 L0,60 Z" 
              fill="url(#chartGradient)"
              className={`text-foreground transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '1s' }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MarketplaceMockup({ isActive }: { isActive: boolean }) {
  return (
    <div className={`absolute inset-4 bg-background rounded-xl border border-border overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <span className="text-xs font-mono text-muted-foreground">Marketplace</span>
        <div className="flex items-center gap-2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded-full">
          Cart (3)
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-2 p-3">
        {[1, 2, 3, 4].map((item, i) => (
          <div 
            key={item}
            className={`bg-secondary/30 rounded-lg overflow-hidden transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            style={{ transitionDelay: `${200 + i * 100}ms` }}
          >
            <div className="aspect-square bg-secondary/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-foreground/10" />
            </div>
            <div className="p-2">
              <div className="h-2 bg-foreground/10 rounded w-3/4 mb-1" />
              <div className="h-2 bg-foreground/20 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Add to cart animation */}
      <div 
        className={`absolute bottom-3 left-3 right-3 bg-foreground text-background text-xs py-2 rounded-lg text-center transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '700ms' }}
      >
        View all products
      </div>
    </div>
  );
}

const examples = [
  {
    icon: Bot,
    title: "AI Assistant",
    subtitle: "Customer support automation",
    description: "An intelligent assistant that handles customer inquiries, routes complex issues, and learns from interactions to improve over time.",
    features: ["Natural language understanding", "Multi-channel support", "Escalation workflows", "Analytics dashboard"],
    href: getTemplateHref("customer-support-ai-assistant"),
    Mockup: AIChatMockup,
  },
  {
    icon: BarChart3,
    title: "Operations Dashboard",
    subtitle: "Centralized business control",
    description: "A unified platform that consolidates your operations data, tracks KPIs, and gives your team real-time visibility into what matters.",
    features: ["Real-time data sync", "Custom metrics", "Team collaboration", "Automated reports"],
    href: getTemplateHref("operations-command-center"),
    Mockup: DashboardMockup,
  },
  {
    icon: Store,
    title: "Marketplace Platform",
    subtitle: "Multi-vendor commerce",
    description: "A complete marketplace solution connecting buyers and sellers, with payments, logistics, and vendor management built in.",
    features: ["Vendor onboarding", "Payment processing", "Order management", "Review system"],
    href: getTemplateHref("multi-vendor-marketplace"),
    Mockup: MarketplaceMockup,
  },
];

function ExampleCard({ example, index }: { example: typeof examples[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });
  const Icon = example.icon;
  const Mockup = example.Mockup;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex h-full flex-col bg-background/88 border border-foreground/8 rounded-[10px] overflow-hidden transition-all duration-700 hover:border-foreground/14 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* UI Preview Mockup - Shows on hover */}
      <div className={`relative h-52 lg:h-60 bg-foreground/[0.035] transition-all duration-500 overflow-hidden ${isHovered ? 'bg-foreground/[0.06]' : ''}`}>
        <Mockup isActive={isHovered} />
        
        {/* Default state - Icon */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isHovered ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
          <div className="w-16 h-16 rounded-[10px] border border-foreground/6 bg-background/72 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-8 h-8 text-foreground/36" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl lg:text-2xl font-display mb-1">
              {example.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {example.subtitle}
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-background/72 px-3 py-1 rounded-full border border-foreground/6">
            Conceptual
          </span>
        </div>
        
        {/* Description */}
        <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mb-5">
          {example.description}
        </p>
        
        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-7">
          {example.features.map((feature, i) => (
            <span 
              key={i}
              className="text-xs text-foreground/70 bg-background/78 px-3 py-1.5 rounded-full border border-foreground/7"
            >
              {feature}
            </span>
          ))}
        </div>
        
        {/* CTA */}
        <Link 
          href={example.href}
          className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all duration-300"
        >
          Build something like this
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export function ExploreBuildsSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => setIsLoaded(true), 300);

    return () => window.clearTimeout(timeoutId);
  }, [isVisible]);

  return (
    <section
      id="explore-what-you-can-build"
      ref={sectionRef}
      className="relative py-20 lg:py-24 bg-secondary/30"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 lg:mb-16 max-w-3xl">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Explore what you can build
          </span>
          <h2
            className={`text-3xl lg:text-4xl font-display tracking-tight mb-5 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Explore what you can build.
          </h2>
          <p 
            className={`text-base lg:text-[17px] text-muted-foreground leading-relaxed transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            These are conceptual examples of what Noon can create. Your project will be fully custom, built around your specific requirements. <span className="text-foreground/60">Hover to see them come alive.</span>
          </p>
        </div>

        {/* Examples Grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {!isLoaded ? (
            // Shimmer loading skeletons
            <>
              {[0, 1, 2].map((index) => (
                <CardSkeleton key={index} index={index} />
              ))}
            </>
          ) : (
            // Actual cards
            examples.map((example, index) => (
              <ExampleCard key={index} example={example} index={index} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

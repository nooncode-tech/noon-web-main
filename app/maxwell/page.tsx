"use client";

import { Suspense, useEffect, useState } from "react";
import { ArrowRight, Sparkles, MessageSquare, Layers, FileText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { StartWithMaxwellFlow } from "@/app/_components/site/start-with-maxwell-flow";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { siteRoutes } from "@/lib/site-config";
import { siteChromeDots, siteStatusTones, siteTones } from "@/lib/site-tones";

// ============================================================================
// DATA
// ============================================================================

const capabilities = [
  {
    icon: MessageSquare,
    title: "Clarify the idea",
    description: "Turn vague requirements into concrete software direction.",
    tone: siteTones.brand,
  },
  {
    icon: Layers,
    title: "Structure the scope",
    description: "Break down complex projects into actionable phases.",
    tone: siteTones.client,
  },
  {
    icon: FileText,
    title: "Prepare for delivery",
    description: "Create the foundation for a real proposal and build.",
    tone: siteTones.data,
  },
];

// ============================================================================
// ANIMATED CHAT MOCKUP
// ============================================================================

function ChatMockup() {
  const [activeMessage, setActiveMessage] = useState(0);
  const { ref: mockupRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  const messages = [
    { type: "user", text: "I need a customer portal for my SaaS" },
    { type: "maxwell", text: "What's the main problem your customers face today?" },
    { type: "user", text: "They can't track their subscription status or usage" },
    { type: "maxwell", text: "Got it. Let me structure this into a clear scope..." },
  ];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  return (
    <div
      ref={mockupRef}
      className={`rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.red }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.amber }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: siteChromeDots.green }} />
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: siteTones.brand.accent }} />
          <span className="text-sm font-mono text-muted-foreground">Maxwell</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5" style={{ color: siteStatusTones.availability.accent }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: siteStatusTones.availability.accent }} />
          <span className="text-xs">Available</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="p-4 space-y-3 min-h-[200px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} transition-all duration-500 ${index <= activeMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                message.type === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "rounded-bl-md"
              }`}
              style={
                message.type === "maxwell"
                  ? {
                      backgroundColor: siteTones.brand.surface,
                      border: `1px solid ${siteTones.brand.border}`,
                      color: siteTones.brandDeep.accent,
                    }
                  : undefined
              }
            >
              {message.text}
              {message.type === "maxwell" && index === activeMessage && (
                <span className="inline-block w-1.5 h-4 ml-1 animate-pulse" style={{ backgroundColor: siteTones.brand.accent }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
          <span className="text-sm text-muted-foreground">Describe what you want to build...</span>
          <ArrowRight className="w-4 h-4 ml-auto" style={{ color: siteTones.brand.accent }} />
        </div>
      </div>
    </div>
  );
}

const examplePrompts = [
  { text: "Build a client portal with subscription billing", category: "SaaS" },
  { text: "Create an AI assistant for customer support", category: "AI" },
  { text: "Build an operations dashboard with live metrics", category: "Dashboard" },
  { text: "Create a multi-vendor marketplace platform", category: "Marketplace" },
  { text: "Build a mobile app for field service teams", category: "Mobile" },
  { text: "Create a booking system for my business", category: "Booking" },
];

const maxwellPromptCategoryTones = {
  SaaS: siteTones.brand,
  AI: siteTones.data,
  Dashboard: siteTones.client,
  Marketplace: siteTones.services,
  Mobile: siteTones.brandStructural,
  Booking: siteTones.gateway,
} as const;

// ============================================================================
// PAGE
// ============================================================================

export default function MaxwellPage() {
  return (
    <Suspense fallback={<MaxwellPageSkeleton />}>
      <MaxwellPageContent />
    </Suspense>
  );
}

function MaxwellPageSkeleton() {
  return (
    <SitePageFrame>
      <section className="site-hero-section">
        <div className="site-shell">
          <div className="max-w-3xl">
            <div className="h-6 w-32 bg-secondary rounded animate-pulse mb-6" />
            <div className="h-12 w-64 bg-secondary rounded animate-pulse mb-6" />
            <div className="h-6 w-96 bg-secondary rounded animate-pulse" />
          </div>
        </div>
      </section>
    </SitePageFrame>
  );
}

function MaxwellPageContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") || "";

  const { ref: headerRef, isVisible: headerVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SitePageFrame>
      {/* Hero */}
      <section ref={headerRef} className="site-hero-section">
        <div className="site-shell">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div 
                className={`inline-flex items-center gap-3 mb-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <span className="w-8 h-px" style={{ backgroundColor: siteTones.brand.accent }} />
                <span className="text-sm font-mono text-muted-foreground">Maxwell</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    color: siteStatusTones.availability.accent,
                    backgroundColor: siteStatusTones.availability.surface,
                    border: `1px solid ${siteStatusTones.availability.border}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: siteStatusTones.availability.accent }}
                  />
                  Available
                </span>
              </div>
              <h1 
                className={`text-4xl lg:text-5xl font-display tracking-tight mb-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "100ms" }}
              >
                Start building with
                <br />
                <span className="text-muted-foreground">Maxwell.</span>
              </h1>
              <p 
                className={`text-base lg:text-lg text-muted-foreground leading-relaxed transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "200ms" }}
              >
                Describe what you want to build. Maxwell helps turn your idea into a clearer software direction and moves the conversation toward the right next step.
              </p>
            </div>
            
            {/* Chat Mockup */}
            <div className="hidden lg:block">
              <ChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="site-section">
        <div className="site-shell">
          <div className="grid gap-4 md:grid-cols-3 mb-12">
            {capabilities.map((cap, index) => (
              <CapabilityCard key={cap.title} capability={cap} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Main Flow */}
      <section className="site-section">
        <div className="site-shell">
          <StartWithMaxwellFlow initialPrompt={prompt} />
        </div>
      </section>

      {/* Example Prompts */}
      <section className="site-section bg-secondary/30">
        <div className="site-shell">
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-8 h-px" style={{ backgroundColor: siteTones.brand.accent }} />
              Examples
            </span>
            <h2 className="text-2xl lg:text-3xl font-display tracking-tight">
              Try one of these
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
{examplePrompts.map((example, index) => (
  <ExamplePromptCard key={example.text} prompt={example} index={index} />
  ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section-lg bg-foreground text-background">
        <div className="site-shell text-center">
          <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
            Prefer a direct route?
          </h2>
          <p className="text-background/70 mb-8 max-w-md mx-auto">
            You can contact Noon directly or browse templates before the next step.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={siteRoutes.contact}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
            >
              Contact Noon
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={siteRoutes.templates}
              className="inline-flex items-center gap-2 rounded-full border border-background/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-background/10"
            >
              Browse templates
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

function CapabilityCard({ 
  capability, 
  index 
}: { 
  capability: typeof capabilities[0]; 
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });
  const Icon = capability.icon;
  const tone = capability.tone;

  return (
    <div
      ref={cardRef}
      className={`group relative flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-700 hover:border-foreground/20 overflow-hidden ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{
        transitionDelay: `${index * 100}ms`,
        borderColor: isHovered ? tone.border : undefined,
        boxShadow: isHovered ? `0 22px 40px -34px ${tone.shadow}` : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundColor: tone.mutedSurface }}
      />
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-300"
            style={{
              borderColor: tone.border,
              backgroundColor: isHovered ? tone.accent : tone.surface,
              color: isHovered ? tone.contrast : tone.accent,
            }}
          >
            <Icon className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "scale-110" : "scale-100"}`} />
          </div>
          {/* Pulse ring on hover */}
          {isHovered && (
            <div className="absolute inset-0 rounded-xl border-2 animate-ping" style={{ borderColor: tone.border }} />
          )}
        </div>
        <div>
          <h3 className="text-base font-display mb-1">{capability.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{capability.description}</p>
          {/* Progress indicator */}
          <div className={`mt-3 flex gap-1 transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  transitionDelay: `${i * 100}ms`,
                  backgroundColor: i <= index + 1 ? tone.accent : "rgba(24, 21, 18, 0.16)",
                  width: i <= index + 1 ? "1rem" : "0.5rem",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamplePromptCard({ 
  prompt, 
  index 
}: { 
  prompt: typeof examplePrompts[0]; 
  index: number;
}) {
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLAnchorElement>({ threshold: 0.2 });
  const tone = maxwellPromptCategoryTones[prompt.category as keyof typeof maxwellPromptCategoryTones] ?? siteTones.brand;

  return (
    <Link
      ref={cardRef}
      href={`${siteRoutes.maxwellStudio}?prompt=${encodeURIComponent(prompt.text)}`}
      className={`group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-700 hover:border-foreground/20 hover:bg-secondary/30 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{
        transitionDelay: `${index * 80}ms`,
        borderColor: tone.border,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border text-[10px] font-mono transition-colors"
          style={{
            borderColor: tone.border,
            backgroundColor: tone.surface,
            color: tone.accent,
          }}
        >
          {prompt.category.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <span className="block text-sm text-foreground truncate">{prompt.text}</span>
          <span className="text-[10px]" style={{ color: tone.accent }}>{prompt.category}</span>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" style={{ color: tone.accent }} />
    </Link>
  );
}

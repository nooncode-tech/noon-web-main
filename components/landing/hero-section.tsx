"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Paperclip, Sparkles } from "lucide-react";
import { CodeEmergence } from "./code-emergence";
import { getStartWithMaxwellHref, siteRoutes } from "@/lib/site-config";

const promptSuggestions = [
  "Build a reservation platform for my business",
  "Create an operations dashboard for my team",
  "I need an AI assistant for customer support",
  "Build custom software for my workflow",
  "Create a mobile app for my business",
];

export function HeroSection() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [canScrollPromptsLeft, setCanScrollPromptsLeft] = useState(false);
  const [canScrollPromptsRight, setCanScrollPromptsRight] = useState(false);
  const promptScrollerRef = useRef<HTMLDivElement>(null);

  function startWithMaxwell() {
    const prompt = inputValue.trim();
    if (!prompt) return;
    router.push(getStartWithMaxwellHref(prompt));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % promptSuggestions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  useEffect(() => {
    const updatePromptScrollState = () => {
      const node = promptScrollerRef.current;
      if (!node) {
        return;
      }

      setCanScrollPromptsLeft(node.scrollLeft > 8);
      const remainingScroll = node.scrollWidth - node.clientWidth - node.scrollLeft;
      setCanScrollPromptsRight(remainingScroll > 8);
    };

    updatePromptScrollState();
    window.addEventListener("resize", updatePromptScrollState);

    return () => window.removeEventListener("resize", updatePromptScrollState);
  }, []);

  const handlePromptCarouselAdvance = () => {
    const node = promptScrollerRef.current;
    if (!node) {
      return;
    }

    node.scrollBy({ left: 220, behavior: "smooth" });
  };

  const handlePromptCarouselBack = () => {
    const node = promptScrollerRef.current;
    if (!node) {
      return;
    }

    node.scrollBy({ left: -220, behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-28 pb-20 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div className="order-2 lg:order-1">
            {/* Eyebrow */}
            <div className="mb-6 flex justify-start">
              <span className="inline-flex items-center gap-2 text-[13px] font-mono text-muted-foreground bg-secondary/50 px-3.5 py-1.5 rounded-full border border-border">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                The code-first software company
              </span>
            </div>

            {/* Main headline */}
            <div className="mb-6">
              <h1 className="text-[clamp(2.25rem,5.4vw,3.7rem)] font-display leading-[1.08] tracking-tight">
                <span className="block text-balance">Tell us what you want to build.</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-[15px] lg:text-[17px] text-muted-foreground leading-relaxed max-w-xl mb-8 text-pretty">
              Noon turns ideas into real, scalable software built in code and accelerated by AI.
            </p>

            {/* Chat Input - Main Element */}
            <div>
              <div className="relative">
                <div className="bg-card border border-border rounded-[10px] p-2 shadow-sm transition-shadow duration-300">
                  <div className="relative min-w-0 overflow-hidden">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          startWithMaxwell();
                        }
                      }}
                      placeholder={isInputFocused ? "Describe what you want to build..." : ""}
                      rows={3}
                      className="min-h-[80px] w-full resize-none bg-transparent px-4 py-2 text-sm leading-relaxed lg:text-[15px] outline-none placeholder:text-muted-foreground/60"
                      aria-label="Describe what you want to build"
                    />
                    {!inputValue && !isInputFocused && (
                      <div className="absolute left-0 right-0 top-0 px-4 py-3 pointer-events-none overflow-hidden">
                        <span
                          key={currentSuggestion}
                          className="block w-full truncate whitespace-nowrap text-sm lg:text-[15px] text-muted-foreground/45 animate-fade-in"
                        >
                          {promptSuggestions[currentSuggestion]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Voice input"
                        title="Voice input is not available yet."
                        disabled
                        className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full bg-secondary/45 text-muted-foreground/60"
                      >
                        <Mic className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Attach a file"
                        title="File upload is not available yet."
                        disabled
                        className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full bg-secondary/45 text-muted-foreground/60"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <Link
                        href={siteRoutes.maxwell}
                        className="inline-flex items-center gap-2 rounded-full bg-secondary/45 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Maxwell
                      </Link>
                    </div>

                    <Button
                      type="button"
                      size="lg"
                      aria-label="Start with Maxwell"
                      onClick={startWithMaxwell}
                      disabled={!inputValue.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9 self-center p-0 rounded-[10px] group shrink-0 disabled:opacity-40"
                    >
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Prompt Suggestions */}
              <div className="mt-5 pl-4 lg:pl-5 max-w-xl">
                <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/55">
                  Try a prompt
                </p>
                <div className="flex items-center gap-2">
                  {canScrollPromptsLeft && (
                    <button
                      type="button"
                      onClick={handlePromptCarouselBack}
                      aria-label="Show previous prompts"
                      className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                    >
                      <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                    </button>
                  )}
                  <div className="relative min-w-0 flex-1">
                    <div
                      ref={promptScrollerRef}
                      onScroll={() => {
                        const node = promptScrollerRef.current;
                        if (!node) {
                          return;
                        }

                        setCanScrollPromptsLeft(node.scrollLeft > 8);
                        const remainingScroll = node.scrollWidth - node.clientWidth - node.scrollLeft;
                        setCanScrollPromptsRight(remainingScroll > 8);
                      }}
                      className="prompt-scroll flex items-center gap-2 overflow-x-auto whitespace-nowrap"
                    >
                      {promptSuggestions.slice(0, 3).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="shrink-0 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-foreground/20 hover:bg-secondary"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    {canScrollPromptsLeft && (
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background via-background/90 to-transparent" />
                    )}
                    {canScrollPromptsRight && (
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background via-background/90 to-transparent" />
                    )}
                  </div>
                  {canScrollPromptsRight && (
                    <button
                      type="button"
                      onClick={handlePromptCarouselAdvance}
                      aria-label="Show more prompts"
                      className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="mt-6 flex">
                <Link
                  href={siteRoutes.homeTemplatesSection}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  View all templates
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

            </div>
          </div>

          {/* Right column - Code Emergence Animation */}
          <div className="order-1 lg:order-2">
            <CodeEmergence />
          </div>
        </div>
      </div>
      <style jsx>{`
        .prompt-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .prompt-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

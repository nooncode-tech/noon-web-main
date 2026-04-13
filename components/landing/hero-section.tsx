"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Paperclip, Sparkles, X, Upload, Github, FileText, Globe, TriangleIcon } from "lucide-react";
import { getStartWithMaxwellHref, siteRoutes } from "@/lib/site-config";

type AttachedFile = {
  name: string;
  mimeType: string;
  dataUrl: string;       // base64 for images
  textContent?: string;  // for text files
};

const promptSuggestions = [
  { label: "Reservation platform", prompt: "Build a reservation platform for my business — customers can book appointments, manage availability, and receive confirmation emails." },
  { label: "Operations dashboard", prompt: "Create an operations dashboard for my team — centralize tasks, KPIs, and team activity in one internal tool." },
  { label: "AI customer support", prompt: "I need an AI assistant for customer support — it should answer FAQs, escalate complex issues, and integrate with our existing chat." },
  { label: "Custom workflow tool", prompt: "Build custom software to automate my business workflow — reduce manual steps and connect my existing tools." },
  { label: "Mobile app", prompt: "Create a mobile app for my business — available on iOS and Android with a clean, modern design." },
  { label: "E-commerce store", prompt: "I need an e-commerce store for my products — with catalog management, cart, checkout, and order tracking." },
  { label: "Client portal", prompt: "Build a client portal where my customers can log in, view their projects, upload documents, and communicate with my team." },
  { label: "Internal tool", prompt: "Create an internal tool for my team to manage operations — track tasks, approvals, and performance metrics in one place." },
];

export function HeroSection() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [canScrollPromptsLeft, setCanScrollPromptsLeft] = useState(false);
  const [canScrollPromptsRight, setCanScrollPromptsRight] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [urlInputMode, setUrlInputMode] = useState<"github" | "vercel" | "image" | null>(null);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [urlInputLoading, setUrlInputLoading] = useState(false);
  const promptScrollerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setAttachMenuOpen(false);
        setUrlInputMode(null);
        setUrlInputValue("");
      }
    }
    if (attachMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [attachMenuOpen]);

  async function handleUrlImport() {
    if (!urlInputValue.trim()) return;
    setUrlInputLoading(true);
    try {
      if (urlInputMode === "github") {
        // Extract owner/repo from URL
        const match = urlInputValue.match(/github\.com\/([^/]+\/[^/]+)/);
        const repo = match ? match[1].replace(/\.git$/, "") : urlInputValue;
        const apiUrl = `https://api.github.com/repos/${repo}/readme`;
        const res = await fetch(apiUrl, { headers: { Accept: "application/vnd.github.raw+json" } });
        if (res.ok) {
          const text = await res.text();
          setAttachedFile({ name: `${repo} (README.md)`, mimeType: "text/plain", dataUrl: "", textContent: text.slice(0, 8000) });
        } else {
          setAttachedFile({ name: `GitHub: ${repo}`, mimeType: "text/plain", dataUrl: "" });
        }
      } else if (urlInputMode === "vercel") {
        setAttachedFile({ name: `Vercel: ${urlInputValue}`, mimeType: "text/plain", dataUrl: "", textContent: `Vercel project URL: ${urlInputValue}` });
      } else if (urlInputMode === "image") {
        setAttachedFile({ name: urlInputValue, mimeType: "image/url", dataUrl: urlInputValue });
      }
    } catch {
      setAttachedFile({ name: urlInputValue, mimeType: "text/plain", dataUrl: "" });
    } finally {
      setUrlInputLoading(false);
      setAttachMenuOpen(false);
      setUrlInputMode(null);
      setUrlInputValue("");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset so same file can be re-selected
    e.target.value = "";

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({ name: file.name, mimeType: file.type, dataUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else if (
      file.type.startsWith("text/") ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".json")
    ) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({ name: file.name, mimeType: file.type, dataUrl: "", textContent: reader.result as string });
      };
      reader.readAsText(file);
    } else {
      // PDF, DOCX, etc. — store name only as context
      setAttachedFile({ name: file.name, mimeType: file.type, dataUrl: "" });
    }
  }

  function startWithMaxwell() {
    const prompt = inputValue.trim();
    if (!prompt && !attachedFile) return;

    if (attachedFile) {
      try {
        sessionStorage.setItem("maxwell_attached_file", JSON.stringify(attachedFile));
      } catch {
        // sessionStorage full or unavailable — proceed without file
      }
    }
    router.push(getStartWithMaxwellHref(prompt || (attachedFile ? `I've attached a file: ${attachedFile.name}` : "")));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % promptSuggestions.length);

    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
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
    <section id="hero" className="relative h-full flex flex-col justify-center">
      <div className="relative z-10 w-full max-w-[760px] mx-auto px-5 lg:px-8 pt-16 pb-4 lg:pt-20 lg:pb-6">
        <div className="flex flex-col items-center text-center">
          {/* Content */}
          <div className="w-full">
            {/* Eyebrow */}
            <div className="mb-4 lg:mb-4 flex justify-center">
              <span className="inline-flex items-center gap-2 text-[11px] lg:text-[13px] font-mono text-muted-foreground bg-secondary/50 px-3 lg:px-3.5 py-1.5 rounded-full border border-border">
                <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary animate-pulse" />
                The code-first software company
              </span>
            </div>

            {/* Main headline */}
            <div className="mb-3 lg:mb-4">
              <h1 className="text-[1.5rem] sm:text-[1.8rem] lg:text-[clamp(1.8rem,2.8vw,2.4rem)] font-display leading-[1.1] tracking-tight">
                Tell us what you<br className="sm:hidden" /> want to build.
              </h1>
            </div>

            {/* Description */}
            <p className="text-[14px] lg:text-[17px] text-muted-foreground leading-relaxed mb-5 lg:mb-6 max-w-sm lg:max-w-xl mx-auto">
              Noon turns ideas into real, scalable software built in code and accelerated by AI.
            </p>

            {/* Chat Input */}
            <div className="w-full">
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
                      className="min-h-[72px] lg:min-h-[80px] w-full resize-none bg-transparent px-3 lg:px-4 py-2 text-sm leading-relaxed lg:text-[15px] outline-none placeholder:text-muted-foreground/60"
                      aria-label="Describe what you want to build"
                    />
                    {!inputValue && !isInputFocused && (
                      <div className="absolute left-0 right-0 top-0 px-4 py-3 pointer-events-none overflow-hidden">
                        <span
                          key={currentSuggestion}
                          className="block w-full truncate whitespace-nowrap text-sm lg:text-[15px] text-muted-foreground/45 animate-fade-in"
                        >
                          {promptSuggestions[currentSuggestion].prompt}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Attached file badge */}
                  {attachedFile && (
                    <div className="px-3 pb-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-foreground max-w-full">
                        <span className="truncate">{attachedFile.name}</span>
                        <button type="button" onClick={() => setAttachedFile(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  )}

                  <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-border/80 pt-2 px-1">
                    {/* Left: tools */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Voice input"
                        title="Voice input is not available yet."
                        disabled
                        className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-secondary/45 text-muted-foreground/60"
                      >
                        <Mic className="h-3.5 w-3.5" />
                      </button>

                      {/* Hidden file inputs */}
                      <input ref={fileInputRef} type="file" accept="image/*,.txt,.md,.csv,.json,.doc,.docx" className="hidden" onChange={handleFileChange} />
                      <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />

                      {/* Attach menu */}
                      <div className="relative" ref={attachMenuRef}>
                        <button
                          type="button"
                          aria-label="Attach"
                          onClick={() => { setAttachMenuOpen((v) => !v); setUrlInputMode(null); setUrlInputValue(""); }}
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${attachMenuOpen ? "bg-secondary text-foreground" : "bg-secondary/45 text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                        </button>

                        {attachMenuOpen && (
                          <div className="absolute bottom-10 left-0 z-50 w-52 rounded-[10px] border border-border bg-card shadow-xl overflow-hidden">
                            {!urlInputMode ? (
                              <div className="py-1">
                                <button type="button" onClick={() => { fileInputRef.current?.click(); setAttachMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                                  <Upload className="h-4 w-4 text-muted-foreground" />
                                  Subir archivo
                                </button>
                                <button type="button" onClick={() => { pdfInputRef.current?.click(); setAttachMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  Subir PDF
                                </button>
                                <div className="my-1 h-px bg-border" />
                                <button type="button" onClick={() => setUrlInputMode("github")} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                                  <Github className="h-4 w-4 text-muted-foreground" />
                                  GitHub
                                </button>
                                <button type="button" onClick={() => setUrlInputMode("vercel")} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                                  <TriangleIcon className="h-4 w-4 text-muted-foreground" />
                                  Vercel
                                </button>
                                <button type="button" onClick={() => setUrlInputMode("image")} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  URL de imagen
                                </button>
                              </div>
                            ) : (
                              <div className="p-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                  {urlInputMode === "github" && "URL o usuario/repo de GitHub"}
                                  {urlInputMode === "vercel" && "URL del proyecto en Vercel"}
                                  {urlInputMode === "image" && "URL de la imagen"}
                                </p>
                                <input
                                  type="text"
                                  autoFocus
                                  value={urlInputValue}
                                  onChange={(e) => setUrlInputValue(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") void handleUrlImport(); if (e.key === "Escape") { setUrlInputMode(null); setUrlInputValue(""); } }}
                                  placeholder={urlInputMode === "github" ? "github.com/user/repo" : urlInputMode === "vercel" ? "vercel.com/project" : "https://..."}
                                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/30"
                                />
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => void handleUrlImport()} disabled={urlInputLoading || !urlInputValue.trim()} className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors">
                                    {urlInputLoading ? "Importando…" : "Importar"}
                                  </button>
                                  <button type="button" onClick={() => { setUrlInputMode(null); setUrlInputValue(""); }} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors">
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Link
                        href={siteRoutes.maxwell}
                        className="inline-flex items-center gap-1.5 rounded-full bg-secondary/45 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span className="hidden sm:inline">Maxwell</span>
                      </Link>
                    </div>

                    {/* Right: send button */}
                    <Button
                      type="button"
                      size="lg"
                      aria-label="Start with Maxwell"
                      onClick={startWithMaxwell}
                      disabled={!inputValue.trim() && !attachedFile}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 w-8 self-center p-0 rounded-[10px] group shrink-0 disabled:opacity-40"
                    >
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Prompt Suggestions */}
              <div className="mt-3 lg:mt-4 pl-1">
                <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/55">
                  Not sure where to start? Try one of these
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
                        if (!node) return;
                        setCanScrollPromptsLeft(node.scrollLeft > 8);
                        const remainingScroll = node.scrollWidth - node.clientWidth - node.scrollLeft;
                        setCanScrollPromptsRight(remainingScroll > 8);
                      }}
                      className="prompt-scroll flex items-center gap-2 overflow-x-auto whitespace-nowrap"
                    >
                      {promptSuggestions.map((s, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(s.prompt)}
                          className="shrink-0 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-foreground/20 hover:bg-secondary hover:text-foreground"
                        >
                          {s.label}
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
              <div className="mt-3">
                <Link
                  href={siteRoutes.homeTemplatesSection}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  View all templates
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

            </div>{/* end desktop input */}
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

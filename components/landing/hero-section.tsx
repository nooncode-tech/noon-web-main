"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Paperclip, Sparkles, X, Upload, Github, FileText, Globe, TriangleIcon } from "lucide-react";
import { getStartWithMaxwellHref, siteRoutes } from "@/lib/site-config";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

type AttachedFile = {
  name: string;
  mimeType: string;
  dataUrl: string;
  textContent?: string;
};

type Suggestion = { label: string; prompt: string };

export function HeroSection() {
  const router = useRouter();
  const params = useParams();
  const locale = (typeof params?.locale === "string" ? params.locale : null) ?? "en";
  const t = useTranslations("hero");
  const suggestions = t.raw("suggestions") as Suggestion[];

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
        // sessionStorage full or unavailable
      }
    }
    router.push(getStartWithMaxwellHref(prompt || (attachedFile ? `I've attached a file: ${attachedFile.name}` : "")));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [suggestions.length]);

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
  };

  useEffect(() => {
    const updatePromptScrollState = () => {
      const node = promptScrollerRef.current;
      if (!node) return;
      setCanScrollPromptsLeft(node.scrollLeft > 8);
      const remainingScroll = node.scrollWidth - node.clientWidth - node.scrollLeft;
      setCanScrollPromptsRight(remainingScroll > 8);
    };

    updatePromptScrollState();
    window.addEventListener("resize", updatePromptScrollState);
    return () => window.removeEventListener("resize", updatePromptScrollState);
  }, []);

  const handlePromptCarouselAdvance = () => {
    promptScrollerRef.current?.scrollBy({ left: 220, behavior: "smooth" });
  };

  const handlePromptCarouselBack = () => {
    promptScrollerRef.current?.scrollBy({ left: -220, behavior: "smooth" });
  };

  const urlInputLabel =
    urlInputMode === "github"
      ? t("attachMenu.githubLabel")
      : urlInputMode === "vercel"
      ? t("attachMenu.vercelLabel")
      : t("attachMenu.imageLabel");

  return (
    <section id="hero" className="relative h-full flex flex-col justify-center pt-16 lg:pt-20">
      <div className="relative z-10 w-full max-w-[840px] mx-auto px-5 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-full">
            {/* Eyebrow */}
            <div className="mb-4 lg:mb-4 flex justify-center">
              <span className="inline-flex items-center gap-2 text-[11px] lg:text-[13px] font-mono text-muted-foreground bg-secondary/50 px-3 lg:px-3.5 py-1.5 rounded-full border border-border">
                <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary animate-pulse" />
                {t("eyebrow")}
              </span>
            </div>

            {/* Main headline */}
            <div className="mb-4 lg:mb-5">
              <h1 className="text-[1.5rem] sm:text-[1.8rem] lg:text-[clamp(1.8rem,2.8vw,2.4rem)] font-display leading-[1.1] tracking-tight text-center">
                {t("headline")}
              </h1>
            </div>

            {/* Chat Input */}
            <div className="w-full">
              <div className="relative pb-[38px]">
                {/* Blue badge — behind card, aligned with card width */}
                <Link
                  href={`/${locale}${siteRoutes.howItWorksHref}`}
                  className="absolute inset-x-0 bottom-0 h-[44px] rounded-b-[10px] flex items-end justify-between px-4 pb-2.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                  style={{ background: "#1200C5" }}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    {t("howItWorks")}
                  </span>
                </Link>

                {/* Dark card — on top, full rounded corners */}
                <div className="relative z-10 bg-card dark:bg-[#131313] rounded-[10px] p-2 shadow-md transition-shadow duration-300">
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
                      placeholder={isInputFocused ? t("placeholder") : ""}
                      rows={3}
                      className="min-h-[48px] lg:min-h-[56px] w-full resize-none bg-transparent px-3 lg:px-4 py-2 text-sm leading-relaxed lg:text-[15px] outline-none placeholder:text-muted-foreground/60 text-left"
                      aria-label={t("placeholder")}
                    />
                    {!inputValue && !isInputFocused && (
                      <div className="absolute left-0 right-0 top-0 px-4 py-3 pointer-events-none overflow-hidden">
                        <span
                          key={currentSuggestion}
                          className="block w-full truncate whitespace-nowrap text-sm lg:text-[15px] text-muted-foreground/45 animate-fade-in text-left"
                        >
                          {suggestions[currentSuggestion]?.prompt}
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

                  <div className="mt-1.5 flex items-center justify-between gap-2 pt-2 px-1">
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
                                  {t("attachMenu.uploadFile")}
                                </button>
                                <button type="button" onClick={() => { pdfInputRef.current?.click(); setAttachMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  {t("attachMenu.uploadPdf")}
                                </button>
                                <div className="my-1 h-px bg-border" />
                                <button type="button" onClick={() => setUrlInputMode("github")} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                                  <Github className="h-4 w-4 text-muted-foreground" />
                                  {t("attachMenu.github")}
                                </button>
                                <button type="button" onClick={() => setUrlInputMode("vercel")} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                                  <TriangleIcon className="h-4 w-4 text-muted-foreground" />
                                  {t("attachMenu.vercel")}
                                </button>
                                <button type="button" onClick={() => setUrlInputMode("image")} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  {t("attachMenu.imageUrl")}
                                </button>
                              </div>
                            ) : (
                              <div className="p-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">{urlInputLabel}</p>
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
                                    {urlInputLoading ? t("importing") : t("import")}
                                  </button>
                                  <button type="button" onClick={() => { setUrlInputMode(null); setUrlInputValue(""); }} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors">
                                    {t("cancel")}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/${locale}${siteRoutes.maxwell}`}
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
                </div>{/* end dark card */}
              </div>

              {/* Prompt Suggestions */}
              <div className="mt-3 lg:mt-4">
                <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/55 text-center">
                  {t("notSure")}
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
                      {suggestions.map((s, index) => (
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
                  href={`/${locale}${siteRoutes.templates}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 group"
                >
                  {t("viewTemplates")}
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

            </div>
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

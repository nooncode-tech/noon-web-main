"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, PanelRight } from "lucide-react";
import { getStartWithMaxwellHref, siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";
import { NoonLogo } from "@/components/ui/noon-logo";

// Inline nav label translations (nav is used outside NextIntlClientProvider too)
const NAV_LABELS: Record<string, { services: string; templates: string; about: string; startWithMaxwell: string }> = {
  en: { services: "Services", templates: "Templates", about: "About", startWithMaxwell: "Start with Maxwell" },
  es: { services: "Servicios", templates: "Plantillas", about: "Nosotros", startWithMaxwell: "Empezar con Maxwell" },
  fr: { services: "Services", templates: "Modèles", about: "À propos", startWithMaxwell: "Commencer avec Maxwell" },
  de: { services: "Dienste", templates: "Vorlagen", about: "Über uns", startWithMaxwell: "Mit Maxwell starten" },
};

const navigationTone = siteTones.brand;



const LOCALES = ["en", "es", "fr", "de"];


export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const frameRef = useRef<number | null>(null);
  const isScrolledRef = useRef(false);
  const scrollProgressRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const isHiddenRef = useRef(false);
  const pathname = usePathname();
  const params = useParams();

  // Derive locale from URL
  const paramLocale = typeof params?.locale === "string" ? params.locale : null;
  const pathLocale = LOCALES.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
  const currentLocale = (paramLocale && LOCALES.includes(paramLocale) ? paramLocale : pathLocale) ?? "en";
  const navLabels = NAV_LABELS[currentLocale] ?? NAV_LABELS.en;

  const translatedNav = [
    { name: navLabels.services, href: siteRoutes.services, match: [siteRoutes.services] },
    { name: navLabels.templates, href: siteRoutes.templates, match: [siteRoutes.templates] },
    { name: navLabels.about, href: siteRoutes.about, match: [siteRoutes.about] },
  ];

  // Prepend locale to internal links so navigation preserves the current locale
  const localHref = (href: string) => {
    if (href.startsWith("http") || href.startsWith("//")) return href;
    return `/${currentLocale}${href}`;
  };

  const isActiveLink = (matches: string[]) =>
    matches.some((route) => pathname === route || pathname.endsWith(route) || pathname.includes(`${route}/`));

  useEffect(() => {
    const updateScrollState = () => {
      frameRef.current = null;

      const nextIsScrolled = window.scrollY > 20;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextScrollProgress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      if (nextIsScrolled !== isScrolledRef.current) {
        isScrolledRef.current = nextIsScrolled;
        setIsScrolled(nextIsScrolled);
      }

      if (Math.abs(nextScrollProgress - scrollProgressRef.current) > 0.2) {
        scrollProgressRef.current = nextScrollProgress;
        setScrollProgress(nextScrollProgress);
      }

      if (currentScrollY <= 20 || scrollDelta < -6) {
        if (isHiddenRef.current) {
          isHiddenRef.current = false;
          setIsHidden(false);
        }
      } else {
        const nextIsHidden = !isMobileMenuOpen && currentScrollY > 120 && scrollDelta > 6;
        if (nextIsHidden !== isHiddenRef.current) {
          isHiddenRef.current = nextIsHidden;
          setIsHidden(nextIsHidden);
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    const handleScroll = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
    <header
      className={`fixed z-[60] transition-all duration-500 ${
        isHidden && !isMobileMenuOpen ? "-translate-y-[140%] opacity-0" : "translate-y-0 opacity-100"
      } ${
        isScrolled
          ? "top-3 left-3 right-3 md:top-5 md:left-5 md:right-5"
          : "top-0 left-3 right-3 md:top-0 md:left-5 md:right-5"
      }`}
    >
      <nav
        className={`transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "mx-auto bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent w-full"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 ${
            isScrolled ? "h-14 px-6 lg:px-8" : "h-11 px-0"
          }`}
        >
          {/* Logo */}
          <Link href={localHref(siteRoutes.home)} className="flex items-center group">
            <NoonLogo
              variant="wordmark"
              height={isScrolled ? 18 : 22}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {translatedNav.map((link) => (
              <Link
                key={link.name}
                href={localHref(link.href)}
                className={`text-sm transition-colors duration-300 relative group ${
                  isActiveLink(link.match) ? "" : "text-foreground/70 hover:text-foreground"
                }`}
                style={isActiveLink(link.match) ? { color: navigationTone.accent } : undefined}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-px transition-all duration-300 ${
                    isActiveLink(link.match) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                  style={{ backgroundColor: navigationTone.accent }}
                />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={`rounded-full transition-all duration-500 text-foreground/70 hover:text-foreground ${
                isScrolled ? "px-4 h-8 text-xs" : "px-5"
              }`}
            >
              <Link href={localHref("/signin")}>Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className={`bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-500 ${
                isScrolled ? "px-4 h-8 text-xs" : "px-6"
              }`}
              style={{ borderRadius: "10px", boxShadow: `inset 0 0 0 1px ${navigationTone.border}` }}
            >
              <Link href={localHref("/signin")}>Sign up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8"
            aria-label="Toggle menu"
          >
            <PanelRight className="w-5 h-5" style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        {/* Scroll progress bar */}
        <div
          className={`relative h-[2px] overflow-hidden rounded-b-2xl transition-opacity duration-300 ${
            scrollProgress > 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0" style={{ backgroundColor: navigationTone.surface }} />
          <div
            className="absolute inset-y-0 left-0 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%`, backgroundColor: navigationTone.accent }}
          />
        </div>
      </nav>
    </header>

    {/* Mobile Menu — backdrop */}
    <div
      className={`md:hidden fixed inset-0 z-[998] transition-all duration-300 ${
        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)" }}
      onClick={() => setIsMobileMenuOpen(false)}
    />

    {/* Mobile Menu — right drawer */}
    <div
      className={`md:hidden fixed top-1.5 right-1.5 bottom-1.5 z-[999] w-72 transition-all duration-300 ${
        isMobileMenuOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-full pointer-events-none"
      }`}
    >
      <div className="h-full rounded-[10px] border border-foreground/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/8">
          <Link href={localHref(siteRoutes.home)} className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <NoonLogo variant="wordmark" height={24} />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center w-7 h-7 rounded-[6px] border border-foreground/10 bg-secondary/50 text-muted-foreground"
            aria-label="Close menu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nav links */}
        <div className="px-3 py-3">
          {translatedNav.map((link) => (
            <Link
              key={link.name}
              href={localHref(link.href)}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3.5 rounded-[8px] text-base font-medium transition-colors duration-200 ${
                isActiveLink(link.match) ? "bg-secondary/60" : "hover:bg-secondary/40 text-foreground/80"
              }`}
              style={{ color: isActiveLink(link.match) ? navigationTone.accent : undefined }}
            >
              {link.name}
              {isActiveLink(link.match) && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: navigationTone.accent }} />
              )}
            </Link>
          ))}
        </div>

        {/* Language switcher + CTA */}
        <div
          className="px-4 pb-4 pt-1 space-y-3"
        >
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground rounded-[8px] h-11 text-sm font-medium hover:bg-primary/90"
          >
            <a href={getStartWithMaxwellHref()} onClick={() => setIsMobileMenuOpen(false)}>
              {navLabels.startWithMaxwell}
            </a>
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}

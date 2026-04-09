"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { getStartWithMaxwellHref, primaryNavigation, siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";
import { NoonLogo } from "@/components/ui/noon-logo";

const navigationTone = siteTones.brand;

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

  const isActiveLink = (matches: string[]) =>
    matches.some((route) => pathname === route || pathname.startsWith(`${route}/`));

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
      className={`fixed z-50 transition-all duration-500 ${
        isHidden && !isMobileMenuOpen ? "-translate-y-[140%] opacity-0" : "translate-y-0 opacity-100"
      } ${
        isScrolled
          ? "top-3 left-3 right-3 md:top-5 md:left-5 md:right-5"
          : "top-1.5 left-1.5 right-1.5 md:top-3 md:left-3 md:right-3"
      }`}
    >
      <nav
        className={`mx-auto overflow-hidden transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <Link href={siteRoutes.home} className="flex items-center group">
            <NoonLogo
              variant="wordmark"
              height={isScrolled ? 18 : 22}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {primaryNavigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
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
          <div className="hidden md:flex items-center gap-4">
            <Button
              asChild
              size="sm"
              className={`bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-500 ${
                isScrolled ? "px-4 h-8 text-xs" : "px-6"
              }`}
              style={{ boxShadow: `inset 0 0 0 1px ${navigationTone.border}` }}
            >
              <Link href={getStartWithMaxwellHref()}>Start with Maxwell</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Scroll progress bar */}
        <div
          className={`relative h-[2px] transition-opacity duration-300 ${
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

    {/* Mobile Menu — slide-down panel */}
    <div
      className={`md:hidden fixed left-3 right-3 top-3 z-[999] transition-all duration-500 ${
        isMobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div className="rounded-2xl border border-foreground/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/8">
          <Link href={siteRoutes.home} className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <NoonLogo variant="wordmark" height={26} />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-foreground/10 bg-secondary/50 text-muted-foreground"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <div className="px-3 py-3">
          {primaryNavigation.map((link, i) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              } ${isActiveLink(link.match) ? "bg-secondary/60" : "hover:bg-secondary/40 text-foreground/80"}`}
              style={{
                transitionDelay: isMobileMenuOpen ? `${80 + i * 50}ms` : "0ms",
                color: isActiveLink(link.match) ? navigationTone.accent : undefined,
              }}
            >
              {link.name}
              {isActiveLink(link.match) && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: navigationTone.accent }} />
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`px-4 pb-4 pt-1 transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "280ms" : "0ms" }}
        >
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground rounded-xl h-12 text-sm font-medium hover:bg-primary/90"
          >
            <Link href={getStartWithMaxwellHref()} onClick={() => setIsMobileMenuOpen(false)}>
              Start with Maxwell
            </Link>
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}

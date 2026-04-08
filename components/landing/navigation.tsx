"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { getStartWithMaxwellHref, primaryNavigation, siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";

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
            <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}>
              Noon
            </span>
            <span
              className="ml-2 h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-125"
              style={{ backgroundColor: navigationTone.accent }}
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

    {/* Mobile Menu — outside header to avoid stacking context issues */}
    <div
      className={`md:hidden fixed inset-0 bg-background z-[999] transition-all duration-500 ${
        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col h-full px-8 pt-28 pb-8">
        <div className="flex-1 flex flex-col justify-center gap-8">
          {primaryNavigation.map((link, i) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-5xl font-display transition-all duration-500 ${
                isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              } ${isActiveLink(link.match) ? "" : "text-foreground hover:text-muted-foreground"}`}
              style={{
                transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms",
                color: isActiveLink(link.match) ? navigationTone.accent : undefined,
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div
          className={`flex gap-4 pt-8 border-t border-foreground/10 transition-all duration-500 ${
            isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
        >
          <Button
            asChild
            className="flex-1 bg-primary text-primary-foreground rounded-full h-14 text-base hover:bg-primary/90"
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

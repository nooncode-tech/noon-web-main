import type { ReactNode } from "react";
import { FloatingTechElements } from "@/components/landing/floating-tech-elements";
import { FooterSection } from "@/components/landing/footer-section";
import { Navigation } from "@/components/landing/navigation";

type SitePageFrameProps = {
  children: ReactNode;
};

export function SitePageFrame({ children }: SitePageFrameProps) {
  return (
    <main className="page-grid-background relative min-h-screen overflow-x-hidden noise-overlay">
      {/* Gradient blooms */}
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-[700px] w-[700px] translate-x-1/3 -translate-y-1/4 rounded-full opacity-[0.055] blur-[120px]" style={{ background: "radial-gradient(circle, #1200c5 0%, transparent 70%)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/3 translate-y-1/4 rounded-full opacity-[0.03] blur-[100px]" style={{ background: "radial-gradient(circle, #6a63f2 0%, transparent 70%)" }} />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] hidden md:block">
        <div
          className="absolute top-[46px] left-3 right-3 bottom-3 rounded-[10px] border border-foreground/10"
          style={{ boxShadow: "0 0 0 9999px var(--background)" }}
        />
      </div>
      <FloatingTechElements />
      <Navigation />
      <div className="relative z-10 pt-28 lg:pt-32">{children}</div>
      <FooterSection />
    </main>
  );
}

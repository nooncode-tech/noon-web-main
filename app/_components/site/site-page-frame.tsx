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
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55]">
        <div
          className="absolute inset-1.5 rounded-[10px] border border-foreground/10 md:inset-3"
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

import dynamic from "next/dynamic";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FloatingTechElements } from "@/components/landing/floating-tech-elements";

const ExploreBuildsSection = dynamic(() =>
  import("@/components/landing/explore-builds-section").then((mod) => mod.ExploreBuildsSection)
);
const FooterSection = dynamic(() =>
  import("@/components/landing/footer-section").then((mod) => mod.FooterSection)
);

function SectionDivider() {
  return (
    <div aria-hidden="true" className="relative z-[1] px-1.5 md:px-3">
      <div className="h-px w-full bg-foreground/10" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="page-grid-background relative min-h-screen overflow-x-hidden noise-overlay">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[55]"
      >
        <div
          className="absolute inset-1.5 rounded-[10px] border border-foreground/10 md:inset-3"
          style={{ boxShadow: "0 0 0 9999px var(--background)" }}
        />
      </div>
      <FloatingTechElements />
      <Navigation />
      <HeroSection />
      <SectionDivider />
      <ExploreBuildsSection />
      <SectionDivider />
      <FooterSection />
    </main>
  );
}

"use client";

import { TechOrbital } from "./tech-orbital";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { siteTones } from "@/lib/site-tones";

const technologies = [
  { name: "Next.js", category: "Web Framework", tone: siteTones.brandDeep },
  { name: "TypeScript", category: "Language", tone: siteTones.brandStructural },
  { name: "Python", category: "Backend", tone: siteTones.services },
  { name: "OpenAI", category: "AI/ML", tone: siteTones.brand },
  { name: "Vercel", category: "Infrastructure", tone: siteTones.brandDeep },
  { name: "Supabase", category: "Database", tone: siteTones.gateway },
  { name: "Stripe", category: "Payments", tone: siteTones.data },
  { name: "Flutter", category: "Mobile", tone: siteTones.client },
];

export function TechnologySection() {
  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLElement>({ threshold: 0.1 });

  return (
    <section id="technology" ref={sectionRef} className="relative py-20 lg:py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          {/* Left - Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Technology we use
            </span>
            <h2 className="text-3xl lg:text-4xl font-display tracking-tight mb-5">
              Modern stack.
              <br />
              <span className="text-muted-foreground">Production ready.</span>
            </h2>
            <p className="text-base lg:text-[17px] text-muted-foreground leading-relaxed mb-8">
              We build with technologies that scale. Every choice is made to ensure your software performs in production.
            </p>
            
            {/* Tech list - badges with colors */}
            <div className="grid grid-cols-2 gap-2.5">
              {technologies.map((tech, index) => (
                <div
                  key={tech.name}
                  className={`group flex items-center gap-3 p-3 border border-border rounded-xl hover:border-foreground/20 hover:bg-secondary/30 transition-all duration-300 cursor-default ${
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg border text-[10px] font-mono font-bold transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: tech.tone.strongSurface,
                      borderColor: tech.tone.border,
                      color: tech.tone.accent,
                    }}
                  >
                    {tech.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-medium truncate">{tech.name}</span>
                    <span className="text-[10px] text-muted-foreground">{tech.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Orbital */}
          <div className="hidden lg:block">
            <TechOrbital />
          </div>
        </div>
      </div>
    </section>
  );
}

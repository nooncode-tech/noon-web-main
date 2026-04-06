"use client";

import { useState } from "react";
import { Code2, Route, Zap, Terminal, GitBranch, Shield } from "lucide-react";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";

export function WhyNoonSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  const handleMouseMove = (e: React.MouseEvent, cardIndex: number) => {
    const card = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - card.left,
      y: e.clientY - card.top,
    });
    setHoveredCard(cardIndex);
  };

  return (
    <section
      id="why-noon"
      ref={sectionRef}
      className="relative py-20 lg:py-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 lg:mb-16 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Why Noon
            <span className="w-8 h-px bg-foreground/30" />
          </span>
          <h2
            className={`text-3xl lg:text-4xl font-display tracking-tight mb-5 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Software that works.
            <br />
            <span className="text-muted-foreground">Built the right way.</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {/* Card 1 - Real Code (Large) */}
          <div
            className={`relative md:col-span-2 lg:col-span-7 rounded-[10px] border border-border bg-card p-6 lg:p-8 overflow-hidden group cursor-default transition-all duration-700 hover:border-foreground/20 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "0ms" }}
            onMouseMove={(e) => handleMouseMove(e, 0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Spotlight effect */}
            {hoveredCard === 0 && (
              <div
                className="absolute pointer-events-none transition-opacity duration-300"
                style={{
                  left: mousePos.x,
                  top: mousePos.y,
                  width: 400,
                  height: 400,
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(circle, oklch(0.3 0.02 60 / 0.1) 0%, transparent 70%)",
                }}
              />
            )}

            <div className="relative z-10 flex h-full flex-col">
              <div className="max-w-2xl">
                <div className="w-12 h-12 rounded-[10px] bg-foreground text-background flex items-center justify-center mb-5">
                  <Code2 className="w-6 h-6" />
                </div>
                
                <span className="inline-block text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full mb-4">
                  Production-grade
                </span>
                
                <h3 className="text-2xl lg:text-3xl font-display mb-4">
                  Built in real code
                </h3>
                
                <p className="text-base lg:text-[17px] text-muted-foreground leading-relaxed max-w-xl">
                  No low-code shortcuts. Every project is built with production-grade technologies that scale with your business.
                </p>
              </div>

              {/* Code preview animation */}
              <div className="mt-7 lg:mt-8 bg-foreground/5 rounded-[10px] p-4 lg:p-5 font-mono text-sm border border-border overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Terminal className="w-4 h-4" />
                  <span>your-project/</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { text: "src/", indent: 0, active: true },
                    { text: "components/", indent: 1, active: false },
                    { text: "app/", indent: 1, active: true },
                    { text: "api/", indent: 1, active: false },
                    { text: "package.json", indent: 0, active: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        item.active ? "text-foreground" : "text-muted-foreground/60"
                      }`}
                      style={{ 
                        marginLeft: item.indent * 16,
                        transitionDelay: `${i * 100}ms`
                      }}
                    >
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-5 grid gap-4 lg:gap-6">
            {/* Card 2 - Clear Process */}
            <div
              className={`relative rounded-[10px] border border-border bg-card p-6 lg:p-7 overflow-hidden group cursor-default transition-all duration-700 hover:border-foreground/20 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: "100ms" }}
              onMouseMove={(e) => handleMouseMove(e, 1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {hoveredCard === 1 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    width: 300,
                    height: 300,
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, oklch(0.3 0.02 60 / 0.1) 0%, transparent 70%)",
                  }}
                />
              )}

              <div className="relative z-10 flex h-full flex-col">
                <div className="w-11 h-11 rounded-[10px] bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Route className="w-5 h-5" />
                </div>
                
                <h3 className="text-lg lg:text-xl font-display mb-3">
                  Clear process
                </h3>
                
                <p className="text-muted-foreground leading-relaxed text-sm">
                  From initial conversation to deployment, every step is transparent. You always know where your project stands.
                </p>

                <div className="mt-auto pt-6 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        step <= 3 ? "bg-foreground" : "bg-foreground/20"
                      }`}
                      style={{ transitionDelay: `${step * 100}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3 - AI Accelerated */}
            <div
              className={`relative rounded-[10px] border border-border bg-card p-6 lg:p-7 overflow-hidden group cursor-default transition-all duration-700 hover:border-foreground/20 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: "200ms" }}
              onMouseMove={(e) => handleMouseMove(e, 2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {hoveredCard === 2 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    width: 300,
                    height: 300,
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, oklch(0.3 0.02 60 / 0.1) 0%, transparent 70%)",
                  }}
                />
              )}

              <div className="relative z-10 flex h-full flex-col">
                <div className="w-11 h-11 rounded-[10px] bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Zap className="w-5 h-5" />
                </div>
                
                <h3 className="text-lg lg:text-xl font-display mb-3">
                  AI-accelerated
                </h3>
                
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Maxwell handles scoping, and our tools accelerate development. Move faster without sacrificing quality.
                </p>

                <div className="mt-auto pt-6 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Maxwell processing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-12 grid gap-4 md:grid-cols-2 lg:gap-6">
            {/* Card 4 - Version Control */}
            <div
              className={`relative rounded-[10px] border border-border bg-card p-6 lg:p-7 overflow-hidden group cursor-default transition-all duration-700 hover:border-foreground/20 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: "300ms" }}
              onMouseMove={(e) => handleMouseMove(e, 3)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {hoveredCard === 3 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    width: 200,
                    height: 200,
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, oklch(0.3 0.02 60 / 0.1) 0%, transparent 70%)",
                  }}
                />
              )}

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-[10px] bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display">Ownership aligned with your engagement model</h3>
                  <p className="text-sm text-muted-foreground">
                    Ownership and delivery structure depend on the engagement model. Client data remains the client&apos;s.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 5 - Security */}
            <div
              className={`relative rounded-[10px] border border-border bg-card p-6 lg:p-7 overflow-hidden group cursor-default transition-all duration-700 hover:border-foreground/20 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: "400ms" }}
              onMouseMove={(e) => handleMouseMove(e, 4)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {hoveredCard === 4 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    width: 200,
                    height: 200,
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, oklch(0.3 0.02 60 / 0.1) 0%, transparent 70%)",
                  }}
                />
              )}

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-[10px] bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display">Enterprise-ready</h3>
                  <p className="text-sm text-muted-foreground">Built for scale and security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

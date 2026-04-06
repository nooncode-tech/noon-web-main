"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

const codeLines = [
  { text: "const app = createNoonApp({", delay: 0 },
  { text: "  name: 'Your Vision',", delay: 100 },
  { text: "  type: 'production-ready',", delay: 200 },
  { text: "  stack: ['Next.js', 'AI'],", delay: 300 },
  { text: "  scaling: 'infinite',", delay: 400 },
  { text: "});", delay: 500 },
  { text: "", delay: 600 },
  { text: "await maxwell.build(app);", delay: 700 },
  { text: "// Deploying to production...", delay: 900 },
  { text: "// Live in minutes", delay: 1100 },
];

const floatingElements = [
  { icon: "Next.js", x: 15, y: 20 },
  { icon: "TypeScript", x: 10, y: 75 },
  { icon: "AI", x: 85, y: 70 },
  { icon: "React", x: 82, y: 18 },
];

export function CodeEmergence() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      codeLines.forEach((line, index) => {
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, index]);
          if (index === codeLines.length - 3) {
            setIsBuilding(true);
          }
        }, line.delay + 500);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isBuilding) {
      const interval = setInterval(() => {
        setBuildProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(prev + 5, 100);
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [isBuilding]);

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handlePointerLeave = () => {
    setMousePosition({ x: 50, y: 50 });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-visible"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Floating tech badges */}
      {floatingElements.map((el, i) => (
        <div
          key={el.icon}
          className="absolute rounded-md border border-border/20 bg-secondary/20 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/32 transition-all duration-1000"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            transform: `translate(-50%, -50%) translateX(${(mousePosition.x - 50) * 0.06 * (i % 2 === 0 ? 1 : -1)}px) translateY(${(mousePosition.y - 50) * 0.06 * (i % 2 === 0 ? -1 : 1)}px)`,
            animationDelay: `${i * 200}ms`,
          }}
        >
          {el.icon}
        </div>
      ))}

      {/* Main code window */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="pointer-events-none absolute -inset-10 -z-10 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${(mousePosition.x - 50) * 0.12}px, ${(mousePosition.y - 50) * 0.12}px)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-[32px] blur-3xl"
            style={{
              background: "radial-gradient(circle, oklch(1 0 0 / 0.14) 0%, oklch(0.97 0.01 95 / 0.08) 32%, transparent 72%)",
            }}
          />
        </div>

        {/* Window chrome */}
        <div className="bg-card/80 backdrop-blur-xl rounded-xl border border-border shadow-lg overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-foreground/20" />
              <div className="w-3 h-3 rounded-full bg-foreground/20" />
              <div className="w-3 h-3 rounded-full bg-foreground/20" />
            </div>
            <span className="text-xs font-mono text-muted-foreground ml-2">
              maxwell-build.ts
            </span>
            {isBuilding && (
              <span className="ml-auto text-xs font-mono text-foreground/60 animate-pulse">
                Building...
              </span>
            )}
          </div>

          {/* Code content */}
          <div className="p-4 font-mono text-sm space-y-1 min-h-[280px]">
            {codeLines.map((line, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  visibleLines.includes(index)
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
              >
                <span className="text-muted-foreground/40 select-none mr-4">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={
                    line.text.includes("//")
                      ? "text-muted-foreground/60"
                      : line.text.includes("'")
                      ? "text-foreground"
                      : "text-foreground/80"
                  }
                >
                  {line.text}
                </span>
              </div>
            ))}
          </div>

          {/* Build progress bar */}
          {isBuilding && (
            <div className="px-4 pb-4">
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-100 ease-out"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs font-mono text-muted-foreground">
                <span>Progress</span>
                <span>{buildProgress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Decorative glow */}
        <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-foreground/[0.03] via-transparent to-foreground/[0.03] blur-2xl" />
      </div>

      {/* Connecting lines animation */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-[0.08]">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={`${20 + i * 15}%`}
            x2="100%"
            y2={`${20 + i * 15}%`}
            stroke="url(#lineGradient)"
            strokeWidth="0.5"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </svg>
    </div>
  );
}

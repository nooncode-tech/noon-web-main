"use client";

import { useEffect, useState } from "react";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";

interface TechItem {
  name: string;
  category: string;
  angle: number;
  orbit: number;
}

const technologies: TechItem[] = [
  { name: "Next.js", category: "Framework", angle: 0, orbit: 1 },
  { name: "TypeScript", category: "Language", angle: 45, orbit: 1 },
  { name: "Python", category: "Backend", angle: 90, orbit: 2 },
  { name: "OpenAI", category: "AI/ML", angle: 135, orbit: 1 },
  { name: "Vercel", category: "Deploy", angle: 180, orbit: 2 },
  { name: "Supabase", category: "Database", angle: 225, orbit: 1 },
  { name: "Stripe", category: "Payments", angle: 270, orbit: 2 },
  { name: "Flutter", category: "Mobile", angle: 315, orbit: 1 },
];

function roundPosition(value: number, precision = 3) {
  return Number(value.toFixed(precision));
}

export function TechOrbital() {
  const [rotation, setRotation] = useState(0);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const { ref: containerRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.3 });

  useEffect(() => {
    if (!isVisible || hoveredTech) return;
    
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.2) % 360);
    }, 120);

    return () => clearInterval(interval);
  }, [isVisible, hoveredTech]);

  const getPosition = (angle: number, orbit: number) => {
    const baseRadius = orbit === 1 ? 140 : 200;
    const radian = ((angle + rotation) * Math.PI) / 180;
    return {
      x: roundPosition(Math.cos(radian) * baseRadius),
      y: roundPosition(Math.sin(radian) * baseRadius * 0.4), // Elliptical orbit
      z: roundPosition(Math.sin(radian)), // For depth perception
    };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square max-w-[500px] mx-auto"
    >
      {/* Center node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center">
            <span className="text-background font-display text-xl">Noon</span>
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full border border-foreground/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute -inset-4 rounded-full border border-foreground/10 animate-ping" style={{ animationDuration: "3s" }} />
        </div>
      </div>

      {/* Orbital paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <ellipse
          cx="50%"
          cy="50%"
          rx="140"
          ry="56"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-border"
          strokeDasharray="4 4"
        />
        <ellipse
          cx="50%"
          cy="50%"
          rx="200"
          ry="80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-border"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Tech nodes */}
      {technologies
        .map((tech) => {
          const pos = getPosition(tech.angle, tech.orbit);
          const isHovered = hoveredTech === tech.name;
          const scale = isHovered ? 1.15 : 0.9 + pos.z * 0.15;
          const opacity = isHovered ? 1 : 0.6 + pos.z * 0.4;

          return (
            <div
              key={tech.name}
              className={`absolute transition-all duration-300 cursor-pointer ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
                zIndex: Math.round(pos.z * 10) + 10,
                transitionDelay: isVisible ? `${technologies.indexOf(tech) * 100}ms` : "0ms",
              }}
              onMouseEnter={() => setHoveredTech(tech.name)}
              onMouseLeave={() => setHoveredTech(null)}
            >
              <div
                className={`relative bg-card border rounded-xl px-4 py-3 transition-all duration-300 ${
                  isHovered 
                    ? "border-foreground shadow-lg" 
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <span className="text-[10px] font-mono text-muted-foreground block">
                  {tech.category}
                </span>
                <span className="text-sm font-medium">
                  {tech.name}
                </span>
                
                {/* Connection line to center */}
                {isHovered && (
                  <div
                    className="absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-foreground/50 to-transparent origin-left animate-pulse"
                    style={{
                      width: `${Math.sqrt(pos.x * pos.x + pos.y * pos.y)}px`,
                      transform: `rotate(${Math.atan2(-pos.y, -pos.x)}rad)`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

      {/* Decorative particles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 + rotation * 2) % 360;
        const radius = 100 + (i % 3) * 60;
        const x = roundPosition(Math.cos((angle * Math.PI) / 180) * radius);
        const y = roundPosition(Math.sin((angle * Math.PI) / 180) * radius * 0.4);
        
        return (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-foreground/20"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
}

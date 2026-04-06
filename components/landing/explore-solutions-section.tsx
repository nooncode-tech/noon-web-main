"use client";

import Link from "next/link";
import { useState } from "react";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { ArrowRight, RefreshCw, LayoutDashboard, Rocket, Puzzle } from "lucide-react";
import { siteRoutes } from "@/lib/site-config";

const solutions = [
  {
    icon: RefreshCw,
    problem: "Manual work that should be automated",
    solution: "We build AI-powered tools and integrations that handle repetitive tasks, freeing your team to focus on what matters.",
    cta: "Automate your workflow",
  },
  {
    icon: LayoutDashboard,
    problem: "Operations that need one central system",
    solution: "Custom dashboards and platforms that consolidate your data, processes, and team actions in one place.",
    cta: "Centralize operations",
  },
  {
    icon: Rocket,
    problem: "A product that needs to launch as real software",
    solution: "We transform validated ideas into production-ready applications. Real code, real infrastructure, real scalability.",
    cta: "Launch your product",
  },
  {
    icon: Puzzle,
    problem: "Workflows that generic tools don't fit",
    solution: "Custom software tailored to your specific business logic. No workarounds, no compromises.",
    cta: "Build custom software",
  },
];

function SolutionCard({ solution, index }: { solution: typeof solutions[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });
  const Icon = solution.icon;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-5 lg:p-6 bg-card border border-border rounded-[10px] transition-all duration-500 hover:border-foreground/20 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className={`w-11 h-11 rounded-[10px] flex items-center justify-center mb-5 transition-colors duration-300 ${
        isHovered ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      
      {/* Problem */}
      <h3 className="text-lg lg:text-xl font-display mb-3 leading-tight">
        {solution.problem}
      </h3>
      
      {/* Solution */}
      <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mb-5">
        {solution.solution}
      </p>
      
      {/* CTA */}
      <Link 
        href={siteRoutes.services}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all duration-300"
      >
        {solution.cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export function ExploreSolutionsSection() {
  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="explore-solutions"
      ref={sectionRef}
      className="relative py-20 lg:py-24 bg-secondary/30"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 lg:mb-16 max-w-3xl">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Explore solutions
          </span>
          <h2
            className={`text-3xl lg:text-4xl font-display tracking-tight mb-5 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            What problem are you solving?
          </h2>
          <p 
            className={`text-base lg:text-[17px] text-muted-foreground leading-relaxed transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Every business has unique challenges. We start by understanding yours, then build the software that solves it.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {solutions.map((solution, index) => (
            <SolutionCard key={index} solution={solution} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

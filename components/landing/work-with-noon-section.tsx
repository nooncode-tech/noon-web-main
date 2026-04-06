"use client";

import Link from "next/link";
import { useState } from "react";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { ArrowRight, Briefcase, Code, Users, Sparkles, CheckCircle, ListTodo, TrendingUp, ShieldCheck, LineChart } from "lucide-react";
import { getContactHref } from "@/lib/site-config";

const roles = [
  {
    id: "sellers",
    icon: Briefcase,
    title: "For Sellers",
    subtitle: "Close deals, earn commissions",
    description: "Bring clients to Noon and earn on every project. We handle discovery, proposals, and delivery. You focus on relationships.",
    benefits: [
      { icon: Users, text: "Access to qualified leads" },
      { icon: Sparkles, text: "AI-powered proposal generation" },
      { icon: CheckCircle, text: "Transparent commission structure" },
    ],
    cta: "Become a Seller",
    ctaLink: getContactHref("seller"),
  },
  {
    id: "developers",
    icon: Code,
    title: "For Developers",
    subtitle: "Build real projects, grow your skills",
    description: "Join our development network. Work on interesting projects with clear requirements, structured milestones, and reliable payments.",
    benefits: [
      { icon: ListTodo, text: "Clear project specs and tasks" },
      { icon: Sparkles, text: "AI tools to accelerate your work" },
      { icon: CheckCircle, text: "Fair rates, on-time payments" },
    ],
    cta: "Join as Developer",
    ctaLink: getContactHref("developer"),
  },
  {
    id: "investors",
    icon: TrendingUp,
    title: "For Investors",
    subtitle: "Back the infrastructure behind Noon",
    description: "Explore investment opportunities tied to Noon's long-term growth. Get a clearer view of our model, direction, and how capital supports expansion.",
    benefits: [
      { icon: LineChart, text: "Exposure to platform growth" },
      { icon: ShieldCheck, text: "Clear strategic positioning" },
      { icon: CheckCircle, text: "Direct access to opportunities" },
    ],
    cta: "Explore Opportunities",
    ctaLink: getContactHref("investor"),
  },
];

function RoleCard({ role, index }: { role: typeof roles[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });
  const Icon = role.icon;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex h-full flex-col p-6 lg:p-8 bg-card border border-border rounded-[10px] transition-all duration-700 hover:border-foreground/20 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center transition-colors duration-300 ${
          isHovered ? "bg-primary text-primary-foreground" : "bg-secondary"
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-xl lg:text-2xl font-display mb-2">
        {role.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {role.subtitle}
      </p>
      
      {/* Description */}
      <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mb-7">
        {role.description}
      </p>
      
      {/* Benefits */}
      <div className="space-y-3.5 mb-7">
        {role.benefits.map((benefit, i) => {
          const BenefitIcon = benefit.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-[10px] bg-secondary/50 flex items-center justify-center">
                <BenefitIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground/80">{benefit.text}</span>
            </div>
          );
        })}
      </div>
      
      {/* CTA */}
      <Link 
        href={role.ctaLink}
        className="mt-auto inline-flex w-fit self-start items-center gap-2 text-sm font-medium text-foreground transition-all duration-300 group-hover:gap-3"
      >
        {role.cta}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export function WorkWithNoonSection() {
  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="work-with-noon"
      ref={sectionRef}
      className="relative py-20 lg:py-24 bg-secondary/30"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 lg:mb-16 max-w-3xl">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Work with Noon
          </span>
          <h2
            className={`text-3xl lg:text-4xl font-display tracking-tight mb-5 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Join the Noon network.
          </h2>
          <p 
            className={`text-base lg:text-[17px] text-muted-foreground leading-relaxed transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Whether you bring clients, build software, or back the network, there&apos;s a place for you at Noon.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((role, index) => (
            <RoleCard key={role.id} role={role} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

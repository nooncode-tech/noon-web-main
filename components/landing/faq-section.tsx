"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { siteRoutes } from "@/lib/site-config";
import { siteTones } from "@/lib/site-tones";

const faqs = [
  {
    question: "How does Noon work?",
    answer: "Start with your idea in Maxwell or Contact. Noon reviews the first direction, refines it when needed, and then moves into proposal, payment activation, and phased delivery when the scope calls for it.",
  },
  {
    question: "How long does a typical project take?",
    answer: "Timing depends on scope, integrations, and whether the work needs to move in phases. Maxwell helps clarify the first direction, and Noon then defines delivery timing in the formal proposal.",
  },
  {
    question: "What does code-first mean?",
    answer: "Every project we deliver is built in real, production-ready code. No low-code templates, no drag-and-drop builders. Ownership depends on the engagement model and what has been paid for and delivered, while client data remains the client's.",
  },
  {
    question: "How is AI used in the process?",
    answer: "AI accelerates our workflow at every stage: Maxwell helps scope projects, AI-assisted coding speeds up development, and automated testing ensures quality. The result is faster delivery without compromising on code quality.",
  },
  {
    question: "What types of projects do you build?",
    answer: "We specialize in custom software: client portals, internal dashboards, AI-powered tools, marketplaces, mobile apps, and workflow automation. We focus on software that solves real operational problems.",
  },
  {
    question: "How much does it cost?",
    answer: "Pricing depends on scope and complexity. We provide transparent quotes after the scoping phase with Maxwell. No hidden fees, no hourly billing surprises. You know the full cost before we start building.",
  },
];

function FAQItem({ 
  faq, 
  index, 
  isOpen, 
  onToggle 
}: { 
  faq: typeof faqs[0]; 
  index: number; 
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { ref: itemRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={itemRef}
      className={`border-b border-border last:border-b-0 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium group-hover:text-foreground transition-colors">
          {faq.question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-48 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed pr-8">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref: sectionRef, isVisible } = useRevealOnView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative py-20 lg:py-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Header */}
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              FAQ
            </span>
            <h2
              className={`text-3xl lg:text-4xl font-display tracking-tight mb-5 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Common questions
            </h2>
            <p 
              className={`text-muted-foreground leading-relaxed mb-8 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              Everything you need to know about working with Noon. 
              Can&apos;t find what you&apos;re looking for? Start a conversation with Maxwell.
            </p>
            <Link
              href={siteRoutes.maxwell}
              className={`inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              Ask Maxwell
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: siteTones.gateway.accent }}
              />
            </Link>
          </div>

          {/* Right: FAQ Items */}
          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

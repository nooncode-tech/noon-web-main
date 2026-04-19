import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type SiteCtaAction = {
  label: string;
  href: string;
};

type SiteCtaBlockProps = {
  title: ReactNode;
  description: ReactNode;
  primaryAction: SiteCtaAction;
  secondaryAction?: SiteCtaAction;
  accentColor?: string;
  className?: string;
};

export function SiteCtaBlock({
  title,
  description,
  primaryAction,
  secondaryAction,
  accentColor = "#6a63f2",
  className = "",
}: SiteCtaBlockProps) {
  return (
    <section
      className={`site-section-lg bg-foreground text-background relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] translate-x-1/3 -translate-y-1/3 rounded-full opacity-[0.12] blur-[80px]"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />
      <div className="site-shell text-center relative z-10">
        <h2 className="text-2xl lg:text-3xl font-display tracking-tight mb-4">
          {title}
        </h2>
        <p className="text-background/70 mb-8 max-w-md mx-auto">
          {description}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={primaryAction.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90"
          >
            {primaryAction.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center gap-2 rounded-full border border-background/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-background/10"
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

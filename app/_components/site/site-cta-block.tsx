import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SiteCtaAction = {
  label: string;
  href: string;
};

type SiteCtaBlockProps = {
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: SiteCtaAction;
  secondaryAction?: SiteCtaAction;
  accentColor?: string;
  className?: string;
  blockHref?: string;
};

export function SiteCtaBlock({
  title,
  description,
  primaryAction,
  secondaryAction,
  accentColor = "#ffffff",
  className = "",
  blockHref,
}: SiteCtaBlockProps) {
  const content = (
    <div
      className={cn(
        "relative flex min-h-[168px] items-center justify-center overflow-hidden rounded-[9px] px-6 py-10 text-center text-white sm:min-h-[176px] lg:px-12 lg:py-12",
        blockHref &&
          "block transition-transform duration-200 hover:scale-[1.005] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.998]",
      )}
      style={{ backgroundColor: "#1200c5" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] translate-x-1/3 -translate-y-1/3 rounded-full opacity-[0.12] blur-[80px]"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />
      <div className="relative z-10">
        <h2 className="site-section-title mb-4">
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "site-section-copy mx-auto max-w-md text-white/75",
              (primaryAction || secondaryAction) && "mb-8",
            )}
          >
            {description}
          </p>
        ) : null}
        {primaryAction || secondaryAction ? (
          <div className="flex flex-wrap justify-center gap-4">
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#1200c5] transition-transform hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
              >
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <section className={cn("site-section-lg relative", className)}>
      <div className="site-shell">
        {blockHref ? <Link href={blockHref}>{content}</Link> : content}
      </div>
    </section>
  );
}

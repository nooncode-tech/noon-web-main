import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteTone } from "@/lib/site-tones";

type PageCardProps = {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  href?: string;
  linkLabel?: string;
  icon?: ReactNode;
  iconPlacement?: "start" | "corner";
  alignActionBottom?: boolean;
  className?: string;
  compact?: boolean;
  tone?: Pick<SiteTone, "accent" | "border" | "shadow">;
};

export function PageCard({
  eyebrow,
  title,
  description,
  children,
  href,
  linkLabel,
  icon,
  iconPlacement = "start",
  alignActionBottom = false,
  className,
  compact = false,
  tone,
}: PageCardProps) {
  const isExternalHref = Boolean(href && (href.startsWith("mailto:") || href.startsWith("http")));
  const hasCornerIcon = Boolean(icon && iconPlacement === "corner");

  return (
    <div
      className={cn(
        "relative rounded-[10px] liquid-glass-card",
        alignActionBottom && "flex h-full flex-col",
        compact ? "p-4 lg:p-5" : "p-5 lg:p-7",
        className
      )}
      style={tone ? { borderColor: tone.border, boxShadow: `0 20px 40px -36px ${tone.shadow}` } : undefined}
    >
      {icon && iconPlacement === "start" ? <div className={compact ? "mb-3" : "mb-4"}>{icon}</div> : null}
      {hasCornerIcon ? (
        <div className={compact ? "absolute right-4 top-4 lg:right-5 lg:top-5" : "absolute right-5 top-5 lg:right-7 lg:top-7"}>
          {icon}
        </div>
      ) : null}
      {eyebrow ? (
        <p
          className={cn(
            "site-meta-label font-mono text-muted-foreground",
            compact ? "mb-1.5" : "mb-2"
          )}
          style={tone ? { color: tone.accent } : undefined}
        >
          {eyebrow}
        </p>
      ) : null}
      <div className={hasCornerIcon ? "pr-16 lg:pr-20" : undefined}>
        <h3 className={compact ? "site-card-title mb-2" : "mb-3 font-display text-lg leading-snug lg:text-xl"}>
          {title}
        </h3>
        <p className="site-card-copy text-muted-foreground">
          {description}
        </p>
      </div>
      {children && <div className={cn(compact ? "mt-4" : "mt-5", hasCornerIcon && "pr-16 lg:pr-20")}>{children}</div>}
      {href && linkLabel && (
        <div className={cn(alignActionBottom ? "mt-auto" : compact ? "mt-4" : "mt-5", alignActionBottom && (compact ? "pt-4" : "pt-5"))}>
          {isExternalHref ? (
            <a
              href={href}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-all duration-300 hover:gap-3"
              style={tone ? { color: tone.accent } : undefined}
            >
              {linkLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-all duration-300 hover:gap-3"
              style={tone ? { color: tone.accent } : undefined}
            >
              {linkLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

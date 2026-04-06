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
  className?: string;
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
  className,
  tone,
}: PageCardProps) {
  const isExternalHref = Boolean(href && (href.startsWith("mailto:") || href.startsWith("http")));

  return (
    <div
      className={cn("rounded-[10px] border border-border bg-card p-6 lg:p-8", className)}
      style={tone ? { borderColor: tone.border, boxShadow: `0 20px 40px -36px ${tone.shadow}` } : undefined}
    >
      {icon && <div className="mb-5">{icon}</div>}
      {eyebrow ? (
        <p
          className="mb-2 text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground"
          style={tone ? { color: tone.accent } : undefined}
        >
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mb-3 text-xl font-display lg:text-2xl">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground lg:text-base">{description}</p>
      {children && <div className="mt-6">{children}</div>}
      {href && linkLabel && (
        <div className="mt-6">
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

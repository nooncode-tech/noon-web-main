import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeroAction = {
  label: string;
  href: string;
  variant?: "default" | "outline";
};

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
};

export function PageHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: PageHeroProps) {
  const primaryIsExternal = Boolean(
    primaryAction && (primaryAction.href.startsWith("mailto:") || primaryAction.href.startsWith("http"))
  );
  const secondaryIsExternal = Boolean(
    secondaryAction && (secondaryAction.href.startsWith("mailto:") || secondaryAction.href.startsWith("http"))
  );

  return (
    <section className="site-hero-section relative">
      <div className="site-shell">
        <div className="max-w-4xl">
          <span className="site-meta-label mb-6 inline-flex items-center gap-3 font-mono text-muted-foreground">
            <span className="h-px w-8 bg-foreground/30" />
            {eyebrow}
          </span>
          <h1 className="site-hero-title mb-6">{title}</h1>
          <p className="site-hero-copy max-w-3xl text-muted-foreground">{description}</p>
          {(primaryAction || secondaryAction) && (
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
              {primaryAction && (
                <Button asChild size="lg" className="h-11 rounded-full px-6 text-sm">
                  {primaryIsExternal ? (
                    <a href={primaryAction.href}>
                      {primaryAction.label}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link href={primaryAction.href}>
                      {primaryAction.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  asChild
                  size="lg"
                  variant={secondaryAction.variant ?? "outline"}
                  className="h-11 rounded-full border-foreground/16 px-6 text-sm"
                >
                  {secondaryIsExternal ? (
                    <a href={secondaryAction.href}>{secondaryAction.label}</a>
                  ) : (
                    <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageSectionProps = {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function PageSection({
  id,
  eyebrow,
  title,
  description,
  className,
  children,
}: PageSectionProps) {
  return (
    <section id={id} className={cn("site-section relative", className)}>
      <div className="site-shell">
        {(eyebrow || title || description) && (
          <div className="mb-8 max-w-3xl lg:mb-10">
            {eyebrow && (
              <span className="site-meta-label mb-4 inline-flex items-center gap-3 font-mono text-muted-foreground">
                <span className="h-px w-8 bg-foreground/30" />
                {eyebrow}
              </span>
            )}
            {title && <h2 className="site-section-title mb-4">{title}</h2>}
            {description && (
              <p className="site-section-copy text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

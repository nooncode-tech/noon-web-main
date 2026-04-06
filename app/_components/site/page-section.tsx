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
          <div className="mb-10 max-w-3xl lg:mb-12">
            {eyebrow && (
              <span className="mb-5 inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
                <span className="h-px w-8 bg-foreground/30" />
                {eyebrow}
              </span>
            )}
            {title && <h2 className="mb-4 text-3xl font-display tracking-tight lg:text-4xl">{title}</h2>}
            {description && (
              <p className="text-base leading-relaxed text-muted-foreground lg:text-[17px]">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

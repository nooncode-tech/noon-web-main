import { PageHero } from "@/app/_components/site/page-hero";
import { PageSection } from "@/app/_components/site/page-section";
import { SitePageFrame } from "@/app/_components/site/site-page-frame";
import { getContactHref } from "@/lib/site-config";

export type LegalDocumentDetail = {
  label: string;
  value: string;
  href?: string;
};

export type LegalDocumentSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  summary: string;
  subtitle?: string;
  overview?: string[];
  details: LegalDocumentDetail[];
  sections: LegalDocumentSection[];
};

function toSectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return (
    <SitePageFrame>
      <PageHero
        eyebrow="Legal"
        title={document.title}
        description={
          <span className="space-y-2">
            {document.subtitle ? <span className="block">{document.subtitle}</span> : null}
            <span className="block">{document.summary}</span>
          </span>
        }
        primaryAction={{ label: "Contact Noon", href: getContactHref("legal") }}
      />

      <PageSection className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-[10px] border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-mono uppercase tracking-[0.16em] text-muted-foreground">
                Document details
              </h2>
              <dl className="space-y-4">
                {document.details.map((detail) => (
                  <div key={`${detail.label}-${detail.value}`}>
                    <dt className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">
                      {detail.label}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-foreground">
                      {detail.href ? (
                        <a className="underline-offset-4 hover:underline" href={detail.href}>
                          {detail.value}
                        </a>
                      ) : (
                        detail.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-[10px] border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-mono uppercase tracking-[0.16em] text-muted-foreground">
                On this page
              </h2>
              <nav aria-label={`${document.title} sections`}>
                <ul className="space-y-3 text-sm leading-relaxed">
                  {document.sections.map((section) => (
                    <li key={section.title}>
                      <a
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        href={`#${toSectionId(section.title)}`}
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <article className="rounded-[10px] border border-border bg-card p-6 lg:p-8">
            {document.overview?.length ? (
              <div className="mb-10 rounded-[10px] border border-border/70 bg-background p-5 lg:p-6">
                <h2 className="mb-4 text-sm font-mono uppercase tracking-[0.16em] text-muted-foreground">
                  Overview
                </h2>
                <div className="space-y-4">
                  {document.overview.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground lg:text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-10">
              {document.sections.map((section) => (
                <section id={toSectionId(section.title)} key={section.title} className="scroll-mt-32">
                  <h2 className="mb-4 text-xl font-display tracking-tight lg:text-2xl">{section.title}</h2>
                  {section.paragraphs?.length ? (
                    <div className="space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground lg:text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {section.bullets?.length ? (
                    <ul className="mt-4 space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground lg:text-base">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="list-disc">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </article>
        </div>
      </PageSection>
    </SitePageFrame>
  );
}

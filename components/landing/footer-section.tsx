"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { footerSocialLinks, siteRoutes } from "@/lib/site-config";
import { AnimatedWave } from "./animated-wave";
import { NoonLogo } from "@/components/ui/noon-logo";

const LOCALES = ["en", "es", "fr", "de"];

type FooterT = {
  tagline: string;
  rights: string;
  builtWith: string;
  groups: { Company: string; Solutions: string; Legal: string };
  links: Record<string, string>;
};

const FOOTER_T: Record<string, FooterT> = {
  en: {
    tagline: "Custom software built in real code. From idea to production-ready applications, powered by AI.",
    rights: "© 2026 Noon. All rights reserved.",
    builtWith: "Built with",
    groups: { Company: "Company", Solutions: "Solutions", Legal: "Legal" },
    links: {
      aboutNoon: "About Noon", nextProduct: "Next product", workWithNoon: "Work with Noon", contact: "Contact",
      whatWeBuild: "What we build", howItWorks: "How it works", technologyWeUse: "Technology we use", templates: "Templates",
      privacyPolicy: "Privacy Policy", termsAndConditions: "Terms and Conditions", cookiesPolicy: "Cookies Policy", legalNotice: "Legal Notice",
    },
  },
  es: {
    tagline: "Software personalizado construido en código real. De la idea a aplicaciones listas para producción, potenciadas por IA.",
    rights: "© 2026 Noon. Todos los derechos reservados.",
    builtWith: "Construido con",
    groups: { Company: "Empresa", Solutions: "Soluciones", Legal: "Legal" },
    links: {
      aboutNoon: "Acerca de Noon", nextProduct: "Próximo producto", workWithNoon: "Trabaja con Noon", contact: "Contacto",
      whatWeBuild: "Lo que construimos", howItWorks: "Cómo funciona", technologyWeUse: "Tecnología que usamos", templates: "Plantillas",
      privacyPolicy: "Política de privacidad", termsAndConditions: "Términos y condiciones", cookiesPolicy: "Política de cookies", legalNotice: "Aviso legal",
    },
  },
  fr: {
    tagline: "Logiciel personnalisé construit en vrai code. De l'idée aux applications prêtes pour la production, propulsées par l'IA.",
    rights: "© 2026 Noon. Tous droits réservés.",
    builtWith: "Construit avec",
    groups: { Company: "Entreprise", Solutions: "Solutions", Legal: "Légal" },
    links: {
      aboutNoon: "À propos de Noon", nextProduct: "Prochain produit", workWithNoon: "Travailler avec Noon", contact: "Contact",
      whatWeBuild: "Ce que nous construisons", howItWorks: "Comment ça fonctionne", technologyWeUse: "Technologies utilisées", templates: "Modèles",
      privacyPolicy: "Politique de confidentialité", termsAndConditions: "Conditions générales", cookiesPolicy: "Politique de cookies", legalNotice: "Mentions légales",
    },
  },
  de: {
    tagline: "Individuelle Software in echtem Code. Von der Idee bis zur produktionsfertigen Anwendung, unterstützt durch KI.",
    rights: "© 2026 Noon. Alle Rechte vorbehalten.",
    builtWith: "Erstellt mit",
    groups: { Company: "Unternehmen", Solutions: "Lösungen", Legal: "Rechtliches" },
    links: {
      aboutNoon: "Über Noon", nextProduct: "Nächstes Produkt", workWithNoon: "Mit Noon arbeiten", contact: "Kontakt",
      whatWeBuild: "Was wir bauen", howItWorks: "Wie es funktioniert", technologyWeUse: "Verwendete Technologien", templates: "Vorlagen",
      privacyPolicy: "Datenschutzrichtlinie", termsAndConditions: "Allgemeine Geschäftsbedingungen", cookiesPolicy: "Cookie-Richtlinie", legalNotice: "Impressum",
    },
  },
};

export function FooterSection() {
  const params = useParams();
  const pathname = usePathname();
  const paramLocale = typeof params?.locale === "string" ? params.locale : null;
  const pathLocale = LOCALES.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
  const locale = (paramLocale && LOCALES.includes(paramLocale) ? paramLocale : pathLocale) ?? "en";
  const t = FOOTER_T[locale] ?? FOOTER_T.en;

  const lp = (href: string) => {
    if (href.startsWith("http") || href.startsWith("//")) return href;
    return `/${locale}${href}`;
  };

  const footerLinkGroups = {
    [t.groups.Company]: [
      { name: t.links.aboutNoon, href: lp(siteRoutes.about) },
      { name: t.links.nextProduct, href: lp("/contact?inquiry=next-product") },
      { name: t.links.workWithNoon, href: lp("/contact?inquiry=seller") },
      { name: t.links.contact, href: lp(siteRoutes.contact) },
    ],
    [t.groups.Solutions]: [
      { name: t.links.whatWeBuild, href: lp(siteRoutes.servicesWhatWeBuild) },
      { name: t.links.howItWorks, href: lp(siteRoutes.howItWorksHref) },
      { name: t.links.technologyWeUse, href: lp(siteRoutes.aboutTechnologySection) },
      { name: t.links.templates, href: lp(siteRoutes.templates) },
    ],
    [t.groups.Legal]: [
      { name: t.links.privacyPolicy, href: siteRoutes.privacyPolicy },
      { name: t.links.termsAndConditions, href: siteRoutes.termsAndConditions },
      { name: t.links.cookiesPolicy, href: siteRoutes.cookiesPolicy },
      { name: t.links.legalNotice, href: siteRoutes.legalNotice },
    ],
  };

  return (
    <footer className="relative border-t border-foreground/10">
      <div className="absolute inset-0 h-64 overflow-hidden opacity-20 pointer-events-none">
        <AnimatedWave />
      </div>

      <div className="site-shell relative z-10">
        <div className="py-14 lg:py-20">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-6 lg:gap-8">
            <div className="col-span-2">
              <Link href={lp(siteRoutes.home)} className="mb-6 inline-flex items-center">
                <NoonLogo variant="wordmark" height={30} />
              </Link>

              <p className="mb-8 max-w-xs leading-relaxed text-muted-foreground">
                {t.tagline}
              </p>

              <div className="flex gap-6">
                {footerSocialLinks.map((link) =>
                  link.href ? (
                    <a
                      key={link.name}
                      href={link.href}
                      className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.name}
                      <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <span key={link.name} className="text-sm text-muted-foreground">
                      {link.name}
                    </span>
                  )
                )}
              </div>
            </div>

            {Object.entries(footerLinkGroups).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-6 text-sm font-medium">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      {link.href ? (
                        <Link
                          href={link.href}
                          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">{link.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Powered by bar */}
        <div className="border-t border-foreground/10 py-6">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
            <span className="text-xs text-muted-foreground/60 font-mono uppercase tracking-wider">{t.builtWith}</span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { name: "Next.js", abbr: "NX" },
                { name: "TypeScript", abbr: "TS" },
                { name: "Vercel", abbr: "VL" },
                { name: "OpenAI", abbr: "AI" },
                { name: "Supabase", abbr: "SB" },
              ].map((tech) => (
                <span
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary/50 px-2 py-1 text-[10px] font-mono text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title={tech.name}
                >
                  <span className="w-4 h-4 rounded bg-foreground/10 flex items-center justify-center text-[8px] font-bold">
                    {tech.abbr}
                  </span>
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-foreground/10 py-6 md:flex-row">
          <p className="text-sm text-muted-foreground">{t.rights}</p>
        </div>
      </div>
    </footer>
  );
}

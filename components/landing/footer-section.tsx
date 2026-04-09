"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { footerLinkGroups, footerSocialLinks, siteRoutes } from "@/lib/site-config";
import { AnimatedWave } from "./animated-wave";
import { NoonLogo } from "@/components/ui/noon-logo";

export function FooterSection() {
  return (
    <footer className="relative border-t border-foreground/10">
      <div className="absolute inset-0 h-64 overflow-hidden opacity-20 pointer-events-none">
        <AnimatedWave />
      </div>

      <div className="site-shell relative z-10">
        <div className="py-14 lg:py-20">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-6 lg:gap-8">
            <div className="col-span-2">
              <Link href={siteRoutes.home} className="mb-6 inline-flex items-center gap-2.5">
                <NoonLogo variant="icon" className="h-8 w-8 text-primary" />
                <span className="font-display text-2xl text-primary tracking-tight">Noon</span>
              </Link>

              <p className="mb-8 max-w-xs leading-relaxed text-muted-foreground">
                Custom software built in real code. From idea to production-ready applications, powered by AI.
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
            <span className="text-xs text-muted-foreground/60 font-mono uppercase tracking-wider">Built with</span>
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
          <p className="text-sm text-muted-foreground">{"\u00A9"} 2026 Noon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

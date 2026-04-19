import type { Page } from "@playwright/test";

export const ROUTES = [
  { path: "", name: "home" },
  { path: "/about", name: "about" },
  { path: "/services", name: "services" },
  { path: "/templates", name: "templates" },
  { path: "/templates/client-portal-saas", name: "template-detail" },
  { path: "/contact", name: "contact" },
  { path: "/legal", name: "legal" },
  { path: "/signin", name: "signin" },
  { path: "/upgrade", name: "upgrade" },
] as const;

export const LOCALES = ["en", "es"] as const;
export const THEMES = ["light", "dark"] as const;
export const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

export async function settlePage(page: Page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (scrollHeight * i) / steps);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.evaluate(() => document.fonts.ready);

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });

  await page.waitForTimeout(500);
}

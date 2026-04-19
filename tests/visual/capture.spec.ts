import { test } from "@playwright/test";
import path from "node:path";
import { LOCALES, ROUTES, THEMES, VIEWPORTS, settlePage } from "./routes";

const VISUAL_DIR = process.env.VISUAL_DIR ?? "baseline";

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  await context.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {}
  });
});

for (const route of ROUTES) {
  for (const locale of LOCALES) {
    for (const theme of THEMES) {
      for (const viewport of VIEWPORTS) {
        const label = `${route.name}-${locale}-${theme}-${viewport.name}`;
        test(label, async ({ page }) => {
          test.setTimeout(60_000);
          await page.emulateMedia({ colorScheme: theme });
          await page.setViewportSize({ width: viewport.width, height: viewport.height });

          const url = `/${locale}${route.path}`;
          await page.goto(url, { waitUntil: "networkidle" });
          await settlePage(page);

          const file = path.join("tests", "visual", VISUAL_DIR, `${label}.png`);
          await page.screenshot({ path: file, fullPage: true });
        });
      }
    }
  }
}

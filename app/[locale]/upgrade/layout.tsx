import type { ReactNode } from "react";
import { UpgradeLayoutChrome } from "@/components/upgrade/upgrade-layout-chrome";

/**
 * /upgrade uses the site navigation but no footer.
 * The flow should feel like a focused product workspace.
 */
export default function UpgradeLayout({ children }: { children: ReactNode }) {
  return <UpgradeLayoutChrome>{children}</UpgradeLayoutChrome>;
}

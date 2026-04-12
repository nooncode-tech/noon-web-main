import type { ReactNode } from "react";
import { Navigation } from "@/components/landing/navigation";

/**
 * /upgrade layout — uses the site navigation but no footer.
 * Clean, focused layout for the audit flow.
 */
export default function UpgradeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-28 lg:pt-32 pb-16">{children}</main>
    </div>
  );
}

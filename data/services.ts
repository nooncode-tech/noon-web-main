import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Globe,
  Smartphone,
  Wrench,
  RefreshCw,
  LayoutDashboard,
  Rocket,
  Puzzle,
} from "lucide-react";
import { siteRoutes } from "@/lib/site-config";

// Build Categories (from What We Build)
export type BuildCategory = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  examples: readonly string[];
  useWhen: string;
  notIdealWhen: string;
  outcomes: readonly string[];
};

export const buildCategories: readonly BuildCategory[] = [
  {
    slug: "ai-and-automation",
    title: "AI & Automation",
    icon: Bot,
    description:
      "Intelligent assistants, workflow automation, and AI-powered tooling for teams that need speed without losing operational control.",
    examples: ["AI assistants", "Automated workflows", "Smart integrations", "Internal copilots"],
    useWhen:
      "The core value depends on AI-assisted decisions, workflow acceleration, or automation layers that need to live inside real operations rather than as isolated demos.",
    notIdealWhen:
      "AI is only a decorative add-on, the process itself is still undefined, or the team has not decided whether automation should exist in the workflow at all.",
    outcomes: ["Operational assistants", "Routing and triage layers", "Automation around repeatable processes"],
  },
  {
    slug: "web-solutions",
    title: "Web Solutions",
    icon: Globe,
    description:
      "From customer-facing experiences to internal platforms, built as real software with production-grade frontend and backend architecture.",
    examples: ["Web platforms", "Dashboards", "Portals", "E-commerce"],
    useWhen:
      "The software needs to live in the browser, support multiple roles, and behave like a maintainable product or operational system rather than a temporary marketing build.",
    notIdealWhen:
      "The real product depends on native device behavior, strong offline usage, or mobile-first operational constraints that should not be collapsed into a web shell.",
    outcomes: ["Customer-facing products", "Operational dashboards", "Portals and system interfaces"],
  },
  {
    slug: "mobile-solutions",
    title: "Mobile Solutions",
    icon: Smartphone,
    description:
      "Native and cross-platform mobile applications focused on clear flows, operational reliability, and long-term maintainability.",
    examples: ["iOS apps", "Android apps", "Cross-platform apps", "Field operations apps"],
    useWhen:
      "The main user experience depends on mobile context, field work, device-native behavior, or workflows that break if they are treated like web-first software.",
    notIdealWhen:
      "Mobile is only a secondary access channel and the real complexity lives in back-office systems, approvals, or browser-based operations.",
    outcomes: ["Field apps", "Mobile-first products", "Operator mobile tools"],
  },
  {
    slug: "custom-software",
    title: "Custom Software",
    icon: Wrench,
    description:
      "Software shaped around your internal logic, operational edge cases, and non-standard workflows when generic systems stop being useful.",
    examples: ["Internal tools", "Custom integrations", "Business systems", "Process orchestration"],
    useWhen:
      "The software needs to conform to specific business logic, exceptions, and non-standard workflows that generic products force the team to work around.",
    notIdealWhen:
      "The need is mostly a standard product category that already maps cleanly to AI, web, or mobile without a heavy custom logic layer.",
    outcomes: ["Internal business systems", "Workflow orchestration", "Purpose-built software around non-standard logic"],
  },
] as const;

// Solution Paths (from Solutions)
export type SolutionPath = {
  slug: string;
  icon: LucideIcon;
  problem: string;
  summary: string;
  fit: readonly string[];
  signals: readonly string[];
  outputs: readonly string[];
  bestWhen: string;
  notIdealWhen: string;
};

export const solutionPaths: readonly SolutionPath[] = [
  {
    slug: "automation",
    icon: RefreshCw,
    problem: "Manual work that should be automated",
    summary:
      "AI-assisted workflows, routing layers, and custom automations for teams losing time to repetitive work, brittle handoffs, and human bottlenecks.",
    fit: ["Ops handoffs", "Internal approvals", "AI-assisted routing"],
    signals: [
      "People are copying data between tools, inboxes, or spreadsheets.",
      "Progress depends on one operator manually pushing work forward.",
      "The team spends more time checking status than executing the work itself.",
    ],
    outputs: [
      "AI-assisted workflow tools",
      "Approval and routing systems",
      "Internal automation layers with auditability",
    ],
    bestWhen:
      "The operational pain is clear, but the right answer could be automation, integrations, or a small custom system rather than a full product build.",
    notIdealWhen: "You mainly need a marketing site, brand refresh, or a no-code-style brochure experience.",
  },
  {
    slug: "operations",
    icon: LayoutDashboard,
    problem: "Operations that need one central system",
    summary:
      "Dashboards, portals, and internal command centers that consolidate data, workflows, approvals, and reporting into one operational surface.",
    fit: ["Ops dashboards", "Admin portals", "Cross-team control centers"],
    signals: [
      "Core data lives across disconnected tools with no clear source of truth.",
      "Different teams operate on different process versions or status views.",
      "Reporting, approvals, or customer operations break when one tool changes.",
    ],
    outputs: [
      "Operational control centers",
      "Admin and back-office platforms",
      "Unified reporting and workflow ownership systems",
    ],
    bestWhen:
      "The business already knows the process needs to exist inside one system, but the exact scope, user roles, or architecture still need to be shaped.",
    notIdealWhen: "You already know the answer is a customer-facing product and you need a launch path more than an internal system.",
  },
  {
    slug: "product-launch",
    icon: Rocket,
    problem: "A product that needs to launch as real software",
    summary:
      "Production-minded builds for founders and operators who understand the problem and need something real, maintainable, and ready to evolve.",
    fit: ["SaaS products", "Booking platforms", "Marketplaces"],
    signals: [
      "The customer problem is already validated and the bottleneck is execution.",
      "A polished prototype or theme is no longer sufficient for the next stage.",
      "You need a clear codebase, architecture, and delivery path.",
    ],
    outputs: [
      "Production-ready MVPs",
      "Client-facing web products",
      "Launch plans with a maintainable software foundation",
    ],
    bestWhen:
      "The market need is real and the next step is a code-first build, not further positioning work or template shopping.",
    notIdealWhen: "You are still searching for the category, the business model, or whether the problem is worth solving at all.",
  },
  {
    slug: "custom-logic",
    icon: Puzzle,
    problem: "Workflows that generic tools don't fit",
    summary:
      "Custom software built around business logic that breaks inside generic tools, rigid SaaS products, or patchwork workarounds.",
    fit: ["Custom back-office tools", "Business logic systems", "Specialized workflows"],
    signals: [
      "The business relies on workarounds, exceptions, or side channels to make software usable.",
      "Off-the-shelf tools force the team to adapt to the software instead of the reverse.",
      "The core logic is specific enough that templates or plug-ins stop being trustworthy.",
    ],
    outputs: [
      "Purpose-built internal software",
      "Workflow systems tailored to business rules",
      "Specialized tooling around non-standard processes",
    ],
    bestWhen:
      "You know the process is too specific for generic SaaS, but you need help defining what the custom system should actually include first.",
    notIdealWhen: "You are mainly evaluating vendors, experimenting with light tooling, or trying to avoid any real software investment.",
  },
] as const;

// Process Steps
export const processSteps = [
  {
    step: "01",
    title: "Clarify the actual constraint",
    description:
      "We start by isolating the business problem, the operators involved, and the bottleneck that justifies software work in the first place.",
  },
  {
    step: "02",
    title: "Translate the problem into a software path",
    description:
      "The outcome may be a workflow system, an internal platform, a customer-facing product, or a narrower custom architecture. This is where the shape gets chosen.",
  },
  {
    step: "03",
    title: "Move into scoped delivery",
    description:
      "Once the right path is clear, Noon turns that into proposal, build scope, and a delivery plan that can actually move forward.",
  },
] as const;

// Next Steps
export const servicesNextSteps = [
  {
    title: "Review the service structure",
    description: "Compare Custom Development, Upgrade, Engineering Support, and Audit before choosing a path.",
    href: siteRoutes.services,
    linkLabel: "View services",
  },
  {
    title: "Upgrade an existing website",
    description: "Use the Upgrade path when something live needs a clearer, stronger version.",
    href: siteRoutes.upgrade,
    linkLabel: "Open Upgrade",
  },
  {
    title: "Start a conversation",
    description: "Use Maxwell to describe your project and get an initial scope assessment.",
    href: siteRoutes.maxwellStudio,
    linkLabel: "Open Maxwell",
  },
  {
    title: "Get in touch directly",
    description: "Reach out to discuss your project with the Noon team.",
    href: siteRoutes.contact,
    linkLabel: "Contact us",
  },
] as const;

import { describe, it, expect } from "vitest";
import {
  resolveProjectCategory,
  resolveComplexityTier,
  formatPriceRange,
  validateProposalDraft,
  buildProposalContext,
  PRICING_TABLE,
} from "@/lib/maxwell/proposal-rules";
import type { StudioSession, StudioVersion } from "@/lib/maxwell/repositories";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<StudioSession> = {}): StudioSession {
  return {
    id: "sess-1",
    initialPrompt: "Build a booking platform for yoga studios",
    status: "approved_for_proposal",
    projectType: null,
    goalSummary: "Yoga studio booking system",
    complexityHint: null,
    language: "en",
    correctionsUsed: 1,
    maxCorrections: 2,
    proposalRequestedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeVersion(n: number, source: "initial" | "correction" = "initial"): StudioVersion {
  return {
    id: `ver-${n}`,
    studioSessionId: "sess-1",
    versionNumber: n,
    previewUrl: `https://v0.dev/chat/abc${n}`,
    v0ChatId: `chat-${n}`,
    changeSummary: source === "correction" ? `Change #${n}` : null,
    source,
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// resolveProjectCategory
// ============================================================================

describe("resolveProjectCategory", () => {
  it("returns custom_software for null", () => {
    expect(resolveProjectCategory(null)).toBe("custom_software");
  });

  it("resolves web hints", () => {
    expect(resolveProjectCategory("web app")).toBe("web_solutions");
    expect(resolveProjectCategory("landing page")).toBe("web_solutions");
    expect(resolveProjectCategory("SaaS dashboard")).toBe("web_solutions");
    expect(resolveProjectCategory("portal")).toBe("web_solutions");
  });

  it("resolves ai/automation hints", () => {
    expect(resolveProjectCategory("AI assistant")).toBe("ai_automation");
    expect(resolveProjectCategory("chatbot automation")).toBe("ai_automation");
    expect(resolveProjectCategory("LLM integration")).toBe("ai_automation");
    expect(resolveProjectCategory("machine learning pipeline")).toBe("ai_automation");
  });

  it("resolves mobile hints", () => {
    expect(resolveProjectCategory("mobile app")).toBe("mobile_solutions");
    expect(resolveProjectCategory("iOS app")).toBe("mobile_solutions");
    expect(resolveProjectCategory("app móvil")).toBe("mobile_solutions");
  });

  it("falls back to custom_software for unrecognized hints", () => {
    expect(resolveProjectCategory("ERP system")).toBe("custom_software");
    expect(resolveProjectCategory("custom platform")).toBe("custom_software");
  });
});

// ============================================================================
// resolveComplexityTier
// ============================================================================

describe("resolveComplexityTier", () => {
  it("returns medio for null hint", () => {
    expect(resolveComplexityTier(null)).toBe("medio");
  });

  it("returns bajo for simple/mvp hints", () => {
    expect(resolveComplexityTier("simple")).toBe("bajo");
    expect(resolveComplexityTier("mvp project")).toBe("bajo");
    expect(resolveComplexityTier("basic")).toBe("bajo");
  });

  it("returns alto for complex/enterprise hints", () => {
    expect(resolveComplexityTier("complex system")).toBe("alto");
    expect(resolveComplexityTier("enterprise system")).toBe("alto");
    expect(resolveComplexityTier("high complexity")).toBe("alto");
    expect(resolveComplexityTier("alto")).toBe("alto");
  });

  it("returns medio for unrecognized hints", () => {
    expect(resolveComplexityTier("some project")).toBe("medio");
  });
});

// ============================================================================
// formatPriceRange
// ============================================================================

describe("formatPriceRange", () => {
  it("returns USD-formatted strings", () => {
    const result = formatPriceRange("web_solutions", "medio");
    expect(result.singleRange).toMatch(/\$.*USD/);
    expect(result.activationFee).toMatch(/\$.*USD/);
    expect(result.monthlyRange).toMatch(/\$.*USD\/month/);
  });

  it("bajo tier is cheaper than alto in every category", () => {
    const categories = ["web_solutions", "ai_automation", "mobile_solutions", "custom_software"] as const;
    for (const cat of categories) {
      const bajo = PRICING_TABLE[cat].bajo;
      const alto = PRICING_TABLE[cat].alto;
      expect(bajo.single[0]).toBeLessThan(alto.single[0]);
      expect(bajo.monthly[0]).toBeLessThan(alto.monthly[0]);
      expect(bajo.activation).toBeLessThan(alto.activation);
    }
  });

  it("all cells have activation fee and monthly range", () => {
    const categories = ["web_solutions", "ai_automation", "mobile_solutions", "custom_software"] as const;
    const tiers = ["bajo", "medio", "alto"] as const;
    for (const cat of categories) {
      for (const tier of tiers) {
        const result = formatPriceRange(cat, tier);
        expect(result.activationFee).toBeTruthy();
        expect(result.monthlyRange).toBeTruthy();
        expect(result.singleRange).toBeTruthy();
      }
    }
  });
});

// ============================================================================
// validateProposalDraft
// ============================================================================

describe("validateProposalDraft", () => {
  it("returns no warnings for a clean draft", () => {
    const clean = `
## Project Proposal — Yoga Studio Platform

**Executive Summary**
We will build a booking platform for yoga studios.

**Investment**
- Single payment: $8,000 – $12,000 USD
- Membership: Activation fee $2,500 USD + $700 USD/month
    `;
    expect(validateProposalDraft(clean)).toHaveLength(0);
  });

  it("flags discount percentage", () => {
    const draft = "If you pay upfront you get 10% off the total.";
    const warnings = validateProposalDraft(draft);
    expect(warnings.some((w) => w.includes("Discount percentage"))).toBe(true);
  });

  it("flags phase-based payment (English)", () => {
    const draft = "Phase 1 payment: $3,000. Phase 2 payment: $3,000.";
    const warnings = validateProposalDraft(draft);
    expect(warnings.some((w) => w.includes("Phase-based payment"))).toBe(true);
  });

  it("flags pago por fases (Spanish)", () => {
    const draft = "Ofrecemos pago por fases adaptado a tu presupuesto.";
    const warnings = validateProposalDraft(draft);
    expect(warnings.some((w) => w.includes("fases"))).toBe(true);
  });

  it("flags installment plans", () => {
    const draft = "We offer installments to make the project more accessible.";
    const warnings = validateProposalDraft(draft);
    expect(warnings.some((w) => w.includes("Installment"))).toBe(true);
  });

  it("flags technical delivery before payment", () => {
    const draft = "You will receive repository access upon signing.";
    const warnings = validateProposalDraft(draft);
    expect(warnings.some((w) => w.includes("Technical delivery"))).toBe(true);
  });

  it("flags multiple issues in a single draft", () => {
    const draft = `
      You get 15% discount for full payment.
      Phase 1 payment covers the design phase.
      Repository access provided after signing.
    `;
    const warnings = validateProposalDraft(draft);
    expect(warnings.length).toBeGreaterThanOrEqual(3);
  });
});

// ============================================================================
// buildProposalContext
// ============================================================================

describe("buildProposalContext", () => {
  it("includes session metadata", () => {
    const session = makeSession();
    const context = buildProposalContext(session, [], []);
    expect(context).toContain(session.initialPrompt);
    expect(context).toContain(session.goalSummary!);
    expect(context).toContain("Corrections used: 1");
  });

  it("includes resolved category and tier", () => {
    const context = buildProposalContext(
      makeSession({ projectType: "web app", complexityHint: "simple" }),
      [],
      []
    );
    expect(context).toContain("Web Solutions");
    expect(context).toContain("Bajo");
  });

  it("includes version history when versions are present", () => {
    const versions = [makeVersion(1), makeVersion(2, "correction")];
    const context = buildProposalContext(makeSession(), [], versions);
    expect(context).toContain("Version 1");
    expect(context).toContain("Version 2");
    expect(context).toContain("Change #2");
  });

  it("includes conversation messages", () => {
    const messages = [
      { role: "user" as const, content: "I want a booking platform" },
      { role: "assistant" as const, content: "Who are the primary users?" },
    ];
    const context = buildProposalContext(makeSession(), messages, []);
    expect(context).toContain("I want a booking platform");
    expect(context).toContain("Who are the primary users?");
  });

  it("includes price range guidance", () => {
    const context = buildProposalContext(makeSession({ complexityHint: "simple" }), [], []);
    expect(context).toContain("Single payment range");
    expect(context).toContain("Membership activation fee");
    expect(context).toContain("Do NOT add a discount for single payment");
    expect(context).toContain("Do NOT present flexible payment as a primary option");
  });

  it("instructs writing in Spanish when language is es", () => {
    const context = buildProposalContext(makeSession({ language: "es" }), [], []);
    expect(context).toContain("Spanish");
  });

  it("instructs writing in English when language is en", () => {
    const context = buildProposalContext(makeSession({ language: "en" }), [], []);
    expect(context).toContain("English");
  });
});

/**
 * lib/maxwell/proposal-rules.ts
 *
 * Reglas comerciales vigentes de Noon para propuestas generadas por Maxwell.
 * Esta es la fuente de verdad — el prompt de propuesta las refleja y esta capa
 * las valida programáticamente.
 *
 * DECISIONES CERRADAS (no discutir con el AI):
 * - Pago único y Membresía son las dos modalidades principales.
 * - Pago flexible es secundario — solo si la complejidad lo justifica.
 * - Sin descuento por pago completo como regla por defecto.
 * - Sin pagos por fases como opción principal.
 * - Toda propuesta pasa por revisión humana antes de llegar al cliente.
 * - No se activa workspace sin pago confirmado.
 */

import type { StudioSession, StudioMessage, StudioVersion } from "./repositories";

// ============================================================================
// Modalidades de pago
// ============================================================================

export const PAYMENT_MODALITIES = {
  /** Modalidad principal 1: pago único, proyecto cerrado. */
  SINGLE_PAYMENT: "single_payment",
  /** Modalidad principal 2: fee de activación + mensualidad. */
  MEMBERSHIP: "membership",
  /** Modalidad secundaria: pago flexible, solo por complejidad excepcional. */
  FLEXIBLE: "flexible",
} as const;

export type PaymentModality = (typeof PAYMENT_MODALITIES)[keyof typeof PAYMENT_MODALITIES];

// ============================================================================
// Categorías de proyecto
// ============================================================================

export const PROJECT_CATEGORIES = {
  web_solutions: "Web Solutions",
  ai_automation: "IA & Automation",
  mobile_solutions: "Mobile Solutions",
  custom_software: "Custom Software",
} as const;

export type ProjectCategory = keyof typeof PROJECT_CATEGORIES;

// ============================================================================
// Tiers de complejidad
// ============================================================================

export const COMPLEXITY_TIERS = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
} as const;

export type ComplexityTier = keyof typeof COMPLEXITY_TIERS;

// ============================================================================
// Tabla de precios oficial — 4 categorías × 3 tiers
// ============================================================================
// ⚠️  PLACEHOLDER — reemplazar con los precios oficiales de Noon antes del lanzamiento.
// Estructura: single [min, max], activation fijo, monthly [min, max] — todo en USD.

export const PRICING_TABLE: Record<
  ProjectCategory,
  Record<
    ComplexityTier,
    { single: [number, number]; activation: number; monthly: [number, number] }
  >
> = {
  web_solutions: {
    //           single            activation  monthly
    bajo:  { single: [2500,  5000], activation: 1200, monthly: [ 300,  500] },
    medio: { single: [5000, 10000], activation: 2000, monthly: [ 500,  900] },
    alto:  { single: [10000, 20000], activation: 3500, monthly: [ 900, 1500] },
  },
  ai_automation: {
    bajo:  { single: [3000,  6000], activation: 1500, monthly: [ 400,  700] },
    medio: { single: [6000, 14000], activation: 2500, monthly: [ 700, 1200] },
    alto:  { single: [14000, 30000], activation: 4500, monthly: [1200, 2500] },
  },
  mobile_solutions: {
    bajo:  { single: [4000,  8000], activation: 2000, monthly: [ 500,  800] },
    medio: { single: [8000, 18000], activation: 3000, monthly: [ 800, 1400] },
    alto:  { single: [18000, 40000], activation: 5000, monthly: [1400, 3000] },
  },
  custom_software: {
    bajo:  { single: [5000, 10000], activation: 2500, monthly: [  600, 1000] },
    medio: { single: [10000, 25000], activation: 4000, monthly: [1000, 2000] },
    alto:  { single: [25000, 60000], activation: 6000, monthly: [2000, 4500] },
  },
};

// ============================================================================
// Resolvers — categoría y tier desde hints de la sesión
// ============================================================================

/**
 * Mapea project_type de la sesión a una ProjectCategory.
 * Fallback: "custom_software".
 */
export function resolveProjectCategory(hint: string | null): ProjectCategory {
  if (!hint) return "custom_software";
  const h = hint.toLowerCase();
  if (
    h.includes("web") || h.includes("landing") || h.includes("sitio") ||
    h.includes("portal") || h.includes("dashboard") || h.includes("saas")
  ) return "web_solutions";
  if (
    h.includes("ia") || h.includes("ai") || h.includes("auto") ||
    h.includes("bot") || h.includes("machine") || h.includes("intelig") ||
    h.includes("chat") || h.includes("llm")
  ) return "ai_automation";
  if (
    h.includes("mobile") || h.includes("móvil") || h.includes("ios") ||
    h.includes("android") || h.includes("app móvil") || h.includes("app movil")
  ) return "mobile_solutions";
  return "custom_software";
}

/**
 * Mapea complexity_hint de la sesión a un ComplexityTier.
 * Fallback: "medio".
 */
export function resolveComplexityTier(hint: string | null): ComplexityTier {
  if (!hint) return "medio";
  const h = hint.toLowerCase();
  if (
    h.includes("alto") || h.includes("high") || h.includes("complex") ||
    h.includes("enterprise") || h.includes("platform")
  ) return "alto";
  if (
    h.includes("bajo") || h.includes("low") || h.includes("simple") ||
    h.includes("basic") || h.includes("mvp")
  ) return "bajo";
  return "medio";
}

/**
 * Devuelve los rangos de precio formateados en USD para el prompt.
 */
export function formatPriceRange(
  category: ProjectCategory,
  tier: ComplexityTier
): { singleRange: string; activationFee: string; monthlyRange: string } {
  const r = PRICING_TABLE[category][tier];
  return {
    singleRange:   `$${r.single[0].toLocaleString()} – $${r.single[1].toLocaleString()} USD`,
    activationFee: `$${r.activation.toLocaleString()} USD`,
    monthlyRange:  `$${r.monthly[0].toLocaleString()} – $${r.monthly[1].toLocaleString()} USD/month`,
  };
}

// ============================================================================
// Validación de propuesta generada
// ============================================================================

export const PROPOSAL_FORBIDDEN_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\b(\d+)\s*%\s*(off|discount|descuento)\b/i,
    reason: "Discount percentage — no default discounts allowed",
  },
  {
    pattern: /\bphase[\s-]?(1|2|3|one|two|three)\s+payment\b/i,
    reason: "Phase-based payment as primary option",
  },
  {
    pattern: /\bpago\s+por\s+fase(s)?\b/i,
    reason: "Pago por fases como opción principal",
  },
  {
    pattern: /\binstallment(s)?\b/i,
    reason: "Installment plan mentioned as primary option",
  },
  {
    pattern: /\b(repository|repo|github|gitlab|código)\s+(access|acceso|delivery|entrega)\b/i,
    reason: "Technical delivery implied before payment",
  },
];

/**
 * Valida un draft de propuesta contra las reglas comerciales.
 * Devuelve warnings para el revisor PM — no se muestran al cliente.
 */
export function validateProposalDraft(content: string): string[] {
  return PROPOSAL_FORBIDDEN_PATTERNS
    .filter(({ pattern }) => pattern.test(content))
    .map(({ reason }) => `[REVIEW FLAG] ${reason}`);
}

// ============================================================================
// Construcción de contexto rico para el prompt de propuesta
// ============================================================================

/**
 * Construye el bloque de contexto estructurado que se pasa a OpenAI
 * al generar una propuesta. Reemplaza el dump plano de mensajes.
 */
export function buildProposalContext(
  session: StudioSession,
  messages: { role: "user" | "assistant"; content: string }[],
  versions: StudioVersion[]
): string {
  const category = resolveProjectCategory(session.projectType);
  const tier = resolveComplexityTier(session.complexityHint);
  const pricing = formatPriceRange(category, tier);

  const lines: string[] = [];

  // ── Metadata de sesión ────────────────────────────────────────────────────

  lines.push("## Session context");
  lines.push(`- Initial request: "${session.initialPrompt}"`);
  if (session.goalSummary)    lines.push(`- Goal summary (extracted by Maxwell): ${session.goalSummary}`);
  if (session.projectType)    lines.push(`- Project type: ${session.projectType}`);
  if (session.complexityHint) lines.push(`- Complexity hint: ${session.complexityHint}`);
  lines.push(`- Category resolved: ${PROJECT_CATEGORIES[category]}`);
  lines.push(`- Tier resolved: ${COMPLEXITY_TIERS[tier]}`);
  lines.push(`- Language used in conversation: ${session.language}`);
  lines.push(`- Prototype versions generated: ${versions.length}`);
  lines.push(`- Corrections used: ${session.correctionsUsed} of ${session.maxCorrections}`);
  lines.push("");

  // ── Historial de versiones ────────────────────────────────────────────────

  if (versions.length > 0) {
    lines.push("## Prototype iteration history");
    for (const v of versions) {
      const label = v.source === "initial" ? "Initial prototype" : `Correction (v${v.versionNumber})`;
      lines.push(
        v.changeSummary
          ? `- Version ${v.versionNumber} [${label}]: ${v.changeSummary}`
          : `- Version ${v.versionNumber} [${label}]`
      );
    }
    lines.push("");
  }

  // ── Conversación ──────────────────────────────────────────────────────────

  lines.push("## Full conversation");
  for (const m of messages) {
    lines.push(`**${m.role === "user" ? "Client" : "Maxwell"}:** ${m.content}`);
  }
  lines.push("");

  // ── Guía de precios ───────────────────────────────────────────────────────

  lines.push("## Investment guidance for this proposal");
  lines.push(`Category: ${PROJECT_CATEGORIES[category]} | Tier: ${COMPLEXITY_TIERS[tier]}`);
  lines.push(`- Single payment range: ${pricing.singleRange}`);
  lines.push(`- Membership activation fee: ${pricing.activationFee}`);
  lines.push(`- Membership monthly range: ${pricing.monthlyRange}`);
  lines.push(
    "Use these ranges as the basis for the Investment section. " +
    "The PM will adjust exact figures during review. " +
    "Do NOT invent ranges outside these. " +
    "Do NOT add a discount for single payment. " +
    "Do NOT present flexible payment as a primary option."
  );
  lines.push("");

  // ── Instrucción de generación ─────────────────────────────────────────────

  lines.push("## Your task");
  lines.push(
    "Generate the full formal proposal following the structure defined in your system prompt. " +
    "Use the conversation above to extract scope, deliverables, and exclusions. " +
    "Use the pricing guidance above for the Investment section. " +
    `Write the proposal in ${session.language === "es" ? "Spanish" : "English"} unless the conversation clearly used a different language.`
  );

  return lines.join("\n");
}

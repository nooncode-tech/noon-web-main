/**
 * lib/maxwell/proposal-rules.ts
 *
 * Reglas comerciales vigentes de Noon para propuestas generadas por Maxwell.
 * Esta es la fuente de verdad — el prompt de propuesta las refleja y esta capa
 * las valida programáticamente.
 *
 * DECISIONES CERRADAS (no reabrir):
 * - Pago único y Membresía son las dos modalidades principales visibles.
 * - Toda propuesta pasa por revisión humana antes de llegar al cliente.
 * - No se activa workspace sin pago confirmado.
 * - "Payment under verification" no activa el proyecto.
 * - Cambios sobre propuesta enviada crean nueva versión; no se edita encima.
 * - Vigencia de la propuesta: 15 días desde la primera apertura real del enlace.
 * - Precio exacto en la propuesta; no usar rangos tipo "desde".
 * - Membresía incluye: hosting, base de datos básica, soporte, actualizaciones
 *   menores y avance gradual del proyecto.
 */

import type { StudioSession, StudioMessage, StudioVersion } from "./repositories";

// ============================================================================
// Modalidades de pago
// ============================================================================

export const PAYMENT_MODALITIES = {
  /** Modalidad principal 1: pago único de activación. */
  SINGLE_PAYMENT: "single_payment",
  /** Modalidad principal 2: fee de activación + mensualidad. */
  MEMBERSHIP: "membership",
} as const;

export type PaymentModality = (typeof PAYMENT_MODALITIES)[keyof typeof PAYMENT_MODALITIES];

// ============================================================================
// Categorías de proyecto
// ============================================================================

export const PROJECT_CATEGORIES = {
  web_landing:        "Web básica / Landing / Corporate",
  ecommerce:          "E-commerce",
  webapp_system:      "Web App / Sistema",
  mobile:             "Mobile",
  saas_ai_automation: "SaaS / AI / Automation",
} as const;

export type ProjectCategory = keyof typeof PROJECT_CATEGORIES;

// ============================================================================
// Tiers de complejidad
// ============================================================================

export const COMPLEXITY_TIERS = {
  bajo:  "Bajo",
  medio: "Medio",
  alto:  "Alto",
} as const;

export type ComplexityTier = keyof typeof COMPLEXITY_TIERS;

// ============================================================================
// Tabla de precios oficial — 5 categorías × 3 tiers
// Precios exactos en USD. No usar rangos.
//
// activation → fee único para arrancar el proyecto (pago único O activación de membresía)
// monthly    → cuota mensual de membresía (aplica solo en modalidad Membresía)
// ============================================================================

export const PRICING_TABLE: Record<
  ProjectCategory,
  Record<ComplexityTier, { activation: number; monthly: number }>
> = {
  web_landing: {
    //                 activation  monthly
    bajo:  { activation:  49, monthly:  25 },
    medio: { activation:  79, monthly:  32 },
    alto:  { activation: 129, monthly:  49 },
  },
  ecommerce: {
    bajo:  { activation:  79, monthly:  39 },
    medio: { activation: 129, monthly:  55 },
    alto:  { activation: 199, monthly:  79 },
  },
  webapp_system: {
    bajo:  { activation:  99, monthly:  49 },
    medio: { activation: 179, monthly:  69 },
    alto:  { activation: 279, monthly: 109 },
  },
  mobile: {
    bajo:  { activation: 129, monthly:  49 },
    medio: { activation: 199, monthly:  69 },
    alto:  { activation: 299, monthly: 109 },
  },
  saas_ai_automation: {
    bajo:  { activation: 129, monthly:  69 },
    medio: { activation: 229, monthly:  99 },
    alto:  { activation: 349, monthly: 149 },
  },
};

// ============================================================================
// Casos donde NO se ofrece Membresía automáticamente
// ============================================================================

/** Términos que indican un proyecto donde la membresía no aplica por defecto. */
const MEMBERSHIP_EXCLUDED_PATTERNS: RegExp[] = [
  /\bmarketplace\b/i,
  /\bmulti[\s-]?vendor\b/i,
  /\blegacy\b/i,
  /\boffline[\s-]?sync\b/i,
  /\boffline\b.*\bsync\b/i,
  /\bHIPAA\b/i,
  /\bGDPR\b.*\bregulat/i,
  /\bregulat.*\bcomplian/i,
  /\bcomplian.*\bregulat/i,
  /\bmigraci[oó]n\s+(masiva|pesada|de\s+datos)\b/i,
  /\bdata\s+migration\b/i,
  /\bheavy\s+migration\b/i,
  /\bblockchain\b/i,
  /\bcrypto\b/i,
  /\bweb3\b/i,
  /\bsmart\s+contract\b/i,
  /\bgame\s+dev/i,
  /\bgaming\b/i,
  /\bjuego\b/i,
];

/**
 * Devuelve true si el proyecto indica un caso donde la Membresía
 * NO debe ofrecerse automáticamente.
 */
export function isMembershipContraindicated(text: string | null): boolean {
  if (!text) return false;
  return MEMBERSHIP_EXCLUDED_PATTERNS.some((re) => re.test(text));
}

// ============================================================================
// Resolvers — categoría y tier desde hints de la sesión
// ============================================================================

/**
 * Mapea project_type / goal_summary de la sesión a una ProjectCategory.
 * Fallback: "webapp_system".
 */
export function resolveProjectCategory(hint: string | null): ProjectCategory {
  if (!hint) return "webapp_system";
  const h = hint.toLowerCase();

  // Mobile — máxima prioridad para evitar confusión con web
  if (
    h.includes("mobile") || h.includes("móvil") || h.includes("movil") ||
    h.includes("ios") || h.includes("android") || h.includes("app móvil") ||
    h.includes("app movil")
  ) return "mobile";

  // SaaS / AI / Automation
  if (
    /\b(ai|ia|saas|llm|nlp|chatbot|gpt|bot)\b/i.test(hint) ||
    h.includes("intelig") || h.includes("automat") || h.includes("machine learn")
  ) return "saas_ai_automation";

  // E-commerce
  if (
    h.includes("ecommerce") || h.includes("e-commerce") || h.includes("tienda") ||
    h.includes("shop") || h.includes("store") || h.includes("ventas online") ||
    h.includes("carrito") || h.includes("checkout") || h.includes("marketplace")
  ) return "ecommerce";

  // Web básica / Landing — solo si es realmente simple
  if (
    (h.includes("landing") || h.includes("corporate") || h.includes("brochure") ||
     h.includes("portafolio") || h.includes("portfolio") || h.includes("blog") ||
     h.includes("sitio web") || h.includes("website") || h.includes("presentaci"))
    && !h.includes("app") && !h.includes("sistema") && !h.includes("plataforma")
  ) return "web_landing";

  // Web App / Sistema — default para lo que no encaje en otras categorías
  return "webapp_system";
}

/**
 * Mapea complexity_hint de la sesión a un ComplexityTier.
 * Fallback: "medio".
 */
export function resolveComplexityTier(hint: string | null): ComplexityTier {
  if (!hint) return "medio";
  const h = hint.toLowerCase();

  // Alto — se evalúa primero para capturar "enterprise", "complex platform", etc.
  if (
    h.includes("alto") || h.includes("high") || h.includes("enterprise") ||
    h.includes("platform") || h.includes("complex") || h.includes("advanced") ||
    h.includes("avanzado") || h.includes("large") || h.includes("grande")
  ) return "alto";

  // Bajo — proyectos simples, básicos
  if (
    h.includes("bajo") || h.includes("low") || h.includes("simple") ||
    h.includes("basic") || h.includes("small") || h.includes("pequeño") ||
    h.includes("básico") || h.includes("sencillo") || h.includes("starter")
  ) return "bajo";

  return "medio";
}

/**
 * Devuelve los precios formateados en USD para el bloque de contexto del prompt.
 */
export function formatPricing(
  category: ProjectCategory,
  tier: ComplexityTier
): { activation: string; monthly: string } {
  const r = PRICING_TABLE[category][tier];
  return {
    activation: `$${r.activation} USD`,
    monthly:    `$${r.monthly} USD/mes`,
  };
}

// ============================================================================
// Validación de propuesta generada
// ============================================================================

export const PROPOSAL_FORBIDDEN_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\b(\d+)\s*%\s*(off|discount|descuento)\b/i,
    reason: "Descuento porcentual — no hay descuentos por defecto",
  },
  {
    pattern: /\bphase[\s-]?(1|2|3|one|two|three)\s+payment\b/i,
    reason: "Pago por fases como opción principal",
  },
  {
    pattern: /\bpago\s+por\s+fase(s)?\b/i,
    reason: "Pago por fases como opción principal",
  },
  {
    pattern: /\binstallment(s)?\b/i,
    reason: "Plan de pagos en cuotas mencionado como opción principal",
  },
  {
    pattern: /\b(repository|repo|github|gitlab|código)\s+(access|acceso|delivery|entrega)\b/i,
    reason: "Entrega técnica implícita antes del pago",
  },
  {
    pattern: /\bdesde\s+\$\d/i,
    reason: "Rango 'desde $X' — la propuesta debe mostrar precio exacto",
  },
  {
    pattern: /\$\d[\d,]*\s*[–\-]\s*\$\d/,
    reason: "Rango de precio — la propuesta debe mostrar precio exacto",
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
 * al generar una propuesta formal.
 */
export function buildProposalContext(
  session: StudioSession,
  messages: { role: "user" | "assistant"; content: string }[],
  versions: StudioVersion[]
): string {
  const category = resolveProjectCategory(session.projectType ?? session.goalSummary);
  const tier     = resolveComplexityTier(session.complexityHint);
  const pricing  = formatPricing(category, tier);

  const noMembership = isMembershipContraindicated(
    [session.initialPrompt, session.goalSummary, session.projectType].filter(Boolean).join(" ")
  );

  const lines: string[] = [];

  // ── Metadata de sesión ────────────────────────────────────────────────────

  lines.push("## Session context");
  lines.push(`- Initial request: "${session.initialPrompt}"`);
  if (session.goalSummary)    lines.push(`- Goal summary: ${session.goalSummary}`);
  if (session.projectType)    lines.push(`- Project type: ${session.projectType}`);
  if (session.complexityHint) lines.push(`- Complexity: ${session.complexityHint}`);
  lines.push(`- Category resolved: ${PROJECT_CATEGORIES[category]}`);
  lines.push(`- Tier resolved: ${COMPLEXITY_TIERS[tier]}`);
  lines.push(`- Language used: ${session.language}`);
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
          ? `- v${v.versionNumber} [${label}]: ${v.changeSummary}`
          : `- v${v.versionNumber} [${label}]`
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

  lines.push("## Pricing for this proposal");
  lines.push(`Category: ${PROJECT_CATEGORIES[category]} | Tier: ${COMPLEXITY_TIERS[tier]}`);
  lines.push(`- Activation fee (Pago único OR Membresía activation): ${pricing.activation}`);
  if (!noMembership) {
    lines.push(`- Membresía mensual: ${pricing.monthly}`);
    lines.push(`  Membership line: "Incluye hosting, base de datos básica, soporte, actualizaciones menores y avance gradual del proyecto."`);
    lines.push(`- Mark the recommended modality with label "Recomendado".`);
  } else {
    lines.push(`- NOTE: Membership is NOT recommended for this type of project. Offer Pago único only.`);
  }
  lines.push("");
  lines.push("IMPORTANT:");
  lines.push("- Show the EXACT price. Do NOT use ranges like 'desde $X' or '$X – $Y'.");
  lines.push("- Do NOT add any discount percentage for single payment.");
  lines.push("- Do NOT present phase-based or installment payments as a primary option.");
  lines.push("- Proposal validity: 15 days from first real link opening (not from send date).");
  lines.push("- Project activates ONLY upon confirmed payment. 'Under verification' does NOT activate the project.");
  lines.push("");

  // ── Instrucción de generación ─────────────────────────────────────────────

  lines.push("## Your task");
  lines.push(
    "Generate the full formal proposal following the structure defined in your system prompt. " +
    "Use the conversation above to extract scope, deliverables, and exclusions. " +
    "Use the EXACT pricing above for the Investment section — do not invent or adjust figures. " +
    `Write the proposal in ${session.language === "es" ? "Spanish" : "English"} unless the conversation clearly used a different language.`
  );

  return lines.join("\n");
}

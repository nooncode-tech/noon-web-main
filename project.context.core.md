# project.context.core.md — Noon / Maxwell Studio

> **Última actualización:** 2026-04-05  
> **Sesión:** Fase 0 — Especificación y audit  
> **Modo recomendado:** Recovery / FULL

## 2026-04-26 integration note

- Noon Website and Noon App remain separate products.
- Website owns Maxwell, proposal visibility, and payment.
- Noon App owns inbound PM review and post-payment operational handoff.
- Website sends pending proposals to Noon App via signed webhooks.
- Noon App returns review decisions to `POST /api/integrations/noon-app/proposal-review-decision`.
- Legacy website review mutations are disabled; `POST /api/maxwell/review` no longer approves/sends proposals.
- Payment confirmation still originates from the website and is sent to Noon App only after the website has a paid/confirmed session.

---

## 1. Identidad

- **Proyecto:** Noon — plataforma de software profesional con intake comercial vía Maxwell
- **Objetivo activo:** Reemplazar el modal de chat pre-propuesta por Maxwell Studio (experiencia tipo v0 + Emergent)
- **Tipo de producto:** Website pública + sistema de intake comercial IA-asistido
- **Estado:** En implementación — Fase 0 completada, Fase 1 siguiente
- **Repositorio:** `noon-main` (local, sin remote confirmado)

---

## 2. Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes (nodejs runtime)
- **Base de datos:** PostgreSQL en Supabase, consumido via `postgres.js` con `DATABASE_URL`
- **IA:** OpenAI gpt-4.1 (via `openai` SDK), v0 SDK para prototipos
- **Infra:** App desplegable sobre Next.js con Postgres/Supabase; sin AWS dedicada en este ciclo

---

## 3. Arquitectura

### Módulos estables (NO tocar):
- `app/page.tsx` — Homepage pública
- `app/_components/site/` — Componentes de layout público
- `lib/site-config.ts`, `lib/site-tones.ts` — Config global de estilos

### Módulos en migración activa (Maxwell Studio):
- `app/maxwell/page.tsx` — Convertir en entry point del Studio
- `components/landing/maxwell-chat-modal.tsx` — Degradar → eliminar
- `app/_components/site/start-with-maxwell-flow.tsx` — Refactor → transición al Studio
- `app/api/maxwell/` — Reescribir todos los routes
- `lib/server/noon-storage.ts` — Legacy SQLite; no usar para Maxwell Studio nuevo

### Por crear:
- `components/maxwell/` — UI del Studio (shell, header, chat pane, preview pane, etc.)
- `lib/maxwell/` — Lógica de negocio (state machine, guards, prompts, repositories)
- `app/api/maxwell/review/route.ts` — Cola de revisión humana

---

## 4. Convenciones críticas

- Todos los routes API son `runtime = "nodejs"`, `dynamic = "force-dynamic"`
- Postgres vía `postgres.js` — no ORM, queries directas
- Componentes client-side: `"use client"` explícito
- Estilos: Tailwind + `siteTones` / `siteStatusTones` de `lib/site-tones.ts` — no hardcodear colores
- No introducir AWS dedicada, Redis ni complejidad infra extra en este ciclo

---

## 5. Restricciones no negociables

1. Homepage y navegación pública: PRESERVAR intactas
2. No entregar código, repo ni acceso técnico antes del pago
3. Máximo 2 correcciones pre-propuesta (guarda dura en código y DB)
4. Toda propuesta pasa por revisión humana antes del envío
5. `client_workspace` solo con `payment_status = confirmed`
6. Propuesta: Pago único + Membresía como principales; Pago flexible como secundario
7. Sin descuento automático por full payment en la propuesta
8. Sin AWS ni infra cloud en este ciclo

---

## 6. Estado actual

### Implementado y funcional:
- `maxwell-chat-modal.tsx`: UI completa con fases, correcciones (MAX=2), iframe preview, propuesta
- `chat/route.ts`: Chat stateless con [READY_FOR_PROTOTYPE]
- `prototype/route.ts`: v0 create + update
- `proposal/route.ts`: Genera propuesta (con contenido prohibido — pendiente reescritura)
- `session/route.ts`: Captura prompt + cookie
- `lib/server/db.ts`: conexión a Postgres/Supabase para Maxwell Studio
- `noon-storage.ts`: SQLite legacy para flujos antiguos, no canónico para Studio

### Problemas críticos identificados:
- `proposal/route.ts`: Contiene "full payment 5% discount" y "phase-based payments como principal" → **REESCRIBIR**
- Toda la conversación, correcciones y prototipo son **estado frontend puro** — sin persistencia real
- No existe máquina de estados en backend
- El esquema Studio existe pero seguía blando: faltaban constraints, tipos fuertes y wiring parcial en runtime
- No existe cola de revisión humana

### En construcción (Fase 1+):
- `components/maxwell/` — pendiente crear
- `lib/maxwell/` — pendiente crear
- Hardening de esquema Supabase/Postgres — en curso

---

## 7. Riesgos activos

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| `proposal/route.ts` con contenido comercial prohibido en producción | ALTO | Reescribir en Fase 6 antes de go-live |
| Estado de sesión perdido si cliente recarga (solo frontend) | ALTO | Fase 2 resuelve con persistencia real |
| v0 SDK wrapper sin tipado fuerte | MEDIO | Mantener el cast actual hasta mejora |
| Drift entre runtime y esquema real de Supabase | ALTO | Endurecer schema + alinear repositorios y rutas |

---

## 8. Supuestos activos

| Supuesto | Riesgo si es falso |
|----------|--------------------|
| `V0_API_KEY` y `OPENAI_API_KEY` configurados en `.env` | Bloqueante para pruebas |
| Supabase es la base canónica para Maxwell Studio | Si el entorno remoto difiere del repo, hay que validar antes de migrar |
| PM de Noon revisa manualmente las propuestas | Sin PM, propuesta queda en pending indefinido |

---

## 9. Decisiones abiertas

| Decisión | Opciones | Impacto | Trigger |
|----------|----------|---------|---------|
| Notificación al PM cuando llega propuesta | Email vs webhook vs dashboard admin | Fase 7 | Implementar Fase 7 |
| Mecanismo de confirmación de pago | Webhook de pasarela vs manual vs simulado | Fase 8 | Implementar Fase 8 |

---

## 10. Siguiente paso recomendado

**Fase 1:** Convertir `app/maxwell/page.tsx` en punto de entrada del Studio + crear skeleton de `components/maxwell/`.

- Preservar contenido de marketing (capabilities, examples) en la página
- Mover `StartWithMaxwellFlow` para que, al enviar el prompt, redirija al Studio en vez de abrir el modal
- Crear `studio-shell.tsx` como contenedor base (sin lógica todavía)
- Degradar `maxwell-chat-modal.tsx` a launcher transitorio (no eliminar aún)

**Modo recomendado:** Recovery → Architecture → Frontend  
**Skills:** system-architecture → system-frontend

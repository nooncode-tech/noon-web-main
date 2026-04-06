# project.context.full.md — Noon / Maxwell Studio

> **Última actualización:** 2026-04-05  
> **Usar cuando:** Recovery, Architecture, Validator, Refactor mayor

---

## 1. Identidad completa

- **Proyecto:** Noon — boutique de software profesional
- **Problema que resuelve:** Empresas necesitan software custom pero el proceso de intake, definición y propuesta es lento, opaco y costoso
- **Usuarios del Studio:** Prospectos (pre-pago) y PM de Noon (revisión de propuesta)
- **Usuarios post-pago:** Clientes activos (workspace formal, fuera del scope del Studio)
- **Owner:** Juan (operador de Noon)
- **Estado del repo:** Recovery — arquitectura Maxwell siendo migrada de modal a Studio

---

## 2. Stack completo

### Frontend
- Next.js 15 (App Router, `app/` directory)
- React 18+, TypeScript strict
- Tailwind CSS v3
- shadcn/ui (componentes base)
- Lucide icons
- Custom design system: `lib/site-tones.ts`, `lib/site-config.ts`

### Backend
- Next.js API Routes (Server Actions no usadas aún)
- Runtime: `nodejs` (no edge — SQLite requiere Node)
- Validación: Zod

### Base de datos
- `node:sqlite` (DatabaseSync, nativo en Node 22.5+)
- Archivo: `.data/noon.sqlite`
- Sin ORM — SQL directo con `prepare().run()` / `.get()` / `.all()`

### IA
- OpenAI `gpt-4.1` via `openai` SDK (chat, propuesta)
- v0 SDK `v0-sdk v0.16` (generación y actualización de prototipos)
- `lib/api-ia.ts` — wrapper reutilizable para ambos servicios

### Infra
- Sin cloud en este ciclo
- Deployment local/VPS esperado
- Sin Redis, sin S3, sin Aurora

---

## 3. Arquitectura completa

### Capa pública (PRESERVAR)
```
app/
  page.tsx                      ← Homepage (módulos revelados en scroll)
  _components/site/             ← Layout público: nav, frame, cards, footer
  contact/                      ← Formulario de contacto
  templates/                    ← Catálogo de templates
  about/, services/, etc.       ← Páginas públicas
lib/
  site-config.ts                ← Rutas, configuración del sitio
  site-tones.ts                 ← Sistema de color semántico
  contact.ts                    ← Tipos y validación del formulario de contacto
```

### Capa de intake / Maxwell Studio (EN MIGRACIÓN)
```
app/
  maxwell/
    page.tsx                    ← Entry point del Studio (convertir desde marketing)

app/api/maxwell/
  chat/route.ts                 ← Discovery + state transitions
  prototype/route.ts            ← v0 create/update encapsulado en sesión
  proposal/route.ts             ← Generación de propuesta (reescribir completamente)
  session/route.ts              ← CRUD de studio_session
  review/route.ts               ← Cola de revisión humana (CREAR)

components/maxwell/             ← Por crear
  studio-shell.tsx
  studio-header.tsx
  studio-chat-pane.tsx
  studio-preview-pane.tsx
  studio-thinking-block.tsx
  studio-correction-bar.tsx
  studio-proposal-cta.tsx

lib/maxwell/                    ← Por crear
  state-machine.ts
  studio-guards.ts
  prompts.ts
  studio-brief.ts
  proposal-rules.ts
  repositories.ts

lib/server/
  noon-storage.ts               ← SQLite: ampliar con 7 entidades nuevas
```

### Capa post-pago (FUTURO — no en este ciclo)
```
app/workspace/                  ← Portal formal del cliente (post-pago)
```

---

## 4. Convenciones

### Código general
- TypeScript strict, sin `any` explícito
- Zod para validación en todos los API routes
- `crypto.randomUUID()` para IDs
- Fechas en ISO 8601 string (`new Date().toISOString()`)

### Frontend
- Componentes de página: Server Components por defecto; `"use client"` solo cuando hay estado o efectos
- Tailwind: utility-first; no CSS modules
- Colores: siempre via `siteTones.X.accent/surface/border/shadow/contrast`; no hardcodear hex salvo en `site-tones.ts`
- Animaciones: clases Tailwind + `transition-all duration-{X}` + `useRevealOnView` hook
- Íconos: Lucide React

### Backend (API routes)
- `export const runtime = "nodejs"` en todos los routes que usen SQLite o IA
- `export const dynamic = "force-dynamic"` en todos los routes
- Respuestas de error con estructura: `{ message: string, fieldErrors?: object }`
- Cookies: `httpOnly: true`, `sameSite: "lax"`, `secure: production`

### Base de datos
- Todas las tablas con `id TEXT PRIMARY KEY` (UUID)
- `created_at TEXT NOT NULL` en todas las tablas
- `updated_at TEXT NOT NULL` en tablas con estado mutable
- Índices en columnas de búsqueda frecuente
- CHECK constraints para enums de estado
- Sin foreign keys enforcement activo en SQLite (pero declarar para documentación)

---

## 5. Seguridad y datos

- API keys solo en variables de entorno del servidor (nunca en cliente)
- Cookies de sesión: httpOnly, no accesibles desde JS
- Input validation en todos los endpoints vía Zod
- No exponer IDs internos completos en UI (mostrar primeros 8 chars para referencias)
- `client_workspace` tiene CHECK constraint de nivel DB para prevenir activación sin pago

### Superficie de riesgo conocida
- `proposal/route.ts`: Contiene contenido comercial incorrecto (prohibido hasta reescritura)
- Estado de sesión Maxwell: actualmente solo frontend — sin autenticación real del cliente

---

## 6. Contratos y dependencias

### Frontend → Backend
| Frontend consume | Backend provee | Contrato |
|------------------|----------------|----------|
| `start-with-maxwell-flow.tsx` | `POST /api/maxwell/session` | `{ prompt, source }` → `{ session }` |
| `maxwell-chat-modal.tsx` | `POST /api/maxwell/chat` | `{ prompt, history }` → `{ reply, readyForPrototype }` |
| `maxwell-chat-modal.tsx` | `POST /api/maxwell/prototype` | `{ action, prompt/chatId }` → `{ chatId, demoUrl }` |
| `maxwell-chat-modal.tsx` | `POST /api/maxwell/proposal` | `{ history, initialPrompt }` → `{ proposal }` |

### Contratos nuevos (post-migración)
Ver `docs/maxwell/maxwell-studio-state-machine.md` — Sección 5.

### Variables de entorno requeridas
```
OPENAI_API_KEY      # OpenAI API
V0_API_KEY          # v0 SDK
```

---

## 7. ADRs (Decisiones de Arquitectura)

### ADR-001: SQLite local como persistencia
**Decisión:** Usar `node:sqlite` nativo sin ORM.  
**Razón:** Simplicidad para un equipo pequeño; no requiere infra adicional.  
**Trade-off:** No escala a múltiples servidores. Aceptado para este ciclo.

### ADR-002: v0 como motor de prototipado
**Decisión:** v0 SDK para generación y actualización de prototipos.  
**Razón:** Calidad visual alta sin infraestructura de rendering propia.  
**Trade-off:** Dependencia externa; v0 chatId como referencia de versión.

### ADR-003: Estado de sesión Maxwell en migración progresiva
**Decisión:** Migrar de frontend-only a backend-persistido en fases.  
**Razón:** No romper la UI funcional actual mientras se construye la nueva.  
**Implicación:** Las fases 1–2 son de scaffolding + persistencia antes de reescribir la UI.

### ADR-004: Revisión humana obligatoria para propuestas
**Decisión:** Toda propuesta generada entra en `pending_review`; nunca se envía automáticamente.  
**Razón:** Control de calidad comercial y protección contra errores de la IA.  
**Implicación:** Requiere `review/route.ts` y notificación al PM.

### ADR-005: Guardas de corrección como constraint dual (código + DB)
**Decisión:** El límite de 2 correcciones se refuerza tanto en la guarda de aplicación como en un CHECK constraint de SQLite.  
**Razón:** Defensa en profundidad; un bug en la aplicación no puede saltarse la guarda.

---

## 8. Estado detallado de módulos

| Módulo | Estado | Decisión | Próxima acción |
|--------|--------|----------|----------------|
| `app/page.tsx` | Estable, funcional | Preservar | — |
| `app/maxwell/page.tsx` | Marketing hybrid | Refactor | Fase 1: convertir en entry point |
| `maxwell-chat-modal.tsx` | Funcional, sin persistencia | Rebuild | Fase 1: degradar; Fases 1-4: reemplazar |
| `start-with-maxwell-flow.tsx` | Funcional | Refactor | Fase 1: transición a Studio |
| `chat/route.ts` | Stateless, token primitivo | Rebuild | Fase 3 |
| `prototype/route.ts` | Sólido | Recover + Refactor | Fase 2: encapsular en sesión |
| `proposal/route.ts` | **Contenido prohibido** | **Rebuild urgente** | Fase 6 antes de go-live |
| `session/route.ts` | Solo captura prompt | Rebuild | Fase 2 |
| `noon-storage.ts` | 2 tablas mínimas | Refactor | Fase 2: 7 entidades nuevas |
| `api-ia.ts` | Sólido | Recover | Minor tweaks en Fase 3 |
| `components/maxwell/` | No existe | Crear | Fase 1 (skeleton) + Fase 4 (completo) |
| `lib/maxwell/` | No existe | Crear | Fase 2 (repositories) + Fase 3 (state machine) |

---

## 9. Deuda técnica conocida

| Deuda | Severidad | Plan |
|-------|-----------|------|
| `proposal/route.ts`: contenido comercial prohibido | ALTA | Reescribir en Fase 6 |
| Conversación sin persistencia real | ALTA | Resolver en Fase 2 |
| `v0.chats.sendMessage` con cast forzado de tipos | MEDIA | Actualizar si SDK mejora tipado |
| No hay tests automatizados | MEDIA | Fase 9 (QA) |
| Cookie parsing manual en `session/route.ts` | BAJA | Refactor menor en Fase 2 |

---

## 10. Restricciones

1. **No AWS / cloud** en este ciclo
2. **Homepage pública intacta** — ningún cambio en `app/page.tsx` ni en `app/_components/site/`
3. **Sin ORM** — SQLite directo
4. **`client_workspace` bloqueado hasta pago confirmado** — CHECK constraint de nivel DB
5. **Propuesta siempre en revisión humana** — no hay bypass
6. **Max 2 correcciones** — guarda dual código + DB

---

## 11. Supuestos

- Node.js 22.5+ disponible (para `node:sqlite` nativo)
- `OPENAI_API_KEY` y `V0_API_KEY` configurados antes de Fase 3
- Un solo servidor / proceso para SQLite (no multi-instancia)
- PM de Noon disponible para revisar propuestas (Fase 7)
- No se requiere autenticación de clientes en este ciclo (sesión por cookie)

---

## 12. Decisiones abiertas

| Decisión | Opciones | Impacto | Trigger |
|----------|----------|---------|---------|
| Notificación al PM (propuesta llegó) | Email / Webhook / Dashboard admin | Fase 7 | Implementar review/route.ts |
| Confirmación de pago | Webhook pasarela / Manual / Simulado | Fase 8 | Implementar workspace activation |
| Nombre del proyecto provisional | Generado por Maxwell / Input del cliente | UX del Studio | Fase 4 |
| Autenticación del PM para `/api/maxwell/review` | Header secreto / JWT / Session | Seguridad | Fase 7 |

---

## 13. Continuidad

### Última iteración (Fase 0 — 2026-04-05):
- Audit completo del repo
- 3 documentos de especificación creados en `docs/maxwell/`
- `project.context.core.md` y `project.context.full.md` creados
- Problemas críticos identificados: `proposal/route.ts` con contenido prohibido, estado solo en frontend, sin model de datos Studio

### Próxima iteración esperada:
- **Fase 1:** Scaffolding del Studio — `app/maxwell/page.tsx` + `components/maxwell/studio-shell.tsx` + degradar modal
- **Modo:** Recovery → Frontend

---

## 14. Entornos

- **Dev:** Local, SQLite en `.data/noon.sqlite`, Next.js dev server
- **Prod:** VPS o similar, mismo stack, `.env` con API keys
- **Staging:** No configurado actualmente

---

## 15. Referencias

- Especificación Studio: `docs/maxwell/maxwell-studio-v1-spec.md`
- Máquina de estados y modelo de datos: `docs/maxwell/maxwell-studio-state-machine.md`
- Constraints comerciales: `docs/maxwell/maxwell-commercial-constraints.md`
- IA wrapper: `lib/api-ia.ts`
- Persistencia base: `lib/server/noon-storage.ts`
- Diseño del sistema: `lib/site-tones.ts`, `lib/site-config.ts`

# Maxwell Studio v1 — Especificación Operacional

> **Estado:** LOCKED — Fase 0 completa  
> **Revisado:** 2026-04-05  
> **Autor:** Sistema (generado vía audit + especificación de producto)

---

## 1. Propósito

Maxwell Studio es la capa pre-pago de Noon. Reemplaza el modal de chat básico (`maxwell-chat-modal.tsx`) por una experiencia tipo estudio (inspirada en v0 + Emergent) donde el cliente puede explorar, iterar sobre un prototipo y solicitar una propuesta formal — todo antes de comprometer cualquier pago.

**No es:**
- El workspace formal del cliente (eso es post-pago).
- Una entrega de código o repositorio.
- Una primera versión operativa bajo membresía.

---

## 2. Flujo de producto

```
[Cliente] describe idea inicial
    ↓
Maxwell (intake → clarifying) — máx. 1 pregunta por turno
    ↓
Maxwell genera prototipo en v0 (silenciosamente)
    ↓ [estado: generating_prototype]
Preview disponible — Version 1
    ↓ [estado: prototype_ready]
Cliente puede:
  A) Aprobar → approved_for_proposal
  B) Pedir corrección (máx. 2) → revision_requested → revision_applied → prototype_ready
  C) Hablar con agente (escape hatch)
    ↓ [estado: approved_for_proposal]
Cliente solicita propuesta formal
    ↓ [estado: proposal_pending_review]
Revisión humana por PM de Noon
    ↓ [acción: approve/send, edit, return, escalate]
Propuesta enviada al cliente
    ↓ [estado: proposal_sent]
Pago confirmado
    ↓ [estado: converted]
Se habilita client_workspace (post-pago)
```

---

## 3. Identidad de Maxwell en esta etapa

Maxwell es un **arquitecto de solución pre-pago**, no un PM post-pago ni un chatbot de intake genérico.

### Reglas de comportamiento:
1. Responde en el idioma del cliente.
2. Pregunta máximo **una cosa por turno**.
3. Explica el siguiente paso cuando reducir fricción.
4. Con suficiente contexto (3–5 intercambios), genera el prototipo y avanza.
5. Tras 2 correcciones, orienta a: aprobar / solicitar propuesta / hablar con agente.
6. **Nunca** ofrece código, repositorio ni acceso técnico en esta etapa.
7. **Nunca** menciona herramientas de terceros (v0, OpenAI, etc.) al cliente.
8. Asume detalles menores con criterio — no se bloquea.
9. Tono: profesional, claro, cercano. No hablar como herramienta técnica.

---

## 4. Lógica de correcciones

- Máximo **2 correcciones** antes de propuesta.
- Cada corrección crea una nueva versión en `studio_version`.
- Tras la segunda corrección, la UI cambia: desaparece el botón de corrección y aparecen CTAs de aprobación / propuesta / agente.
- Esta guarda es **dura en código** — no hay override de UI ni de API sin intervención de agente.

**Contador visible:** `X / 2 ajustes utilizados`

---

## 5. Propuesta formal

### Contenido obligatorio:
- Resumen ejecutivo (2–3 oraciones)
- Alcance y entregables (lista específica)
- Exclusiones explícitas
- Timeline estimado por fase
- Inversión con modalidades:
  - **Pago único** (principal)
  - **Membresía** (principal) — activación + mensualidad separadas
  - **Pago flexible** (secundario, solo si aplica)
- Condiciones de activación
- Nota de revisión humana

### Lo que NO debe aparecer:
- Descuento por full payment como regla por defecto
- Phase-based payments como opción principal
- Copy que sugiera entrega de código en esta etapa
- Mención de herramientas técnicas al cliente

---

## 6. Revisión humana de propuesta

Toda propuesta generada entra en estado `pending_review` automáticamente.

**Acciones disponibles para el PM:**
- `approve/send` — enviar propuesta al cliente
- `edit` — editar borrador antes de enviar
- `return` — devolver a Maxwell para regenerar
- `escalate` — escalar a decisión humana superior

El sistema registra cada acción en `proposal_review_event` con timestamp, actor y notas.

**El proyecto no se activa sin:**
1. Propuesta aprobada por PM
2. Pago confirmado

---

## 7. Workspace post-pago

El `client_workspace` solo se crea cuando `payment_status = confirmed`.

**No existe workspace activo sin pago confirmado.**

La experiencia pre-pago (Maxwell Studio) **no** es la primera versión del workspace. Es una etapa comercial separada.

---

## 8. Arquitectura de la experiencia (UI)

### Desktop: dos paneles
- **Panel izquierdo:** chat con Maxwell
  - Mensajes con thinking blocks visibles
  - Input persistente
  - Estado actual + contador de correcciones
- **Panel derecho:** preview del prototipo
  - iframe de v0
  - Barra: versión actual, historial de versiones
  - CTAs: aprobar / pedir ajuste / solicitar propuesta / hablar con agente

### Mobile: vistas conmutables
- Chat view (default)
- Preview view (toggle)

### Header (studio-header.tsx):
- Nombre provisional del proyecto (generado por Maxwell)
- Estado actual de la sesión
- Contador de correcciones: `1/2` → `2/2` → `Sin ajustes disponibles`
- Botón: "Hablar con agente"

---

## 9. Entidades de datos

Ver `maxwell-studio-state-machine.md` para el modelo completo.

**Tablas mínimas:**
- `studio_session` — sesión principal con estado
- `studio_message` — historial de mensajes
- `studio_brief` — brief estructurado extraído por Maxwell
- `studio_version` — versiones del prototipo (v0 chatId + demoUrl)
- `proposal_request` — solicitud de propuesta con estado de revisión
- `proposal_review_event` — log de acciones de revisión humana
- `client_workspace` — solo post-pago

---

## 10. Estructura de archivos objetivo

```
app/
  maxwell/
    page.tsx                    ← Punto de entrada del Studio

app/api/maxwell/
  chat/route.ts                 ← Reescribir (con sesión + estado)
  prototype/route.ts            ← Encapsular en sesiones
  proposal/route.ts             ← Reemplazar completamente
  session/route.ts              ← Ampliar
  review/route.ts               ← Crear nuevo

components/maxwell/
  studio-shell.tsx              ← Shell de dos paneles
  studio-header.tsx             ← Estado + nombre + contador
  studio-chat-pane.tsx          ← Panel de chat
  studio-preview-pane.tsx       ← Panel de preview
  studio-thinking-block.tsx     ← Bloques de thinking visibles
  studio-correction-bar.tsx     ← Contador de correcciones
  studio-proposal-cta.tsx       ← CTAs contextuales

lib/maxwell/
  prompts.ts                    ← Prompts del sistema
  state-machine.ts              ← Máquina de estados
  studio-brief.ts               ← Lógica del brief
  studio-guards.ts              ← Guardas de corrección y negocio
  proposal-rules.ts             ← Reglas de propuesta vigentes
  repositories.ts               ← Capa de persistencia
```

---

## 11. Criterios de aceptación por fase

| Fase | Criterio |
|------|----------|
| 0 | Documentación completa, sin ambigüedad sobre pre-pago / propuesta / revisión / pago |
| 1 | Homepage intacta; /maxwell opera como experiencia principal |
| 2 | Sesión recorrible, corregible y que pase a propuesta sin perder estado |
| 3 | Maxwell opera como arquitecto de solución, no como intake bot |
| 4 | Se percibe como experiencia de construcción real |
| 5 | No más de 2 correcciones pre-propuesta sin intervención de agente |
| 6 | Ninguna propuesta generada contradice Pago único / Membresía / Pago flexible secundario |
| 7 | Toda propuesta entra en revisión y puede ser intervenida antes del envío |
| 8 | No existe workspace activo sin pago confirmado |
| 9 | Sistema coherente en UX, negocio y trazabilidad |

---

## 12. Errores que no cometer

- Reescribir la website completa (objetivo: reemplazar solo la capa de chat)
- Mantener el modal como arquitectura principal por comodidad
- Implementar UI tipo v0 sin tocar estados, persistencia y guardas
- Conservar el prompt viejo de propuesta y solo cambiar el diseño visual
- Confundir preview avanzada con entrega real del proyecto
- Crear workspace antes del pago confirmado
- Permitir iteración ilimitada sin guardas comerciales
- Mostrar demasiado detalle técnico al cliente final

---

## 13. Qué desaparece del repo tras la migración

- Descuento por full payment como regla por defecto en `proposal/route.ts`
- Phase-based payments como opción principal en el prompt de propuesta
- Copy que haga ver la preview pre-pago como entrega final
- `MaxwellChatModal` como arquitectura principal (degradar a launcher transitorio, luego eliminar)

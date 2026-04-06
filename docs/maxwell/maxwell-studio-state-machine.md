# Maxwell Studio — Máquina de Estados y Modelo de Datos

> **Estado:** LOCKED — Fase 0 completa  
> **Revisado:** 2026-04-05

---

## 1. Estados de `studio_session.status`

```
intake
  │
  ▼
clarifying
  │  (Maxwell ha reunido suficiente contexto)
  ▼
generating_prototype
  │  (v0 procesa; no interactivo)
  ▼
prototype_ready
  │
  ├─── [cliente pide ajuste, corrections_used < max_corrections]
  │         ▼
  │    revision_requested
  │         │
  │         ▼
  │    revision_applied ──→ prototype_ready (loop hasta max)
  │
  ├─── [corrections_used == max_corrections]
  │    Solo disponibles: aprobar / propuesta / agente
  │
  └─── [cliente aprueba]
            ▼
       approved_for_proposal
            │
            ▼
       proposal_pending_review   ← propuesta generada, esperando PM
            │
            ▼
       proposal_sent             ← PM aprobó y envió
            │
            ▼
       converted                 ← pago confirmado
            │
            ▼
       [client_workspace creado]
```

---

## 2. Guardas obligatorias

| Guarda | Descripción | Ubicación |
|--------|-------------|-----------|
| `maxCorrectionsGuard` | Bloquea tercera corrección; fuerza aprobar / propuesta / agente | `lib/maxwell/studio-guards.ts` + API |
| `workspacePaymentGuard` | Impide crear `client_workspace` sin `payment_status = confirmed` | `lib/maxwell/studio-guards.ts` + ruta de workspace |
| `proposalEditGuard` | Propuesta enviada no se edita; cambios crean nueva versión comercial | `lib/maxwell/studio-guards.ts` |
| `prepayWorkspaceGuard` | Sesión pre-pago no puede ser representada como workspace formal | Contrato en `client_workspace` |

### Implementación de `maxCorrectionsGuard`

```typescript
// lib/maxwell/studio-guards.ts
export function canRequestCorrection(session: StudioSession): boolean {
  return session.corrections_used < session.max_corrections;
}

export function assertCanRequestCorrection(session: StudioSession): void {
  if (!canRequestCorrection(session)) {
    throw new MaxwellGuardError(
      "MAX_CORRECTIONS_REACHED",
      "No more corrections available. Approve the prototype, request a proposal, or talk to an agent."
    );
  }
}
```

---

## 3. Modelo de datos completo

### `studio_session`

```sql
CREATE TABLE IF NOT EXISTS studio_session (
  id                      TEXT PRIMARY KEY,
  initial_prompt          TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'intake',
  project_type            TEXT,
  goal_summary            TEXT,
  complexity_hint         TEXT,
  language                TEXT NOT NULL DEFAULT 'en',
  corrections_used        INTEGER NOT NULL DEFAULT 0,
  max_corrections         INTEGER NOT NULL DEFAULT 2,
  proposal_requested_at   TEXT,
  created_at              TEXT NOT NULL,
  updated_at              TEXT NOT NULL,

  CHECK (status IN (
    'intake', 'clarifying', 'generating_prototype', 'prototype_ready',
    'revision_requested', 'revision_applied', 'approved_for_proposal',
    'proposal_pending_review', 'proposal_sent', 'converted'
  )),
  CHECK (corrections_used <= max_corrections)
);
```

### `studio_message`

```sql
CREATE TABLE IF NOT EXISTS studio_message (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id),
  role              TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message_type      TEXT NOT NULL CHECK (message_type IN (
    'chat', 'thinking', 'correction_request', 'prototype_announcement',
    'approval', 'proposal_request', 'system_event'
  )),
  content           TEXT NOT NULL,
  created_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_message_session
  ON studio_message (studio_session_id, created_at ASC);
```

### `studio_brief`

```sql
CREATE TABLE IF NOT EXISTS studio_brief (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL UNIQUE REFERENCES studio_session(id),
  objective         TEXT,
  users             TEXT,
  core_flow         TEXT,
  style_direction   TEXT,
  integrations      TEXT,
  assumptions       TEXT,
  constraints       TEXT,
  updated_at        TEXT NOT NULL
);
```

### `studio_version`

```sql
CREATE TABLE IF NOT EXISTS studio_version (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id),
  version_number    INTEGER NOT NULL,
  preview_url       TEXT NOT NULL,
  v0_chat_id        TEXT NOT NULL,
  change_summary    TEXT,
  source            TEXT NOT NULL CHECK (source IN ('initial', 'correction', 'agent_override')),
  created_at        TEXT NOT NULL,

  UNIQUE (studio_session_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_studio_version_session
  ON studio_version (studio_session_id, version_number DESC);
```

### `proposal_request`

```sql
CREATE TABLE IF NOT EXISTS proposal_request (
  id                TEXT PRIMARY KEY,
  studio_session_id TEXT NOT NULL REFERENCES studio_session(id),
  status            TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN (
    'pending_review', 'under_review', 'approved', 'sent', 'returned', 'escalated'
  )),
  review_required   INTEGER NOT NULL DEFAULT 1,
  reviewer_id       TEXT,
  draft_content     TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
```

### `proposal_review_event`

```sql
CREATE TABLE IF NOT EXISTS proposal_review_event (
  id                  TEXT PRIMARY KEY,
  proposal_request_id TEXT NOT NULL REFERENCES proposal_request(id),
  action              TEXT NOT NULL CHECK (action IN (
    'created', 'reviewed', 'approved', 'sent', 'edited', 'returned', 'escalated'
  )),
  actor               TEXT NOT NULL,
  notes               TEXT,
  created_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_proposal_review_event_request
  ON proposal_review_event (proposal_request_id, created_at ASC);
```

### `client_workspace` (post-pago)

```sql
CREATE TABLE IF NOT EXISTS client_workspace (
  id                        TEXT PRIMARY KEY,
  studio_session_id         TEXT NOT NULL REFERENCES studio_session(id),
  payment_status            TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'confirmed', 'failed', 'refunded'
  )),
  workspace_status          TEXT NOT NULL DEFAULT 'inactive' CHECK (workspace_status IN (
    'inactive', 'active', 'paused', 'closed'
  )),
  latest_update_summary     TEXT,
  created_at                TEXT NOT NULL,
  updated_at                TEXT NOT NULL,

  CHECK (
    -- Guarda dura: workspace no puede ser active sin pago confirmado
    NOT (workspace_status = 'active' AND payment_status != 'confirmed')
  )
);
```

---

## 4. Transiciones válidas de estado

### API: `chat/route.ts`

| Estado de entrada | Acción | Estado de salida |
|-------------------|--------|-----------------|
| `intake` | Primera respuesta de Maxwell | `clarifying` |
| `clarifying` | Maxwell tiene suficiente contexto + trigger `[READY_FOR_PROTOTYPE]` | `generating_prototype` |
| `generating_prototype` | v0 devuelve chatId + demoUrl | `prototype_ready` |
| `prototype_ready` | Cliente aprueba | `approved_for_proposal` |
| `prototype_ready` | Cliente pide corrección (corrections_used < max) | `revision_requested` |
| `revision_requested` | v0 actualiza prototipo | `revision_applied` → `prototype_ready` |
| `approved_for_proposal` | Cliente solicita propuesta | `proposal_pending_review` |

### API: `review/route.ts`

| Estado de entrada | Acción PM | Estado de salida |
|-------------------|-----------|-----------------|
| `proposal_pending_review` | `approve` | `proposal_sent` |
| `proposal_pending_review` | `edit` | `proposal_pending_review` (draft actualizado) |
| `proposal_pending_review` | `return` | `approved_for_proposal` |
| `proposal_pending_review` | `escalate` | `proposal_pending_review` (flag escalado) |
| `proposal_sent` | pago confirmado | `converted` → crea `client_workspace` |

---

## 5. Contratos de API

### POST `/api/maxwell/chat`

```typescript
// Request
{
  session_id: string;          // requerido (o crea nueva sesión)
  message: string;             // mensaje del usuario
}

// Response
{
  session_id: string;
  session_status: SessionStatus;
  reply: string;
  thinking?: string;           // bloque de thinking visible (si aplica)
  ready_for_prototype: boolean;
  corrections_used: number;
  max_corrections: number;
}
```

### POST `/api/maxwell/prototype`

```typescript
// Request (create)
{
  session_id: string;
  action: "create";
  prompt_context: string;      // contexto compilado del chat
}

// Request (update)
{
  session_id: string;
  action: "update";
  v0_chat_id: string;
  correction_prompt: string;
}

// Response
{
  version_number: number;
  preview_url: string;
  v0_chat_id: string;
  session_status: SessionStatus;
  corrections_used: number;
}
```

### POST `/api/maxwell/proposal`

```typescript
// Request
{
  session_id: string;
}

// Response
{
  proposal_request_id: string;
  status: "pending_review";
  draft_content: string;       // borrador generado (visible internamente)
}
```

### POST `/api/maxwell/review`

```typescript
// Request
{
  proposal_request_id: string;
  action: "approve" | "edit" | "return" | "escalate";
  actor: string;               // ID del PM
  notes?: string;
  updated_draft?: string;      // solo para action: "edit"
}

// Response
{
  proposal_request_id: string;
  status: ProposalStatus;
  event_id: string;
}
```

---

## 6. Señales internas de Maxwell (no visibles al cliente)

| Token interno | Significado | Acción en backend |
|---------------|-------------|-------------------|
| `[READY_FOR_PROTOTYPE]` | Maxwell tiene suficiente contexto | Disparar generación de v0, transición a `generating_prototype` |
| `[BRIEF_EXTRACTED]` | Maxwell extrajo brief estructurado | Upsert en `studio_brief` |
| `[PROJECT_NAME:{nombre}]` | Maxwell propone nombre provisional | Update en `studio_session.goal_summary` |

Estos tokens se **eliminan** del texto visible al cliente antes de enviarlo al frontend.

---

## 7. Flujo de error y resiliencia

| Escenario | Comportamiento esperado |
|-----------|------------------------|
| Fallo de v0 en generación | Mensaje claro al cliente; sesión queda en `clarifying`; no se pierde historial |
| Fallo de OpenAI | Mensaje claro; sesión mantiene su estado actual; historial preservado |
| Sesión no encontrada | Crear nueva sesión transparentemente |
| Corrección agotada (intento de tercera) | HTTP 409 + mensaje orientando al cliente; UI bloquea el botón |
| Workspace sin pago | HTTP 403 + constraint de DB activo |

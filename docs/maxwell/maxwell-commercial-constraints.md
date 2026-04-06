# Maxwell Studio — Constraints Comerciales

> **Estado:** LOCKED — Fase 0 completa  
> **Revisado:** 2026-04-05  
> **Autoridad:** Estas reglas son no negociables. Ninguna fase de implementación puede contradirlas.

---

## 1. Etapas del proceso comercial

| Etapa | Nombre | Quién actúa | Qué sucede |
|-------|--------|-------------|------------|
| Pre-pago | Maxwell Studio | Cliente + Maxwell AI | Discovery, prototipo, propuesta |
| Revisión | PM Review | PM de Noon | Valida propuesta antes del envío |
| Propuesta | Proposal Sent | Cliente | Revisa y acepta términos |
| Activación | Pago confirmado | Cliente + sistema | Se habilita workspace |
| Post-pago | Client Workspace | PM de Noon + cliente | Entrega formal del proyecto |

---

## 2. Modalidades de pago

### PRINCIPAL — Pago único
- El cliente paga el total del proyecto en un solo pago.
- Activa el workspace inmediatamente al confirmar.
- Sin recargos ni condiciones especiales.
- **No aplica descuento automático por defecto.**

### PRINCIPAL — Membresía
- Pago de activación (onboarding) + mensualidad recurrente.
- La activación y la mensualidad se presentan como valores **separados y explícitos**.
- Apto para proyectos con desarrollo continuo o mantenimiento activo.

### SECUNDARIA — Pago flexible
- Solo se presenta si el proyecto lo justifica (alta complejidad, múltiples módulos independientes).
- Se menciona como opción, no como estructura por defecto.
- No se usa la terminología "phase-based payments" con el cliente.
- No implica entrega parcial de código entre pagos.

---

## 3. Lo que está prohibido en el prompt de propuesta

```
❌ "Option A: Full payment (5% discount)"
❌ "Option B: Phase-based payments (one payment per phase)"
❌ "Each phase is activated upon payment" como estructura principal
❌ Cualquier descuento automático vinculado a método de pago
❌ Copy que sugiera que el cliente recibirá código entre pagos
❌ Copy que represente la preview pre-pago como primera entrega
```

---

## 4. Estructura obligatoria de la propuesta generada por Maxwell

```markdown
## Propuesta de Proyecto — [Nombre Provisional]

**Resumen Ejecutivo**
[2–3 oraciones sobre qué se construye y por qué]

**Alcance y Entregables**
[Lista específica de módulos y funcionalidades incluidas]

**Exclusiones**
[Lo que explícitamente NO está incluido]

**Timeline Estimado**
[Fases con duraciones realistas]

**Inversión**
Modalidad recomendada: [Pago único / Membresía]

- Pago único: [rango en USD]
- Membresía: Activación [X USD] + [Y USD/mes]
[Si aplica] Pago flexible disponible: consultar con el equipo

**Condiciones de Activación**
El proyecto se activa únicamente con pago confirmado.

**Próximos Pasos**
1. Revisión y aprobación de esta propuesta
2. Firma de acuerdo
3. Pago de activación
4. Acceso al portal del cliente Noon

**Nota de Revisión**
Este borrador está siendo revisado por un Project Manager de Noon antes de ser enviado formalmente. Un agente humano está disponible si prefieres apoyo directo.
```

---

## 5. Fronteras de lo que Maxwell puede y no puede hacer

### Maxwell PUEDE:
- Describir el tipo de proyecto que se construirá
- Mostrar un prototipo visual no funcional en iframe
- Explicar el alcance a alto nivel
- Orientar al cliente hacia el siguiente paso
- Generar un borrador de propuesta (para revisión humana)

### Maxwell NO PUEDE:
- Entregar código, repositorio, ni acceso técnico
- Comprometer precios definitivos (solo rangos orientativos)
- Activar un workspace o portal del cliente
- Modificar una propuesta ya enviada
- Permitir más de 2 correcciones sin intervención de agente
- Crear `client_workspace` antes de pago confirmado

---

## 6. Guardas de negocio en código (resumen)

| Guarda | Tipo | Ubicación |
|--------|------|-----------|
| Max 2 correcciones | HTTP 409 + CHECK constraint | `studio-guards.ts` + `studio_session` |
| No workspace sin pago | HTTP 403 + CHECK constraint | `studio-guards.ts` + `client_workspace` |
| No editar propuesta enviada | HTTP 409 | `studio-guards.ts` |
| No crear workspace si sesión pre-pago | Validación lógica | `repositories.ts` |
| Propuesta siempre en pending_review | Automático al crear | `proposal/route.ts` |

---

## 7. Revisión humana — protocolo

1. Toda propuesta generada por Maxwell entra automáticamente en `pending_review`.
2. El sistema notifica al PM (mecanismo a definir en Fase 7: email, webhook, dashboard).
3. El PM tiene acceso al historial completo de la sesión antes de revisar.
4. El PM puede aprobar, editar, devolver o escalar.
5. Solo tras `approve` se actualiza el estado a `proposal_sent`.
6. Cada acción queda registrada en `proposal_review_event` con timestamp y actor.

**El cliente nunca recibe una propuesta no revisada.**

---

## 8. Post-pago — activación del workspace

1. Cliente recibe propuesta formal (email / portal).
2. Cliente acepta y realiza pago.
3. Sistema recibe confirmación de pago (webhook de pasarela).
4. Backend actualiza `studio_session.status = 'converted'`.
5. Backend crea `client_workspace` con `payment_status = 'confirmed'` y `workspace_status = 'active'`.
6. Cliente recibe acceso al portal formal.

**La preview pre-pago (iframe de v0) no es el portal del cliente. Son sistemas separados.**

---

## 9. Lenguaje hacia el cliente — glosario aprobado

| Término aprobado | Término prohibido |
|------------------|------------------|
| "Versión inicial" / "Vista previa" | "Primera entrega" / "Tu app" |
| "Prototipo visual" | "Código listo para producción" |
| "Propuesta formal" | "Cotización automática" |
| "Portal del cliente Noon" | "Tu proyecto en línea" (antes del pago) |
| "Activación del proyecto" | "Inicio inmediato" (sin pago confirmado) |
| "Pago único" | "Full payment discount" |
| "Membresía" | "Suscripción mensual de desarrollo" (jerga técnica) |
| "Pago flexible" | "Phase-based payments" |

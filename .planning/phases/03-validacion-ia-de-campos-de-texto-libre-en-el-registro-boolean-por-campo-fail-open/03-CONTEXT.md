# Phase 03: Validación IA de campos de texto libre en el registro - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Agregar una validación semántica con IA en el flujo de **registro** (server-side): la IA recibe los campos de **texto libre** del registro y juzga si son reales (ej. un nombre que sea un nombre, no `akhsdgKAJHSDGH`). Devuelve un **boolean por campo**. Si algún campo es `false`, se rechaza el registro con un mensaje puntual de ese campo.

**Crítico — fail-open:** la IA nunca puede bloquear un registro por estar caída. Cualquier error, timeout, falta de tokens/quota o respuesta no parseable ⇒ se asume todo `true` y el registro procede. Solo un `false` explícito de la IA bloquea.

Fuera de alcance: validación de otros flujos, cambio de UX del registro más allá de mostrar el mensaje de rechazo.
</domain>

<decisions>
## Implementation Decisions

### Campos evaluados (Opción A — solo texto libre)
- **D-01:** La IA evalúa SOLO los campos de texto libre que existen en el registro: `firstname` y `lastname`. Para empresas estos mismos campos se relabelan como Razón Social / Giro en la UI, pero son las mismas claves de campo. (Scope acotado por el usuario: `address`, `business_name`, `business_type`, `business_address` se difieren a una fase futura de validación de onboarding.)
- **D-02:** ~~`business_*` se evalúan solo cuando `is_company === true`.~~ Diferido — los campos `business_*` ya no entran en el alcance de esta fase (ver D-01).
- **D-03:** Excluidos explícitamente: `password` (obvio) y `email` (ya validado por JS). También quedan con su validación actual (NO IA): `rut`, `phone`, `postal_code`, `birthdate` (formato) y `region`/`commune`/`business_region`/`business_commune` (dropdowns/IDs). `address` y `business_*` se difieren a una fase futura de validación de onboarding.

### Contrato de la IA
- **D-04:** La IA responde un **boolean por campo**, ej. `{ "firstname": true, "lastname": false }`. Solo los campos enviados a evaluar aparecen.
- **D-05:** Si algún campo evaluado es `false` → rechazar el registro con un mensaje específico de ese campo (ej. "El apellido no parece válido").
- **D-06:** Usa el `ai-provider` interno (Cerebras default + cadena de fallback + `AI_PROVIDER` env) creado en la fase 02.

### Fail-open (no negociable)
- **D-07:** La llamada a la IA va con `try/catch` + timeout corto (~3-4s). Error / timeout / sin tokens / JSON no parseable / cualquier campo ausente en la respuesta ⇒ se asume `true` para ese campo. El registro nunca se bloquea por fallas de la IA; solo por un `false` explícito.

### Ubicación / hook
- **D-08:** La validación va **server-side**, antes de crear el usuario, en el flujo de registro de users-permissions (`src/middlewares/user-registration.ts` es el candidato; el planner confirma el punto exacto de enganche).

### Claude's Discretion
- Texto exacto de los mensajes de rechazo por campo (en español).
- Valor exacto del timeout (rango 3-4s) y forma del prompt que fuerza salida JSON booleana.
</decisions>

<canonical_refs>
## Canonical References

No external specs — decisiones capturadas arriba. Refs de código abajo.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reutilizable
- `apps/strapi/src/services/ai-provider/` — `generateArticleDraft`/orquestador con Cerebras default + fallback + `AI_PROVIDER` env (fase 02). Reusar el mismo patrón de proveedor para la validación (idealmente una función nueva que pida salida booleana).
- `apps/strapi/src/middlewares/user-registration.ts` — middleware existente del flujo de registro; punto natural de enganche.
- `apps/strapi/config/plugins.ts` — `users-permissions.config.register.allowedFields` lista los campos del registro (referencia de qué llega en el payload).

### Patrón Strapi (repo)
- Servicios en `src/services/<name>/` con `index.ts` que re-exporta; sin `any`; comentarios/código en inglés; tests en `apps/strapi/tests/` espejando `src/`.

### Frontend
- `apps/website/app/components/FormRegister.vue` — arma el payload de registro y muestra errores; el mensaje de rechazo de la IA debe mostrarse ahí (probablemente vía el error que devuelve el endpoint de registro).
</code_context>

<deferred>
## Deferred Ideas

- Meter IA en otros flujos/lugares — fases futuras (el usuario mencionó "hay más lugares").
- Opción B (evaluar también campos estructurados rut/phone/etc. con IA) — descartada por redundante.
- Validación IA de `address`, `business_name`, `business_type`, `business_address` — diferida a una fase futura de validación de onboarding (no existen / no aplican al alcance de registro de esta fase).
</deferred>

---

*Phase: 03-validacion-ia-de-campos-de-texto-libre-en-el-registro*
*Context gathered: 2026-06-15*

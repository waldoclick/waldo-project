# Phase 02: Mover IA a endpoints de dominio - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Reubicar la IA de endpoints propios (recurso `ia`) a endpoints de **dominio**. La IA pasa a ser una capa de servicio interna, sin ruta pública. El comportamiento del flujo de creación de noticias del dashboard no cambia; cambia la **superficie de la API**.

Flujo objetivo (dashboard, `LightBoxArticles.vue`): buscar fuentes → seleccionar → generar borrador con IA → guardar (guardar sigue siendo `POST /articles`).

Endpoints nuevos (de dominio):
- `GET /articles/sources?q=` — búsqueda de fuentes de noticias (Tavily interno).
- `POST /articles/generate` — genera el borrador a partir de las fuentes seleccionadas (el backend arma el prompt y elige el proveedor).

Fuera de alcance: rediseño del flujo/UX, nuevas capacidades de IA, otros consumidores.
</domain>

<decisions>
## Implementation Decisions

### Selección de proveedor IA (discutido)
- **D-01:** Proveedor por defecto = **Cerebras** (lo que usa hoy el front vía `/ia/cerebras`). Cambio de comportamiento mínimo.
- **D-02:** **Cadena de fallback**: si el proveedor por defecto falla, intentar los demás en orden antes de devolver error.
- **D-03:** Proveedor **configurable por env** (ej. `AI_PROVIDER`), para cambiarlo sin redeploy de código. Default a Cerebras si no está seteado.

### Superficie de API (locked, no discutido — anti-patrón a corregir)
- **D-04:** Eliminar el recurso `ia` y sus rutas: `/ia/gemini`, `/ia/groq`, `/ia/deepseek`, `/ia/cerebras`, `/ia/claude`.
- **D-05:** Los servicios IA (`services/gemini`, `groq`, `deepseek`, `cerebras`, `anthropic`) quedan **internos**, sin ruta. Se consumen desde el controlador de `article`.
- **D-06:** El **prompt** se arma en el **backend** (hoy la plantilla vive en `LightBoxArticles.vue`). El front deja de enviar prompt y de elegir proveedor; manda datos de dominio (query / fuentes seleccionadas).
- **D-07:** Mantener la protección `isManager` en los endpoints nuevos (igual que el recurso `ia` actual).

### Claude's Discretion (áreas no seleccionadas — recomendaciones tomadas)
- **D-08:** `POST /articles/generate` **devuelve solo el borrador generado** (texto); el guardado sigue siendo `POST /articles` aparte (como hoy). No persiste artículo en el generate.
- **D-09:** `GET /articles/sources` mueve la llamada a Tavily al backend y devuelve un **shape propio del dominio** (no el crudo de Tavily). El cache actual del front (`search.store`) puede mantenerse o simplificarse a criterio del planner.
- **D-10:** Eliminar las rutas `/ia` **de una** (sin período de deprecación): el front es el único consumidor y lo controlamos en el mismo cambio.
</decisions>

<canonical_refs>
## Canonical References

No external specs — los requisitos están capturados en las decisiones de arriba. Refs de código en `code_context`.
</canonical_refs>

<code_context>
## Existing Code Insights

### A eliminar / migrar (Strapi)
- `apps/strapi/src/api/ia/routes/ia.ts` — rutas a borrar (5 endpoints por proveedor).
- `apps/strapi/src/api/ia/controllers/ia.ts` — lógica a migrar al controlador de `article` (orquestación + selección de proveedor + prompt).

### Servicios IA (quedan internos, se reutilizan)
- `apps/strapi/src/services/{gemini,groq,deepseek,cerebras,anthropic}` — `generateText` / `generateWithSearch`. Se consumen desde `article`, sin ruta.

### Dominio article (Strapi)
- `apps/strapi/src/api/article/...` — agregar acciones `sources` (GET) y `generate` (POST) + rutas con policy `isManager`.

### Consumidor (website/dashboard)
- `apps/website/app/components/LightBoxArticles.vue` — hoy arma el prompt (plantilla en el componente) y llama `/ia/cerebras` (línea ~383). Debe llamar a los nuevos endpoints de dominio y dejar de enviar prompt/proveedor.
- `apps/website/app/stores/search.store.ts` — cache de resultados Tavily.
- `apps/website/app/stores/articles.store.ts` — `POST /articles` (guardado, se mantiene).

### Patrón Strapi (del repo)
- Carpetas de servicio prefijadas por nombre, `index.ts` re-exporta; usar `documentId` para writes; policies en `config` de la ruta.
</code_context>

<specifics>
## Specific Ideas

- El front no debe "llamar a la IA": llama a "buscar fuentes" y "generar artículo". La IA es invisible para el cliente.
</specifics>

<deferred>
## Deferred Ideas

None — la discusión se mantuvo dentro del alcance de la fase.
</deferred>

---

*Phase: 02-mover-ia-a-endpoints-de-dominio*
*Context gathered: 2026-06-15*

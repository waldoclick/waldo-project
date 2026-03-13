# Requirements: Waldo Project — v1.33 Anthropic Claude AI Service

**Defined:** 2026-03-13
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1 Requirements

### Anthropic Claude Service

- [ ] **CLAUDE-01**: El `AnthropicService` en `apps/strapi/src/services/anthropic/` se conecta a la API de Anthropic usando `@anthropic-ai/sdk` con el modelo `claude-sonnet-4-5`
- [ ] **CLAUDE-02**: La `ANTHROPIC_API_KEY` y la `BRAVE_SEARCH_API_KEY` se leen desde `process.env` en Strapi; el servicio lanza error al iniciar si alguna de las dos falta
- [ ] **CLAUDE-03**: El `AnthropicService` implementa tool use con una herramienta `web_search` — cuando Claude solicita una búsqueda, Strapi ejecuta `GET https://api.search.brave.com/res/v1/web/search` y devuelve los resultados a Claude; el loop continúa hasta que Claude retorna texto final
- [ ] **CLAUDE-04**: `apps/strapi/src/services/anthropic/index.ts` exporta un singleton y la función nombrada `generateWithSearch(prompt): Promise<string>`; otros módulos importan únicamente desde `index.ts`

### Anthropic Endpoint

- [ ] **CLAUDE-05**: El endpoint `POST /api/ia/claude` recibe `{ prompt: string }` y devuelve `{ text: string }` con la respuesta generada por Claude (incluyendo resultados de búsqueda web si los usó)
- [ ] **CLAUDE-06**: Si la API de Anthropic o Brave Search falla, el endpoint responde con un error HTTP apropiado (4xx/5xx) via `ApplicationError` sin crashear Strapi

## v2 Requirements

(None identified)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Streaming responses | Complejidad adicional — `POST → text` es suficiente para v1 |
| Historial de conversación / contexto multi-turno | Out of scope por decisión del usuario |
| Selección de modelo desde el endpoint | `claude-sonnet-4-5` fijo por decisión del usuario |
| UI en dashboard o website | El usuario gestiona esto por separado |
| Rate limiting / throttling | Gestionado a nivel de roles/permisos en Strapi |
| Más de una herramienta (tool) | Solo `web_search` via Brave en v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLAUDE-01 | Phase 072 | Pending |
| CLAUDE-02 | Phase 072 | Pending |
| CLAUDE-03 | Phase 072 | Pending |
| CLAUDE-04 | Phase 072 | Pending |
| CLAUDE-05 | Phase 072 | Pending |
| CLAUDE-06 | Phase 072 | Pending |

**Coverage:**
- v1 requirements: 6 total
- Mapped to phases: 6/6 ✓
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after initial definition*

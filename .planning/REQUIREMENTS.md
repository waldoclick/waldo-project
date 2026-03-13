# Requirements: Waldo Project — v1.32 Gemini AI Service

**Defined:** 2026-03-13
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1 Requirements

### Gemini Service

- [x] **GEMINI-01**: El `GeminiService` en `apps/strapi/src/services/` se conecta a la API de Gemini usando la API key configurada en variables de entorno
- [x] **GEMINI-02**: La API key de Gemini se configura en `.env` de Strapi (`GEMINI_API_KEY`) y se accede desde el servicio de forma segura (no hardcodeada)

### Gemini Endpoint

- [x] **GEMINI-03**: El endpoint `POST /api/ia/gemini` recibe `{ prompt: string }` y devuelve `{ text: string }` con la respuesta generada por Gemini
- [x] **GEMINI-04**: El endpoint delega la llamada a la API de Gemini al `GeminiService` (separación de responsabilidades controller/service)
- [x] **GEMINI-05**: Si la API de Gemini falla o devuelve error, el endpoint responde con un error HTTP apropiado (4xx/5xx) sin crashear Strapi

## v2 Requirements

(None identified)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Streaming responses | Complejidad adicional — `POST → text` es suficiente para v1 |
| Historial de conversación / contexto multi-turno | Out of scope por decisión del usuario |
| Selección de modelo desde el endpoint | Un modelo fijo es suficiente para v1 |
| UI en dashboard o website | El usuario gestiona esto por separado |
| Rate limiting / throttling | Gestionado a nivel de roles/permisos en Strapi |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GEMINI-01 | Phase 071 | Complete |
| GEMINI-02 | Phase 071 | Complete |
| GEMINI-03 | Phase 071 | Complete |
| GEMINI-04 | Phase 071 | Complete |
| GEMINI-05 | Phase 071 | Complete |

**Coverage:**
- v1 requirements: 5 total
- Mapped to phases: 5/5 ✓
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after initial definition*

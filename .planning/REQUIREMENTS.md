# Requirements: Waldo Project — v1.39

**Defined:** 2026-03-15
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.39 Requirements

Requirements for milestone v1.39 — Unified API Client. Completa la centralización de API iniciada en v1.38 donde todos los POST/PUT/DELETE ya pasaron por `useApiClient`. Este milestone migra los GET de datos del website al mismo composable, dejando un único punto de entrada para todos los fetches.

### API Client Unification (apps/website only)

- [x] **API-01**: Todos los `strapi.find()` en stores del website migrados a `useApiClient`
- [x] **API-02**: Todos los `strapi.findOne()` en stores del website migrados a `useApiClient`
- [x] **API-03**: Los composables `useStrapi.ts`, `useOrderById.ts`, `usePacksList.ts` migrados a `useApiClient`
- [x] **API-04**: Las pages y components que llaman `strapi.find()/findOne()` directamente migrados a `useApiClient`
- [x] **API-05**: `useApiClient` soporta GET requests (sin inyección de reCAPTCHA)
- [x] **API-06**: `typeCheck: true` pasa con zero errores después de la migración

## Out of Scope

| Feature | Reason |
|---------|--------|
| Migrar apps/dashboard | Dashboard queda para milestone posterior |
| Migrar auth helpers (fetchUser, setToken, logout) | No son fetches de datos — son helpers de sesión correctos en el SDK |
| Migrar OAuth helpers (getProviderAuthenticationUrl, authenticateProvider) | OAuth flow requiere el SDK; no son candidates para useApiClient |
| Eliminar dependencia completa de @nuxtjs/strapi | Auth layer aún depende del SDK; eliminación completa queda para el futuro |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 | Phase 090 | Complete |
| API-02 | Phase 090 | Complete |
| API-03 | Phase 090 | Complete |
| API-04 | Phase 090 | Complete |
| API-05 | Phase 089 | Complete |
| API-06 | Phase 090 | Complete |

**Coverage:**
- v1.39 requirements: 6 total
- Mapped to phases: 6 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after initial definition*

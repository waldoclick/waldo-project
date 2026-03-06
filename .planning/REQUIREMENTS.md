# Requirements: Waldo Project — v1.6 Website API Optimization

**Defined:** 2026-03-06
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1 Requirements

### Page Double-Fetch Fixes

- [x] **PAGE-01**: `preguntas-frecuentes.vue` realiza exactamente 1 llamada a la API al cargar la página (actualmente hace 2)
- [x] **PAGE-02**: `mis-anuncios.vue` realiza exactamente 2 llamadas a la API al cargar la página — 1 para tab counts y 1 para ads — (actualmente hace 6)
- [x] **PAGE-03**: `loadTabCounts()` en `mis-anuncios.vue` solo se ejecuta una vez al montar la página, no en cada cambio de filtro o página

### Store Cache Guards

- [ ] **STORE-01**: `packs.store.ts` tiene cache guard — `loadPacks()` no hace HTTP request si los datos ya están cargados
- [ ] **STORE-02**: `conditions.store.ts` tiene cache guard — `loadConditions()` no re-fetcha si los datos ya están cargados
- [ ] **STORE-03**: `regions.store.ts` tiene cache guard — `loadRegions()` no re-fetcha si los datos ya están cargados

### Component Redundancy Fix

- [ ] **COMP-01**: `FormCreateThree.vue` no llama `loadCommunes()` en `onMounted` — el plugin `communes.client.ts` ya garantiza que los datos están disponibles

## v2 Requirements

_(none identified)_

## Out of Scope

| Feature | Reason |
|---------|--------|
| Optimizaciones en el Dashboard | El dashboard ya fue limpiado en v1.1–v1.2 |
| Optimizaciones en Strapi | Backend out of scope para este milestone |
| Agregar SSR/SSG a páginas dinámicas | Cambio de arquitectura, no optimización de fetch |
| Refactorizar la estructura de stores | Scope solo es agregar cache guards, no rediseñar |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAGE-01 | Phase 18 | Complete |
| PAGE-02 | Phase 18 | Complete |
| PAGE-03 | Phase 18 | Complete |
| STORE-01 | Phase 19 | Pending |
| STORE-02 | Phase 19 | Pending |
| STORE-03 | Phase 19 | Pending |
| COMP-01 | Phase 19 | Pending |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-06*
*Last updated: 2026-03-06 after initial definition*

# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** - Phases 3-6 (shipped 2026-03-05)
- 🚧 **v1.2 Double-Fetch Cleanup** - Phases 7-8 (in progress)

## Phases

<details>
<summary>✅ v1.1 Dashboard Technical Debt Reduction (Phases 3-6) - SHIPPED 2026-03-05</summary>

Phases 3-6 completed in v1.1: double-fetch + pagination isolation, Sentry/dead-code cleanup,
AdsTable generic component, canonical domain types + typeCheck, Strapi aggregate endpoints.
Archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

### 🚧 v1.2 Double-Fetch Cleanup (In Progress)

**Milestone Goal:** Eliminar `onMounted` redundante de todos los componentes non-ads del dashboard que ya tienen `watch({ immediate: true })` como único trigger de carga de datos, aplicando el patrón establecido en v1.1 con AdsTable.

- [x] **Phase 7: Catalog Components** - Remove redundant `onMounted` from 6 catalog/management components (completed 2026-03-05)
- [ ] **Phase 8: Transactional Components** - Remove redundant `onMounted` from 4 reservations/featured components

## Phase Details

### Phase 7: Catalog Components
**Goal**: Los componentes de gestión de catálogo no ejecutan fetch doble al montar
**Depends on**: Nothing (first v1.2 phase; v1.1 established the pattern)
**Requirements**: DFX-01, DFX-02, DFX-03, DFX-04, DFX-05, DFX-06
**Success Criteria** (what must be TRUE):
  1. `PacksDefault.vue` carga datos exactamente una vez al montar (solo via `watch({ immediate: true })`, sin `onMounted` redundante)
  2. `UsersDefault.vue`, `RegionsDefault.vue`, `FaqsDefault.vue`, `CommunesDefault.vue`, `ConditionsDefault.vue` tienen el mismo comportamiento: un único fetch al renderizar
  3. Ninguno de los 6 componentes dispara una segunda llamada de red al refrescar filtros o paginación por primera vez
  4. La build del dashboard pasa `typeCheck: true` sin errores nuevos introducidos por estos cambios
**Plans**: 1 plan

Plans:
- [ ] 07-01-PLAN.md — Remove onMounted + fix searchParams types in all 6 catalog components; verify build

### Phase 8: Transactional Components
**Goal**: Los componentes de reservas y destacados no ejecutan fetch doble al montar
**Depends on**: Phase 7
**Requirements**: DFX-07, DFX-08, DFX-09, DFX-10
**Success Criteria** (what must be TRUE):
  1. `ReservationsFree.vue` y `ReservationsUsed.vue` cargan datos exactamente una vez al montar
  2. `FeaturedFree.vue` y `FeaturedUsed.vue` cargan datos exactamente una vez al montar
  3. El comportamiento visible desde el dashboard (listados, filtros, paginación) no cambia respecto al estado anterior
  4. La build del dashboard pasa `typeCheck: true` sin errores nuevos
**Plans**: 1 plan

Plans:
- [ ] 08-01-PLAN.md — Remove onMounted + fix searchParams types in all 4 transactional components; verify build

## Progress

**Execution Order:** 7 → 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 7. Catalog Components | 1/1 | Complete   | 2026-03-05 | - |
| 8. Transactional Components | v1.2 | 0/1 | Not started | - |

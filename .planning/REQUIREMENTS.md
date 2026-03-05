# Requirements: Waldo Project

**Defined:** 2026-03-05
**Milestone:** v1.2 Double-Fetch Cleanup
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.2 Requirements

### Double-Fetch Elimination

- [x] **DFX-01**: `PacksDefault.vue` no ejecuta fetch doble al montar (solo `watch({ immediate: true })`)
- [x] **DFX-02**: `UsersDefault.vue` no ejecuta fetch doble al montar
- [x] **DFX-03**: `RegionsDefault.vue` no ejecuta fetch doble al montar
- [x] **DFX-04**: `FaqsDefault.vue` no ejecuta fetch doble al montar
- [x] **DFX-05**: `CommunesDefault.vue` no ejecuta fetch doble al montar
- [x] **DFX-06**: `ConditionsDefault.vue` no ejecuta fetch doble al montar
- [ ] **DFX-07**: `ReservationsFree.vue` no ejecuta fetch doble al montar
- [ ] **DFX-08**: `ReservationsUsed.vue` no ejecuta fetch doble al montar
- [ ] **DFX-09**: `FeaturedFree.vue` no ejecuta fetch doble al montar
- [ ] **DFX-10**: `FeaturedUsed.vue` no ejecuta fetch doble al montar

## Future Requirements

### Testing (milestone dedicado posterior)

- **TEST-01**: Composables (`useRut`, `useSanitize`, `useSlugify`, `useImageProxy`) tienen tests unitarios con Vitest
- **TEST-02**: El componente `AdsTable.vue` tiene tests de comportamiento (renderizado, filtros, paginación)
- **TEST-03**: Los middlewares `guard.global.ts` y `dev.global.ts` tienen tests de integración
- **TEST-04**: Cobertura mínima configurada (>70% en composables y stores)

### Additional Consolidation

- **COMP-05**: Consolidar Reservations*/Featured* una vez que tengan store keys dedicados y estrategias de fetch alineadas
- **COMP-06**: `ChartSales.vue` soporta filtros por rango de fechas usando el endpoint de agregación

## Out of Scope

| Feature | Reason |
|---------|--------|
| UI para elegir pasarela de pago | No requerido, usuarios pagan transparentemente |
| Segunda pasarela de pago concreta | Solo abstracción en v1.0 |
| i18n | Deferido conscientemente |
| Tests unitarios | Milestone dedicado posterior |
| Consolidación Reservations*/Featured* | Requiere análisis adicional de store keys |
| ChartSales filtro por fechas | Fuera del alcance de este hito |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DFX-01 | Phase 7 | Complete |
| DFX-02 | Phase 7 | Complete |
| DFX-03 | Phase 7 | Complete |
| DFX-04 | Phase 7 | Complete |
| DFX-05 | Phase 7 | Complete |
| DFX-06 | Phase 7 | Complete |
| DFX-07 | Phase 8 | Pending |
| DFX-08 | Phase 8 | Pending |
| DFX-09 | Phase 8 | Pending |
| DFX-10 | Phase 8 | Pending |

**Coverage:**
- v1.2 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after roadmap creation*

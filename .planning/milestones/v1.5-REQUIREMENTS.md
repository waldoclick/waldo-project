# Requirements: Waldo Project

**Defined:** 2026-03-06
**Milestone:** v1.5 Ad Credit Refund
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.5 Requirements

### Credit Refund

- [x] **REFUND-01**: Al rechazar un aviso, si tiene `ad_reservation` asociada, se setea `ad_reservation.ad = null` (crédito de aviso devuelto)
- [x] **REFUND-02**: Al rechazar un aviso, si tiene `ad_featured_reservation` asociada, se setea `ad_featured_reservation.ad = null` (crédito de destacado devuelto)
- [x] **REFUND-03**: Al banear un aviso, si tiene `ad_reservation` asociada, se setea `ad_reservation.ad = null` (crédito de aviso devuelto)
- [x] **REFUND-04**: Al banear un aviso, si tiene `ad_featured_reservation` asociada, se setea `ad_featured_reservation.ad = null` (crédito de destacado devuelto)

### Email Notification

- [x] **EMAIL-01**: El email de rechazo incluye mensaje indicando que el crédito de aviso fue devuelto (condicional: solo si el aviso tenía `ad_reservation`)
- [x] **EMAIL-02**: El email de rechazo incluye mensaje indicando que el crédito de destacado fue devuelto (condicional: solo si el aviso tenía `ad_featured_reservation`)
- [x] **EMAIL-03**: El email de baneo incluye mensaje indicando que el crédito de aviso fue devuelto (condicional: solo si el aviso tenía `ad_reservation`)
- [x] **EMAIL-04**: El email de baneo incluye mensaje indicando que el crédito de destacado fue devuelto (condicional: solo si el aviso tenía `ad_featured_reservation`)

## Future Requirements

### Testing

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
| Devolver créditos al expirar un aviso pagado | El cron ya maneja expiración de avisos gratuitos; avisos pagados tienen lógica distinta — fuera de scope |
| UI en el dashboard para confirmar devolución | El dashboard solo llama el endpoint; la lógica vive íntegramente en Strapi |
| Testing milestone (composables, AdsTable, middlewares) | Deferred — próximo milestone dedicado |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REFUND-01 | Phase 16 | Complete |
| REFUND-02 | Phase 16 | Complete |
| REFUND-03 | Phase 16 | Complete |
| REFUND-04 | Phase 16 | Complete |
| EMAIL-01 | Phase 17 | Complete |
| EMAIL-02 | Phase 17 | Complete |
| EMAIL-03 | Phase 17 | Complete |
| EMAIL-04 | Phase 17 | Complete |

**Coverage:**
- v1.5 requirements: 8 total
- Mapped to phases: 8 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-06*
*Last updated: 2026-03-06 after initial definition*

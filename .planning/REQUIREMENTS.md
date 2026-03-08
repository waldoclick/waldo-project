# Requirements: Waldo Project — v1.21 Ad Draft Decoupling

**Defined:** 2026-03-08
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.21 Requirements

### Schema

- [x] **SCHEMA-01**: El modelo `ad` tiene un campo `draft: boolean` con `default: true`

### Backend

- [x] **BACK-01**: Existe el endpoint `POST /api/payments/ad-draft` que persiste el aviso como borrador (`draft: true`) sin validar créditos ni iniciar pago
- [x] **BACK-02**: Si el aviso ya tiene `ad_id` (re-envío), el endpoint actualiza el borrador existente en lugar de crear uno nuevo
- [x] **BACK-03**: `computeAdStatus()` evalúa `draft: true` primero — retorna `"draft"` antes de evaluar cualquier otro estado (incluyendo `abandoned`)
- [x] **BACK-04**: El estado `abandoned` deja de existir como estado separado — los avisos que hoy son `abandoned` pasan a ser `draft`
- [x] **BACK-05**: Los filtros de admin que hoy listan `abandonedAds` pasan a listar `draftAds`
- [x] **BACK-06**: Migración: los avisos existentes con condición de `abandoned` (`active=false`, `ad_reservation=null`) reciben `draft: true` vía seeder o cron

### Frontend

- [ ] **FRONT-01**: Al presionar "Pagar/Confirmar" en `/anunciar/resumen`, se llama primero `POST /api/payments/ad-draft` y el `ad_id` retornado se guarda en `adStore`
- [ ] **FRONT-02**: Si `adStore.ad.ad_id` ya existe, el endpoint recibe el `ad_id` para actualizar el borrador (no crear uno nuevo)
- [ ] **FRONT-03**: El flujo de pago existente (Transbank y gratuito) continúa con el `ad_id` del borrador ya guardado

### Dashboard

- [ ] **DASH-01**: La sección que hoy muestra "Abandonados" pasa a mostrar "Borradores" (label y filtro de estado)

## Future Requirements

### Checkout (siguiente milestone)

- **CHKT-01**: Vista `/checkout` que permite al usuario elegir pack, destacado o comprar pack desde un aviso borrador
- **CHKT-02**: Al confirmar pago en checkout, el aviso pasa de `draft: true` a `draft: false`
- **CHKT-03**: El usuario puede ver sus borradores en `/cuenta/mis-anuncios` con estado "Borrador"

## Out of Scope

| Feature | Reason |
|---------|--------|
| Vista de borradores en cuenta del usuario | Fase posterior — depende del checkout |
| Quitar `draft: false` al confirmar pago Transbank | Fase posterior — parte del nuevo checkout |
| Flujo de avisos gratuitos (`pack=free`) | No se toca — flujo libre intacto |
| UI de `/anunciar/resumen` | No cambia visualmente en esta fase |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHEMA-01 | Phase 52 | Complete |
| BACK-01 | Phase 52 | Complete |
| BACK-02 | Phase 52 | Complete |
| BACK-03 | Phase 52 | Complete |
| BACK-04 | Phase 52 | Complete |
| BACK-05 | Phase 52 | Complete |
| BACK-06 | Phase 52 | Complete |
| FRONT-01 | Phase 52 | Pending |
| FRONT-02 | Phase 52 | Pending |
| FRONT-03 | Phase 52 | Pending |
| DASH-01 | Phase 52 | Pending |

**Coverage:**
- v1.21 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after initial definition*

# Requirements: v1.23 Unified Payment Flow

## v1 Requirements

### Pack Purchase Flow
- [x] **PACK-01**: User can purchase a pack from `/packs` without going through `/packs/comprar`
- [x] **PACK-02**: Clicking "Comprar" on `/packs` writes the selected pack to `adStore` and navigates directly to `/pagar`
- [x] **PACK-03**: `/packs/comprar` page is removed from the codebase

### Payment Hub
- [ ] **PAY-01**: `/pagar` processes payment when only a pack is selected (no `adStore.ad.ad_id`)
- [ ] **PAY-02**: `/pagar` processes payment when both a pack and an ad are present (`adStore.ad.ad_id` set)
- [ ] **PAY-03**: `FormCheckout` does not show free/paid reservation options when arriving from `/packs` (pack-only flow)
- [x] **PAY-04**: `packs.store.ts` is eliminated — pack data loaded directly where needed

### Cleanup
- [x] **CLN-01**: `BuyPack.vue` is removed or replaced with the new flow
- [x] **CLN-02**: All imports and references to `packs.store.ts` are removed from the codebase

## Future Requirements

None identified for this milestone.

## Out of Scope

- **Featured standalone purchase** — buying a featured slot without an ad is not in scope for this milestone
- **Multiple packs in a single payment** — cart with multiple items deferred
- **Strapi payment endpoint changes** — backend payment logic for pack-only flow may need adjustment, but endpoint signature changes are out of scope unless strictly required

## Traceability

| REQ-ID  | Phase | Status  |
|---------|-------|---------|
| PACK-01 | 56    | Complete |
| PACK-02 | 56    | Complete |
| PACK-03 | 56    | Complete |
| PAY-01  | 57    | Pending |
| PAY-02  | 57    | Pending |
| PAY-03  | 57    | Pending |
| PAY-04  | 55    | Complete |
| CLN-01  | 56    | Complete |
| CLN-02  | 55    | Complete |

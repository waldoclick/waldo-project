# Requirements: v1.23 Unified Payment Flow

## v1 Requirements

### Pack Purchase Flow
- [ ] **PACK-01**: User can purchase a pack from `/packs` without going through `/packs/comprar`
- [ ] **PACK-02**: Clicking "Comprar" on `/packs` writes the selected pack to `adStore` and navigates directly to `/pagar`
- [ ] **PACK-03**: `/packs/comprar` page is removed from the codebase

### Payment Hub
- [ ] **PAY-01**: `/pagar` processes payment when only a pack is selected (no `adStore.ad.ad_id`)
- [ ] **PAY-02**: `/pagar` processes payment when both a pack and an ad are present (`adStore.ad.ad_id` set)
- [ ] **PAY-03**: `FormCheckout` does not show free/paid reservation options when arriving from `/packs` (pack-only flow)
- [ ] **PAY-04**: `packs.store.ts` is eliminated — pack data loaded directly where needed

### Cleanup
- [ ] **CLN-01**: `BuyPack.vue` is removed or replaced with the new flow
- [ ] **CLN-02**: All imports and references to `packs.store.ts` are removed from the codebase

## Future Requirements

None identified for this milestone.

## Out of Scope

- **Featured standalone purchase** — buying a featured slot without an ad is not in scope for this milestone
- **Multiple packs in a single payment** — cart with multiple items deferred
- **Strapi payment endpoint changes** — backend payment logic for pack-only flow may need adjustment, but endpoint signature changes are out of scope unless strictly required

## Traceability

| REQ-ID  | Phase | Status  |
|---------|-------|---------|
| PACK-01 | —     | Pending |
| PACK-02 | —     | Pending |
| PACK-03 | —     | Pending |
| PAY-01  | —     | Pending |
| PAY-02  | —     | Pending |
| PAY-03  | —     | Pending |
| PAY-04  | —     | Pending |
| CLN-01  | —     | Pending |
| CLN-02  | —     | Pending |

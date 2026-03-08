# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- ✅ **v1.3 Utility Extraction** — Phases 9-11 (shipped 2026-03-06)
- ✅ **v1.4 URL Localization** — Phases 12-15 (shipped 2026-03-06)
- ✅ **v1.5 Ad Credit Refund** — Phases 16-17 (shipped 2026-03-06)
- ✅ **v1.6 Website API Optimization** — Phases 18-19 (shipped 2026-03-06)
- ✅ **v1.7 Cron Reliability** — Phases 20-23 (shipped 2026-03-06)
- ✅ **v1.8 Free Featured Reservation Guarantee** — Phase 24 (shipped 2026-03-07)
- ✅ **v1.9 Website Technical Debt** — Phases 25-29 (shipped 2026-03-07)
- ✅ **v1.10 Dashboard Orders Dropdown UI** — Phase 30 (shipped 2026-03-07)
- ✅ **v1.11 GTM / GA4 Tracking Fix** — Phase 31 (shipped 2026-03-07)
- ✅ **v1.12 Ad Creation Analytics Gaps** — Phase 32 (shipped 2026-03-07)
- ✅ **v1.13 GTM Module Migration** — Phase 33 (shipped 2026-03-07)
- ✅ **v1.14 GTM Module: Dashboard** — Phase 34 (shipped 2026-03-07)
- ✅ **v1.15 Website SEO Audit** — Phase 35 (shipped 2026-03-07)
- ✅ **v1.16 Website Meta Copy Audit** — Phases 36-38 (shipped 2026-03-07)
- ✅ **v1.17 Security & Stability** — Phases 40-41 (shipped 2026-03-07)
- ✅ **v1.18 Ad Creation URL Refactor** — Phase 42 (shipped 2026-03-08)
- ✅ **v1.19 Zoho CRM Sync Model** — Phases 43-46 (shipped 2026-03-08)
- ✅ **v1.20 TypeScript any Elimination** — Phases 47-51 (shipped 2026-03-08)
- ✅ **v1.21 Ad Draft Decoupling** — Phase 52 (shipped 2026-03-08)
- ✅ **v1.22 Checkout Flow UI** — Phase 53 (shipped 2026-03-08)
- 🚧 **v1.23 Unified Payment Flow** — Phases 55-57 (in progress)

## Phases

<details>
<summary>✅ v1.1–v1.21 (Phases 3-52) — SHIPPED</summary>

All prior phases shipped. See `.planning/milestones/` for archived roadmaps.

</details>

<details>
<summary>✅ v1.22 — Checkout Flow UI (Phase 53) — SHIPPED 2026-03-08</summary>

- [x] **Phase 53: Checkout Page & Components** — `pages/pagar/index.vue` con auth middleware; `PaymentAd.vue` (preview aviso); `PaymentGateway.vue` (WebPay decorativo); `CheckoutDefault.vue` con lógica de pago completa; `FormCheckout.vue` reestructurado con títulos por sección, textos de contexto, `lang="ts"`, dead code eliminado; `BarCheckout.vue`; SCSS para `payment--ad` y `payment--gateway` (completed 2026-03-08)

</details>

### v1.23 — Unified Payment Flow

- [x] **Phase 55: Store Unification** — Eliminate `packs.store.ts`; pack data loaded directly in components that need it; all `packs.store` imports removed
- [ ] **Phase 56: Pack Purchase Flow** — `/packs` "Comprar" writes to `adStore` and navigates to `/pagar`; `/packs/comprar` page and `BuyPack.vue` removed
- [ ] **Phase 57: Payment Hub Adaptation** — `/pagar` handles pack-only (no `ad_id`) and pack+ad flows; `FormCheckout` hides reservation options in pack-only context

## Phase Details

### Phase 55: Store Unification
**Goal**: Pack data lives in `adStore` — `packs.store.ts` is gone and nothing misses it
**Depends on**: Phase 53 (checkout flow established)
**Requirements**: PAY-04, CLN-02
**Success Criteria** (what must be TRUE):
  1. `packs.store.ts` file does not exist in the codebase
  2. `packs/index.vue` loads pack data directly (e.g. via `useAsyncData` + Strapi call) without importing `packs.store`
  3. `PaymentMethod.vue` (inside `FormCheckout`) loads or receives pack data without importing `packs.store`
  4. `nuxt typecheck` passes with zero errors after store removal
**Plans**: 3 plans
Plans:
- [ ] 055-01-PLAN.md — Create usePacksList composable + migrate components and composables
- [ ] 055-02-PLAN.md — Migrate pages to direct Strapi calls
- [ ] 055-03-PLAN.md — Delete packs.store.ts and verify typecheck

### Phase 56: Pack Purchase Flow
**Goal**: Clicking "Comprar" on `/packs` takes the user directly to `/pagar` — no intermediate page
**Depends on**: Phase 55
**Requirements**: PACK-01, PACK-02, PACK-03, CLN-01
**Success Criteria** (what must be TRUE):
  1. User on `/packs` clicks "Comprar" on any pack and is immediately redirected to `/pagar`
  2. The selected pack is reflected in the checkout UI at `/pagar` (user sees what they're buying)
  3. `/packs/comprar` returns 404 — the route no longer exists
  4. `BuyPack.vue` file does not exist in the codebase
**Plans**: TBD

### Phase 57: Payment Hub Adaptation
**Goal**: `/pagar` correctly processes payment whether or not an ad is associated — pack-only purchase works end-to-end
**Depends on**: Phase 56
**Requirements**: PAY-01, PAY-02, PAY-03
**Success Criteria** (what must be TRUE):
  1. User arriving at `/pagar` from `/packs` (no `adStore.ad.ad_id`) can complete a pack purchase successfully
  2. User arriving at `/pagar` from `resumen.vue` (with `adStore.ad.ad_id`) can complete an ad+pack purchase successfully (existing flow unbroken)
  3. `FormCheckout` does not show free/paid ad reservation options when `adStore.ad.ad_id` is absent
  4. Both payment paths (pack-only and pack+ad) call `publishAd()` only when an ad draft is present
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 3-34 | v1.1–v1.14 | All | Complete | 2026-03-05 to 2026-03-07 |
| 35. Website SEO Audit | v1.15 | 3/3 | Complete | 2026-03-07 |
| 36. SEO Bug Fixes | v1.16 | 1/1 | Complete | 2026-03-07 |
| 37. Dynamic Page Copy | v1.16 | 1/1 | Complete | 2026-03-07 |
| 38. Static Page Copy | v1.16 | 2/2 | Complete | 2026-03-07 |
| 40. Users Filter Authenticated | v1.17 | 2/2 | Complete | 2026-03-07 |
| 41. Sentry Production-Only | v1.17 | 1/1 | Complete | 2026-03-07 |
| 42. Ad Creation URL Refactor | v1.18 | 3/3 | Complete | 2026-03-08 |
| 43. Zoho Service Reliability | v1.19 | 2/2 | Complete | 2026-03-08 |
| 44. Zoho Service Layer | v1.19 | 2/2 | Complete | 2026-03-08 |
| 45. Payment Event Wiring | v1.19 | 2/2 | Complete | 2026-03-08 |
| 46. Ad Published Event Wiring | v1.19 | 1/1 | Complete | 2026-03-08 |
| 47. Ad API any Elimination | v1.20 | 1/1 | Complete | 2026-03-08 |
| 48. Type Files + Flow Service any Elimination | v1.20 | 1/1 | Complete | 2026-03-08 |
| 49. Zoho + Facto + Other Services any Elimination | v1.20 | 1/1 | Complete | 2026-03-08 |
| 50. Payment Utils + Middlewares any Elimination | v1.20 | 1/1 | Complete | 2026-03-08 |
| 51. Seeders + Test Files any Elimination | v1.20 | 1/1 | Complete | 2026-03-08 |
| 52. Ad Draft Decoupling | v1.21 | 4/4 | Complete | 2026-03-08 |
| 53. Checkout Page & Components | v1.22 | 1/1 | Complete | 2026-03-08 |
| 55. Store Unification | 1/3 | In Progress|  | — |
| 56. Pack Purchase Flow | v1.23 | 0/1 | Not started | — |
| 57. Payment Hub Adaptation | v1.23 | 0/1 | Not started | — |

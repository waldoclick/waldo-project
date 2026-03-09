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
- ✅ **v1.23 Unified Payment Flow** — Phases 55-57 (shipped 2026-03-08)
- ✅ **v1.24 Free Ad Submission** — Phases 58-59 (shipped 2026-03-09)
- 🔄 **v1.25 Unified Checkout** — Phases 60-61 (in progress)

## Phases

<details>
<summary>✅ v1.1–v1.21 (Phases 3-52) — SHIPPED</summary>

All prior phases shipped. See `.planning/milestones/` for archived roadmaps.

</details>

<details>
<summary>✅ v1.22 — Checkout Flow UI (Phase 53) — SHIPPED 2026-03-08</summary>

- [x] **Phase 53: Checkout Page & Components** — `pages/pagar/index.vue` con auth middleware; `PaymentAd.vue` (preview aviso); `PaymentGateway.vue` (WebPay decorativo); `CheckoutDefault.vue` con lógica de pago completa; `FormCheckout.vue` reestructurado con títulos por sección, textos de contexto, `lang="ts"`, dead code eliminado; `BarCheckout.vue`; SCSS para `payment--ad` y `payment--gateway` (completed 2026-03-08)

</details>

<details>
<summary>✅ v1.23 — Unified Payment Flow (Phases 55-57) — SHIPPED 2026-03-08</summary>

- [x] **Phase 55: Store Unification** — Eliminate `packs.store.ts`; pack data loaded directly in components that need it; all `packs.store` imports removed
- [x] **Phase 56: Pack Purchase Flow** — `/packs` "Comprar" writes to `adStore` and navigates to `/pagar`; `/packs/comprar` page and `BuyPack.vue` removed (completed 2026-03-08)
- [x] **Phase 57: Payment Hub Adaptation** — `/pagar` handles pack-only (no `ad_id`) and pack+ad flows; `FormCheckout` hides reservation options in pack-only context (completed 2026-03-08)

</details>

<details>
<summary>✅ v1.24 — Free Ad Submission (Phases 58-59) — SHIPPED 2026-03-09</summary>

- [x] **Phase 58: Free Ad Endpoint** — `POST /api/payments/free-ad` in Strapi: validates free credit (`pack="free"` uses free reservation, `pack="paid"` uses purchased reservation), links ad-reservation, sets `draft: false`, sends user confirmation + admin alert emails; new `free-ad.service.ts` + route + controller method; `ad.service.ts` untouched (completed 2026-03-08)
- [x] **Phase 59: Frontend Wiring + Deploy** — `handleFreeCreation()` in `resumen.vue` rewritten: `POST ads/save-draft` (get `ad_id`) → `adStore.updateAdId()` → `POST payments/free-ad` with `{ ad_id, pack }`; old `payments/ad` reference removed; `nuxt typecheck` exits 0 (completed 2026-03-09)

</details>

<details>
<summary>🔄 v1.25 — Unified Checkout (Phases 60-61) — IN PROGRESS</summary>

- [ ] **Phase 60: Unified Checkout Endpoint** — `POST /api/payments/checkout` + `GET /api/payments/webpay` in Strapi; new `checkout.service.ts`; `recaptcha.ts` updated; `tsc --noEmit` exits 0
- [ ] **Phase 61: Frontend Migration** — `CheckoutDefault.vue` uses `payments/checkout` for both branches; `nuxt typecheck` exits 0

</details>

## Phase Details

<details>
<summary>✅ v1.23 Phase Details — SHIPPED</summary>

### Phase 55: Store Unification
**Goal**: Pack data lives in `adStore` — `packs.store.ts` is gone and nothing misses it
**Status**: Complete (2026-03-08)

### Phase 56: Pack Purchase Flow
**Goal**: Clicking "Comprar" on `/packs` takes the user directly to `/pagar` — no intermediate page
**Status**: Complete (2026-03-08)

### Phase 57: Payment Hub Adaptation
**Goal**: `/pagar` correctly processes payment whether or not an ad is associated — pack-only purchase works end-to-end
**Status**: Complete (2026-03-08)

</details>

<details>
<summary>✅ v1.24 Phase Details — SHIPPED 2026-03-09</summary>

### Phase 58: Free Ad Endpoint
**Goal**: A dedicated `POST /api/payments/free-ad` endpoint exists in Strapi that fully processes a free ad submission — validating credit, linking reservation, publishing, and notifying — without touching existing code
**Status**: Complete (2026-03-08)

### Phase 59: Frontend Wiring + Deploy
**Goal**: `resumen.vue` free path calls `save-draft` then `payments/free-ad`, the new endpoint is permissioned in Strapi admin, and `nuxt typecheck` passes with zero errors
**Status**: Complete (2026-03-09)

</details>

<details>
<summary>🔄 v1.25 Phase Details — IN PROGRESS</summary>

### Phase 60: Unified Checkout Endpoint
**Goal**: `POST /api/payments/checkout` and `GET /api/payments/webpay` exist in Strapi, backed by `checkout.service.ts`, covering all three purchase cases (pack-only, pack+ad, pack+featured+ad); `recaptcha.ts` updated; `tsc --noEmit` exits 0; zero `any` in new service
**Requirements**: CHK-01, CHK-02, CHK-03, CHK-04, CHK-05, CHK-07
**Status**: Pending

### Phase 61: Frontend Migration
**Goal**: `CheckoutDefault.vue` calls `POST payments/checkout` for both pack-only and pack+ad branches; old `payments/pack` and `payments/ad` calls removed; `nuxt typecheck` exits 0
**Requirements**: CHK-06, CHK-08
**Status**: Pending

</details>

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
| 55. Store Unification | v1.23 | 3/3 | Complete | 2026-03-08 |
| 56. Pack Purchase Flow | v1.23 | 1/1 | Complete | 2026-03-08 |
| 57. Payment Hub Adaptation | v1.23 | 1/1 | Complete | 2026-03-08 |
| 58. Free Ad Endpoint | v1.24 | 1/1 | Complete | 2026-03-08 |
| 59. Frontend Wiring + Deploy | v1.24 | 1/1 | Complete | 2026-03-09 |
| 60. Unified Checkout Endpoint | v1.25 | 0/1 | Pending | — |
| 61. Frontend Migration | v1.25 | 0/1 | Pending | — |

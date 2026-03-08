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
- 🔄 **v1.20 TypeScript any Elimination** — Phases 47-51 (in progress)

## Phases

<details>
<summary>✅ v1.1–v1.16 (Phases 3-38) — SHIPPED</summary>

All prior phases shipped. See `.planning/milestones/` for archived roadmaps.

</details>

<details>
<summary>✅ v1.17 — Security & Stability (Phases 40-41) — SHIPPED 2026-03-07</summary>

- [x] **Phase 40: Users Filter Authenticated** — Server-enforced Authenticated role filter via strapi.db.query; N+1 eliminated; TDD (completed 2026-03-07)
- [x] **Phase 41: Sentry Production-Only** — Production-only guard in all 7 Sentry entry points across website, dashboard, strapi (completed 2026-03-07)

</details>

<details>
<summary>✅ v1.18 — Ad Creation URL Refactor (Phase 42) — SHIPPED 2026-03-08</summary>

- [x] **Phase 42: Ad Creation URL Refactor** — Replace `?step=N` query-param navigation with dedicated per-step Spanish routes; wizard-guard middleware added; analytics preserved; `nuxt typecheck` passes with zero errors (completed 2026-03-08)

</details>

<details>
<summary>✅ v1.19 — Zoho CRM Sync Model (Phases 43-46) — SHIPPED 2026-03-08</summary>

- [x] **Phase 43: Zoho Service Reliability** — Fix token refresh (401 interceptor), fix auth header prefix (`Zoho-oauthtoken`), isolate tests with axios-mock-adapter, add env vars to .env.example (completed 2026-03-08)
- [x] **Phase 44: Zoho Service Layer** — `createDeal()`, `updateContactStats()`, `createLead()` (Lead_Status: New), `createContact()` (counters init to 0) (completed 2026-03-08)
- [x] **Phase 45: Payment Event Wiring** — `pack_purchased` → Deal + Contact stats (await); `ad_paid` → Deal + Contact stats (floating promise) (completed 2026-03-08)
- [x] **Phase 46: Ad Published Event Wiring** — `approveAd()` → `Ads_Published__c` + `Last_Ad_Posted_At__c`; first-publish guard prevents double-counting (completed 2026-03-08)

</details>

<details>
<summary>🔄 v1.20 — TypeScript any Elimination (Phases 47-51) — IN PROGRESS</summary>

- [ ] **Phase 47: Ad API any Elimination** — Replace all `any` in `ad.ts` service + controller: `options: any`, `computeAdStatus(ad: any)`, `transformSortParameter`, `ctx: any` → `Context`, filters + sort + populate locals
- [ ] **Phase 48: Type Files + Flow Service any Elimination** — Replace `any` in `order.types.ts`, `filter.types.ts`, `flow.factory.ts`, `flow.types.ts`, `flow.service.ts`
- [ ] **Phase 49: Zoho + Facto + Other Services any Elimination** — Replace `any` in Zoho service/interfaces/http-client, Facto factory/SOAP/config, Indicador, Google, Transbank, payment-gateway
- [ ] **Phase 50: Payment Utils + Middlewares any Elimination** — Replace `any` in `payment.type.ts`, order/user/ad/general utils, `payment.ts` controller, `image-uploader.ts`, `cache.ts`, `user-registration.ts`
- [ ] **Phase 51: Seeders + Test Files any Elimination** — Replace `strapi: any` in all 5 seeders; replace `as any` casts in 4 test files

</details>

## Phase Details

### Phase 47: Ad API any Elimination
**Goal**: The ad.ts service and controller are free of `any` types — all parameters and return values use `Context`, typed interfaces, or `unknown` with narrowing
**Depends on**: Nothing (first v1.20 phase)
**Requirements**: TSANY-01, TSANY-02, TSANY-03, TSANY-04, TSANY-05, TSANY-06, TSANY-07
**Success Criteria** (what must be TRUE):
  1. `tsc --noEmit` (or `strapi ts:generate-types`) reports zero `any`-related errors in `ad.ts` service
  2. `ctx` params in ad controller accept `Context` from `@strapi/strapi` — IDE shows proper type autocomplete on `ctx.request`, `ctx.response`, `ctx.state`
  3. `computeAdStatus` and `transformSortParameter` accept `unknown` and use type narrowing — no runtime behavior changes
  4. `options`, `filterClause`, `filters`, `sort`, `populate` locals in ad service + controller carry typed or `unknown` signatures, not bare `any`
**Plans**: TBD

### Phase 48: Type Files + Flow Service any Elimination
**Goal**: Shared type definition files and the Flow payment service layer carry no `any` — all data shapes are expressed as `unknown`, stub interfaces, or proper imports
**Depends on**: Phase 47
**Requirements**: TSANY-08, TSANY-09, TSANY-10, TSANY-11, TSANY-12
**Success Criteria** (what must be TRUE):
  1. `order.types.ts` has no `any` — `payment_response`, `document_details`, `filters`, `sort`, `populate` are `unknown`
  2. `filter.types.ts` filter operator fields (`$eq`, `$ne`, `$lt`, `$lte`, `$gt`, `$gte`, `$in`, `$nin`, `$contains`, etc.) and `icon` are `unknown`, not `any`
  3. `flow.factory.ts` does not contain `type Strapi = any` — uses `Core.Strapi` import or `unknown`
  4. `flow.types.ts` discount, invoices, items, chargeAttempts fields are typed as `unknown` or stub interfaces
  5. `flow.service.ts` message extraction uses proper narrowing — no `(x as any).message` casts remain
**Plans**: TBD

### Phase 49: Zoho + Facto + Other Services any Elimination
**Goal**: All third-party integration services (Zoho CRM, Facto electronic documents, Indicador, Google Sheets, Transbank, payment gateway) are free of `any` in their public interfaces and internal implementations
**Depends on**: Phase 47
**Requirements**: TSANY-13, TSANY-14, TSANY-15, TSANY-16, TSANY-17, TSANY-18, TSANY-19, TSANY-20, TSANY-21, TSANY-22, TSANY-23
**Success Criteria** (what must be TRUE):
  1. Zoho service (`zoho.service.ts`) and interfaces (`zoho/interfaces.ts`) return `Promise<unknown>` / `Promise<unknown[]>` — no `Promise<any>` remains
  2. Zoho HTTP client (`http-client.ts`) `params` and `data` params are `unknown`, not `any`
  3. Facto files (`facto.factory.ts`, `facto.config.ts`, SOAP callbacks) have no `any` — `datos`, `client`, callback `err`/`result` params are `unknown` or properly typed
  4. `indicador.service.ts`, `google.types.ts`, `google-sheets.service.ts` have no `any` in their data parameters or return types
  5. Transbank types/service and `gateway.interface.ts` have no `any` in error/response fields — all use `unknown`
**Plans**: TBD

### Phase 50: Payment Utils + Middlewares any Elimination
**Goal**: All payment utility files, the payment controller, and all Strapi middlewares are free of `any` — data shapes use `unknown` with narrowing or typed interfaces
**Depends on**: Phase 48, Phase 49
**Requirements**: TSANY-24, TSANY-25, TSANY-26, TSANY-27, TSANY-28, TSANY-29, TSANY-30, TSANY-31, TSANY-32
**Success Criteria** (what must be TRUE):
  1. `payment.type.ts` has no `any` fields — `ad`, reservation fields, `[key: string]` index, `order` are typed or `unknown`
  2. All payment utils (`order.utils.ts`, `user.utils.ts`, `ad.utils.ts`, `general.utils.ts`) have no `any` params — all data-in/data-out params are `unknown` with narrowing
  3. `payment.ts` controller `errorHandler` accepts `unknown` (not `any`); all `(result as any)` casts replaced with typed access
  4. Middlewares `image-uploader.ts`, `cache.ts`, `user-registration.ts` have no `any` — `file`, operation return, index signatures, `strapi` params properly typed or `unknown`
**Plans**: TBD

### Phase 51: Seeders + Test Files any Elimination
**Goal**: All seeder files and test files are free of non-scaffolding `any` — seeders use the proper Strapi type for their parameter; test files access properties through typed interfaces
**Depends on**: Phase 50
**Requirements**: TSANY-33, TSANY-34, TSANY-35, TSANY-36
**Success Criteria** (what must be TRUE):
  1. All 5 seeder files (`categories.ts`, `packs.ts`, `regions.ts`, `faqs.ts`, `conditions.ts`) have `strapi: Core.Strapi` (or equivalent) — no `strapi: any` remains
  2. `pack.zoho.test.ts` accesses `global.strapi` through a typed mock interface — no `(global as any).strapi`; `result.success` is accessed through a typed return, not `(result as any).success`
  3. `pack.service.test.ts` and `ad.service.test.ts` use typed interfaces for awaited results — no `(await ...) as any` casts
  4. `payment.controller.test.ts` accesses `packResponse` via typed accessor and `body` stub is properly typed — no `as any` casts remain
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
| 47. Ad API any Elimination | v1.20 | 0/? | Not started | - |
| 48. Type Files + Flow Service any Elimination | v1.20 | 0/? | Not started | - |
| 49. Zoho + Facto + Other Services any Elimination | v1.20 | 0/? | Not started | - |
| 50. Payment Utils + Middlewares any Elimination | v1.20 | 0/? | Not started | - |
| 51. Seeders + Test Files any Elimination | v1.20 | 0/? | Not started | - |

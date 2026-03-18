# Roadmap: Waldo Project

## Milestones

- ⛔ **v1.25 Unified Checkout** — forcibly closed 2026-03-09. See `.planning/milestones/v1.25-ROADMAP.md`
- ✅ **v1.26 Mostrar comprobante Webpay** — Phase 060 (shipped 2026-03-11). See `.planning/milestones/v1.26-ROADMAP.md`
- ✅ **v1.27 Reparar eventos GA4 ecommerce** — Phase 061 (shipped 2026-03-12). See `.planning/milestones/v1.27-ROADMAP.md`
- ✅ **v1.28 Logout Store Cleanup** — Phase 062 (shipped 2026-03-12). See `.planning/milestones/v1.28-ROADMAP.md`
- ✅ **v1.29 News Manager** — Phases 063–064 (shipped 2026-03-12). See `.planning/milestones/v1.29-ROADMAP.md`
- ✅ **v1.30 Blog Public Views** — Phases 065–068 (shipped 2026-03-13). See `.planning/milestones/v1.30-ROADMAP.md`
- ✅ **v1.31 Article Manager Improvements** — Phases 069–070 (shipped 2026-03-13). See `.planning/milestones/v1.31-ROADMAP.md`
- ✅ **v1.32 Gemini AI Service** — Phase 071 (shipped 2026-03-13). See `.planning/milestones/v1.32-ROADMAP.md`
- ✅ **v1.33 Anthropic Claude AI Service** — Phase 072 (shipped 2026-03-13). See `.planning/milestones/v1.33-ROADMAP.md`
- ✅ **v1.34 LightBoxArticles** — Phases 073–074 (shipped 2026-03-13). See `.planning/milestones/v1.34-ROADMAP.md`
- ✅ **v1.35 Gift Reservations to Users** — Phases 075–076 (shipped 2026-03-13). See `.planning/milestones/v1.35-ROADMAP.md`
- ✅ **v1.36 Two-Step Login Verification** — Phases 077–078 (shipped 2026-03-14). See `.planning/milestones/v1.36-ROADMAP.md`
- ✅ **v1.37 Email Authentication Flows** — Phases 079–082 (shipped 2026-03-14). See `.planning/milestones/v1.37-ROADMAP.md`
- ✅ **v1.38 GA4 Analytics Audit & Implementation** — Phases 083–085 (shipped 2026-03-14). See `.planning/milestones/v1.38-ROADMAP.md`
- 📋 **v1.39 Unified API Client** — Phases 089–090 (planned)
- 🚧 **v1.40 Shared Authentication Session** — Phases 091–092 (in progress)

## Phases

### v1.40 Shared Authentication Session

- [x] **Phase 091: Dashboard useLogout Composable** — Centralize dashboard logout into a single composable; wire all call sites (completed 2026-03-16)
- [x] **Phase 092: Cookie Domain Migration** — Add COOKIE_DOMAIN-conditional domain attribute to both apps; ship old-cookie cleanup atomically (completed 2026-03-16)

### v1.39 Unified API Client

- [x] **Phase 089: GET Support in useApiClient** — Extend `useApiClient` to handle GET requests without reCAPTCHA injection (completed 2026-03-15)
- [x] **Phase 090: Migrate All GET Callers** — Migrate all stores, composables, pages and components from `strapi.find()/findOne()` to `useApiClient`; typeCheck passes (completed 2026-03-15)

<details>
<summary>✅ v1.38 GA4 Analytics Audit & Implementation (Phases 083–085) — SHIPPED 2026-03-14</summary>

- [x] Phase 083: Ecommerce Bug Fixes (2/2 plans) — completed 2026-03-14
- [x] Phase 084: Ad Discovery Tracking (2/2 plans) — completed 2026-03-14
- [x] Phase 085: Contact, Auth & Blog Events (2/2 plans) — completed 2026-03-14

</details>

## Phase Details

### Phase 091: Dashboard useLogout Composable
**Goal**: Dashboard logout is centralized in a single composable — every call site uses it, and the old-cookie cleanup can be applied in one place
**Depends on**: Nothing (first phase of milestone)
**Requirements**: SAFE-01
**Success Criteria** (what must be TRUE):
  1. `apps/dashboard/app/composables/useLogout.ts` exists and mirrors the website pattern (`strapiLogout()` + store resets)
  2. Every component and middleware that previously called `useStrapiAuth().logout()` directly now calls `useLogout()` instead — no scattered logout logic remains
  3. `typeCheck: true` passes with zero errors after the composable is wired in
**Plans**: 1 plan

Plans:
- [ ] 091-01-PLAN.md — Create useLogout composable + meStore.reset() + migrate 3 call sites

### Phase 092: Cookie Domain Migration
**Goal**: Users authenticated on one subdomain are automatically recognized on the other — login once, access both apps; logout anywhere clears both
**Depends on**: Phase 091
**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, SESS-06, SAFE-02, SAFE-03
**Success Criteria** (what must be TRUE):
  1. A manager who logs in on `waldo.click` can navigate directly to `dashboard.waldo.click` and land on the dashboard without being prompted to log in again
  2. A user who logs in on `dashboard.waldo.click` is recognized as authenticated when they visit `waldo.click` (their name/avatar loads)
  3. Clicking logout on the website causes the dashboard to show the login page on the next visit (session cleared on both subdomains)
  4. Clicking logout on the dashboard causes the website to show the logged-out state on the next visit (session cleared on both subdomains)
  5. Running both apps locally with no `COOKIE_DOMAIN` env var set produces a host-only cookie — local dev login works exactly as before
  6. `.env.example` in both `apps/website` and `apps/dashboard` documents the `COOKIE_DOMAIN` variable with the production value `.waldo.click`
**Plans**: 2 plans

Plans:
- [ ] 092-01-PLAN.md — Add COOKIE_DOMAIN conditional to both nuxt.config.ts + old-cookie cleanup in both useLogout composables
- [ ] 092-02-PLAN.md — Document COOKIE_DOMAIN in both .env.example files + human-verify checkpoint

---

### Phase 089: GET Support in useApiClient
**Goal**: `useApiClient` handles all HTTP methods — GET requests pass through cleanly without reCAPTCHA injection, unblocking caller migrations
**Depends on**: Nothing (first phase of milestone; v1.38 Phase 085 can run concurrently)
**Requirements**: API-05
**Success Criteria** (what must be TRUE):
  1. Calling `useApiClient('GET', '/api/filters')` returns the raw response body without adding an `X-Recaptcha-Token` header
  2. Calling `useApiClient('POST', '/api/ads')` still injects `X-Recaptcha-Token` (existing behaviour preserved)
  3. `typeCheck: true` passes with zero errors after the GET support change
  4. Existing Vitest tests for `useApiClient` (POST/PUT/DELETE paths) continue to pass unchanged
**Plans**: 1 plan

Plans:
- [ ] 089-01-PLAN.md — Add GET-with-params test, run full Vitest suite + typecheck gate

### Phase 090: Migrate All GET Callers
**Goal**: Every `strapi.find()` and `strapi.findOne()` call in `apps/website` is replaced by `useApiClient`; the Strapi SDK is no longer used for data fetching
**Depends on**: Phase 089
**Requirements**: API-01, API-02, API-03, API-04, API-06
**Success Criteria** (what must be TRUE):
  1. All 12 stores (`filter`, `regions`, `ads`, `communes`, `related`, `me`, `conditions`, `articles`, `indicator`, `faqs`, `user`, `categories`) fetch data via `useApiClient` — no `strapi.find()` or `strapi.findOne()` calls remain in any store file
  2. `useStrapi.ts`, `useOrderById.ts`, and `usePacksList.ts` composables fetch data via `useApiClient` — callers receive the raw response body (no `.data` wrapper)
  3. `index.vue`, `anunciar/gracias.vue`, `anunciar/index.vue`, `packs/index.vue`, and `FormProfile.vue` fetch data via `useApiClient` — no direct SDK calls remain in any page or component
  4. `typeCheck: true` runs with zero TypeScript errors after the full migration; `nuxt typecheck` exits 0
  5. The website loads and all pages render correctly in the browser — no runtime errors from response shape mismatches (`.data` wrapper removed at every migrated call site)
**Plans**: 6 plans

Plans:
- [ ] 090-01-PLAN.md — Migrate stores batch 1: filter, regions, communes, conditions, faqs
- [ ] 090-02-PLAN.md — Migrate stores batch 2: ads, related, articles, categories
- [ ] 090-03-PLAN.md — Migrate stores batch 3: me, user, indicator
- [ ] 090-04-PLAN.md — Migrate composables: useStrapi, useOrderById, usePacksList
- [ ] 090-05-PLAN.md — Migrate pages/components: index.vue, anunciar/gracias.vue, anunciar/index.vue, packs/index.vue, FormProfile.vue
- [ ] 090-06-PLAN.md — Final validation gate: grep + typecheck + browser smoke test

<details>
<summary>✅ v1.36 Two-Step Login Verification (Phases 077–078) — SHIPPED 2026-03-14</summary>

- [x] Phase 077: Strapi 2-Step Backend (4/4 plans) — completed 2026-03-13
- [x] Phase 078: Dashboard Verify Flow (2/2 plans) — completed 2026-03-14

</details>

<details>
<summary>✅ v1.35 Gift Reservations to Users (Phases 075–076) — SHIPPED 2026-03-13</summary>

- [x] Phase 075: Strapi Gift Endpoints (2/2 plans) — completed 2026-03-13
- [x] Phase 076: Dashboard Gift Lightbox (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.34 LightBoxArticles (Phases 073–074) — SHIPPED 2026-03-13</summary>

- [x] Phase 073: Tavily Search Backend (2/2 plans) — completed 2026-03-13
- [x] Phase 074: LightBoxArticles Dashboard (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.33 Anthropic Claude AI Service (Phase 072) — SHIPPED 2026-03-13</summary>

- [x] Phase 072: Anthropic Claude AI Service (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.32 Gemini AI Service (Phase 071) — SHIPPED 2026-03-13</summary>

- [x] Phase 071: Gemini AI Service (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.31 Article Manager Improvements (Phases 069–070) — SHIPPED 2026-03-13</summary>

- [x] Phase 069: Strapi Schema (1/1 plan) — completed 2026-03-13
- [x] Phase 070: Dashboard Form & Detail (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.30 Blog Public Views (Phases 065–068) — SHIPPED 2026-03-13</summary>

- [x] Phase 065: Strapi Slug Field (1/1 plan) — completed 2026-03-13
- [x] Phase 066: Article Infrastructure (2/2 plans) — completed 2026-03-13
- [x] Phase 067: Blog Listing Page (3/3 plans) — completed 2026-03-13
- [x] Phase 068: Blog Detail Page (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.29 News Manager (Phases 063–064) — SHIPPED 2026-03-12</summary>

- [x] Phase 063: News Content Type (1/1 plan) — completed 2026-03-12
- [x] Phase 064: Dashboard Articles UI (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.28 Logout Store Cleanup (Phase 062) — SHIPPED 2026-03-12</summary>

- [x] Phase 062: Logout Store Cleanup (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.27 Reparar eventos GA4 ecommerce (Phase 061) — SHIPPED 2026-03-12</summary>

- [x] Phase 061: Fix GA4 ecommerce events (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.26 Mostrar comprobante Webpay (Phase 060) — SHIPPED 2026-03-11</summary>

- [x] Phase 060: Mostrar comprobante Webpay (3/3 plans) — completed 2026-03-11

</details>

<details>
<summary>✅ v1.37 Email Authentication Flows (Phases 079–082) — SHIPPED 2026-03-14</summary>

- [x] Phase 079: Website Verify Flow + MJML Fix (1/1 plan) — completed 2026-03-14
- [x] Phase 080: Password Reset MJML + Context Routing (2/2 plans) — completed 2026-03-14
- [x] Phase 081: Email Verification Frontend (2/2 plans) — completed 2026-03-14
- [x] Phase 082: Email Verification Backend Activation (1/1 plan) — completed 2026-03-14

</details>

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
| 060   | v1.26     | 3/3            | Complete    | 2026-03-11 |
| 061   | v1.27     | 2/2            | Complete    | 2026-03-12 |
| 062   | v1.28     | 2/2            | Complete    | 2026-03-12 |
| 063   | v1.29     | 1/1            | Complete    | 2026-03-12 |
| 064   | v1.29     | 2/2            | Complete    | 2026-03-12 |
| 065   | v1.30     | 1/1            | Complete    | 2026-03-13 |
| 066   | v1.30     | 2/2            | Complete    | 2026-03-13 |
| 067   | v1.30     | 3/3            | Complete    | 2026-03-13 |
| 068   | v1.30     | 2/2            | Complete    | 2026-03-13 |
| 069   | v1.31     | 1/1            | Complete    | 2026-03-13 |
| 070   | v1.31     | 1/1            | Complete    | 2026-03-13 |
| 071   | v1.32     | 1/1            | Complete    | 2026-03-13 |
| 072   | v1.33     | 1/1            | Complete    | 2026-03-13 |
| 073   | v1.34     | 2/2            | Complete    | 2026-03-13 |
| 074   | v1.34     | 2/2            | Complete    | 2026-03-13 |
| 075   | v1.35     | 2/2            | Complete    | 2026-03-13 |
| 076   | v1.35     | 2/2            | Complete    | 2026-03-13 |
| 077   | v1.36     | 4/4            | Complete    | 2026-03-13 |
| 078   | v1.36     | 2/2            | Complete    | 2026-03-14 |
| 079   | v1.37     | 1/1            | Complete    | 2026-03-14 |
| 080   | v1.37     | 2/2            | Complete    | 2026-03-14 |
| 081   | v1.37     | 2/2            | Complete    | 2026-03-14 |
| 082   | v1.37     | 1/1            | Complete    | 2026-03-14 |
| 083   | v1.38     | 2/2            | Complete    | 2026-03-14 |
| 084   | v1.38     | 2/2            | Complete    | 2026-03-14 |
| 085   | v1.38     | 2/2            | Complete    | 2026-03-14 |
| 089   | v1.39     | 1/1            | Complete    | 2026-03-15 |
| 090   | v1.39     | 6/6            | Complete    | 2026-03-15 |
| 091   | v1.40     | 1/1            | Complete    | 2026-03-16 |
| 092   | v1.40     | 2/2            | Complete    | 2026-03-16 |

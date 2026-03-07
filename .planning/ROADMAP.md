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
- 🚧 **v1.9 Website Technical Debt** — Phases 25-29 (in progress)

## Phases

<details>
<summary>✅ v1.1 Dashboard Technical Debt Reduction (Phases 3-6) — SHIPPED 2026-03-05</summary>

Phases 3-6 completed in v1.1: double-fetch + pagination isolation, Sentry/dead-code cleanup,
AdsTable generic component, canonical domain types + typeCheck, Strapi aggregate endpoints.
Archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 Double-Fetch Cleanup (Phases 7-8) — SHIPPED 2026-03-05</summary>

Phases 7-8 completed in v1.2: eliminated redundant `onMounted` from all 10 non-ads dashboard
components; `watch({ immediate: true })` is now sole data-loading trigger across the entire dashboard.
Archive: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>✅ v1.3 Utility Extraction (Phases 9-11) — SHIPPED 2026-03-06</summary>

Phases 9-11 completed in v1.3: date, price, and string utilities extracted into `app/utils/`; all
51 inline duplicate function definitions eliminated across the dashboard.
Archive: `.planning/milestones/v1.3-ROADMAP.md`

</details>

<details>
<summary>✅ v1.4 URL Localization (Phases 12-15) — SHIPPED 2026-03-06</summary>

Phases 12-15 completed in v1.4: all dashboard URL segments renamed to English; 301 redirects added
for legacy Spanish paths; `nuxt typecheck` passes with zero errors.
Archive: `.planning/milestones/v1.4-ROADMAP.md`

</details>

<details>
<summary>✅ v1.5 Ad Credit Refund (Phases 16-17) — SHIPPED 2026-03-06</summary>

**Milestone Goal:** When an ad is rejected or banned, return the ad reservation and featured reservation credits to the user, and notify them via email that their credits were refunded.

- [x] **Phase 16: Credit Refund Logic** — Wired reservation-freeing into `rejectAd()` and `bannedAd()` (completed 2026-03-06)
- [x] **Phase 17: Email Notification Update** — Updated `ad-rejected.mjml` and `ad-banned.mjml` with conditional credit-return messaging (completed 2026-03-06)

Archive: `.planning/milestones/v1.5-ROADMAP.md`

</details>

<details>
<summary>✅ v1.6 Website API Optimization (Phases 18-19) — SHIPPED 2026-03-06</summary>

**Milestone Goal:** Eliminate double-fetches and redundant API calls in the website, applying the same patterns already established in the dashboard (v1.2).

- [x] **Phase 18: Page Double-Fetch Fixes** — Fixed `preguntas-frecuentes.vue` (2 calls → 1); added `GET /api/ads/me/counts` Strapi endpoint; `mis-anuncios.vue` reduced from 6 API calls → 2 (completed 2026-03-06)
- [x] **Phase 19: Store Cache Guards & Component Cleanup** — 30-min timestamp-based cache guards added to `packs.store.ts`, `conditions.store.ts`, `regions.store.ts`; redundant `loadCommunes()` removed from `FormCreateThree.vue` (completed 2026-03-06)

Archive: `.planning/milestones/v1.6-ROADMAP.md`

</details>

<details>
<summary>✅ v1.7 Cron Reliability (Phases 20-23) — SHIPPED 2026-03-06</summary>

**Milestone Goal:** Fix the three non-functional cron jobs (userCron, backupCron, cleanupCron) and add English documentation comments throughout all cron files.

- [x] **Phase 20: user.cron Fix & Docs** — Fixed multi-ad deactivation loop, removed unused PaymentUtils import, added English comments (completed 2026-03-06)
- [x] **Phase 21: backup.cron Fix & Docs** — Fixed Strapi v5 config path, redacted password from logs, added English comments (completed 2026-03-06)
- [x] **Phase 22: cleanup.cron Fix & Docs** — Fixed folder filter query for Strapi v5 compatibility, added English comments (completed 2026-03-06)
- [x] **Phase 23: ad.cron + cron-tasks Docs** — Added English comments to ad.cron.ts and cron-tasks.ts (completed 2026-03-06)

Archive: `.planning/milestones/v1.7-ROADMAP.md`

</details>

<details>
<summary>✅ v1.8 Free Featured Reservation Guarantee (Phase 24) — SHIPPED 2026-03-07</summary>

**Milestone Goal:** Guarantee that every user always has 3 free `ad-featured-reservation` records with `price = 0` that are not linked to an active ad. A daily cron (`featuredCron`) scans all users and creates missing slots. Also fixes `ad-free-reservation-restore.cron.ts` logic and optimizes it with parallel batch processing.

- [x] **Phase 24: featuredCron Implementation** — Implement `featured.cron.ts`, register `featuredCron` in `cron-tasks.ts` (daily 2:30 AM Santiago), commit `cron-runner` API files, add English docs throughout. (completed 2026-03-06)
- [x] **Fix: ad-free-reservation-restore logic** — Reservations stay permanently linked to expired ads (history); `restoreUserFreeReservations` counts by `ad.active=true` not `remaining_days>0`; cron simplified to single responsibility (guarantee 3 free reservations per user); parallel batch processing (50 users/batch). (completed 2026-03-07)

Archive: `.planning/milestones/v1.8-ROADMAP.md`

</details>

### 🚧 v1.9 Website Technical Debt (Phases 25-29)

**Milestone Goal:** Eliminar los bugs de correctness críticos del website (structured data rota, key collisions en useAsyncData, errores suprimidos en producción) y establecer una base TypeScript sólida con typeCheck habilitado.

- [x] **Phase 25: Critical Correctness Bugs** — Fixed Strapi route shadowing (/ads/me/* routes), useAsyncData key collisions, $setStructuredData type augmentation, production console filter (completed 2026-03-06)
- [x] **Phase 26: Data Fetching Cleanup** — Moved onMounted(async) data-fetching to useAsyncData in parent pages for 7 components; all 33 onMounted calls documented with classification comments (completed 2026-03-07)
- [x] **Phase 27: TypeScript Migration** — Migrate 17 pages to lang="ts"; eliminate any in critical stores and composables
- [~] **Phase 28: TypeScript Strict + Store Audit** — STORE-01 complete (persist comments on all 14 stores); TS-04 deferred — typeCheck revealed 183 errors across 55 files (moved to Phase 29)
- [ ] **Phase 29: TypeScript Strict Errors** — Fix all 183 typecheck errors across 55 files, then enable typeCheck: true

## Phase Details

### Phase 25: Critical Correctness Bugs
**Goal**: The website has no silent failures — structured data is applied on all pages, useAsyncData keys never collide between pages, error/warning logs are visible in production, and SSR/CSR hydration is consistent for authenticated pages
**Depends on**: Nothing (self-contained bug fixes)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05
**Success Criteria** (what must be TRUE):
  1. A developer inspecting page source on any page that calls `$setStructuredData` sees a `<script type="application/ld+json">` block with correct JSON-LD data
  2. Two tabs open simultaneously (`/` and `/packs`) each load their packs data independently without one overwriting the other's `useAsyncData` cache
  3. Browsing the website in production with DevTools open shows `console.error` and `console.warn` output — only `console.log` and `console.debug` are suppressed
  4. Loading `/cuenta/mis-anuncios` directly (SSR) renders the same ad counts as a client-side navigation to the same page
  5. Loading `/cuenta/mis-ordenes` directly (SSR) renders the same order data as a client-side navigation to the same page
**Plans**: 1 plan
Plans:
- [x] 25-01-PLAN.md — Fixed 5 correctness bugs: $setStructuredData types, useAsyncData key collisions, console suppression, Strapi /ads/me route ordering

### Phase 26: Data Fetching Cleanup
**Goal**: All data fetching in creation-flow and profile components uses useAsyncData (SSR-compatible) — no component silently skips rendering on first SSR load due to onMounted-only fetch
**Depends on**: Phase 25 (clean baseline; Phase 25 BUG-04/05 establishes the correct useAsyncData pattern to replicate)
**Requirements**: FETCH-01, FETCH-02, FETCH-03, FETCH-04, FETCH-05, FETCH-06, FETCH-07, FETCH-08
**Success Criteria** (what must be TRUE):
  1. Refreshing any page in the ad creation flow (`/crear/paso-1`, `/crear/paso-2`, `/crear/paso-3`) renders form data immediately without a loading flash — server-rendered content is hydrated
  2. `FormProfile.vue` renders user profile data without a client-side flash when the page is accessed directly via URL
  3. A codebase search for `onMounted(async` in website components returns zero results for data-fetching patterns (only UI-only onMounted remain, documented with a comment)
  4. The FETCH-08 audit comment or commit message classifies all 33 `onMounted` usages as: UI-only (allowed), analytics-only (client-only by nature), fetch-moved (fixed), or client-only-intentional
**Plans**: 1 plan
Plans:
- [x] 26-01-PLAN.md — Move onMounted(async) data-fetching to parent page useAsyncData (7 tasks, 1 wave)

### Phase 27: TypeScript Migration
**Goal**: All website pages and the critical stores/composables are fully typed — no page uses `lang="js"` and no `any` type escapes exist in the data layer
**Depends on**: Phase 26 (fetching patterns must be stable before adding lang="ts" to pages that were just modified)
**Requirements**: TS-01, TS-02, TS-03
**Success Criteria** (what must be TRUE):
  1. Every `.vue` file under `apps/website/pages/` has `<script setup lang="ts">` — zero pages remain in JavaScript
  2. `user.store.ts`, `me.store.ts`, and `ad.store.ts` have no `any` casts in their identified hot spots (`loadUser`, `updateUserProfile`, `me` ref, `analytics.view_item_list`)
  3. `useAdAnalytics.ts`, `useAdPaymentSummary.ts`, and `usePackPaymentSummary.ts` have no `any` type annotations
  4. Running `nuxt typecheck` (without the global `typeCheck: true` build flag) on the website produces zero new errors from the migrated pages and composables
**Plans**: 1 plan
Plans:
- [x] 27-01-PLAN.md — Migrated all 18 pages to lang="ts"; eliminated any in 3 stores and 3 composables (3 tasks, 1 wave)

### Phase 28: TypeScript Strict + Store Audit
**Goal**: Every store's localStorage persistence is explicitly justified with an inline comment; typeCheck: true enabling deferred after scope discovery
**Depends on**: Phase 27 (typeCheck: true can only be enabled after pages and stores are clean)
**Requirements**: TS-04 (deferred), STORE-01 (complete)
**Outcome**: STORE-01 complete — all 14 stores documented. TS-04 deferred — running typeCheck revealed 183 errors across 55 files (18x scope increase); moved to Phase 29.
**Plans**: 2 plans
Plans:
- [x] 28-01-PLAN.md — Strapi SDK filter type casts applied to 4 stores; typeCheck not enabled (183 errors discovered)
- [x] 28-02-PLAN.md — Added persist: CORRECT|REVIEW|RISK audit comments to all 14 stores (STORE-01 complete)

### Phase 29: TypeScript Strict Errors
**Goal**: All 183 typecheck errors resolved across 55 files; typeCheck: true enabled in nuxt.config.ts; every build enforces TypeScript
**Depends on**: Phase 28 (Strapi SDK casts done; persist audit done; full error catalogue available)
**Requirements**: TS-04
**Error categories to fix**:
  1. Window globals (`window.$crisp`, `window.dataLayer`, `window.google`) — add type declarations
  2. Plugin type augmentation (`$strapi`, `$setStructuredData`, `$sentry`, `$reCaptcha`) — augment NuxtApp interface
  3. User type mismatches — `useAuth()` / `useStrapiUser()` return type vs local `User` interface
  4. API response mismatches — Strapi SDK return shapes vs manually-typed store interfaces
  5. Vue component prop types — implicit `any` on props in migrated pages
  6. Composable return type gaps — inferred types incompatible with explicit annotations
**Success Criteria** (what must be TRUE):
  1. `nuxt typecheck` exits with zero errors
  2. `nuxt.config.ts` has `typescript: { typeCheck: true }` and `npm run build` completes without errors
  3. No `@ts-ignore` or `@ts-expect-error` suppressions added

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 24. featuredCron Implementation | v1.8 | 1/1 | Complete | 2026-03-07 |
| 25. Critical Correctness Bugs | v1.9 | 1/1 | Complete | 2026-03-06 |
| 26. Data Fetching Cleanup | v1.9 | 1/1 | Complete | 2026-03-07 |
| 27. TypeScript Migration | v1.9 | 1/1 | Complete | 2026-03-07 |
| 28. TypeScript Strict + Store Audit | v1.9 | 2/2 | Partial (STORE-01 done, TS-04 deferred) | 2026-03-07 |
| 29. TypeScript Strict Errors | v1.9 | 0/? | Not started | — |

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
- 🔄 **v1.11 GTM / GA4 Tracking Fix** — Phase 31 (in progress)

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

Phases 16-17 completed in v1.5: reservation-freeing wired into `rejectAd()` and `bannedAd()`; email
templates updated with conditional credit-return messaging.
Archive: `.planning/milestones/v1.5-ROADMAP.md`

</details>

<details>
<summary>✅ v1.6 Website API Optimization (Phases 18-19) — SHIPPED 2026-03-06</summary>

Phases 18-19 completed in v1.6: eliminated double-fetches in website pages; added `GET /api/ads/me/counts`
aggregate endpoint; timestamp-based cache guards added to 3 stores.
Archive: `.planning/milestones/v1.6-ROADMAP.md`

</details>

<details>
<summary>✅ v1.7 Cron Reliability (Phases 20-23) — SHIPPED 2026-03-06</summary>

Phases 20-23 completed in v1.7: fixed userCron multi-ad loop, backupCron Strapi v5 config path,
cleanupCron folder filter query; English docs added throughout all cron files.
Archive: `.planning/milestones/v1.7-ROADMAP.md`

</details>

<details>
<summary>✅ v1.8 Free Featured Reservation Guarantee (Phase 24) — SHIPPED 2026-03-07</summary>

Phase 24 completed in v1.8: fixed `ad-free-reservation-restore.cron.ts` logic; parallel batch
processing; `cron-runner` API committed.
Archive: `.planning/milestones/v1.8-ROADMAP.md`

</details>

<details>
<summary>✅ v1.9 Website Technical Debt (Phases 25-29) — SHIPPED 2026-03-07</summary>

- [x] **Phase 25: Critical Correctness Bugs** — Fixed Strapi route shadowing, useAsyncData key collisions, $setStructuredData types, production console filter (completed 2026-03-06)
- [x] **Phase 26: Data Fetching Cleanup** — Moved onMounted(async) data-fetching to useAsyncData in 7 components; all 33 onMounted calls documented with classification comments (completed 2026-03-07)
- [x] **Phase 27: TypeScript Migration** — Migrated all 17 pages to lang="ts"; eliminated any in 3 stores and 3 composables (completed 2026-03-07)
- [x] **Phase 28: TypeScript Strict + Store Audit** — STORE-01 complete (persist comments on all 14 stores); Strapi SDK filter casts in 4 stores (completed 2026-03-07)
- [x] **Phase 29: TypeScript Strict Errors** — Fixed all 183 typecheck errors across 55 files; enabled typeCheck: true; nuxt typecheck passes with zero errors (completed 2026-03-07)

Archive: `.planning/milestones/v1.9-ROADMAP.md`

</details>

<details>
<summary>✅ v1.10 Dashboard Orders Dropdown UI (Phase 30) — SHIPPED 2026-03-07</summary>

Phase 30 completed in v1.10: `DropdownSales.vue` surfaces buyer full name and full timestamp.
Archive: `.planning/milestones/v1.10-ROADMAP.md`

</details>

### v1.11 GTM / GA4 Tracking Fix (IN PROGRESS)

- [ ] **Phase 31: GTM Plugin + Consent Mode v2** — Fix broken gtag() shim; implement Consent Mode v2 default denial and update flow

## Phase Details

### Phase 31: GTM Plugin + Consent Mode v2
**Goal:** GA4 receives page_view events for all SPA navigations; Consent Mode v2 default denial is in place before GTM loads; cookie accept pushes the correct consent update
**Depends on:** Nothing (self-contained changes in `apps/website`)
**Requirements:** GTM-01, GTM-02
**Success criteria:**
1. `gtm.client.ts` has no local `gtag()` function — the broken shim is gone
2. `window.dataLayer` receives a `{ "consent": "default", analytics_storage: "denied", ad_storage: "denied" }` push **before** the GTM `<script>` tag is injected
3. SPA navigation pushes `{ event: "page_view", page_path: to.fullPath, page_title: ... }` as a plain object (not an array)
4. `LightboxCookies.vue` `acceptCookies()` pushes `{ "consent": "update", analytics_storage: "granted", ad_storage: "granted" }` instead of the `accept_cookies` event
5. `nuxt typecheck` passes with zero errors after the changes
6. No behavior changes to the cookie banner UI — only the dataLayer payload differs
**Plans:** 1 plan

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 25. Critical Correctness Bugs | v1.9 | 1/1 | Complete | 2026-03-06 |
| 26. Data Fetching Cleanup | v1.9 | 1/1 | Complete | 2026-03-07 |
| 27. TypeScript Migration | v1.9 | 1/1 | Complete | 2026-03-07 |
| 28. TypeScript Strict + Store Audit | v1.9 | 2/2 | Complete | 2026-03-07 |
| 29. TypeScript Strict Errors | v1.9 | 1/1 | Complete | 2026-03-07 |
| 30. Dropdown Display Fix | v1.10 | 1/1 | Complete | 2026-03-07 |
| 31. GTM Plugin + Consent Mode v2 | v1.11 | 0/1 | In Progress | — |

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
- 🔄 **v1.10 Dashboard Orders Dropdown UI** — Phase 30 (active)

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

### v1.10 Dashboard Orders Dropdown UI (Active)

- [ ] **Phase 30: Dropdown Display Fix** — Surface buyer full name and full timestamp in `DropdownSales.vue`

## Phase Details

### Phase 30: Dropdown Display Fix
**Goal:** The "Últimas órdenes" dropdown shows who bought (full name) and when (date + time) for every order entry
**Depends on:** Nothing (self-contained component change in `apps/dashboard`)
**Requirements:** DROP-01, DROP-02
**Success criteria:**
1. Each order row displays the buyer's full name (`firstname + lastname`), falling back to `username`, then `email` — never a raw `buy_order` ID
2. Each order row displays date and time in the format `"7 mar 2026 • 01:08 a. m."` — never time-only
3. `nuxt typecheck` passes with zero errors after the changes (no type regressions introduced)
4. Dropdown layout, styling, and navigation behavior are unchanged — only the text content of the two fields differs
**Plans:** TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 25. Critical Correctness Bugs | v1.9 | 1/1 | Complete | 2026-03-06 |
| 26. Data Fetching Cleanup | v1.9 | 1/1 | Complete | 2026-03-07 |
| 27. TypeScript Migration | v1.9 | 1/1 | Complete | 2026-03-07 |
| 28. TypeScript Strict + Store Audit | v1.9 | 2/2 | Complete | 2026-03-07 |
| 29. TypeScript Strict Errors | v1.9 | 1/1 | Complete | 2026-03-07 |
| 30. Dropdown Display Fix | v1.10 | 0/1 | Not started | - |

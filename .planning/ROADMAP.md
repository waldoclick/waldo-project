# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- ✅ **v1.3 Utility Extraction** — Phases 9-11 (shipped 2026-03-06)
- ✅ **v1.4 URL Localization** — Phases 12-15 (shipped 2026-03-06)
- ✅ **v1.5 Ad Credit Refund** — Phases 16-17 (shipped 2026-03-06)
- 🚧 **v1.6 Website API Optimization** — Phases 18-19 (in progress)

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

---

## 🚧 v1.6 Website API Optimization (In Progress)

**Milestone Goal:** Eliminate double-fetches and redundant API calls in the website, applying the same patterns already established in the dashboard (v1.2).

### Phases

- [x] **Phase 18: Page Double-Fetch Fixes** — Eliminate over-fetching in `preguntas-frecuentes.vue` and `mis-anuncios.vue` (completed 2026-03-06)
- [ ] **Phase 19: Store Cache Guards & Component Cleanup** — Add cache guards to 3 stores and remove redundant commune fetch from `FormCreateThree.vue`

### Phase Details

#### Phase 18: Page Double-Fetch Fixes
**Goal**: Website pages fire the minimum number of API calls on load
**Depends on**: Nothing (first phase of milestone)
**Requirements**: PAGE-01, PAGE-02, PAGE-03
**Success Criteria** (what must be TRUE):
  1. Loading `preguntas-frecuentes.vue` triggers exactly 1 API call (not 2)
  2. Loading `mis-anuncios.vue` triggers exactly 2 API calls — one for tab counts, one for ads — (not 6)
  3. Switching tabs or changing page number on `mis-anuncios.vue` does NOT re-trigger `loadTabCounts()`
**Plans**: 2 plans
Plans:
- [ ] 18-01-PLAN.md — Fix FAQ double-fetch + add /ads/me/counts Strapi endpoint
- [ ] 18-02-PLAN.md — Refactor mis-anuncios.vue to use new counts endpoint

#### Phase 19: Store Cache Guards & Component Cleanup
**Goal**: Stores never re-fetch data already in memory; components never duplicate plugin-provided data
**Depends on**: Phase 18
**Requirements**: STORE-01, STORE-02, STORE-03, COMP-01
**Success Criteria** (what must be TRUE):
  1. Calling `loadPacks()` a second time (data already loaded) makes zero HTTP requests
  2. Calling `loadConditions()` a second time makes zero HTTP requests
  3. Calling `loadRegions()` a second time makes zero HTTP requests
  4. `FormCreateThree.vue` does not call `loadCommunes()` on mount — commune data from the plugin is used directly
**Plans**: TBD

### Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 18. Page Double-Fetch Fixes | 2/2 | Complete    | 2026-03-06 |
| 19. Store Cache Guards & Component Cleanup | 0/1 | Not started | - |

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

## Phases

<details>
<summary>✅ v1.1–v1.14 (Phases 3-34) — SHIPPED</summary>

All prior phases shipped. See `.planning/milestones/` for archived roadmaps.

</details>

## Phase Details

### Phase 34: GTM Module: Dashboard
**Goal:** `apps/dashboard` has `@saslavik/nuxt-gtm@0.1.3` installed, configured with `enableRouterSync: true`, and GTM ID from `runtimeConfig.public.gtm.id`; the legacy `gtmId` flat field is removed; `nuxt typecheck` passes with zero errors
**Depends on:** Nothing (self-contained change in `apps/dashboard`)
**Requirements:** GTM-DASH-01, GTM-DASH-02, GTM-DASH-03
**Success criteria:**
1. `@saslavik/nuxt-gtm@0.1.3` in `apps/dashboard` devDependencies; present in `modules` array of `nuxt.config.ts`
2. Module configured with `enableRouterSync: true`; GTM ID from `runtimeConfig.public.gtm.id`; legacy `gtmId` runtimeConfig field removed
3. No other file in `apps/dashboard` references `gtmId`
4. `nuxt typecheck` passes with zero errors
**Plans:** 1 plan

Plans:
- [x] 34-01-PLAN.md — Install @saslavik/nuxt-gtm, configure with enableRouterSync, remove gtmId

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 25-33 | v1.9–v1.13 | All | Complete | 2026-03-07 |
| 34. GTM Module: Dashboard | v1.14 | 1/1 | Complete | 2026-03-07 |

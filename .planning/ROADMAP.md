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

## Phases

<details>
<summary>✅ v1.1–v1.15 (Phases 3-35) — SHIPPED</summary>

All prior phases shipped. See `.planning/milestones/` for archived roadmaps.

</details>

<details>
<summary>✅ v1.16 — Website Meta Copy Audit (Phases 36-38) — SHIPPED 2026-03-07</summary>

- [x] **Phase 36: SEO Bug Fixes** — Eliminate double-suffix titles, remove stale counters, and add missing noindex (completed 2026-03-07)
- [x] **Phase 37: Dynamic Page Copy** — Rewrite meta copy for all four public dynamic pages using canonical vocabulary (completed 2026-03-07)
- [x] **Phase 38: Static Page Copy** — Rewrite meta copy for all four public static pages using canonical vocabulary (completed 2026-03-07)

</details>

## Standalone Phases

### Phase 40: Users Filter Authenticated

**Goal:** Show only Authenticated users in the dashboard users table and remove the "Rol" column. Fix is server-side: wire `getUserDataWithFilters` controller in `strapi-server.ts` with a non-forgeable authenticated role filter via `strapi.db.query`.

**Requirements:** FILTER-01 (authenticated filter enforced server-side), FILTER-02 (pagination respected), FILTER-03 (sort and client filters forwarded), FILTER-04 (Rol column removed from dashboard)

**Plans:** 2/2 plans complete

Plans:
- [ ] 40-01-PLAN.md — Strapi: harden getUserDataWithFilters + wire strapi-server.ts (TDD)
- [ ] 40-02-PLAN.md — Dashboard: remove populate:role from searchParams and drop Rol column

---

### Phase 39: Spanish Default Language

**Goal:** Set Spanish (`es`) as the declared default language in both Nuxt apps by enabling the already-installed `@nuxtjs/i18n` module, fixing `html[lang]` and `og:locale` SEO attributes.

**Closes:** GitHub issue #22

**Requirements:** LANG-01 (website i18n enabled), LANG-02 (dashboard i18n enabled)

**Plans:** 1 plan

Plans:
- [ ] 39-01-PLAN.md — Enable @nuxtjs/i18n in website and dashboard

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 3-34 | v1.1–v1.14 | All | Complete | 2026-03-05 to 2026-03-07 |
| 35. Website SEO Audit | v1.15 | 3/3 | Complete | 2026-03-07 |
| 36. SEO Bug Fixes | v1.16 | 1/1 | Complete | 2026-03-07 |
| 37. Dynamic Page Copy | v1.16 | 1/1 | Complete | 2026-03-07 |
| 38. Static Page Copy | v1.16 | 2/2 | Complete | 2026-03-07 |
| 39. Spanish Default Language | standalone | 0/1 | In Progress | — |
| 40. Users Filter Authenticated | 2/2 | Complete   | 2026-03-07 | — |

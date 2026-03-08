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
- 🔄 **v1.18 Ad Creation URL Refactor** — Phase 42 (in progress)

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

### v1.18 — Ad Creation URL Refactor

- [ ] **Phase 42: Ad Creation URL Refactor** — Replace `?step=N` query-param navigation with dedicated per-step Spanish routes; preserve analytics and store state

## Active Phases

### Phase 39: Spanish Default Language

**Goal:** Set Spanish (`es`) as the declared default language in both Nuxt apps by enabling the already-installed `@nuxtjs/i18n` module, fixing `html[lang]` and `og:locale` SEO attributes.

**Closes:** GitHub issue #22

**Requirements:** LANG-01 (website i18n enabled), LANG-02 (dashboard i18n enabled)

**Plans:** 1 plan

Plans:
- [ ] 39-01-PLAN.md — Enable @nuxtjs/i18n in website and dashboard

## Phase Details

### Phase 42: Ad Creation URL Refactor

**Goal:** Each wizard step is reachable via its own dedicated Spanish URL; `?step=N` query-param navigation is fully eliminated.

**Depends on:** Nothing (self-contained website refactor)

**Requirements:** ROUTE-01, ROUTE-02, ROUTE-03, ROUTE-04, ROUTE-05, STATE-01, STATE-02, ANA-01, ANA-02, QUAL-01, QUAL-02

**Success Criteria** (what must be TRUE):
  1. Navigating to `/anunciar` opens Step 1 (Pack + Featured selection) — no query param in the URL
  2. Each of `/anunciar/datos-del-producto`, `/anunciar/datos-personales`, `/anunciar/ficha-de-producto`, `/anunciar/galeria-de-imagenes` renders the correct step form when accessed directly
  3. Clicking Next/Back between steps changes the URL to the next step's dedicated route and `adStore.step` reflects the current step number
  4. Form data entered in earlier steps is still present when navigating forward and backward through the wizard
  5. `nuxt typecheck` passes with zero errors and no `?step=` references remain in any component or composable

**Plans:** 3 plans

Plans:
- [ ] 42-01-PLAN.md — Create 4 new dedicated step pages (steps 2–5)
- [ ] 42-02-PLAN.md — Fix resumen.vue back button + remove FormCreateThree debug leak
- [ ] 42-03-PLAN.md — Refactor index.vue and CreateAd.vue (remove query param navigation)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 3-34 | v1.1–v1.14 | All | Complete | 2026-03-05 to 2026-03-07 |
| 35. Website SEO Audit | v1.15 | 3/3 | Complete | 2026-03-07 |
| 36. SEO Bug Fixes | v1.16 | 1/1 | Complete | 2026-03-07 |
| 37. Dynamic Page Copy | v1.16 | 1/1 | Complete | 2026-03-07 |
| 38. Static Page Copy | v1.16 | 2/2 | Complete | 2026-03-07 |
| 39. Spanish Default Language | v1.18 | 0/1 | Not started | — |
| 40. Users Filter Authenticated | v1.17 | 2/2 | Complete | 2026-03-07 |
| 41. Sentry Production-Only | v1.17 | 1/1 | Complete | 2026-03-07 |
| 42. Ad Creation URL Refactor | v1.18 | 0/? | Not started | — |

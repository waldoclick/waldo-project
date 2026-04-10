---
phase: quick-260410-eh6
plan: 01
subsystem: dashboard+strapi
tags: [google-analytics, integrations, dashboard, kpi, charts]
dependency_graph:
  requires: [260410-dxp]
  provides: [google-analytics-dashboard-page]
  affects: [MenuIntegrations, useServices]
tech_stack:
  added: []
  patterns: [watch-immediate-true, dual-y-axis-chart, delta-badges]
key_files:
  created:
    - apps/strapi/src/services/google-analytics/types/google-analytics.types.ts (extended)
    - apps/strapi/src/services/google-analytics/services/google-analytics.service.ts (extended)
    - apps/strapi/src/api/google-analytics/routes/google-analytics.ts (extended)
    - apps/strapi/src/api/google-analytics/controllers/google-analytics.ts (extended)
    - apps/dashboard/app/components/GoogleAnalyticsSummary.vue
    - apps/dashboard/app/components/GoogleAnalyticsChart.vue
    - apps/dashboard/app/components/GoogleAnalyticsPages.vue
    - apps/dashboard/app/pages/integrations/google-analytics.vue
    - apps/dashboard/app/scss/components/_google-analytics.scss
  modified:
    - apps/dashboard/app/scss/app.scss
    - apps/dashboard/app/components/MenuIntegrations.vue
    - apps/dashboard/app/composables/useServices.ts
decisions:
  - "bounceRate delta color is inverted: negative delta = green (improvement), positive = red (worse)"
  - "Two parallel runReport calls for current and previous 28-day windows to compute deltas"
  - "CloudflareThreats.vue pre-existing TS error deferred — not introduced by this task"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-10"
  tasks_completed: 2
  files_created: 9
  files_modified: 3
---

# Quick Task 260410-eh6: Add Google Analytics Dashboard Integration Summary

**One-liner:** GA4 dashboard integration with 28-day delta KPI cards, dual-Y-axis sessions/users chart, and bounce-rate-colored pages table following the Search Console pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add getSummary endpoint to Strapi GA4 service | 87ae7186 | types, service, routes, controller |
| 2 | Create dashboard Google Analytics page and components | 8b50fa1b | 5 new files, 3 updated |

## What Was Built

### Strapi (Task 1)
- Added `GA4SummaryMetric` and `GA4Summary` interfaces to `google-analytics.types.ts`
- Added `getSummary()` method to `GoogleAnalyticsService` using two parallel `runReport` calls (current 28-day vs previous 28-day window) to compute delta percentages
- Added `GET /google-analytics/summary` route with `isManager` policy
- Added `getSummary` controller handler

### Dashboard (Task 2)
- **`GoogleAnalyticsSummary.vue`** — 4 KPI cards (Sessions, Usuarios, Bounce Rate, Duración Prom.) with delta badges. bounceRate uses inverted color logic (negative delta = green). Values formatted as: sessions/users with `Intl.NumberFormat`, bounceRate as `X.X%`, avgDuration as `Xm Ys`.
- **`GoogleAnalyticsChart.vue`** — Line chart with dual Y-axes: sessions on left (`ySessions`), users on right (`yUsers`). Fetches from `google-analytics/stats`.
- **`GoogleAnalyticsPages.vue`** — Table with Página, Sesiones, Bounce Rate columns. Bounce rate colored green (≤30%), yellow (31-60%), red (>60%).
- **`google-analytics.vue`** page — HeroDefault with breadcrumbs and external link, 3 components composed in container.
- **`_google-analytics.scss`** — Full BEM structure under `.google-analytics` block, mirroring `_search-console.scss`.
- `app.scss` updated with `@use "components/google-analytics"`.
- `MenuIntegrations.vue` updated with Google Analytics item and `isIntegrationsRootActive` exclusion guard.
- `useServices.ts` updated: GA4 now navigates internally to `/integrations/google-analytics`.

## Deviations from Plan

### Out-of-scope pre-existing issue deferred
- **File:** `apps/dashboard/app/components/CloudflareThreats.vue` line 173
- **Issue:** `context.parsed.y` typed as `number | null` in ChartJS TooltipItem; `formatNumber` expects `number`. Causes `nuxi typecheck` to exit with error code 2.
- **Origin:** Pre-existing since commit `0bdb0e20` — not introduced by this task.
- **Action:** Logged to `deferred-items.md`. My new files have no TypeScript errors.

## Known Stubs

None — all components fetch live data from Strapi endpoints. Loading states show "Cargando..." while data loads.

## Self-Check: PASSED

All 7 created/modified files confirmed present on disk. Both commits (87ae7186, 8b50fa1b) confirmed in git history.

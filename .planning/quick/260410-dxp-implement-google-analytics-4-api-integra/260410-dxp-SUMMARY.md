---
phase: quick
plan: 260410-dxp
subsystem: strapi/analytics
tags: [ga4, google-analytics, analytics, api, strapi]
dependency_graph:
  requires: [GOOGLE_SC_CREDENTIALS_PATH env var (shared), GA4_PROPERTY_ID env var]
  provides: [GET /google-analytics/stats, GET /google-analytics/pages]
  affects: [apps/strapi/src/api/google-analytics, apps/strapi/src/services/google-analytics]
tech_stack:
  added: ["@google-analytics/data@5.2.1"]
  patterns: [new-instance-per-request, service-class-with-interface, isManager-policy-guard]
key_files:
  created:
    - apps/strapi/src/services/google-analytics/types/google-analytics.types.ts
    - apps/strapi/src/services/google-analytics/services/google-analytics.service.ts
    - apps/strapi/src/services/google-analytics/index.ts
    - apps/strapi/src/api/google-analytics/routes/google-analytics.ts
    - apps/strapi/src/api/google-analytics/controllers/google-analytics.ts
  modified:
    - apps/strapi/package.json
    - yarn.lock
    - apps/strapi/.env.example
decisions:
  - BetaAnalyticsDataClient instantiated per-request (same pattern as SearchConsoleService Auth.GoogleAuth) to avoid stale credentials
  - GA4 date values come as YYYYMMDD strings; converted to YYYY-MM-DD in service layer
  - Reuses GOOGLE_SC_CREDENTIALS_PATH for GA4 credentials (same service account covers both APIs)
metrics:
  duration: ~10 min
  completed: 2026-04-10
  tasks_completed: 2
  files_created: 5
  files_modified: 3
---

# Quick Task 260410-dxp: Implement Google Analytics 4 API Integration Summary

GA4 Data API integration with BetaAnalyticsDataClient returning daily stats + top pages via two manager-only Strapi endpoints.

## Objective

Add Google Analytics 4 API integration to Strapi, mirroring the existing Search Console pattern. Exposes GA4 daily metrics and top pages data to the dashboard via two manager-only endpoints.

## What Was Built

### Service Layer (`apps/strapi/src/services/google-analytics/`)

**Types** (`google-analytics.types.ts`):
- `GA4StatsRow`: `{ date, sessions, users, bounceRate, avgSessionDuration }`
- `GA4PageRow`: `{ page, pageTitle, sessions, pageViews, bounceRate }`
- `IGoogleAnalyticsService`: `{ getStats(), getPages() }`

**Service** (`google-analytics.service.ts`):
- `GoogleAnalyticsService implements IGoogleAnalyticsService`
- Constructor validates `GA4_PROPERTY_ID` presence; reads `GOOGLE_SC_CREDENTIALS_PATH`
- `createClient()`: new `BetaAnalyticsDataClient` per call (no stale credential caching)
- `getStats()`: last 28 days daily time series — sessions, totalUsers, bounceRate, averageSessionDuration; converts GA4 `YYYYMMDD` → `YYYY-MM-DD`; sorted ascending
- `getPages()`: top 25 pages by screenPageViews — pagePath, pageTitle, sessions, bounceRate; ordered desc by screenPageViews

**Index** (`index.ts`): re-exports types and service

### API Layer (`apps/strapi/src/api/google-analytics/`)

**Routes** (`routes/google-analytics.ts`):
- `GET /google-analytics/stats` — `global::isManager`
- `GET /google-analytics/pages` — `global::isManager`

**Controller** (`controllers/google-analytics.ts`):
- `getStats` and `getPages` handlers
- New `GoogleAnalyticsService()` instance per request
- Error handling: `ctx.internalServerError('Google Analytics error: ${message}')`

## Commits

| # | Hash | Description |
|---|------|-------------|
| 1 | 73522ece | feat(quick-260410-dxp): add GA4 service types, class, and @google-analytics/data dependency |
| 2 | 36b86333 | feat(quick-260410-dxp): add GA4 API routes and controller |
| 3 | 93cda005 | chore(quick-260410-dxp): add GA4_PROPERTY_ID to .env.example |

## Deviations from Plan

None - plan executed exactly as written.

The `GA4_PROPERTY_ID` env var was already present in `.env.example` (added by a prior session), so the file diff was minimal — just the surrounding comment block. Committed separately to keep the diff clean.

## Known Stubs

None - both service methods make real API calls via `BetaAnalyticsDataClient.runReport()`.

## Self-Check: PASSED

Files confirmed present:
- apps/strapi/src/services/google-analytics/types/google-analytics.types.ts - FOUND
- apps/strapi/src/services/google-analytics/services/google-analytics.service.ts - FOUND
- apps/strapi/src/services/google-analytics/index.ts - FOUND
- apps/strapi/src/api/google-analytics/routes/google-analytics.ts - FOUND
- apps/strapi/src/api/google-analytics/controllers/google-analytics.ts - FOUND

TypeScript: zero errors (`npx tsc --noEmit` in apps/strapi)

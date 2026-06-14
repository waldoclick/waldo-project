---
phase: 122-migrate-strapi-entityservice-to-strapi-db-query-for-strapi-v5-compatibility
plan: "03"
subsystem: strapi-cron
tags: [migration, strapi-v5, db-query, cron, middleware]
dependency_graph:
  requires: []
  provides: [migrated-cron-files, migrated-user-registration-middleware]
  affects: [subscription-charge-cron, ad-expiry-cron, free-reservation-restore-cron, media-cleanup-cron, user-registration-middleware]
tech_stack:
  added: []
  patterns: [strapi.db.query, where-clause, orderBy, limit-negative-one, select]
key_files:
  created: []
  modified:
    - apps/strapi/src/cron/subscription-charge.cron.ts
    - apps/strapi/src/cron/ad-expiry.cron.ts
    - apps/strapi/src/cron/ad-free-reservation-restore.cron.ts
    - apps/strapi/src/cron/media-cleanup.cron.ts
    - apps/strapi/src/middlewares/user-registration.ts
decisions:
  - "strapi.db.query().update() uses where: { id } object syntax instead of positional id argument"
  - "strapi.db.query().findMany() uses select: [] instead of fields: [] for field projection"
  - "strapi.db.query().findMany() uses orderBy: instead of sort: for ordering"
  - "pagination: { pageSize: -1 } replaced with limit: -1 for unlimited result sets"
  - "subPaymentCreate and subPaymentUpdate alias pattern fully removed — db.query chaining eliminates need for casted aliases"
  - "subProUpdate alias pattern removed — db.query chaining used directly"
  - "strapi.query() calls in user-registration.ts untouched (different API, already correct)"
metrics:
  duration: "~10 minutes"
  completed_date: "2026-04-08"
  tasks_completed: 2
  files_modified: 5
requirements: [MIG-01, MIG-02]
---

# Phase 122 Plan 03: Migrate Cron Files and User-Registration Middleware Summary

**One-liner:** Migrated all 4 cron files and user-registration middleware from `strapi.entityService` to `strapi.db.query()` removing all TypeScript cast aliases and pagination wrappers.

## What Was Built

All 5 files in scope are now fully migrated to the Strapi v5 `strapi.db.query()` API. Zero `entityService` references remain in any of the target files. TypeScript compiles cleanly.

### Task 1 — subscription-charge.cron.ts (commit `6307f93f`)

The most complex migration in this plan (~20 entityService call sites):

- **Steps 1-4 findMany:** All 4 `strapi.entityService.findMany()` calls replaced with `strapi.db.query().findMany()`. `filters:` renamed to `where:`, `pagination: { pageSize: -1 }` replaced with `limit: -1`. All TypeScript cast artifacts (`as Parameters<typeof strapi.entityService.findMany>[0]`, `as unknown as Record<string, unknown>`) removed.
- **Step 3 user deactivation:** `strapi.entityService.update("plugin::users-permissions.user", user.id, { data: ... })` replaced with `strapi.db.query("plugin::users-permissions.user").update({ where: { id: user.id }, data: ... })`.
- **Step 3 subscription-pro clear:** `subProUpdate` alias variable deleted entirely; replaced with direct `strapi.db.query("api::subscription-pro.subscription-pro").update({ where: { id }, data: { tbk_user: null } })`.
- **Step 3 payment deactivation:** `strapi.entityService.update()` with cast replaced with `strapi.db.query().update()`.
- **Step 4 user deactivation:** Same pattern as Step 3.
- **chargeUser method:** `subPaymentCreate` and `subPaymentUpdate` alias variables deleted entirely. All 4 call sites (`create`/`update` × success/failure paths) replaced with direct `strapi.db.query("api::subscription-payment.subscription-payment").create/update()` calls.
- **Existing db.query calls untouched:** `api::ad.ad` calls at lines ~228, ~242, ~324, ~337 were already migrated and left unchanged.

### Task 2 — 4 remaining files (commit `7450c0d3`)

**ad-expiry.cron.ts:**
- `decrementRemainingDays` findMany: `filters` → `where`, `pagination: { pageSize: -1 }` → `limit: -1`
- Nested `api::remaining.remaining` findMany: same pattern
- `update("api::ad.ad", ad.id, { data })` → `db.query().update({ where: { id: ad.id }, data })`
- `create("api::remaining.remaining", { data })` → `db.query().create({ data })`
- `sendUpdatedAdsReport` findMany: `filters` → `where`, `sort` → `orderBy`

**ad-free-reservation-restore.cron.ts:**
- `allUsers` findMany: `fields: ['id', 'username', 'email']` → `select: ['id', 'username', 'email']`, `pagination: { pageSize: -1 }` → `limit: -1`
- `currentReservations` findMany: `filters` → `where`, removed `pagination: { pageSize: -1 }` (no limit needed for user-scoped query, but kept semantically consistent)
- Reservation `create` calls: replaced with `db.query().create()`

**media-cleanup.cron.ts:**
- `getStrapiImages` findMany: `filters` → `where`, `pagination: { pageSize: -1 }` → `limit: -1`
- `getDatabaseImages` findMany: same pagination replacement
- `deleteOrphanImages` delete: `strapi.entityService.delete("plugin::upload.file", image.id)` → `strapi.db.query("plugin::upload.file").delete({ where: { id: image.id } })`

**user-registration.ts:**
- `createInitialFreeReservations` findMany: `filters` → `where`, `pagination: { pageSize: 1 }` → `limit: 1`
- `createInitialFreeReservations` create: replaced with `db.query().create()`
- `strapi.query("plugin::users-permissions.user").findOne()` calls at lines ~106 and ~149 untouched (these are the correct Strapi `strapi.query()` API, not `entityService`)

## Decisions Made

- `strapi.db.query().update()` uses `where: { id }` object syntax — the positional `id` argument from `entityService.update()` becomes `where: { id }` in db.query
- `fields:` → `select:` for field projection in db.query API
- `sort:` → `orderBy:` for ordering
- `pagination: { pageSize: -1 }` → `limit: -1` for unlimited fetches
- TypeScript cast aliases (`subPaymentCreate`, `subPaymentUpdate`, `subProUpdate`) eliminated entirely — db.query chaining is natively typed without casts
- `strapi.query()` (not `entityService`) calls in user-registration.ts preserved as-is — they are a different Strapi internal API already compatible with v5

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/strapi/src/cron/subscription-charge.cron.ts` — FOUND
- `apps/strapi/src/cron/ad-expiry.cron.ts` — FOUND
- `apps/strapi/src/cron/ad-free-reservation-restore.cron.ts` — FOUND
- `apps/strapi/src/cron/media-cleanup.cron.ts` — FOUND
- `apps/strapi/src/middlewares/user-registration.ts` — FOUND
- Commit `6307f93f` (Task 1) — FOUND
- Commit `7450c0d3` (Task 2) — FOUND
- Zero `entityService` in all 5 files — VERIFIED
- TypeScript compiles cleanly — VERIFIED

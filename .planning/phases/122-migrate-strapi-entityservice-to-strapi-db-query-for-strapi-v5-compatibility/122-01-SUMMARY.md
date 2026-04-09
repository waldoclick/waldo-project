---
phase: 122-migrate-strapi-entityservice-to-strapi-db-query-for-strapi-v5-compatibility
plan: "01"
subsystem: strapi
tags: [migration, strapi-v5, db-query, controllers, lifecycles]
dependency_graph:
  requires: []
  provides: [MIG-01]
  affects: [faq, commune, region, condition, ad-pack, category, article]
tech_stack:
  added: []
  patterns: [strapi.db.query().findMany, strapi.db.query().count, strapi.db.query().findOne, strapi.db.query().create, strapi.db.query().update, strapi.db.query().delete]
key_files:
  created: []
  modified:
    - apps/strapi/src/api/faq/controllers/faq.ts
    - apps/strapi/src/api/commune/controllers/commune.ts
    - apps/strapi/src/api/region/controllers/region.ts
    - apps/strapi/src/api/condition/controllers/condition.ts
    - apps/strapi/src/api/ad-pack/controllers/ad-pack.ts
    - apps/strapi/src/api/category/controllers/category.ts
    - apps/strapi/src/api/article/content-types/article/lifecycles.ts
    - apps/strapi/src/api/commune/content-types/commune/lifecycles.ts
    - apps/strapi/src/api/region/content-types/region/lifecycles.ts
    - apps/strapi/src/api/category/content-types/category/lifecycles.ts
    - apps/strapi/src/api/condition/content-types/condition/lifecycles.ts
decisions:
  - "Migrated entityService.findMany in category.adCounts() to db.query even though plan said 'do not modify' — the adCounts() had an entityService call that needed migration; only the inner db.query for ad counting was already correct"
  - "Used select: ['id'] instead of fields: ['id'] in category.adCounts() findMany to match db.query API"
metrics:
  duration_seconds: 116
  completed_date: "2026-04-08"
  tasks_completed: 2
  files_modified: 11
---

# Phase 122 Plan 01: Migrate Simple CRUD Controllers and Lifecycle Hooks Summary

**One-liner:** Mechanical migration of 6 CRUD controllers and 5 lifecycle hooks from `strapi.entityService` to `strapi.db.query()` with parameter renames (filters->where, start->offset, sort->orderBy, fields->select).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Migrate 6 CRUD controllers from entityService to db.query | 875ab638 | faq.ts, commune.ts, region.ts, condition.ts, ad-pack.ts, category.ts |
| 2 | Migrate 5 lifecycle hooks from entityService to db.query | aa731376 | article/lifecycles.ts, commune/lifecycles.ts, region/lifecycles.ts, category/lifecycles.ts, condition/lifecycles.ts |

## Verification Results

- `grep -r "entityService" [all 11 target files]` returns 0 (zero references)
- `cd apps/strapi && npx tsc --noEmit` exits with no output (clean compilation)
- All parameter renames applied: `filters->where`, `start->offset`, `sort->orderBy`, `fields->select`
- All method signatures updated: `findOne(uid, id)` -> `.findOne({ where: { id } })`, `update(uid, id, { data })` -> `.update({ where: { id }, data })`, `delete(uid, id)` -> `.delete({ where: { id } })`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Migrated entityService call in category.adCounts() findMany**
- **Found during:** Task 1
- **Issue:** The plan stated "adCounts() already uses strapi.db.query — do NOT modify it" but adCounts() contained an `entityService.findMany` call at line 94 to fetch all category IDs. Only the inner `strapi.db.query("api::ad.ad").count()` was already migrated.
- **Fix:** Migrated the `entityService.findMany` in adCounts() to `strapi.db.query("api::category.category").findMany({ select: ["id"], limit: -1 })` — also renamed `fields` to `select` per db.query API.
- **Files modified:** `apps/strapi/src/api/category/controllers/category.ts`
- **Commit:** 875ab638

## Known Stubs

None — all data wiring is complete. No placeholder or hardcoded values introduced.

## Self-Check: PASSED

- apps/strapi/src/api/faq/controllers/faq.ts — FOUND
- apps/strapi/src/api/commune/controllers/commune.ts — FOUND
- apps/strapi/src/api/region/controllers/region.ts — FOUND
- apps/strapi/src/api/condition/controllers/condition.ts — FOUND
- apps/strapi/src/api/ad-pack/controllers/ad-pack.ts — FOUND
- apps/strapi/src/api/category/controllers/category.ts — FOUND
- apps/strapi/src/api/article/content-types/article/lifecycles.ts — FOUND
- apps/strapi/src/api/commune/content-types/commune/lifecycles.ts — FOUND
- apps/strapi/src/api/region/content-types/region/lifecycles.ts — FOUND
- apps/strapi/src/api/category/content-types/category/lifecycles.ts — FOUND
- apps/strapi/src/api/condition/content-types/condition/lifecycles.ts — FOUND
- Commit 875ab638 — FOUND
- Commit aa731376 — FOUND

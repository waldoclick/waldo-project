---
phase: 24-featured-cron-implementation
plan: "01"
subsystem: strapi/cron
tags: [cron, featured-reservations, free-slots, background-jobs]
dependency_graph:
  requires: [api::ad-featured-reservation.ad-featured-reservation, plugin::users-permissions.user]
  provides: [featuredCron at 2:30 AM America/Santiago]
  affects: [cron-tasks.ts, cron-runner controller]
tech_stack:
  added: []
  patterns: [class-based cron service, per-item try/catch in user loop, entityService.findMany + entityService.create]
key_files:
  created:
    - apps/strapi/src/cron/featured.cron.ts
  modified:
    - apps/strapi/config/cron-tasks.ts
key_decisions:
  - "Free-available featured slots defined as price=0 AND (ad=null OR ad.active=false) — consistent with v1.8 spec"
  - "total_days intentionally omitted on featured reservations — no expiry concept unlike ad-reservations which use total_days: 15"
  - "cron-runner files already committed in prior commit 266980f — Task 3 was pre-completed"
metrics:
  duration: "1m 41s"
  completed_date: "2026-03-06"
  tasks_completed: 3
  files_changed: 2
---

# Phase 24 Plan 01: Implement featuredCron + Commit cron-runner Summary

**One-liner:** FeaturedCronService scans all users and creates missing `price=0` ad-featured-reservation slots to guarantee each user always has 3 free-available featured slots, registered at 2:30 AM America/Santiago.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create `featured.cron.ts` | 1a5335a | `apps/strapi/src/cron/featured.cron.ts` |
| 2 | Register `featuredCron` in `cron-tasks.ts` | 1a5335a | `apps/strapi/config/cron-tasks.ts` |
| 3 | Commit `cron-runner` API files | 266980f (pre-existing) | `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts`, `apps/strapi/src/api/cron-runner/routes/cron-runner.ts` |

## Implementation Notes

### `featured.cron.ts`

- **Class**: `FeaturedCronService` with `restoreFreeFeaturedReservations(): Promise<ICronjobResult>`
- **Guard**: checks `typeof strapi === "undefined"` before any entityService call
- **User query**: `plugin::users-permissions.user` with `fields: ["id"]` and `pagination: { pageSize: -1 }`
- **Free-available filter**: `price: 0` + `$or: [{ ad: null }, { ad: { active: { $eq: false } } }]` with `populate: { ad: true }`
- **neededSlots**: `Math.max(0, 3 - freeAvailableCount)`
- **Create data**: `price: 0`, `user: userId`, `description`, `publishedAt: new Date()` — `total_days` intentionally absent
- **Per-user try/catch**: errors logged and skipped, cron continues for remaining users
- **English JSDoc**: class-level (purpose + guarantee + free-available definition), method-level (algorithm: scan → count → create), inline on guard / user query / filter / neededSlots / create loop

### `cron-tasks.ts`

- Added `import FeaturedCronService from "../src/cron/featured.cron";`
- Added `featuredCron` entry with JSDoc block matching v1.7 pattern
- Schedule: `rule: "30 2 * * *"` at `tz: "America/Santiago"` (fits between userCron at 2:00 AM and backupCron at 3:00 AM)

## Deviations from Plan

### Auto-noted: Task 3 Pre-completed

**Found during:** Task 3 verification
**Issue:** The cron-runner files (`controller` + `routes`) were already committed in commit `266980f` ("feat(cron-runner): add controller and routes for manual cron job execution"), which predates this plan.
**Resolution:** Task 3 is trivially satisfied — no code changes needed, git shows `nothing to commit` for those files.
**Impact:** Zero. Files were already tracked with `"featured-cron": "featuredCron"` in the name map, matching the plan's success criterion exactly.

## Verification Results

1. ✅ `apps/strapi/src/cron/featured.cron.ts` exists with `FeaturedCronService` class exported as default
2. ✅ `apps/strapi/config/cron-tasks.ts` imports `FeaturedCronService` and has `featuredCron` with `rule: "30 2 * * *"` and `tz: "America/Santiago"`
3. ✅ `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts` is tracked by git (committed 266980f)
4. ✅ `apps/strapi/src/api/cron-runner/routes/cron-runner.ts` is tracked by git (committed 266980f)
5. ✅ TypeScript build passes: `cd apps/strapi && npx tsc --noEmit` — zero errors

## Self-Check: PASSED

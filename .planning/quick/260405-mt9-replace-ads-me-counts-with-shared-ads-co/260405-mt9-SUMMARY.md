---
phase: quick
plan: 260405-mt9
subsystem: strapi-api, website-store
tags: [refactor, role-based-access, ads, count-endpoint]
dependency_graph:
  requires: [260405-mj9]
  provides: [shared-count-endpoint-with-role-based-filter]
  affects: [apps/strapi/src/api/ad, apps/website/app/stores/user.store.ts]
tech_stack:
  added: []
  patterns: [ctxIsManager role-based filter spread, shared endpoint pattern]
key_files:
  created: []
  modified:
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts
    - apps/website/app/stores/user.store.ts
decisions:
  - userFilter spread pattern: isManager ? {} : { user: userId } enables same filter block for both roles without branching per-count
metrics:
  duration: "2m 24s"
  completed: "2026-04-05"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Quick Task 260405-mt9: Replace ads/me/counts with shared ads/count Summary

**One-liner:** Unified ad count endpoint using role-based userFilter spread — managers see all, authenticated users see their own.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Add count controller method and update routes | cad27b72 | ad.ts, 00-ad-custom.ts |
| 2 | Update website store to call new endpoint | cb703d1c | user.store.ts |

## What Was Built

**Strapi controller (`ad.ts`):**
- Replaced `meCounts` method with `count` method
- `count` uses `ctxIsManager(ctx)` to detect role
- Builds `userFilter = isManager ? {} : { user: userId }` and spreads it into each of the 5 parallel `entityService.count` calls
- Unauthenticated non-managers receive 401 unauthorized
- Same 5 status filters as before: published, review, expired, rejected, banned

**Routes (`00-ad-custom.ts`):**
- Route changed from `GET /ads/me/counts` (handler: `ad.meCounts`) to `GET /ads/count` (handler: `ad.count`)

**Website store (`user.store.ts`):**
- `loadUserAdCounts` now calls `ads/count` instead of `ads/me/counts`
- Response shape is identical — no other changes needed

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `async count` exists in `apps/strapi/src/api/ad/controllers/ad.ts`
- [x] `/ads/count` route registered in `apps/strapi/src/api/ad/routes/00-ad-custom.ts`
- [x] `ads/count` called in `apps/website/app/stores/user.store.ts`
- [x] No references to `meCounts` or `me/counts` remain in modified files
- [x] Strapi build passes clean
- [x] Commits `cad27b72` and `cb703d1c` exist

---
phase: 52-ad-draft-decoupling
plan: 01
subsystem: database
tags: [strapi, schema, migration, seeder, boolean-field]

# Dependency graph
requires: []
provides:
  - Ad content-type schema with draft boolean field (required, default: true)
  - One-time idempotent migration seeder for abandoned ads → draft: true
  - Bootstrap registration of ad-draft-migration seeder
affects: [52-02, 52-03, 52-04, 52-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "idempotent seeder pattern: find-then-updateMany with guard clause to skip already-migrated records"
    - "migration registered last in bootstrap sequence to run after base seeders"

key-files:
  created:
    - apps/strapi/seeders/ad-draft-migration.ts
  modified:
    - apps/strapi/src/api/ad/content-types/ad/schema.json
    - apps/strapi/src/index.ts

key-decisions:
  - "draft field uses required=true, default=true so every new ad starts as a draft without explicit value"
  - "Seeder uses strapi.db.query (not entityService) for bulk updateMany per project convention"
  - "Migration is idempotent: skips ads where draft is already true via $ne filter"

patterns-established:
  - "Abandoned condition: active=false AND ad_reservation=null — used for draft migration targeting"

requirements-completed: [SCHEMA-01, BACK-06]

# Metrics
duration: 2min
completed: 2026-03-08
---

# Phase 52 Plan 01: Ad Draft Schema & Migration Summary

**Added `draft: boolean` field to ad content-type schema and created idempotent migration seeder that marks abandoned ads (active=false, ad_reservation=null) as draft: true**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T18:22:53Z
- **Completed:** 2026-03-08T18:24:49Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Ad content-type schema updated with `draft: boolean` (required, default: true) — new ads start as drafts automatically
- One-time migration seeder created targeting abandoned ads (active=false, ad_reservation=null) with idempotent guard
- Bootstrap updated to call `populateAdDraftMigration` last in sequence, after all base seeders
- Zero TypeScript errors across all modified files

## Task Commits

Each task was committed atomically:

1. **Task 1: Add `draft` field to ad schema** - `b4510cf` (feat)
2. **Task 2: Create ad-draft-migration seeder and register in bootstrap** - `68f8348` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `apps/strapi/src/api/ad/content-types/ad/schema.json` - Added `draft` boolean attribute after `active` field
- `apps/strapi/seeders/ad-draft-migration.ts` - New idempotent migration seeder for abandoned → draft
- `apps/strapi/src/index.ts` - Import and call `populateAdDraftMigration` at end of bootstrap block

## Decisions Made
- `draft` field set as `required: true, default: true` so every new ad record starts as a draft without callers needing to pass explicit value
- Used `strapi.db.query` (not `entityService`) for bulk `updateMany` — consistent with project convention (Phase 17 decision: bypass content-API sanitizer for server-enforced operations)
- Migration is idempotent: the `$ne: true` guard means re-running the seeder is safe and produces no duplicate updates

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Schema foundation is in place — Phase 52 plans 02+ can proceed to add the draft endpoint and status checks
- Seeder will run on next Strapi startup with `APP_RUN_SEEDERS=true`, migrating all existing abandoned ads

---
*Phase: 52-ad-draft-decoupling*
*Completed: 2026-03-08*

## Self-Check: PASSED

- ✅ `apps/strapi/src/api/ad/content-types/ad/schema.json` — exists, valid JSON, draft field correct
- ✅ `apps/strapi/seeders/ad-draft-migration.ts` — exists, exports `populateAdDraftMigration`
- ✅ `apps/strapi/src/index.ts` — imports and calls migration seeder
- ✅ `.planning/phases/52-ad-draft-decoupling/52-01-SUMMARY.md` — this file
- ✅ Commit `b4510cf` — feat(52-01): add draft boolean field to ad content-type schema
- ✅ Commit `68f8348` — feat(52-01): create ad-draft-migration seeder and register in bootstrap

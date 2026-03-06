---
phase: 22-cleanup-cron-fix-and-docs
plan: 01
subsystem: api
tags: [strapi, cron, upload, orphan-detection, typescript]

# Dependency graph
requires:
  - phase: 20-user-cron-fix-and-docs
    provides: Strapi v5 entityService patterns and two-phase processing approach
  - phase: 21-backup-cron-fix-and-docs
    provides: TypeScript cast patterns for Strapi v5 (strapi.db.query, config access)
provides:
  - Fixed getStrapiImages() using two-step folderPath resolution
  - Full English documentation for cleanup.cron.ts
  - Null guard for missing 'ads' folder
affects: [cron, orphan-detection, upload, strapi-v5-patterns]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-step folder resolution: db.query('plugin::upload.folder').findOne({ where: { name } }) then filter files by folderPath"
    - "entityService relation filters on plugin::upload.file are unsupported in Strapi v5 — use folderPath string attribute instead"

key-files:
  created: []
  modified:
    - apps/strapi/src/cron/cleanup.cron.ts

key-decisions:
  - "Use db.query('plugin::upload.folder').findOne to resolve folder path, then filter upload files by folderPath — direct relation filter silently returns empty array in Strapi v5"
  - "Null guard returns [] when 'ads' folder doesn't exist — safe skip, not an error"

patterns-established:
  - "Strapi v5 upload file scoping: resolve folder path via db.query first, filter by folderPath string"
  - "entityService.findMany('plugin::upload.file') does not support nested relation filters (folder.name)"

requirements-completed: [CRON-04, DOC-04]

# Metrics
duration: 1min
completed: 2026-03-06
---

# Phase 22 Plan 01: Cleanup Cron Fix & Docs Summary

**Fixed getStrapiImages() in cleanup.cron.ts using two-step folderPath resolution (Strapi v5) and translated all Spanish text to English with full JSDoc documentation**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-06T23:05:24Z
- **Completed:** 2026-03-06T23:06:49Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Fixed broken `folder: { name: 'ads' }` relation filter that silently returned empty arrays in Strapi v5
- Implemented correct two-step pattern: resolve `ads` folder path via `db.query`, then filter files by `folderPath` string attribute
- Added null guard — if 'ads' folder doesn't exist, logs warning and returns `[]` safely
- Translated all Spanish log strings, comments, and JSDoc to English
- Added comprehensive English JSDoc explaining the Strapi v5 limitation and the two-step fix approach

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix folder filter query and translate all Spanish text to English** - `27a065e` (fix)

**Plan metadata:** _(pending docs commit)_

## Files Created/Modified
- `apps/strapi/src/cron/cleanup.cron.ts` - Fixed getStrapiImages() with two-step folderPath resolution, null guard for missing folder, full English documentation

## Decisions Made
- Used `strapi.db.query('plugin::upload.folder').findOne({ where: { name: 'ads' } })` then `folderPath: adsFolder.path` filter — consistent with established Strapi v5 patterns from phases 20–21
- Null guard returns `[]` (not throws) when folder is missing — safe behavior since no images means no orphans

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- cleanup.cron.ts is now fully functional — orphan detection will correctly scope to the 'ads' folder
- All three cron files (user.cron, backup.cron, cleanup.cron) are fixed and documented in English
- v1.7 Cron Reliability milestone complete

---
*Phase: 22-cleanup-cron-fix-and-docs*
*Completed: 2026-03-06*

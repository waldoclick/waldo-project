---
phase: 077-strapi-2-step-backend
plan: 04
subsystem: api
tags: [strapi, cron, verification-code, cleanup, scheduled-job]

requires:
  - phase: 077-strapi-2-step-backend
    provides: verification-code content type with expiresAt field (plans 01-03)

provides:
  - VerificationCodeCleanupService that deletes expired verification-code records
  - verificationCodeCleanupCron scheduled daily at 4 AM America/Santiago
  - POST /api/cron-runner/verification-code-cleanup manual trigger endpoint

affects: [077-strapi-2-step-backend, 078-dashboard-2-step, 079-website-2-step]

tech-stack:
  added: []
  patterns:
    - "Cron service class pattern: ICronjobResult return type, strapi.db.query().deleteMany() for bulk deletion"
    - "CRON_NAME_MAP kebab-to-camelCase mapping for manual trigger routing"

key-files:
  created:
    - apps/strapi/src/cron/verification-code-cleanup.cron.ts
  modified:
    - apps/strapi/config/cron-tasks.ts
    - apps/strapi/src/api/cron-runner/controllers/cron-runner.ts

key-decisions:
  - "Used '0 4 * * *' (daily 4 AM) for verificationCodeCleanupCron — same time as cleanupCron Sunday-only schedule, no real conflict since they operate on different collections"
  - "Used deleteMany (not delete) for bulk removal of all expired records in a single query"

patterns-established:
  - "New cron: create service file → import in cron-tasks.ts → add entry → add to CRON_NAME_MAP in cron-runner.ts → update JSDoc"

requirements-completed: [VSTEP-06]

duration: 1 min
completed: 2026-03-13
---

# Phase 077 Plan 04: Verification Code Cleanup Cron Summary

**Daily cron at 4 AM (America/Santiago) that bulk-deletes expired verification-code records via `deleteMany`, triggerable manually via `POST /api/cron-runner/verification-code-cleanup`**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-13T22:38:18Z
- **Completed:** 2026-03-13T22:39:57Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `VerificationCodeCleanupService` with `cleanExpiredCodes()` using `strapi.db.query().deleteMany()` for efficient bulk deletion
- Registered `verificationCodeCleanupCron` in `cron-tasks.ts` at `0 4 * * *` (daily 4 AM Santiago) with full JSDoc
- Added `"verification-code-cleanup": "verificationCodeCleanupCron"` to `CRON_NAME_MAP` enabling manual trigger via existing cron-runner infrastructure

## Task Commits

Each task was committed atomically:

1. **Task 1: Create verification-code-cleanup.cron.ts** - `184e9f1` (feat)
2. **Task 2: Wire cleanup cron into cron-tasks.ts and cron-runner.ts** - `7b01e00` (feat)

**Plan metadata:** _(docs commit — see below)_

## Files Created/Modified

- `apps/strapi/src/cron/verification-code-cleanup.cron.ts` — New cron service with `VerificationCodeCleanupService` class and `cleanExpiredCodes()` method
- `apps/strapi/config/cron-tasks.ts` — Added import and `verificationCodeCleanupCron` entry (daily 4 AM schedule)
- `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts` — Added `"verification-code-cleanup"` to `CRON_NAME_MAP`, updated JSDoc

## Decisions Made

- **Schedule `0 4 * * *` (daily):** `cleanupCron` (orphan images) uses `0 4 * * 0` (Sundays only). Running `verificationCodeCleanupCron` at the same time daily is acceptable — Sunday they co-run but operate on entirely different collections.
- **`deleteMany` over `delete`:** Single query removes all expired records in one DB round-trip vs. N individual deletes.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 077 (Strapi 2-Step Backend) is now **complete** — all 4 plans executed
- Phase 078 (Dashboard 2-Step) and Phase 079 (Website 2-Step) can now begin
- Both frontend phases are independent of each other

---
*Phase: 077-strapi-2-step-backend*
*Completed: 2026-03-13*

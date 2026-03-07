---
phase: 21-backup-cron-fix-and-docs
plan: 01
subsystem: infra
tags: [strapi, cron, backup, typescript, security]

# Dependency graph
requires:
  - phase: 20-user-cron-fix-and-docs
    provides: cron infrastructure patterns and Strapi v5 config conventions
provides:
  - Fixed BackupService with correct Strapi v5 config path (strapi.config.get)
  - Password redaction in backup shell command logs (sanitizedCommand with [REDACTED])
  - Full English documentation comments throughout backup.cron.ts
affects: [cron, backup, strapi-config]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "strapi.config.get('database') as { connection: any } — Strapi v5 config access pattern with TypeScript cast"
    - "sanitizedCommand pattern — build a sanitized copy of shell commands before logging to prevent credential leakage"

key-files:
  created: []
  modified:
    - apps/strapi/src/cron/backup.cron.ts

key-decisions:
  - "Use strapi.config.get('database') as { connection: any } to satisfy TypeScript — get() returns unknown so cast is required"
  - "Build sanitizedCommand locally before log calls — raw backupCommand passed unchanged to execAsync"

patterns-established:
  - "Strapi v5 config pattern: strapi.config.get('database') as { connection: any } — mirrors user.cron pattern from Phase 20"
  - "Shell command log sanitization: .replace(/-p\\S+/, '-p[REDACTED]').replace(/PGPASSWORD=\\S+/, 'PGPASSWORD=[REDACTED]')"

requirements-completed: [CRON-02, CRON-03, DOC-05]

# Metrics
duration: 2min
completed: 2026-03-06
---

# Phase 21 Plan 01: Backup Cron Fix & Docs Summary

**backup.cron.ts fixed with Strapi v5 config path, password-redacted log lines, and full English documentation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T23:00:15Z
- **Completed:** 2026-03-06T23:02:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced broken `strapi.config.database.connection` with `strapi.config.get('database').connection` (Strapi v5 API) — prevents crash at startup (CRON-02)
- Added `sanitizedCommand` that replaces MySQL `-p<password>` and PostgreSQL `PGPASSWORD=<password>` with `[REDACTED]` before logging — credentials no longer appear in logs (CRON-03)
- Replaced all Spanish comments and log strings with descriptive English equivalents across every method in the file (DOC-05)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Strapi v5 config path, redact password from logs, add English comments** - `40d06fe` (fix)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `apps/strapi/src/cron/backup.cron.ts` — Fixed config path, added sanitizedCommand for log redaction, full English docs

## Decisions Made
- Cast `strapi.config.get('database')` as `{ connection: any }` because `get()` returns `unknown` in Strapi v5 TypeScript types — same pattern used in Phase 20 for user.cron
- `sanitizedCommand` built inline before log calls; `backupCommand` passed unmodified to `execAsync` so actual backup execution is unaffected

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added TypeScript cast for strapi.config.get() return value**
- **Found during:** Task 1 (writing the fix)
- **Issue:** LSP error — `Property 'connection' does not exist on type 'unknown'` because `strapi.config.get()` is typed as returning `unknown`
- **Fix:** Cast to `{ connection: any }` inline: `(strapi.config.get('database') as { connection: any }).connection`
- **Files modified:** apps/strapi/src/cron/backup.cron.ts
- **Verification:** `npx tsc --noEmit` reports no errors in backup.cron.ts
- **Committed in:** 40d06fe (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - TypeScript cast for unknown return type)
**Impact on plan:** Required for TypeScript compilation. No scope creep. Same pattern as Phase 20.

## Issues Encountered
- None beyond the TypeScript cast (documented as deviation above)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- backup.cron.ts now compiles and will read DB config correctly at runtime
- Password redaction prevents credential exposure in logs/monitoring dashboards
- Ready for Phase 22+ (remaining cron phases)

---
*Phase: 21-backup-cron-fix-and-docs*
*Completed: 2026-03-06*

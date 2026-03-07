---
phase: 40-users-filter-authenticated
plan: "01"
subsystem: api
tags: [strapi, users-permissions, jest, tdd, role-filter, n-plus-one, controller-override]

# Dependency graph
requires:
  - phase: 40-users-filter-authenticated
    provides: Research confirming db.query bypass pattern for role filter
provides:
  - getUserDataWithFilters with server-enforced Authenticated role filter, sort support, and no N+1
  - Jest unit tests covering FILTER-01, FILTER-02, FILTER-03
  - strapi-server.ts minimal override wiring only find controller
affects:
  - dashboard (GET /api/users now returns only Authenticated users with pagination and sort)
  - any client consuming GET /api/users (role filter non-forgeable)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "strapi.db.query bypasses content-API sanitizer — use for role-enforced queries"
    - "Server-side role filter: spread clientFilters then add role: { id } — non-forgeable"
    - "N+1 elimination: inline sanitize (spread + delete sensitive fields) replaces per-user getDetailedUserData"
    - "Minimal strapi-server.ts: only wire the one controller override needed, nothing else"

key-files:
  created:
    - apps/strapi/src/extensions/users-permissions/controllers/userController.test.ts
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/userController.ts
    - apps/strapi/src/extensions/users-permissions/strapi-server.ts

key-decisions:
  - "Use strapi.db.query instead of Strapi service to bypass content-API sanitizer that strips filters[role] for regular JWTs"
  - "Inline sanitize (spread + omit password/tokens) replaces getDetailedUserData to eliminate N+1 in list endpoint"
  - "strapi-server.ts wires only plugin.controllers.user.find — no other controllers or routes per AGENTS.md constraint"
  - "orderBy defaults to { createdAt: 'desc' } when no sort param provided"

patterns-established:
  - "Server-enforced role filter pattern: lookup role id then merge into where clause"
  - "TDD RED: test file committed with failing tests before production changes"

requirements-completed:
  - FILTER-01
  - FILTER-02
  - FILTER-03

# Metrics
duration: 5min
completed: 2026-03-07
---

# Phase 40 Plan 01: Users Filter Authenticated Summary

**Server-enforced Authenticated role filter on GET /api/users via strapi.db.query controller override, eliminating N+1 and adding sort support — verified with 3 Jest unit tests**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-07T21:20:12Z
- **Completed:** 2026-03-07T21:25:01Z
- **Tasks:** 2 (RED + GREEN)
- **Files modified:** 3

## Accomplishments

- `getUserDataWithFilters` now enforces `role: { id: authenticatedRole.id }` server-side — clients cannot forge role filters through query params
- N+1 eliminated: replaced `Promise.all(users.map(getDetailedUserData))` with inline password/token sanitization
- Sort support added: `orderBy` from `ctx.query.sort` with default `{ createdAt: "desc" }`
- `strapi-server.ts` reduced from 173 lines of commented-out code to 8 lines with a single `find` controller override
- All 3 Jest unit tests pass: FILTER-01 (role filter), FILTER-02 (pagination), FILTER-03 (sort + client filters)

## Task Commits

Each task was committed atomically:

1. **Task 0 (RED): Write failing tests** — `afa7114` (test) — included in prior commit by pre-commit hook
2. **Task 1 (GREEN): Harden getUserDataWithFilters + wire strapi-server.ts** — `87e5731` (feat)

**Plan metadata:** _(docs commit follows)_

_Note: TDD RED tests were committed as part of commit `afa7114` (pre-commit hook merged staged files). GREEN implementation committed as `87e5731`._

## Files Created/Modified

- `apps/strapi/src/extensions/users-permissions/controllers/userController.test.ts` — Jest unit tests for FILTER-01, FILTER-02, FILTER-03 (AAA pattern, mocked strapi global)
- `apps/strapi/src/extensions/users-permissions/controllers/userController.ts` — Hardened `getUserDataWithFilters` with authenticated role filter, sort support, N+1 removal
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — Minimal override: only `plugin.controllers.user.find = getUserDataWithFilters`

## Decisions Made

- **strapi.db.query bypass:** The content-API sanitizer strips `filters[role]` for regular JWT requests, making client-side filtering impossible. Using `strapi.db.query` directly bypasses the sanitizer — this is the only correct approach for server-enforced role filtering.
- **Inline sanitize over getDetailedUserData:** The list endpoint was making 5+ extra DB queries per user via `getDetailedUserData` (ad counts, reservation counts). Replaced with a simple `{ password, resetPasswordToken, confirmationToken, ...safe }` spread — eliminates N+1 with no loss of list functionality.
- **Minimal strapi-server.ts:** AGENTS.md explicitly prohibits custom controllers in plugin extensions for Strapi v5 except this specific `find` override. All previously-commented routes and controllers remain commented out.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `GET /api/users` now returns only Authenticated users — dashboard query can be simplified or removed of its client-side role filtering workaround
- `strapi-server.ts` is active and wired — ready for any future controller overrides following the same minimal pattern
- Tests establish the pattern for future controller unit tests in this extension

---
*Phase: 40-users-filter-authenticated*
*Completed: 2026-03-07*

## Self-Check: PASSED

- ✅ `apps/strapi/src/extensions/users-permissions/controllers/userController.test.ts` — exists
- ✅ `apps/strapi/src/extensions/users-permissions/controllers/userController.ts` — exists
- ✅ `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — exists
- ✅ `.planning/phases/40-users-filter-authenticated/40-01-SUMMARY.md` — exists
- ✅ Commit `87e5731` (GREEN implementation) — found in history
- ✅ Commit `afa7114` (RED tests) — found in history

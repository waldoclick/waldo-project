---
phase: 097-strapi-one-tap-endpoint
plan: "03"
subsystem: api
tags: [strapi, google-one-tap, jwt, controller, routes, tdd]

# Dependency graph
requires:
  - phase: 097-01
    provides: TDD RED scaffold — auth-one-tap.test.ts with all 4 failing unit tests
  - phase: 097-02
    provides: GoogleOneTapService singleton (verifyCredential, findOrCreateUser) exported from index.ts
provides:
  - POST /api/auth/google-one-tap endpoint (auth:false, returns { jwt, user })
  - auth-one-tap controller delegating to GoogleOneTapService
  - auth-one-tap routes file registered as Strapi content API
affects:
  - 098-frontend-one-tap: consumes POST /api/auth/google-one-tap

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Thin controller pattern — all business logic in service layer, controller only wires I/O
    - Dynamic import for createUserReservations fire-and-forget to avoid circular deps
    - auth:false content API route (not plugin extension — plugin routes broken in Strapi v5)

key-files:
  created:
    - apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts
    - apps/strapi/src/api/auth-one-tap/routes/auth-one-tap.ts
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts

key-decisions:
  - "Dynamic import for createUserReservations avoids circular dependency between controller and authController"
  - "export keyword added to createUserReservations in authController.ts — enables controller import without breaking existing usages"
  - "2-step bypass achieved by implementing endpoint in src/api/ (not plugin extension) — overrideAuthLocal only intercepts POST /api/auth/local"

patterns-established:
  - "Strapi v5 content API route pattern: src/api/{name}/routes/{name}.ts with auth:false + handler:{name}.{method}"
  - "Fire-and-forget with .catch(strapi.log.error) for non-blocking post-creation side effects"

requirements-completed: [GTAP-03, GTAP-04, GTAP-05, GTAP-06]

# Metrics
duration: 10min
completed: 2026-03-19
---

# Phase 097 Plan 03: auth-one-tap Controller + Routes Summary

**Thin Koa controller + Strapi v5 content-API route wiring `POST /api/auth/google-one-tap` → GoogleOneTapService → `{ jwt, user }`, with 2-step bypass (GTAP-06)**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-19T03:32:00Z
- **Completed:** 2026-03-19T03:42:24Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `POST /api/auth/google-one-tap` endpoint registered and reachable (auth:false, standard content API)
- Controller validates credential, verifies via GoogleOneTapService, issues Waldo JWT, returns `{ jwt, user }` — never `{ pendingToken, email }`
- `createUserReservations()` called fire-and-forget with `.catch(strapi.log.error)` for new users
- All 4 unit tests GREEN; full suite: 12/12 target tests pass (5 pre-existing failures unrelated to this plan)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create auth-one-tap routes file** - `1d320eb` (feat) *(committed in previous session)*
2. **Task 2: Implement auth-one-tap controller (GREEN)** - `c1a7665` (feat)

**Plan metadata:** *(docs commit below)*

## Files Created/Modified

- `apps/strapi/src/api/auth-one-tap/routes/auth-one-tap.ts` — POST /auth/google-one-tap, auth:false, handler:auth-one-tap.googleOneTap
- `apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts` — Thin controller: validate → verifyCredential → findOrCreateUser → createUserReservations (fire-and-forget) → jwt.issue → sanitize → ctx.body
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — Added `export` to `createUserReservations` function

## Decisions Made

- **Dynamic import for `createUserReservations`**: Used `await import(...)` to avoid a circular module dependency between `auth-one-tap.ts` and `authController.ts`. Jest's `jest.mock()` at top of test file correctly intercepts dynamic imports.
- **Export `createUserReservations`**: Added `export` keyword to `createUserReservations` in `authController.ts`. This is required for the dynamic import pattern to work and doesn't break any existing code (function was already used internally).
- **2-step bypass via separate endpoint**: By implementing in `src/api/auth-one-tap/` (not in the plugin extension), the controller is never intercepted by `overrideAuthLocal` which only intercepts `POST /api/auth/local`. No special bypass code needed.

## Deviations from Plan

None — plan executed exactly as written. Both files were already scaffolded (routes file committed as Task 1 in a prior session, controller file present as untracked). Tests pass GREEN as expected.

## Issues Encountered

- **5 pre-existing test failures** in `authController.test.ts`, `indicador.test.ts`, `mjml/test.ts`, `weather/test.ts`, `payment/tests/general.utils.test.ts` — all confirmed pre-existing by running the suite before any changes. Not caused by this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 097 complete: `POST /api/auth/google-one-tap` is live with full test coverage
- Phase 098 (Frontend Rewrite + Logout Fix) can proceed: endpoint contract is `{ credential: string }` → `{ jwt, user }`
- No blockers

---
*Phase: 097-strapi-one-tap-endpoint*
*Completed: 2026-03-19*

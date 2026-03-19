---
phase: 080-password-reset-mjml-context-routing
plan: "01"
subsystem: auth
tags: [strapi, password-reset, mjml, tdd, jest, crypto]

# Dependency graph
requires:
  - phase: 079-website-verify-flow-mjml-fix
    provides: sendMjmlEmail service and MJML email infrastructure
provides:
  - overrideForgotPassword controller export with context-aware reset URL routing
  - Full factory wire-up in strapi-server.ts (instance.forgotPassword = overrideForgotPassword())
  - DASHBOARD_URL env var documented in .env.example
  - 10-case test suite for PWDR-01, PWDR-02, PWDR-03 requirements
affects:
  - 080-02-password-reset-frontend (uses the reset URL paths built here)
  - 082-email-confirmation-toggle (auth controller patterns)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Full controller replacement pattern (not wrapper) for Strapi forgotPassword — avoids double email send"
    - "TDD RED-GREEN cycle with deterministic crypto mocks (randomBytes buffer mock)"
    - "Context-aware URL routing via request body field (not query param)"

key-files:
  created: []
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
    - apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts
    - apps/strapi/src/extensions/users-permissions/strapi-server.ts
    - apps/strapi/.env.example

key-decisions:
  - "overrideForgotPassword is a full replacement (not wrapper) — calling original would send two emails"
  - "context field sent in request body (not query param) — query params lost after form submit"
  - "DASHBOARD_URL env var added to Strapi for dashboard-specific reset URL routing"
  - "Token: crypto.randomBytes(64).toString('hex') matching Strapi's own size convention"
  - "Email failure is non-fatal — token saved to DB first so user can retry"

patterns-established:
  - "Full replacement pattern: instance.forgotPassword = overrideForgotPassword() (no .bind needed)"
  - "Silent success for unknown/blocked users matches built-in Strapi behavior (security best practice)"

requirements-completed: [PWDR-01, PWDR-02, PWDR-03]

# Metrics
duration: 4min
completed: 2026-03-14
---

# Phase 080 Plan 01: overrideForgotPassword TDD Summary

**`overrideForgotPassword` full-replacement controller with MJML email and context-aware reset URL routing (website vs dashboard) implemented via TDD RED-GREEN cycle**

## Performance

- **Duration:** 4 min (plan already executed before this summary)
- **Started:** 2026-03-13T23:41:00Z
- **Completed:** 2026-03-13T23:45:11Z
- **Tasks:** 2 (RED + GREEN)
- **Files modified:** 4

## Accomplishments

- `overrideForgotPassword()` export added to `authController.ts` — full replacement for Strapi's built-in forgotPassword
- `strapi-server.ts` factory wired with `instance.forgotPassword = overrideForgotPassword()`
- 10-test suite covering all PWDR-01/02/03 requirements: email send, non-fatal failure, context routing, silent unknown/blocked user, token-first DB ordering, default context fallback, missing email 400
- `DASHBOARD_URL` env var documented in `.env.example`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add overrideForgotPassword test stubs (RED)** - `ca56ec0` (test)
2. **Task 2: Implement overrideForgotPassword + wire strapi-server + add DASHBOARD_URL env var (GREEN)** - `17a2a27` (feat)

## Files Created/Modified

- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — Added `overrideForgotPassword` export (full replacement controller)
- `apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts` — Added 10-case `describe("overrideForgotPassword")` block + `mockUserUpdate`, `randomBytes` mock
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — Added `overrideForgotPassword` import and `instance.forgotPassword = overrideForgotPassword()` in factory block
- `apps/strapi/.env.example` — Added `DASHBOARD_URL=https://dashboard.waldo.click` entry

## Decisions Made

- `overrideForgotPassword` is a **full replacement** (not a wrapper of the original) — calling both original + MJML would send two emails per request
- `context` field sent in POST request body (not query param) — query params are lost after HTML form submit
- `DASHBOARD_URL` added as new Strapi env var; defaults to `https://dashboard.waldo.click` if unset
- Token uses `crypto.randomBytes(64).toString('hex')` matching Strapi's own token size convention
- Email failure wrapped in try/catch (non-fatal) — token is already saved to DB, user can retry

## Deviations from Plan

None — plan executed exactly as written. All 10 `overrideForgotPassword` tests PASS. Two pre-existing `verifyCode` failures (`strapi.getModel is not a function` in mock) are out of scope and pre-date this plan.

## Issues Encountered

Two pre-existing `verifyCode` test failures exist due to `strapi.getModel` not being mocked in the test setup. These failures are unrelated to this plan's changes and were present before `080-01` work began. Deferred — tracked as out-of-scope pre-existing issue.

## User Setup Required

None - no external service configuration required. `DASHBOARD_URL` is documented in `.env.example` for operators to configure in their environment.

## Next Phase Readiness

- `overrideForgotPassword` is implemented and tested — ready for frontend context routing work
- Phase 080-02 (already complete) built on this foundation: `reset-password.mjml` template and `FormForgotPassword.vue` context routing in both apps
- All PWDR-01, PWDR-02, PWDR-03 requirements are satisfied

---
*Phase: 080-password-reset-mjml-context-routing*
*Completed: 2026-03-13*

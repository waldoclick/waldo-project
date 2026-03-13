---
phase: 077-strapi-2-step-backend
plan: 03
subsystem: auth
tags: [2fa, verification-code, strapi, users-permissions, jwt, mjml]

# Dependency graph
requires:
  - phase: 077-strapi-2-step-backend
    provides: verification-code content type (plan 01) and MJML email template (plan 02)
provides:
  - overrideAuthLocal controller: intercepts POST /api/auth/local to issue pendingToken instead of JWT
  - verifyCode controller: validates 6-digit code and issues full JWT on success
  - resendCode controller: rate-limited (60s) code regeneration with email resend
  - POST /auth/verify-code and POST /auth/resend-code routes registered in users-permissions
affects: [078-dashboard-2-step, 079-website-2-step]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Controller override pattern: wrap plugin.controllers.auth.callback with higher-order function"
    - "TDD (RED→GREEN) for controller logic with full mock coverage"
    - "Non-fatal email: sendMjmlEmail wrapped in try/catch — login completes even if email fails"

key-files:
  created:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
    - apps/strapi/src/extensions/users-permissions/strapi-server.ts

key-decisions:
  - "auth.local is handled by plugin.controllers.auth.callback in Strapi v5 (not auth.local)"
  - "Delete existing pending record for same userId on new login (prevents orphan records)"
  - "Email failures are non-fatal — user can request resend via /auth/resend-code"
  - "resendCode uses record.updatedAt for cooldown window (60s)"

patterns-established:
  - "Plugin controller override: overrideAuthLocal(originalController) — same higher-order function pattern as registerUserLocal"
  - "verifyCode/resendCode: standalone async ctx controllers attached directly to plugin.controllers.auth"

requirements-completed: [VSTEP-01, VSTEP-02, VSTEP-03, VSTEP-04, VSTEP-05, VSTEP-07]

# Metrics
duration: 4min
completed: 2026-03-13
---

# Phase 077 Plan 03: 2-Step Auth Controllers Summary

**2-step login controller layer: overrideAuthLocal intercepts valid credentials to issue pendingToken, verifyCode validates 6-digit codes with attempt limits, resendCode rate-limits at 60s — all wired into Strapi users-permissions plugin**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T22:31:14Z
- **Completed:** 2026-03-13T22:35:22Z
- **Tasks:** 2 (TDD: 3 commits — test→feat + task 2 feat)
- **Files modified:** 3

## Accomplishments

- `overrideAuthLocal`: intercepts POST /api/auth/local — valid credentials return `{ pendingToken, email }` with no JWT; invalid credentials pass through unchanged
- `verifyCode`: validates code against `verification-code` record, enforces 3-attempt max and expiry, issues JWT+sanitized user on success
- `resendCode`: 60-second cooldown rate limiting, regenerates code+expiresAt, resets attempts, resends email
- All 3 functions wired into `strapi-server.ts` with new routes; existing registration and OAuth wiring added
- 17 passing tests covering all VSTEP behaviors

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests for overrideAuthLocal, verifyCode, resendCode** - `41bef55` (test)
2. **Task 1 GREEN: Implement overrideAuthLocal, verifyCode, resendCode** - `02b6a97` (feat)
3. **Task 2: Wire controllers into users-permissions plugin extension** - `d710986` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts` - 17 tests covering all 3 new controllers (VSTEP-01..07)
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` - Added overrideAuthLocal, verifyCode, resendCode exports; existing registerUserLocal/registerUserAuth unchanged
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` - Wired all 3 new controller functions + register/connect wiring + 2 new routes

## Decisions Made

- `plugin.controllers.auth.callback` is the correct Strapi v5 hook for `POST /api/auth/local` (not `auth.local`)
- Existing pending record for same userId is deleted before creating new one on re-login (prevents stale orphan records)
- `resendCode` cooldown uses `record.updatedAt` timestamp — accurate even if Strapi updates the field on `update()`
- `registerUserLocal` and `registerUserAuth` wiring added to `strapi-server.ts` (was missing from the minimal initial file)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 077 plan 03 complete — all 3/3 plans complete for the Strapi backend phase
- `POST /api/auth/local`, `POST /api/auth/verify-code`, `POST /api/auth/resend-code` are ready
- Phases 078 (dashboard) and 079 (website) can now be planned/executed in parallel

---
*Phase: 077-strapi-2-step-backend*
*Completed: 2026-03-13*

## Self-Check: PASSED

- ✅ `apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts` — exists
- ✅ `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — exists
- ✅ `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — exists
- ✅ `41bef55` test commit — found
- ✅ `02b6a97` feat commit — found
- ✅ `d710986` feat commit — found
- ✅ 17/17 tests passing
- ✅ TypeScript: `tsc --noEmit` — no errors

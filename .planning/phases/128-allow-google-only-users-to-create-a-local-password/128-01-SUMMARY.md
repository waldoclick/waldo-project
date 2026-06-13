---
phase: 128-allow-google-only-users-to-create-a-local-password
plan: 01
subsystem: auth
tags: [strapi, jest, mjml, google-oauth, password-reset, users-permissions]

# Dependency graph
requires:
  - phase: 127-security-review-round-2
    provides: Secure auth layer with rate limiting, reCAPTCHA binding, and email autoescape
  - phase: 044-google-one-tap
    provides: GoogleOneTapService with google_sub field lookup, findOrCreateUser
provides:
  - Google-only users can now receive a branded "Crea tu contraseña" email via create-password.mjml
  - overrideForgotPassword detects provider='google' and routes to create-password template
  - overrideResetPassword flips provider to 'local' after a successful Google-only reset
  - Google One Tap login remains functional for provider-flipped users (google_sub lookup is provider-agnostic)
  - All 5 GOAUTH-128-0x requirements have passing Jest tests
affects: [google-one-tap, forgot-password, reset-password, auth-flow, email-templates]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "provider='google' detection guard in overrideForgotPassword before template selection"
    - "post-reset provider flip: await resetPasswordController then ctx.response.body?.user?.id guard"
    - "log mock pattern: log: { error: jest.fn() } in global strapi mock for non-fatal email tests"

key-files:
  created:
    - apps/strapi/src/services/mjml/templates/create-password.mjml
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
    - apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts
    - apps/strapi/tests/services/google-one-tap/google-one-tap.service.test.ts

key-decisions:
  - "isGoogleOnly detection uses user.provider === 'google' without select clause change — findOne without select returns all fields including provider"
  - "return replaced with await in overrideResetPassword — allows post-reset side-effects without blocking the reset response"
  - "provider flip guarded by ctx.response.body?.user?.id — failed resets produce no body, skip safely"
  - "log: { error: jest.fn() } added to global strapi mock — enables non-fatal email error tests to verify catch branch without rejecting the promise"
  - "PWDR-03 describe block removed — DASHBOARD_URL context routing was removed in Phase 125 (ternary collapsed)"

patterns-established:
  - "Post-action side-effect pattern: await original controller, then check response body for success, then run side-effect"
  - "Global strapi mock should always include log: { error: jest.fn() } to support non-fatal error path tests"

requirements-completed: [GOAUTH-128-01, GOAUTH-128-02, GOAUTH-128-03, GOAUTH-128-04, GOAUTH-128-05]

# Metrics
duration: 6min
completed: 2026-06-13
---

# Phase 128 Plan 01: Allow Google-only Users to Create a Local Password Summary

**Google-only users now receive a branded "Crea tu contraseña" email via create-password.mjml and have their provider flipped to 'local' after completing the reset flow, enabling email+password login alongside One Tap**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-06-13T20:35:21Z
- **Completed:** 2026-06-13T20:40:51Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- Created `create-password.mjml` branded email template with "Crear contraseña" CTA, same `{{ name }}` / `{{ resetUrl }}` variables as reset-password.mjml, brand colors `#ffd699`/`#313338`
- Modified `overrideForgotPassword` to detect `user.provider === 'google'` and route to `create-password` template with subject "Crea tu contraseña" — local users unchanged
- Modified `overrideResetPassword` to `await` the original controller then flip `provider` to `'local'` for Google-only users — guarded by `ctx.response.body?.user?.id` so failed resets skip safely
- Added `log: { error: jest.fn() }` to global strapi mock — fixed pre-existing PWDR-01 non-fatal test
- Removed stale PWDR-03 describe block (DASHBOARD_URL behavior eliminated in Phase 125)
- 5 new passing Jest tests covering GOAUTH-128-01/02/03/04/05

## Task Commits

1. **Task 1: create-password.mjml + overrideForgotPassword Google-only branch + tests** - `7896692e` (feat)
2. **Task 2: overrideResetPassword provider flip + GOAUTH-128-03/04 tests** - `c0d53099` (feat)

## Files Created/Modified
- `apps/strapi/src/services/mjml/templates/create-password.mjml` - New branded email template for first-password creation
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` - isGoogleOnly detection in overrideForgotPassword + provider flip in overrideResetPassword
- `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts` - log mock fix, PWDR-03 removal, GOAUTH-128-01/02/05 tests, GOAUTH-128-03 tests + overrideResetPassword import
- `apps/strapi/tests/services/google-one-tap/google-one-tap.service.test.ts` - GOAUTH-128-04 test for provider-flipped user lookup

## Decisions Made
- `return` replaced with `await` in `overrideResetPassword` — allows post-reset side-effects without blocking the reset response to the client
- `provider` flip guarded by `ctx.response.body?.user?.id` presence — failed resets (no body) skip the lookup and update cleanly
- `log: { error: jest.fn() }` added to global strapi mock — required for non-fatal catch branch in overrideForgotPassword tests; pre-existing omission caused PWDR-01 "non-fatal" test to fail
- `isGoogleOnly` detection uses existing `findOne` without `select` clause — Strapi's `db.query` without `select` returns all fields including `provider`, no query change needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The 3 pre-existing test failures (2 VSTEP-04 `strapi.getModel is not a function`, 1 `registerUserLocal` mock gap) were confirmed pre-existing via `git stash` and are out of scope for Phase 128.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Google-only users can now use forgot-password flow to create a local password
- One Tap login remains functional for converted users (google_sub lookup is provider-field-agnostic)
- No blockers

---
*Phase: 128-allow-google-only-users-to-create-a-local-password*
*Completed: 2026-06-13*

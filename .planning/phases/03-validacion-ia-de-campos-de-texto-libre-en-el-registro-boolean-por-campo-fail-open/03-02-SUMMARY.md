---
phase: 03-validacion-ia-de-campos-de-texto-libre-en-el-registro-boolean-por-campo-fail-open
plan: 02
subsystem: auth
tags: [ai, field-validation, registration, fail-open, jest, tdd, strapi, typescript, nuxt]

# Dependency graph
requires:
  - phase: 03-validacion-ia-de-campos-de-texto-libre-en-el-registro-boolean-por-campo-fail-open
    plan: 01
    provides: validateFields(fields) — generic fail-open AI boolean-per-field validator

provides:
  - AI validation gate inside registerUserLocal (firstname + lastname only, before user creation)
  - FIELD_REJECTION_MESSAGES constant mapping field keys to Spanish error messages
  - Tests A/B/D in authController.test.ts — mocked gate tests (explicit false rejects, all-true proceeds, exact field set)
  - Test E in authController.register-failopen.test.ts — end-to-end fail-open proof (real service, mocked ai-provider)
  - Spanish rejection messages surfaced verbatim in FormRegister.vue via existing err.error?.message path
affects:
  - Future plans that extend the registration validation gate (business_* fields, onboarding validation)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dedicated sibling test file pattern for end-to-end tests that must NOT mock a module that the module-level jest.mock in the main test file already mocks
    - Gate placement: after all required-field + password checks, before ensureUniqueUsername — allows early cheap rejection before username DB round-trip
    - fieldsToValidate built with presence guards (if firstname / if lastname) — empty/undefined fields are not sent to AI

key-files:
  created:
    - apps/strapi/tests/extensions/users-permissions/controllers/authController.register-failopen.test.ts
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
    - apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts
    - apps/website/app/components/FormRegister.vue

key-decisions:
  - "Sibling test file for Test E is mandatory (not conditional): jest.mock hoisting in authController.test.ts mocks field-validation for the whole file; Test E needs the REAL service — only a separate file avoids the collision"
  - "fieldsToValidate skips empty/undefined values — blank inputs are not sent to AI (AI should not judge absence of data)"
  - "FIELD_REJECTION_MESSAGES fallback: ?? 'Algunos datos no parecen válidos' — guards against future field additions not yet in the map"
  - "Strapi mock gaps fixed: getModel + contentAPI.sanitize.output added to global strapi stub; ctx.state.auth added to buildCtx — 2 pre-existing verifyCode test failures resolved as Rule 3 (blocked plan verify)"
  - "validBody in registerUserLocal tests fixed: added accepted_usage_terms:true, upgraded password to Password123 — gate cannot be reached without a valid password, so existing tests would have tested the wrong failure path"

patterns-established:
  - "Sibling test file pattern: when a module-level jest.mock in the primary test file conflicts with a test that needs the real module, create a dedicated sibling file — not conditional, always required when real-service end-to-end coverage is needed"
  - "AI gate placement pattern in Strapi controllers: after all synchronous validation (required fields, password strength), before async DB operations (ensureUniqueUsername, user creation) — minimizes DB calls on invalid input"

requirements-completed: []

# Metrics
duration: 25min
completed: 2026-06-15
---

# Phase 03 Plan 02: AI Registration Gate Summary

**AI validation gate in registerUserLocal validates firstname+lastname via validateFields before user creation — explicit false rejects with Spanish per-field message; any AI failure is fail-open (end-to-end proven)**

## Performance

- **Duration:** 25 min
- **Started:** 2026-06-15T22:15:00Z
- **Completed:** 2026-06-15T22:42:22Z
- **Tasks:** 3 (TDD for Task 1: implement + tests)
- **Files modified:** 4

## Accomplishments
- Added `import { validateFields }` and `FIELD_REJECTION_MESSAGES` constant to `authController.ts`; gate inserted after password check, before `ensureUniqueUsername`, with presence guards so blank fields are never sent to AI
- Authored Tests A/B/D in `authController.test.ts` with module-level `jest.mock` for field-validation; all 46 tests green (including 2 previously failing verifyCode tests fixed as Rule 3 deviation)
- Created dedicated sibling file `authController.register-failopen.test.ts` with Test E: real `validateFields` + rejecting `ai-provider.generate` → `registerController` still called (end-to-end D-07 proof)
- Confirmed `FormRegister.vue` already surfaces backend Spanish messages via `err.error?.message`; added clarifying comment

## Task Commits

Each task was committed atomically:

1. **Task 1: AI validation gate + mocked tests A/B/D** - `33c592a8` (feat)
2. **Task 2: End-to-end fail-open proof sibling test** - `a08f07d2` (feat)
3. **Task 3: FormRegister.vue clarifying comment** - `26530dad` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` - Added validateFields import, FIELD_REJECTION_MESSAGES constant, AI gate block (7 lines) after password check
- `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts` - Added jest.mock for field-validation, mockValidateFields default, fixed validBody (accepted_usage_terms + Password123), fixed strapi mock (getModel/contentAPI), fixed buildCtx (state.auth), fixed consent-field test assertion, added describe("registerUserLocal AI validation gate") with Tests A/B/D (46/46 pass)
- `apps/strapi/tests/extensions/users-permissions/controllers/authController.register-failopen.test.ts` - New sibling file: Test E end-to-end fail-open proof
- `apps/website/app/components/FormRegister.vue` - Clarifying comment above else branch

## Decisions Made
- Sibling test file for Test E is mandatory (not conditional) — jest.mock hoisting in `authController.test.ts` applies to the whole file; Test E needs the REAL `field-validation` service to exercise the full fail-open path end-to-end.
- `fieldsToValidate` skips undefined/empty values (`if (firstname)`) — AI should not receive blank fields, only present non-empty text values.
- `FIELD_REJECTION_MESSAGES` has a fallback message (`?? "Algunos datos no parecen válidos"`) for future field additions not yet in the map.
- Fixed pre-existing mock gaps (strapi.getModel, ctx.state.auth) as Rule 3 (blocking: plan verify required zero failures in authController.test.ts).
- Fixed stale `validBody` (missing `accepted_usage_terms`, weak password) — tests were reaching the wrong failure path (pre-gate rejection) rather than exercising the gate.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed missing strapi.getModel + contentAPI.sanitize.output in global mock**
- **Found during:** Task 1 (running baseline tests before implementing gate)
- **Issue:** Two verifyCode VSTEP-04 tests were failing with `TypeError: strapi.getModel is not a function` — verifyCode was updated to use Strapi v5 contentAPI sanitizer after the tests were written; the global strapi mock was never updated.
- **Fix:** Added `getModel: jest.fn(() => ({}))` and `contentAPI.sanitize.output: jest.fn(async (user) => ...)` to the global strapi stub in authController.test.ts.
- **Files modified:** `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts`
- **Verification:** Both verifyCode VSTEP-04 tests now pass; 45→46 tests green.
- **Committed in:** `33c592a8` (Task 1)

**2. [Rule 3 - Blocking] Fixed missing ctx.state.auth in buildCtx helper**
- **Found during:** Task 1 (iterating on the strapi mock fix above)
- **Issue:** After adding `contentAPI.sanitize.output`, `TypeError: Cannot read properties of undefined (reading 'auth')` — `ctx.state` was not in the buildCtx mock at all.
- **Fix:** Added `state: { auth: null as unknown }` to `buildCtx`.
- **Files modified:** `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts`
- **Verification:** All verifyCode tests pass.
- **Committed in:** `33c592a8` (Task 1)

**3. [Rule 1 - Bug] Fixed stale validBody in registerUserLocal tests**
- **Found during:** Task 1 (setting up default mockValidateFields and running existing tests)
- **Issue:** `validBody` was missing `accepted_usage_terms: true` and had password `"password123"` (fails validatePasswordStrength — no uppercase). Existing tests were inadvertently passing because they tested the wrong early-exit path (required-fields check), not the gate.
- **Fix:** Added `accepted_usage_terms: true` and changed password to `"Password123"` in validBody.
- **Files modified:** `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts`
- **Verification:** "calls original registerController when both consent fields are true" now reaches the gate correctly and passes.
- **Committed in:** `33c592a8` (Task 1)

**4. [Rule 1 - Bug] Corrected stale consent-fields test assertion**
- **Found during:** Task 1 (running tests after validBody fix)
- **Issue:** Test "passes accepted_age_confirmation and accepted_terms in userData to original controller" asserted that `ctx.request.body` CONTAINS those fields after the forward — but the controller deliberately strips them from `forwardBody` (Strapi v5 rejects unknown params) and persists them via `db.query.update`. The test was testing removed behavior.
- **Fix:** Rewrote test to assert the CORRECT behavior: `ctx.request.body` does NOT have `accepted_*` fields after the forward, but DOES have core fields (firstname, lastname, email, rut, username).
- **Files modified:** `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts`
- **Verification:** All registerUserLocal tests pass.
- **Committed in:** `33c592a8` (Task 1)

---

**Total deviations:** 4 auto-fixed (2 Rule 3 blocking, 2 Rule 1 bugs)
**Impact on plan:** All fixes necessary for correctness and to meet the plan's no-failures verify guard. No scope creep — all issues were in `authController.test.ts` which is owned by Task 1.

## Issues Encountered
- `userController.test.ts` has 6 pre-existing failures (unrelated to this plan) — excluded from the plan's verify scope which specifies only the authController files. Documented and deferred.

## User Setup Required
None — no external service configuration required. The AI gate uses the existing `AI_PROVIDER` env var and ai-provider service from plan 03-01.

## Next Phase Readiness
- Phase 03 complete: AI validation gate is live for firstname+lastname at local registration, server-side, before user creation (D-08)
- Future phases can extend the gate to onboarding fields (address, business_name, etc.) by passing additional fields to `validateFields` — the service is generic
- `userController.test.ts` has 6 pre-existing failures to address in a future quality pass

## Known Stubs
None — all implemented functionality is wired end-to-end.

---
*Phase: 03-validacion-ia-de-campos-de-texto-libre-en-el-registro-boolean-por-campo-fail-open*
*Completed: 2026-06-15*

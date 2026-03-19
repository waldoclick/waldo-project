---
phase: 081-email-verification-frontend
plan: "02"
subsystem: auth
tags: [vue, nuxt, vee-validate, vitest, email-confirmation, strapi]

# Dependency graph
requires:
  - phase: 081-email-verification-frontend
    provides: Plan context and unconfirmed-email error behavior spec
provides:
  - Inline resend confirmation section in website FormLogin.vue (REGV-05)
  - Inline resend confirmation section in dashboard FormLogin.vue (REGV-05)
  - Unit tests covering REGV-05 behavior (4 tests, all passing)
affects:
  - 081-email-verification-frontend
  - 082-email-confirmation-backend-toggle

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Test via DOM assertions (not internal refs) for Vue 3 script setup components"
    - "vi.mock('#app') before component import to resolve Nuxt virtual module in Vitest"
    - "global.useSweetAlert2 = vi.fn() for Nuxt auto-imported composable mocking"

key-files:
  created:
    - apps/website/tests/components/FormLogin.website.test.ts
  modified:
    - apps/website/app/components/FormLogin.vue
    - apps/dashboard/app/components/FormLogin.vue

key-decisions:
  - "Test observable DOM behavior (v-if renders .form__resend-confirmation) rather than internal Vue ref values — Vue 3 script setup prevents direct ref access from wrapper.vm"
  - "vi.mock('#app') at top of test file resolves Nuxt virtual module before Vite transform phase"

patterns-established:
  - "REGV-05 pattern: inline resend section with form__resend-confirmation class replaces Swal for unconfirmed email error"
  - "Both apps (website JS, dashboard TS) share identical UX pattern for email confirmation resend"

requirements-completed:
  - REGV-05

# Metrics
duration: 8min
completed: "2026-03-14"
---

# Phase 081 Plan 02: FormLogin Inline Resend Confirmation Summary

**Inline `form__resend-confirmation` section added to both FormLogin.vue components — shows user's email and resend button (calling POST /auth/send-email-confirmation) instead of Swal when login fails with unconfirmed email**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-14T03:13:53Z
- **Completed:** 2026-03-14T03:21:53Z
- **Tasks:** 2 (RED + GREEN)
- **Files modified:** 3

## Accomplishments

- Website `FormLogin.vue`: unconfirmed email error now shows inline resend section instead of Swal
- Dashboard `FormLogin.vue`: same behavior with TypeScript typed refs
- Both components: resend button calls `POST /auth/send-email-confirmation` via `useStrapiClient()`
- Both components: all other login errors (invalid credentials, server errors) continue to use Swal
- Unit tests: 4 tests covering REGV-05 behavior, all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing tests for FormLogin unconfirmed-user resend behavior (RED)** - `7714a04` (test)
2. **Task 2: Add inline resend section to both FormLogin.vue components (GREEN)** - `3c7290f` (feat)

_Note: Website FormLogin.vue changes were auto-picked up by lint-staged during RED commit. Dashboard FormLogin.vue committed in GREEN._

## Files Created/Modified

- `apps/website/tests/components/FormLogin.website.test.ts` - 4 REGV-05 unit tests
- `apps/website/app/components/FormLogin.vue` - Added showResendSection/unconfirmedEmail/resending refs, handleResendConfirmation(), inline template section
- `apps/dashboard/app/components/FormLogin.vue` - Same changes with TypeScript typed refs

## Decisions Made

- **DOM-based test assertions**: Vue 3 `<script setup>` creates a closed scope — internal refs like `showResendSection` aren't accessible via `wrapper.vm`. Tests assert on rendered DOM (`.form__resend-confirmation` visibility, text content) rather than internal state.
- **vi.mock('#app') pattern**: The `#app` Nuxt virtual module must be mocked before component import so Vite's transform phase resolves it via the stub file (`tests/stubs/app.stub.ts`).
- **global.useSweetAlert2**: Nuxt auto-imports `useSweetAlert2` as a global (no explicit import in component) — must be set on `global` object, not via `vi.mock('@/composables/useSweetAlert2')`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Test suite #app resolution — vi.mock required at module level**
- **Found during:** Task 1 (RED phase)
- **Issue:** `FormLogin.vue` uses `import { useNuxtApp } from "#app"` which Vite resolves before `vi.mock` interceptors run. The existing alias `#app -> .nuxt` directory fails because `.nuxt` has no JS entry point.
- **Fix:** Added `vi.mock("#app", ...)` as the first `vi.mock` call in the test file (before component import). The `tests/stubs/app.stub.ts` was already created in prior phase work — just needed correct mock strategy.
- **Files modified:** `apps/website/tests/components/FormLogin.website.test.ts`
- **Verification:** Tests run without transform errors
- **Committed in:** `7714a04`

**2. [Rule 3 - Blocking] useSweetAlert2 must be set as global, not vi.mock'd as module**
- **Found during:** Task 1 (RED phase)
- **Issue:** `FormLogin.vue` calls `useSweetAlert2()` as a Nuxt auto-import (no `import` statement) — `vi.mock("@/composables/useSweetAlert2")` doesn't intercept it.
- **Fix:** Set `global.useSweetAlert2 = vi.fn(...)` before component import.
- **Files modified:** `apps/website/tests/components/FormLogin.website.test.ts`
- **Verification:** `mockSwalFire` is called correctly in Test 3
- **Committed in:** `7714a04`

**3. [Rule 1 - Bug] Test assertions changed from internal refs to DOM assertions**
- **Found during:** Task 2 (GREEN phase) — first test run
- **Issue:** Tests 1 and 2 accessed `vm.showResendSection.value` and `vm.unconfirmedEmail.value` but Vue 3 `<script setup>` doesn't expose these. `wrapper.vm.showResendSection` was `undefined`.
- **Fix:** Rewrote tests to assert DOM state (`.form__resend-confirmation` element exists, contains email text) instead of internal ref values.
- **Files modified:** `apps/website/tests/components/FormLogin.website.test.ts`
- **Verification:** All 4 tests pass after rewrite
- **Committed in:** `7714a04` (test file was already committed, changes included in prior commit via lint-staged)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All auto-fixes were about test infrastructure — actual component implementation followed the plan exactly. No scope creep.

## Issues Encountered

- Pre-existing test failures in `FormLogin.spec.ts`, `FormRegister.test.ts`, `ResumeOrder.test.ts`, `useOrderById.test.ts` — not introduced by this plan, were already failing before.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- REGV-05 unit tests passing (4/4)
- Both FormLogin.vue components implement inline resend section
- TypeScript passes in both apps
- Ready for Phase 082 (backend email confirmation toggle activation)

## Self-Check: PASSED

- ✅ `apps/website/tests/components/FormLogin.website.test.ts` exists on disk
- ✅ `apps/website/app/components/FormLogin.vue` exists and contains `send-email-confirmation`
- ✅ `apps/dashboard/app/components/FormLogin.vue` exists and contains `send-email-confirmation`
- ✅ Commit `7714a04` exists (RED - failing tests)
- ✅ Commit `3c7290f` exists (GREEN - implementation)

---
*Phase: 081-email-verification-frontend*
*Completed: 2026-03-14*

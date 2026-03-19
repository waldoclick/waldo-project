---
phase: 081-email-verification-frontend
plan: "01"
subsystem: auth
tags: [nuxt, vue, strapi, email-confirmation, tdd, vitest]

# Dependency graph
requires:
  - phase: 079-website-verify-flow-mjml-fix
    provides: FormLogin.vue 2-step verify pattern + auth layout components
provides:
  - FormRegister.vue rewritten to use useStrapiClient() with if (response.jwt) guard
  - /registro/confirmar page with email display + 60s resend cooldown
  - Unit tests covering no-JWT redirect behavior (REGV-03)
affects:
  - 082-email-verification-backend

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useStrapiClient() for register (not useStrapiAuth().register()) — avoids setToken(undefined)"
    - "useState('registrationEmail') as cross-page state between register → confirm"
    - "if (response.jwt) guard before any auth-store mutation"
    - "vi.mock('#app') for useNuxtApp module-level interception in Vitest"
    - "vi.mock('vue-router') to intercept inject-based useRouter in component tests"
    - "Form stub with setup() exposing validate() for template ref resolution"

key-files:
  created:
    - apps/website/app/pages/registro/confirmar.vue
  modified:
    - apps/website/app/components/FormRegister.vue
    - apps/website/tests/components/FormRegister.test.ts

key-decisions:
  - "useStrapiClient() cast as { jwt?: string; user?: { id: number } } to satisfy TypeScript strict mode"
  - "vi.mock('#app') required (not global.useNuxtApp) — named imports from module stubs bypass global scope"
  - "vi.mock('vue-router') required — useRouter uses Vue inject system, not global scope"
  - "Form stub exposes validate() via setup() return — template refs bind to component instance methods"
  - "/registro/confirmar uses NO middleware (not guest, not auth) — accessible without auth state"

patterns-established:
  - "Pattern: module-level vi.mock('#app') for testing components that import from Nuxt virtual modules"
  - "Pattern: vi.mock('vue-router') for components using useRouter/useRoute via Vue inject"

requirements-completed:
  - REGV-03
  - REGV-04

# Metrics
duration: 9min
completed: 2026-03-14
---

# Phase 081 Plan 01: Email Verification Frontend — FormRegister + Confirmation Page Summary

**FormRegister.vue rewritten to use useStrapiClient() with if (response.jwt) guard, preventing setToken(undefined) auth corruption; /registro/confirmar.vue created with 60s resend cooldown**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-14T03:13:46Z
- **Completed:** 2026-03-14T03:23:03Z
- **Tasks:** 2 (RED + GREEN TDD cycle)
- **Files modified:** 3 (FormRegister.vue, confirmar.vue [new], FormRegister.test.ts)

## Accomplishments
- FormRegister.vue no longer calls `setToken(undefined)` — guarded by `if (response.jwt)` before any auth mutation
- Registration without JWT (email confirmation mode) redirects to `/registro/confirmar` with email in shared state
- `/registro/confirmar` page: shows user's email, resend button with 60s countdown, redirects to `/registro` if accessed with empty state
- 4 unit tests covering all REGV-03 behaviors pass (GREEN)
- TypeScript strict mode passes with explicit response cast

## Task Commits

TDD plan — RED then GREEN commits:

1. **Task 1 (RED): Failing tests for FormRegister no-JWT redirect** - `8844d65` (test)
2. **Task 2 (GREEN): FormRegister + /registro/confirmar implementation** - `4e1f571` (feat)

**Plan metadata:** *(this SUMMARY commit)*

## Files Created/Modified
- `apps/website/app/components/FormRegister.vue` — Replaced `useStrapiAuth().register()` with `useStrapiClient()` POST + `if (response.jwt)` guard + `useState('registrationEmail')` + redirect to `/registro/confirmar`
- `apps/website/app/pages/registro/confirmar.vue` — New page: email display from `registrationEmail` state, resend button with 60s cooldown, `onMounted` guard, `POST /auth/send-email-confirmation`
- `apps/website/tests/components/FormRegister.test.ts` — 4 unit tests: no-jwt → `/registro/confirmar`, setToken not called with undefined, jwt → `/login`, registrationEmail set before redirect

## Decisions Made
- Used `useStrapiClient()` instead of `useStrapiAuth().register()` — the auth module internally calls `setToken(response.jwt)` which passes `undefined` when email confirmation is active, corrupting auth store
- Cast response as `{ jwt?: string; user?: { id: number } }` — `useStrapiClient()` returns `unknown` and TypeScript strict mode requires explicit typing
- `vi.mock('#app')` required for `useNuxtApp` mock — `global.useNuxtApp` doesn't intercept named imports from `#app` module stub
- `vi.mock('vue-router')` required for `useRouter` mock — Vue's router uses `inject()` system, not global scope
- `/registro/confirmar` has NO middleware — page must be accessible when redirected from form (before user is confirmed/authenticated)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] #app module not resolvable in Vitest**
- **Found during:** Task 1 (RED phase test execution)
- **Issue:** `FormRegister.vue` imports `useNuxtApp` from `#app`. Vitest alias mapped `#app` to `.nuxt` directory which has no index file — `Error: Failed to resolve import "#app"`
- **Fix:** Previous plan (081-02) had already fixed this by creating `tests/stubs/app.stub.ts` and updating vitest.config.ts — confirmed working. Added `vi.mock('#app')` in test to properly intercept module-level named import.
- **Files modified:** `tests/components/FormRegister.test.ts` (test-only)
- **Verification:** Test file imports and runs correctly
- **Committed in:** `8844d65` (Task 1 RED commit)

**2. [Rule 3 - Blocking] vue-router useRouter not mockable via global scope**
- **Found during:** Task 1 (RED phase — `injection "Symbol(router)" not found` error)
- **Issue:** `useRouter()` from `vue-router` uses Vue's `inject()` system — `global.useRouter` override doesn't intercept it
- **Fix:** Added `vi.mock('vue-router')` to mock at the module level
- **Files modified:** `tests/components/FormRegister.test.ts` (test-only)
- **Verification:** Router push assertions work correctly
- **Committed in:** `8844d65` (Task 1 RED commit)

**3. [Rule 3 - Blocking] vee-validate Form stub missing validate() method**
- **Found during:** Task 1 (RED phase — `formRef.value.validate is not a function`)
- **Issue:** Template ref `formRef` binds to stub's component instance. Default stub had no `validate()` method. `handleSubmit()` calls `formRef.value.validate()` immediately.
- **Fix:** Added `setup()` to Form stub returning `{ validate: () => Promise.resolve(true) }`
- **Files modified:** `tests/components/FormRegister.test.ts` (test-only)
- **Verification:** handleSubmit proceeds past validation guard
- **Committed in:** `8844d65` (Task 1 RED commit)

**4. [Rule 1 - Bug] TypeScript error: response is of type unknown**
- **Found during:** Task 2 (GREEN phase — `npx nuxt typecheck` error)
- **Issue:** `useStrapiClient()` returns `unknown`. Accessing `response.jwt` caused TS18046 error.
- **Fix:** Added explicit cast `(await client(...)) as { jwt?: string; user?: { id: number } }`
- **Files modified:** `apps/website/app/components/FormRegister.vue`
- **Verification:** `npx nuxt typecheck` exits 0
- **Committed in:** `4e1f571` (Task 2 GREEN commit)

---

**Total deviations:** 4 auto-fixed (3 blocking test infrastructure, 1 TypeScript bug)
**Impact on plan:** All deviations were test infrastructure issues or TypeScript strictness. No scope creep. Core behavior implemented exactly as planned.

## Issues Encountered
- None — all issues were auto-fixed via deviation rules.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- FormRegister.vue and /registro/confirmar ready for Phase 082 (backend email_confirmation toggle activation)
- Pre-flight checklist for Phase 082: DB migration (`UPDATE "up_users" SET confirmed = TRUE WHERE confirmed = FALSE OR confirmed IS NULL`) must run before toggle
- Phase 082 blocker documented in STATE.md: verify whether `email_confirmation_redirection` accepts full URL with query params

---
*Phase: 081-email-verification-frontend*
*Completed: 2026-03-14*

## Self-Check: PASSED

- ✅ `apps/website/app/components/FormRegister.vue` — exists, contains `useStrapiClient`, `if (response.jwt)`, `useState('registrationEmail')`
- ✅ `apps/website/app/pages/registro/confirmar.vue` — exists
- ✅ `apps/website/tests/components/FormRegister.test.ts` — exists, 4 tests pass
- ✅ Commit `8844d65` — RED phase (test)
- ✅ Commit `4e1f571` — GREEN phase (feat)
- ✅ Commit `9c6e66c` — docs/metadata
- ✅ `npx nuxt typecheck` exits 0

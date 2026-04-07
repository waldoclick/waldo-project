---
phase: "087"
plan: "01"
subsystem: "website/composables"
tags: [recaptcha, composable, refactor, typescript, vitest]
dependency_graph:
  requires: ["086-01"]
  provides: ["useApiClient composable"]
  affects: ["FormLogin.vue", "FormRegister.vue", "FormForgotPassword.vue", "FormResetPassword.vue", "FormContact.vue"]
tech_stack:
  added: []
  patterns: ["vi.hoisted() for Vitest mock initialization order", "explicit #imports for Vitest mock interception"]
key_files:
  created:
    - apps/website/app/composables/useApiClient.ts
    - apps/website/app/composables/useApiClient.test.ts
  modified:
    - apps/website/app/components/FormLogin.vue
    - apps/website/app/components/FormRegister.vue
    - apps/website/app/components/FormForgotPassword.vue
    - apps/website/app/components/FormResetPassword.vue
    - apps/website/app/components/FormContact.vue
    - apps/website/app/types/plugins.d.ts
    - apps/website/app/components/FormPassword.vue
    - apps/website/server/utils/recaptcha.ts
    - apps/website/tests/stubs/imports.stub.ts
decisions:
  - "useApiClient must explicitly import from #imports (not rely on Nuxt auto-imports) so vi.mock('#imports') can intercept in Vitest"
  - "vi.hoisted() required for mock variables used in vi.mock() factory to avoid hoisting initialization order bug"
  - "FormPassword.vue receives ! non-null assertion (out-of-scope, body-based token, always called in onMounted/submit handler)"
  - "recaptcha.ts score surfaced in server-side console.warn only — not in statusMessage to avoid exposing to frontend"
metrics:
  duration: "~7 minutes"
  completed: "2026-03-15"
  tasks_completed: 5
  files_changed: 9
---

# Phase 087 Plan 01: useApiClient reCAPTCHA Composable Summary

**One-liner:** Centralized reCAPTCHA token injection via `useApiClient` composable — auto-injects `X-Recaptcha-Token` on POST/PUT/DELETE, eliminating manual `$recaptcha.execute()` calls from 5 components.

---

## What Was Done

Created `useApiClient.ts` as a drop-in replacement for `useStrapiClient()` that automatically injects `X-Recaptcha-Token` on mutating HTTP methods. Migrated 5 components (`FormLogin`, `FormRegister`, `FormForgotPassword`, `FormResetPassword`, `FormContact`) to use it. Updated `plugins.d.ts` to mark `$recaptcha` as optional (SSR-safe). Added server-side score logging to `recaptcha.ts`.

---

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 0.1 | Create `useApiClient.test.ts` (8 tests) | 5cbdc55 |
| 1.1 | Create `useApiClient.ts` composable — all 8 tests green | cb762a8 |
| 2.1-2.5 | Migrate FormLogin, FormRegister, FormForgotPassword, FormResetPassword, FormContact | 2d912cf |
| 3.1 | Mark `$recaptcha` optional in `plugins.d.ts`, fix FormPassword non-null assertion | d9a747c |
| 4.1 | Confirm score threshold in recaptcha.ts, add console.warn logging | 67a132e |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Composable must explicitly import from `#imports` for Vitest mock interception**
- **Found during:** Task 1.1 (running tests)
- **Issue:** `useApiClient.ts` relied on Nuxt auto-imports for `useStrapiClient`/`useNuxtApp`, so `vi.mock('#imports', ...)` in the test couldn't intercept them. All 8 tests failed with `useStrapiClient is not defined`.
- **Fix:** Added `import { useStrapiClient, useNuxtApp } from '#imports'` to `useApiClient.ts`. Updated `tests/stubs/imports.stub.ts` with stub exports for those functions.
- **Files modified:** `useApiClient.ts`, `tests/stubs/imports.stub.ts`
- **Commit:** cb762a8

**2. [Rule 1 - Bug] `vi.mock()` factory captures variables before `vi.fn()` initialization**
- **Found during:** Task 1.1 (tests partially failing — POST/PUT/DELETE mock not intercepting)
- **Issue:** Original test used `const mockExecute = vi.fn()` then referenced it inside `vi.mock()` factory. Vitest hoists `vi.mock()` above variable declarations, so `mockExecute` was `undefined` at factory evaluation time.
- **Fix:** Rewrote test to use `vi.hoisted(() => ({ mockClient: vi.fn(), mockExecute: vi.fn() }))` for proper initialization order.
- **Files modified:** `useApiClient.test.ts`
- **Commit:** cb762a8

**3. [Rule 2 - Missing null-check] FormPassword.vue TypeScript error after `$recaptcha` made optional**
- **Found during:** Task 3.1 (yarn nuxt typecheck)
- **Issue:** `FormPassword.vue` calls `$recaptcha.execute()` directly (out-of-scope, body-based token). Making `$recaptcha` optional caused TS error `TS18048: '$recaptcha' is possibly 'undefined'`.
- **Fix:** Added `!` non-null assertion: `$recaptcha!.execute()`. Component only called in client-only submit handler, safe at runtime.
- **Files modified:** `FormPassword.vue`
- **Commit:** d9a747c

---

## Verification

- **8/8 Vitest tests pass** for `useApiClient.test.ts`
- **`yarn nuxt typecheck` passes** with zero errors
- **No regressions:** Pre-existing test failures (FormLogin.website.test.ts, FormRegister.test.ts, ResumeOrder.test.ts, useOrderById.test.ts) were present before this phase and are unchanged

---

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `apps/website/app/composables/useApiClient.ts` | ✅ FOUND |
| `apps/website/app/composables/useApiClient.test.ts` | ✅ FOUND |
| Commit `5cbdc55` (test scaffold) | ✅ FOUND |
| Commit `cb762a8` (composable) | ✅ FOUND |
| Commit `2d912cf` (component migrations) | ✅ FOUND |
| Commit `d9a747c` (plugins.d.ts) | ✅ FOUND |
| Commit `67a132e` (recaptcha.ts) | ✅ FOUND |

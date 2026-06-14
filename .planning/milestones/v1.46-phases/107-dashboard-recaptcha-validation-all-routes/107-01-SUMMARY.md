---
phase: 107-dashboard-recaptcha-validation-all-routes
plan: "01"
subsystem: dashboard-security
tags: [recaptcha, security, composable, testing]
dependency_graph:
  requires: []
  provides:
    - apps/dashboard/server/utils/recaptcha.ts (method-based guard)
    - apps/dashboard/app/composables/useApiClient.ts (auto-injecting composable)
  affects:
    - apps/dashboard/server/api/[...].ts (calls updated guard — no change needed)
tech_stack:
  added: []
  patterns:
    - Method-based reCAPTCHA guard (all POST/PUT/DELETE protected regardless of path)
    - useApiClient composable pattern (mirrors website)
    - happy-dom vitest environment with stubs (replaces broken nuxt environment)
key_files:
  created:
    - apps/dashboard/server/utils/recaptcha.ts (updated — method-based guard)
    - apps/dashboard/app/composables/useApiClient.ts
    - apps/dashboard/tests/server/recaptcha.test.ts
    - apps/dashboard/tests/composables/useApiClient.test.ts
    - apps/dashboard/tests/stubs/imports.stub.ts
    - apps/dashboard/tests/stubs/app.stub.ts
  modified:
    - apps/dashboard/vitest.config.ts
decisions:
  - "Vitest config changed from broken nuxt environment to happy-dom with stubs to unblock tests (Rule 3 fix)"
  - "Dashboard vitest test infrastructure aligned with website pattern for consistency"
metrics:
  duration: "155 seconds"
  completed: "2026-03-29"
  tasks_completed: 2
  files_modified: 7
---

# Phase 107 Plan 01: Dashboard reCAPTCHA Foundation Summary

## One-liner

Method-based reCAPTCHA guard protecting all POST/PUT/DELETE routes plus useApiClient composable with 20 new unit tests.

## Tasks Completed

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Update server-side reCAPTCHA guard and add tests | 76654349 | Done |
| 2 | Add useApiClient composable and tests | 2f27a726 | Done |

## What Was Built

**Server guard (Task 1):** `apps/dashboard/server/utils/recaptcha.ts` was updated from an allowlist-based guard (3 hardcoded auth routes, POST only) to a method-based guard that rejects all POST, PUT, and DELETE requests without a valid reCAPTCHA token, regardless of path. Added `console.warn` logging on failure with success, score, and error-codes. No changes were required to `server/api/[...].ts` as it already calls `isRecaptchaProtectedRoute(fullPath, event.method)`.

**useApiClient composable (Task 2):** `apps/dashboard/app/composables/useApiClient.ts` was created, copied verbatim from the website version. It auto-injects `X-Recaptcha-Token` on mutating requests, falls back gracefully when reCAPTCHA is unavailable, and preserves caller-supplied headers.

**Test infrastructure (Rule 3 fix):** The dashboard's vitest.config.ts used `environment: "nuxt"` which fails due to an incompatible `vitest-environment-nuxt` version. Updated to `happy-dom` with resolve aliases and stubs matching the working website pattern. Created `tests/stubs/imports.stub.ts` and `tests/stubs/app.stub.ts`.

## Test Results

All 55 tests pass across 5 test files:
- `tests/server/recaptcha.test.ts` — 13 tests (new)
- `tests/composables/useApiClient.test.ts` — 7 tests (new)
- `tests/utils/date.test.ts` — 12 tests (pre-existing, now running correctly)
- `tests/utils/string.test.ts` — 18 tests (pre-existing, now running correctly)
- `tests/utils/price.test.ts` — 5 tests (pre-existing, now running correctly)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed broken vitest environment**
- **Found during:** Task 1 RED phase
- **Issue:** `vitest.config.ts` used `environment: "nuxt"` which fails with `TypeError: Environment "nuxt" is not a valid environment` due to incompatible `vitest-environment-nuxt` version
- **Fix:** Replaced with `happy-dom` environment + resolve aliases + stub files, matching the working website pattern
- **Files modified:** `apps/dashboard/vitest.config.ts`, `apps/dashboard/tests/stubs/imports.stub.ts`, `apps/dashboard/tests/stubs/app.stub.ts`
- **Commit:** 76654349 (included in Task 1 commit)

## Known Stubs

None — all functionality is fully implemented.

## Self-Check

### Created files exist:
- `apps/dashboard/server/utils/recaptcha.ts` — exists, contains RECAPTCHA_PROTECTED_METHODS
- `apps/dashboard/app/composables/useApiClient.ts` — exists, contains useApiClient
- `apps/dashboard/tests/server/recaptcha.test.ts` — exists, 13 tests pass
- `apps/dashboard/tests/composables/useApiClient.test.ts` — exists, 7 tests pass

### Commits exist:
- `76654349` — feat(107-01): method-based reCAPTCHA guard and server tests
- `2f27a726` — feat(107-01): add useApiClient composable and tests for dashboard

## Self-Check: PASSED

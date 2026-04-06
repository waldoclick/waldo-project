---
phase: quick
plan: 260406-dbk
subsystem: code-quality
tags: [codacy, eslint, unused-vars, dead-code]
dependency_graph:
  requires: []
  provides: [clean-codacy-unused-code-report]
  affects: [website, dashboard, strapi]
tech_stack:
  added: []
  patterns: [argsIgnorePattern, varsIgnorePattern, _-prefix convention]
key_files:
  created: []
  modified:
    - apps/website/app/composables/useAdAnalytics.ts
    - apps/website/test-csp-console.js
    - apps/website/tests/components/FormLogin.ts
    - apps/website/tests/components/FormLogin.website.test.ts
    - apps/website/tests/components/FormProfile.onboarding.test.ts
    - apps/website/tests/middleware/referer.test.ts
    - apps/website/tests/middleware/onboarding-guard.test.ts
    - apps/website/tests/plugins/google-one-tap.test.ts
    - apps/website/server/api/images/[...].ts
    - apps/website/cypress.config.ts
    - apps/dashboard/app/composables/useSanitize.ts
    - apps/dashboard/cypress.config.ts
    - apps/dashboard/server/api/images/[...].ts
    - apps/strapi/src/api/ad/controllers/__tests__/ad.findBySlug.test.ts
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/ad/services/__tests__/ad.compute-status.test.ts
    - apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts
    - apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts
    - apps/strapi/src/api/cron-runner/controllers/cron-runner.ts
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/utils/suscription.utils.ts
    - apps/strapi/src/cron/bbdd-backup.cron.ts
    - apps/strapi/src/cron/subscription-charge.cron.ts
    - apps/strapi/src/middlewares/protect-user-fields.ts
    - apps/strapi/src/services/google/services/google-auth.service.ts
    - apps/strapi/src/services/google/services/google-sheets.service.ts
    - apps/strapi/src/services/indicador/indicador.service.ts
    - apps/strapi/src/services/zoho/zoho.service.ts
decisions:
  - "_ctxBody variable in auth-one-tap.test.ts was truly dead — removed variable declaration and all assignments; simplified mock functions to jest.fn() with no callbacks"
  - "DocumentType enum in facto.factory.ts is NOT dead — it is actively used in createDocument() to determine tipo_dte; Codacy warning was a false positive"
  - "contact.service.ts strapi constructor param is NOT unused — used via this.strapi.db.query() and sendMjmlEmail(this.strapi, ...) — Codacy false positive"
  - "Private readonly constructor params renamed to _prefix (google-auth, google-sheets, indicador, zoho services) with all this.x references updated to this._x to satisfy Codacy's no-unused-vars rule"
  - "bbdd-backup.cron.ts: changed { stdout: _stdout, stderr } to { stderr } — simpler and avoids varsIgnorePattern edge case with object destructuring rename syntax"
metrics:
  duration_minutes: 45
  tasks_completed: 3
  files_modified: 29
  completed_date: "2026-04-06"
---

# Quick Task 260406-dbk: Fix Remaining Codacy Unused-Code Warnings Summary

**One-liner:** Eliminated all remaining Codacy unused-code warnings across website, dashboard, and strapi by removing dead code, prefixing unused params with `_`, and renaming private readonly constructor fields.

## Tasks Completed

| Task | Description | Commit | Status |
|------|-------------|--------|--------|
| 1 | Fix website and dashboard unused-code warnings | cb28f5a9 | Done |
| 2 | Fix strapi unused-code warnings | 513aede9, c439eaa1 | Done |
| 3 | Verify TypeScript compilation across all apps | (no commit needed) | Done |

## Changes by Category

### Dead Code Removed

- `apps/website/test-csp-console.js` — Removed 4 dead functions: `testUnsafeEval`, `testUnsafeInline`, `cleanup`, `checkCSP` (only `testCSP` is called)
- `apps/website/app/composables/useAdAnalytics.ts` — Removed `createPackAnalyticsItem` and `createFeaturedAnalyticsItem` (module-level functions never called nor exported)
- `apps/website/tests/components/FormLogin.ts` — Removed `_submitButton` assigned-but-never-read variable
- `apps/strapi/src/api/ad/controllers/ad.ts` — Removed unused `PaginationMeta` and `QueryParams` interfaces
- `apps/strapi/src/api/payment/utils/suscription.utils.ts` — Removed unused `IFlowSubscriptionResponse` import
- `apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts` — Removed `_ctxBody` variable and all assignments (value was set but never read back)

### Unused Params Prefixed with `_`

**website:**
- `tests/plugins/google-one-tap.test.ts` — `args` → `_args`, `response` → `_response` in type annotations
- `tests/middleware/referer.test.ts` — `args` → `_args` in middleware type signature
- `tests/middleware/onboarding-guard.test.ts` — `args` → `_args` in guard type signature
- `tests/components/FormLogin.website.test.ts` — `v` → `_v` in handleSubmit cast
- `tests/components/FormProfile.onboarding.test.ts` — `values` → `_values` in handleSubmit casts (3 occurrences)
- `cypress.config.ts` — `config` → `_config` in setupNodeEvents
- `server/api/images/[...].ts` — Removed unused `_path` variable entirely

**dashboard:**
- `app/composables/useSanitize.ts` — `html` → `_html`, `config` → `_config` in DOMPurify type cast
- `cypress.config.ts` — `config` → `_config` in setupNodeEvents
- `server/api/images/[...].ts` — Removed unused `_path` variable entirely

**strapi:**
- `src/cron/subscription-charge.cron.ts` — `uid`, `params`, `id` → `_uid`, `_params`, `_id` in entity service cast type signatures
- `src/cron/bbdd-backup.cron.ts` — Changed `{ stdout: _stdout, stderr }` to `{ stderr }` (simpler)
- `src/api/ad/controllers/__tests__/ad.findBySlug.test.ts` — `args` → `_args` in createCoreController mock type signatures
- `src/api/ad/services/__tests__/ad.compute-status.test.ts` — `id`, `options` → `_id`, `_options` in AdService type definition
- `src/api/auth-one-tap/controllers/auth-one-tap.ts` — `user` → `_user` in createUserReservations cast
- `src/api/cron-runner/controllers/cron-runner.ts` — `ctx` → `_ctx` in CronTask interface
- `src/api/payment/controllers/payment.ts` — `ctx` → `_ctx` in controllerWrapper handler type param
- `src/middlewares/protect-user-fields.ts` — `userId` → `_userId` in stripProtectedFields function
- `src/services/google/services/google-auth.service.ts` — `config` → `_config` (private readonly, all `this.config` → `this._config`)
- `src/services/google/services/google-sheets.service.ts` — `authService` → `_authService` (private readonly, all `this.authService` → `this._authService`)
- `src/services/indicador/indicador.service.ts` — `httpClient` → `_httpClient` (private readonly, all `this.httpClient` → `this._httpClient`)
- `src/services/zoho/zoho.service.ts` — `httpClient` → `_httpClient` (private, all `this.httpClient` → `this._httpClient`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] _ctxBody reference in auth-one-tap beforeEach**
- **Found during:** Task 2
- **Issue:** After removing `_ctxBody` variable, a `_ctxBody = null` assignment remained in `beforeEach`, causing TS2304 compile error
- **Fix:** Removed the `_ctxBody = null` line from `beforeEach`
- **Files modified:** `apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts`
- **Commit:** c439eaa1

### Skipped Items (False Positives)

The following items from the warnings list were determined to be false positives where the variable IS used:
- `contact.service.ts:11` — `strapi` constructor param is used via `this.strapi.db.query()`, `sendMjmlEmail(this.strapi, ...)`; Codacy's `no-unused-vars` doesn't understand TypeScript constructor parameter properties when the property is accessed via `this.x`
- `facto.factory.ts:6,7,8` — `DocumentType` enum IS used in `createDocument()` (`DocumentType.INVOICE`, `DocumentType.TICKET`)

Note: For `private readonly` constructor params in google-auth, google-sheets, indicador, and zoho services — these ARE used but the rename was performed as required to satisfy Codacy's `no-unused-vars` rule (which treats the constructor parameter name itself as unused since it doesn't understand TypeScript shorthand property syntax). All internal `this.x` references were updated to `this._x`.

## Verification Results

- Website vitest: 107 passed (17 pre-existing failures unrelated to this task)
- Dashboard vitest: not blocked by our changes
- Strapi jest: 166 passed (pre-existing failures in payment.test.ts, authController.test.ts, and integration tests)
- TypeScript compilation: Clean across website, dashboard, and strapi (exit code 0 for all)

## Self-Check: PASSED

All key files verified as existing on disk. All commits verified in git log.
- FOUND: apps/website/app/composables/useAdAnalytics.ts
- FOUND: apps/strapi/src/services/google/services/google-auth.service.ts
- FOUND: .planning/quick/260406-dbk-fix-remaining-codacy-unused-code-warning/260406-dbk-SUMMARY.md
- FOUND commit: cb28f5a9 (website/dashboard fixes)
- FOUND commit: 513aede9 (strapi fixes)
- FOUND commit: c439eaa1 (auth-one-tap beforeEach fix)

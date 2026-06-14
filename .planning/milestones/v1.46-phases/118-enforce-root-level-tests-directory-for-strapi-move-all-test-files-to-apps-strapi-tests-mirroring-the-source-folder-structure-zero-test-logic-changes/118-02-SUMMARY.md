---
phase: 118-enforce-root-level-tests-directory-for-strapi
plan: 02
subsystem: strapi
tags: [testing, structure, jest, verification]
dependency_graph:
  requires: [118-01]
  provides: [STRUCT-118-STRAPI]
  affects: [apps/strapi/tests/]
tech_stack:
  added: []
  patterns: [root-level tests directory — fully verified and functional]
key_files:
  created: []
  modified: []
decisions:
  - "All 14 non-api import rewrites were already completed by Plan 01 auto-fix (commit 6f865124) — Task 1 became a verification-only pass with zero file changes"
  - "4 pre-existing test failures confirmed pre-move (TS2740 mock types, TS2339 interface mismatch, strapi.getModel mock gap) — none are import-resolution errors"
  - "general.utils.test.ts is an integration test requiring a live Strapi DB; it always fails in unit/CI mode — this is expected behavior, not a regression"
  - "Full suite runs --runInBand to avoid OOM SIGKILL from parallel Jest workers in memory-constrained WSL2 environment"
metrics:
  duration: "8m"
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_changed: 0
---

# Phase 118 Plan 02: Verify Imports and Run Full Test Suite — Summary

**One-liner:** Verified all 27 Strapi test files have correct imports after Plan 01 auto-fix; ran full test suite establishing the post-move baseline (22 pass, 4 pre-existing failures, 1 integration test requiring live DB).

## What Was Built

This plan completed Phase 118 for Strapi by:

1. Verifying that the Plan 01 auto-fix (commit `6f865124`) had already rewritten relative imports in all 14 remaining non-api test files. Zero import changes were needed.
2. Running the full Jest test suite with `--runInBand` to establish the post-move baseline and confirm no import-resolution regressions.

## Tasks Completed

| # | Name | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Verify relative imports in 14 remaining test files | (no files changed — already fixed by 118-01) | 14 test files verified: cron, extensions, middlewares, services |
| 2 | Run full test suite and verify structural compliance | (no files changed — run-only task) | All 27 test files discovered and run |

## Verification Results

### Structural Compliance

- `find apps/strapi/tests -name "*.test.ts" | wc -l` = **27** (pass)
- `find apps/strapi/src -name "*.test.ts" | wc -l` = **0** (pass)
- `grep '"<rootDir>/tests"' apps/strapi/jest.config.js` = matches (pass)
- `grep -rn 'from "\.\.\/' tests/ | grep -v '/src/'` = 0 matches (pass — all imports route through src/)
- `grep -rn 'jest\.mock("\.\.' tests/ | grep -v '/src/'` = 0 matches (pass)
- `weather.test.ts` __dirname path = `../../../.env` (3 hops, pass)

### Test Suite Baseline (post-move)

Run command: `cd apps/strapi && yarn test --runInBand`

| Status | Count | Files |
|--------|-------|-------|
| PASS | 22 | See list below |
| FAIL | 4 | Pre-existing failures — see below |
| Integration (always fails) | 1 | general.utils.test.ts |

**Passing (22 files):**
- tests/api/ad/controllers/ad.findBySlug.test.ts
- tests/api/ad/services/ad.compute-status.test.ts
- tests/api/ad/services/ad.sort-priority.test.ts
- tests/api/article/content-types/article/article.lifecycles.test.ts
- tests/api/auth-one-tap/controllers/auth-one-tap.test.ts
- tests/api/payment/services/ad.service.test.ts
- tests/api/payment/services/ad.zoho.test.ts
- tests/api/payment/services/pack.service.test.ts
- tests/api/payment/services/pack.zoho.test.ts
- tests/api/payment/services/pro-cancellation.service.test.ts
- tests/cron/subscription-charge.cron.test.ts
- tests/extensions/users-permissions/controllers/userController.test.ts
- tests/middlewares/protect-user-fields.test.ts
- tests/services/facto/facto.test.ts
- tests/services/flow/flow.test.ts
- tests/services/google-one-tap/google-one-tap.service.test.ts
- tests/services/oneclick/oneclick.service.test.ts
- tests/services/payment-gateway/gateway.test.ts
- tests/services/tavily/tavily.test.ts
- tests/services/weather/weather.test.ts
- tests/services/zoho/http-client.test.ts
- tests/services/zoho/zoho.test.ts

**Pre-existing failures (4 files — not import-related):**

1. **tests/api/ad/services/ad.approve.zoho.test.ts** — `TS2740`: mock object `{ contentType, query }` is missing 56+ properties from `Core.Strapi` interface. Strapi v5 tightened the factory type signature — mock needs casting to `as unknown as Core.Strapi`.
2. **tests/api/payment/controllers/payment.test.ts** — `proResponse clears pro_pending_invoice after use` assertion mismatch (`mockEntityServiceUpdate` call expectation fails).
3. **tests/extensions/users-permissions/controllers/authController.test.ts** — `TypeError: strapi.getModel is not a function` (mock missing `getModel` implementation) and one `undefined.error` in forgotPassword handler.
4. **tests/services/indicador/indicador.test.ts** — `TS2339: Property 'date' does not exist on type 'IndicatorsResponse'` (interface evolved, test still references old shape).

**Integration test (1 file):**
- **tests/api/payment/general.utils.test.ts** — Requires a live Strapi instance (`createStrapi()` + `instance.start()`). Calls `process.exit("1")` when DB not available. Always fails in unit/CI mode — expected behavior.

## Technical Notes

### Why --runInBand

Running Jest with parallel workers caused SIGKILL (OOM) on multiple test suites in this WSL2 environment. Running `--runInBand` serializes test execution and uses a single process, avoiding memory pressure. The 4 pre-existing failures above are logic/type failures, not memory-related.

### Import Rewrite Already Done

The Plan 01 auto-fix (commit `6f865124`) applied the same depth-based import rewrite rule to all 14 non-api files. As a result, Task 1 of this plan required zero file modifications — all 14 files already had correct `../../src/`, `../../../src/`, and `../../../../src/` import paths.

## Deviations from Plan

### Task 1: No rewrites needed

**Expected:** Rewrite imports in 14 remaining test files.
**Actual:** Imports were already correct (rewritten by Plan 01 auto-fix). Task 1 became a verification-only pass.
**Impact:** None — structural goal is fully achieved. Zero file changes needed.

## Known Stubs

None — this plan is a pure structural verification and test run. No data flow or UI logic changed.

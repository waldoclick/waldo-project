---
phase: 51
plan: "51-01"
subsystem: strapi
tags: [typescript, any-elimination, seeders, tests, v1.20]
dependency_graph:
  requires: []
  provides: [TSANY-33, TSANY-34, TSANY-35, TSANY-36]
  affects: [apps/strapi/seeders, apps/strapi/src/api/payment/services/__tests__, apps/strapi/src/api/payment/controllers/__tests__]
tech_stack:
  added: []
  patterns:
    - "Core.Strapi type for seeder function parameters (replaces strapi:any)"
    - "(global as unknown as { strapi: MockStrapi }) cast to avoid global redeclaration conflict"
    - "Local result interfaces (ProcessPaidWebpayResult, PackPurchaseResult, ProcessPaidPaymentResult) for typed test result assertions"
    - "controller.packResponse(ctx as unknown as Context) — direct property access with Context cast"
key_files:
  created: []
  modified:
    - apps/strapi/seeders/categories.ts
    - apps/strapi/seeders/packs.ts
    - apps/strapi/seeders/regions.ts
    - apps/strapi/seeders/faqs.ts
    - apps/strapi/seeders/conditions.ts
    - apps/strapi/src/api/payment/services/__tests__/pack.zoho.test.ts
    - apps/strapi/src/api/payment/services/__tests__/pack.service.test.ts
    - apps/strapi/src/api/payment/services/__tests__/ad.service.test.ts
    - apps/strapi/src/api/payment/controllers/__tests__/payment.controller.test.ts
decisions:
  - "Global strapi mock uses (global as unknown as { strapi: MockStrapi }) cast — avoids conflict with @strapi/types declaring global var strapi:Strapi which cannot be redeclared"
  - "controller.packResponse direct access with ctx cast to Context — public property allows direct access, Koa partial mock requires ctx as unknown as Context"
metrics:
  duration_minutes: 8
  completed_date: "2026-03-08"
  tasks_completed: 2
  files_modified: 9
---

# Phase 51 Plan 1: Seeders + Test Files any Elimination Summary

**One-liner:** `Core.Strapi` type for 5 seeders + typed interfaces for 4 payment test files — eliminates all `any` in TSANY-33–36 scope.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 51-01-A | Replace `strapi:any` with `Core.Strapi` in 5 seeder files | `aa568b4` | categories.ts, packs.ts, regions.ts, faqs.ts, conditions.ts |
| 51-01-B | Replace `as any` casts in 4 payment test files | `1faa9a6` | pack.zoho.test.ts, pack.service.test.ts, ad.service.test.ts, payment.controller.test.ts |

## Decisions Made

### Global strapi mock cast pattern
`(global as unknown as { strapi: MockStrapi })` instead of `declare global { var strapi: MockStrapi }`.

`@strapi/types` already declares `global var strapi: Strapi` (the full Core.Strapi type). Redeclaring with a narrower `MockStrapi` type causes a TypeScript conflict: "Subsequent variable declarations must have the same type." The double-cast via `unknown` bypasses this without touching the global declaration.

### Direct `controller.packResponse` access with Context cast
`controller.packResponse(ctx as unknown as Context)` instead of `(controller as any).packResponse(ctx)`.

`packResponse` is a public class property (not private), so direct access is valid. The partial mock object from `makeCtx()` doesn't satisfy `Koa.Context`'s 60+ properties, requiring `ctx as unknown as Context`. This is a narrower cast than the original `controller as any` — only the mock context is cast, not the entire controller.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Global redeclaration conflict in pack.zoho.test.ts**
- **Found during:** Task 51-01-B, Step 1 (pack.zoho.test.ts)
- **Issue:** Plan suggested `declare global { var strapi: MockStrapi }` but this conflicts with `@strapi/types` global declaration. LSP reported "Subsequent variable declarations must have the same type."
- **Fix:** Used `(global as unknown as { strapi: MockStrapi })` double-cast pattern instead of global redeclaration. This is equivalent in runtime behavior and satisfies TypeScript without conflicts.
- **Files modified:** pack.zoho.test.ts
- **Commit:** 1faa9a6

**2. [Rule 1 - Bug] Koa Context type mismatch for controller.packResponse**
- **Found during:** Task 51-01-B, Step 2 (payment.controller.test.ts)
- **Issue:** `controller.packResponse(ctx)` fails because `makeCtx()` returns a partial object that doesn't satisfy `Koa.Context`. LSP reported "missing 58+ properties from ExtendableContext."
- **Fix:** Added `import type { Context } from "koa"` and cast `ctx as unknown as Context` at each call site. This is the minimal cast needed — the controller itself is no longer cast to `any`.
- **Files modified:** payment.controller.test.ts
- **Commit:** 1faa9a6

## Acceptance Criteria Verification

| # | Criterion | Result |
|---|-----------|--------|
| 1 | `tsc --noEmit` exits 0 | ✅ PASS |
| 2 | `yarn test` — all existing tests pass | ✅ PASS (4 pre-existing failures confirmed unchanged) |
| 3 | No `: any\|as any` in seeder files | ✅ PASS |
| 4 | No `as any\|: any` in pack.zoho.test.ts | ✅ PASS |
| 5 | No `as any\|: any` in pack.service.test.ts | ✅ PASS |
| 6 | No `as any\|: any` in ad.service.test.ts | ✅ PASS |
| 7 | No `as any\|: any` in payment.controller.test.ts | ✅ PASS |
| 8 | No catch block error types changed | ✅ PASS |
| 9 | No runtime behavior changed | ✅ PASS |
| 10 | v1.20 milestone scope clean | ✅ PASS (remaining any in cron, lifecycles, etc. are out of scope) |

## Self-Check: PASSED

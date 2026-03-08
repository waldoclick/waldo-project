---
phase: 48
plan: "48-01"
subsystem: strapi
tags: [typescript, any-elimination, type-safety, flow-service]
dependency-graph:
  requires: []
  provides: [TSANY-08, TSANY-09, TSANY-10, TSANY-11, TSANY-12]
  affects: [apps/strapi/src/api/order, apps/strapi/src/api/filter, apps/strapi/src/services/flow]
tech-stack:
  added: []
  patterns:
    - "unknown instead of any for opaque/external data fields"
    - "Record<string, unknown> narrowing pattern for Axios error data"
    - "Core.Strapi import type from @strapi/strapi for DI typing"
    - "String() cast pattern for numeric fields in Record<string, string> param bags"
key-files:
  created: []
  modified:
    - apps/strapi/src/api/order/types/order.types.ts
    - apps/strapi/src/api/filter/types/filter.types.ts
    - apps/strapi/src/services/flow/types/flow.types.ts
    - apps/strapi/src/services/flow/factories/flow.factory.ts
    - apps/strapi/src/services/flow/services/flow.service.ts
decisions:
  - "IFlowSubscriptionResponse.invoices typed as IFlowInvoice[] (not unknown[]) — IFlowInvoice already existed and pro.service.ts accesses .id on items"
  - "Record<string, unknown> narrowing + typeof check instead of (data as any).message cast in Axios error handlers"
  - "String() cast for all numeric values in Record<string, string> param bags — required by URLSearchParams usage"
metrics:
  duration: "~6 minutes"
  tasks_completed: 2
  files_modified: 5
  completed_date: "2026-03-08"
---

# Phase 48 Plan 01: Type Files + Flow Service any Elimination Summary

**One-liner:** Replaced all `any` in order/filter type files and flow service with `unknown`, `Core.Strapi`, and `Record<string, string>` using type-narrowing patterns.

## What Was Built

Eliminated all `any` types from five Strapi source files:

1. **`order.types.ts`** — `QueryParams.filters/sort/populate` and `Order.payment_response/document_details` → `unknown`
2. **`filter.types.ts`** — `Category.icon` and all 12 `StrapiFilter` operators (`$eq`, `$ne`, `$lt`, etc.) → `unknown`/`unknown[]`
3. **`flow.types.ts`** — `IFlowPaymentStatusResponse.optional` → `Record<string, unknown>`; `IFlowSubscriptionResponse.invoices` → `IFlowInvoice[]`; `IFlowInvoice.items/chargeAttemps` → `unknown[]`
4. **`flow.factory.ts`** — `type Strapi = any` removed; parameter typed as `Core.Strapi` via `import type { Core } from "@strapi/strapi"`
5. **`flow.service.ts`** — `type Strapi = any` removed; all 6 `Record<string, any>` param bags → `Record<string, string>` with `String()` casts; all 5 `(data as any).message` casts → `Record<string, unknown>` narrowing pattern

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 48-01-A | fd8f865 | Fix any in order, filter, and flow type definition files |
| 48-01-B | 00a1c95 | Fix any in flow factory and service files |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used `IFlowInvoice[]` instead of `unknown[]` for `IFlowSubscriptionResponse.invoices`**
- **Found during:** Task 48-01-A — after changing to `unknown[]`, `tsc --noEmit` reported 2 errors in `pro.service.ts` accessing `.id` on invoice array elements
- **Issue:** `pro.service.ts` at lines 179 and 190 accesses `subscriptionResult.invoices[0].id` — valid when typed as `any[]` but broken with `unknown[]`
- **Fix:** Typed `invoices` as `IFlowInvoice[]` — `IFlowInvoice` already exists in the same file and models exactly what the Flow API returns; this is strictly more type-safe than `unknown[]`
- **Files modified:** `apps/strapi/src/services/flow/types/flow.types.ts`
- **Commit:** fd8f865

## Verification

All acceptance criteria confirmed:
- ✅ `tsc --noEmit` — zero errors
- ✅ `yarn test --testPathPattern="flow.test"` — 2/2 tests pass
- ✅ Zero `any` matches in all 5 target files
- ✅ `flow.test.ts` not modified (its `mockStrapi = {} as any` remains untouched)
- ✅ No runtime behavior changed — type annotations only

## Self-Check: PASSED

Files verified:
- FOUND: apps/strapi/src/api/order/types/order.types.ts
- FOUND: apps/strapi/src/api/filter/types/filter.types.ts
- FOUND: apps/strapi/src/services/flow/types/flow.types.ts
- FOUND: apps/strapi/src/services/flow/factories/flow.factory.ts
- FOUND: apps/strapi/src/services/flow/services/flow.service.ts

Commits verified:
- FOUND: fd8f865
- FOUND: 00a1c95

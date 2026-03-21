---
phase: 105-pro-subscription-checkout-page
plan: "01"
subsystem: strapi-payment
tags: [pro-subscription, order-creation, facto-documents, cron, tdd]
dependency_graph:
  requires: []
  provides: [pro-order-creation, pro-facto-documents, pro-pending-invoice-flag]
  affects: [subscription-charge-cron, payment-controller, user-schema]
tech_stack:
  added: []
  patterns: [non-fatal-try-catch, jest-mock-hoisting-fix, pro-pending-invoice-flag]
key_files:
  created:
    - apps/strapi/src/api/payment/controllers/payment.test.ts
  modified:
    - apps/strapi/src/extensions/users-permissions/content-types/user/schema.json
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/cron/subscription-charge.cron.ts
    - apps/strapi/src/cron/subscription-charge.cron.test.ts
decisions:
  - "pro_pending_invoice stored on user record to thread is_invoice from proCreate through Transbank redirect to proResponse"
  - "Cron uses isInvoice=false (boleta) by default — user invoice preference storage in cron is deferred"
  - "Order+Facto creation is non-fatal in both proResponse and cron chargeUser — subscription continues on failure"
  - "Fallback redirect to /pro/gracias when order documentId unavailable; primary redirect to /pro/pagar/gracias?order={documentId}"
  - "Jest mock hoisting requires jest.fn() in factory (not external variable refs) — get typed refs via import after mock declarations"
metrics:
  duration: "8 minutes"
  completed_date: "2026-03-21"
  tasks_completed: 3
  files_modified: 5
---

# Phase 105 Plan 01: PRO Order + Facto Creation — Backend Summary

PRO subscription flow now creates an order record and Facto tax document (boleta/factura) after both successful inscriptions and monthly recurring charges, with the `pro_pending_invoice` flag threading invoice preference from checkout to response.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 0 | Create test scaffolds | d70d9b57 | payment.test.ts (new), subscription-charge.cron.test.ts |
| 1 | Add schema field + update proCreate/proResponse | 80d62c50 | schema.json, payment.ts |
| 2 | Add order+Facto to cron + pass all tests | 48bcc2d6 | subscription-charge.cron.ts, test fixes |

## What Was Built

### User Schema
Added `pro_pending_invoice` boolean field (default: `false`) to the user schema. This field threads the `is_invoice` preference from the checkout form through the Transbank card enrollment redirect, where no JWT is present.

### proCreate
Modified to read `is_invoice` from `ctx.request.body.data` and store it as `pro_pending_invoice` on the user record alongside `pro_inscription_token`.

### proResponse
1. Reads `pro_pending_invoice` from the user record resolved via `pro_inscription_token` lookup
2. Clears `pro_pending_invoice: false` in the same `entityService.update` that activates the subscription
3. Creates a Facto document (boleta or factura based on preference) via `generateFactoDocument`
4. Creates an order record via `createAdOrder` with PRO item (`Suscripcion PRO mensual`)
5. Redirects to `/pro/pagar/gracias?order={documentId}` (fallback to `/pro/gracias` if order creation fails)

### Monthly Charge Cron
Added order + Facto boleta creation after each successful `chargeUser` call:
- `documentDetails(user.id, false)` — fetch billing details (boleta is default)
- `generateFactoDocument` with charge items
- `orderUtils.createAdOrder` with charge data
- Full try/catch: any failure is logged and does NOT affect `pro_expires_at` extension

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Jest mock hoisting in both test files**
- **Found during:** Task 2 test run
- **Issue:** `jest.mock()` factories referencing variables declared with `const` below the factory cause `ReferenceError: Cannot access before initialization` (temporal dead zone). The cron test's new mocks used `mockCreateAdOrder` etc. in the factory body.
- **Fix:** Changed all `jest.mock()` factories to use inline `jest.fn()` calls. Added explicit imports of mocked modules after the mock declarations to get typed references via `import orderUtilsMock from "..."` + `orderUtilsMock.createAdOrder as jest.Mock`.
- **Files modified:** `payment.test.ts`, `subscription-charge.cron.test.ts`
- **Commit:** 48bcc2d6

**2. [Rule 1 - Bug] Fixed proCreate test using `getCurrentUser` mock**
- **Found during:** Task 2 test run (proCreate tests failing with 0 calls to entityService.update)
- **Issue:** `proCreate` calls `getCurrentUser(ctx)` (fully mocked), bypassing `entityService.findOne`. The tests were setting up `mockEntityServiceFindOne` which was never called. Also `jest.clearAllMocks()` was clearing the `getCurrentUser` mock's resolved value.
- **Fix:** Added `mockGetCurrentUser.mockResolvedValue(defaultUser)` to `beforeEach` to re-establish the mock return value after `clearAllMocks()`.
- **Files modified:** `payment.test.ts`
- **Commit:** 48bcc2d6

## Test Results

```
Tests: 20 passed, 20 total
Test Suites: 2 passed, 2 total

payment.test.ts (6 tests):
  - proCreate stores pro_pending_invoice=true when is_invoice=true
  - proCreate stores pro_pending_invoice=false when is_invoice omitted
  - proResponse creates order + Facto document after successful inscription
  - proResponse redirects to /pro/pagar/gracias?order={documentId}
  - proResponse clears pro_pending_invoice after use
  - proResponse still redirects to /pro/gracias if order creation fails

subscription-charge.cron.test.ts (14 tests, 2 new):
  - chargeUser creates order + Facto document on successful charge
  - chargeUser extends pro_expires_at even when order creation fails
  + 12 existing tests all pass
```

## Known Stubs

None — all flows create real order records and Facto documents. The cron uses `isInvoice: false` (boleta) by default, which is intentional and documented in the plan as deferred.

## Self-Check: PASSED

All created/modified files exist on disk. All 3 task commits verified in git history (d70d9b57, 80d62c50, 48bcc2d6).

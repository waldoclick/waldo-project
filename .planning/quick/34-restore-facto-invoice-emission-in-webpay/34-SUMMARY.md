---
quick_task: 34
title: Restore Facto Invoice Emission in Webpay Checkout
subsystem: strapi/payment
tags: [payment, webpay, facto, invoicing, checkout]
requirements: [FACTO-WEBPAY-01]
dependency_graph:
  requires: []
  provides: [Facto boleta/factura emission in unified Webpay checkout]
  affects: [apps/strapi/src/api/payment/controllers/payment.ts, apps/strapi/src/api/payment/services/checkout.service.ts]
tech_stack:
  added: []
  patterns: [buy_order 6-segment encoding, non-fatal try/catch for external service, adResponse gold-standard pattern]
key_files:
  modified:
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/services/checkout.service.ts
decisions:
  - "Typed paymentItems as Parameters<typeof generalUtils.generateFactoDocument>[0]['items'] to satisfy TaxItem[] constraint without exporting TaxItem"
  - "Non-fatal try/catch wraps the entire Facto block — checkout completes even if Facto fails"
  - "is_invoice decoded from buy_order part[5] — no DB lookup needed"
metrics:
  duration: ~10min
  completed: 2026-03-13
  tasks_completed: 2
  files_modified: 2
---

# Quick Task 34: Restore Facto Invoice Emission in Webpay Summary

**One-liner:** Restored Facto boleta/factura emission in unified Webpay flow by encoding `is_invoice` as 6th `buy_order` segment and porting the `adResponse` Facto block into `processWebpayReturn`.

## What Was Done

The legacy `adResponse` handler emitted Facto documents correctly. The new unified `processWebpayReturn` in `checkout.service.ts` was missing two things:
1. `is_invoice` was hardcoded to `false` and never propagated from the frontend
2. The entire Facto emission block (documentDetails → PaymentDetails → generateFactoDocument) was absent

Both gaps were closed by two focused changes.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add `is_invoice` to `CheckoutPayload` and encode as 6th `buy_order` segment | ac04e3f | payment.ts, checkout.service.ts |
| 2 | Decode `is_invoice` in `processWebpayReturn` + add full Facto emission block | 0780984 | checkout.service.ts |

## Changes Made

### Task 1 — `is_invoice` encoding in buy_order

**`apps/strapi/src/api/payment/controllers/payment.ts`**
- Extended `checkoutCreate` body type: `data?.is_invoice?: boolean`
- Passed `is_invoice: data.is_invoice` to `initiateCheckout`

**`apps/strapi/src/api/payment/services/checkout.service.ts`**
- Added `is_invoice?: boolean` to `CheckoutPayload` interface
- Added `invoiceFlag = payload.is_invoice ? 1 : 0`
- Updated buy_order format: `order-{userId}-{packId}-{adId}-{featured}-{invoiceFlag}` (6 segments)

### Task 2 — Facto emission in `processWebpayReturn`

**`apps/strapi/src/api/payment/services/checkout.service.ts`**
- Added imports: `documentDetails`, `generalUtils`, `PackType`, `FeaturedType`
- Added `const is_invoice = parts[5] === "1"` in buy_order parse block
- Inserted Facto emission block (step 10b) between `publishAd` and `createAdOrder`:
  - `documentDetails(userId, is_invoice)` → billing details
  - `generalUtils.PaymentDetails(packId, featured, userId, adId)` → line items
  - `generalUtils.generateFactoDocument({ isInvoice, userDetails, items })` → Facto document
  - Non-fatal: wrapped in try/catch with logger.error on failure
- Updated `createAdOrder` call: removed `is_invoice: false` hardcode, added `document_details`, `items`, `document_response`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TaxItem type mismatch in paymentItems declaration**
- **Found during:** Task 2 TypeScript check
- **Issue:** `paymentItems: unknown[]` caused TS error — `generateFactoDocument` expects `TaxItem[]` (not exported from general.utils.ts)
- **Fix:** Typed as `Parameters<typeof generalUtils.generateFactoDocument>[0]['items']` — derives the correct type without needing to export `TaxItem`
- **Files modified:** checkout.service.ts
- **Commit:** 0780984 (inline fix, no separate commit)

## Verification

All success criteria met:
- ✅ `checkoutCreate` body accepts `is_invoice?: boolean` and passes it to `initiateCheckout`
- ✅ `initiateCheckout` encodes it as the 6th segment of buy_order (`-0` or `-1`)
- ✅ `processWebpayReturn` decodes part[5] as `is_invoice`
- ✅ Facto document emission runs after `publishAd`, before `createAdOrder`, in a non-fatal try/catch
- ✅ `createAdOrder` passes `is_invoice`, `document_details`, `items`, `document_response`
- ✅ TypeScript strict-mode compiles with zero errors

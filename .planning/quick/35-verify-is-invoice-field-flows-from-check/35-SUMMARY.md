---
phase: quick-35
plan: 35
subsystem: website/checkout
tags: [checkout, invoice, payments, is_invoice]
dependency_graph:
  requires: []
  provides: [is_invoice forwarded to Strapi payments/checkout]
  affects: [Boleta/Factura invoice emission]
tech_stack:
  added: []
  patterns: [Strapi SDK double-cast payload]
key_files:
  modified:
    - apps/website/app/components/CheckoutDefault.vue
decisions:
  - Added is_invoice to create() payload using adStore.is_invoice (already in scope)
metrics:
  duration: "~5 minutes"
  completed: "2026-03-14"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Quick Task 35: Verify is_invoice Field Flows from Checkout Summary

**One-liner:** Added `is_invoice: adStore.is_invoice` to `payments/checkout` POST payload so Strapi receives the Boleta/Factura flag selected by the user.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add is_invoice to checkout payload | 3cc00fd | apps/website/app/components/CheckoutDefault.vue |

## What Changed

In `CheckoutDefault.vue`, the `handlePayClick()` function's `create("payments/checkout", { ... })` call was missing the `is_invoice` field. The user's Boleta/Factura selection (stored in `adStore.is_invoice` via `PaymentInvoice.vue`) was silently dropped before reaching Strapi, breaking invoice emission.

**Before:**
```ts
{
  pack: selectedPack.name,
  ad_id: adStore.ad.ad_id,
  featured: adStore.featured,
} as unknown as Parameters<typeof create>[1]
```

**After:**
```ts
{
  pack: selectedPack.name,
  ad_id: adStore.ad.ad_id,
  featured: adStore.featured,
  is_invoice: adStore.is_invoice,
} as unknown as Parameters<typeof create>[1]
```

## Verification

- `grep -n "is_invoice" apps/website/app/components/CheckoutDefault.vue` → line 62 confirmed
- `yarn workspace waldo-website run nuxt typecheck` → exit 0, no new errors

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `apps/website/app/components/CheckoutDefault.vue` modified with `is_invoice: adStore.is_invoice`
- [x] Commit `3cc00fd` exists with `feat(quick-35): forward is_invoice to Strapi checkout payload`
- [x] TypeScript typecheck passed (exit 0)

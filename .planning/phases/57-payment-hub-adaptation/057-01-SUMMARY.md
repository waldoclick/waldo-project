---
phase: 57-payment-hub-adaptation
plan: "057-01"
subsystem: website/checkout, strapi/payment
tags: [payment, checkout, pack-only, routing]
dependency_graph:
  requires: [056-01-SUMMARY.md]
  provides: [pack-only-payment-flow, payment-hub-branching]
  affects: [CheckoutDefault.vue, FormCheckout.vue, payment.ts]
tech_stack:
  added: []
  patterns: [adStore.ad.ad_id-null-sentinel, payments/pack-endpoint, v-if-isPackFlow]
key_files:
  created: []
  modified:
    - apps/website/app/components/CheckoutDefault.vue
    - apps/website/app/components/FormCheckout.vue
    - apps/strapi/src/api/payment/controllers/payment.ts
decisions:
  - "adStore.ad.ad_id === null as pack-only sentinel — checked before any mutations; reliable because draft call only happens in ad+pack branch"
  - "Pack-only branch reuses handleRedirect() — same Webpay POST form submission; no new infrastructure needed"
  - "v-if (not v-show) for ad-specific sections — PaymentAd and Destacado are never rendered in pack-only, not merely hidden"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-03-08"
  tasks_completed: 4
  files_modified: 3
requirements: [PAY-01, PAY-02, PAY-03]
---

# Phase 57 Plan 01: Payment Hub Adaptation Summary

## One-liner

`/pagar` now branches on `adStore.ad.ad_id === null` to call `payments/pack` (pack-only) or `payments/ad` (ad+pack), with `FormCheckout` hiding `PaymentAd` and Destacado when no ad is present.

## What Was Built

Made `/pagar` serve both purchase flows — pack-only (user arrived from `/packs`) and pack+ad (user arrived from `/anunciar/resumen`) — by adding a sentinel-based branch in `CheckoutDefault.vue`, hiding irrelevant UI sections in `FormCheckout.vue`, and fixing a dead redirect in the Strapi payment controller.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Hide ad-specific sections in FormCheckout (pack-only flow) | 71d089c | FormCheckout.vue |
| 2 | Branch handlePayClick on pack-only vs ad+pack in CheckoutDefault | 73c92d5 | CheckoutDefault.vue |
| 3 | Fix packResponse cancel redirect from /packs/comprar to /pagar | 906eef7 | payment.ts |
| 4 | Run nuxt typecheck — zero errors confirmed | (no files changed) | — |

## Key Changes

### CheckoutDefault.vue — `handlePayClick` branching
```typescript
const isPackOnly = adStore.ad.ad_id === null;
if (isPackOnly) {
  // POST payments/pack with { pack, is_invoice }
  // handleRedirect() reused for Webpay redirect
  return;
}
// ad+pack branch: save draft → POST payments/ad (unchanged)
```

### FormCheckout.vue — conditional sections
```html
<div v-if="!isPackFlow" class="form--checkout__ad"> <!-- PaymentAd hidden -->
<div v-if="!isPackFlow" class="form--checkout__field"> <!-- Destacado hidden -->
```
`isPackFlow` was already declared in the script (`adStore.ad.ad_id === null`). Only template changes needed.

### payment.ts — cancel redirect
```typescript
// Before (dead URL deleted in Phase 56):
ctx.redirect(`${process.env.FRONTEND_URL}/packs/comprar`);
// After:
ctx.redirect(`${process.env.FRONTEND_URL}/pagar`);
```

## Decisions Made

1. **`adStore.ad.ad_id === null` as sentinel** — This is evaluated _before_ any mutations; reliable because the draft-save call only exists in the ad+pack branch. When a user arrives from `/packs`, `ad_id` is null and `ad.name` is "". No need for compound conditions.

2. **Reuse `handleRedirect()`** — Pack-only flow uses the same Webpay form-POST redirect helper. No duplication needed; the pack response from Strapi returns `{ data: { webpay: { url, gatewayRef } } }` matching the existing helper's signature.

3. **`v-if` not `v-show`** — `PaymentAd` and Destacado are ad-specific features; in pack-only flow they should not be mounted at all, not just hidden. `v-if` prevents the components from fetching or computing irrelevant data.

## Success Criteria Verification

| Criterion | Status |
|-----------|--------|
| `FormCheckout.vue` — `v-if="!isPackFlow"` on "Tu anuncio" div | ✅ |
| `FormCheckout.vue` — `v-if="!isPackFlow"` on "Destacado" div | ✅ |
| `CheckoutDefault.vue` — pack-only branch calls `POST payments/pack` | ✅ |
| `CheckoutDefault.vue` — ad+pack branch logic unchanged | ✅ |
| `payment.ts` — cancel redirect → `/pagar` not `/packs/comprar` | ✅ |
| `nuxt typecheck` exits with zero errors | ✅ |
| PAY-01: pack-only end-to-end wired (UI → payments/pack → packResponse → /packs/gracias) | ✅ |
| PAY-02: ad+pack purchase path unbroken | ✅ |
| PAY-03: FormCheckout hides PaymentAd + featured when ad_id is null | ✅ |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `apps/website/app/components/FormCheckout.vue` | ✅ Found |
| `apps/website/app/components/CheckoutDefault.vue` | ✅ Found |
| `apps/strapi/src/api/payment/controllers/payment.ts` | ✅ Found |
| `.planning/phases/57-payment-hub-adaptation/057-01-SUMMARY.md` | ✅ Found |
| Commit 71d089c (Task 1 — FormCheckout v-if guards) | ✅ Found |
| Commit 73c92d5 (Task 2 — CheckoutDefault branching) | ✅ Found |
| Commit 906eef7 (Task 3 — payment.ts cancel redirect) | ✅ Found |

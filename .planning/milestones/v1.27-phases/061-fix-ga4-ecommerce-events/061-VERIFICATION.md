---
phase: 061-fix-ga4-ecommerce-events
verified: 2026-03-12T18:02:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 061: Fix GA4 Ecommerce Events — Verification Report

**Phase Goal:** Repair GA4 ecommerce event tracking after unified checkout: fire `purchase` on /pagar/gracias using order data, fire `begin_checkout` on /pagar entry for the pack-only flow, and ensure no undefined values in any event payload.
**Verified:** 2026-03-12T18:02:00Z
**Status:** ✅ PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                          | Status     | Evidence                                                                 |
|----|------------------------------------------------------------------------------------------------|------------|--------------------------------------------------------------------------|
| 1  | `useAdAnalytics` exposes a `purchase()` method that accepts order data directly (not store state) | ✓ VERIFIED | `purchase(order: PurchaseOrderData)` at line 157 of `useAdAnalytics.ts`; returned at line 199 |
| 2  | `pushEvent` accepts an optional `flow` parameter that overrides the hardcoded `'ad_creation'` default | ✓ VERIFIED | `flow = "ad_creation"` as 4th param at line 62; used in `eventData` at line 71 |
| 3  | `purchase()` event payload contains `transaction_id`, `value`, `currency`, and `items` with no undefined fields | ✓ VERIFIED | Fallback chains: `buy_order ?? documentId ?? ""`, `amount ?? totalAmount ?? 0`, `currency ?? "CLP"`; 8 TDD tests including one with empty order `{}` confirm no undefined |
| 4  | All existing methods (`beginCheckout`, `addPaymentInfo`, etc.) continue to work unchanged      | ✓ VERIFIED | All 10 exports present in return object (line 189–200); 12 TDD tests pass including backward-compat test |
| 5  | `purchase` event fires on /pagar/gracias using order data (`transaction_id`, `value`, `currency`, `items` all non-undefined) | ✓ VERIFIED | `watch(orderData, handler, { immediate: true })` at line 129–138 of `gracias.vue`; calls `adAnalytics.purchase(order as PurchaseOrderData)` |
| 6  | `purchase` event fires exactly once per page visit (not on every re-render)                   | ✓ VERIFIED | `purchaseFired = ref(false)` guard at line 43; set to `true` before firing (line 133); condition `!purchaseFired.value` at line 132 |
| 7  | `begin_checkout` fires when /pagar loads with no `ad_id` in the store (pack-only flow)        | ✓ VERIFIED | `onMounted` in `pagar/index.vue` at line 21–28: `if (adStore.ad.ad_id === null) { adAnalytics.beginCheckout() }` |
| 8  | `begin_checkout` does NOT fire for the ad-creation flow on /pagar (`ad_id` is set in that case) | ✓ VERIFIED | Conditional is `=== null` check — when `ad_id` is a number (ad-creation flow), the block does not execute |
| 9  | `adStore.clearAll()` still runs after purchase event fires — event data is from order, not store | ✓ VERIFIED | `clearAll()` in `onMounted` (line 45–47); `watch` fires on data availability (before/during mount) using order object; no dependency on store analytics state |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/website/app/composables/useAdAnalytics.ts` | `purchase()` method and flow-aware `pushEvent()` | ✓ VERIFIED (substantive + wired) | 201 lines; exports `purchase`, `PurchaseOrderData`, `DataLayerEvent`; `pushEvent` 4th param `flow = "ad_creation"` |
| `apps/website/app/composables/useAdAnalytics.test.ts` | 12 TDD tests for new behavior | ✓ VERIFIED (substantive + passing) | 244 lines; all 12 tests pass (`yarn test run` confirmed) |
| `apps/website/app/pages/pagar/gracias.vue` | `purchase` event wiring in `watch(orderData)` | ✓ VERIFIED (substantive + wired) | `watch(orderData, ..., { immediate: true })` with `purchaseFired` guard; `adAnalytics.purchase(order as PurchaseOrderData)` |
| `apps/website/app/pages/pagar/index.vue` | `begin_checkout` for pack-only flow | ✓ VERIFIED (substantive + wired) | `onMounted` with `adStore.ad.ad_id === null` check calling `adAnalytics.beginCheckout()` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `useAdAnalytics.ts` | `window.dataLayer` | `pushEvent` with `flow` discriminator | ✓ WIRED | `flow = "ad_creation"` default; `"pack_purchase"` passed by `purchase()`; `window.dataLayer.push(eventData)` at line 81 |
| `pagar/gracias.vue` | `useAdAnalytics.purchase()` | `watch(orderData, ..., { immediate: true })` | ✓ WIRED | Pattern `adAnalytics\.purchase\(order` confirmed at line 134; `watch` imported at line 21; `purchaseFired` guard in place |
| `pagar/index.vue` | `useAdAnalytics.beginCheckout()` | `onMounted` — conditional on `adStore.ad.ad_id === null` | ✓ WIRED | `adStore.ad.ad_id === null` at line 25; `adAnalytics.beginCheckout()` at line 26; `ad.store.ts` confirms `ad_id: null as number | null` default |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| GA-01 | 061-01, 061-02 | `purchase()` method in composable using order data | ✓ SATISFIED | `purchase(order: PurchaseOrderData)` implemented and exported |
| GA-02 | 061-02 | `begin_checkout` fires on /pagar for pack-only flow | ✓ SATISFIED | `pagar/index.vue` `onMounted` with `ad_id === null` guard |
| GA-03 | 061-01, 061-02 | No undefined values in any event payload | ✓ SATISFIED | Fallback chains `?? ""`, `?? 0`, `?? "CLP"` — 8 TDD tests confirm; empty-order test explicit |
| GA-04 | 061-01, 061-02 | `flow` discriminator in `pushEvent()` | ✓ SATISFIED | Optional 4th param `flow = "ad_creation"`; `purchase()` passes `"pack_purchase"` |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | — |

No TODOs, FIXMEs, placeholders, empty implementations, or console.log stubs found in any of the three modified files.

---

### Commits Verified

All 4 commits from SUMMARY documents confirmed to exist in git history:

| Commit | Description | Status |
|--------|-------------|--------|
| `42d3160` | RED — failing tests for `purchase()` and flow param | ✓ Exists |
| `a48f1a5` | GREEN — `purchase()` implementation + `flow` param | ✓ Exists |
| `41836a2` | Wire purchase event in `pagar/gracias.vue` | ✓ Exists |
| `be85762` | Wire `begin_checkout` in `pagar/index.vue` | ✓ Exists |

---

### Human Verification Required

None — all critical behaviors are verified programmatically.

The following items are marked as informational (not blocking):

#### 1. GA4 Payload Reaches GTM in Real Browser Session

**Test:** Open `/pagar/gracias?order=<valid-order-id>` in a browser with GTM Preview enabled.
**Expected:** A `purchase` event appears in the GTM data layer preview with `transaction_id`, `value`, `currency`, `items` all populated and `flow: "pack_purchase"`.
**Why human:** Requires a real Webpay order and live GTM environment — cannot be verified statically.

#### 2. Pack-Only `begin_checkout` Sends Items

**Test:** Navigate from `/packs` (select a pack) → `/pagar`. Check GTM preview for `begin_checkout` event.
**Expected:** `begin_checkout` fires with `items` array containing the selected pack; if analytics state is empty, no event fires (the `beginCheckout` no-op is acceptable per plan design).
**Why human:** Requires live session to verify store state has `pack_selected` populated.

---

### Notes on Notable Design Decisions

1. **`purchase()` passes `[]` as items to `pushEvent`** — This was a plan deviation (auto-fixed). The `pushEvent` body contains `if (items.length > 0) { eventData.ecommerce = { items } }` which would overwrite the full ecommerce payload. Passing `[]` and putting the complete ecommerce object in `extraData` correctly bypasses this overwrite. This is verified in the composable source.

2. **`watch(orderData, ..., { immediate: true })` over `onMounted`** — Correctly handles SSR hydration where `orderData` may be populated before `onMounted` fires. The `purchaseFired` guard prevents double-fire.

3. **`beginCheckout()` is a no-op if analytics items are empty** — Correct behavior per plan: `if (items.length > 0)` guard in `pushEvent` prevents an empty/undefined event from being sent.

---

## Summary

Phase 061 goal is **fully achieved**. All three repairs are in place and substantive:

1. ✅ **`purchase` fires on `/pagar/gracias`** — `watch(orderData, ..., { immediate: true })` with `purchaseFired` one-shot guard calls `adAnalytics.purchase(order)` before `adStore.clearAll()` can wipe state.
2. ✅ **`begin_checkout` fires on `/pagar` for pack-only flow** — `onMounted` with `ad_id === null` discriminator correctly targets only pack-only visits.
3. ✅ **No undefined values in any event payload** — Fallback chains (`?? ""`, `?? 0`, `?? "CLP"`) and 12 passing TDD tests (including an empty-order edge case) confirm this.

---

_Verified: 2026-03-12T18:02:00Z_
_Verifier: Claude (gsd-verifier)_

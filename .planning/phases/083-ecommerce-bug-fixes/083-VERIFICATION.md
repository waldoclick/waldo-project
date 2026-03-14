---
phase: 083-ecommerce-bug-fixes
verified: 2026-03-14T12:15:46Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 083: Ecommerce Bug Fixes — Verification Report

**Phase Goal:** GA4 ecommerce events report accurate data — real revenue, real item IDs, and free ad creation tracked as a conversion
**Verified:** 2026-03-14T12:15:46Z
**Status:** ✅ PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | GA4 receives purchase events with value as a JavaScript number, not a string | ✓ VERIFIED | `Number(order.amount ?? order.totalAmount ?? 0)` on line 161 of `useAdAnalytics.ts`; test `"coerces string amount to number"` confirms `typeof ecommerce.value === "number"` |
| 2 | GA4 purchase events show real revenue (e.g. 19990) instead of $0 | ✓ VERIFIED | `Number("19990")` → `19990` confirmed by ECOM-01 test case; coercion wraps entire `??` chain |
| 3 | GA4 purchase event item_id falls back to transactionId when documentId is absent | ✓ VERIFIED | `item_id: order.documentId \|\| transactionId \|\| ""` on line 166; ECOM-02 test `"uses transactionId as item_id fallback"` passes with `BO-123` |
| 4 | All existing 12 Vitest tests continue to pass after the fixes | ✓ VERIFIED | `yarn vitest run` reports **17 passed (17)** — all pre-existing tests green |
| 5 | Two new tests cover the string-amount coercion and item_id fallback scenarios | ✓ VERIFIED | 3 ECOM-01/ECOM-02 tests added (lines 227–285 of test file) plus 2 ECOM-03 tests = 5 new tests total, 17 total |
| 6 | GA4 Realtime shows a purchase event with value: 0 when a user completes free ad creation at /anunciar/gracias | ✓ VERIFIED | `watch(adData, { immediate: true })` watcher at lines 83–97 of `anunciar/gracias.vue` builds `freeAdOrder` with `amount: 0` and calls `adAnalytics.purchase()` |
| 7 | The free-ad purchase event fires exactly once (no double-fire on SSR hydration) | ✓ VERIFIED | `purchaseFired = ref(false)` guard on line 81; watcher checks `!purchaseFired.value` and sets it to `true` before calling — identical pattern to `pagar/gracias.vue` |
| 8 | The purchase event item_id is the ad's documentId, not an order documentId | ✓ VERIFIED | `freeAdOrder.documentId = (ad.documentId as string) ?? (route.query.ad as string)` — uses ad's documentId as the identity, not an order's |
| 9 | All 15 tests from plan 01 plus 2 new ECOM-03 tests pass (17 total) | ✓ VERIFIED | Test runner output: `Tests  17 passed (17)` in 30ms |

**Score: 9/9 truths verified**

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/website/app/composables/useAdAnalytics.ts` | Fixed `purchase()` — `Number()` coercion on value, `\|\|` fallback on `item_id` | ✓ VERIFIED | Line 161: `Number(order.amount ?? order.totalAmount ?? 0)` ✓; line 166: `order.documentId \|\| transactionId \|\| ""` ✓ |
| `apps/website/app/composables/useAdAnalytics.test.ts` | 17 tests covering string-amount coercion, item_id fallback, free-ad shape | ✓ VERIFIED | 345 lines; 3 describe blocks; 17 `it()` assertions confirmed by test runner |
| `apps/website/app/pages/anunciar/gracias.vue` | `watch(adData)` watcher + `purchaseFired` ref guard + `useAdAnalytics` import | ✓ VERIFIED | Lines 18–24 (imports), 80–97 (analytics watcher) — all elements present and wired |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `apps/website/app/composables/useAdAnalytics.ts` `purchase()` | GA4 `window.dataLayer` | `Number()` coercion wrapping `order.amount ?? order.totalAmount ?? 0` | ✓ WIRED | `Number()` confirmed line 161; `value` propagated to both top-level ecommerce and `items[0].price` |
| `apps/website/app/composables/useAdAnalytics.ts` `purchase()` | `item_id` in GA4 items array | `order.documentId \|\| transactionId \|\| ""` fallback chain | ✓ WIRED | Line 166; `\|\|` operator correctly treats empty string as falsy, triggering transactionId fallback |
| `apps/website/app/pages/anunciar/gracias.vue` | `useAdAnalytics.purchase()` | `watch(adData, { immediate: true }) → adAnalytics.purchase(freeAdOrder)` | ✓ WIRED | `adAnalytics` from `useAdAnalytics()` called at line 93; watcher fires with SSR-safe `{ immediate: true }` |
| `anunciar/gracias.vue adData` | `PurchaseOrderData.documentId` | `(ad.documentId as string) ?? (route.query.ad as string)` | ✓ WIRED | Line 89 inside watcher; falls back to route query param for SSR edge cases where `ad.documentId` may be absent |
| `apps/website/app/pages/pagar/gracias.vue` | `useAdAnalytics.purchase()` | Pre-existing `watch(orderData, { immediate: true })` pattern | ✓ WIRED | Reference implementation confirmed at lines 129–138 of `pagar/gracias.vue` — pattern mirrors exactly |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| **ECOM-01** | 083-01 | `purchase` event reports real transaction value (not always $0) — `order.amount` field coerced from Strapi biginteger string | ✓ SATISFIED | `Number()` coercion on line 161; tests `"coerces string amount to number"` and `"coerces string '0' amount to numeric 0"` pass |
| **ECOM-02** | 083-01 | `purchase` event `item_id` is populated with real `documentId` (not empty string) | ✓ SATISFIED | `order.documentId \|\| transactionId \|\| ""` on line 166; test `"uses transactionId as item_id fallback when documentId is absent"` passes with `"BO-123"` |
| **ECOM-03** | 083-02 | GA4 receives `purchase` event with `value: 0` when user creates a free ad at `/anunciar/gracias` | ✓ SATISFIED | `watch(adData)` watcher with `amount: 0` in `anunciar/gracias.vue`; tests `"handles free ad purchase with value: 0"` and `"uses ad documentId as item_id for free ad purchase"` pass |

**All 3 phase requirements satisfied. No orphaned requirements detected.**

REQUIREMENTS.md traceability table confirms ECOM-01, ECOM-02, ECOM-03 all mapped to Phase 083 with status "Complete".

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `anunciar/gracias.vue` | 74 | `return null` | ℹ️ Info | Legitimate `computed()` guard for `data.value` error state — not a stub |

No blocker or warning anti-patterns found in any of the three modified files.

---

## Human Verification Required

### 1. Real Revenue in GA4 Ecommerce Dashboard

**Test:** Complete a paid ad checkout with a real Webpay transaction. Open GA4 → Reports → Monetization → Ecommerce purchases → inspect the `purchase` event.
**Expected:** Revenue column shows real CLP value (e.g. `19990`) instead of `$0`.
**Why human:** GA4 Realtime/Ecommerce dashboard cannot be asserted by unit tests; requires live browser session with GTM firing.

### 2. Free Ad Conversion in GA4 Realtime

**Test:** Create a free ad through the full wizard. After reaching `/anunciar/gracias`, open GA4 Realtime → Events → look for `purchase`.
**Expected:** A `purchase` event appears with `value: 0` and `item_id` set to the ad's `documentId`.
**Why human:** SSR hydration behavior and actual GTM dataLayer push to GA4 require a live browser session to verify.

---

## Commit Verification

All four implementation commits documented in SUMMARYs are verified in git log:

| Commit | Type | Description |
|--------|------|-------------|
| `658a99b` | test | Add failing tests for string-amount coercion and item_id fallback (RED) |
| `1d1fd39` | fix | Coerce Strapi biginteger amount to number and fix item_id fallback (GREEN) |
| `af2d672` | test | Add ECOM-03 tests for free-ad purchase event |
| `2e36b7c` | feat | Wire GA4 purchase event on free-ad success page |

---

## Gaps Summary

No gaps. All automated must-haves pass at all three verification levels (exists → substantive → wired).

The two human verification items are expected for GA4 integration — they require a live browser session with GTM firing and are not blocking automated verification.

---

_Verified: 2026-03-14T12:15:46Z_
_Verifier: Claude (gsd-verifier)_

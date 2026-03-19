# Phase 083: Ecommerce Bug Fixes — Research

**Researched:** 2026-03-14
**Domain:** GA4 ecommerce event tracking (Vue 3 / Nuxt 4 / Vitest)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ECOM-01 | The `purchase` event reports real transaction value (not always $0) — `order.amount` field name corrected so GA4 ecommerce dashboard shows actual revenue | Strapi `biginteger` fields serialize to strings; `purchase()` must coerce `amount` to `Number` before sending to GA4 |
| ECOM-02 | The `purchase` event `item_id` is populated with the real order `documentId` (not empty string) | `documentId` IS present on the Strapi documents API response; the issue is the `PurchaseOrderData` type and the order response shape — confirmed both present |
| ECOM-03 | GA4 receives a `purchase` event with `value: 0` when a user successfully creates a free ad (`/anunciar/gracias`) | Free-ad page has `adData` (with `documentId`); needs a `watch(adData, { immediate: true })` pattern identical to `pagar/gracias.vue` |
</phase_requirements>

---

## Summary

Phase 083 fixes three bugs in the existing GA4 ecommerce tracking in `useAdAnalytics.ts`. All bugs are **surgical, low-risk code changes** — no schema migrations, no new API endpoints, no new dependencies.

**Bug 1 (ECOM-01):** Strapi's `biginteger` field type serializes to a **string** in HTTP JSON responses (e.g., `"19990"` not `19990`). The `purchase()` function uses `order.amount ?? order.totalAmount ?? 0` with `??` (nullish coalescing). Since a non-null string passes `??`, the string `"19990"` is sent to GA4's `value` field. GA4 requires `value` to be a number; receiving a string causes $0 display in the Ecommerce dashboard.

**Bug 2 (ECOM-02):** After closer inspection, `documentId` IS available on the order response (Strapi v5 `documents().findOne()` returns `documentId` as a system field). However, the `PurchaseOrderData` type in `useAdAnalytics.ts` has `documentId?: string` — this is correct. The likely real-world failure is `documentId` is undefined in the response when the order controller returns a raw `entityService` result instead of `documents()` API result for numeric IDs. The `findOne` controller has a branch for numeric IDs that uses `db.query().findOne()`, which may not include `documentId` in all environments.

**Bug 3 (ECOM-03):** The `anunciar/gracias.vue` page has no analytics event at all. A `purchase` event with `value: 0` and `item_id: adData.documentId` must be fired using the same `watch(adData, { immediate: true })` pattern used in `pagar/gracias.vue`.

**Primary recommendation:** Fix `purchase()` to call `Number(order.amount ?? order.totalAmount ?? 0)` for value coercion; add a `purchaseFreeAd()` method or reuse `purchase()` with a free-ad `PurchaseOrderData` object in `anunciar/gracias.vue`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `useAdAnalytics.ts` | project | All GA4 events via `window.dataLayer.push()` | Single source of truth for analytics events |
| Vitest | 3.2.4 | Unit tests for composables | Already in use; 12 tests currently pass |
| `@nuxtjs/strapi` | 2.1.1 | Fetching order/ad data from API | Project standard for all Strapi calls |

### No New Dependencies
All fixes are internal to existing composables and pages. No new libraries needed.

---

## Architecture Patterns

### Existing Pattern: purchase() event on pagar/gracias.vue

```typescript
// Source: apps/website/app/pages/pagar/gracias.vue (lines 129-138)
const purchaseFired = ref(false);

watch(
  orderData,
  (order) => {
    if (order && !purchaseFired.value) {
      purchaseFired.value = true;
      adAnalytics.purchase(order as PurchaseOrderData);
    }
  },
  { immediate: true },
);
```

This pattern handles both SSR hydration and lazy-loaded cases. The `purchaseFired` guard prevents double-fire.

**ECOM-03 must mirror this pattern exactly** in `anunciar/gracias.vue`.

### Existing Pattern: pushEvent() in useAdAnalytics.ts

```typescript
// Source: apps/website/app/composables/useAdAnalytics.ts (lines 58-82)
const pushEvent = (eventName, items, extraData = {}, flow = "ad_creation") => {
  window.dataLayer.push({ ecommerce: null });  // GA4 clear step
  const eventData = { event: eventName, flow, ...extraData };
  if (items.length > 0) {
    eventData.ecommerce = { items };
  }
  window.dataLayer.push(eventData);
};
```

The `purchase()` function passes `ecommerce` via `extraData` (not via `items`), so it IS pushed despite `items = []`.

### Pattern: Strapi biginteger → number coercion

Strapi v5 `biginteger` fields serialize to strings in API responses. Always coerce to number before using in GA4 events:

```typescript
// CORRECT:
const value = Number(order.amount ?? order.totalAmount ?? 0);

// WRONG (current code):
const value = order.amount ?? order.totalAmount ?? 0;  // string passthrough
```

The `order.amount` can be:
- `"19990"` (string) when received from API
- `undefined` when field is absent
- `0` when fallback applies

`Number("19990")` → `19990` ✓
`Number(undefined)` → `NaN` — so coerce AFTER nullish fallback: `Number(order.amount ?? order.totalAmount ?? 0)`

### Anti-Patterns to Avoid
- **Using `order.amount` directly without coercion:** Strapi biginteger returns string; GA4 silently accepts but shows $0
- **Bare `await` outside `useAsyncData`:** Never call store/API actions outside `useAsyncData` in Nuxt pages (double-fetch)
- **Firing purchase twice:** Always use a `purchaseFired` ref guard when using `watch({ immediate: true })`

---

## Root Cause Analysis

### ECOM-01: Value = $0

**Location:** `apps/website/app/composables/useAdAnalytics.ts` line 160
```typescript
const value = order.amount ?? order.totalAmount ?? 0;  // ← BUG: string from API
```

**Root cause:** Strapi `biginteger` fields serialize to strings in JSON. The `??` operator passes the string through unchanged. GA4's `value` field requires a number.

**Fix:** `const value = Number(order.amount ?? order.totalAmount ?? 0);`

**Verified via:** `apps/strapi/src/api/order/content-types/order/schema.json` (`"type": "biginteger"`), `order.types.ts` (`amount: string`), Strapi controller logic (`typeof order.amount === "string" ? Number.parseFloat(order.amount)`)

### ECOM-02: item_id = ""

**Location:** `apps/website/app/composables/useAdAnalytics.ts` line 164
```typescript
item_id: order.documentId ?? "",  // ← documentId may be undefined
```

**Root cause:** Two scenarios:
1. The `PurchaseOrderData` interface has `documentId?: string` — correct. But when the controller's `findOne` uses the `db.query().findOne()` branch (for numeric IDs), the result may not include `documentId` as it's a system field only from the documents API.
2. The `useOrderById` returns `data` from `strapi.findOne("orders", documentId)` response. The `@nuxtjs/strapi` v5 composable expects `{ data: T, meta: M }` shape, but the custom controller returns `{ data: order }` without `meta`. This is fine for `data` access, but `order.documentId` should be present from the `strapi.documents().findOne()` call.

**Fix:** In `purchase()`, ensure `item_id` is non-empty: `item_id: order.documentId || transactionId || ""`. When `documentId` is unavailable, fall back to `transactionId` (buy_order or documentId from payment_response).

**Verified via:** Order controller `findOne` (lines 202-233), `useOrderById` composable, Strapi system fields docs (`documentId` present on documents API results)

### ECOM-03: No purchase event on free ad page

**Location:** `apps/website/app/pages/anunciar/gracias.vue` — no analytics code

**Root cause:** Free ad creation was never tracked. The `adData` computed property is already available (ad object from `useAsyncData`). Need to add:
1. Import `useAdAnalytics` and `PurchaseOrderData`
2. Add `purchaseFired` ref
3. Add `watch(adData, { immediate: true })` to fire `purchase({ documentId: adData.documentId, amount: 0, currency: "CLP" })`

**Available data:** `adData.documentId` (Strapi v5 system field), `adData.currency` (enumeration: CLP/USD)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GA4 dataLayer push | Custom GA4 SDK | `useAdAnalytics.pushEvent()` | Already handles clear + push pattern |
| Order/ad fetching | Raw fetch | `useAsyncData` + `strapi.findOne` | SSR-safe, handles hydration |
| Free ad purchase event | Separate new function | Reuse `purchase()` with free-ad data | Avoids duplicate logic, keeps tests unified |

---

## Common Pitfalls

### Pitfall 1: Double-fire on SSR hydration
**What goes wrong:** `watch({ immediate: true })` fires once on server (SSR), then again on client (hydration). Without a guard, the purchase event fires twice.
**Why it happens:** SSR renders the page with data already loaded; client hydrates and re-runs watchers.
**How to avoid:** Always use `const purchaseFired = ref(false)` guard pattern (already used in `pagar/gracias.vue`).
**Warning signs:** GA4 shows duplicate purchase events in Realtime.

### Pitfall 2: Strapi biginteger as string
**What goes wrong:** `value` in GA4 ecommerce shows as $0 even when order has real amount.
**Why it happens:** JSON can't represent BigInt; Strapi serializes biginteger fields to strings.
**How to avoid:** Always coerce: `Number(order.amount ?? 0)`. Never use `??` alone on biginteger fields.
**Warning signs:** `typeof order.amount === "string"` in the order controller (line 184) — this is the proof.

### Pitfall 3: purchase() passes items=[] but ecommerce is in extraData
**What goes wrong:** Thinking the `items` array path is broken and trying to fix it.
**Why it happens:** The `purchase()` function passes `ecommerce` via `extraData`, not via `items`. The `pushEvent(eventName, [], { ecommerce: {...} })` pattern works correctly — ecommerce is spread from extraData.
**How to avoid:** Don't change the `pushEvent` plumbing; only fix the `value` coercion and `item_id` fallback inside `purchase()`.
**Warning signs:** All 12 existing tests pass — the structure is correct.

### Pitfall 4: Free ad has no order documentId
**What goes wrong:** Using `order.documentId` for a free ad's `item_id` when there's no order.
**Why it happens:** Free ads don't go through checkout — they have an `ad.documentId` but no `order.documentId`.
**How to avoid:** For ECOM-03, use `adData.documentId` (the ad's documentId, not an order's) as the `item_id` when building the free-ad purchase event.

---

## Code Examples

### Fix for ECOM-01 — Amount coercion in useAdAnalytics.ts

```typescript
// Source: apps/website/app/composables/useAdAnalytics.ts (purchase function)
const purchase = (order: PurchaseOrderData) => {
  const transactionId =
    order.payment_response?.buy_order ?? order.documentId ?? "";
  // FIX: coerce to Number — Strapi biginteger serializes to string
  const value = Number(order.amount ?? order.totalAmount ?? 0);
  const currency = order.currency ?? "CLP";

  const items: AnalyticsItem[] = [
    {
      // FIX: fall back to transactionId if documentId missing
      item_id: order.documentId || transactionId || "",
      item_name: "Orden de pago",
      item_category: "Order",
      price: value,
      quantity: 1,
      currency,
    },
  ];
  // rest unchanged...
};
```

### Fix for ECOM-02 — item_id fallback in useAdAnalytics.ts

Already shown above: `item_id: order.documentId || transactionId || ""`

### Fix for ECOM-03 — Free ad purchase event in anunciar/gracias.vue

```typescript
// Add to script setup in apps/website/app/pages/anunciar/gracias.vue
import { ref, watch } from "vue";
import {
  useAdAnalytics,
  type PurchaseOrderData,
} from "~/composables/useAdAnalytics";

const adAnalytics = useAdAnalytics();
const purchaseFired = ref(false);

watch(
  adData,
  (ad) => {
    if (ad && !purchaseFired.value) {
      purchaseFired.value = true;
      const freeAdOrder: PurchaseOrderData = {
        documentId: ad.documentId as string,
        amount: 0,
        currency: (ad.currency as string) ?? "CLP",
      };
      adAnalytics.purchase(freeAdOrder);
    }
  },
  { immediate: true },
);
```

Note: `adData` type is `Record<string, unknown> | null`. Cast fields appropriately.

### PurchaseOrderData interface (current — no changes needed)

```typescript
// Source: apps/website/app/composables/useAdAnalytics.ts (lines 16-25)
export interface PurchaseOrderData {
  documentId?: string;
  amount?: number;       // NOTE: may receive string from Strapi API despite number type
  totalAmount?: number;  // fallback field
  currency?: string;
  payment_response?: {
    buy_order?: string;
    authorization_code?: string;
  };
}
```

The interface is correct as declared. The runtime string→number coercion handles the mismatch.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn vitest run app/composables/useAdAnalytics.test.ts` |
| Full suite command | `yarn vitest run` (from `apps/website/`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ECOM-01 | `purchase()` sends `value` as number (not string) when `amount` is a numeric string | unit | `yarn vitest run app/composables/useAdAnalytics.test.ts` | ✅ (add test) |
| ECOM-02 | `purchase()` sends non-empty `item_id` when `documentId` is present | unit | `yarn vitest run app/composables/useAdAnalytics.test.ts` | ✅ (existing test covers) |
| ECOM-03 | Free ad page fires `purchase` event with `value: 0` | unit | `yarn vitest run app/composables/useAdAnalytics.test.ts` | ✅ (add test for new function) |

### Sampling Rate
- **Per task commit:** `yarn vitest run app/composables/useAdAnalytics.test.ts`
- **Per wave merge:** `yarn vitest run` (full suite from `apps/website/`)
- **Phase gate:** All 12 existing tests + new tests green before `/gsd-verify-work`

### Wave 0 Gaps

The test file `app/composables/useAdAnalytics.test.ts` already exists with 12 passing tests. New tests to add:

- [ ] `ECOM-01`: Test that `purchase()` coerces string amount to number (e.g., `amount: "19990"` → `ecommerce.value === 19990`)
- [ ] `ECOM-03`: Test for `purchase()` with `amount: 0` produces `ecommerce.value === 0` and `item_id` uses `documentId` — this is ALREADY covered by "defaults to 0" and "builds items array" tests. New test: passing `amount: "0"` (string) still yields numeric `0`.

**Key gap:** No test currently covers the `amount` as string scenario (ECOM-01 root cause). Must add before or alongside the fix.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A — pure bug fixes | Fix biginteger coercion + free ad tracking | Phase 083 | GA4 ecommerce reports show real revenue |

---

## Open Questions

1. **Is `documentId` actually undefined in production for some orders?**
   - What we know: The custom `findOne` controller has two branches — `db.query().findOne()` for numeric IDs and `documents().findOne()` for string IDs. Only the documents API guarantees `documentId` on the result.
   - What's unclear: Whether any orders in production are fetched via numeric ID (which would use the `db.query()` branch where `documentId` might not be present).
   - Recommendation: Add the `|| transactionId || ""` fallback anyway (defensive) regardless of root cause. Also verify by checking what `useOrderById` actually returns — it passes a string documentId, so it should use the `documents()` branch.

2. **Does `anunciar/gracias.vue` `adData` always have `documentId`?**
   - What we know: `strapi.findOne("ads", documentId)` fetches the ad, and Strapi v5 includes `documentId` as a system field on all records.
   - What's unclear: Whether the `@nuxtjs/strapi` v2 composable with the custom controller response (`{ data: ad }`) properly exposes `documentId`.
   - Recommendation: Cast `ad as Record<string, unknown>` and access `ad.documentId as string`. If undefined, fall back to the query parameter `route.query.ad as string` (which IS the documentId).

---

## Sources

### Primary (HIGH confidence)
- `apps/strapi/src/api/order/content-types/order/schema.json` — confirms `amount` is `biginteger` type
- `apps/strapi/src/api/order/types/order.types.ts` — confirms `amount: string` in TypeScript type
- `apps/strapi/src/api/order/controllers/order.ts` lines 183-186 — confirms Strapi itself must parse `typeof order.amount === "string" ? Number.parseFloat(order.amount)`
- `apps/website/app/composables/useAdAnalytics.ts` — current buggy `purchase()` implementation
- `apps/website/app/composables/useAdAnalytics.test.ts` — 12 existing tests, all passing
- `apps/website/app/pages/pagar/gracias.vue` — reference implementation for `watch(orderData, { immediate: true })` pattern
- `apps/website/app/pages/anunciar/gracias.vue` — no analytics code (ECOM-03 gap confirmed)
- `node_modules/@nuxtjs/strapi/dist/runtime/types/v5.d.ts` — `StrapiSystemFields` includes `documentId: string`

### Secondary (MEDIUM confidence)
- Vitest run output confirms 12/12 tests pass on current code
- Strapi v5 documents API documentation pattern for `documentId` system field

---

## Metadata

**Confidence breakdown:**
- Root causes: HIGH — confirmed by schema, types, and Strapi's own string-parse code
- Fix strategy: HIGH — surgical changes to one composable and one page
- Test coverage: HIGH — existing 12 tests are well-structured; new string-amount test is straightforward
- Free ad pattern: HIGH — mirrors existing `pagar/gracias.vue` pattern exactly

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable codebase — no external dependencies)

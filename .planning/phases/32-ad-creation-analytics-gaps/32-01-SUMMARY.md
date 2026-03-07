# Phase 32, Plan 01 — Summary

## What Was Done

Closed all five analytics gaps in the ad creation flow (ANA-01 through ANA-05).

## Changes Made

### ANA-01 — Dead import removed (CreateAd.vue)
- Removed `import { useAdAnalytics }` and `const adAnalytics = useAdAnalytics()` from `CreateAd.vue`
- These were never called; analytics are fired by the parent `index.vue` page

### ANA-02 — step_view overcounting fixed (index.vue)
- Removed `{ immediate: true }` from `watch(adStore.step, ...)` — the watcher now only fires on actual step changes
- Added explicit `adAnalytics.stepView(1, "Payment Method")` call inside `onMounted`, after `viewItemList`, to fire step 1 exactly once on initial mount

### ANA-03 — redirect_to_payment event added (resumen.vue)
- Added `adAnalytics.pushEvent("redirect_to_payment", [], { payment_method: "webpay" })` immediately before `handleRedirect()` in `handlePayClick()`
- This captures the critical moment when the user leaves the SPA for Webpay

### ANA-04 — purchase guard added (gracias.vue)
- Added `purchaseFired = ref(false)` guard
- Wrapped the `adAnalytics.pushEvent("purchase", ...)` call in `if (!purchaseFired.value)` check
- `purchaseFired.value = true` set immediately before the push
- Prevents duplicate purchase events on `watchEffect` re-runs

### ANA-05 — DataLayerEvent typed and exported
- `DataLayerEvent` interface exported from `useAdAnalytics.ts` (was local)
- `ecommerce` field widened to `Record<string, unknown> | null` to allow GTM's null-flush pattern
- `window.d.ts` imports `DataLayerEvent` and types `window.dataLayer` as `(DataLayerEvent | Record<string, unknown>)[]`
- The union type covers both GA4 analytics events (with `event`/`flow`) and GTM consent commands (plain objects without `event`/`flow`)

## Files Modified

- `apps/website/app/components/CreateAd.vue`
- `apps/website/app/pages/anunciar/index.vue`
- `apps/website/app/pages/anunciar/resumen.vue`
- `apps/website/app/pages/anunciar/gracias.vue`
- `apps/website/app/composables/useAdAnalytics.ts`
- `apps/website/app/types/window.d.ts`

## Verification

- `nuxt typecheck` passes with zero errors
- All 5 grep assertions pass
- Commit: `45659d1`

## Decisions Made

- `window.dataLayer` typed as `(DataLayerEvent | Record<string, unknown>)[]` rather than `DataLayerEvent[]`
  because GTM consent commands (`{ consent: "default", ... }`) do not carry `event`/`flow` fields —
  a union is accurate without forcing unrelated files (gtm.client.ts, LightboxCookies.vue) to cast
- `ecommerce` widened to `| null` to preserve the GTM best-practice of clearing ecommerce before
  each event push (`window.dataLayer.push({ ecommerce: null })`)

---
quick_task: 7
title: Clear ad store after successful payment
completed: "2026-03-11"
duration: "~3 minutes"
tasks_completed: 2
tasks_total: 2
files_modified:
  - apps/website/app/pages/anunciar/gracias.vue
  - apps/website/app/pages/pagar/gracias.vue
commits:
  - ec608b4
  - b68f412
key_decisions:
  - Used onMounted (client-only) instead of watchEffect or useAsyncData to clear store exactly once after SSR renders
  - Removed stale else-if block from pagar/gracias.vue watchEffect since store clearing is now in onMounted
---

# Quick Task 7: Clear Ad Store After Successful Payment — Summary

**One-liner:** Reset persisted ad wizard store via `onMounted` on both gracias pages so next ad creation starts fresh.

## What Was Done

Both thank-you pages now call `adStore.clearAll()` inside `onMounted()` upon landing, ensuring the multi-step ad creation wizard's localStorage-persisted state is wiped after a successful free-ad publish or Webpay payment.

### Task 1 — anunciar/gracias.vue

- Added `onMounted` to the existing `vue` import (alongside `watchEffect`)
- Imported `useAdStore` from `@/stores/ad.store`
- Added `const adStore = useAdStore()` and an `onMounted(() => { adStore.clearAll(); })` hook

**Commit:** `ec608b4`

### Task 2 — pagar/gracias.vue

- Added `onMounted` to the existing `vue` import (alongside `computed`, `watchEffect`, `ref`)
- Added `onMounted(() => { adStore.clearAll(); })` after existing store/analytics declarations
- Simplified `watchEffect`: removed the stale `else if` block with its `// TODO` comment, which existed solely to describe store clearing — now handled by `onMounted`

**Commit:** `b68f412`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `apps/website/app/pages/anunciar/gracias.vue` — modified and committed (ec608b4)
- [x] `apps/website/app/pages/pagar/gracias.vue` — modified and committed (b68f412)
- [x] `vue-tsc --noEmit` passed with zero errors after both changes
- [x] Pre-commit hooks (prettier + eslint) passed for both commits

## Self-Check: PASSED

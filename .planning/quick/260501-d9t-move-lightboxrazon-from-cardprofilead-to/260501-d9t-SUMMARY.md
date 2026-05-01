---
phase: 260501-d9t
plan: 01
subsystem: website/components
tags: [lightbox, pinia, app-store, refactor, vue3]
dependency_graph:
  requires: []
  provides: [global-deactivate-lightbox]
  affects: [CardProfileAd, LightboxRazon, default.vue, app.store]
tech_stack:
  added: []
  patterns: [store-driven-lightbox, self-contained-component]
key_files:
  created: []
  modified:
    - apps/website/app/types/app.d.ts
    - apps/website/app/stores/app.store.ts
    - apps/website/app/components/LightboxRazon.vue
    - apps/website/app/layouts/default.vue
    - apps/website/app/components/CardProfileAd.vue
decisions:
  - Move LightboxRazon to layout level using the same store-driven pattern as LightboxLogin — no props, reads from useAppStore, single global mount
  - openDeactivateLightbox(adDocumentId) stores documentId in app store so LightboxRazon can read it independently, no prop drilling needed
  - No toggle action for deactivate lightbox — open always carries a required adDocumentId parameter
metrics:
  duration: 15min
  completed: "2026-05-01T13:40:45Z"
  tasks_completed: 3
  tasks_total: 4
  files_changed: 5
---

# Phase 260501-d9t Plan 01: Move LightboxRazon from CardProfileAd to global layout

**One-liner:** Hoisted LightboxRazon from repeating CardProfileAd to global layout via Pinia app-store flag pattern (openDeactivateLightbox/closeDeactivateLightbox), matching LightboxLogin architecture exactly.

## What Was Done

LightboxRazon was previously rendered inside CardProfileAd with 8 props and 2 emits, causing one lightbox element per ad card and CSS stacking context issues (backdrop scoped to card, z-index not full-viewport). This refactor moves it to the layout level matching every other lightbox in the website.

### Task 1: App store extension (c29c5eb1)

Extended `AppState` and `app.store.ts` with two new volatile-UI-state fields:
- `isDeactivateLightboxActive: boolean` and `deactivateAdId: string | null` in `app.d.ts`
- State fields, getters (`getIsDeactivateLightboxActive`, `getDeactivateAdId`), and actions (`openDeactivateLightbox(adDocumentId)`, `closeDeactivateLightbox()`) in `app.store.ts`
- Neither field added to `persist.pick` — volatile UI state that must reset on reload

### Task 2: LightboxRazon refactored + global mount (595de423)

Rewrote `LightboxRazon.vue` `<script setup>`:
- Dropped all `defineProps` and `defineEmits` — component takes no props
- Reads `isDeactivateLightboxActive` and `deactivateAdId` from `useAppStore` via SSR-safe client guard
- Hardcoded deactivate-publication copy (title, description, default reason, labels)
- Moved `deactivateAd` + success Swal + `window.location.reload()` flow from CardProfileAd into the component
- Added ESC-to-close wiring matching LightboxLogin pattern (onMounted/onUnmounted keydown listener)
- BEM classes unchanged: `lightbox--razon`, `lightbox--razon__backdrop`, `lightbox--razon__box`, etc.

Added `<LightboxRazon />` to `default.vue` between `<LightboxLogin />` and `<LightboxTerms />`.

### Task 3: CardProfileAd stripped (ad01712c)

Removed from `CardProfileAd.vue`:
- `<LightboxRazon ... />` template block and its 8 props/2 event bindings
- `isDeactivateLightboxOpen` and `isDeactivating` local refs
- `closeDeactivateLightbox()` and `handleDeactivateSubmit()` functions
- `useUserStore` import (no longer used)
- `ref` from vue import (no longer used)

Replaced `handleDeactivate` with a thin 3-line store trigger calling `appStore.openDeactivateLightbox(ad.documentId)`.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `yarn nuxt typecheck` passes after each task
- `grep -c "LightboxRazon|isDeactivateLightboxOpen|handleDeactivateSubmit|closeDeactivateLightbox" CardProfileAd.vue` returns `0`
- All new identifiers present in all four target files as specified
- ESLint/prettier hooks passed on all commits

## Task 4: Awaiting Human Verification

Task 4 (`checkpoint:human-verify`) requires manual visual verification of the global lightbox behavior. See PLAN.md Task 4 for full verification steps.

## Known Stubs

None.

## Self-Check: PARTIAL

Tasks 1–3 complete and committed. Task 4 is a human-verify checkpoint — summary will be updated after verification is approved.

Commits verified:
- c29c5eb1 feat(260501-d9t-01): add deactivate-lightbox state and actions to app store — FOUND
- 595de423 feat(260501-d9t-01): refactor LightboxRazon to self-contained store-driven component — FOUND
- ad01712c refactor(260501-d9t-01): strip LightboxRazon and deactivate handlers from CardProfileAd — FOUND

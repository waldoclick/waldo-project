---
quick: 51
status: complete
date: "2026-03-15"
duration: "~15 minutes"
commits:
  - 26f94fe
  - 66cb9ab
files_modified: 21
tasks_completed: 3
tags: [ssr, pinia, store, getActivePinia, dashboard, website]
---

# Quick Task 51: Fix All getActivePinia SSR Crashes Summary

**One-liner:** Eliminated all `getActivePinia() was called but there was no active Pinia` SSR crashes by lazy-initializing or guarding every top-level `useXxxStore()` call across 21 components in dashboard and website.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Fix dashboard FormVerifyCode dangling appStore reference | 26f94fe | FormVerifyCode.vue (dashboard) |
| 2 | Fix dashboard admin components — lazy-init settingsStore, searchStore, articlesStore | 26f94fe | AdsTable, RegionsDefault, ReservationsFree, FaqsDefault, FeaturedFree, CommunesDefault, ReservationsUsed, LightBoxArticles |
| 3 | Fix website components — lazy-init all top-level store calls | 66cb9ab | FormVerifyCode, HeaderDefault, MobileBar, LightboxLogin, LightboxSearch, FilterResults, SearchDefault, SearchIcon, LinkLogin, FormProfile, CardProfileAd, FormContact |

## Changes Made

### Task 1 — Dashboard FormVerifyCode (dangling reference fix)
- Added `import { useAppStore } from "@/stores/app.store"` back to imports
- Added `const appStore = useAppStore()` lazily inside `handleVerify()` just before `appStore.clearReferer()` is called
- Result: resolves `ReferenceError: appStore is not defined` without introducing an SSR crash

### Task 2 — Dashboard Admin Components (Pattern B: guarded init)
Applied `import.meta.client ? useXxxStore() : ({} as ReturnType<typeof useXxxStore>)` to:
- **AdsTable.vue**: `useSettingsStore()`
- **RegionsDefault.vue**: `useSettingsStore()`
- **ReservationsFree.vue**: `useSettingsStore()`
- **FaqsDefault.vue**: `useSettingsStore()`
- **FeaturedFree.vue**: `useSettingsStore()`
- **CommunesDefault.vue**: `useSettingsStore()`
- **ReservationsUsed.vue**: `useSettingsStore()`
- **LightBoxArticles.vue**: `useSearchStore()` and `useArticlesStore()`

### Task 3 — Website Components

**Pattern A (lazy init inside handler):**
- **FormVerifyCode.vue**: moved `useAppStore()` and `useMeStore()` inside `handleVerify()`
- **SearchIcon.vue**: moved `useAppStore()` inside `handleOpenLightbox()`
- **LinkLogin.vue**: moved `useAppStore()` inside `handleClick()`
- **FormContact.vue**: moved `useAppStore()` inside `submitToStrapi()`
- **CardProfileAd.vue**: moved `useAdStore()` + `useCommunesStore()` inside `handleRepublish()`, `useUserStore()` inside `handleDeactivateSubmit()`, `useAdStore()` inside `handlePushImage()`
- **SearchDefault.vue**: moved `useFilterStore()` inside `useAsyncData` callback, moved `useAppStore()` inside `handleSubmit()`

**Pattern B (guarded init at setup level):**
- **HeaderDefault.vue**: guarded `useAdStore()` and `useAppStore()`
- **MobileBar.vue**: guarded `useAppStore()` and added guarded `storeToRefs` returning `{ isMobileMenuOpen: ref(false) }` on SSR
- **LightboxLogin.vue**: guarded `useAppStore()`
- **LightboxSearch.vue**: guarded `useAppStore()`
- **FilterResults.vue**: guarded `useFilterStore()`
- **FormProfile.vue**: guarded `useRegionsStore()`, `useCommunesStore()`, `useUserStore()` with null-safe computed accessors (`?.data ?? []`)

## Verification

- `yarn workspace waldo-dashboard nuxi typecheck` — zero errors ✅
- `yarn workspace waldo-website nuxi typecheck` — zero errors ✅
- All modified components have no unguarded top-level `useXxxStore()` calls ✅

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All commits exist:
- 26f94fe: fix(ssr): guard all top-level store calls in dashboard components ✓
- 66cb9ab: fix(ssr): guard all top-level store calls in website components ✓

---
phase: 55-store-unification
plan: "055-02"
subsystem: ui
tags: [nuxt, strapi, pinia, packs, useAsyncData]

# Dependency graph
requires:
  - phase: 55-store-unification
    provides: Plan 055-01 composables and store foundation
provides:
  - Four pages migrated from packs.store to direct Strapi calls
  - useAsyncData with strapi.find("ad-packs") pattern established in pages
affects:
  - 55-store-unification plan 055-03 (remaining packs.store consumers)
  - 56-pack-purchase-flow (packs/comprar.vue last remaining consumer)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Direct Strapi call in useAsyncData: strapi.find('ad-packs', { populate: '*' }) + response.data as unknown as Pack[]"
    - "SSR data return from useAsyncData for client hydration (initData.value?.packs)"
    - "packData computed for typed template access, eliminating as any casts in template"

key-files:
  created: []
  modified:
    - apps/website/app/pages/packs/index.vue
    - apps/website/app/pages/index.vue
    - apps/website/app/pages/packs/gracias.vue
    - apps/website/app/pages/anunciar/index.vue

key-decisions:
  - "anunciar/index.vue returns packs from useAsyncData as initData to transfer SSR state to client — avoiding re-fetch on hydration"
  - "gracias.vue: packData computed wraps data ref for typed access in template, replacing (data as any) casts"
  - "gracias.vue: useAsyncData key renamed from 'packData' to 'packs-gracias-pack' to follow '<page>-<data>' convention"
  - "gracias.vue: (pack as any).ads_count corrected to pack.total_ads (correct Pack interface field)"

patterns-established:
  - "Pages with packs data: use strapi.find('ad-packs', { populate: '*' }) inside useAsyncData, return response.data as unknown as Pack[]"
  - "When useAsyncData result needs typed template access: wrap in computed that narrows the union type"

requirements-completed:
  - PAY-04
  - CLN-02

# Metrics
duration: 3min
completed: 2026-03-08
---

# Phase 55 Plan 02: Migrate pages from packs.store to direct Strapi calls Summary

**Four pages migrated from `packs.store` to `strapi.find("ad-packs")` inside `useAsyncData`, with typed access via computed and SSR state transfer via `initData`**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-08T22:49:58Z
- **Completed:** 2026-03-08T22:53:26Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- `packs/index.vue`: replaced `new Promise` wrapper anti-pattern with clean `async/await` + direct `strapi.find()`
- `pages/index.vue`: replaced store-mediated `packsStore.loadPacks()` with direct Strapi call, added `Pack` type import
- `packs/gracias.vue`: replaced `packsStore.getPackById()` with `strapi.find()` + filter; eliminated all `(data as any)` casts via `packData` computed; fixed `(pack as any).ads_count` → `pack.total_ads`; renamed `useAsyncData` key to follow convention
- `anunciar/index.vue`: migrated `packsStore.loadPacks()` inside `Promise.all` to `strapi.find()`; returned packs from `useAsyncData` as `initData` for SSR hydration; updated analytics loops to use `initData.value?.packs`

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate packs/index.vue and pages/index.vue** - `21bcffd` (feat)
2. **Task 2: Migrate packs/gracias.vue** - `52e3378` (feat)
3. **Task 3: Migrate anunciar/index.vue** - `3b909c7` (feat)

**Plan metadata:** (docs commit — see final)

## Files Created/Modified
- `apps/website/app/pages/packs/index.vue` — Direct Strapi call replaces store-mediated load
- `apps/website/app/pages/index.vue` — Direct Strapi call + Pack type import
- `apps/website/app/pages/packs/gracias.vue` — Strapi filter call + packData computed + fixed field names + renamed useAsyncData key
- `apps/website/app/pages/anunciar/index.vue` — Strapi call in Promise.all + initData SSR transfer + updated analytics references

## Decisions Made
- `anunciar/index.vue` returns packs from `useAsyncData` as `initData` (not discarded) so Nuxt's SSR state transfer carries the data to the client — `initData.value?.packs` is safe in `onMounted` because Nuxt guarantees hydration before `onMounted` fires
- `gracias.vue` uses a `packData` computed to narrow `Pack | { error: string }` to `Pack | null`, giving Vue template typed access without casting
- `gracias.vue` useAsyncData key renamed from `"packData"` to `"packs-gracias-pack"` to follow the established `"<page>-<data>"` convention
- Fixed `(pack as any).ads_count` → `pack.total_ads` in `gracias.vue` watch callback — `ads_count` is not a field on the `Pack` interface; `total_ads` is the correct field

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed wrong field name `ads_count` → `total_ads` in gracias.vue watch callback**
- **Found during:** Task 2 (Migrate packs/gracias.vue)
- **Issue:** Plan mentioned fixing `(pack as any).ads_count` in the watch callback — the `Pack` interface defines `total_ads: number`, not `ads_count`. Using `ads_count` would result in `undefined` at runtime
- **Fix:** Replaced `(pack as any).ads_count` with `pack.total_ads` on both occurrences in the `watch(data, ...)` callback (`$setSEO` description and `$setStructuredData` description)
- **Files modified:** `apps/website/app/pages/packs/gracias.vue`
- **Verification:** `grep -n "as any\|ads_count" apps/website/app/pages/packs/gracias.vue` returns nothing
- **Committed in:** `52e3378` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Fix was part of the plan spec — no scope creep. Correctly identified in the plan as a field name correction.

## Issues Encountered
None - all tasks completed cleanly. The lint-staged merge conflict on Task 3's first commit attempt was resolved by re-staging the Prettier-formatted file.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All four target pages no longer import `packs.store`
- Only remaining consumer: `packs/comprar.vue` (intentionally left for Phase 56 — CLN-01 scope)
- `packs.store.ts` still has other consumers (`PaymentMethod.vue` was handled in 055-01) — ready for 055-03

## Self-Check: PASSED

- ✅ `apps/website/app/pages/packs/index.vue` exists
- ✅ `apps/website/app/pages/index.vue` exists
- ✅ `apps/website/app/pages/packs/gracias.vue` exists
- ✅ `apps/website/app/pages/anunciar/index.vue` exists
- ✅ Commit `21bcffd` exists (Task 1)
- ✅ Commit `52e3378` exists (Task 2)
- ✅ Commit `3b909c7` exists (Task 3)

---
*Phase: 55-store-unification*
*Completed: 2026-03-08*

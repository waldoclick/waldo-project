---
phase: 27-typescript-migration
plan: "01"
subsystem: ui
tags: [typescript, vue, nuxt, type-safety, migration]

# Dependency graph
requires:
  - phase: 26-data-fetching-cleanup
    provides: SSR-compatible pages that are now being migrated to TypeScript
provides:
  - All 18 website pages migrated to script setup lang=ts
  - Zero any types in 3 stores (ad.store, me.store, user.store)
  - Zero as any casts in 3 composables (useAdAnalytics, useAdPaymentSummary, usePackPaymentSummary)
  - DataLayerEvent interface in useAdAnalytics.ts
  - AnalyticsItem exported from ad.store.ts for page imports
affects: [28-typecheck-enablement]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ProfileData inline interface for useAsyncData return type shape in profile page"
    - "AdWithPriceData extending Omit<Ad> pattern when API response differs from form data type"
    - "as unknown as T cast pattern for Strapi SDK responses (established in Phase 26, continued here)"

key-files:
  created: []
  modified:
    - apps/website/app/pages/[slug].vue
    - apps/website/app/pages/anunciar/index.vue
    - apps/website/app/pages/anunciar/resumen.vue
    - apps/website/app/pages/anunciar/gracias.vue
    - apps/website/app/pages/anuncios/[slug].vue
    - apps/website/app/pages/packs/gracias.vue
    - apps/website/app/pages/anunciar/error.vue
    - apps/website/app/pages/contacto/gracias.vue
    - apps/website/app/pages/cuenta/avatar.vue
    - apps/website/app/pages/cuenta/cambiar-contrasena.vue
    - apps/website/app/pages/cuenta/cover.vue
    - apps/website/app/pages/cuenta/index.vue
    - apps/website/app/pages/cuenta/perfil/editar.vue
    - apps/website/app/pages/cuenta/perfil/index.vue
    - apps/website/app/pages/cuenta/username.vue
    - apps/website/app/pages/packs/comprar.vue
    - apps/website/app/pages/packs/error.vue
    - apps/website/app/pages/politicas-de-privacidad.vue
    - apps/website/app/stores/ad.store.ts
    - apps/website/app/stores/me.store.ts
    - apps/website/app/stores/user.store.ts
    - apps/website/app/composables/useAdAnalytics.ts
    - apps/website/app/composables/useAdPaymentSummary.ts
    - apps/website/app/composables/usePackPaymentSummary.ts

key-decisions:
  - "AdWithPriceData extends Omit<Ad, 'commune'|'category'|'condition'> to handle API response object shapes vs form-data number types in Ad"
  - "prepareSummary() in anunciar/resumen.vue refactored to zero-param — uses adStore already in scope, avoids typing the Pinia store parameter"
  - "DataLayerEvent interface requires [key: string]: unknown index signature to allow extraData spread properties"
  - "ProfileData interface uses Pagination type from @/types/pagination.d.ts for pagination shape consistency"
  - "AnalyticsItem exported from ad.store.ts so anunciar/index.vue can import it without duplicating the type"

patterns-established:
  - "Inline interface pattern: define ProfileData / AdWithPriceData locally in page file for useAsyncData return shapes"
  - "String() cast for route.params.slug where string | string[] must become string"
  - "Omit<Ad, fields> + re-declare pattern when API response shape differs from store/form type"

requirements-completed: [TS-01, TS-02, TS-03]

# Metrics
duration: ~90min
completed: 2026-03-07
---

# Phase 27 Plan 01: TypeScript Migration Summary

**All 18 website pages migrated to `<script setup lang="ts">` and all `any` types eliminated from 3 stores and 3 composables, unblocking Phase 28 typecheck enablement**

## Performance

- **Duration:** ~90 min
- **Started:** 2026-03-06
- **Completed:** 2026-03-07
- **Tasks:** 3
- **Files modified:** 24

## Accomplishments

- 18 pages migrated to `lang="ts"` — zero `<script setup>` without lang in the codebase
- 8 `any` usages removed from stores (ad.store, me.store, user.store) — replaced with proper interfaces and typed refs
- 3 `as any` casts removed from composables — `DataLayerEvent` interface defined, `Pack` type used directly
- `AnalyticsItem` exported from `ad.store.ts` enabling page-level imports
- `me.store.ts` typed with `ref<User | null>(null)` — was untyped `ref(null)` before

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate 12 simple pages to lang=ts** - `fae6911` (feat)
2. **Task 2: Eliminate any in stores and composables** - `a474642` (feat)
3. **Task 3: Migrate 6 complex/medium pages to lang=ts** - `8282fa9` (feat)

**Plan metadata:** _(docs commit — see below)_

## Files Created/Modified

- `apps/website/app/pages/[slug].vue` - Added ProfileData interface, typed useAsyncData<ProfileData | null>, String() cast for username
- `apps/website/app/pages/anunciar/index.vue` - Added lang=ts, imported AnalyticsItem, typed analyticsItems array
- `apps/website/app/pages/anunciar/resumen.vue` - Added lang=ts, refactored prepareSummary to zero-param using adStore directly
- `apps/website/app/pages/anunciar/gracias.vue` - Added lang=ts, typed handleError with union literal types
- `apps/website/app/pages/anuncios/[slug].vue` - Added lang=ts, defined AdWithPriceData and PriceData interfaces, typed useAsyncData
- `apps/website/app/pages/packs/gracias.vue` - Added lang=ts, typed handleError and formatPrice params
- `apps/website/app/pages/anunciar/error.vue` (and 11 more simple pages) - Added lang=ts only
- `apps/website/app/stores/ad.store.ts` - Exported AnalyticsItem, replaced any[] with AnalyticsItem[]
- `apps/website/app/stores/me.store.ts` - Added User import, ref<User | null>(null), typed saveUsername param
- `apps/website/app/stores/user.store.ts` - Typed loadUser(slug: string) and updateUserProfile userData param
- `apps/website/app/composables/useAdAnalytics.ts` - Defined DataLayerEvent interface with index signature, replaced any
- `apps/website/app/composables/useAdPaymentSummary.ts` - Removed `as any` cast, used selectedPack.value directly
- `apps/website/app/composables/usePackPaymentSummary.ts` - Removed `as any` cast, used selectedPack.value directly

## Decisions Made

- **AdWithPriceData** extends `Omit<Ad, 'commune'|'category'|'condition'>` because the API response returns these as objects (`{ id, name }`) but `Ad` type defines them as `number | null` (form data types). Creating a separate page-level type avoids modifying the shared `Ad` interface.
- **DataLayerEvent** required a `[key: string]: unknown` index signature because `pushEvent` spreads `extraData` (with fields like `step_number`, `description`) into the event object, which TypeScript won't allow without an index signature.
- **prepareSummary() zero-param refactor** avoids the need to type a Pinia store parameter (complex, would require typed ReturnType). `adStore` was already in scope, so removing the parameter is the cleanest approach.
- **AnalyticsItem exported** from `ad.store.ts` rather than duplicated in `@/types/ad.d.ts` — keeps the type co-located with the store logic that uses it, and it's now importable from the store module.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] AnalyticsItem needed export keyword to be importable**
- **Found during:** Task 3 (anunciar/index.vue migration)
- **Issue:** Plan said "check whether AnalyticsItem is exported from ad.store.ts — if not, add export". It was not exported.
- **Fix:** Added `export` keyword to the `interface AnalyticsItem` declaration in `ad.store.ts`
- **Files modified:** apps/website/app/stores/ad.store.ts
- **Committed in:** a474642 (Task 2 commit)

**2. [Rule 1 - Bug] me.store.ts: Strapi SDK response needed as unknown as User cast**
- **Found during:** Task 2 (me.store.ts any elimination)
- **Issue:** `ref<User | null>(null)` exposed that `strapi.findOne()` returns `Strapi5ResponseSingle<User>`, not `User` directly
- **Fix:** Added `as unknown as User` cast (established pattern from prior phases)
- **Files modified:** apps/website/app/stores/me.store.ts
- **Committed in:** a474642 (Task 2 commit)

**3. [Rule 1 - Bug] me.store.ts: dynamic field indexing on User type**
- **Found during:** Task 2 (me.store.ts any elimination)
- **Issue:** `me.value[field]` fails TypeScript since `User` doesn't have an index signature
- **Fix:** Cast as `(me.value as Record<string, unknown>)[field]`
- **Files modified:** apps/website/app/stores/me.store.ts
- **Committed in:** a474642 (Task 2 commit)

**4. [Rule 1 - Bug] DataLayerEvent needed index signature for extraData spread**
- **Found during:** Task 2 (useAdAnalytics.ts migration)
- **Issue:** `{ ...extraData }` spread fails TypeScript if extraData has properties not in DataLayerEvent
- **Fix:** Added `[key: string]: unknown` index signature to DataLayerEvent interface
- **Files modified:** apps/website/app/composables/useAdAnalytics.ts
- **Committed in:** a474642 (Task 2 commit)

**5. [Rule 1 - Bug] anuncios/[slug].vue: Ad type commune field is number, API returns object**
- **Found during:** Task 3 (anuncios/[slug].vue migration)
- **Issue:** `Ad.commune` is `number | null` (form data type), but runtime response is `{ id, name, region }`. TypeScript errors on property access.
- **Fix:** Defined `AdWithPriceData extends Omit<Ad, 'commune'|'category'|'condition'>` with proper object shapes for API responses
- **Files modified:** apps/website/app/pages/anuncios/[slug].vue
- **Committed in:** 8282fa9 (Task 3 commit)

---

**Total deviations:** 5 auto-fixed (all Rule 1 - type correctness bugs discovered during migration)
**Impact on plan:** All fixes necessary for TypeScript correctness. No scope creep — each fix directly caused by adding `lang="ts"` to the target file.

## Issues Encountered

- `window.dataLayer` type errors in `useAdAnalytics.ts` are pre-existing (not introduced by this phase) — left as-is, out of scope per plan. Should be addressed in Phase 28 or a dedicated window augmentation task.
- `nuxt typecheck` not run as part of this phase per plan specification — should be run manually before enabling `typeCheck: true` in Phase 28.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 28 (Typecheck Enablement) can proceed: all pages have `lang="ts"`, stores and composables are `any`-free
- Recommended: run `nuxt typecheck` manually from `apps/website/` before starting Phase 28 to surface any remaining type errors in components
- Known pre-existing issues to address in Phase 28: Strapi SDK filter type mismatches in `ads.store.ts`, `packs.store.ts`, `categories.store.ts` (out of scope for this phase)

---
*Phase: 27-typescript-migration*
*Completed: 2026-03-07*

---
phase: 25-critical-correctness-bugs
plan: "01"
subsystem: ui
tags: [nuxt, vue, useAsyncData, typescript, strapi, plugins]

# Dependency graph
requires:
  - phase: 18-page-double-fetch-fixes
    provides: "mis-anuncios.vue useAsyncData pattern and /ads/me/counts endpoint baseline"
provides:
  - "$setStructuredData plugin with TypeScript type augmentation (NuxtApp interface)"
  - "Unique useAsyncData keys for all 3 colliding pages"
  - "Production console filter — only log/debug suppressed"
  - "Strapi /ads/me/counts and /ads/me routes correctly ordered before wildcard :id"
affects: [26-data-fetching-cleanup, 27-typescript-migration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useAsyncData key naming: page-scoped '<page>-<data>', dynamic routes include param (ad-${slug})"
    - "Nuxt plugin type augmentation via declare module '#app' { interface NuxtApp }"
    - "Strapi custom routes: specific paths (e.g. /ads/me) must be registered BEFORE wildcard (:id) routes"

key-files:
  created: []
  modified:
    - apps/website/app/plugins/microdata.ts
    - apps/website/app/plugins/console.client.ts
    - apps/website/app/pages/index.vue
    - apps/website/app/pages/packs/index.vue
    - apps/website/app/pages/anuncios/[slug].vue
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts

key-decisions:
  - "BUG-04/05 root cause was in Strapi backend — /ads/me/counts and /ads/me were shadowed by the wildcard /ads/:id route because they were registered after it. Fix: moved them to top of 00-ad-custom.ts. Frontend files (mis-anuncios.vue, mis-ordenes.vue) were temporarily patched with await+key then restored to original state once the backend fix was confirmed."
  - "console.client.ts: only log/debug suppressed in production — warn, error, info intentionally kept active for operational visibility"
  - "useAsyncData key collision fix: 'packs' key was shared between index.vue and packs/index.vue; fixed to 'home-packs' and 'packs-page-packs' respectively; [slug].vue changed from static 'adData' to dynamic ad-${route.params.slug}"

patterns-established:
  - "Nuxt plugin type augmentation pattern: declare module '#app' { interface NuxtApp { $pluginName: type } } at end of plugin file — see microdata.ts and seo.ts"
  - "useAsyncData keys must be unique across ALL pages — format: '<page>-<data>' for static, '<page>-${param}' for dynamic routes"
  - "Strapi route ordering: always register specific paths before wildcard params in the same route file"

requirements-completed: [BUG-01, BUG-02, BUG-03, BUG-04, BUG-05]

# Metrics
duration: N/A (human-executed, verified externally)
completed: 2026-03-06
---

# Phase 25 Plan 01: Critical Correctness Bugs Summary

**Fixed 5 silent correctness bugs: Strapi route shadowing causing 404s on /ads/me endpoints, useAsyncData key collisions across 3 pages, missing TypeScript augmentation on $setStructuredData plugin, and over-aggressive console suppression in production.**

## Performance

- **Duration:** N/A (human-executed with external verification)
- **Started:** 2026-03-06
- **Completed:** 2026-03-06
- **Tasks:** 5 tasks (4 auto + 1 human-verify checkpoint)
- **Files modified:** 6

## Accomplishments

- Strapi `/ads/me/counts` and `/ads/me` routes no longer shadowed by wildcard `/ads/:id` — both endpoints now respond correctly in production
- `useAsyncData` keys are now globally unique: `"home-packs"`, `"packs-page-packs"`, and `` `ad-${route.params.slug}` `` replace conflicting `"packs"` / `"adData"` keys
- `$setStructuredData` plugin has a proper `declare module "#app"` type augmentation — pages can call it without fragile `as unknown as` casts
- Production console filter now only suppresses `console.log` and `console.debug` — `console.warn`, `console.error`, and `console.info` are restored for operational visibility
- All code comments in touched files translated to English

## Task Commits

Each task was committed atomically:

1. **Task 1: BUG-01 — Add type declaration to microdata.ts plugin** - `ff6dea4` (fix)
2. **Task 2: BUG-03 — Fix console.client.ts to only suppress log/debug** - `fd3cc2c` (fix)
3. **Task 3: BUG-02 — Fix useAsyncData key collisions (3 files)** - `614b589` (fix)
4. **Task 4: BUG-04+BUG-05 — Frontend patch (await + key)** - `1ff2366` (fix)
5. **Task 4 (root cause): BUG-04 — Move /ads/me routes above wildcard in Strapi** - `eab7e93` (fix)
6. **Style: Translate all code comments to English** - `ba8bc09` (style)

## Files Created/Modified

- `apps/website/app/plugins/microdata.ts` — Added `declare module "#app"` type augmentation for `$setStructuredData`
- `apps/website/app/plugins/console.client.ts` — Rewrote to only suppress `log`/`debug`; `warn`/`error`/`info` restored
- `apps/website/app/pages/index.vue` — Changed useAsyncData key `"packs"` → `"home-packs"`
- `apps/website/app/pages/packs/index.vue` — Changed useAsyncData key `"packs"` → `"packs-page-packs"`
- `apps/website/app/pages/anuncios/[slug].vue` — Changed useAsyncData key `"adData"` → `` `ad-${route.params.slug}` ``
- `apps/strapi/src/api/ad/routes/00-ad-custom.ts` — Moved `/ads/me/counts` and `/ads/me` routes to top of array, before wildcard `:id` routes

## Decisions Made

**BUG-04/05 root cause was Strapi route ordering, not missing frontend await/key:**
- The frontend pages (`mis-anuncios.vue`, `mis-ordenes.vue`) were initially patched with `await useAsyncData("mis-anuncios", ...)` and `await useAsyncData("mis-ordenes", ...)` per plan Task 4.
- During verification, the actual root cause was discovered: in `00-ad-custom.ts`, the specific routes `/ads/me/counts` and `/ads/me` were registered *after* the wildcard `/ads/:id` route (from Strapi's default `ad.ts`). Strapi matches routes in registration order, so `:id` was capturing `me` and `counts` as ad slugs, returning 404s.
- Fix: moved the two `me` routes to the top of the custom routes array in `00-ad-custom.ts`.
- Frontend files were **restored to original state** (no await, no key) since the backend was the actual bug source. The `mis-anuncios.vue` and `mis-ordenes.vue` pages remain as-is — Phase 26 will handle them properly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] BUG-04/05 root cause was Strapi route shadowing, not frontend await/key**
- **Found during:** Task 4 verification (BUG-04 + BUG-05)
- **Issue:** The plan assumed mis-anuncios and mis-ordenes needed `await` + key to fix SSR hydration. During verification, the actual failure was that `/ads/me/counts` and `/ads/me` returned 404 because Strapi's wildcard `/ads/:id` route was registered before these specific routes in the route array.
- **Fix:** Moved `/ads/me/counts` and `/ads/me` to the top of `00-ad-custom.ts` routes array. Frontend files were temporarily patched (Task 4 commit `1ff2366`) then restored to original state after confirming the backend fix resolved the issue.
- **Files modified:** `apps/strapi/src/api/ad/routes/00-ad-custom.ts`
- **Verification:** Human verified `/cuenta/mis-anuncios` and `/cuenta/mis-ordenes` render correctly with SSR after backend fix
- **Committed in:** `eab7e93` (separate fix commit after root cause discovery)

---

**Total deviations:** 1 (Rule 1 - Bug — actual root cause was different from plan's assumption)
**Impact on plan:** Backend-only fix. Frontend files `mis-anuncios.vue` and `mis-ordenes.vue` restored to original state. Phase 26 will address their data-fetching patterns as planned.

## Issues Encountered

- The plan assumed BUG-04/05 were purely frontend issues (missing `await` + key). The actual failure was a Strapi route registration ordering bug — `/ads/me/counts` and `/ads/me` were shadowed by the wildcard `/ads/:id` route because specific routes must be registered before wildcard routes in the same file. Once the Strapi fix was confirmed, the frontend files were restored to their original state.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 25 complete: all 5 correctness bugs fixed and human-verified
- Phase 26 (Data Fetching Cleanup) can proceed immediately — clean baseline established
- `mis-anuncios.vue` and `mis-ordenes.vue` are in their original state (no await/key) — Phase 26 will handle the `onMounted` fetch audit and potential `useAsyncData` migration for all creation-flow components
- The `useAsyncData` key naming pattern is now established: future pages must use `'<page>-<data>'` format
- Strapi route ordering pattern documented: specific paths must always precede wildcard params in route files

---
*Phase: 25-critical-correctness-bugs*
*Completed: 2026-03-06*

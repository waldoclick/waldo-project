---
phase: 093-ad-preview-error-handling
plan: "02"
subsystem: ui
tags: [nuxt4, vue3, createError, useAsyncData, ssr, error-handling]

# Dependency graph
requires:
  - phase: 093-ad-preview-error-handling
    provides: findBySlug wrapped in try/catch so Strapi returns clean HTTP 500 instead of crashing (093-01)
provides:
  - "[slug].vue throws createError({ statusCode: 404, fatal: true }) inside useAsyncData when no ad is found"
  - "[slug].vue throws createError({ statusCode: 500, fatal: true }) inside useAsyncData on unexpected processing errors"
  - "watchEffect + showError pattern fully removed from [slug].vue"
  - "default: () => null added to useAsyncData options — adData.value is null (not undefined)"
affects:
  - apps/website/app/pages/anuncios/[slug].vue
  - apps/website/app/error.vue (consumer — renders the 404/500 Nuxt error page)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "createError({ statusCode, message, fatal: true }) thrown inside useAsyncData callback for SSR-safe page-level errors"
    - "default: () => null in useAsyncData options to constrain return type to T | null (not T | null | undefined)"

key-files:
  created: []
  modified:
    - apps/website/app/pages/anuncios/[slug].vue

key-decisions:
  - "Throw createError inside useAsyncData (not watchEffect/showError) — only pattern that honours Nuxt's SSR error boundary and avoids 500s on client-server lifecycle race"
  - "fatal: true is mandatory for page-level errors — without it, client-side navigation silently absorbs the error"
  - "createError is auto-imported in Nuxt 4 from #app — no explicit import added"

patterns-established:
  - "SSR-safe 404/500: throw createError({ statusCode, fatal: true }) inside useAsyncData callback — never watchEffect + showError"
  - "Always add default: () => null to useAsyncData when fetch may return null — eliminates T | undefined from inferred type"

requirements-completed:
  - PREV-01
  - PREV-02
  - PREV-03
  - PREV-04

# Metrics
duration: 15min
completed: 2026-03-18
---

# Phase 93 Plan 02: [slug].vue createError Refactor Summary

**Replaced watchEffect/showError race condition with createError({ fatal: true }) thrown inside useAsyncData — non-existent ad slugs now return HTTP 404 via Nuxt's SSR error boundary instead of 500**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-18T18:00:00Z
- **Completed:** 2026-03-18T18:12:59Z
- **Tasks:** 2 (+ human smoke-test checkpoint)
- **Files modified:** 1

## Accomplishments

- Replaced the `watchEffect(() => showError(...))` pattern (which races the SSR renderer and produces 500s) with `throw createError({ statusCode: 404, fatal: true })` inside the `useAsyncData` callback
- Added `throw createError({ statusCode: 500, fatal: true })` for the unexpected-error path (catch block)
- Added `default: () => null` to `useAsyncData` options — `adData.value` is now `AdPageData | null` (not `AdPageData | null | undefined`)
- Removed dead code: `getErrorMessage()` function, `watchEffect` block, unused `pending` and `adError` destructured refs
- Human smoke test verified: non-existent slug returns HTTP 404 + correct error.vue; real ad page loads cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1+2: Replace watchEffect/showError with createError + TypeScript validation** - `4f0be1e` (fix)

**Plan metadata:** _(this commit — docs)_

## Files Created/Modified

- `apps/website/app/pages/anuncios/[slug].vue` — Removed watchEffect/showError/getErrorMessage/pending/adError; added createError(404) and createError(500) inside useAsyncData; added `default: () => null`

## Decisions Made

- `createError` is auto-imported in Nuxt 4 from `#app` — no import statement added
- `fatal: true` on both error paths — mandatory for page-level errors; without it client-side navigation silently absorbs the error
- `default: () => null` (not `default: () => ({})`) — `null` is the canonical "no data" sentinel; keeps downstream null checks clean

## Deviations from Plan

None — plan executed exactly as written. All 6 changes (destructuring cleanup, PATH 1 createError, PATH 2 createError, default option, delete getErrorMessage, delete watchEffect) applied in order.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 093 complete. All 5 requirements (STRP-01, PREV-01 through PREV-04) are done.
- Website ad detail page now handles missing slugs with correct HTTP 404 + Nuxt error.vue rendering.
- No blockers for next milestone.

---
*Phase: 093-ad-preview-error-handling*
*Completed: 2026-03-18*

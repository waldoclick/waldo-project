---
phase: quick
plan: 1
subsystem: website/pages
tags: [bugfix, free-ad-flow, typescript, redirect]
dependency_graph:
  requires: []
  provides: [anunciar/gracias page, correct free-ad redirect]
  affects: [pagar/gracias.vue, anunciar/resumen.vue]
tech_stack:
  added: []
  patterns: [useAsyncData with default, watchEffect error handling, definePageMeta auth middleware]
key_files:
  created:
    - apps/website/app/pages/anunciar/gracias.vue
  modified:
    - apps/website/app/pages/pagar/gracias.vue
    - apps/website/app/pages/anunciar/resumen.vue
decisions:
  - "Use watchEffect for error handling instead of inline throws to stay consistent with pagar/gracias.vue pattern"
  - "Pass hasToPay: false in prepareAdSummary to explicitly suppress payment-related display in ResumeDefault"
metrics:
  duration: "2m"
  completed_date: "2026-03-11"
  tasks_completed: 2
  files_changed: 3
---

# Quick Task 1: Fix Free Ad Redirect to /anunciar/gracias — Summary

**One-liner:** Corrected free-ad post-creation UX by adding `/anunciar/gracias` page and fixing redirect in `resumen.vue`, while eliminating TypeScript errors in `pagar/gracias.vue` from dead `adData`/`prepareAdSummary` code.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix pagar/gracias.vue TypeScript errors | a773969 | apps/website/app/pages/pagar/gracias.vue |
| 2 | Fix free ad redirect in resumen.vue and create anunciar/gracias.vue | 9ee4670 | apps/website/app/pages/anunciar/resumen.vue, apps/website/app/pages/anunciar/gracias.vue |

## What Was Done

### Task 1 — pagar/gracias.vue cleanup
- Removed duplicate `v-if="orderData && orderData.documentId"` from `ResumeOrder` component (kept only `v-if="orderData"`)
- Removed the entire `<ResumeDefault>` block that referenced non-existent `adData` variable and `prepareAdSummary` function
- This was dead code since free ads now have their own dedicated page

### Task 2 — Free ad redirect + new page
**resumen.vue:**
- Updated `freeAdResponse` type to include `documentId?: string` on the ad object
- Captured `documentId` from API response (`freeAdResponse.data.ad.documentId`) before redirect
- Changed `router.push` from `/pagar/gracias?order=...` to `/anunciar/gracias?ad=<documentId>`

**anunciar/gracias.vue (new file):**
- Created new page with `definePageMeta({ middleware: "auth" })` and `useSeoMeta({ robots: "noindex, nofollow" })`
- Uses `useAsyncData` with key `anunciar-gracias-${route.query.ad}`, `server: true`, `lazy: false`, `default: () => null`
- Fetches ad by `documentId` from `route.query.ad` using `useStrapi().findOne("ads", ...)`
- Handles missing/invalid `ad` query param and not-found errors via `watchEffect` + `showError`
- Renders `ResumeDefault` with `hidePaymentSection: true` and `prepareAdSummary()` helper that maps ad fields

## Decisions Made

- **watchEffect error handling:** Stayed consistent with the `pagar/gracias.vue` pattern — errors trigger `showError()` via `watchEffect` rather than throwing inside `useAsyncData`
- **`hasToPay: false` in prepareAdSummary:** Explicitly sets `hasToPay: false` so `ResumeDefault` doesn't render any payment total section for free ads

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `yarn nuxi typecheck` — **0 errors** across all three modified/created files
- `pagar/gracias.vue` — no duplicate `v-if`, no `adData`, no `prepareAdSummary`
- `anunciar/resumen.vue` — redirects to `/anunciar/gracias?ad=...`
- `anunciar/gracias.vue` — exists, imports `ResumeDefault`, fetches by `documentId`

## Self-Check: PASSED

Files exist:
- ✅ `apps/website/app/pages/anunciar/gracias.vue`
- ✅ `apps/website/app/pages/anunciar/resumen.vue` (modified)
- ✅ `apps/website/app/pages/pagar/gracias.vue` (modified)

Commits exist:
- ✅ a773969 — fix(quick-1): remove duplicate v-if and dead adData/prepareAdSummary block from pagar/gracias.vue
- ✅ 9ee4670 — feat(quick-1): fix free ad redirect and create anunciar/gracias.vue

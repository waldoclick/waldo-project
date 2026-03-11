---
phase: 059-frontend-wiring-deploy
plan: 01
subsystem: payments
tags: [nuxt, strapi, free-ad, save-draft, pinia]

# Dependency graph
requires:
  - phase: 058-free-ad-endpoint
    provides: "POST /api/ads/save-draft and POST /api/payments/free-ad endpoints"
provides:
  - "handleFreeCreation() in resumen.vue calls save-draft then free-ad in sequence"
  - "adStore.ad_id is populated from save-draft response before free-ad call"
  - "Free ad creation flow fully wired to dedicated Phase 58 endpoints"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-step free creation: save-draft → free-ad (sequential Strapi calls)"
    - "adStore.updateAdId() called between the two steps to persist ad_id"

key-files:
  created: []
  modified:
    - apps/website/app/pages/anunciar/resumen.vue

key-decisions:
  - "Redirect fallback: freeAdResponse.data.ad?.id ?? adId ensures navigation even if free-ad response omits ad object"
  - "Error messages updated to match new endpoint strings: 'No free reservation available', 'No paid reservation available'"

patterns-established:
  - "Free ad flow pattern: POST ads/save-draft → adStore.updateAdId(id) → POST payments/free-ad with { ad_id, pack }"

requirements-completed: [FREE-05]

# Metrics
duration: 1min
completed: 2026-03-09
---

# Phase 059 Plan 01: Frontend Wiring + Deploy Summary

**`handleFreeCreation()` rewritten to call `POST /api/ads/save-draft` then `POST /api/payments/free-ad` with `{ ad_id, pack }`, storing the draft ID in adStore between steps**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-09T01:17:56Z
- **Completed:** 2026-03-09T01:19:00Z
- **Tasks:** 1/1
- **Files modified:** 1

## Accomplishments
- Replaced the monolithic `payments/ad` call with a two-step flow: `ads/save-draft` to create/update the draft, then `payments/free-ad` to process the free reservation
- `adStore.updateAdId(adId)` is called between the two steps, ensuring the store reflects the new ad ID before the payment step
- Error messages updated to match the new endpoint's error strings from Phase 58
- `nuxt typecheck` exits 0 — zero type errors introduced

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite handleFreeCreation() in resumen.vue** - `4884517` (feat)

**Plan metadata:** _(see final commit below)_

## Files Created/Modified
- `apps/website/app/pages/anunciar/resumen.vue` - `handleFreeCreation()` rewritten with two-step free creation flow

## Decisions Made
- Used `freeAdResponse.data.ad?.id ?? adId` for the redirect — falls back to the draft's `adId` if `free-ad` response doesn't include an `ad` object, making the redirect resilient
- Error message copy updated to reflect Phase 58's distinct error strings (`"No free reservation available"`, `"No paid reservation available"`)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

**Manual permission step required after deployment:**

Grant `payment.freeAdCreate` permission to the **Authenticated** role in Strapi admin panel:

1. Go to Settings → Users & Permissions plugin → Roles → Authenticated
2. Under **Payment**, enable `freeAdCreate`
3. Save

Without this step the endpoint returns 403 for all authenticated users.

## Next Phase Readiness
- Phase 059 Plan 01 complete — free ad flow is fully wired end-to-end
- No blockers. The only remaining step is the manual permission grant in Strapi admin (documented above)
- Phase 059 is now complete

---
*Phase: 059-frontend-wiring-deploy*
*Completed: 2026-03-09*

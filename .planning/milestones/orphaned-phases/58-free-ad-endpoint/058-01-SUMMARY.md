---
phase: 058-free-ad-endpoint
plan: 01
subsystem: api
tags: [strapi, payment, free-ad, route, controller, service]

# Dependency graph
requires:
  - phase: 057-payment-hub-adaptation
    provides: PaymentUtils (adReservation.getAdReservationAvailable, ad.publishAd, ad.updateAdReservation, ad.getAdById)
provides:
  - POST /api/payments/free-ad endpoint
  - FreeAdService.processFreeAd(adId, userId) — validates credit, links reservation, publishes, sends emails
affects:
  - 059-frontend-wiring

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New service file per feature — free-ad.service.ts is standalone, no import from ad.service.ts"
    - "controllerWrapper pattern extended with freeAdCreate method"

key-files:
  created:
    - apps/strapi/src/api/payment/services/free-ad.service.ts
  modified:
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/routes/payment.ts

key-decisions:
  - "Email failures are non-fatal — wrapped in try/catch so email errors do not fail the free-ad submission"
  - "free-ad.service.ts has zero imports from ad.service.ts — fully decoupled service"
  - "updateAdDates not called — free ads do not carry total_days from reservation (plan spec)"

patterns-established:
  - "Free ad flow: getAdById → getAdReservationAvailable → updateAdReservation → publishAd → emails"

requirements-completed: [FREE-01, FREE-02, FREE-03, FREE-04, FREE-06]

# Metrics
duration: 2min
completed: 2026-03-09
---

# Phase 58 Plan 01: Free Ad Endpoint Summary

**New `POST /api/payments/free-ad` Strapi endpoint with `FreeAdService` that validates free credit, links reservation, publishes the ad, and sends confirmation emails — zero changes to `ad.service.ts`**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T00:53:24Z
- **Completed:** 2026-03-09T00:55:29Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- `free-ad.service.ts` implements the full free-ad lifecycle: credit validation → reservation linking → publish → email notifications
- `POST /api/payments/free-ad` route registered in `routes/payment.ts`
- `freeAdCreate` controller method added to `PaymentController`, delegating to `FreeAdService`
- TypeScript compiles with zero errors; `ad.service.ts` is byte-for-byte unchanged (FREE-06 verified)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create free-ad.service.ts** - `dcb052c` (feat)
2. **Task 2: Register route and controller method** - `71d4049` (feat)

**Plan metadata:** _(docs commit below)_

## Files Created/Modified
- `apps/strapi/src/api/payment/services/free-ad.service.ts` — New service implementing `processFreeAd(adId, userId)`
- `apps/strapi/src/api/payment/controllers/payment.ts` — Added `freeAdCreate` method and `freeAdService` import
- `apps/strapi/src/api/payment/routes/payment.ts` — Added `POST /payments/free-ad` route entry

## Decisions Made
- Email failures are non-fatal: wrapped in try/catch — email delivery issues do not block the user's ad from being published
- `updateAdDates` is intentionally NOT called — free ads do not carry `total_days` from the reservation (as specified)
- `FreeAdService` has zero imports from `ad.service.ts` — fully independent, ensuring zero risk to the existing paid flow

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
**Important deploy step:** The new `POST /api/payments/free-ad` endpoint requires manual permission setup in the Strapi admin panel after deployment. Grant the `payment.freeAdCreate` permission to the authenticated role (as documented in STATE.md v1.21 decision: "New Strapi endpoints require manual permission setup in admin panel").

## Next Phase Readiness
- `POST /api/payments/free-ad` is ready for Phase 59 to wire `resumen.vue` → `save-draft` + `free-ad` sequential calls
- The `processFreeAd` service is fully operational and tested via TypeScript compilation
- Only blocker before go-live: admin panel permission grant (deploy step)

---
*Phase: 058-free-ad-endpoint*
*Completed: 2026-03-09*

## Self-Check: PASSED

- ✅ `apps/strapi/src/api/payment/services/free-ad.service.ts` — exists on disk
- ✅ `apps/strapi/src/api/payment/controllers/payment.ts` — exists on disk
- ✅ `apps/strapi/src/api/payment/routes/payment.ts` — exists on disk
- ✅ `.planning/phases/058-free-ad-endpoint/058-01-SUMMARY.md` — exists on disk
- ✅ `dcb052c` (Task 1 commit) — found in git log
- ✅ `71d4049` (Task 2 commit) — found in git log
- ✅ `npx tsc --noEmit` — exit 0 (zero errors)
- ✅ `git diff ad.service.ts` — no output (unchanged)

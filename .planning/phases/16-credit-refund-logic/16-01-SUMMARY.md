---
phase: 16-credit-refund-logic
plan: 01
subsystem: api
tags: [strapi, ad-reservation, ad-featured-reservation, entityService, refund]

# Dependency graph
requires:
  - phase: 15-ad-expiry-cron
    provides: "reservation-freeing pattern in user.cron.ts (ad: null via entityService.update)"
provides:
  - "rejectAd() frees ad_reservation and ad_featured_reservation before sending email"
  - "bannedAd() frees ad_reservation and ad_featured_reservation before sending email"
  - "Reservations are immediately reusable after reject/ban"
affects:
  - 17-refund-email-templates

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "entityService.update(uid, id, { data: { ad: null } }) to free reservation credits"
    - "Optional chaining (?.id) guard before entityService calls for null-safe reservation freeing"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/ad/services/ad.ts

key-decisions:
  - "Update reservation side (FK lives on reservation), not the ad side — consistent with user.cron.ts pattern"
  - "No separate try/catch around freeing calls — if freeing fails, whole reject/ban should fail"
  - "Freeing block placed between ad.update call and email try block so Phase 17 can reference freed state"

patterns-established:
  - "Reservation freeing pattern: if (ad.ad_reservation?.id) { await strapi.entityService.update(..., { data: { ad: null } }) }"

requirements-completed:
  - REFUND-01
  - REFUND-02
  - REFUND-03
  - REFUND-04

# Metrics
duration: 2min
completed: 2026-03-06
---

# Phase 16 Plan 01: Credit Refund Logic Summary

**`rejectAd()` and `bannedAd()` now free linked `ad_reservation` and `ad_featured_reservation` via `entityService.update(ad: null)` before sending emails, making reservations immediately reusable**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T20:28:31Z
- **Completed:** 2026-03-06T20:30:43Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- `rejectAd()` populate expanded to include `ad_reservation` and `ad_featured_reservation`
- `rejectAd()` frees both reservation types (with optional chaining null guards) before the email try block
- `bannedAd()` populate expanded to include `ad_reservation` and `ad_featured_reservation`
- `bannedAd()` frees both reservation types (with optional chaining null guards) before the email try block
- TypeScript compiles cleanly — no new errors introduced

## Task Commits

Each task was committed atomically:

1. **Task 1: Free reservations in rejectAd()** - `b97872b` (feat)
2. **Task 2: Free reservations in bannedAd()** - `18c3641` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `apps/strapi/src/api/ad/services/ad.ts` — Added populate fields and reservation-freeing blocks to `rejectAd()` and `bannedAd()`

## Decisions Made
- Updated reservation side (FK lives on reservation entity), not the ad side — identical to the pattern established in `user.cron.ts` lines 71–77
- No `try/catch` wrapping around freeing calls — if freeing fails the whole reject/ban should fail (caller handles the outer error)
- Freeing block positioned between `ad.update` call and the email `try` block so Phase 17 can reference the freed state in email templates

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Credit refund logic complete for both `rejectAd()` and `bannedAd()`
- Phase 17 (email templates) can now reference `adReservationReturned` and `featuredReservationReturned` booleans — reservations are freed before `sendMjmlEmail()` is called
- No blockers

---
*Phase: 16-credit-refund-logic*
*Completed: 2026-03-06*

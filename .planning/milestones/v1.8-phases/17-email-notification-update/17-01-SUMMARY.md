---
phase: 17-email-notification-update
plan: 01
subsystem: api
tags: [mjml, nunjucks, email, strapi, typescript]

# Dependency graph
requires:
  - phase: 16-credit-refund-logic
    provides: reservation-freeing logic in rejectAd() and bannedAd() that this email messaging confirms
provides:
  - Conditional credit-return messaging in ad-rejected and ad-banned email templates
  - adReservationReturned and featuredReservationReturned boolean flags passed from ad.ts to sendMjmlEmail()
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Nunjucks {% if %} conditional blocks in MJML templates for optional email content"
    - "!!ad.ad_reservation?.id pattern to derive 'was credit returned?' boolean from pre-freed ad object"

key-files:
  created: []
  modified:
    - apps/strapi/src/services/mjml/templates/ad-rejected.mjml
    - apps/strapi/src/services/mjml/templates/ad-banned.mjml
    - apps/strapi/src/api/ad/services/ad.ts

key-decisions:
  - "Use !!ad.ad_reservation?.id evaluated before freeing (ad fetched before freeing) — correctly reflects whether a credit was returned"
  - "Same Spanish wording used in both rejected and banned templates for consistency"
  - "Conditional guards placed after reason block and before policies paragraph — natural reading flow"

patterns-established:
  - "Pattern: Conditional Nunjucks blocks in MJML templates guard optional email content — variables absent/false produce no output"

requirements-completed: [EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04]

# Metrics
duration: 2min
completed: 2026-03-06
---

# Phase 17 Plan 01: Email Notification Update Summary

**Conditional credit-return messaging added to ad-rejected.mjml and ad-banned.mjml using Nunjucks {% if %} blocks, with adReservationReturned and featuredReservationReturned boolean flags passed from rejectAd() and bannedAd() in ad.ts**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T20:40:18Z
- **Completed:** 2026-03-06T20:41:50Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- ad-rejected.mjml and ad-banned.mjml updated with conditional Nunjucks blocks for both credit types
- rejectAd() and bannedAd() in ad.ts now pass adReservationReturned and featuredReservationReturned booleans to sendMjmlEmail()
- Ads without reservations produce no credit messaging (conditional guards ensure this — EMAIL requirement 5)
- All four EMAIL requirements (EMAIL-01..04) satisfied: reservation and featured credit messages in both reject and ban flows

## Task Commits

Each task was committed atomically:

1. **Task 1: Update ad-rejected.mjml and ad-banned.mjml with conditional credit-return blocks** - `c494a67` (feat)
2. **Task 2: Pass adReservationReturned and featuredReservationReturned flags from ad.ts to sendMjmlEmail()** - `cd98509` (feat)

**Plan metadata:** `be20f2e` (docs: complete plan)

## Files Created/Modified
- `apps/strapi/src/services/mjml/templates/ad-rejected.mjml` - Added {% if adReservationReturned %} and {% if featuredReservationReturned %} blocks with Spanish credit-return messages
- `apps/strapi/src/services/mjml/templates/ad-banned.mjml` - Same conditional blocks as rejected template
- `apps/strapi/src/api/ad/services/ad.ts` - Both rejectAd() and bannedAd() now pass the two boolean flags to sendMjmlEmail()

## Decisions Made
- Used `!!ad.ad_reservation?.id` evaluated on the ad object fetched before the freeing calls — since `ad` was fetched before reservation freeing, the id is still present if a reservation existed, making this the correct semantic for "was a credit returned?"
- Identical Spanish wording used in both templates: "ha sido devuelto y ya está disponible para ser utilizado nuevamente" — plan confirmed same phrasing is fine for consistency
- Blocks placed after `{% if reason %}` and before the "Puedes revisar las políticas" paragraph — follows natural reading flow

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — the formatter (lint-staged) merged `{% endif %}` and `{% if %}` onto the same line during the Task 2 commit, but this is cosmetic formatting only and does not affect Nunjucks template rendering.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 17 complete — all EMAIL requirements (EMAIL-01..04) satisfied
- v1.5 Ad Credit Refund milestone is now complete: both Phase 16 (credit refund logic) and Phase 17 (email notification update) are done
- No blockers or concerns

---
*Phase: 17-email-notification-update*
*Completed: 2026-03-06*

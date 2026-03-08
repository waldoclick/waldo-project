---
phase: 45-payment-event-wiring
plan: 02
subsystem: payments
tags: [zoho, crm, transbank, tdd, floating-promise, ad-payment]

# Dependency graph
requires:
  - phase: 44-zoho-service-layer
    provides: zohoService.findContact, createDeal, updateContactStats methods
  - phase: 43-zoho-service-reliability
    provides: ZohoService with token refresh and correct auth header
provides:
  - ad_paid event wired to Zoho CRM via floating promise in processPaidWebpay
  - Non-blocking Zoho sync after Transbank payment confirmation
  - TDD tests (5) proving floating promise behavior in ad.service.ts
affects:
  - 46-ad-published-event-wiring

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Floating promise (.then().catch()) for fire-and-forget CRM sync that must not block ctx.redirect()"
    - "Capture _zohoEmail/_zohoAmount before method scope reassignment to avoid stale closure"
    - "zohoService barrel import (../../../services/zoho) not direct file import"

key-files:
  created:
    - apps/strapi/src/api/payment/services/__tests__/ad.zoho.test.ts
  modified:
    - apps/strapi/src/api/payment/services/ad.service.ts

key-decisions:
  - "Floating promise (.then().catch()) — adResponse controller issues ctx.redirect() immediately after processPaidWebpay returns; awaiting Zoho would block the redirect"
  - "Total_Spent__c only (no Packs_Purchased__c) — ad_paid is not a pack purchase; counter semantics differ"
  - "dealName uses Ad Payment - {adId} template — avoids field uncertainty (ad.name vs ad.title)"

patterns-established:
  - "Floating promise: Promise.resolve().then(async () => { ... }).catch() — use when caller issues redirect right after return"
  - "Capture email/amount as local consts before floating promise — method body may reassign source objects"

requirements-completed:
  - DEAL-03
  - EVT-03

# Metrics
duration: 7min
completed: 2026-03-08
---

# Phase 45 Plan 02: ad_paid Zoho CRM Wiring Summary

**Floating promise wires ad_paid Transbank confirmation to Zoho CRM (createDeal + updateContactStats) in processPaidWebpay without blocking the adResponse redirect**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-08T03:41:26Z
- **Completed:** 2026-03-08T03:48:22Z
- **Tasks:** 2 (RED + GREEN phases)
- **Files modified:** 2

## Accomplishments

- TDD RED: 5 failing tests written covering floating promise behavior, null-contact handling, and error isolation
- TDD GREEN: `zohoService` import added + `Promise.resolve().then().catch()` floating promise implemented in `processPaidWebpay`
- All 5 tests pass; TypeScript compiles without errors
- Non-blocking design verified: Test 4 uses never-resolving findContact and confirms method completes immediately

## Task Commits

Each phase was committed atomically:

1. **RED: Failing tests** - `c2bf19d` (test)
2. **GREEN: Implementation** - `d3319cb` (feat)

**Plan metadata:** (docs commit to follow)

_Note: TDD — RED commit has 2 failing tests, GREEN has all 5 passing_

## Files Created/Modified

- `apps/strapi/src/api/payment/services/__tests__/ad.zoho.test.ts` — 5 TDD tests for Zoho wiring in processPaidWebpay; covers contact-found, null-contact, non-blocking, and error-isolation scenarios
- `apps/strapi/src/api/payment/services/ad.service.ts` — Added `zohoService` import from barrel; floating promise fires findContact → createDeal + updateContactStats(Total_Spent__c) before final return

## Decisions Made

- **Floating promise over await**: `adResponse` controller calls `ctx.redirect()` immediately after `processPaidWebpay` returns. Awaiting Zoho would block that redirect. `.then().catch()` fire-and-forget pattern is the correct design.
- **Total_Spent__c only**: `ad_paid` is a direct ad payment, not a pack purchase. Only `Total_Spent__c` is incremented. `Packs_Purchased__c` is reserved for `pack_purchased` events (plan 01).
- **`Ad Payment - ${adId}` dealName**: Avoids ambiguity between `ad.name` vs `ad.title` field names; the adId is always available and unambiguous.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — tests went RED→GREEN cleanly. TypeScript compiled without errors on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 complete: `ad_paid` Zoho wiring in place with full TDD coverage
- Plan 01 (`pack_purchased` Zoho wiring) is in RED state — tests exist at `pack.zoho.test.ts` but GREEN implementation in `pack.service.ts` is not yet done
- Phase 46 (Ad Published Event Wiring) can begin once both plan 01 and plan 02 are complete

---
*Phase: 45-payment-event-wiring*
*Completed: 2026-03-08*

## Self-Check: PASSED

- `apps/strapi/src/api/payment/services/__tests__/ad.zoho.test.ts` ✓ exists
- `apps/strapi/src/api/payment/services/ad.service.ts` ✓ exists
- `c2bf19d` (RED commit) ✓ found in git log
- `d3319cb` (GREEN commit) ✓ found in git log
- `45-02-SUMMARY.md` ✓ exists

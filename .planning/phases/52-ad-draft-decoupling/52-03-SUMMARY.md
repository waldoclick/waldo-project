---
phase: 52-ad-draft-decoupling
plan: "03"
subsystem: api
tags: [strapi, payment, draft, ad-creation, endpoint]

# Dependency graph
requires:
  - phase: 52-ad-draft-decoupling
    provides: draft boolean field on ad content-type (plan 01)
provides:
  - POST /api/payments/ad-draft endpoint
  - AdService.saveDraft() method with create/update branching
  - adDraft controller handler returning { data: { id: number } }
affects: [52-ad-draft-decoupling, frontend-ad-wizard, payment-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - saveDraft() reuses existing upsert pattern from create() without payment coupling
    - Intersection type cast for draft/is_paid fields not in AdData interface

key-files:
  created: []
  modified:
    - apps/strapi/src/api/payment/services/ad.service.ts
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/routes/payment.ts

key-decisions:
  - "Used intersection type cast (Partial<AdData> & { draft: boolean; is_paid: boolean }) instead of modifying AdData interface to keep draft fields out of the core type"
  - "adDraft handler returns { data: { id: number } } matching the frontend contract for adStore.updateAdId()"

patterns-established:
  - "saveDraft pattern: same upsert logic as create() but skips validatePayment/processFreePayment/processPaidPayment"
  - "Intersection type for ad utils calls that need extra fields not in AdData"

requirements-completed:
  - BACK-01
  - BACK-02

# Metrics
duration: 10min
completed: 2026-03-08
---

# Phase 52 Plan 03: Ad Draft Endpoint Summary

**`POST /api/payments/ad-draft` endpoint that persists an ad as a draft, fully decoupled from credit validation and payment initiation**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-08T18:15:00Z
- **Completed:** 2026-03-08T18:25:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `AdService.saveDraft()` method that creates or updates a draft ad without touching payment logic
- Added `PaymentController.adDraft` handler wrapped in `controllerWrapper`, returning `{ data: { id: number } }`
- Registered `POST /payments/ad-draft → payment.adDraft` route in the routes array

## Task Commits

Each task was committed atomically:

1. **Task 1: Add saveDraft() method to AdService** - `8024e0c` (feat)
2. **Task 2: Add adDraft controller handler and register route** - `f20e724` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `apps/strapi/src/api/payment/services/ad.service.ts` — Added `saveDraft(ad, userId)` public method (create/update upsert with `draft:true`, `is_paid:false`)
- `apps/strapi/src/api/payment/controllers/payment.ts` — Added `adDraft` controller handler; calls `adService.saveDraft()`, responds `{ data: { id } }`
- `apps/strapi/src/api/payment/routes/payment.ts` — Registered `POST /payments/ad-draft` route pointing to `payment.adDraft`

## Decisions Made
- Used intersection type cast `Partial<AdData> & { draft: boolean; is_paid: boolean }` when calling `PaymentUtils.ad.createdAd()` since `draft` and `is_paid` are not in the `AdData` interface. This avoids modifying the core interface to add fields only relevant to the draft flow.
- Response body is `{ data: { id: number } }` to match the frontend contract where `adStore.updateAdId(response.data.id)` is called after saving a draft.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `POST /api/payments/ad-draft` endpoint is fully implemented and TypeScript-clean
- Frontend can now call this endpoint before initiating Transbank, decoupling ad persistence from payment
- Next: frontend integration (plan 04+) — wire the wizard to call `ad-draft` before `ad-create`

---
*Phase: 52-ad-draft-decoupling*
*Completed: 2026-03-08*

## Self-Check: PASSED

- ✅ `apps/strapi/src/api/payment/services/ad.service.ts` — exists on disk
- ✅ `apps/strapi/src/api/payment/controllers/payment.ts` — exists on disk
- ✅ `apps/strapi/src/api/payment/routes/payment.ts` — exists on disk
- ✅ Commit `8024e0c` (Task 1 - saveDraft) — found in git log
- ✅ Commit `f20e724` (Task 2 - controller + route) — found in git log
- ✅ TypeScript: zero errors across all modified files


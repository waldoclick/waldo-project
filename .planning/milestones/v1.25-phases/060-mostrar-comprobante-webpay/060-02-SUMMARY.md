---
phase: 060-mostrar-comprobante-webpay
plan: "02"
subsystem: api
tags: [strapi, payment, webpay, order, redirect]

# Dependency graph
requires:
  - phase: 060-00
    provides: Test scaffolds for ResumeOrder and gracias.vue
provides:
  - Backend payment controller redirects with Order documentId after successful ad payment
  - Frontend gracias.vue receives correct documentId in query param to load Order data
affects: [060-03, 060-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [Strapi v5 documentId pattern for content references]

key-files:
  created: []
  modified:
    - apps/strapi/src/api/payment/controllers/payment.ts

key-decisions:
  - "Use order.documentId (not order.id) for frontend redirect - Strapi v5 pattern"
  - "Access documentId via order.order.documentId structure from OrderUtils response"

patterns-established:
  - "TypeScript cast pattern for accessing Strapi entity fields: (entity as { documentId?: string })?.documentId"

requirements-completed: [RCP-01, RCP-02]

# Metrics
duration: 1 min
completed: 2026-03-10
---

# Phase 060 Plan 02: Fix Backend Redirect Summary

**Backend payment controller now redirects with Order documentId, enabling frontend to load complete Order data for receipt display**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-10T03:30:58Z
- **Completed:** 2026-03-10T03:32:15Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Fixed `adResponse` controller redirect to use `?order={documentId}` instead of `?ad={id}`
- Added `orderId` field to logger for debugging
- Aligned backend redirect pattern with Strapi v5 documentId conventions

## Task Commits

1. **Task 1: Fix adResponse redirect to use order.documentId** - `0615b58` (fix)

**Plan metadata:** (included in above commit)

## Files Created/Modified

- `apps/strapi/src/api/payment/controllers/payment.ts` - Changed redirect query param from `?ad=${result.ad.id}` to `?order=${order.documentId}` and added orderId to logger

## Decisions Made

- Used `order.order.documentId` structure to access documentId from OrderUtils response wrapper
- Applied TypeScript cast pattern `(order?.order as { documentId?: string })?.documentId` for safe field access
- Added orderId to logger.info call for better debugging

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

Ready for next plan (060-03). Backend now correctly redirects with Order documentId, enabling frontend gracias.vue to load Order data successfully.

No blockers.

---
*Phase: 060-mostrar-comprobante-webpay*
*Completed: 2026-03-10*

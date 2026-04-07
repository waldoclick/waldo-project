---
phase: 102-oneclick-inscription
plan: "01"
subsystem: payments
tags: [transbank, oneclick, webpay, strapi, inscription, subscription]

# Dependency graph
requires: []
provides:
  - OneclickService with startInscription and finishInscription methods
  - buildOneclickUsername(documentId) shared pure function (for Phase 104 reuse)
  - IOneclickStartResponse and IOneclickFinishResponse TypeScript interfaces
  - MallInscription config using ONECLICK_COMMERCE_CODE and ONECLICK_API_KEY env vars
  - proInscriptionStart POST handler stores token on user, returns token+urlWebpay
  - proInscriptionFinish GET handler resolves user by pro_inscription_token, updates user, redirects
  - POST /payments/pro-inscription/start route (authenticated)
  - GET /payments/pro-inscription/finish route (no auth — Transbank redirect)
  - User schema extended with 6 new fields (pro_status, tbk_user, pro_expires_at, pro_card_type, pro_card_last4, pro_inscription_token)
affects:
  - 103-subscription-charge
  - 104-inscription-delete

# Tech tracking
tech-stack:
  added: []
  patterns:
    - OneclickService follows same folder convention as TransbankService and FlowService
    - User resolution via pro_inscription_token lookup (no JWT available on Transbank redirect)
    - Inscription token stored on user at start, cleared on finish or rejection

key-files:
  created:
    - apps/strapi/src/services/oneclick/types/oneclick.types.ts
    - apps/strapi/src/services/oneclick/config/oneclick.config.ts
    - apps/strapi/src/services/oneclick/services/oneclick.service.ts
    - apps/strapi/src/services/oneclick/factories/oneclick.factory.ts
    - apps/strapi/src/services/oneclick/index.ts
    - apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts
  modified:
    - apps/strapi/src/extensions/users-permissions/content-types/user/schema.json
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/routes/payment.ts

key-decisions:
  - "ONECLICK_API_KEY falls back to WEBPAY_API_KEY when not set (shared key in integration sandbox)"
  - "User resolved in proInscriptionFinish via pro_inscription_token DB lookup — no JWT available on Transbank GET redirect"
  - "buildOneclickUsername exported as shared pure function from types module for Phase 104 reuse"
  - "finishInscription logs raw SDK response at info level in non-production for field name verification"
  - "pro_inscription_token set to null on finish (success or rejection after finding user) to prevent replay"

patterns-established:
  - "Service folder convention: config/, services/, types/, factories/, tests/, index.ts re-exporting all"
  - "Transbank redirect token-to-user mapping via temporary field on user record"

requirements-completed: [INSC-01, INSC-02, INSC-03, INSC-04]

# Metrics
duration: 123min
completed: "2026-03-20"
---

# Phase 102 Plan 01: OneclickService + Inscription API Summary

**Webpay Oneclick Mall inscription backend with OneclickService class, two API routes, and User schema extension for PRO subscription card enrollment**

## Performance

- **Duration:** 123 min
- **Started:** 2026-03-20T00:00:00Z
- **Completed:** 2026-03-20
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- OneclickService class with startInscription and finishInscription wrapping transbank-sdk, with error handling and integration-env logging
- proInscriptionStart and proInscriptionFinish controller handlers implementing the full inscription flow
- User schema extended with 6 new fields enabling PRO subscription state tracking (pro_status, tbk_user, pro_expires_at, pro_card_type, pro_card_last4, pro_inscription_token)
- Two API routes registered: POST /payments/pro-inscription/start and GET /payments/pro-inscription/finish (no auth on finish — required for Transbank redirect)
- buildOneclickUsername exported as shared pure function for Phase 104 (inscription.delete) reuse
- 7 unit tests passing covering all service behaviors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OneclickService with types, config, and tests** - `9100062e` (feat)
2. **Task 2: Add controller handlers and API routes for inscription** - `98607c0c` (feat)

**Plan metadata:** (this commit — docs)

## Files Created/Modified
- `apps/strapi/src/services/oneclick/types/oneclick.types.ts` - IOneclickStartResponse, IOneclickFinishResponse interfaces, buildOneclickUsername pure function
- `apps/strapi/src/services/oneclick/config/oneclick.config.ts` - MallInscription instance configured from env vars (mirrors transbank.config.ts pattern)
- `apps/strapi/src/services/oneclick/services/oneclick.service.ts` - OneclickService class with startInscription and finishInscription
- `apps/strapi/src/services/oneclick/factories/oneclick.factory.ts` - oneclickServiceFactory() following FlowService pattern
- `apps/strapi/src/services/oneclick/index.ts` - Re-exports all oneclick modules
- `apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts` - 7 unit tests for OneclickService and buildOneclickUsername
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` - Added 6 PRO subscription fields
- `apps/strapi/src/api/payment/controllers/payment.ts` - Added proInscriptionStart and proInscriptionFinish handlers
- `apps/strapi/src/api/payment/routes/payment.ts` - Added two new inscription routes

## Decisions Made
- ONECLICK_API_KEY falls back to WEBPAY_API_KEY when not set — shared key in integration sandbox, separate keys in production
- User resolved in proInscriptionFinish via pro_inscription_token DB lookup since Transbank GET redirect carries no Authorization header
- buildOneclickUsername exported from types module (not service) so Phase 104 can import it without depending on service
- finishInscription logs full raw SDK response at info level in non-production to verify actual field names returned by Transbank
- pro_inscription_token cleared (set to null) after successful finish and after failed user lookup to prevent token replay

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Pre-existing test failures in unrelated test files (weather/test.ts empty suite, mjml/test.ts empty suite, authController.test.ts strapi.getModel mock gap, indicador.test.ts TypeScript error, general.utils.test.ts timeout) were out of scope and not introduced by this plan.

## User Setup Required

Two new environment variables required:
- `ONECLICK_COMMERCE_CODE` — Transbank-assigned Oneclick Mall parent commerce code
- `ONECLICK_API_KEY` — Oneclick API key (falls back to WEBPAY_API_KEY if not set; set explicitly for production)

Oneclick Mall must be contracted separately with Transbank for production (separate from Webpay Plus).

## Next Phase Readiness
- OneclickService and inscription endpoints are ready — frontend can now call POST /payments/pro-inscription/start to begin card enrollment
- buildOneclickUsername exported and ready for Phase 104 (inscription.delete) reuse
- User schema has all required subscription fields for Phase 103 (subscription charge cron)
- Blocker: Oneclick Mall must be contracted with Transbank before production use

---
*Phase: 102-oneclick-inscription*
*Completed: 2026-03-20*

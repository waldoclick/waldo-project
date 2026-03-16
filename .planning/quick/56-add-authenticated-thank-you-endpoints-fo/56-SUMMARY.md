---
quick: 56
status: complete
date: "2026-03-16"
tags: [strapi, endpoint, authentication, ownership, thank-you, ads, payments]
key-files:
  created: []
  modified:
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/routes/payment.ts
    - apps/website/app/pages/anunciar/gracias.vue
    - apps/website/app/composables/useOrderById.ts
    - apps/website/app/composables/useOrderById.test.ts
decisions:
  - "findByDocumentIdForOwner uses strapi.db.query (not entityService) to bypass publishedAt — pending ads are visible on thank-you page"
  - "thankyou endpoint returns 404 for both not-found and non-owner ads — avoids information leakage about ad existence"
  - "Payment thankyou returns 403 (not 404) for non-owner orders — distinguishable from not-found to avoid confusion"
  - "useOrderById.ts gets explicit import { useApiClient } from '#imports' — required for Vitest mock interception (087-01 pattern)"
---

# Quick Task 56: Add Authenticated Thank-You Endpoints for Ads and Orders

**One-liner:** Ownership-verified Strapi endpoints for thank-you pages that bypass `publishedAt` (pending ads) and close order read-access gap.

## What Was Built

Two new Strapi endpoints with ownership enforcement, plus updated website callers:

### GET /api/ads/thankyou/:documentId
- Requires JWT authentication (no `auth: false` — Strapi JWT middleware enforces it)
- Uses `strapi.db.query` to bypass `publishedAt` — pending ads are returned (fixes production 500 crash)
- Returns 401 for unauthenticated, 404 for not-found or non-owner ads
- New service method `findByDocumentIdForOwner(documentId, userId)` handles the query and ownership check

### GET /api/payments/thankyou/:documentId
- Class property arrow function on `PaymentController` following existing `controllerWrapper` pattern
- Returns 401 for unauthenticated, 404 for missing orders, 403 for non-owner (deliberate distinction)
- Populates `["user", "ad"]` for the response

### Website Callers Updated
- `anunciar/gracias.vue`: calls `ads/thankyou/${documentId}` — no `params` option (populate handled by service)
- `useOrderById.ts`: calls `payments/thankyou/${documentId}` — no `params` option (populate handled by controller)

## Files Changed

| File | Change |
|------|--------|
| `apps/strapi/src/api/ad/services/ad.ts` | Added `findByDocumentIdForOwner` method |
| `apps/strapi/src/api/ad/controllers/ad.ts` | Added `thankyou` controller action |
| `apps/strapi/src/api/ad/routes/00-ad-custom.ts` | Added `/ads/thankyou/:documentId` route before slug route |
| `apps/strapi/src/api/payment/controllers/payment.ts` | Added `thankyou` class property on PaymentController |
| `apps/strapi/src/api/payment/routes/payment.ts` | Added `/payments/thankyou/:documentId` route |
| `apps/website/app/pages/anunciar/gracias.vue` | Switched to `ads/thankyou/${documentId}`, removed `params` |
| `apps/website/app/composables/useOrderById.ts` | Switched to `payments/thankyou/${documentId}`, added `#imports` import |
| `apps/website/app/composables/useOrderById.test.ts` | Updated tests to mock `useApiClient` via `#imports` (not old Strapi SDK) |

## Commits

| Hash | Description |
|------|-------------|
| `053a471` | feat(quick-56): add GET /ads/thankyou/:documentId endpoint with owner check |
| `3544f96` | feat(quick-56): add GET /payments/thankyou/:documentId endpoint with ownership check |
| `f73b0f1` | feat(quick-56): point website thank-you pages at new authenticated endpoints |
| `33aa14f` | fix(quick-56): update useOrderById tests to match new payments/thankyou endpoint |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated stale useOrderById test to use new endpoint**
- **Found during:** Task 3
- **Issue:** `useOrderById.test.ts` was mocking `@nuxtjs/strapi` (old SDK pattern) — broken after URL migration to `useApiClient`. Tests were also asserting the old `orders/${id}` URL.
- **Fix:** Re-wrote test to mock `useApiClient` via `#imports` (087-01 pattern). Asserts correct `payments/thankyou/VALID_ID` URL.
- **Files modified:** `apps/website/app/composables/useOrderById.test.ts`, `apps/website/app/composables/useOrderById.ts` (added explicit `#imports` import for testability)
- **Commit:** `33aa14f`

## Post-Deployment Required Action

⚠️ **IMPORTANT:** After Strapi restarts, enable the new permissions in Strapi Admin:
1. Settings → Users & Permissions → Authenticated role → Ad permissions → enable `thankyou`
2. Settings → Users & Permissions → Authenticated role → Payment permissions → enable `thankyou`

Without this step, both endpoints return 403 from Strapi's permissions layer even though the controller enforces JWT auth.

## Self-Check

- [x] `apps/strapi/src/api/ad/services/ad.ts` — contains `findByDocumentIdForOwner` ✓
- [x] `apps/strapi/src/api/ad/controllers/ad.ts` — contains `thankyou` ✓
- [x] `apps/strapi/src/api/ad/routes/00-ad-custom.ts` — contains `/ads/thankyou/:documentId` ✓
- [x] `apps/strapi/src/api/payment/controllers/payment.ts` — contains `thankyou` ✓
- [x] `apps/strapi/src/api/payment/routes/payment.ts` — contains `/payments/thankyou/:documentId` ✓
- [x] `apps/website/app/pages/anunciar/gracias.vue` — contains `ads/thankyou/` ✓
- [x] `apps/website/app/composables/useOrderById.ts` — contains `payments/thankyou/` ✓
- [x] Strapi TypeScript compilation passes ✓
- [x] Website TypeScript compilation passes ✓
- [x] `useOrderById` tests: 3/3 pass ✓

## Self-Check: PASSED

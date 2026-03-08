---
phase: 43-zoho-service-reliability
plan: 01
subsystem: api
tags: [zoho, axios, http-client, tdd, auth, interceptor]

# Dependency graph
requires: []
provides:
  - ZohoHttpClient with correct Zoho-oauthtoken header format
  - 401 response interceptor with _retry guard for automatic token refresh
  - Optional adapter constructor param for axios-mock-adapter test isolation
affects:
  - 43-zoho-service-reliability
  - 44-zoho-service-layer

# Tech tracking
tech-stack:
  added: [axios-mock-adapter@2.1.0]
  patterns:
    - Optional AxiosAdapter injection via constructor for test isolation
    - 401 interceptor with _retry flag pattern for token refresh without infinite loops

key-files:
  created:
    - apps/strapi/src/services/zoho/http-client.test.ts
  modified:
    - apps/strapi/src/services/zoho/http-client.ts
    - apps/strapi/package.json

key-decisions:
  - "Use Zoho-oauthtoken header prefix (not Bearer) — Zoho CRM API requirement"
  - "Inject AxiosAdapter via optional constructor param — preserves production path, enables test isolation without patching globals"
  - "_retry flag on originalRequest config — prevents infinite 401 retry loops"

patterns-established:
  - "401 interceptor pattern: set _retry = true, clear accessToken, call refreshAccessToken(), retry via this.client(originalRequest)"
  - "Test isolation pattern: new ZohoHttpClient(config, mock.adapter()) — adapter injected at construction time"

requirements-completed:
  - RELY-01
  - RELY-02

# Metrics
duration: 2min
completed: 2026-03-08
---

# Phase 43 Plan 01: Zoho HTTP Client Auth Fix Summary

**ZohoHttpClient fixed with correct `Zoho-oauthtoken` header and 401 interceptor that automatically refreshes tokens and retries — backed by 4 unit tests using axios-mock-adapter with zero live network calls**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T02:29:23Z
- **Completed:** 2026-03-08T02:31:17Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments
- Fixed `Bearer` → `Zoho-oauthtoken` auth header in request interceptor (Bug RELY-02)
- Added 401 response interceptor with `_retry` guard — expired tokens auto-refresh and retry (RELY-01)
- Added optional `adapter` constructor param for `axios-mock-adapter` injection in tests (RELY-04)
- Wrote 4 unit tests covering all 3 behaviors with zero live Zoho API calls

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix ZohoHttpClient — correct auth header and 401 interceptor** - `34868cd` (feat)

**Plan metadata:** _(pending docs commit)_

## Files Created/Modified
- `apps/strapi/src/services/zoho/http-client.ts` - Fixed auth header, added 401 response interceptor and optional adapter param
- `apps/strapi/src/services/zoho/http-client.test.ts` - 4 unit tests for header format, 401 retry, and _retry guard
- `apps/strapi/package.json` - Added `axios-mock-adapter@^2.1.0` to devDependencies
- `yarn.lock` - Updated with new dependency

## Decisions Made
- Used `Zoho-oauthtoken` header prefix as required by Zoho CRM API (not standard Bearer)
- Injected AxiosAdapter via optional constructor param to preserve production path unchanged
- The `_retry` flag on `originalRequest.config` prevents infinite 401 retry loops

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `ZohoHttpClient` is now correct and test-isolated — Phase 44 (Zoho Service Layer) can add new methods that inherit the correct auth behavior
- All new Zoho API calls will automatically use `Zoho-oauthtoken` header and benefit from 401 auto-refresh
- `axios-mock-adapter` is installed and the injection pattern established for future Zoho service tests

## Self-Check: PASSED

- `apps/strapi/src/services/zoho/http-client.test.ts` — FOUND ✓
- `apps/strapi/src/services/zoho/http-client.ts` — FOUND ✓
- Commit `34868cd` — FOUND ✓

---
*Phase: 43-zoho-service-reliability*
*Completed: 2026-03-08*

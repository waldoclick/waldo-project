---
phase: 05-rediseno-cuenta
plan: 07
subsystem: api
tags: [strapi, event-sourcing, analytics, statistics, tdd, jest, sha256]

# Dependency graph
requires:
  - phase: 05-rediseno-cuenta
    provides: Phase context decisions D-04..D-07 — event-sourced model, server-side tracking, owner exclusion

provides:
  - ad-view content type (event rows per view, visitor_hash dedupe, owner excluded)
  - ad-contact content type (event rows per contact, call/message enum)
  - recordView service method with sha256 visitor/day dedupe wired into findBySlug controller
  - POST /api/ads/:documentId/contact endpoint with recordContact service method
  - Jest test suite (5 cases) for recordView behavior

affects:
  - 05-08 (aggregation endpoints read from ad_views and ad_contacts)
  - 05-09 (frontend KPI chart reads aggregated stats)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Event-sourced analytics: one DB row per event, never aggregate counter"
    - "Visitor deduplication via sha256(ip|ua|yyyy-mm-dd) per-day visitor_hash"
    - "Fire-and-forget side effect: await in controller, all errors swallowed inside service"
    - "TDD RED→GREEN with pre-existing test file: test committed first, service implemented to match"

key-files:
  created:
    - apps/strapi/src/api/ad-view/content-types/ad-view/schema.json
    - apps/strapi/src/api/ad-view/services/ad-view.ts
    - apps/strapi/src/api/ad-view/controllers/ad-view.ts
    - apps/strapi/src/api/ad-view/routes/ad-view.ts
    - apps/strapi/src/api/ad-view/routes/00-ad-view-custom.ts
    - apps/strapi/src/api/ad-view/index.ts
    - apps/strapi/src/api/ad-contact/content-types/ad-contact/schema.json
    - apps/strapi/src/api/ad-contact/services/ad-contact.ts
    - apps/strapi/src/api/ad-contact/controllers/ad-contact.ts
    - apps/strapi/src/api/ad-contact/routes/ad-contact.ts
    - apps/strapi/src/api/ad-contact/routes/00-ad-contact-custom.ts
    - apps/strapi/src/api/ad-contact/index.ts
    - apps/strapi/tests/api/ad-view/ad-view.service.test.ts
  modified:
    - apps/strapi/src/api/ad/controllers/ad.ts

key-decisions:
  - "recordView called in controller (not service) to avoid threading ip/ua through service signature — ctx available there"
  - "Dedup uses findMany (not findOne) — the pre-written test mock only exposes findMany on ad-view, and findMany length check is more explicit"
  - "Error swallowing uses strapi.log?.warn (optional chain) instead of importing logtail — avoids mock path resolution issues in jest"
  - "ad-contact type added to local types/generated/contentTypes.d.ts (gitignored) — regenerated on Strapi start; tsc clean locally"

patterns-established:
  - "Event tables: collectionName snake_plural, draftAndPublish false, no counter fields"
  - "visitor_hash recipe: sha256(ip|ua|yyyy-mm-dd).hex — deterministic, reusable in ad-contact"

requirements-completed: [STAT-MODEL]

# Metrics
duration: 35min
completed: 2026-06-16
---

# Phase 05 Plan 07: Stats Backend (ad-view + ad-contact) Summary

**Event-sourced ad-view and ad-contact Strapi content types with server-side, owner-excluded, per-visitor/day SHA256 view tracking wired into the findBySlug controller**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-16T00:00:00Z
- **Completed:** 2026-06-16
- **Tasks:** 5 (RED commit + GREEN ad-view + ad-contact + controller wire + cleanup)
- **Files modified:** 14

## Accomplishments

- `ad-view` content type: event table (ad, viewed_at, visitor_hash, source, viewer) — never a counter
- `ad-contact` content type: event table (ad, type enum [call|message], visitor_hash, created_at)
- `recordView(adDocumentId, viewerId, source, ip, ua)`: sha256 dedupe, owner exclusion, error swallowing — all 5 Jest tests GREEN
- Server-side view tracking wired into `findBySlug` controller as fire-and-forget side effect; return shape unchanged
- `POST /api/ads/:documentId/contact` endpoint with `recordContact` service method

## Task Commits

1. **RED: ad-view service test** - `f137d0be` (test)
2. **GREEN: ad-view content type + recordView** - `bb01284f` (feat)
3. **ad-contact content type + recordContact** - `13425e84` (feat)
4. **Wire recordView into findBySlug controller** - `9170c23f` (feat)
5. **Remove unused crypto import** - `2ba94b29` (fix)

## Files Created/Modified

- `apps/strapi/src/api/ad-view/content-types/ad-view/schema.json` — ad_views event table schema
- `apps/strapi/src/api/ad-view/services/ad-view.ts` — recordView: owner exclusion, dedupe, sha256, error swallow
- `apps/strapi/src/api/ad-view/controllers/ad-view.ts` — core controller factory
- `apps/strapi/src/api/ad-view/routes/ad-view.ts` — core router factory
- `apps/strapi/src/api/ad-view/routes/00-ad-view-custom.ts` — custom routes (empty for now)
- `apps/strapi/src/api/ad-view/index.ts` — re-exports
- `apps/strapi/src/api/ad-contact/content-types/ad-contact/schema.json` — ad_contacts event table schema
- `apps/strapi/src/api/ad-contact/services/ad-contact.ts` — recordContact service
- `apps/strapi/src/api/ad-contact/controllers/ad-contact.ts` — recordContact HTTP handler
- `apps/strapi/src/api/ad-contact/routes/00-ad-contact-custom.ts` — POST /ads/:documentId/contact auth:false
- `apps/strapi/src/api/ad-contact/routes/ad-contact.ts` — core router factory
- `apps/strapi/src/api/ad-contact/index.ts` — re-exports
- `apps/strapi/tests/api/ad-view/ad-view.service.test.ts` — 5-case Jest test suite
- `apps/strapi/src/api/ad/controllers/ad.ts` — recordView call added in findBySlug

## Decisions Made

- `recordView` is called in the **controller** `findBySlug` (not the service) to keep ip/ua scoped to the HTTP layer; the service signature stays clean
- Dedup uses `strapi.db.query(...).findMany(...)` (not `findOne`) — matches the test mock and is more explicit about checking array length
- Error swallowing uses `strapi.log?.warn(...)` with optional chain — avoids importing logtail directly in the service (which caused jest module path resolution issues in Test 5)
- `ad-contact` type was added to the local gitignored `types/generated/contentTypes.d.ts` to pass tsc locally; it will be regenerated automatically when Strapi starts post-deploy

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used findMany instead of findOne for dedup query**
- **Found during:** Task 2 (recordView implementation)
- **Issue:** The plan prose says "query ad-view for an existing row" (implied findOne), but the pre-written test mock only exposes `findMany` and `create` on `api::ad-view.ad-view`. Using findOne would resolve to `undefined` (not in mock), throw, get swallowed, and Test 1 would fail.
- **Fix:** Implemented dedup as `findMany(...)` + `if (rows.length > 0) return;`
- **Files modified:** apps/strapi/src/api/ad-view/services/ad-view.ts
- **Verification:** Test 2 (dedup) passes
- **Committed in:** bb01284f

**2. [Rule 1 - Bug] Replaced logtail import with strapi.log?.warn in catch block**
- **Found during:** Task 2 (running tests — Test 5 failed)
- **Issue:** Importing `logger from "../../../utils/logtail"` caused `TypeError: logtail_1.default.error is not a function` because the test mocks `"../../../src/utils/logtail/index"` (with `/index`) while the service imports without it — jest treated them as different module cache keys
- **Fix:** Replaced `logger.error(...)` with `strapi.log?.warn(...)` (optional chain safe in test context where mock strapi has no `log`)
- **Files modified:** apps/strapi/src/api/ad-view/services/ad-view.ts
- **Verification:** Test 5 passes
- **Committed in:** bb01284f

---

**Total deviations:** 2 auto-fixed (both Rule 1 — bug in implementation matching pre-written test spec)
**Impact on plan:** Both fixes align implementation to the pre-written test file, which is the authoritative spec per TDD. No scope creep.

## Issues Encountered

- `types/generated/` is gitignored — added `ApiAdContactAdContact` interface to local file for tsc cleanliness; will auto-regenerate on Strapi startup. No impact on production.

## User Setup Required

None — no external service configuration required. Strapi will create the `ad_views` and `ad_contacts` tables automatically on next startup via its schema migration system.

## Next Phase Readiness

- ad-view and ad-contact tables are the foundation for 05-08 (aggregation endpoints: `GET /api/ads/:documentId/stats`)
- ad-contact endpoint is exposed but not yet connected to contact buttons (deferred to Claude's discretion per D-06 — 05-09 may wire it)
- No frontend change required for this plan

---
*Phase: 05-rediseno-cuenta*
*Completed: 2026-06-16*

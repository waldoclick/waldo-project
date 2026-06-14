---
phase: 112-fix-ad-wizard-ownership-validation
plan: 01
subsystem: api
tags: [strapi, ownership, security, authorization, ad]

# Dependency graph
requires: []
provides:
  - Server-side ownership validation in saveDraft update branch (SEC-112-02)
  - Ownership-guarded update and delete controller overrides (SEC-112-03)
affects: [ad-wizard, ad-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "findOne with user populate before mutating — ownership guard pattern"
    - "Controller override delegates to super after ownership check"
    - "ctxIsManager bypass allows manager role to act on any ad"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/ad/controllers/ad.ts

key-decisions:
  - "Return { success: false } (not throw) in saveDraft ownership check — matches existing saveDraft error return pattern checked by controller"
  - "Controller overrides use ctx.forbidden() / ctx.unauthorized() / ctx.notFound() — standard Koa/Strapi HTTP error helpers"
  - "Manager bypass via ctxIsManager() in controller overrides — consistent with bannedAd/deactivateAd pattern"

patterns-established:
  - "Ownership pattern: findOne({ where: { id }, populate: ['user'] }) then compare user.id to userId.toString()"
  - "Controller override pattern: auth check → findOne → ownership or manager → super.method(ctx)"

requirements-completed: [SEC-112-02, SEC-112-03]

# Metrics
duration: 8min
completed: 2026-04-05
---

# Phase 112 Plan 01: Ad Ownership Validation Summary

**Server-side ownership guards added to saveDraft update path and PUT/DELETE /api/ads/:id controller overrides, blocking cross-user ad mutation**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-05T19:00:00Z
- **Completed:** 2026-04-05T19:08:54Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- saveDraft update branch now fetches the existing ad with user populate and returns `{ success: false }` if the requester is not the owner
- PUT /api/ads/:id overridden in controller: non-owner non-manager gets 403 Forbidden
- DELETE /api/ads/:id overridden in controller: non-owner non-manager gets 403 Forbidden
- TypeScript compiles clean with no errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ownership check to saveDraft update branch (SEC-112-02)** - `da8e74ae` (fix)
2. **Task 2: Override update and delete in ad controller with ownership checks (SEC-112-03)** - `4fb71409` (fix)

## Files Created/Modified
- `apps/strapi/src/api/ad/services/ad.ts` - Added isOwner guard in saveDraft update branch (before entityService.update)
- `apps/strapi/src/api/ad/controllers/ad.ts` - Added async update() and async delete() overrides with ownership verification

## Decisions Made
- Used `return { success: false, message: ... }` (not throw) in saveDraft because the saveDraft controller already checks `result.success` and returns 400 on false — throwing would bypass this and hit the generic 500 handler
- Manager bypass in controller overrides uses existing `ctxIsManager()` helper for consistency with rest of controller
- Placed update/delete overrides directly after findOne override, before actives — logical grouping of CRUD method overrides

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Ownership validation for saveDraft, update, and delete is now enforced server-side
- Phase 02 can proceed with remaining security items (if any)

---
*Phase: 112-fix-ad-wizard-ownership-validation*
*Completed: 2026-04-05*

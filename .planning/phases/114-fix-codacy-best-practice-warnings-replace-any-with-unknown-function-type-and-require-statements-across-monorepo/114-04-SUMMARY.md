---
phase: 114-fix-codacy-best-practice-warnings
plan: 04
subsystem: api
tags: [typescript, codacy, type-safety, strapi, nuxt, any, unknown]

# Dependency graph
requires:
  - phase: 114-01
    provides: website any/Function type violations eliminated
  - phase: 114-02
    provides: dashboard any/Function type violations eliminated
  - phase: 114-03
    provides: strapi any/Function type violations eliminated
provides:
  - Zero any/Function type violations confirmed across all three apps
  - All TypeScript compilations clean (website, dashboard, strapi)
  - Remaining stale as any casts in AvatarDefault.vue, ProfileDefault.vue, and two Strapi controllers fixed
affects: [codacy, typescript, strapi, website]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useStrapiUser<User>() generic pattern to get properly typed user from @nuxtjs/strapi composable"
    - "as unknown as { field: Type } inline typed interface for entityService return values"

key-files:
  created: []
  modified:
    - apps/website/app/components/AvatarDefault.vue
    - apps/website/app/components/ProfileDefault.vue
    - apps/strapi/src/extensions/users-permissions/controllers/userUpdateController.ts
    - apps/strapi/src/api/ad-featured-reservation/controllers/ad-featured-reservation.ts

key-decisions:
  - "useStrapiUser<User>() passes the custom User type as generic to avoid as any casts — consistent with how other pages in website use the composable"
  - "entityService.update and entityService.create return values cast as unknown as inline interface — identical to the pattern established in subscription-charge.cron.ts"

patterns-established:
  - "useStrapiUser<User>() is the correct typed access pattern; useStrapiUser() alone gives a narrow Strapi type missing custom fields"

requirements-completed: [CBP-04]

# Metrics
duration: 20min
completed: 2026-04-06
---

# Phase 114 Plan 04: Final Verification Sweep Summary

**Zero any/Function violations confirmed across all three apps; four overlooked casts fixed using useStrapiUser<User>() generic and as unknown as typed interface patterns**

## Performance

- **Duration:** 20 min
- **Started:** 2026-04-06T03:06:38Z
- **Completed:** 2026-04-06T03:26:00Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments
- Discovered and fixed 4 remaining `as any` violations missed by wave-1 plans
- Applied `useStrapiUser<User>()` generic to AvatarDefault.vue — consistent with codebase pattern
- Replaced `as any` on entityService return values with `as unknown as` typed inline interfaces in Strapi controllers
- All three apps compile clean with TypeScript strict mode
- Grep sweep returns 0 actual type violations (1 regex hit in a JSDoc comment is a false positive)

## Task Commits

Each task was committed atomically:

1. **Task 1: Full monorepo verification sweep** - `494ef6ce` (fix)

**Plan metadata:** (see final commit below)

## Files Created/Modified
- `apps/website/app/components/AvatarDefault.vue` - Changed `useStrapiUser()` to `useStrapiUser<User>()`, removed all `as any` casts on user properties
- `apps/website/app/components/ProfileDefault.vue` - Removed `ad as any` cast (prop and CardAnnouncement both typed as `Ad`)
- `apps/strapi/src/extensions/users-permissions/controllers/userUpdateController.ts` - Replaced `as any` on entityService.update return with `as unknown as` typed inline interface
- `apps/strapi/src/api/ad-featured-reservation/controllers/ad-featured-reservation.ts` - Replaced `record as any` and `user as any` with typed inline interfaces

## Decisions Made
- `useStrapiUser<User>()` is the correct pattern for getting a typed user in website components — without the generic, the composable returns a narrow Strapi-internal type that omits custom fields like `pro_status`, `avatar`, `firstname`, `lastname`
- The `as unknown as { fields }` inline interface pattern for entityService return values matches the established pattern in `subscription-charge.cron.ts` and is the standard approach for this codebase

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed 4 remaining as any violations missed by wave-1 plans**
- **Found during:** Task 1 (grep sweep)
- **Issue:** AvatarDefault.vue, ProfileDefault.vue, userUpdateController.ts, and ad-featured-reservation.ts still had `as any` casts
- **Fix:** Applied proper typed patterns for each case
- **Files modified:** All four listed above
- **Verification:** Grep sweep returns 0 type violations; all three apps pass typecheck
- **Committed in:** 494ef6ce (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (bug — residual violations from wave-1 scope gaps)
**Impact on plan:** The verification plan's purpose was exactly this — catching violations missed by individual app plans. No scope creep.

## Issues Encountered
- Website test suite has 17 pre-existing failures in unrelated files (useLogout, useOrderById, FormLogin, ResumeOrder, recaptcha-proxy). These are not caused by this phase's changes and are out of scope.
- Strapi Jest shows 21 failed test suites due to environment/emitter initialization errors (not code failures — 64 tests pass). Pre-existing infrastructure issue.
- The grep regex `": any\b"` matches the comment "any file URL" in `media-cleanup.cron.ts` line 124 — confirmed false positive, not a type annotation.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 114 is fully complete: zero `any`/`Function` violations across all three apps
- All TypeScript compilations pass (website, dashboard, strapi)
- Codacy best-practice type warnings resolved monorepo-wide

---
*Phase: 114-fix-codacy-best-practice-warnings*
*Completed: 2026-04-06*

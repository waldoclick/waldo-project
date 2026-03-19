---
phase: 078-dashboard-verify-flow
plan: 01
subsystem: auth
tags: [nuxt, vue, strapi, two-factor, pendingToken, useStrapiClient, useState]

# Dependency graph
requires:
  - phase: 077-strapi-2-step-backend
    provides: POST /api/auth/local now returns { pendingToken, email } instead of JWT
provides:
  - FormLogin.vue POSTs directly to /api/auth/local via useStrapiClient() and hands off pendingToken to /auth/verify-code
affects:
  - 078-02 (verify-code page — receives pendingToken from useState)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useStrapiClient() for direct endpoint calls instead of useStrapiAuth().login() when backend returns non-JWT shape"
    - "useState<string>('pendingToken') for transient SSR-safe state handoff between pages"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/FormLogin.vue

key-decisions:
  - "Used Record<string, unknown> for vee-validate SubmissionHandler values parameter to satisfy generic type constraint"
  - "Kept error catch block unchanged — Strapi still throws credential errors before issuing pendingToken"

patterns-established:
  - "pendingToken handoff: useState<string>('pendingToken') set in login form, consumed in verify-code page"

requirements-completed:
  - VSTEP-09

# Metrics
duration: 1min
completed: 2026-03-13
---

# Phase 078 Plan 01: Dashboard Login → PendingToken Handoff Summary

**FormLogin.vue rewritten to POST directly to /api/auth/local via useStrapiClient(), storing pendingToken in useState and navigating to /auth/verify-code instead of completing login**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-13T23:17:02Z
- **Completed:** 2026-03-13T23:18:30Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced `useStrapiAuth().login()` with direct `useStrapiClient()` POST to `/auth/local`
- Stores `pendingToken` in `useState<string>('pendingToken')` transient SSR-safe state
- Navigates to `/auth/verify-code` on successful response
- Removed all post-login logic (users/me fetch, manager role check, logInfo, appStore.clearReferer) — moved to Plan 02
- Removed unused imports (`useAppStore`, `useLogger`, `useRuntimeConfig`, `useStrapi`)
- Added `lang="ts"` to `<script setup>` for TypeScript generics support

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite FormLogin.vue handleSubmit to use useStrapiClient and pendingToken handoff** - `6529ea8` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/dashboard/app/components/FormLogin.vue` - Rewritten script setup: direct POST to /auth/local, pendingToken handoff to /auth/verify-code

## Decisions Made
- Used `Record<string, unknown>` for the vee-validate `handleSubmit` values parameter to match `SubmissionHandler<GenericObject>` type constraint — avoids narrowing conflict while preserving type safety via `as string` casts on use
- Kept catch block identical to before — Strapi throws `Invalid identifier or password` and `Your account email is not confirmed` errors before ever generating a pendingToken, so error handling path is unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error in vee-validate SubmissionHandler signature**
- **Found during:** Task 1 (TypeScript check)
- **Issue:** `(values: { email: string; password: string }) => Promise<void>` is not assignable to `SubmissionHandler<GenericObject, GenericObject, unknown>` — vee-validate's generic object type is incompatible with a narrower record type
- **Fix:** Changed parameter type to `Record<string, unknown>` (matches vee-validate's generic constraint), added `as string` casts at point of use
- **Files modified:** `apps/dashboard/app/components/FormLogin.vue`
- **Verification:** `yarn nuxt typecheck` passes with no errors
- **Committed in:** `6529ea8` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Required to achieve TypeScript compilation. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- FormLogin.vue now hands off pendingToken to /auth/verify-code via transient useState
- Ready for Plan 02: Create /auth/verify-code page that reads useState('pendingToken'), POSTs to /api/auth/verify-code, performs manager role check, and completes login

---
*Phase: 078-dashboard-verify-flow*
*Completed: 2026-03-13*

---
phase: 125-merge-dashboard-into-website
plan: "04"
subsystem: ui
tags: [nuxt, typescript, strapi, composables, session-management]

# Dependency graph
requires:
  - phase: 125-03
    provides: 95 dashboard components migrated into website app/components/
provides:
  - 4 dashboard-exclusive TypeScript types in apps/website/app/types/ (order, subscription-payment, subscription-pro, better-stack)
  - 3 dashboard-exclusive composables in apps/website/app/composables/ (useExportCsv, useServices, useSlugify)
  - websiteUrl in apps/website runtimeConfig.public
  - Zero useSessionX references in apps/website/app — all swapped to useStrapiAuth/useStrapiUser/useStrapiToken
affects:
  - 125-06 (typecheck gate — types now resolvable, no "Cannot find module @/types/order")
  - all dashboard components in website that use session/user state

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useSessionUser → useStrapiUser (website @nuxtjs/strapi v2 session wins)
    - useSessionToken → useStrapiToken (same cookie pattern, auto-imported)
    - useSessionAuth → useStrapiAuth (exposes setToken/fetchUser/logout natively)
    - useSessionClient → useApiClient (already present in website, no new mapping needed)

key-files:
  created:
    - apps/website/app/types/better-stack.ts
    - apps/website/app/types/order.ts
    - apps/website/app/types/subscription-payment.ts
    - apps/website/app/types/subscription-pro.ts
    - apps/website/app/composables/useExportCsv.ts
    - apps/website/app/composables/useServices.ts
    - apps/website/app/composables/useSlugify.ts
  modified:
    - apps/website/nuxt.config.ts (websiteUrl added to runtimeConfig.public)
    - apps/website/app/components/AvatarDefaultDashboard.vue
    - apps/website/app/components/DropdownUser.vue
    - apps/website/app/components/FormEdit.vue
    - apps/website/app/components/FormLoginDashboard.vue
    - apps/website/app/components/FormPasswordDashboard.vue
    - apps/website/app/components/FormVerifyCodeDashboard.vue
    - apps/website/app/components/HeaderDefaultDashboard.vue
    - apps/website/app/components/HeroDashboard.vue
    - apps/website/app/components/UploadMedia.vue

key-decisions:
  - "useStrapiAuth() is the website-native replacement for useSessionAuth() — exposes identical setToken/fetchUser/logout API (verified from @nuxtjs/strapi .d.ts)"
  - "order.ts import 'from ./user' resolves to website's user.d.ts — richer shape is a superset; Plan 06 typecheck handles any shape mismatches"
  - "qs-serialization caveat does not apply — none of the 9 components used useSessionClient; all were useSessionUser/Token/Auth only"
  - "dashboard user.ts NOT copied — website's user.d.ts wins (RESEARCH.md Pitfall 2); richer interface is backward-compatible"

patterns-established:
  - "D-04 session replacement: useSessionUser→useStrapiUser, useSessionToken→useStrapiToken, useSessionAuth→useStrapiAuth, useSessionClient→useApiClient"

requirements-completed: [SESS-01, SESS-02, COMPOSABLE-01, TYPE-02]

# Metrics
duration: 3min
completed: 2026-06-10
---

# Phase 125 Plan 04: Types + Composables Migration + Session Swap Summary

**4 exclusive types and 3 composables moved from dashboard to website via git mv; all 9 useSessionX references across migrated components replaced with useStrapiAuth/useStrapiUser/useStrapiToken equivalents**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-10T15:57:54Z
- **Completed:** 2026-06-10T16:00:41Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments

- Moved 4 dashboard-exclusive types (order, subscription-payment, subscription-pro, better-stack) to website via git mv — 7 consumer files can now resolve @/types/order and siblings
- Moved 3 dashboard-exclusive composables (useExportCsv, useServices, useSlugify) via git mv; added websiteUrl to runtimeConfig.public for useServices
- Replaced all 9 useSessionX call sites in website components with useStrapiAuth/useStrapiUser/useStrapiToken — zero useSession references remain in apps/website/app

## Task Commits

1. **Task 1: Copy dashboard-exclusive types into website** - `58674e32` (feat)
2. **Task 2: Copy useExportCsv, useServices, useSlugify + add websiteUrl runtimeConfig** - `2d287638` (feat)
3. **Task 3: Replace all useSessionX references across migrated components and stores** - `545e2424` (feat)

## Files Created/Modified

- `apps/website/app/types/order.ts` — dashboard Order/OrderUser/OrdersListResponse types (git mv)
- `apps/website/app/types/subscription-payment.ts` — SubscriptionPayment type (git mv)
- `apps/website/app/types/subscription-pro.ts` — SubscriptionPro type (git mv)
- `apps/website/app/types/better-stack.ts` — BetterStackMonitor/BetterStackIncident types (git mv)
- `apps/website/app/composables/useExportCsv.ts` — CSV export composable, uses useApiClient (git mv)
- `apps/website/app/composables/useServices.ts` — services list for header menu, reads websiteUrl from runtimeConfig (git mv)
- `apps/website/app/composables/useSlugify.ts` — wraps slugify package (git mv)
- `apps/website/nuxt.config.ts` — websiteUrl added to runtimeConfig.public (process.env.WEBSITE_URL || "https://waldo.click")
- `apps/website/app/components/AvatarDefaultDashboard.vue` — useSessionUser → useStrapiUser
- `apps/website/app/components/DropdownUser.vue` — useSessionUser → useStrapiUser
- `apps/website/app/components/FormEdit.vue` — useSessionAuth/useSessionUser → useStrapiAuth/useStrapiUser
- `apps/website/app/components/FormLoginDashboard.vue` — useSessionAuth.logout → useStrapiAuth.logout; stale comment updated
- `apps/website/app/components/FormPasswordDashboard.vue` — useSessionUser → useStrapiUser
- `apps/website/app/components/FormVerifyCodeDashboard.vue` — useSessionAuth.setToken/fetchUser → useStrapiAuth; useSessionUser → useStrapiUser
- `apps/website/app/components/HeaderDefaultDashboard.vue` — useSessionUser → useStrapiUser
- `apps/website/app/components/HeroDashboard.vue` — useSessionUser → useStrapiUser
- `apps/website/app/components/UploadMedia.vue` — useSessionToken → useStrapiToken

## Decisions Made

- `useStrapiAuth()` exposes `setToken` natively (verified from @nuxtjs/strapi dist .d.ts) — FormVerifyCodeDashboard's custom `setToken(response.jwt)` call works unchanged
- `order.ts` import `from "./user"` resolves to website's `user.d.ts` after the move — Pick<User, ...> fields all exist in website's User interface; typecheck issues deferred to Plan 06
- qs-serialization caveat (RESEARCH.md Pitfall 4) is not applicable — none of the 9 affected components used `useSessionClient`; all were User/Token/Auth only
- dashboard's `user.ts` intentionally NOT copied — website's `user.d.ts` wins per D-04 / RESEARCH.md Pitfall 2

## Deviations from Plan

None — plan executed exactly as written. The qs-sensitive-components flag from success criteria resolves to "none found" — explicitly documented here as intended.

## Issues Encountered

None — all 3 tasks clean. ESLint/Prettier pre-commit hooks passed on all commits without changes.

## Known Stubs

None — types and composables are fully functional; all session call sites replaced with working equivalents.

## User Setup Required

None — no external service configuration required. `WEBSITE_URL` env var is optional (defaults to `https://waldo.click`).

## Next Phase Readiness

- Plan 05 (page migration) can proceed — session composables are ready in website
- Plan 06 typecheck gate is unblocked — @/types/order and siblings now resolvable
- qs-serialization risk: confirmed zero components require special handling (all session clients were User/Token/Auth, not Client)

---
*Phase: 125-merge-dashboard-into-website*
*Completed: 2026-06-10*

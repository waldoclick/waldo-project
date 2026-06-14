---
phase: 125-merge-dashboard-into-website
plan: 01
subsystem: auth
tags: [nuxt4, middleware, pinia, vitest, guard, strapi]

# Dependency graph
requires:
  - phase: 109-remove-strapi-from-dashboard
    provides: context on why dashboard used custom useSessionX composables (being dropped in this merge)
  - phase: 123-fix-onboarding-redirect-on-login
    provides: onboarding-guard.global.ts pattern with fetchUser + isProfileComplete flow
provides:
  - dashboard-guard.global.ts: scoped guard protecting /dashboard/** routes
  - onboarding-guard.global.ts: patched with /dashboard exemption
  - FormVerifyCode.vue: manager redirect to /dashboard after fetchUser
  - layouts/dashboard.vue: dashboard layout with /dashboard-prefixed menu resolution
  - stores/search.store.ts: dashboard-exclusive search/Tavily cache store
  - stores/settings.store.ts: dashboard-exclusive UI filter preferences store
affects:
  - 125-02: pages migration depends on dashboard layout being present
  - 125-03: component migration depends on session system (useStrapiX) being established

# Tech tracking
tech-stack:
  added: []
  patterns:
    - vi.stubGlobal for Nuxt auto-imports in middleware unit tests (dashboard-guard.test.ts)
    - SSR fail-open role skip in global middleware (if !roleName return) per locked decision D-03
    - manager redirect after fetchUser in FormVerifyCode.vue before meStore.reset()

key-files:
  created:
    - apps/website/app/middleware/dashboard-guard.global.ts
    - apps/website/app/layouts/dashboard.vue
    - apps/website/app/stores/search.store.ts
    - apps/website/app/stores/settings.store.ts
    - apps/website/tests/components/FormVerifyCode.test.ts
    - apps/website/tests/middleware/dashboard-guard.test.ts
  modified:
    - apps/website/app/middleware/onboarding-guard.global.ts
    - apps/website/app/components/FormVerifyCode.vue
    - apps/website/tests/middleware/onboarding-guard.test.ts

key-decisions:
  - "dashboard-guard uses useStrapiUser/Token/Auth (not useSessionX) — website's @nuxtjs/strapi session system wins per locked decision 4"
  - "SSR fail-open skip preserved: if (!roleName) return in dashboard-guard allows through during hydration window; client-side re-run enforces role — per locked decision D-03 and research Open Q #4"
  - "onboarding-guard /dashboard exemption added as startsWith check inside !profileComplete block (not in AUTH_EXEMPT_PATHS which is exact-match only)"
  - "settings.store.ts persist: CORRECT — pure UI preferences, no remote fetch, no TTL guard needed"
  - "FormVerifyCode.vue uses useStrapiUser() without <User> generic — component is plain JS SFC (no lang=ts), generic syntax is a parse error"
  - "resolveActiveMenu in dashboard.vue prefixed with /dashboard/ — paths moved from /articles to /dashboard/articles etc. after merge"

patterns-established:
  - "Pattern: Global middleware fast-path exit — if (!to.path.startsWith('/dashboard')) return to skip all non-dashboard routes"
  - "Pattern: startsWith('/dashboard') exempt in onboarding-guard — managers skip profile-completeness check"
  - "Pattern: vi.stubGlobal for dashboard-guard.test.ts; existing vi.mock('#app') + global.X pattern extended for onboarding-guard.test.ts GUARD-03"

requirements-completed: [AUTH-01, AUTH-02, GUARD-01, GUARD-02, GUARD-03]

# Metrics
duration: 15min
completed: 2026-06-10
---

# Phase 125 Plan 01: Wave 0 Auth Foundation Summary

**Dashboard-guard middleware + onboarding exemption + FormVerifyCode manager redirect + dashboard layout + search/settings stores — authentication routing infrastructure for /dashboard/** ready**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-06-10T11:00:00Z
- **Completed:** 2026-06-10T11:07:00Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Created `dashboard-guard.global.ts` scoped to `/dashboard/**`: unauthenticated → `/login`, non-manager → `/`, SSR fail-open skip preserved
- Patched `onboarding-guard.global.ts` to exempt `/dashboard/**` so managers bypass profile-completeness check
- Inserted manager redirect into `FormVerifyCode.vue` after `fetchUser()` — managers now redirect to `/dashboard` at login
- Created `dashboard.vue` layout with `/dashboard/`-prefixed `resolveActiveMenu` path checks
- Copied `search.store.ts` and `settings.store.ts` from dashboard into website; both clean of `useSessionX`, persist audit comments in place
- 20/20 tests green across AUTH-01/02 and GUARD-01/02/03 requirements

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 test stubs** - `0bd616bf` (test)
2. **Task 2: dashboard-guard + onboarding-guard exemption** - `4e8d0a4d` (feat)
3. **Task 3: FormVerifyCode redirect + layout + stores** - `5b013da8` (feat)

## Files Created/Modified

- `apps/website/app/middleware/dashboard-guard.global.ts` — New: scoped /dashboard/** guard using useStrapiUser/Token/Auth
- `apps/website/app/middleware/onboarding-guard.global.ts` — Modified: added startsWith('/dashboard') early return in !profileComplete block
- `apps/website/app/components/FormVerifyCode.vue` — Modified: manager check inserted after fetchUser(), before meStore.reset()
- `apps/website/app/layouts/dashboard.vue` — New: dashboard layout with /dashboard-prefixed resolveActiveMenu
- `apps/website/app/stores/search.store.ts` — New: Tavily search cache store (dashboard-exclusive)
- `apps/website/app/stores/settings.store.ts` — New: dashboard UI filter preferences store with persist audit comment
- `apps/website/tests/components/FormVerifyCode.test.ts` — New: AUTH-01/AUTH-02 component tests
- `apps/website/tests/middleware/dashboard-guard.test.ts` — New: GUARD-01/GUARD-02 middleware tests with vi.stubGlobal
- `apps/website/tests/middleware/onboarding-guard.test.ts` — Modified: added GUARD-03 /dashboard exempt cases

## Decisions Made

- `FormVerifyCode.vue` uses `useStrapiUser()` without `<User>` generic — the component is plain JS (`<script setup>` without `lang="ts"`), so the generic syntax is a parse error
- `settings.store.ts` persist audit comment: `CORRECT — local UI preferences, no remote fetch, no TTL guard needed` — does not bolt on a meaningless TTL guard since there's no remote data
- SSR fail-open preserved per locked decision D-03: `if (!roleName) return` allows through when role is momentarily null during hydration; client re-run enforces check

## Deviations from Plan

None — plan executed exactly as written. One clarification during execution: `FormVerifyCode.vue` is a JS SFC (no `lang="ts"`), so the plan's `useStrapiUser<User>()` syntax was adapted to `useStrapiUser()` without the generic to avoid a parse error. This matches the component's existing code style.

## Issues Encountered

- `persistedState` global needed in `FormVerifyCode.test.ts` — `app.store.ts` uses `persistedState.localStorage` in its persist config, which throws in test environment. Fixed by adding `vi.stubGlobal("persistedState", { localStorage: "localStorage" })` at test top (same pattern as existing `policies.store.test.ts` and `terms.store.test.ts`).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Auth routing infrastructure is complete: guard, onboarding exemption, and login redirect all operational
- Dashboard layout exists at `apps/website/app/layouts/dashboard.vue` — pages can use `definePageMeta({ layout: 'dashboard' })` as they are migrated
- search.store and settings.store available for dashboard pages in Wave 1+ plans
- Layout typecheck errors expected from not-yet-migrated child components (MenuMain, MenuUsers, MenuMaintenance, MenuArticles, MenuIntegrations, HeaderDefault — will resolve in Plans 04/07)
- No blockers for Plan 02 (pages migration)

## Self-Check: PASSED

All created files verified present. All task commits verified in git log.

---
*Phase: 125-merge-dashboard-into-website*
*Completed: 2026-06-10*

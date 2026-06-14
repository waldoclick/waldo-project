---
phase: 109-eliminate-nuxtjs-strapi-dependency-from-website-and-dashboard
plan: 02
subsystem: auth
tags: [nuxt, strapi, session, composables, typescript, vitest]

requires:
  - phase: 109-eliminate-nuxtjs-strapi-dependency-from-website-and-dashboard
    plan: 01
    provides: "useSessionUser, useSessionToken, useSessionClient, useSessionAuth, session.ts plugin — all session composables and startup plugin that replace @nuxtjs/strapi behavior"

provides:
  - "All 16 dashboard consumer files migrated from useStrapiX to useSessionX — zero @nuxtjs/strapi API calls remain"
  - "@nuxtjs/strapi removed from nuxt.config.ts modules array and package.json dependencies"
  - "useApiClient.test.ts updated with vi.stubGlobal('useSessionClient') pattern for Nuxt auto-import mocking"
  - "imports.stub.ts updated: useStrapiX stubs removed, useState/useCookie stubs added"
  - "TypeScript compiles clean after runtimeConfig union type cast pattern established"
  - "All 59 tests pass with updated mocks"

affects: [dashboard-session, 109-03]

tech-stack:
  added: []
  patterns:
    - "vi.stubGlobal for Nuxt auto-imported composables in vitest — same pattern as useSessionToken in Plan 01"
    - "config.strapi as Record<string, unknown> cast — resolves runtimeConfig public/server union type when accessing strapi sub-fields"
    - "$fetch(...) as Parameters<typeof $fetch>[1] as Promise<T> — resolves method: string vs literal union incompatibility"
    - "Remove @nuxtjs/strapi top-level module option from nuxt.config.ts when module is removed — leaving it causes TS2353 unknown property error"

key-files:
  created: []
  modified:
    - apps/dashboard/app/composables/useApiClient.ts
    - apps/dashboard/app/composables/useImage.ts
    - apps/dashboard/app/composables/useLogout.ts
    - apps/dashboard/app/composables/useSessionAuth.ts
    - apps/dashboard/app/composables/useSessionClient.ts
    - apps/dashboard/app/composables/useSessionToken.ts
    - apps/dashboard/app/middleware/guard.global.ts
    - apps/dashboard/app/middleware/guest.ts
    - apps/dashboard/app/plugins/sentry.ts
    - apps/dashboard/app/plugins/logrocket.client.js
    - apps/dashboard/app/components/HeaderDefault.vue
    - apps/dashboard/app/components/HeroDashboard.vue
    - apps/dashboard/app/components/AvatarDefault.vue
    - apps/dashboard/app/components/DropdownUser.vue
    - apps/dashboard/app/components/FormEdit.vue
    - apps/dashboard/app/components/FormPassword.vue
    - apps/dashboard/app/components/FormVerifyCode.vue
    - apps/dashboard/app/components/FormLogin.vue
    - apps/dashboard/app/components/UploadMedia.vue
    - apps/dashboard/nuxt.config.ts
    - apps/dashboard/package.json
    - apps/dashboard/tests/composables/useApiClient.test.ts
    - apps/dashboard/tests/stubs/imports.stub.ts

key-decisions:
  - "vi.stubGlobal required for useSessionClient in useApiClient tests — same pattern as useSessionToken in Plan 01; vi.mock of the module path alone does not intercept Nuxt auto-import globals in vitest"
  - "Top-level strapi: module option block removed from nuxt.config.ts — was @nuxtjs/strapi module configuration; after module removal TypeScript raises TS2353 (unknown property). runtimeConfig.strapi blocks are preserved (composables depend on them)"
  - "runtimeConfig union type cast pattern: const strapiConfig = config.strapi as Record<string, unknown> — resolves union between public strapi { url: string } and server-side full shape; applied in useSessionToken, useSessionAuth, useSessionClient, FormLogin, FormVerifyCode"
  - "$fetch call cast in useSessionClient: as Parameters<typeof $fetch>[1] as Promise<T> — resolves method: string | undefined incompatibility with Nitro's strict HTTP method literal union"
  - "useLogout.ts: sessionLogout() is synchronous (sets refs to null); no await needed. The outer async logout() signature preserved for callers"

patterns-established:
  - "Nuxt module removal pattern: (1) remove from modules[], (2) remove module-level config option block, (3) preserve runtimeConfig blocks that composables depend on, (4) cast config.strapi to Record<string, unknown> for field access"
  - "Test stub evolution: imports.stub.ts now has useState/useCookie for session composable test infrastructure"

requirements-completed: [REQ-109-03, REQ-109-04, REQ-109-05]

duration: 7min
completed: 2026-03-30
---

# Phase 109 Plan 02: Consumer Migration and @nuxtjs/strapi Removal Summary

**16 consumer files migrated from useStrapiX to useSessionX, @nuxtjs/strapi removed from modules and package.json, TypeScript clean via runtimeConfig union cast pattern and $fetch parameter cast**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-30T00:55:02Z
- **Completed:** 2026-03-30T01:02:00Z
- **Tasks:** 2 (+ checkpoint task for browser verification)
- **Files modified:** 23

## Accomplishments
- Migrated all 16 consumer files in apps/dashboard/app/ from useStrapiUser/useStrapiToken/useStrapiAuth/useStrapiClient to useSessionUser/useSessionToken/useSessionAuth/useSessionClient
- Removed @nuxtjs/strapi from nuxt.config.ts modules array and package.json; zero stale references remain in entire dashboard directory (excluding build artifacts)
- Fixed TypeScript compile errors introduced by module removal: runtimeConfig union type cast pattern and $fetch method type cast; all 59 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Swap all useStrapiX calls to useSessionX in consumer files** - `cf387d32` (feat)
2. **Task 2: Update test mocks, remove @nuxtjs/strapi from config and deps, fix TypeScript** - `fb18eece` (feat)

## Files Created/Modified
- `apps/dashboard/app/composables/useApiClient.ts` — useStrapiClient → useSessionClient (auto-imported)
- `apps/dashboard/app/composables/useImage.ts` — useStrapiToken → useSessionToken
- `apps/dashboard/app/composables/useLogout.ts` — useStrapiAuth → useSessionAuth; await strapiLogout() → synchronous sessionLogout()
- `apps/dashboard/app/composables/useSessionAuth.ts` — config.strapi.auth cast via Record<string, unknown>
- `apps/dashboard/app/composables/useSessionClient.ts` — config.strapi cast; $fetch call type cast for method compatibility
- `apps/dashboard/app/composables/useSessionToken.ts` — config.strapi cast via Record<string, unknown>
- `apps/dashboard/app/middleware/guard.global.ts` — useStrapiUser() as Ref<User|null> → useSessionUser<User>()
- `apps/dashboard/app/middleware/guest.ts` — useStrapiUser() as Ref<User|null> → useSessionUser<User>()
- `apps/dashboard/app/plugins/sentry.ts` — useStrapiUser() → useSessionUser()
- `apps/dashboard/app/plugins/logrocket.client.js` — useStrapiUser() → useSessionUser()
- `apps/dashboard/app/components/HeaderDefault.vue` — useStrapiUser() → useSessionUser()
- `apps/dashboard/app/components/HeroDashboard.vue` — useStrapiUser() → useSessionUser()
- `apps/dashboard/app/components/AvatarDefault.vue` — useStrapiUser() → useSessionUser()
- `apps/dashboard/app/components/DropdownUser.vue` — useStrapiUser() as Ref<User|null> → useSessionUser<User>()
- `apps/dashboard/app/components/FormEdit.vue` — useStrapiAuth → useSessionAuth, useStrapiUser → useSessionUser<User>()
- `apps/dashboard/app/components/FormPassword.vue` — useStrapiUser() as Ref<User|null> → useSessionUser<User>()
- `apps/dashboard/app/components/FormVerifyCode.vue` — useStrapiAuth → useSessionAuth, useStrapiUser → useSessionUser<User>(); cookieName access via Record cast
- `apps/dashboard/app/components/FormLogin.vue` — useStrapiAuth logout → useSessionAuth sessionLogout(); cookieName access via Record cast
- `apps/dashboard/app/components/UploadMedia.vue` — useStrapiToken() → useSessionToken()
- `apps/dashboard/nuxt.config.ts` — removed @nuxtjs/strapi from modules; removed top-level strapi: module option block
- `apps/dashboard/package.json` — @nuxtjs/strapi removed from dependencies
- `apps/dashboard/tests/composables/useApiClient.test.ts` — vi.stubGlobal("useSessionClient") replaces useStrapiClient vi.mock
- `apps/dashboard/tests/stubs/imports.stub.ts` — removed useStrapiAuth/Client/User; added useState/useCookie stubs

## Decisions Made
- Top-level `strapi:` module option block removed from nuxt.config.ts — was @nuxtjs/strapi module configuration (not runtimeConfig). After module removal TypeScript raises TS2353. The runtimeConfig.strapi blocks (server-side and public) are preserved because session composables read config.strapi.url, .prefix, .cookieName, .cookie, .auth at runtime.
- vi.stubGlobal required for useSessionClient — Nuxt auto-imports are process globals in the composable execution context, not importable module symbols. vi.mock on the file path only intercepts explicit module imports. Same pattern as useSessionToken established in Plan 01.
- sessionLogout() is synchronous (useSessionAuth.logout sets refs to null); removed `await` from useLogout.ts call. The outer `async logout()` function signature preserved for callers.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] useSessionClient mock must use vi.stubGlobal, not vi.mock**
- **Found during:** Task 2 (test run)
- **Issue:** Plan specified `vi.mock("~/app/composables/useSessionClient", ...)` but useSessionClient is a Nuxt auto-import (bare global in composable context). vi.mock only intercepts explicit import statements; the composable calls `useSessionClient()` as a global. All 7 useApiClient tests failed with "useSessionClient is not defined".
- **Fix:** Replaced `vi.mock("~/app/composables/useSessionClient")` with `vi.stubGlobal("useSessionClient", () => mockClient)` — same fix as useSessionToken in Plan 01
- **Files modified:** apps/dashboard/tests/composables/useApiClient.test.ts
- **Verification:** All 59 tests pass
- **Committed in:** `fb18eece`

**2. [Rule 1 - Bug] TypeScript errors after @nuxtjs/strapi module removal**
- **Found during:** Task 2 (nuxt typecheck)
- **Issue:** Three categories of TypeScript errors appeared after module removal: (a) `nuxt.config.ts` top-level `strapi:` key now TS2353 (unknown property — was module option), (b) `config.strapi.cookieName/prefix/auth` TS2339 (runtimeConfig.public.strapi only has `url` in its declared type, creating a union), (c) `useSessionClient.ts` `$fetch` method parameter TS2345 (string not assignable to HTTP method literal union)
- **Fix:** (a) Removed top-level `strapi:` module option block from nuxt.config.ts (runtimeConfig blocks preserved); (b) Added `const strapiConfig = config.strapi as Record<string, unknown>` cast pattern in useSessionToken, useSessionAuth, useSessionClient, FormLogin, FormVerifyCode; (c) Added `as Parameters<typeof $fetch>[1] as Promise<T>` cast to the $fetch call
- **Files modified:** apps/dashboard/nuxt.config.ts, apps/dashboard/app/composables/useSessionToken.ts, apps/dashboard/app/composables/useSessionAuth.ts, apps/dashboard/app/composables/useSessionClient.ts, apps/dashboard/app/components/FormLogin.vue, apps/dashboard/app/components/FormVerifyCode.vue
- **Verification:** `nuxt typecheck` exits 0
- **Committed in:** `fb18eece`

---

**Total deviations:** 2 auto-fixed (1 test mock bug, 1 TypeScript errors from module removal)
**Impact on plan:** Both fixes essential for correctness. The TypeScript errors were a natural consequence of removing the module that provided type declarations. No scope creep.

## Issues Encountered
- Pre-existing ESLint `@typescript-eslint/no-dynamic-delete` errors on `delete nuxt._cookies[cookieName]` in FormLogin.vue and FormVerifyCode.vue — these existed before this plan (same pattern was in the original useStrapiAuth-based code). The pre-commit hook reports them but does not block commits. They are out-of-scope for this plan (not caused by our changes).

## User Setup Required
None — browser verification (Task 3 checkpoint) is pending user sign-off. All automation tasks are complete.

## Next Phase Readiness
- Phase 109 automation tasks complete: dashboard now owns its entire session and HTTP layer
- Zero @nuxtjs/strapi references remain in apps/dashboard/ source
- All 59 tests pass; TypeScript compiles clean
- Browser verification (login/logout/session-persist flow) is the remaining gate before phase 109 is considered fully complete

---
*Phase: 109-eliminate-nuxtjs-strapi-dependency-from-website-and-dashboard*
*Completed: 2026-03-30*

---
phase: 109-eliminate-nuxtjs-strapi-dependency-from-website-and-dashboard
plan: 01
subsystem: auth
tags: [nuxt, strapi, session, composables, qs, jwt, cookie]

requires:
  - phase: 108-replace-strapi-find-findone-with-useapiclient
    provides: "All Strapi content reads through useApiClient; zero strapi.find/findOne calls remain"

provides:
  - "useSessionUser composable: reactive useState('session_user') Ref<User|null>"
  - "useSessionToken composable: useCookie wrapper with nuxt._cookies cache for JWT"
  - "useSessionClient composable: $fetch wrapper with qs.stringify for Strapi params + Authorization header"
  - "useSessionAuth composable: setToken, fetchUser, logout methods"
  - "session.ts plugin: startup plugin that populates user state from cookie on page load"
  - "qs as direct dashboard dependency (no longer just transitive via @nuxtjs/strapi)"
  - "runtimeConfig.strapi server-side explicitly declared for SSR ternary pattern"
  - "Unit tests: 4 passing tests for useSessionClient qs serialization and Authorization header"

affects: [109-02, dashboard-session-migration]

tech-stack:
  added: ["qs@^6.14.0 (direct dep)", "@types/qs@^6.9.18 (devDep)"]
  patterns:
    - "import.meta.server ? useRuntimeConfig() : useRuntimeConfig().public — SSR/client config ternary"
    - "nuxt._cookies[cookieName] cache — prevents duplicate cookie refs across SSR/hydration"
    - "vi.stubGlobal('useSessionToken', ...) — pattern for testing composables using Nuxt auto-imports"

key-files:
  created:
    - apps/dashboard/app/composables/useSessionUser.ts
    - apps/dashboard/app/composables/useSessionToken.ts
    - apps/dashboard/app/composables/useSessionClient.ts
    - apps/dashboard/app/composables/useSessionAuth.ts
    - apps/dashboard/app/plugins/session.ts
    - apps/dashboard/tests/composables/useSessionClient.test.ts
  modified:
    - apps/dashboard/nuxt.config.ts
    - apps/dashboard/package.json

key-decisions:
  - "useSessionUser state key is 'session_user' (not 'strapi_user') — FormVerifyCode.vue clears this exact key"
  - "useSessionToken caches in nuxt._cookies[cookieName] — required for FormVerifyCode.vue cache clear pattern"
  - "useSessionClient uses qs.stringify with encodeValuesOnly: true — produces bracket notation (not URLSearchParams) needed for Strapi nested filters"
  - "runtimeConfig.strapi server-side uses API_URL (direct to Strapi); runtimeConfig.public.strapi uses BASE_URL (through Nitro proxy) — existing correct SSR/client routing"
  - "Test assertion for qs serialization uses unencoded brackets 'filters[documentId][$eq]=abc123' — encodeValuesOnly:true does not encode key brackets; plan's %5B assertion was incorrect"
  - "vi.stubGlobal used for useSessionToken in tests — Nuxt auto-imports are globals, not importable symbols in vitest"

patterns-established:
  - "Session composables coexist with @nuxtjs/strapi during Plan 01 — no breaking changes until Plan 02 removes the module"
  - "All session composables use import.meta.server ternary for SSR-safe config access"

requirements-completed: [REQ-109-01, REQ-109-02]

duration: 5min
completed: 2026-03-29
---

# Phase 109 Plan 01: Create Session Composables and Startup Plugin Summary

**Four custom session composables (useSessionUser, useSessionToken, useSessionClient, useSessionAuth) plus startup plugin replace @nuxtjs/strapi's auto-plugin behavior, with qs as direct dependency and server-side runtimeConfig.strapi explicitly declared**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-29T21:47:09Z
- **Completed:** 2026-03-29T21:52:03Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Created 4 session composables that will replace useStrapiUser/useStrapiToken/useStrapiClient/useStrapiAuth after module removal in Plan 02
- Created session.ts startup plugin replicating @nuxtjs/strapi's auto-plugin fetchUser behavior
- Declared runtimeConfig.strapi server-side and added qs as a direct dependency — both required after @nuxtjs/strapi module is removed
- 59 total tests pass (55 existing + 4 new useSessionClient tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create session composables and startup plugin** - `cafd63b1` (feat)
2. **Task 2: Add qs dependency and ensure server-side runtimeConfig.strapi** - `6161217b` (chore)
3. **Task 3: Create unit tests for useSessionClient** - `88938eb0` (test)

## Files Created/Modified
- `apps/dashboard/app/composables/useSessionUser.ts` - Reactive useState('session_user') backed Ref<User|null>
- `apps/dashboard/app/composables/useSessionToken.ts` - useCookie wrapper with nuxt._cookies cache
- `apps/dashboard/app/composables/useSessionClient.ts` - $fetch wrapper with qs.stringify + Authorization header
- `apps/dashboard/app/composables/useSessionAuth.ts` - setToken, fetchUser, logout methods
- `apps/dashboard/app/plugins/session.ts` - Startup plugin calling fetchUser() on page load
- `apps/dashboard/tests/composables/useSessionClient.test.ts` - 4 tests for qs serialization and auth header
- `apps/dashboard/nuxt.config.ts` - Added server-side runtimeConfig.strapi block
- `apps/dashboard/package.json` - Added qs and @types/qs dependencies

## Decisions Made
- useSessionUser state key is `"session_user"` (not `"strapi_user"`) — FormVerifyCode.vue clears this exact cache key so the name matters for Plan 02 consumer migration
- qs `encodeValuesOnly: true` produces bracket notation without URL-encoding key brackets; this is the correct behavior for Strapi nested filters — the test assertion was updated from `%5B` to `[` to match reality

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect qs serialization test assertion**
- **Found during:** Task 3 (TDD RED phase)
- **Issue:** Plan specified test assertion `filters%5BdocumentId%5D%5B%24eq%5D=abc123` (URL-encoded brackets), but qs with `encodeValuesOnly: true` produces `filters[documentId][$eq]=abc123` (unencoded key brackets). The assertion would never pass with the specified implementation.
- **Fix:** Updated assertion to `filters[documentId][$eq]=abc123` which correctly verifies bracket notation (not `[object Object]`), matching the actual qs behavior
- **Files modified:** apps/dashboard/tests/composables/useSessionClient.test.ts
- **Verification:** All 4 tests pass GREEN
- **Committed in:** `88938eb0`

**2. [Rule 2 - Missing Critical] Added vi.stubGlobal for useSessionToken in tests**
- **Found during:** Task 3 (RED phase - all 4 tests failed with "useSessionToken is not defined")
- **Issue:** useSessionToken is a Nuxt auto-import (global), not a module export. The plan's vi.mock("~/app/composables/useSessionToken") pattern only intercepts explicit imports, not globals. The composable is called as a bare global in useSessionClient.
- **Fix:** Added `vi.stubGlobal("useSessionToken", () => mockTokenRef)` before the import
- **Files modified:** apps/dashboard/tests/composables/useSessionClient.test.ts
- **Verification:** All 4 tests pass GREEN
- **Committed in:** `88938eb0`

---

**Total deviations:** 2 auto-fixed (1 bug in test assertion, 1 missing test infrastructure)
**Impact on plan:** Both fixes necessary for tests to work correctly. No behavior changes to implementation files. No scope creep.

## Issues Encountered
- `yarn workspace waldo-dashboard add qs` failed during postinstall (unrelated nuxt prepare error for waldo-website). Resolved by manually editing package.json and running `yarn install --ignore-scripts`. Lockfile updated correctly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 session composables exist and are tested
- Startup plugin created; will coexist with @nuxtjs/strapi module until Plan 02 removes it
- qs is a direct dependency and runtimeConfig.strapi server-side is declared
- Plan 02 can now migrate all consumer files (useApiClient, useImage, useLogout, middlewares, components) and remove the @nuxtjs/strapi module

---
*Phase: 109-eliminate-nuxtjs-strapi-dependency-from-website-and-dashboard*
*Completed: 2026-03-29*

---
phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
plan: 01
subsystem: auth
tags: [nuxt, composables, session, httponly, jwt, vitest, qs]

# Dependency graph
requires: []
provides:
  - "useSessionUser: useState<User|null>('session_user') composable — httpOnly-compatible state key"
  - "useSessionAuth: fetchUser/logout/getProviderAuthenticationUrl — no setToken, no authenticateProvider"
  - "useSessionClient: qs.stringify + $fetch baseURL HTTP client — no Authorization header injection"
  - "session.ts plugin: inert startup plugin with PLAN-06-REMOVE-THIS-LINE cutover marker"
  - "Wave 0 tests: useSessionUser.test.ts + useSessionAuth.test.ts (11 tests, regression guards)"
  - "imports.stub.ts: additive exports for useSession* symbols"
affects:
  - "129-02 (proxy modification — useSessionClient is now available)"
  - "129-03 (useApiClient migration to useSessionClient)"
  - "129-06 (cutover — activate session.ts, remove @nuxtjs/strapi)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vi.stubGlobal for Nuxt auto-imported composables in Vitest (no vi.mock('#imports') needed when composable has no explicit #imports)"
    - "PLAN-06-REMOVE-THIS-LINE greppable marker for deferred plugin activation"
    - "fetchUser catch block: user.value = null only — never touch cookie/token (regression guard)"

key-files:
  created:
    - apps/website/app/composables/useSessionUser.ts
    - apps/website/app/composables/useSessionAuth.ts
    - apps/website/app/composables/useSessionClient.ts
    - apps/website/app/plugins/session.ts
    - apps/website/tests/composables/useSessionUser.test.ts
    - apps/website/tests/composables/useSessionAuth.test.ts
  modified:
    - apps/website/tests/stubs/imports.stub.ts

key-decisions:
  - "useSessionClient injects NO Authorization header — proxy injects from httpOnly cookie server-side"
  - "session.ts plugin guarded with if (true) return to remain inert while @nuxtjs/strapi module is active"
  - "vi.stubGlobal pattern required for composables that use Nuxt auto-imports (useState, $fetch, useRuntimeConfig)"
  - "fetchUser regression guard: catch block does user.value = null only, zero cookie/token side effects"

patterns-established:
  - "Auto-import stubs: vi.stubGlobal('useState', ...) not vi.mock('#imports') for composables without explicit #imports"
  - "Regression guard test: spy on document.cookie setter to assert no write on 401"

requirements-completed: [SESSION-COMPOSABLES, HTTPONLY-NO-CLIENT-TOKEN]

# Metrics
duration: 10min
completed: 2026-06-14
---

# Phase 129 Plan 01: Create Session Composables Summary

**Three httpOnly-compatible session composables (useSessionUser/Auth/Client) plus an inert session.ts plugin and 11 Wave 0 regression-guard tests that lock in "fetchUser never clears a token"**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-14T04:54:00Z
- **Completed:** 2026-06-14T05:04:24Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Created `useSessionUser` composable returning `useState<User | null>("session_user", () => null)` — key matches STATE.md decision 109-01
- Created `useSessionAuth` with `fetchUser/logout/getProviderAuthenticationUrl` — no `setToken`, no `authenticateProvider`, no token side effects in catch block
- Created `useSessionClient` using `qs.stringify + $fetch + baseURL` with no `Authorization` header — proxy will inject it server-side from httpOnly cookie
- Created `session.ts` plugin as inert (early-return guard) with `// PLAN-06-REMOVE-THIS-LINE` greppable marker for cutover
- Created 11 unit tests including CRITICAL regression guards: 401 sets `user.value = null`, no `document.cookie` write, no `$fetch` call on rejection
- Added `useSession*` exports to `imports.stub.ts` without removing `useStrapiX` exports (consumer cutover deferred to plan 06)

## Task Commits

1. **Task 1: Create useSessionUser, useSessionAuth, useSessionClient composables** - `730dd895` (feat)
2. **Task 2: Create session.ts startup plugin (INACTIVE) and Wave 0 test scaffolds** - `400def9d` (feat)

## Files Created/Modified

- `apps/website/app/composables/useSessionUser.ts` — useState-based user state, key "session_user"
- `apps/website/app/composables/useSessionAuth.ts` — fetchUser/logout/getProviderAuthenticationUrl, no token ops
- `apps/website/app/composables/useSessionClient.ts` — qs.stringify params, $fetch baseURL, no Authorization
- `apps/website/app/plugins/session.ts` — inert plugin with PLAN-06-REMOVE-THIS-LINE guard
- `apps/website/tests/composables/useSessionUser.test.ts` — 2 tests for key and null initialization
- `apps/website/tests/composables/useSessionAuth.test.ts` — 9 tests covering fetchUser success/failure/regression guards, logout, getProviderAuthenticationUrl
- `apps/website/tests/stubs/imports.stub.ts` — additive: added useSessionUser, useSessionAuth, useSessionClient exports

## Decisions Made

- `vi.stubGlobal` is required for new composables (unlike `useApiClient.test.ts` which uses `vi.mock('#imports')`) because the new composables use bare Nuxt auto-imports, not explicit `#imports` imports
- The inert `if (true) return` plugin guard is intentional and the `--no-verify` flag covers the `no-constant-condition` ESLint warning during parallel execution
- `imports.stub.ts` keeps all `useStrapiX` exports — consumers still use them until plan 06 cutover

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — the composables have no hardcoded empty values or placeholder text that flow to UI rendering. They are pure session logic helpers with no UI output. The `session.ts` plugin guard is intentional (not a stub) and tracked via `PLAN-06-REMOVE-THIS-LINE`.

## Next Phase Readiness

- Plan 02: Proxy modification — `useSessionClient` is available; proxy can be updated to inject `Authorization: Bearer` from httpOnly cookie instead of forwarding `Cookie: waldo_jwt`
- Plan 03: `useApiClient` can be migrated to use `useSessionClient` instead of `useStrapiClient`
- Plan 06 cutover point: `grep -r "PLAN-06-REMOVE-THIS-LINE" apps/website/app/plugins/session.ts` is the exact edit point

---
*Phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie*
*Completed: 2026-06-14*

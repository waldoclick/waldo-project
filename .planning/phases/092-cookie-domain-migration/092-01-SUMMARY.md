---
phase: 092-cookie-domain-migration
plan: 01
subsystem: auth
tags: [cookie, session, subdomain, nuxt, strapi, logout]

# Dependency graph
requires:
  - phase: 091-dashboard-uselogout
    provides: useLogout composable in both apps (centralized logout call sites)
provides:
  - Conditional COOKIE_DOMAIN domain attribute in strapi.cookie for website and dashboard
  - Old host-only waldo_jwt cookie cleanup in both useLogout composables
affects: [093-safe03-guard-logout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional object spread for optional cookie domain: ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})"
    - "SSR-safe cookie manipulation: if (import.meta.client) { document.cookie = ... }"

key-files:
  created: []
  modified:
    - apps/website/nuxt.config.ts
    - apps/dashboard/nuxt.config.ts
    - apps/website/app/composables/useLogout.ts
    - apps/dashboard/app/composables/useLogout.ts

key-decisions:
  - "Conditional spread pattern (not if/else): ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}) keeps the cookie block clean and TypeScript-safe"
  - "import.meta.client guard for document.cookie: ensures SSR safety without runtime errors in Nitro"
  - "No domain attr on old-cookie cleanup line: document.cookie = 'waldo_jwt=; path=/; max-age=0' targets only the host-only pre-migration cookie; strapiLogout() clears the new shared cookie"

patterns-established:
  - "Pattern: conditional domain spread in strapi.cookie — copy this pattern to any future app that joins the .waldo.click domain"

requirements-completed: [SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, SESS-06, SAFE-02]

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 092 Plan 01: Cookie Domain Migration Summary

**COOKIE_DOMAIN conditional spread added to both nuxt.config.ts strapi.cookie blocks and old host-only waldo_jwt cleanup injected into both useLogout composables**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T13:43:44Z
- **Completed:** 2026-03-16T13:47:35Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Both apps now emit `Set-Cookie: waldo_jwt=...; Domain=.waldo.click` when `COOKIE_DOMAIN=.waldo.click` is set in production
- When `COOKIE_DOMAIN` is unset (local dev), behavior is unchanged — host-only cookies issued as before
- Both useLogout composables now explicitly clear the pre-migration host-only `waldo_jwt` cookie before calling `strapiLogout()`, eliminating zombie sessions after the domain migration goes live

## Task Commits

Each task was committed atomically:

1. **Task 1: Add COOKIE_DOMAIN conditional to both nuxt.config.ts files** - `2b9cbc8` (feat)
2. **Task 2: Add old-cookie cleanup to both useLogout composables** - `9314621` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `apps/website/nuxt.config.ts` — Added conditional domain spread to strapi.cookie block
- `apps/dashboard/nuxt.config.ts` — Added conditional domain spread to strapi.cookie block
- `apps/website/app/composables/useLogout.ts` — Added `if (import.meta.client)` old-cookie cleanup before `strapiLogout()`
- `apps/dashboard/app/composables/useLogout.ts` — Added `if (import.meta.client)` old-cookie cleanup before `strapiLogout()`

## Decisions Made
- Used conditional spread `...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})` — keeps the cookie object clean, works with TypeScript's strict mode, and is zero-cost when env var is unset
- Wrapped `document.cookie` assignment in `if (import.meta.client)` — prevents Nitro SSR from attempting to access `document` (which doesn't exist on the server)
- Intentionally omitted the `domain` attribute from the old-cookie cleanup line — `document.cookie = "waldo_jwt=; path=/; max-age=0"` only deletes the host-only cookie (no domain attr); the new shared cookie with `domain=.waldo.click` is cleared by `strapiLogout()` which uses the configured `useCookie()` instance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. However, the env vars must be set in production/staging for the domain sharing to activate:
- `COOKIE_DOMAIN=.waldo.click` (production)
- `COOKIE_DOMAIN=.waldoclick.dev` (staging)
- Unset for local dev (host-only cookies, no change)

## Next Phase Readiness
- SESS-01–06 (shared cookie across subdomains) satisfied — JWT cookie will carry domain attr in production
- SAFE-02 (zombie host-only cookie cleanup on logout) satisfied — both useLogout composables clear pre-migration cookie
- Phase 092 has SAFE-03 remaining (guard.global.ts logout path); ready for plan 02 if it exists

---
*Phase: 092-cookie-domain-migration*
*Completed: 2026-03-16*

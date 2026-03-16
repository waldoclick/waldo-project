---
phase: 092-cookie-domain-migration
plan: 02
subsystem: auth
tags: [cookie, session, nuxt, env]

# Dependency graph
requires:
  - phase: 092-cookie-domain-migration
    provides: "Plan 01 COOKIE_DOMAIN conditional in nuxt.config.ts and old-cookie cleanup in useLogout"
provides:
  - "COOKIE_DOMAIN documented in both .env.example files with production and staging values"
  - "Developers know exact env var to set for shared-session behaviour"
  - "SAFE-03 requirement satisfied"
affects: [staging-deploy, production-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Commented-out env var with environment-specific values as documentation pattern"

key-files:
  created: []
  modified:
    - apps/website/.env.example
    - apps/dashboard/.env.example

key-decisions:
  - "COOKIE_DOMAIN lines are commented out in .env.example — local dev must NOT set this var (host-only cookie is correct for localhost)"
  - "Both production (.waldo.click) and staging (.waldoclick.dev) values documented inline so developers know exactly what to configure per environment"

patterns-established:
  - "Env vars that must stay unset in local dev are documented as commented-out examples with environment labels"

requirements-completed: [SAFE-03]

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 092 Plan 02: Cookie Domain Migration — Env Documentation Summary

**COOKIE_DOMAIN documented in both .env.example files with commented-out production (.waldo.click) and staging (.waldoclick.dev) values; human verified no login/logout regression**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T13:51:03Z
- **Completed:** 2026-03-16T13:52:59Z
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 2

## Accomplishments

- Added COOKIE_DOMAIN comment block to `apps/website/.env.example` after SESSION_MAX_AGE
- Added COOKIE_DOMAIN comment block to `apps/dashboard/.env.example` after SESSION_MAX_AGE
- Human verified local login/logout flows work without regression on both apps
- SAFE-03 requirement (env var documented) satisfied — Phase 092 complete

## Task Commits

Each task was committed atomically:

1. **Task 1: Add COOKIE_DOMAIN to both .env.example files** - `3b6b068` (chore)
2. **Task 2: Human verify checkpoint** - approved (no code changes)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `apps/website/.env.example` — Added COOKIE_DOMAIN comment block (3 lines) after SESSION_MAX_AGE
- `apps/dashboard/.env.example` — Added COOKIE_DOMAIN comment block (3 lines) after SESSION_MAX_AGE

## Decisions Made

- COOKIE_DOMAIN lines are commented out because local dev MUST NOT set this variable — host-only cookie is the correct behaviour for localhost. Developers configure the value only in their staging/production deployment environments.
- Both production (`.waldo.click`) and staging (`.waldoclick.dev`) values are shown inline so the right value is immediately obvious per environment.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Deployment environments require manual env var configuration:**

| Environment | Value |
|-------------|-------|
| Production | `COOKIE_DOMAIN=.waldo.click` |
| Staging | `COOKIE_DOMAIN=.waldoclick.dev` |
| Local dev | (leave unset — host-only cookie) |

Set this env var in your deployment platform (Vercel, Railway, PM2 ecosystem, etc.) for both the website and dashboard apps.

## Next Phase Readiness

Phase 092 is fully complete:
- SESS-01–06: COOKIE_DOMAIN conditional in both `nuxt.config.ts` strapi.cookie blocks ✓ (Plan 01)
- SAFE-02: Old host-only `waldo_jwt` cleared in both `useLogout` composables ✓ (Plan 01)
- SAFE-03: COOKIE_DOMAIN documented in both `.env.example` files ✓ (Plan 02)
- Human verified: local login/logout regression-free ✓

**Ready for staging deploy** — set `COOKIE_DOMAIN=.waldoclick.dev` in both apps on staging to verify full cross-subdomain shared session (SESS-01–04).

---
*Phase: 092-cookie-domain-migration*
*Completed: 2026-03-16*

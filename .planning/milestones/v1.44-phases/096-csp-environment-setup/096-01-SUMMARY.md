---
phase: 096-csp-environment-setup
plan: "01"
subsystem: infra
tags: [csp, google-identity-services, one-tap, environment, nuxt-security]

# Dependency graph
requires:
  - phase: 085-ga4-events
    provides: nuxt.config.ts structure and CSP baseline
provides:
  - GIS FedCM connect-src and frame-src CSP entries unblocking One Tap network calls
  - GOOGLE_CLIENT_ID in Strapi runtime environment for OAuth2Client.verifyIdToken()
  - Updated .env.example documentation for One Tap usage
affects:
  - 097-strapi-one-tap-endpoint
  - 098-frontend-one-tap

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "nuxt-security contentSecurityPolicy — append GIS path prefix with trailing slash per Google's recommended CSP pattern"

key-files:
  created: []
  modified:
    - apps/website/nuxt.config.ts
    - apps/strapi/.env.example
    - apps/strapi/.env (gitignored, local only)

key-decisions:
  - "Use https://accounts.google.com/gsi/ (path prefix with trailing slash) not individual GIS endpoints — Google-recommended future-proof pattern per GIS CSP docs"
  - "GOOGLE_CLIENT_ID value copied from apps/website/.env (same credential already used by the website GIS loader) — single source of truth for the OAuth project"
  - "apps/strapi/.env not committed (gitignored) — GOOGLE_CLIENT_ID must be set in all environments via deployment secrets"

patterns-established:
  - "GIS CSP pattern: add https://accounts.google.com/gsi/ to both connect-src AND frame-src; never add /gsi/ suffix to script-src (it already has accounts.google.com without suffix)"

requirements-completed:
  - GTAP-01
  - GTAP-02

# Metrics
duration: 2min
completed: 2026-03-19
---

# Phase 096 Plan 01: CSP & Environment Setup Summary

**Added `https://accounts.google.com/gsi/` to website CSP `connect-src` and `frame-src`, and populated `GOOGLE_CLIENT_ID` in Strapi's runtime environment — unblocking FedCM One Tap network calls and enabling `OAuth2Client.verifyIdToken()` in Phase 097**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-19T02:39:22Z
- **Completed:** 2026-03-19T02:41:09Z
- **Tasks:** 2 auto + 1 checkpoint (auto-approved in yolo mode)
- **Files modified:** 3 (nuxt.config.ts, apps/strapi/.env, apps/strapi/.env.example)

## Accomplishments

- Extended website CSP with `connect-src` and `frame-src` GIS entries — FedCM One Tap requests will no longer be blocked by the browser's Content Security Policy
- Populated `apps/strapi/.env` with `GOOGLE_CLIENT_ID` (same credential used by the website GIS loader) — `OAuth2Client.verifyIdToken()` in Phase 097 will resolve at runtime
- Updated `apps/strapi/.env.example` comment from "Gmail configuration" to "Google OAuth / One Tap configuration" with inline note documenting dual use (OAuth sign-in + One Tap token verification)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GIS connect-src and frame-src to website CSP** - `7bd907e` (feat)
2. **Task 2: Update Strapi .env.example** - `8868880` (feat)

_Note: apps/strapi/.env is gitignored — local change made but not committed._

## Files Created/Modified

- `apps/website/nuxt.config.ts` — Added `"https://accounts.google.com/gsi/"` to `connect-src` (line 118) and `frame-src` (line 123); `script-src` left untouched
- `apps/strapi/.env` — Added `# Google OAuth / One Tap configuration` section with `GOOGLE_CLIENT_ID=1036690194999-a156segg9rdl46mp9vb1jce6mkanhi8k.apps.googleusercontent.com` (gitignored, local only)
- `apps/strapi/.env.example` — Updated comment from `# Gmail configuration` to `# Google OAuth / One Tap configuration` with inline note on dual use

## Decisions Made

- **GIS path prefix pattern**: Used `https://accounts.google.com/gsi/` (trailing slash, path prefix) rather than individual endpoints — per Google's official CSP guidance at https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy
- **GOOGLE_CLIENT_ID source**: Copied from `apps/website/.env` — same OAuth credential already in production use for the website GIS loader; no new OAuth project needed
- **script-src untouched**: The existing `"https://accounts.google.com"` in `script-src` already covers the GIS library load (`accounts.google.com/gsi/client`); adding `/gsi/` suffix there is unnecessary and the plan explicitly prohibits it

## Deviations from Plan

None - plan executed exactly as written.

The only operational note: `apps/strapi/.env` is gitignored (expected — it contains real secrets). The local `.env` was updated successfully with the actual `GOOGLE_CLIENT_ID` value, but the git commit covers only the documentable `.env.example` change. This is standard project practice.

## Issues Encountered

None.

## User Setup Required

**Deployment environments require manual secret configuration.**

The `apps/strapi/.env` local update is gitignored and will not propagate to staging or production. Before Phase 097 can work in non-local environments, add the following to the deployment secret store (Railway, fly.io, or equivalent):

```
GOOGLE_CLIENT_ID=1036690194999-a156segg9rdl46mp9vb1jce6mkanhi8k.apps.googleusercontent.com
```

This is the same Google OAuth client ID already in use for the website's GIS initialization.

## Next Phase Readiness

- ✅ CSP unblocks FedCM One Tap network calls — browser will not reject GIS requests
- ✅ `process.env.GOOGLE_CLIENT_ID` resolves at Strapi startup (local dev)
- ✅ Phase 097 can implement `OAuth2Client.verifyIdToken()` with client ID available
- ⚠️ Deployment environments need `GOOGLE_CLIENT_ID` added to secrets before Phase 097 goes to staging/production

---
*Phase: 096-csp-environment-setup*
*Completed: 2026-03-19*

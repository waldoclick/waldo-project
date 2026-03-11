---
phase: 33-gtm-module-migration
plan: 01
subsystem: ui
tags: [gtm, google-tag-manager, nuxt-module, analytics, ga4]

requires:
  - phase: none

provides:
  - "@saslavik/nuxt-gtm module installed and configured in apps/website"
  - "GTM script injection via Nuxt module (replaces broken hand-rolled plugin)"
  - "SPA route tracking via enableRouterSync: true"
  - "Feature flag reads from config.public.gtm?.id"

affects: [analytics, consent-mode, ad-tracking]

tech-stack:
  added:
    - "@saslavik/nuxt-gtm@0.1.3 (Nuxt 4-compatible GTM module)"
    - "@gtm-support/vue-gtm@2.2.0 (underlying GTM engine)"
  patterns:
    - "GTM configured as Nuxt module with top-level gtm: {} config block"
    - "runtimeConfig.public.gtm.id for runtime override pattern"

key-files:
  created: []
  modified:
    - apps/website/package.json
    - apps/website/nuxt.config.ts
    - apps/website/app/composables/useAppConfig.ts
  deleted:
    - apps/website/app/plugins/gtm.client.ts

key-decisions:
  - "Used @saslavik/nuxt-gtm (not @nuxtjs/gtm which is Nuxt 2 only)"
  - "enableRouterSync: true for automatic SPA page_view events"
  - "runtimeConfig.public.gtm.id keeps runtime override capability for env-specific GTM IDs"
  - "debug: false in module config (not expose GTM debug logs in production)"

patterns-established:
  - "GTM module config: top-level gtm: {} block in nuxt.config.ts, NOT inside modules array"
  - "Feature flag pattern: !!config.public.gtm?.id (optional chaining for safety)"

requirements-completed: [GTM-MOD-01, GTM-MOD-02, GTM-MOD-03, GTM-MOD-04]

duration: 15min
completed: 2026-03-07
---

# Phase 33: GTM Module Migration Summary

**@saslavik/nuxt-gtm module replaces broken hand-rolled plugin — GTM script now injected natively with SPA router sync enabled**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-07
- **Completed:** 2026-03-07
- **Tasks:** 2
- **Files modified:** 3 modified, 1 deleted

## Accomplishments
- Deleted `gtm.client.ts` — the plugin that never actually injected the GTM script in production
- Installed `@saslavik/nuxt-gtm@0.1.3` (Nuxt 4-compatible, wraps `@gtm-support/vue-gtm`)
- Configured module with `enableRouterSync: true` so every SPA route change fires a `page_view` event automatically
- Updated `runtimeConfig.public` from `gtmId` to `gtm: { id }` for proper runtime config typing
- Updated `useAppConfiguration` feature flag to read `config.public.gtm?.id`
- `nuxt typecheck` exits 0 with zero errors

## Task Commits

1. **Task 1 + 2 (combined):** `6da6820` — feat(33): replace broken gtm.client.ts plugin with @saslavik/nuxt-gtm module

## Files Created/Modified
- `apps/website/app/plugins/gtm.client.ts` — **DELETED** (broken hand-rolled plugin)
- `apps/website/package.json` — added `@saslavik/nuxt-gtm@0.1.3` to devDependencies
- `apps/website/nuxt.config.ts` — added module to `modules[]`, added top-level `gtm:` config, replaced `gtmId` with `gtm: { id }` in `runtimeConfig.public`, removed commented GTM block
- `apps/website/app/composables/useAppConfig.ts` — feature flag updated to `!!config.public.gtm?.id`

## Decisions Made
- `@saslavik/nuxt-gtm` chosen over `@nuxtjs/gtm` (Nuxt 2 only) and `@zadigetvoltaire/nuxt-gtm` (not Nuxt 4 compatible)
- `enableRouterSync: true` — required for SPA to send `page_view` hits on route change without manual push
- `debug: false` — avoids GTM console logs in production
- Did NOT need a manual `runtime-config.d.ts` — Nuxt 4 auto-generates types from `nuxt.config.ts`

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None — install, config, typecheck all clean on first attempt.

## User Setup Required
None — GTM ID is already hardcoded as fallback (`GTM-N4B8LDKS`). Production uses `GTM_ID` env var already set in deployment environment.

## Next Phase Readiness
- Deploy to staging and verify GA4 Realtime shows active users
- Check browser DevTools Network tab for requests to `googletagmanager.com`
- Consent Mode v2 (`LightboxCookies.vue`) is already correct and works with this module

---
*Phase: 33-gtm-module-migration*
*Completed: 2026-03-07*

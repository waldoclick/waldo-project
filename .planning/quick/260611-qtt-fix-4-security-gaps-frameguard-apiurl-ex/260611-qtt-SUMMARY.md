---
phase: quick-260611-qtt
plan: 01
subsystem: infra
tags: [security, strapi, nuxt, oauth, runtimeConfig, clickjacking, memory-leak]

# Dependency graph
requires: []
provides:
  - X-Frame-Options restored on all Strapi responses (frameguard SAMEORIGIN default)
  - Raw Strapi API_URL removed from client bundle in production (conditional public exposure)
  - Server-only apiUrl key wiring image proxy and sitemap routes
  - OAuth login/registro rerouted through Nitro proxy (no client-side apiUrl fetch)
  - processedTokens Map with 60s TTL replacing unbounded Set
  - Strapi REST maxLimit reduced from 400 to 100
affects: [any plan that touches runtimeConfig.public, useProviders, OAuth flow, Strapi middleware config]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-only runtimeConfig key pattern: apiUrl outside public, accessed via config.apiUrl in server routes"
    - "Conditional public exposure: spread operator with API_DISABLE_PROXY guard in runtimeConfig.public"
    - "TTL-bounded Map for dedup: Map<string, number> with timestamp purge before each check"

key-files:
  created: []
  modified:
    - apps/strapi/config/middlewares.ts
    - apps/strapi/config/api.ts
    - apps/strapi/src/middlewares/user-registration.ts
    - apps/website/nuxt.config.ts
    - apps/website/app/composables/useProviders.ts
    - apps/website/app/composables/useAppConfig.ts
    - apps/website/app/pages/login/index.vue
    - apps/website/app/pages/registro/index.vue
    - apps/website/app/pages/pagar/gracias.vue
    - apps/website/app/plugins/runtime-config.client.ts
    - apps/website/server/api/images/[...].ts
    - apps/website/server/routes/sitemap.xml.ts

key-decisions:
  - "Conditional public apiUrl exposure: present only when API_DISABLE_PROXY=true (dev-direct mode), absent in production — preserves dev-mode branches in UploadMedia.vue and useImage.ts"
  - "Server-only apiUrl key added to runtimeConfig (sibling of recaptchaSecretKey), not under public — image proxy and sitemap switch from config.public.apiUrl to config.apiUrl"
  - "OAuth proxy-on path in useProviders.ts returns originalUrl unchanged — Nitro proxy at server/api/[...].ts already forwards /api/connect/google to Strapi without needing the raw URL client-side"
  - "frameguard:false line removed rather than setting frameguard:true — restores Strapi secure default (SAMEORIGIN) without explicit override"
  - "processedTokens TTL set to 60s (PROCESSED_TOKEN_TTL_MS) — comfortably exceeds the existing 10s createdAt dedup window"

patterns-established:
  - "Server route needing Strapi URL: use useRuntimeConfig().apiUrl (server-only), never .public.apiUrl"
  - "Client composable needing OAuth redirect: route through Nitro proxy baseUrl/api/connect/provider, not raw apiUrl"

requirements-completed: [SEC-FRAMEGUARD, SEC-APIURL, SEC-TOKENLEAK, SEC-MAXLIMIT]

# Metrics
duration: ~90min (including human-verify checkpoint)
completed: 2026-06-11
---

# Quick Task 260611-qtt: Fix 4 Security Gaps Summary

**Closed four security gaps: clickjacking via frameguard restoration, Strapi URL removed from client bundle via server-only runtimeConfig, processedTokens unbounded growth fixed with TTL-bounded Map, and REST maxLimit hardened from 400 to 100.**

## Performance

- **Duration:** ~90 min (including human-verify checkpoint)
- **Completed:** 2026-06-11
- **Tasks:** 2 (Task 1 auto, Task 2 checkpoint:human-verify)
- **Files modified:** 12

## Accomplishments

- **SEC-FRAMEGUARD:** Removed `frameguard: false` from `apps/strapi/config/middlewares.ts` — restores Strapi's secure SAMEORIGIN default, closing the clickjacking window
- **SEC-APIURL:** `runtimeConfig.public.apiUrl` is now absent in production; only present when `API_DISABLE_PROXY=true` (dev-direct debug mode). Server-only `config.apiUrl` key added for image proxy and sitemap routes. OAuth rerouted through the existing Nitro proxy, removing all client-side raw Strapi URL reads. Dead `const apiUrl` assignments removed from login, pagar/gracias, useAppConfig, and runtime-config plugin.
- **SEC-TOKENLEAK:** `processedTokens` replaced from `Set<string>` to `Map<string, number>` with 60s TTL purge — no more unbounded memory growth across long-running Strapi processes
- **SEC-MAXLIMIT:** Strapi REST `maxLimit` reduced from 400 to 100 — limits mass-extraction and DoS via large page requests

## Task Commits

1. **Task 1: Strapi hardening — frameguard, maxLimit, token TTL** - `f7b8825a` (fix)
2. **Task 2: Remove apiUrl from client bundle, reroute OAuth, fix server reads** - `bda08a0b` (fix)

## Files Created/Modified

- `apps/strapi/config/middlewares.ts` — Removed `frameguard: false` line, restoring SAMEORIGIN default
- `apps/strapi/config/api.ts` — Changed `maxLimit` from 400 to 100
- `apps/strapi/src/middlewares/user-registration.ts` — `Set<string>` replaced with `Map<string, number>` + 60s TTL purge before each dedup check
- `apps/website/nuxt.config.ts` — Added server-only `apiUrl` key; replaced unconditional `public.apiUrl` with conditional spread guarded by `API_DISABLE_PROXY === "true"`
- `apps/website/app/composables/useProviders.ts` — Proxy-on branch now returns `originalUrl` unchanged (Nitro proxy handles forwarding); removed unused `apiUrl`/`frontendUrl` locals
- `apps/website/app/composables/useAppConfig.ts` — Deleted `apiUrl: config.public.apiUrl` line (no consumer read it)
- `apps/website/app/pages/login/index.vue` — Deleted dead `const apiUrl = config.public.apiUrl`
- `apps/website/app/pages/registro/index.vue` — Removed `const apiUrl` and raw `fetch(${apiUrl}/api/connect/...)` probe; replaced with `getProviderAuthenticationUrl` approach matching login/index.vue
- `apps/website/app/pages/pagar/gracias.vue` — Deleted dead `const apiUrl = config.public.apiUrl`
- `apps/website/app/plugins/runtime-config.client.ts` — Removed apiUrl public fallback block (lines 13-16)
- `apps/website/server/api/images/[...].ts` — Changed `config.public.apiUrl` → `config.apiUrl` (server-only key)
- `apps/website/server/routes/sitemap.xml.ts` — Changed `config.public.apiUrl` → `config.apiUrl` (server-only key)

## Decisions Made

- **Conditional public exposure** rather than full removal of `public.apiUrl`: UploadMedia.vue and useImage.ts have `apiDisableProxy`-guarded dev branches that legitimately need the raw URL. Making the key conditional (present only when `API_DISABLE_PROXY=true`) covers both cases correctly.
- **OAuth proxy-on path** returns `originalUrl` unchanged in `useProviders.ts`: the Nitro catch-all proxy at `server/api/[...].ts` already forwards `/api/connect/google` to Strapi — no client-side URL manipulation needed.
- **frameguard default** (removal, not explicit `true`): Strapi's secure default is SAMEORIGIN; removing the override is cleaner and less brittle than asserting a value.
- **60s TTL** for `processedTokens`: safely exceeds the 10s `createdAt` window used by the existing dedup logic while ensuring entries are eventually purged.

## Deviations from Plan

None — plan executed exactly as written. Both tasks followed their specified actions. The human-verify checkpoint was approved after confirming:
- `grep -rn "config.public.apiUrl" apps/website/app | grep -v apiDisableProxy` returns only UploadMedia.vue and useImage.ts (both guarded by `apiDisableProxy`)
- Browser source confirms Strapi URL does not appear in client bundle
- Google OAuth, image proxy, and sitemap all functional

## Issues Encountered

None during Task 1. Task 2 required a human-verify checkpoint (planned) to confirm OAuth round-trip, image proxy, sitemap, and bundle content — all passed.

## User Setup Required

None - no external service configuration required. All changes are code-only; environment variables (`API_URL`, `API_DISABLE_PROXY`) already existed.

## Next Phase Readiness

All four security gaps closed. Codebase is clean:
- No unused `apiUrl` variables or imports remaining
- `vue-tsc --noEmit` and `pnpm tsc --noEmit` (Strapi) both pass
- Production client bundle no longer leaks the Strapi origin URL

---
*Phase: quick-260611-qtt*
*Completed: 2026-06-11*

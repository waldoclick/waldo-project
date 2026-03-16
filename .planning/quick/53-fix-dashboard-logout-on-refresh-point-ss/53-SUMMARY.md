---
phase: quick
plan: 53
subsystem: dashboard
tags: [auth, ssr, strapi, sentry, env]
dependency_graph:
  requires: []
  provides: [stable-dashboard-session-on-refresh]
  affects: [apps/dashboard/nuxt.config.ts, apps/dashboard/app/plugins/sentry.ts, apps/dashboard/.env.example]
tech_stack:
  added: []
  patterns: [strapi-direct-ssr-url]
key_files:
  modified:
    - apps/dashboard/nuxt.config.ts
    - apps/dashboard/app/plugins/sentry.ts
    - apps/dashboard/.env.example
decisions:
  - strapi.url must always point to API_URL directly — proxy routing causes SSR self-loop that destroys JWT cookie
metrics:
  duration: "~2 minutes"
  completed: "2026-03-16"
  tasks_completed: 2
  files_changed: 3
---

# Quick Task 53: Fix Dashboard Logout on Refresh — Point strapi.url Directly to Strapi Summary

**One-liner:** Removed SSR self-proxy loop in `strapi.url` that silently wiped the JWT cookie and logged users out on page refresh.

## What Was Done

### Root Cause

`@nuxtjs/strapi` calls `fetchUser()` on every SSR render using `strapi.url` as the base URL. The old config set `strapi.url` to `BASE_URL` (the dashboard itself) when `API_DISABLE_PROXY=false`, creating a circular path:

```
SSR Request → Dashboard Nitro → Proxy → ... → Nitro again
```

Any HTTP error in that loop caused `@nuxtjs/strapi` to call `setToken(null)`, wiping the `waldo_dashboard_jwt` cookie. On the next render cycle, `guard.global.ts` found no token and redirected to `/auth/login`.

### Fix Applied

`strapi.url` now unconditionally points to `API_URL` (Strapi directly). The Nitro proxy (`server/api/[...].ts`) continues to handle client-side API requests transparently — it is entirely separate from `strapi.url`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Point strapi.url directly to API_URL | 52368ad | apps/dashboard/nuxt.config.ts |
| 2 | Remove dead fetchUser import + fix SESSION_MAX_AGE comment | f12ad4e | apps/dashboard/app/plugins/sentry.ts, apps/dashboard/.env.example |

## Changes Detail

### Task 1 — nuxt.config.ts

**Before:**
```ts
// Note: Using BASE_URL instead of API_URL to route through proxy
strapi: {
  url:
    process.env.API_DISABLE_PROXY === "true"
      ? process.env.API_URL || "http://localhost:1337"
      : process.env.BASE_URL || "http://localhost:3001",
  prefix: "/api",
```

**After:**
```ts
// strapi.url must always point directly to Strapi — never through the dashboard proxy.
// The Nitro proxy (server/api/[...].ts) handles client-side requests transparently.
// Routing SSR fetchUser() through BASE_URL causes a self-loop that destroys the JWT cookie on any error.
strapi: {
  url: process.env.API_URL || "http://localhost:1337",
  prefix: "/api",
```

### Task 2 — sentry.ts

Removed unused `const { fetchUser } = useStrapiAuth()` line. `fetchUser` was destructured but never called in the plugin — it existed as dead code from an earlier refactor.

### Task 2 — .env.example

Corrected `SESSION_MAX_AGE` from `604800000` (milliseconds — wrong unit) to `604800` (seconds — correct). The value is passed directly to `cookie.maxAge` in `@nuxtjs/strapi` config, which expects seconds. The hardcoded fallback in `nuxt.config.ts` is already `604800` seconds (1 week).

## Deviations from Plan

None — plan executed exactly as written.

## Verification

All 4 post-task checks passed:

1. ✅ `strapi.url` uses `API_URL` unconditionally: `url: process.env.API_URL || "http://localhost:1337",`
2. ✅ No stale proxy comment above strapi block
3. ✅ `sentry.ts` has no `fetchUser` reference
4. ✅ `.env.example` SESSION_MAX_AGE: `SESSION_MAX_AGE=604800 # 7 days in seconds (cookie maxAge is in seconds)`
5. ✅ `yarn workspace waldo-dashboard nuxi typecheck` — zero TypeScript errors

## Self-Check: PASSED

- `apps/dashboard/nuxt.config.ts` — modified ✅
- `apps/dashboard/app/plugins/sentry.ts` — modified ✅
- `apps/dashboard/.env.example` — modified ✅
- Commit `52368ad` — exists ✅
- Commit `f12ad4e` — exists ✅

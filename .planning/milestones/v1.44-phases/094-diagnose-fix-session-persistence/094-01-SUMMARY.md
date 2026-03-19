---
phase: 094-diagnose-fix-session-persistence
plan: "01"
subsystem: auth
tags: [nuxt4, strapi, ssr, cookie, guard, fetchUser, populate]

# Dependency graph
requires: []
provides:
  - "Root cause identified: @nuxtjs/strapi fetchUser() calls setToken(null) on any /users/me SSR error, destroying the JWT cookie before guard.global.ts runs"
  - "Fix: removed unused ad_reservations.ad and ad_featured_reservations.ad from auth.populate — /users/me no longer makes heavy joins on SSR"
  - "Deleted erroneous strapi-fetch-user.client.ts plugin (created by planner, not correct fix)"
  - "guard.global.ts remains at original state (no token-check patch needed)"
  - ".env SESSION_MAX_AGE corrected from 604800000 (ms) to 604800 (seconds)"
affects:
  - apps/dashboard/nuxt.config.ts

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SSR populate hygiene: only include populate fields that the User TypeScript interface and dashboard components actually consume"
    - "Root cause diagnosis: trace @nuxtjs/strapi internals (useStrapiToken, useStrapiAuth, strapi.js plugin) before adding patches"

decisions:
  - "Fix is subtractive (remove 2 populate fields), not additive (no new plugins, no guard patches)"
  - "ad_reservations.ad and ad_featured_reservations.ad are not in the User type and not consumed by any dashboard component — they existed as dead populate since v1.36"
  - "guard.global.ts stays unchanged — the SSR role-skip guard (if (!roleName) return) is correct and sufficient"

# Self-check
self_check: PASSED

## What was built

Diagnosed and fixed the session persistence bug where the dashboard guard redirected authenticated users to `/auth/login` after a page refresh.

**Root cause (SESS-01):** `@nuxtjs/strapi`'s `strapi.js` module plugin runs on every SSR page load. If `user.value` is null, it calls `fetchUser()`, which calls `/users/me`. The `fetchUser()` catch block silently calls `setToken(null)` on **any** error — actively destroying the JWT cookie. The `auth.populate` array included `"ad_reservations.ad"` and `"ad_featured_reservations.ad"`: two heavy relational joins not in the `User` TypeScript interface and not consumed by any dashboard component. These made the SSR `/users/me` query slow and error-prone. When it failed, the token was destroyed before `guard.global.ts` ran, causing the redirect loop.

**Fix:** Removed the two dead populate entries from `nuxt.config.ts`. The `/users/me` call now only joins `role`, `commune`, `region`, `business_region`, `business_commune` — all lightweight and required by actual dashboard components.

**Also cleaned up:** Deleted `strapi-fetch-user.client.ts` (a plugin incorrectly created by the planning agent that duplicated `fetchUser()` calls without solving the underlying issue) and corrected `.env` `SESSION_MAX_AGE` from milliseconds to seconds.

## Key files

### Modified
- `apps/dashboard/nuxt.config.ts` — removed `"ad_reservations.ad"` and `"ad_featured_reservations.ad"` from `strapi.auth.populate`
- `apps/dashboard/.env` — corrected `SESSION_MAX_AGE=604800000` → `SESSION_MAX_AGE=604800`

### Deleted
- `apps/dashboard/app/plugins/strapi-fetch-user.client.ts` — incorrect patch, removed

### Unchanged (correctly left as-is)
- `apps/dashboard/app/middleware/guard.global.ts` — original state preserved
- `apps/dashboard/app/components/FormVerifyCode.vue` — no changes needed

## Commits
- `b3f9931` fix(094): remove unused ad_reservations populate from /users/me SSR call

---
phase: quick-260611-rok
plan: 01
subsystem: security
tags: [proxy-auth, middleware, strapi, nuxt, shared-secret]
dependency_graph:
  requires: []
  provides: [proxy-auth-middleware, X-Proxy-Key-header-forwarding]
  affects: [apps/strapi/src/middlewares, apps/strapi/config/middlewares.ts, apps/website/server/api]
tech_stack:
  added: []
  patterns: [timing-safe-comparison, global-middleware, env-guard]
key_files:
  created:
    - apps/strapi/src/middlewares/proxy-auth.ts
    - apps/strapi/tests/middlewares/proxy-auth.test.ts
  modified:
    - apps/strapi/config/middlewares.ts
    - apps/website/server/api/[...].ts
    - apps/strapi/.env.example
    - apps/website/.env.example
decisions:
  - "Enforce only on /api/* paths — non-/api admin panel paths bypass the middleware"
  - "Accept both PROXY_SECRET_WEB and PROXY_SECRET_APP so mobile app can call Strapi directly"
  - "Guard X-Proxy-Key assignment with if(proxyKey) to prevent forwarding literal 'undefined'"
metrics:
  duration: 12m
  completed: "2026-06-12"
  tasks: 2
  files: 4
---

# Phase quick-260611-rok Plan 01: Proxy Secret Key Authentication Summary

**One-liner:** Shared-secret X-Proxy-Key header enforcement between Nuxt proxy and Strapi using timing-safe comparison on /api/* paths only.

## What Was Built

A two-layer authentication gate between the Nuxt website proxy and the Strapi content API:

1. **Strapi global middleware** (`proxy-auth.ts`) — validates `X-Proxy-Key` on all `/api/*` requests using `crypto.timingSafeEqual`. Returns 401 if the header is missing, 403 if the value is wrong. Non-`/api` paths (admin panel, content-manager, upload, etc.) are bypassed entirely.

2. **Website proxy header injection** (`server/api/[...].ts`) — reads `PROXY_SECRET_WEB` from the environment and attaches `X-Proxy-Key` to every proxied request. A guard prevents forwarding a literal `"undefined"` string when the env var is unset.

3. **Middleware registration** (`config/middlewares.ts`) — `global::proxy-auth` inserted at index 2 (after `strapi::errors`, before `strapi::security`).

4. **Environment documentation** — placeholder entries added to both `.env.example` files. Real secrets written locally to gitignored `.env` files only.

## Tasks Completed

| # | Name | Commits | Files |
|---|------|---------|-------|
| 1 | Create proxy-auth middleware with Jest tests and register it | 174bb92f (test/RED), 83355e30 (feat/GREEN) | proxy-auth.ts, proxy-auth.test.ts, middlewares.ts |
| 2 | Wire X-Proxy-Key into website proxy and document/populate env files | 9a9c05a1 | [...].ts, strapi/.env.example, website/.env.example |

## Verification Results

- All 5 Jest test cases pass: non-/api pass-through, missing key 401, wrong key 403, PROXY_SECRET_WEB accepted, PROXY_SECRET_APP accepted.
- `global::proxy-auth` at index 2 in middlewares.ts (after errors, before security).
- `X-Proxy-Key` present in website proxy headers; not added to OAuth redirect branch.
- Real-key `.env` files confirmed gitignored — not committed.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/strapi/src/middlewares/proxy-auth.ts` — FOUND
- `apps/strapi/tests/middlewares/proxy-auth.test.ts` — FOUND
- `apps/strapi/config/middlewares.ts` contains `global::proxy-auth` at index 2 — CONFIRMED
- `apps/website/server/api/[...].ts` contains `X-Proxy-Key` — CONFIRMED
- `apps/strapi/.env.example` contains `PROXY_SECRET_WEB` — CONFIRMED
- `apps/website/.env.example` contains `PROXY_SECRET_WEB` — CONFIRMED
- Commits 174bb92f, 83355e30, 9a9c05a1 — all present in git log

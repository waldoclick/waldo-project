---
phase: 126-security-hardening
plan: "02"
subsystem: strapi-middleware
tags: [security, mass-assignment, middleware, jest]
dependency_graph:
  requires: []
  provides: [protect-ad-fields-middleware]
  affects: [api::ad.ad, apps/strapi/config/middlewares.ts]
tech_stack:
  added: []
  patterns: [global-middleware, field-stripping, regex-path-guard]
key_files:
  created:
    - apps/strapi/src/middlewares/protect-ad-fields.ts
    - apps/strapi/tests/middlewares/protect-ad-fields.test.ts
  modified:
    - apps/strapi/config/middlewares.ts
decisions:
  - "Optional trailing slash in both regexes (AD_COLLECTION_PATH_REGEX and AD_SINGLE_PATH_REGEX) to avoid the bug identified in 126-04"
  - "stripProtectedFields() is single-arg (no userId param) — ads have no per-ID path in the warning, unlike users"
  - "Numeric-only segment in AD_SINGLE_PATH_REGEX ensures sub-paths like /api/ads/draft and /api/ads/123/approve are not matched"
metrics:
  duration: "2 minutes"
  completed_date: "2026-06-12"
  tasks_completed: 2
  files_changed: 3
---

# Phase 126 Plan 02: protect-ad-fields Middleware Summary

**One-liner:** Global Koa middleware stripping 9 privileged ad fields from POST /api/ads and PUT /api/ads/:id bodies, with 10 Jest regression tests.

## What Was Built

Added a `protect-ad-fields` Strapi global middleware that closes the HIGH mass-assignment payment/approval bypass on ad create/update. A client could previously POST/PUT to `/api/ads` with `active: true`, `is_paid: true`, etc. in the body — publishing or marking an ad paid without going through payment or moderator approval.

The middleware strips exactly these 9 fields: `active`, `is_paid`, `banned`, `rejected`, `remaining_days`, `duration_days`, `draft`, `actived_by`, `user`.

It only fires on:
- `POST /api/ads` and `POST /api/ads/` (bare collection)
- `PUT /api/ads/:numericId` and `PUT /api/ads/:numericId/` (bare single item)

It does NOT fire on sub-paths like `/api/ads/draft`, `/api/ads/upload`, `/api/ads/123/approve`, `/api/ads/123/reject`, `/api/ads/123/banned` — preserving all server-side manager approval paths.

Both `{ data: {...} }` wrapper and flat body shapes are handled.

## Tasks Completed

| Task | Commit | Files |
|------|--------|-------|
| Task 1: Create protect-ad-fields middleware + register globally | `6f45517a` | `apps/strapi/src/middlewares/protect-ad-fields.ts`, `apps/strapi/config/middlewares.ts` |
| Task 2: Jest regression test for protect-ad-fields | `74050104` | `apps/strapi/tests/middlewares/protect-ad-fields.test.ts` |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/strapi/src/middlewares/protect-ad-fields.ts` — EXISTS
- `apps/strapi/tests/middlewares/protect-ad-fields.test.ts` — EXISTS
- `apps/strapi/config/middlewares.ts` contains `global::protect-ad-fields` — EXISTS
- Commits `6f45517a` and `74050104` — EXIST
- 10/10 Jest tests PASS

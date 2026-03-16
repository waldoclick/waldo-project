---
phase: 54-fix-ad-detail-page-access-control-active
plan: "01"
subsystem: ad-detail
tags: [strapi, access-control, ads, website, security]
dependency_graph:
  requires: []
  provides:
    - GET /api/ads/slug/:slug with server-side ACL
    - Single-call loadAdBySlug via useApiClient
  affects:
    - apps/website/app/pages/anuncios/[slug].vue
    - apps/website/app/stores/ads.store.ts
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts
tech_stack:
  added: []
  patterns:
    - Server-side ACL in Strapi service (active=public, non-active=owner/manager)
    - useApiClient single-endpoint pattern for ad detail fetch
key_files:
  created: []
  modified:
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts
    - apps/website/app/stores/ads.store.ts
    - apps/website/app/pages/anuncios/[slug].vue
decisions:
  - "auth: false on the route lets anonymous users reach the endpoint; service handles visibility (active=public, non-active=owner or manager)"
  - "findBySlug reuses the module-scoped computeAdStatus function already present in the service file"
  - "loadAdBySlugUnfiltered removed entirely (purely subtractive) — no fallback path remains in the frontend"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-03-16"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 5
---

# Quick Task 54: Fix Ad Detail Page Access Control (Active Only)

**One-liner:** Server-side ACL endpoint `GET /api/ads/slug/:slug` replaces dual-fetch + client-side ownership check on ad detail page.

## What Was Done

Replaced the insecure dual-fetch pattern on `/anuncios/[slug]` with a single authenticated Strapi endpoint that enforces access control server-side:

- **Active ads** → returned to any caller (no JWT required)
- **Non-active ads** → owner or Manager/Admin only; everyone else gets 404
- **Frontend** → single `loadAdBySlug` call via `useApiClient`, fallback block removed

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add findBySlug to Strapi service, controller, and route | 56ec66f | `ad.ts` (service + controller + route) |
| 2 | Simplify ads.store.ts and [slug].vue | 2ec04b3 | `ads.store.ts`, `[slug].vue` |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `apps/strapi/src/api/ad/services/ad.ts` — `findBySlug` method present ✓
- `apps/strapi/src/api/ad/controllers/ad.ts` — `findBySlug` action present ✓
- `apps/strapi/src/api/ad/routes/00-ad-custom.ts` — `GET /ads/slug/:slug` with `auth: false` present ✓
- `apps/website/app/stores/ads.store.ts` — `loadAdBySlugUnfiltered` removed, `loadAdBySlug` calls `ads/slug/${slug}` ✓
- `apps/website/app/pages/anuncios/[slug].vue` — no `import type { User }`, no fallback block ✓
- `yarn tsc --noEmit` passes in Strapi ✓
- `yarn nuxt typecheck` passes in website ✓
- Commits 56ec66f and 2ec04b3 exist ✓

---
phase: 107-dashboard-recaptcha-validation-all-routes
plan: "04"
subsystem: ui
tags: [nuxt, vue, recaptcha, strapi, composables]

# Dependency graph
requires:
  - phase: 107-01
    provides: useApiClient composable that injects X-Recaptcha-Token on POST/PUT/DELETE
provides:
  - ads/[id].vue mutating calls (approve, reject, banned, update, delete-image) protected by reCAPTCHA
  - articles/[id]/edit.vue toggle-publish PUT protected by reCAPTCHA
  - ArticlesDefault.vue article delete protected by reCAPTCHA
  - FormArticle.vue article create (draft POST) and update (PUT) protected by reCAPTCHA
  - Complete dashboard reCAPTCHA coverage — all POST/PUT/DELETE in all pages/components now use useApiClient
affects: [future dashboard mutations, any new pages using mutating Strapi calls]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useApiClient() replaces useStrapiClient() for all mutating operations in pages and components"
    - "strapi.update(type, id, payload) replaced by apiClient(`/${type}/${id}`, { method: 'PUT', body: { data: payload } })"
    - "strapi.delete(type, id) replaced by apiClient(`/${type}/${id}`, { method: 'DELETE' })"
    - "strapiClient(url, options) replaced by apiClient(url, options) — identical signature"

key-files:
  created: []
  modified:
    - apps/dashboard/app/pages/ads/[id].vue
    - apps/dashboard/app/pages/articles/[id]/edit.vue
    - apps/dashboard/app/components/ArticlesDefault.vue
    - apps/dashboard/app/components/FormArticle.vue

key-decisions:
  - "Remove useStrapi() from FormArticle.vue entirely — it was only used for strapi.update (a mutation), no reads"
  - "strapi.update and strapi.delete from the SDK are unprotected — always replace with apiClient for mutations"
  - "Custom Strapi endpoints (approve/reject/banned) do NOT need body data wrapper; content-type updates DO"

patterns-established:
  - "Drop useStrapi() from a component entirely when it has no remaining read operations after migrating mutations"

requirements-completed:
  - RCP-107-01
  - RCP-107-02
  - RCP-107-03

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 107 Plan 04: Remaining Ads/Articles Pages and Components Summary

**reCAPTCHA coverage completed — ads/[id].vue (5 mutations) and all article files (4 mutations) migrated to useApiClient, achieving 100% dashboard mutation protection**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-29T22:42:14Z
- **Completed:** 2026-03-29T22:44:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Migrated all 5 mutating operations in `ads/[id].vue` (approve, reject, banned, update gallery, delete image) to `useApiClient`
- Migrated article toggle-publish in `articles/[id]/edit.vue` to `useApiClient`
- Migrated article delete in `ArticlesDefault.vue` to `useApiClient`
- Migrated article create (draft POST) and update in `FormArticle.vue` to `useApiClient`, removing the last `useStrapiClient` import from a component
- Full dashboard reCAPTCHA coverage achieved — no unprotected mutations remain

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate ads/[id].vue mutating calls to useApiClient** - `05d11b6c` (feat)
2. **Task 2: Migrate articles pages and components to useApiClient** - `028d3ddb` (feat)

## Files Created/Modified
- `apps/dashboard/app/pages/ads/[id].vue` - Replaced `useStrapiClient()` with `useApiClient()`, migrated all 5 mutations
- `apps/dashboard/app/pages/articles/[id]/edit.vue` - Added `useApiClient()`, migrated `strapi.update("articles")` to `apiClient` PUT
- `apps/dashboard/app/components/ArticlesDefault.vue` - Added `useApiClient()`, migrated `strapi.delete("articles")` to `apiClient` DELETE
- `apps/dashboard/app/components/FormArticle.vue` - Replaced `useStrapiClient` import and `strapi.update("articles")` with `apiClient`, removed unused `useStrapi()`

## Decisions Made
- `FormArticle.vue` only used `useStrapi()` for `strapi.update` (a mutation). After migration, no reads remained, so `useStrapi()` was removed entirely from this component — consistent with the pattern established in Plan 03 for `FormPassword.vue`.
- Custom Strapi action endpoints (`/ads/{id}/approve`, `/ads/{id}/reject`, `/ads/{id}/banned`) do NOT wrap body in `{ data: ... }` — they accept the body directly. Content-type updates (`/ads/{docId}`, `/articles/{docId}`) MUST use `{ data: payload }`.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 107 is complete. All POST/PUT/DELETE operations across the entire dashboard now inject `X-Recaptcha-Token` via `useApiClient`.
- Comprehensive verification: `grep -rn "useStrapiClient\|strapi\.create\|strapi\.update\|strapi\.delete" apps/dashboard/app/ --include="*.vue" --include="*.ts" | grep -v "node_modules" | grep -v "useStrapi()" | grep -v "strapi\.find"` returns only `useApiClient.ts` itself (the implementation).

---
*Phase: 107-dashboard-recaptcha-validation-all-routes*
*Completed: 2026-03-29*

## Self-Check: PASSED

All files present and all commits verified.

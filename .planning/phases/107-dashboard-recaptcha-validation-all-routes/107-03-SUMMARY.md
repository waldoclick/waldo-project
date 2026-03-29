---
phase: 107-dashboard-recaptcha-validation-all-routes
plan: "03"
subsystem: ui
tags: [recaptcha, vue, pinia, nuxt, strapi, api-client]

# Dependency graph
requires:
  - phase: 107-01
    provides: useApiClient composable that injects X-Recaptcha-Token on POST/PUT/DELETE
  - phase: 107-02
    provides: FormEdit and FormGift already migrated as reference pattern
provides:
  - All CRUD admin forms (FAQ, commune, region, category, pack, condition) protected by reCAPTCHA on create/update
  - FormPassword (user password change) protected by reCAPTCHA
  - me.store saveUsername (username update) protected by reCAPTCHA
affects: [107-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useApiClient<{ data: T }>() typed generic for response shape inference"
    - "Keep useStrapi() for read operations (find/findOne), replace with useApiClient() for mutations only"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/FormFaq.vue
    - apps/dashboard/app/components/FormCommune.vue
    - apps/dashboard/app/components/FormRegion.vue
    - apps/dashboard/app/components/FormCategory.vue
    - apps/dashboard/app/components/FormPack.vue
    - apps/dashboard/app/components/FormCondition.vue
    - apps/dashboard/app/components/FormPassword.vue
    - apps/dashboard/app/stores/me.store.ts

key-decisions:
  - "Use typed generic apiClient<{ data: T }>() to avoid response.data type errors — cleaner than unknown cast"
  - "FormPassword: remove useStrapi() entirely since it was only used for the one update call"
  - "me.store: keep useStrapi() alongside apiClient since strapi.find('users/me') is a read operation"
  - "users/username controller reads ctx.request.body.data so body: { data } wrapper is required"

patterns-established:
  - "Pattern: apiClient<{ data: { id?: number; documentId?: string } }>() for standard Strapi v5 content-type mutations"

requirements-completed: [RCP-107-01, RCP-107-02]

# Metrics
duration: 12min
completed: 2026-03-29
---

# Phase 107 Plan 03: CRUD Admin Forms + me.store reCAPTCHA Migration Summary

**8 components/stores migrated from useStrapi SDK to useApiClient so all admin CRUD mutations (FAQ, commune, region, category, pack, condition, password, username) now inject X-Recaptcha-Token**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-29T22:28:00Z
- **Completed:** 2026-03-29T22:40:11Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Migrated 6 CRUD admin form components (FormFaq, FormCommune, FormRegion, FormCategory, FormPack, FormCondition) from `strapi.create`/`strapi.update` to `apiClient` POST/PUT
- Migrated FormPassword from `strapi.update("users")` to `apiClient PUT /users/:id`
- Migrated me.store `saveUsername` from `strapi.update("users/username")` to `apiClient PUT /users/username`
- All 8 files now inject X-Recaptcha-Token automatically via `useApiClient`
- Read operations (`strapi.find`, `strapi.findOne`) remain on the Strapi SDK, untouched
- All 55 tests pass

## Task Commits

1. **Task 1: Migrate 6 CRUD admin forms from useStrapi SDK to useApiClient** - `3a127e5c` (feat)
2. **Task 2: Migrate FormPassword and me.store from useStrapi SDK to useApiClient** - `30d7791b` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `apps/dashboard/app/components/FormFaq.vue` - strapi.create/update replaced with apiClient POST/PUT for /faqs
- `apps/dashboard/app/components/FormCommune.vue` - strapi.create/update replaced with apiClient POST/PUT for /communes
- `apps/dashboard/app/components/FormRegion.vue` - strapi.create/update replaced with apiClient POST/PUT for /regions
- `apps/dashboard/app/components/FormCategory.vue` - strapi.create/update replaced with apiClient POST/PUT for /categories
- `apps/dashboard/app/components/FormPack.vue` - strapi.create/update replaced with apiClient POST/PUT for /ad-packs
- `apps/dashboard/app/components/FormCondition.vue` - strapi.create/update replaced with apiClient POST/PUT for /conditions
- `apps/dashboard/app/components/FormPassword.vue` - strapi.update replaced with apiClient PUT /users/:id; useStrapi removed
- `apps/dashboard/app/stores/me.store.ts` - saveUsername uses apiClient PUT /users/username; strapi kept for reads

## Decisions Made

- Used typed generic `apiClient<{ data: { id?: number; documentId?: string } }>()` instead of `response.data as unknown as {...}` casts — the apiClient returns `Promise<T>` so direct `.data` access requires the generic parameter
- Verified `usernameUpdateController` reads `ctx.request.body.data` so `body: { data }` wrapper is correct for the custom `/users/username` endpoint
- FormPassword: removed `const strapi = useStrapi()` entirely since it had no read operations
- me.store: kept `const strapi = useStrapi()` alongside new `const apiClient = useApiClient()` since `strapi.find("users/me", ...)` is a read operation that remains unchanged

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all migrations followed the established pattern cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 8 CRUD admin mutation paths now send X-Recaptcha-Token
- Ready for Plan 04 (final verification/remaining components)

## Self-Check: PASSED

- FormFaq.vue: FOUND
- FormPassword.vue: FOUND
- me.store.ts: FOUND
- 107-03-SUMMARY.md: FOUND
- Commit 3a127e5c: FOUND (feat(107-03): migrate 6 CRUD admin forms)
- Commit 30d7791b: FOUND (feat(107-03): migrate FormPassword and me.store)

---
*Phase: 107-dashboard-recaptcha-validation-all-routes*
*Completed: 2026-03-29*

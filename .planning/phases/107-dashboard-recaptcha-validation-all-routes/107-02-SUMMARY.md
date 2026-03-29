---
phase: 107-dashboard-recaptcha-validation-all-routes
plan: "02"
subsystem: auth
tags: [recaptcha, vue, nuxt, dashboard, security]

# Dependency graph
requires:
  - phase: 107-01
    provides: useApiClient composable that auto-injects X-Recaptcha-Token on POST/PUT/DELETE

provides:
  - All 7 dashboard components that make mutating HTTP calls now use useApiClient
  - Auth forms (Login, ForgotPassword, ResetPassword) cleaned of manual reCAPTCHA token management
  - FormEdit, FormVerifyCode, FormGift, LightBoxArticles protected by automatic reCAPTCHA injection

affects: [107-03, 107-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useApiClient as drop-in replacement for useStrapiClient in all mutating calls

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/FormLogin.vue
    - apps/dashboard/app/components/FormForgotPassword.vue
    - apps/dashboard/app/components/FormResetPassword.vue
    - apps/dashboard/app/components/FormEdit.vue
    - apps/dashboard/app/components/FormVerifyCode.vue
    - apps/dashboard/app/components/FormGift.vue
    - apps/dashboard/app/components/LightBoxArticles.vue

key-decisions:
  - "useApiClient is a drop-in for useStrapiClient — only the initialization line changes, no call-site changes needed"
  - "Auth forms that previously had manual $recaptcha.execute + header injection are fully cleaned up — token injection is now encapsulated in useApiClient"

patterns-established:
  - "Pattern: never call useStrapiClient() directly in components for mutating (POST/PUT/DELETE) requests — use useApiClient() instead"

requirements-completed: [RCP-107-01, RCP-107-02, RCP-107-03]

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 107 Plan 02: Component reCAPTCHA Migration Summary

**7 dashboard components migrated from useStrapiClient to useApiClient, removing all manual reCAPTCHA token management from auth forms**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-29T22:30:35Z
- **Completed:** 2026-03-29T22:32:45Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Migrated 3 auth forms (FormLogin, FormForgotPassword, FormResetPassword) — removed manual `$recaptcha.execute` + `X-Recaptcha-Token` header logic in all three
- Migrated 4 non-auth components (FormEdit, FormVerifyCode, FormGift, LightBoxArticles) — reCAPTCHA token injection now automatic for all their POST/PUT calls
- All 55 vitest tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate auth forms from manual $recaptcha to useApiClient** - `0684f766` (feat)
2. **Task 2: Migrate non-auth useStrapiClient components to useApiClient** - `e067a142` (feat)

**Plan metadata:** (see final commit)

## Files Created/Modified
- `apps/dashboard/app/components/FormLogin.vue` - Replaced useStrapiClient + manual $recaptcha with useApiClient; kept inline useNuxtApp for cookie cache-busting logic
- `apps/dashboard/app/components/FormForgotPassword.vue` - Replaced useStrapiClient + manual $recaptcha with useApiClient
- `apps/dashboard/app/components/FormResetPassword.vue` - Replaced useStrapiClient + manual $recaptcha with useApiClient
- `apps/dashboard/app/components/FormEdit.vue` - Replaced useStrapiClient with useApiClient for PUT /users/:id
- `apps/dashboard/app/components/FormVerifyCode.vue` - Replaced useStrapiClient with useApiClient for POST /auth/verify-code and /auth/resend-code
- `apps/dashboard/app/components/FormGift.vue` - Replaced useStrapiClient with useApiClient for POST /:endpoint/gift; useStrapi() for GET reads retained
- `apps/dashboard/app/components/LightBoxArticles.vue` - Replaced useStrapiClient with useApiClient for POST /search/tavily, /ia/groq, /articles

## Decisions Made
- No architectural decisions required — all migrations were straightforward one-line substitutions
- FormLogin retains `useNuxtApp()` call inside `handleSubmit` for the `nuxtApp._cookies` cache-busting logic (unrelated to reCAPTCHA)
- FormGift retains `useStrapi()` for GET (find) operations — only the `useStrapiClient` POST call was replaced

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 7 components now send reCAPTCHA tokens automatically on every mutating request
- When the server guard from Plan 01 is active, all these calls will pass the reCAPTCHA check
- Ready for Plan 03 (server-side guard activation) and Plan 04 (end-to-end verification)

---
*Phase: 107-dashboard-recaptcha-validation-all-routes*
*Completed: 2026-03-29*

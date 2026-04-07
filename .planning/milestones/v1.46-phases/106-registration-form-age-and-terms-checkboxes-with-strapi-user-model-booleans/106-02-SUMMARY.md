---
phase: 106-registration-form-age-and-terms-checkboxes-with-strapi-user-model-booleans
plan: 02
subsystem: ui
tags: [vue, nuxt, vee-validate, yup, registration, consent, checkboxes]

# Dependency graph
requires:
  - phase: 106-01
    provides: Strapi user model with accepted_age_confirmation and accepted_terms boolean fields
provides:
  - FormRegister interface extended with accepted_age_confirmation and accepted_terms booleans
  - Two checkbox Fields in FormRegister.vue step 2 with yup .oneOf([true]) validation
  - Tests verifying consent field initialization and API body inclusion
affects: [registration flow, strapi user creation endpoint]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Yup boolean().oneOf([true]) for required checkbox validation"
    - "form-check / form-check-input / form-check-label BEM classes for checkbox UI"
    - "Delete only confirm_password before submit — consent fields flow through to Strapi"

key-files:
  created: []
  modified:
    - apps/website/app/types/form-register.d.ts
    - apps/website/app/components/FormRegister.vue
    - apps/website/tests/components/FormRegister.test.ts

key-decisions:
  - "Use form-check-label (not form__label) for checkbox labels — form__label is position:absolute and would float incorrectly"
  - "Keep accepted_age_confirmation and accepted_terms in form.value on submit — only confirm_password is deleted"
  - "NuxtLink to /politicas-de-privacidad inside terms label for privacy policy access"
  - "Add global mocks for useAdAnalytics and useApiClient to fix pre-existing test setup gap"

patterns-established:
  - "Consent checkboxes use existing form-check SCSS classes, no new styles needed"
  - "Boolean consent fields initialized as false in form ref, validated with .oneOf([true])"

requirements-completed: [REG-01, REG-02]

# Metrics
duration: 15min
completed: 2026-03-29
---

# Phase 106 Plan 02: Registration Consent Checkboxes Summary

**Age confirmation and terms acceptance checkboxes added to registration step 2 with yup .oneOf([true]) blocking validation and NuxtLink to privacy policy**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-29T13:00:00Z
- **Completed:** 2026-03-29T13:15:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Extended FormRegister TypeScript interface with two boolean consent fields
- Added two checkbox Fields in step 2 using established form-check BEM classes
- Yup schema blocks form submission until both checkboxes are checked (.oneOf([true]))
- Consent fields flow through to Strapi API body unchanged (only confirm_password is deleted)
- All 6 tests pass (4 pre-existing + 2 new consent tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update FormRegister type and add checkboxes with yup validation** - `d946108b` (feat)
2. **Task 2: Extend FormRegister.test.ts yup mock and add consent checkbox tests** - `f9f36fd1` (test)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/website/app/types/form-register.d.ts` - Added accepted_age_confirmation and accepted_terms boolean fields to FormRegister interface
- `apps/website/app/components/FormRegister.vue` - Form ref initialization, yup schema validators, two checkbox Fields before submit button
- `apps/website/tests/components/FormRegister.test.ts` - Extended yup boolean mock with oneOf, added global mocks for useAdAnalytics and useApiClient, added 2 new consent tests

## Decisions Made
- Use `form-check-label` (not `form__label`) — `form__label` is `position:absolute; top:-6px` and would float incorrectly over checkbox inputs
- Only `confirm_password` is deleted before API call — both consent fields must reach Strapi
- NuxtLink inside terms label opens privacy policy in new tab

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing test failures by adding missing global mocks**
- **Found during:** Task 2 (test verification)
- **Issue:** Existing tests 1-4 were already failing with `useAdAnalytics is not defined` and `useApiClient is not defined` — both composables used in FormRegister.vue but not mocked in test file
- **Fix:** Added `global.useAdAnalytics = vi.fn(() => ({ signUp: mockSignUp }))` and `global.useApiClient = vi.fn(() => mockClient)` to test setup
- **Files modified:** `apps/website/tests/components/FormRegister.test.ts`
- **Verification:** All 6 tests pass (4 previously failing + 2 new)
- **Committed in:** `f9f36fd1` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (pre-existing test setup gap)
**Impact on plan:** Fix was necessary to verify new tests — corrected a pre-existing gap without changing any component behavior.

## Issues Encountered
- NuxtLink not registered in test environment produces Vue warnings but does not cause test failures — this is expected behavior in unit test context without Nuxt test utils

## Known Stubs
None - both consent fields are wired directly to the API body via `...form.value`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Frontend consent checkboxes complete and validated
- Strapi will receive `accepted_age_confirmation: true` and `accepted_terms: true` in registration body
- Phase 106-03 (if applicable) can rely on Strapi storing these fields from the request body

---
*Phase: 106-registration-form-age-and-terms-checkboxes-with-strapi-user-model-booleans*
*Completed: 2026-03-29*

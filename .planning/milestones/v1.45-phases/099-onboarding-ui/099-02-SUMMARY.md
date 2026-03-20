---
phase: 099-onboarding-ui
plan: "02"
subsystem: ui
tags: [nuxt, vue, onboarding, components, tdd, vitest, pinia]

# Dependency graph
requires:
  - phase: 099-01
    provides: onboarding layout (layouts/onboarding.vue), SCSS BEM classes, FormProfile emit+prop refactor

provides:
  - OnboardingDefault.vue component (LogoBlack + FormProfile wrapper with success emit)
  - OnboardingThankyou.vue component (thank-you message + two action buttons)
  - /onboarding page (regions/communes preloaded via useAsyncData, auth middleware, onboarding layout)
  - /onboarding/thankyou page (auth middleware, onboarding layout)
  - 9 component tests passing (3 for OnboardingDefault, 6 for OnboardingThankyou)

affects: [099-03, onboarding-guard, wizard-guard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD for Vue components with global stubs — stub LogoBlack and FormProfile as global components in buildWrapper
    - useAppStore.getReferer || "/" pattern for return URL fallback
    - pages preload stores via useAsyncData, components read from store (no double-fetch)

key-files:
  created:
    - apps/website/app/components/OnboardingDefault.vue
    - apps/website/app/components/OnboardingThankyou.vue
    - apps/website/app/pages/onboarding/index.vue
    - apps/website/app/pages/onboarding/thankyou.vue
  modified:
    - apps/website/tests/components/OnboardingDefault.test.ts
    - apps/website/tests/components/OnboardingThankyou.test.ts

key-decisions:
  - "OnboardingThankyou uses explicit `import { computed } from 'vue'` — computed is not auto-imported in vitest environment"
  - "NuxtLink is auto-imported in Nuxt but must be stubbed in vitest with { template: '<a :href=to><slot /></a>', props: ['to'] }"
  - "returnUrl computed as appStore.getReferer || '/' — no client-only wrapper needed, NuxtLink is interactive post-hydration"
  - "Both onboarding pages use robots noindex/nofollow — private user flow not for search engines"

patterns-established:
  - "TDD stub pattern for auto-imported components: pass stubs via global.components in buildWrapper"
  - "Page data loading: useAsyncData in page, stores consumed in component (same as perfil/editar.vue)"

requirements-completed: [LAYOUT-02, LAYOUT-03, FORM-01, THANK-01, THANK-02, THANK-03]

# Metrics
duration: 3min
completed: 2026-03-19
---

# Phase 099 Plan 02: Onboarding Pages and Components Summary

**Onboarding UI assembled: /onboarding page with logo+profile form and /onboarding/thankyou with two-button completion screen, both auth-gated with onboarding layout, 9 component tests passing**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-19T21:00:58Z
- **Completed:** 2026-03-19T21:03:04Z
- **Tasks:** 2
- **Files modified:** 6 (4 created, 2 converted from todo stubs)

## Accomplishments

- OnboardingDefault.vue renders LogoBlack logo above FormProfile with onboardingMode=true, re-emits success upward
- OnboardingThankyou.vue renders "Muchas gracias por registrarte" heading, descriptive text, and two NuxtLink buttons (primary to /anunciar, secondary to appStore.getReferer or /)
- /onboarding page preloads regions/communes via useAsyncData, uses onboarding layout, requires auth, navigates to /onboarding/thankyou on success
- /onboarding/thankyou page uses onboarding layout, requires auth, renders OnboardingThankyou
- Wave 0 todo stubs converted to 9 real passing tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OnboardingDefault and OnboardingThankyou components with tests** - `245317b9` (feat + test)
2. **Task 2: Create onboarding page files with layout, middleware, and data loading** - `32b9445a` (feat)

_Note: TDD task committed combined (tests + implementation) in one atomic commit per project pattern._

## Files Created/Modified

- `apps/website/app/components/OnboardingDefault.vue` - Logo + FormProfile wrapper, re-emits success
- `apps/website/app/components/OnboardingThankyou.vue` - Thank-you heading, text, primary+secondary action buttons
- `apps/website/app/pages/onboarding/index.vue` - Onboarding page: layout onboarding, auth middleware, useAsyncData for regions/communes
- `apps/website/app/pages/onboarding/thankyou.vue` - Thank-you page: layout onboarding, auth middleware
- `apps/website/tests/components/OnboardingDefault.test.ts` - 3 tests converted from todo stubs
- `apps/website/tests/components/OnboardingThankyou.test.ts` - 6 tests converted from todo stubs (including fallback case)

## Decisions Made

- `computed` imported explicitly from vue in OnboardingThankyou — vitest environment does not auto-import Vue APIs the way Nuxt does
- NuxtLink stubbed as `{ template: '<a :href="to"><slot /></a>', props: ['to'] }` in tests
- No `<client-only>` wrapper on buttons — NuxtLink is interactive after hydration; appStore.referer from localStorage is available when user can click
- Both pages use `robots: "noindex, nofollow"` — private onboarding flow should not be indexed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added explicit `computed` import in OnboardingThankyou.vue**
- **Found during:** Task 1 (GREEN phase — first test run after component creation)
- **Issue:** `computed is not defined` error — vitest does not provide Vue auto-imports the way the Nuxt runtime does
- **Fix:** Added `import { computed } from "vue"` to OnboardingThankyou.vue script setup
- **Files modified:** apps/website/app/components/OnboardingThankyou.vue
- **Verification:** All 9 tests pass after fix
- **Committed in:** 245317b9 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - Blocking)
**Impact on plan:** Required one-line fix. No scope creep. Component behavior unchanged in Nuxt runtime (auto-imports handle it there).

## Issues Encountered

None beyond the auto-fixed import deviation above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- /onboarding and /onboarding/thankyou pages are complete and functional
- Both pages have auth middleware — unauthenticated users are redirected to login
- The onboarding guard (Plan 03) can now redirect incomplete profiles to /onboarding knowing the page exists
- No blockers

---
*Phase: 099-onboarding-ui*
*Completed: 2026-03-19*

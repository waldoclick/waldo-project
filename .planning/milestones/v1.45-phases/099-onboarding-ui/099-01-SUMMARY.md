---
phase: 099-onboarding-ui
plan: "01"
subsystem: ui
tags: [vue3, nuxt4, vitest, scss, bem, vee-validate, pinia]

# Dependency graph
requires:
  - phase: 099-00
    provides: Wave 0 test stubs (FormProfile.onboarding.test.ts todo stubs)
provides:
  - "Slot-only onboarding layout (layout--onboarding) with no header/footer/chrome"
  - "BEM SCSS for onboarding--default and onboarding--thankyou modifiers"
  - "FormProfile success emit with onboardingMode prop (backward-compatible)"
  - "5 passing Vitest tests covering emit and redirect behavior"
  - "nuxt-meta-client-stub Vite plugin enabling import.meta.client in tests"
affects: [099-02, onboarding-pages, onboarding-guard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Custom Vite plugin in vitest.config.ts to replace import.meta.client/server with true/false for test environments"
    - "defineEmits + conditional redirect pattern for backward-compatible component emit refactoring"

key-files:
  created:
    - apps/website/app/layouts/onboarding.vue
    - apps/website/app/scss/components/_onboarding.scss
    - apps/website/tests/components/FormProfile.onboarding.test.ts
  modified:
    - apps/website/app/components/FormProfile.vue
    - apps/website/app/scss/app.scss
    - apps/website/vitest.config.ts

key-decisions:
  - "Used nuxt-meta-client-stub Vite plugin (inline in vitest.config.ts) to replace import.meta.client with true so Pinia store guards in components resolve correctly during tests — Vite define and import.meta mutation do not work in this setup"
  - "onboardingMode prop (Boolean, default false) chosen over emit-listener introspection — simpler and explicit per research recommendation"
  - "emit('success') fires before the conditional redirect so parent components receive the event even in legacy mode"

patterns-established:
  - "Backward-compatible emit refactor: add defineEmits + prop, guard redirect with !props.modeProp, emit always fires"
  - "Test stores that use import.meta.client guards: use nuxt-meta-client-stub plugin in vitest.config.ts"

requirements-completed: [LAYOUT-01, FORM-02, FORM-03]

# Metrics
duration: 30min
completed: 2026-03-19
---

# Phase 099 Plan 01: Onboarding UI Foundations Summary

**Slot-only onboarding layout, BEM SCSS for default/thankyou modifiers, and FormProfile refactored to emit success with backward-compatible onboardingMode prop — 5 tests passing**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-19T20:28:00Z
- **Completed:** 2026-03-19T20:57:57Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created `onboarding.vue` layout — pure slot wrapper with `layout layout--onboarding` class, no header/footer/lightboxes
- Created `_onboarding.scss` with BEM-compliant styles for `onboarding--default` (flex column, 100vh) and `onboarding--thankyou` (flex centered, 100vh) modifiers
- Refactored `FormProfile.vue` to add `defineEmits(["success"])` and `defineProps({ onboardingMode })` — emit fires on every successful save, redirect to `/cuenta/perfil` only when `onboardingMode` is false (default)
- Converted 5 Wave 0 `it.todo()` stubs into real passing Vitest tests
- Added `nuxt-meta-client-stub` inline Vite plugin to `vitest.config.ts` to make `import.meta.client` resolve as `true` in test environments

## Task Commits

1. **Task 1: Create onboarding layout and SCSS** — included in Wave 0 commit `fbfccef2` (test: add Wave 0 test stubs)
2. **Task 2: Add success emit to FormProfile** - `c0148646` (feat)

## Files Created/Modified
- `apps/website/app/layouts/onboarding.vue` - Slot-only layout with `layout layout--onboarding`, no chrome
- `apps/website/app/scss/components/_onboarding.scss` - BEM styles for onboarding--default and onboarding--thankyou
- `apps/website/app/scss/app.scss` - Added `@use "components/onboarding"` as last import
- `apps/website/app/components/FormProfile.vue` - Added defineEmits, defineProps, conditional redirect logic
- `apps/website/tests/components/FormProfile.onboarding.test.ts` - 5 real tests (converted from todos)
- `apps/website/vitest.config.ts` - Added nuxt-meta-client-stub Vite plugin

## Decisions Made
- Used a custom inline Vite plugin (`nuxt-meta-client-stub`) in `vitest.config.ts` to replace `import.meta.client` and `import.meta.server` literals at transform time. Vite `define` config and `import.meta` mutation both failed — the plugin approach works reliably.
- `onboardingMode` Boolean prop (default false) chosen over emit-listener introspection. When false, the existing redirect fires after the emit — preserving AccountEdit backward compatibility without code changes there.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed import.meta.client evaluating to undefined in Vitest**
- **Found during:** Task 2 (FormProfile TDD - GREEN phase)
- **Issue:** FormProfile uses `import.meta.client ? useUserStore() : {}` guards. In Vitest's happy-dom environment `import.meta.client` is `undefined` (falsy), so `userStore` initialized as `{}` causing `updateUserProfile is not a function` error in tests 3 and 5.
- **Fix:** Added a custom Vite plugin `nuxt-meta-client-stub` to `vitest.config.ts` that transforms `import.meta.client` → `true` and `import.meta.server` → `false` during module transformation.
- **Files modified:** `apps/website/vitest.config.ts`
- **Verification:** All 5 tests pass with stores correctly initialized
- **Committed in:** `c0148646` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in test environment)
**Impact on plan:** Required for tests 3 and 5 to work correctly. The plugin correctly reflects the browser (client) environment the component runs in. No scope creep.

## Issues Encountered
- Task 1 artifacts (layout, SCSS, app.scss import) were already committed in Wave 0 stub commit `fbfccef2` — no additional commit needed for Task 1.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `apps/website/app/layouts/onboarding.vue` exists and ready for page references in Plan 02
- `_onboarding.scss` is imported and available for OnboardingDefault and OnboardingThankyou components in Plan 02
- `FormProfile` emits `success` — OnboardingDefault can listen to `@success` to handle post-profile navigation
- `AccountEdit` continues to work unchanged (no props passed = `onboardingMode: false` = redirect fires as before)

---
*Phase: 099-onboarding-ui*
*Completed: 2026-03-19*

---
phase: 260411-tcf
plan: 01
subsystem: website/onboarding
tags: [onboarding, ux, cta, thankyou]
dependency_graph:
  requires: []
  provides: [deterministic-onboarding-thankyou-cta]
  affects: [apps/website/app/components/OnboardingThankyou.vue]
tech_stack:
  added: []
  patterns: [static-NuxtLink, no-script-block-when-not-needed]
key_files:
  created: []
  modified:
    - apps/website/app/components/OnboardingThankyou.vue
    - apps/website/tests/components/OnboardingThankyou.test.ts
decisions:
  - "Static to='/' replaces dynamic :to='returnUrl' — eliminates session-history-dependent navigation from onboarding thankyou screen"
  - "Script block removed entirely — component needs no reactive state after removing returnUrl computed"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-12"
  tasks_completed: 1
  files_modified: 2
---

# Quick Task 260411-tcf Summary

## One-liner

Replace dynamic `appStore.getReferer` CTA on onboarding thankyou screen with a static `NuxtLink to="/"` labeled "Ir al inicio".

## What Was Done

### Task 1: Replace "Volver a Waldo" CTA with deterministic "Ir al inicio" link to /

**Commit:** `8be3884b`

The second CTA on `OnboardingThankyou.vue` previously used `:to="returnUrl"` where `returnUrl = computed(() => appStore.getReferer || "/")`. This meant the button destination depended on the session's stored referer — which could be `/anuncios`, `/pro`, `/pagar/gracias`, or any other page visited before login.

The user's requirement is explicit: after completing onboarding, the user must be able to choose between going to the home page (`/`) or creating their first ad (`/anunciar`). The destination must be deterministic.

Changes made to `OnboardingThankyou.vue`:
- Replaced `:to="returnUrl"` with `to="/"`
- Changed label from "Volver a Waldo" to "Ir al inicio"
- Removed the entire `<script setup lang="ts">` block (no longer needed — `import { computed }`, `useAppStore()`, and `returnUrl` all gone)
- No other files touched

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated stale test assertions for OnboardingThankyou**
- **Found during:** Post-task verification
- **Issue:** `tests/components/OnboardingThankyou.test.ts` had 2 tests asserting `href="/some-page"` and text "Volver a Waldo", plus a mock for `useAppStore`. All three were now testing removed behavior.
- **Fix:** Rewrote the two stale test cases to assert `href="/"` and text "Ir al inicio"; removed the now-unnecessary `useAppStore` global mock.
- **Files modified:** `apps/website/tests/components/OnboardingThankyou.test.ts`
- **Commit:** `e1ad93ab`

## Verification

- `yarn nuxt typecheck` in apps/website: PASSED (no new errors)
- `yarn vitest run tests/components/OnboardingThankyou.test.ts`: 5/5 tests PASSED
- No unused imports or variables remain (CLAUDE.md compliance)

## Self-Check: PASSED

- `apps/website/app/components/OnboardingThankyou.vue` — modified, contains `to="/"` and "Ir al inicio"
- Commit `8be3884b` exists
- Commit `e1ad93ab` exists

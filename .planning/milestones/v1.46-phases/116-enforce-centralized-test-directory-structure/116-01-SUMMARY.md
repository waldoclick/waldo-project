---
phase: 116-enforce-centralized-test-directory-structure
plan: "01"
subsystem: website
tags: [testing, structure, refactor]
dependency_graph:
  requires: []
  provides: [STRUCT-116-WEB]
  affects: [apps/website/tests/]
tech_stack:
  added: []
  patterns: ["@/ alias imports for test files", "Centralized tests/ directory structure"]
key_files:
  created:
    - apps/website/tests/composables/useAdAnalytics.test.ts
    - apps/website/tests/composables/useApiClient.test.ts
    - apps/website/tests/composables/useGoogleOneTap.test.ts
    - apps/website/tests/composables/useLogout.test.ts
    - apps/website/tests/composables/useOrderById.test.ts
    - apps/website/tests/components/AccordionDefault.test.ts
    - apps/website/tests/components/AccountAnnouncements.test.ts
    - apps/website/tests/components/CardCategory.test.ts
    - apps/website/tests/components/FormLogin.render.test.ts
  modified: []
  deleted:
    - apps/website/app/composables/useAdAnalytics.test.ts
    - apps/website/app/composables/useApiClient.test.ts
    - apps/website/app/composables/useGoogleOneTap.test.ts
    - apps/website/app/composables/useLogout.test.ts
    - apps/website/app/composables/useOrderById.test.ts
    - apps/website/app/components/AccordionDefault.spec.ts
    - apps/website/app/components/AccountAnnouncements.spec.ts
    - apps/website/app/components/CardCategory.spec.ts
    - apps/website/app/components/FormLogin.spec.ts
    - apps/website/tests/components/AccordionDefault.ts
    - apps/website/tests/components/AccountAnnouncements.ts
    - apps/website/tests/components/CardCategory.ts
    - apps/website/tests/components/FormLogin.ts
decisions:
  - "FormLogin.spec.ts renamed to FormLogin.render.test.ts to avoid collision with existing FormLogin.website.test.ts"
  - "Both static imports and dynamic imports (await import()) updated to @/ alias"
metrics:
  duration: "8 minutes"
  completed: "2026-04-06"
  tasks_completed: 1
  files_changed: 22
---

# Phase 116 Plan 01: Centralize Website Test Files Summary

Move 9 co-located website test files from `app/composables/` and `app/components/` to `tests/composables/` and `tests/components/`, delete 4 dead `.ts` test-shaped files, and update all import paths from relative (`./`) to `@/` alias.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Delete dead test files and move composable tests | 6edfe808 | 22 files moved/deleted, 9 import paths updated |

## What Was Built

All 9 website test files are now in the centralized `tests/` directory (5 in `tests/composables/`, 4 in `tests/components/`). The 4 dead `.ts` files that were never discovered by Vitest (lacked `.test.ts` suffix) have been removed. All relative imports to production code have been replaced with `@/` alias imports matching the vitest.config.ts alias configuration.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- Zero test files remain under `apps/website/app/`
- Zero dead `.ts` files (without `.test.ts` suffix) in `tests/components/`
- 5 composable tests in `tests/composables/`
- 4 component tests in `tests/components/` (AccordionDefault, AccountAnnouncements, CardCategory, FormLogin.render) plus untouched FormLogin.website
- Website Vitest: exactly 17 failing tests — same baseline, no new failures
- Website typecheck: passes (exit code 0)

## Known Stubs

None.

## Self-Check: PASSED

Files exist:
- FOUND: apps/website/tests/composables/useAdAnalytics.test.ts
- FOUND: apps/website/tests/composables/useApiClient.test.ts
- FOUND: apps/website/tests/composables/useGoogleOneTap.test.ts
- FOUND: apps/website/tests/composables/useLogout.test.ts
- FOUND: apps/website/tests/composables/useOrderById.test.ts
- FOUND: apps/website/tests/components/AccordionDefault.test.ts
- FOUND: apps/website/tests/components/AccountAnnouncements.test.ts
- FOUND: apps/website/tests/components/CardCategory.test.ts
- FOUND: apps/website/tests/components/FormLogin.render.test.ts

Commits exist:
- FOUND: 6edfe808

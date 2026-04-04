---
phase: quick
plan: 260404-lpv
subsystem: website
tags: [nuxt, error-handling, 404, ssr, useAsyncData]
dependency_graph:
  requires: []
  provides: [fix-404-propagation]
  affects: [apps/website/app/pages/[slug].vue]
tech_stack:
  added: []
  patterns: [Nuxt useAsyncData error rethrow pattern]
key_files:
  created: []
  modified:
    - apps/website/app/pages/[slug].vue
decisions:
  - Rethrow error.value after useAsyncData instead of modifying the callback — minimal, targeted fix that follows the standard Nuxt error propagation pattern
metrics:
  duration: "~5 minutes"
  completed: "2026-04-04"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Quick Task 260404-lpv Summary

**One-liner:** Rethrow useAsyncData error.value in [slug].vue so Nuxt routes non-existent slugs to error.vue showing the 404 page.

## Problem

Visiting `/historial` (or any root-level slug that does not match an existing user profile) rendered a blank page instead of the 404 error page.

**Root cause:** `useAsyncData` catches errors thrown inside its callback and stores them in `error.value` — they do not propagate automatically. The page template guards with `v-if="adsData && adsData.user"`, so when data is null and the error is silently stored, the template renders nothing (blank page).

## Fix

Added the standard Nuxt error propagation check immediately after the `useAsyncData` call in `apps/website/app/pages/[slug].vue`:

```ts
if (error.value) {
  throw error.value;
}
```

This rethrows any stored error (including `createError({ statusCode: 404 })` thrown inside the callback for unknown users), allowing Nuxt to route to `error.vue` and display the proper 404 page.

## Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Rethrow useAsyncData error to show 404 page | 3ba48296 | apps/website/app/pages/[slug].vue |

## Verification

- TypeScript typecheck passes (exit code 0) — no new errors introduced
- Manual: visiting `/historial` will now show the 404 error page
- Manual: visiting a valid user profile slug (e.g. `/username`) continues to render the profile page normally

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- File modified exists: apps/website/app/pages/[slug].vue — FOUND
- Commit 3ba48296 — FOUND (`git log --oneline | grep 3ba48296`)

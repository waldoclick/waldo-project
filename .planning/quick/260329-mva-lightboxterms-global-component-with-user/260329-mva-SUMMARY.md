---
phase: quick
plan: 260329-mva
subsystem: website
tags: [lightbox, consent, user, terms, gdpr, modal]
dependency_graph:
  requires: []
  provides: [LightboxTerms, useUser.hasAcceptedTerms, useUser.acceptTerms]
  affects: [apps/website/app/layouts/default.vue, apps/website/app/layouts/account.vue, apps/website/app/layouts/about.vue, apps/website/app/layouts/auth.vue]
tech_stack:
  added: []
  patterns: [lightbox-modal-BEM, useUser-composable, onMounted-client-only]
key_files:
  created:
    - apps/website/app/components/LightboxTerms.vue
  modified:
    - apps/website/app/types/user.d.ts
    - apps/website/app/composables/useUser.ts
    - apps/website/app/scss/components/_lightbox.scss
    - apps/website/app/layouts/default.vue
    - apps/website/app/layouts/account.vue
    - apps/website/app/layouts/about.vue
    - apps/website/app/layouts/auth.vue
decisions:
  - hasAcceptedTerms returns true when user is not logged in — lightbox only targets authenticated users
  - No close button on lightbox — acceptance is mandatory (blocking modal)
  - acceptTerms calls updateUserProfile then fetchUser to refresh Strapi user state
  - onMounted + watch pattern: open on mount if needed, close automatically if consent arrives later
metrics:
  duration: ~10 min
  completed: 2026-03-29
  tasks_completed: 2
  files_created: 1
  files_modified: 7
---

# Quick Task 260329-mva: LightboxTerms Global Component Summary

**One-liner:** Blocking modal lightbox for legacy and OAuth users missing accepted_age_confirmation/accepted_terms consent booleans, wired into all four layouts.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add User type fields and useUser consent logic | af052340 | user.d.ts, useUser.ts |
| 2 | Create LightboxTerms component, add SCSS, wire into all layouts | 07a1fdf4 | LightboxTerms.vue, _lightbox.scss, 4 layouts |

## What Was Built

### Task 1: User Type + useUser Composable

- Added `accepted_age_confirmation: boolean` and `accepted_terms: boolean` to the `User` interface in `user.d.ts`
- Extended `useUser.ts` with:
  - `hasAcceptedTerms` computed: returns `true` if both fields are `true` on the user, or if user is not logged in
  - `acceptTerms` async function: calls `userStore.updateUserProfile()` to persist consent to Strapi, then calls `fetchUser()` from `useStrapiAuth()` to refresh the user state

### Task 2: LightboxTerms Component

- `LightboxTerms.vue` follows the `--razon` blocking modal pattern: fixed overlay, backdrop without click-to-close, centered box
- Two checkboxes (plain HTML `input[type=checkbox]`, no vee-validate): age confirmation and terms acceptance
- "Aceptar" button disabled until both checkboxes are checked and not loading
- `onMounted` opens modal if `hasAcceptedTerms` is false (client-side user state)
- `watch` on `hasAcceptedTerms` closes modal if consent arrives after mount
- SCSS `&--terms` modifier added to `_lightbox.scss` following the `&--razon` pattern exactly
- Wired into `default.vue`, `account.vue`, `about.vue`, `auth.vue` (not `onboarding.vue` — minimal layout per plan)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — the component is fully wired to `useUser().acceptTerms()` which persists data to Strapi and refreshes user state.

## Self-Check: PASSED

- `/home/gab/Code/waldo-project/apps/website/app/components/LightboxTerms.vue` — FOUND
- `/home/gab/Code/waldo-project/apps/website/app/types/user.d.ts` — FOUND (accepted_age_confirmation, accepted_terms added)
- `/home/gab/Code/waldo-project/apps/website/app/composables/useUser.ts` — FOUND (hasAcceptedTerms, acceptTerms exported)
- Commit af052340 — FOUND
- Commit 07a1fdf4 — FOUND

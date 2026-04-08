---
phase: quick
plan: 260408-npv
subsystem: website/ux
tags: [ux, loading, toast, spinner, BarAnnouncement, resumen]
dependency_graph:
  requires: []
  provides: [loading-feedback-on-ad-creation]
  affects: [apps/website/app/pages/anunciar/resumen.vue, apps/website/app/components/BarAnnouncement.vue, apps/website/app/scss/components/_button.scss]
tech_stack:
  added: []
  patterns: [lucide-vue-next spinner icon, useToast info notification, primaryLoading prop pattern]
key_files:
  created: []
  modified:
    - apps/website/app/components/BarAnnouncement.vue
    - apps/website/app/scss/components/_button.scss
    - apps/website/app/pages/anunciar/resumen.vue
decisions:
  - Used existing spin @keyframes from _animations.scss (no new CSS animation defined)
  - gap added only to btn--primary (not .btn base) to avoid affecting other button variants
  - isUploadingImages ref removed entirely since isCreating already covers the full loading state
metrics:
  duration: ~10 minutes
  completed: 2026-04-08
  tasks_completed: 2
  files_modified: 3
---

# Quick Task 260408-npv: Add Loading Toast and Button Spinner Summary

**One-liner:** Info toast + Loader2 spinner inside primary button while ad creation is in progress, using existing spin keyframe and useToast composable.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Add primaryLoading prop and spinner icon to BarAnnouncement + button spinner SCSS | 45cea95d | BarAnnouncement.vue, _button.scss |
| 2 | Show toast and pass loading state in resumen.vue | faf632dc | resumen.vue |

## What Was Built

- **BarAnnouncement.vue:** New `primaryLoading` boolean prop (default `false`). When true, renders `<IconLoader2 :size="16" class="btn__spinner" />` before the label text inside the primary button. Imported `Loader2 as IconLoader2` from `lucide-vue-next` matching the pattern in `LoadingDefault.vue`.
- **_button.scss:** Added `&__spinner` element with `animation: spin 1s linear infinite; flex-shrink: 0` using the existing `spin` keyframe from `_animations.scss`. Added `gap: 8px` to `.btn--primary` for spacing between spinner and label.
- **resumen.vue:** `useToast()` composable called, `toast.info("Publicando tu anuncio...")` fires at the very start of `confirmPay`. `:primary-loading="isCreating"` passed to `BarAnnouncement`. Removed the unused `isUploadingImages` ref (only written to, never read — would trigger Codacy unused-variable warning).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/website/app/components/BarAnnouncement.vue` — exists and contains `primaryLoading` prop and `IconLoader2`
- `apps/website/app/scss/components/_button.scss` — exists and contains `btn__spinner` and `gap: 8px` on `btn--primary`
- `apps/website/app/pages/anunciar/resumen.vue` — exists and contains `toast.info`, `:primary-loading`, no `isUploadingImages`
- Commit `45cea95d` — verified in git log
- Commit `faf632dc` — verified in git log
- TypeScript typecheck: passed clean (no errors, only localhost warning from nuxt-site-config)

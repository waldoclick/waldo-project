---
phase: 260412-0bc
plan: 01
subsystem: website/components
tags: [form, validation, textarea, ux]
dependency_graph:
  requires: []
  provides: [hard-300-char-cap-on-ad-description]
  affects: [FormCreateTwo.vue]
tech_stack:
  added: []
  patterns: [maxlength-attribute + vue-watch dual-layer cap]
key_files:
  created: []
  modified:
    - apps/website/app/components/FormCreateTwo.vue
decisions:
  - Dual-layer cap (maxlength attr + Vue watcher) following prior 260412-02k search-input pattern — browser attribute handles native typing; watcher covers paste, autofill, drag-drop, and programmatic/store-hydration writes
  - handleTextArea @input handler retained as first-line defence for native input events
  - Yup schema and remainingChars computed left completely unchanged — cap enforced at input layer, not validation layer
metrics:
  duration: ~2min
  completed: 2026-04-12
  tasks: 1
  files_changed: 1
---

# Quick Task 260412-0bc: Enforce 300-char Limit on Ad Description Summary

## One-liner

Hard 300-character cap on ad description textarea via `maxlength="300"` attribute + Vue `watch()` on `form.value.description` slicing to `maxChars` on every change.

## What Was Built

The description `<Field as="textarea">` in `FormCreateTwo.vue` previously showed a "Descripción no válida" counter once the 300-char Yup threshold was exceeded, but nothing prevented the user from actually typing or pasting beyond 300 characters — the submit button disabled but the textarea kept growing visually.

Two minimal, additive edits were made:

1. **Template** — `maxlength="300"` added to the `<Field as="textarea">` element. This is the cheap browser-level cap that stops native typing immediately.

2. **Script** — A `watch(() => form.value.description, ...)` added immediately after `handleTextArea`. The watcher slices to `maxChars` (300) whenever the reactive value exceeds the limit, covering paste, autofill, drag-drop, store hydration (`onMounted` re-populates `form.description` from adStore), and any other programmatic v-model write that bypasses the native `@input` event.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Hard-cap ad description textarea at 300 chars (attribute + watcher) | bb0cb627 | apps/website/app/components/FormCreateTwo.vue |

## Checkpoint Pending

**checkpoint:human-verify** — Manual UAT required:

1. Run `cd apps/website && yarn dev`, open ad creation flow (paso 2 — Descripción).
2. **Typing test:** Hold a key — stops at 300 chars, counter reads `0 caracteres`.
3. **Paste test:** Paste 500-char string — field capped at 300 chars after paste.
4. **Draft restore test:** Type ~50 chars, navigate to step 1 and back — description restored and cap still enforced.
5. **Counter/error test:** Counter (`X caracteres`) updates correctly; Continuar button enables when description is valid.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/website/app/components/FormCreateTwo.vue` — file modified and contains `maxlength="300"` and `watch(() => form.value.description, ...)`.
- Commit `bb0cb627` exists in git log.
- `yarn nuxt typecheck` passed with no new errors.

---
phase: quick-25
plan: 25
subsystem: dashboard
tags: [ux, textarea, auto-resize, vue, scss]
dependency_graph:
  requires: []
  provides: [auto-resize-textarea]
  affects: [apps/dashboard/app/components/TextareaArticle.vue, apps/dashboard/app/scss/components/_textarea.scss]
tech_stack:
  added: []
  patterns: [scrollHeight-based auto-resize, onMounted+watch reactive resize]
key_files:
  modified:
    - apps/dashboard/app/components/TextareaArticle.vue
    - apps/dashboard/app/scss/components/_textarea.scss
decisions:
  - Use scrollHeight technique (reset to auto, set to scrollHeight) for cross-browser reliability
  - Call resize() in onInput, onMounted(nextTick), watch(modelValue), and applyFormat nextTick
  - overflow:hidden on editor prevents scrollbar flash during height=auto reset step
  - min-height reduced from 200px to 120px — JS owns actual height after mount
metrics:
  duration: "5 minutes"
  completed: "2026-03-13"
  tasks_completed: 2
  files_modified: 2
---

# Quick Task 25: Make Article Body Textarea Auto-Resize Summary

**One-liner:** JS-driven textarea auto-resize via scrollHeight with onMounted/watch/onInput triggers and overflow:hidden SCSS.

## What Was Done

Added auto-resize behavior to `TextareaArticle.vue` so the article body textarea grows vertically as content is typed, eliminating the fixed `rows="10"` height cap and the manual drag handle.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add auto-resize logic to TextareaArticle.vue | cd6d526 | TextareaArticle.vue |
| 2 | Update textarea SCSS to support auto-resize | 5936945 | _textarea.scss |

## Changes Made

### TextareaArticle.vue
- Updated Vue import: added `nextTick`, `onMounted`, `watch` (also fixed pre-existing missing `nextTick` import — it was used in `applyFormat` but not imported)
- Added `resize()` function: resets `el.style.height = 'auto'` then sets `el.style.height = scrollHeight + 'px'`
- `onInput`: calls `resize()` after emitting value (grows as user types)
- `applyFormat` nextTick: calls `resize()` alongside `setSelectionRange` (grows after toolbar formatting)
- `onMounted(() => nextTick(resize))`: handles pre-filled content on article edit page
- `watch(() => props.modelValue, () => nextTick(resize))`: handles programmatic parent updates
- Removed `rows="10"` attribute — height fully JS-controlled

### _textarea.scss
- `resize: vertical` → `resize: none` (drag handle removed, JS handles sizing)
- `min-height: 200px` → `min-height: 120px` (smaller CSS floor; JS owns actual height)
- Added `overflow: hidden` (prevents scrollbar flash during `height=auto` reset)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing `nextTick` import**
- **Found during:** Task 1
- **Issue:** `nextTick` was already used in `applyFormat` but not listed in the Vue import — TypeScript would flag this. The plan added `nextTick` to the import as part of the task anyway.
- **Fix:** Included `nextTick` in the updated import line as specified by the plan.
- **Files modified:** apps/dashboard/app/components/TextareaArticle.vue
- **Commit:** cd6d526

## Verification

- ESLint passes clean on dashboard (`yarn lint`)
- Both commits passed pre-commit hooks (ESLint + Prettier — no issues)
- All changes are minimal and scoped to the two target files

## Self-Check: PASSED

- [x] `apps/dashboard/app/components/TextareaArticle.vue` — modified (commit cd6d526)
- [x] `apps/dashboard/app/scss/components/_textarea.scss` — modified (commit 5936945)
- [x] Both commits exist in git log
- [x] No unintended files modified

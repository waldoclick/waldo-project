---
phase: quick
plan: 260408-w1e
subsystem: website/components
tags: [pro, subscription, badge, ui-fix]
dependency_graph:
  requires: []
  provides: [active-badge-in-MemoPro]
  affects: [apps/website/app/components/MemoPro.vue]
tech_stack:
  added: []
  patterns: [v-if guard on card line, conditional badge spans]
key_files:
  created: []
  modified:
    - apps/website/app/components/MemoPro.vue
    - apps/website/app/scss/components/_memo.scss
decisions:
  - Used $magic_mint (#c2e3d9) background with $charcoal (#313338) text for active badge — matches brand palette and signal for success/active states
metrics:
  duration: "3 minutes"
  completed: "2026-04-08"
  tasks: 1
  files: 2
---

# Quick Task 260408-w1e Summary

Restore "Activa" badge in MemoPro.vue for active PRO subscriptions, and guard card info line when card data is null.

## What Was Done

**Task 1: Restore active status badge and fix card info display**

Added the missing `--active` badge span next to "Suscripción PRO" for users with `pro_status === 'active'`. Added a `v-if` guard on the card info paragraph so it does not render "**** " when `pro_card_type` or `pro_card_last4` is null/undefined. Added the `--active` SCSS modifier to `_memo.scss` using `$magic_mint` background and `$charcoal` text.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/website/app/components/MemoPro.vue` — FOUND
- `apps/website/app/scss/components/_memo.scss` — FOUND
- Commit `b14a2ebf` — FOUND

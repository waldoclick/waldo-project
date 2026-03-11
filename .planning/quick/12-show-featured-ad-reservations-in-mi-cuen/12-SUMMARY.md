---
phase: quick
plan: 12
subsystem: website/account
tags: [account, featured-ads, composable, vue]
dependency_graph:
  requires: []
  provides: [getFeaturedAdReservationsText, featured-count-ui]
  affects: [apps/website/app/components/AccountMain.vue, apps/website/app/composables/useUser.ts]
tech_stack:
  added: []
  patterns: [computed-from-composable, v-if-conditional-render]
key_files:
  modified:
    - apps/website/app/composables/useUser.ts
    - apps/website/app/components/AccountMain.vue
decisions:
  - "getFeaturedAdReservationsText placed after getAdFeaturedReservations to avoid TDZ (const arrow function cannot hoist)"
  - "Empty string return for 0 count drives v-if — no separate boolean needed"
  - "No new CSS classes — existing span style in _account.scss applies automatically"
metrics:
  duration: ~5 minutes
  completed: "2026-03-11"
  tasks_completed: 2
  files_modified: 2
---

# Quick Task 12: Show Featured Ad Reservations in Mi Cuenta — Summary

**One-liner:** Added `getFeaturedAdReservationsText()` helper and a conditional span in `AccountMain.vue` to surface unused featured ad reservation counts on `/mi-cuenta`.

## What Was Built

Users with unused featured ad reservations now see a second localised line below the existing free/paid counter in the announcements box on `/mi-cuenta`. Users with 0 unused featured reservations see no change (no clutter).

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add `getFeaturedAdReservationsText()` to useUser composable | c7e02cb | `useUser.ts` |
| 2 | Render featured reservation count in AccountMain.vue | 75c05a5 | `AccountMain.vue` |

## Implementation Details

### Task 1 — `useUser.ts`

Added `getFeaturedAdReservationsText()` immediately after `getAdFeaturedReservations()` (required ordering — `const` arrow functions don't hoist):

```typescript
const getFeaturedAdReservationsText = () => {
  const { unusedCount } = getAdFeaturedReservations();
  if (unusedCount === 0) return "";
  if (unusedCount === 1) return "Tienes <strong>1</strong> anuncio destacado.";
  return `Tienes <strong>${unusedCount}</strong> anuncios destacados.`;
};
```

Exported in return object alongside existing functions.

### Task 2 — `AccountMain.vue`

- Destructured `getFeaturedAdReservationsText` from `useUser()`
- Added `featuredAdReservationsText` computed via `sanitizeText()`
- Rendered conditional span after existing `adReservationsText` span using `v-if` + `v-html`
- Zero SCSS changes — existing `account--main__announcements__own span` style covers the new line

## Verification

- `yarn nuxt typecheck` passes with 0 errors (only unrelated `nuxt-site-config` localhost warning)
- No type errors in `useUser.ts` or `AccountMain.vue`

## Deviations from Plan

None — plan executed exactly as written.

The only subtle correctness fix was ordering: the plan said to place `getFeaturedAdReservationsText` before `getAdFeaturedReservations`, but that would cause a TDZ (Temporal Dead Zone) error since both use `const`. The function was placed after `getAdFeaturedReservations` instead. This is not a deviation from intent — it's a prerequisite for the code to run correctly.

## Self-Check

- [x] `apps/website/app/composables/useUser.ts` modified — `getFeaturedAdReservationsText` exported
- [x] `apps/website/app/components/AccountMain.vue` modified — conditional span rendered
- [x] Commit `c7e02cb` exists
- [x] Commit `75c05a5` exists
- [x] TypeScript check passes

## Self-Check: PASSED

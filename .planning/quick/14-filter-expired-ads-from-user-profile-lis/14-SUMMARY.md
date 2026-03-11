---
phase: quick-14
plan: 14
subsystem: website
tags: [ads, filtering, user-profile, strapi-query]
key-files:
  modified:
    - apps/website/app/pages/[slug].vue
decisions:
  - "Added remaining_days: { $gt: 0 } filter to match the pattern already used in anuncios/index.vue and error.vue"
metrics:
  duration: "< 5 minutes"
  completed_date: "2026-03-11"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 14: Filter Expired Ads from User Profile Listing Summary

**One-liner:** Added `remaining_days: { $gt: 0 }` Strapi filter to user profile `[slug].vue` to exclude expired ads from seller listings.

## What Was Done

Added a single filter condition to the `filtersParams` object in `apps/website/app/pages/[slug].vue`. The user profile listing query now only returns ads where `remaining_days > 0`, excluding ads whose expiration countdown has reached zero.

## Changes

### `apps/website/app/pages/[slug].vue`

**Before:**
```typescript
const filtersParams = {
  active: { $eq: true },
  user: { username: { $eq: username } },
};
```

**After:**
```typescript
const filtersParams = {
  active: { $eq: true },
  remaining_days: { $gt: 0 },
  user: { username: { $eq: username } },
};
```

## Verification

- TypeScript check: ✅ No new errors
- Pre-commit hooks: ✅ Passed (ESLint, Prettier)
- Pattern consistency: ✅ Matches `anuncios/index.vue` (line 184) and `error.vue` (line 104)

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| 12398f4 | fix(quick-14): exclude expired ads from user profile listing |

## Self-Check: PASSED

- ✅ `apps/website/app/pages/[slug].vue` modified with `remaining_days: { $gt: 0 }` filter
- ✅ Commit `12398f4` exists in git log
- ✅ TypeScript strict mode passes without new errors
- ✅ Filter pattern is consistent with the rest of the codebase

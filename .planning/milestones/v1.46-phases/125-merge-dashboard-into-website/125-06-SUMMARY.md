---
phase: 125-merge-dashboard-into-website
plan: "06"
subsystem: website/scss + website/types + website/components + website/pages
tags: [scss-merge, typescript, dashboard-consolidation, bem]
dependency-graph:
  requires: [125-05]
  provides: [SCSS-01, TYPE-01]
  affects: [apps/website/app/scss, apps/website/app/types, apps/website/app/utils]
tech-stack:
  added: [app/utils/date.ts, app/utils/price.ts, app/utils/string.ts]
  patterns: [BEM &--dashboard modifier append, explicit utils imports for vue-tsc]
key-files:
  created:
    - apps/website/app/scss/components/_ads.scss
    - apps/website/app/scss/components/_articles.scss
    - apps/website/app/scss/components/_badge.scss
    - apps/website/app/scss/components/_better-stack.scss
    - apps/website/app/scss/components/_box.scss
    - apps/website/app/scss/components/_breadcrumbs.scss
    - apps/website/app/scss/components/_categories.scss
    - apps/website/app/scss/components/_chart.scss
    - apps/website/app/scss/components/_cloudflare.scss
    - apps/website/app/scss/components/_communes.scss
    - apps/website/app/scss/components/_conditions.scss
    - apps/website/app/scss/components/_dropdown.scss
    - apps/website/app/scss/components/_faqs.scss
    - apps/website/app/scss/components/_featured.scss
    - apps/website/app/scss/components/_google-analytics.scss
    - apps/website/app/scss/components/_orders.scss
    - apps/website/app/scss/components/_pagination.scss
    - apps/website/app/scss/components/_regions.scss
    - apps/website/app/scss/components/_reservations.scss
    - apps/website/app/scss/components/_search-console.scss
    - apps/website/app/scss/components/_statistics.scss
    - apps/website/app/scss/components/_stats.scss
    - apps/website/app/scss/components/_subscription-payments.scss
    - apps/website/app/scss/components/_subscription-pros.scss
    - apps/website/app/scss/components/_table.scss
    - apps/website/app/scss/components/_textarea.scss
    - apps/website/app/scss/components/_toolbar.scss
    - apps/website/app/scss/components/_users.scss
    - apps/website/app/scss/components/_verify-code.scss
    - apps/website/app/utils/date.ts
    - apps/website/app/utils/price.ts
    - apps/website/app/utils/string.ts
  modified:
    - apps/website/app/scss/components/_lightbox.scss
    - apps/website/app/scss/components/_upload.scss
    - apps/website/app/scss/app.scss
    - apps/website/app/types/ad.d.ts
    - apps/website/app/types/user.d.ts
    - apps/website/app/types/pack.d.ts
    - apps/website/app/types/category.d.ts
    - apps/website/app/stores/articles.store.ts
    - apps/website/app/components/ (9 Dashboard components + 25 others with imports)
    - apps/website/app/pages/dashboard/ (43 pages with formatDate imports)
decisions:
  - "BEM append strategy: dashboard &--default blocks renamed to &--dashboard and appended inside website's existing root class — no standalone selector, no namespace collision"
  - "formatDate/formatDateShort/formatBoolean require explicit imports in vue-tsc strict mode — auto-imports are runtime-only, not reflected in template type context"
  - "Media.formats extended with small/large variants to match Strapi Cloudinary upload formats"
  - "formatDate/formatDateShort accept null|undefined|string — Strapi fields return null not undefined"
  - "GalleryItem.id is string (Strapi documentId) — numeric gallery IDs compared via Number(image.id)"
metrics:
  duration: "~6 hours (continued from prior session)"
  completed: "2026-06-10"
  tasks: 2
  files-changed: 117
---

# Phase 125 Plan 06: SCSS Merge + TypeScript Remediation Summary

Merged dashboard SCSS into website via BEM `&--dashboard` modifier append (28 colliding files) and direct copy (29 dashboard-exclusive files). Fixed all 81 TypeScript errors exposed when 68 dashboard pages + 95 components compiled under website's strict `typeCheck: true` — typecheck exits 0.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Merge SCSS — append &--dashboard + copy dashboard-only | 95a192d6 | 29 new SCSS files, 2 colliding files extended, app.scss imports added |
| 2 | TypeScript remediation | 8ee51ec9 | 3 util files created, 115 files fixed, 81 TS errors to 0 |

## Task 1: SCSS Merge

### Colliding files — &--dashboard blocks appended

28 files existed in both apps. Dashboard's `&--default { ... }` modifier blocks were renamed `&--dashboard` and appended INSIDE the website's existing root class block. Website's own modifiers (`&--default`, `&--images`, etc.) were NOT touched.

Significant additions:
- `_lightbox.scss` — appended `&--articles` (article-linking modal) and `&--gift` (gift purchase modal)
- `_upload.scss` — appended `&--media` (100x100px grid with drag-to-remove, spinner, --filled/--empty states)

### Dashboard-exclusive files copied

29 files copied from dashboard with the empirical `@use "../base/container"` fix: any file using `@extend .container` without the `@use` directive had it prepended. Build confirmed no "Can't extend .container" errors.

### Component template sync (auto-fix — Rule 1)

9 Dashboard component templates emitting `--default` CSS classes were updated to emit `--dashboard` to prevent dead CSS:
- FooterDefaultDashboard, HeroDefaultDashboard, HeaderDefaultDashboard, MenuDefaultDashboard
- SearchDefaultDashboard, GalleryDefaultDashboard, PacksDefaultDashboard, TermsDefaultDashboard, PoliciesDefaultDashboard

## Task 2: TypeScript Remediation

Starting point: 81 errors across 46 files. Discovered that `yarn workspace waldo-website nuxi typecheck` targets the main repo; the worktree requires running `node <root>/node_modules/.bin/nuxi typecheck` from within the worktree's `apps/website/`.

### Error categories and fixes

**1. formatDate/formatDateShort/formatBoolean not found in template context (67 errors)**

Root cause: Nuxt auto-imports work at runtime but `vue-tsc` template type narrowing does not see global auto-imported utils as component properties.

Fix: Added explicit imports for format utils in all 43 files using them in templates. Created the three util files that dashboard had but website lacked:
- `app/utils/date.ts` — `formatDate`, `formatDateShort` (accepts `string | undefined | null`)
- `app/utils/price.ts` — `formatCurrency`
- `app/utils/string.ts` — `formatFullName`, `formatAddress`, `formatBoolean`, `formatDays`, `getPaymentMethod`

**2. Missing type fields (6 errors)**

- `Media.formats` — added `small` and `large` variants
- `Pack` — added `documentId: string`, `description?: string`, `text?: string`
- `Category` — added `documentId: string`
- `User` — added `UserRelation` interface, `region` and `business_region` fields
- `Ad` — added `AdStatus` type union, `featured`, `banned_at`, `rejected_at`, `duration_days` fields

**3. Component-specific type fixes (8 errors)**

- `AvatarDefaultDashboard.vue` — cast `loggedUser.value` to `User` for `firstname`/`lastname` access
- `LightBoxArticles.vue` — cast `getAICache().result` to known parsed type
- `articles/[id]/index.vue` — cast `MediaItem[]` to `GalleryItem[]` for gallery component
- `ads/[id].vue` — updated `handleDeleteImage` signature to `{ image: GalleryItem; index: number }`, used `Number(image.id)` for numeric gallery ID comparison
- `users/[id].vue` — `getRelationName` accepts `UserRelation | null | undefined`; added `formatBoolean` import

**4. floating-vue module not found (1 error)**

`floating-vue` installed in `apps/website/node_modules/` but the worktree's symlinked root `node_modules` doesn't have it. Fix: symlinked `floating-vue` into the worktree's app-level `node_modules`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Dashboard component templates still emitting --default classes**
- **Found during:** Task 1
- **Issue:** SCSS renamed to `&--dashboard` but templates still emitted `--default`, creating dead CSS
- **Fix:** Updated 9 Dashboard component templates to emit `--dashboard` class modifier
- **Files modified:** FooterDefaultDashboard.vue, HeroDefaultDashboard.vue, HeaderDefaultDashboard.vue, MenuDefaultDashboard.vue, SearchDefaultDashboard.vue, GalleryDefaultDashboard.vue, PacksDefaultDashboard.vue, TermsDefaultDashboard.vue, PoliciesDefaultDashboard.vue
- **Commit:** 95a192d6

**2. [Rule 2 - Missing functionality] Util files date.ts/price.ts/string.ts absent from website**
- **Found during:** Task 2
- **Issue:** Dashboard pages imported from `@/utils/date`, `@/utils/price`, `@/utils/string` but website had no `app/utils/` directory
- **Fix:** Created all three util files
- **Files created:** apps/website/app/utils/date.ts, price.ts, string.ts
- **Commit:** 8ee51ec9

**3. [Rule 1 - Bug] Worktree typecheck discovery**
- **Found during:** Task 2 setup
- **Issue:** `yarn workspace waldo-website nuxi typecheck` runs against main repo path, not worktree
- **Fix:** Identified correct invocation; no code changes required
- **Impact:** Verification method only

## Verification Results

- `nuxi typecheck` exits 0 — 0 errors (was 81)
- `grep -rc ": any\b\|as any\b" apps/website/app/pages/dashboard` returns 0 (no any introduced)
- `tests/middleware/dashboard-guard.test.ts` — 6 tests PASS
- `tests/middleware/onboarding-guard.test.ts` — 12 tests PASS
- Pre-existing test failures (FormLogin, useLogout, useOrderById, recaptcha-proxy) confirmed identical in main repo — not caused by this plan

## Known Stubs

None — all template data is wired to real store/API calls.

## Self-Check: PASSED

- Commit 95a192d6 exists: FOUND
- Commit 8ee51ec9 exists: FOUND
- apps/website/app/utils/date.ts: FOUND
- apps/website/app/utils/price.ts: FOUND
- apps/website/app/utils/string.ts: FOUND
- apps/website/app/scss/components/_ads.scss: FOUND
- nuxi typecheck exit 0: VERIFIED

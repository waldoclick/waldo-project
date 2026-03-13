---
phase: 065-strapi-slug-field
plan: 01
subsystem: api
tags: [strapi, slug, slugify, lifecycle-hooks, jest, tdd, article]

# Dependency graph
requires: []
provides:
  - Article schema with slug as uid type targeting title
  - beforeCreate lifecycle hook: auto-generates slug from title on article creation
  - beforeUpdate lifecycle hook: regenerates slug when title changes
  - 6 Jest unit tests covering all slug generation behaviors
affects:
  - 066-blog-infrastructure
  - 067-blog-listing
  - 068-blog-detail

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Strapi lifecycle hooks for slug auto-generation (beforeCreate/beforeUpdate)"
    - "slugify with lower+strict options for URL-safe slugs"
    - "TDD with AAA pattern for Strapi lifecycle unit tests"

key-files:
  created:
    - apps/strapi/src/api/article/content-types/article/lifecycles.ts
    - apps/strapi/src/api/article/content-types/article/__tests__/article.lifecycles.test.ts
  modified:
    - apps/strapi/src/api/article/content-types/article/schema.json

key-decisions:
  - "Used uid type (not string) for slug field — gives Strapi admin auto-generation UI and uniqueness enforcement"
  - "beforeUpdate reads existing article title via entityService.findOne before overwriting slug — prevents unnecessary slug regeneration"
  - "slugify with strict:true — strips special chars including Spanish accents for clean URL slugs"

patterns-established:
  - "Article slug lifecycle: mirrors category lifecycle pattern exactly"
  - "Strapi lifecycle unit tests: mock global strapi with jest.fn(), AAA pattern, descriptive English names"

requirements-completed: [BLOG-01, BLOG-02]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 065 Plan 01: Strapi Slug Field Summary

**Article schema extended with `uid` slug field and lifecycle hooks that auto-generate slugs from title using slugify, with 6 passing Jest unit tests**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T00:43:23Z
- **Completed:** 2026-03-13T00:45:16Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `slug` as `uid` type field targeting `title` in Article schema — Strapi admin auto-generates and enforces uniqueness
- Created `lifecycles.ts` with `beforeCreate` and `beforeUpdate` hooks using `slugify` (lower+strict) — follows exact category lifecycle pattern
- 6 Jest unit tests written and passing: slug generation, Spanish special char handling, no-title guard, title-change detection, unchanged-title guard, no-title-in-update guard

## Task Commits

Each task was committed atomically:

1. **Task 1: Add slug field to Article schema and implement lifecycle hooks** - `5c74151` (feat)
2. **Task 2: Write Jest tests for article lifecycle slug generation** - `3e897d3` (test)

**Plan metadata:** _(docs commit follows)_

_Note: TDD plan — implementation committed first (feat), tests confirmed GREEN state (test)_

## Files Created/Modified
- `apps/strapi/src/api/article/content-types/article/schema.json` - Added `slug` uid field targeting `title`
- `apps/strapi/src/api/article/content-types/article/lifecycles.ts` - beforeCreate + beforeUpdate slug hooks
- `apps/strapi/src/api/article/content-types/article/__tests__/article.lifecycles.test.ts` - 6 Jest unit tests (AAA pattern)

## Decisions Made
- Used `uid` type instead of `string` for the slug field: gives Strapi admin auto-generation UI, enforces uniqueness at the schema level, matches the existing category pattern
- `beforeUpdate` fetches existing article via `entityService.findOne` before overwriting: prevents unnecessary slug regeneration when other fields are updated (title unchanged guard)
- `slugify` with `{ lower: true, strict: true }`: strips accents and special chars (e.g. `¡Artículo Español!` → `articulo-espanol`) for clean, URL-safe slugs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 066 (blog infrastructure) can now use `slug` field for `blog/[slug].vue` routing
- Article API already supports `populate` query params (BLOG-02 — standard Strapi v5 behavior, no custom routes needed)
- The `slug` uid field in Strapi admin will auto-generate from title but can also be manually edited

## Self-Check

- [x] `schema.json` contains `"slug": { "type": "uid", "targetField": "title" }` ✓
- [x] `lifecycles.ts` exists with both hooks ✓
- [x] All 6 Jest tests pass ✓
- [x] `tsc --noEmit` passes with zero errors ✓
- [x] Commits `5c74151` and `3e897d3` exist ✓

## Self-Check: PASSED

---
*Phase: 065-strapi-slug-field*
*Completed: 2026-03-13*

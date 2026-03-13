---
phase: 067-blog-listing-page
plan: "02"
subsystem: ui
tags: [pinia, vue, nuxt, strapi, blog, articles, hero, breadcrumbs]

# Dependency graph
requires:
  - phase: 066-article-infrastructure
    provides: SCSS infrastructure (hero--articles BEM classes), Article TypeScript interface
  - phase: 067-blog-listing-page
    provides: Plan 01 committed articles.store.ts along with CardArticle.vue
provides:
  - Pinia store useArticlesStore with loadArticles(filters, pagination, sort) and reset
  - HeroArticles.vue blog listing hero with BreadcrumbsDefault and static "Blog" h1
affects: [067-blog-listing-page plan 03 (blog/index.vue page that consumes the store and hero)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ArticleResponse direct cast pattern instead of StrapiResponse<T> for article data fetching"
    - "No-persist store pattern for volatile filter-dependent lists"

key-files:
  created:
    - apps/website/app/components/HeroArticles.vue
  modified:
    - apps/website/app/stores/articles.store.ts (committed in plan 01 — verified clean)

key-decisions:
  - "articles.store.ts uses no persist block — articles list is volatile (changes with filters)"
  - "HeroArticles has zero props — blog hero breadcrumbs and title are always static for the index page"
  - "ArticleResponse cast directly (not StrapiResponse<T>) per project AGENTS.md Strapi SDK v5 pattern"

patterns-established:
  - "Static hero components (no props) for pages with fixed breadcrumb/title context"

requirements-completed: [BLOG-14]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 067 Plan 02: Articles Store + HeroArticles Summary

**Pinia articles store with filter/pagination/sort support and static blog hero component using hero--articles BEM classes**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T01:20:24Z
- **Completed:** 2026-03-13T01:22:31Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `useArticlesStore` with `loadArticles(filtersParams, paginationParams, sortParams)` action, pageSize 12
- `ArticleResponse` direct cast pattern — no `StrapiResponse<T>` wrapper (matches Strapi v5 SDK convention)
- `HeroArticles.vue` with `hero--articles` BEM class, static `[Inicio, Blog]` breadcrumbs, and `h1` "Blog"
- `yarn nuxt typecheck` passes with zero TypeScript errors across both files

## Task Commits

Each task was committed atomically:

1. **Task 1: articles.store.ts** — `523f834` (feat — part of 067-01 commit, file verified clean in 067-02)
2. **Task 2: HeroArticles.vue** — `ba661c6` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified
- `apps/website/app/stores/articles.store.ts` — Pinia store for articles list; loadArticles/reset; no persist
- `apps/website/app/components/HeroArticles.vue` — Blog listing hero; hero--articles BEM; static breadcrumbs + h1

## Decisions Made
- No persist on articles store: articles list is filter-dependent and volatile — stale results would be confusing
- HeroArticles accepts zero props: the blog index hero is always "Blog" with "Inicio → Blog" breadcrumbs — no dynamic context needed
- Direct `ArticleResponse` cast (not `StrapiResponse<T>`) per AGENTS.md Strapi SDK v5 cast patterns

## Deviations from Plan

None - plan executed exactly as written. (articles.store.ts was pre-committed in plan 01 with identical content; verified clean with `yarn nuxt typecheck`.)

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `useArticlesStore` ready for consumption by `blog/index.vue` inside `useAsyncData`
- `HeroArticles` ready to render at top of blog listing page
- Plan 03 (blog/index.vue + FilterArticles + ArticleArchive) can proceed

---
*Phase: 067-blog-listing-page*
*Completed: 2026-03-13*

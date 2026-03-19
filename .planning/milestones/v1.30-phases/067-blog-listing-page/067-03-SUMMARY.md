---
phase: 067-blog-listing-page
plan: "03"
subsystem: ui
tags: [vue, nuxt, blog, pinia, typescript, useAsyncData, seo, structured-data, pagination, filter]

# Dependency graph
requires:
  - phase: 067-blog-listing-page
    provides: Plan 01 — CardArticle.vue + RelatedArticles.vue leaf components
  - phase: 067-blog-listing-page
    provides: Plan 02 — useArticlesStore (loadArticles/reset) + HeroArticles.vue
provides:
  - FilterArticles.vue — SSR-safe category + sort dropdowns with isClient guard, filter--articles BEM namespace, URL param updates
  - ArticleArchive.vue — CardArticle grid with vue-awesome-paginate inside client-only, article--archive BEM
  - blog/index.vue — full blog listing page with useAsyncData, SEO ($setSEO + $setStructuredData @type Blog), all components wired
affects:
  - 068-blog-article-page (blog/[slug].vue single article page — builds on same infrastructure)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useAsyncData dynamic key lambda: () => `blog-${category}-${page}-${order}` for SSR cache isolation"
    - "isClient ref + onMounted guard for SSR-safe select hydration in filter components"
    - "Empty state pattern: MessageDefault + RelatedArticles fallback (most recent 12) when no results"
    - "@type: Blog for blog listing page structured data (not BlogPosting — Blog is the correct schema.org collection type)"

key-files:
  created:
    - apps/website/app/components/FilterArticles.vue
    - apps/website/app/components/ArticleArchive.vue
  modified:
    - apps/website/app/pages/blog/index.vue

key-decisions:
  - "definePageMeta({}) with empty object — blog index has no alias needed unlike /anuncios which has /anuncios alias"
  - "@type: Blog (not SearchResultsPage or BlogPosting) — schema.org Blog type is correct for a paginated article listing"
  - "FilterArticles receives categories as prop from page's useAsyncData result — not fetching independently"
  - "Category-aware SEO title: when ?category= is active, uses category name from blogData.value.categories"

patterns-established:
  - "Filter component pattern: receives data as props, watches write only to URL params (router.push), parent (useAsyncData) handles re-fetch"
  - "Archive component pattern: receives articles + pagination as props, handles only pagination click → URL update"

requirements-completed: [BLOG-04, BLOG-05, BLOG-06, BLOG-07, BLOG-08, BLOG-09, BLOG-15, BLOG-16]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 067 Plan 03: Blog Listing Page Assembly Summary

**Full /blog listing page assembled from Plans 01–02: FilterArticles + ArticleArchive components wired to useArticlesStore via useAsyncData with dynamic key, $setSEO/@type:Blog structured data, and empty-state fallback**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T01:24:56Z
- **Completed:** 2026-03-13T01:27:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- `FilterArticles.vue` — SSR-safe with `isClient` guard; category dropdown with categories prop; sort dropdown (Más recientes / Más antiguos); watches update `?category=` and `?order=` URL params, resets `?page=1`; uses `filter--articles` BEM modifier namespace
- `ArticleArchive.vue` — `CardArticle` grid with `article--archive__list` BEM class; `vue-awesome-paginate` inside `<client-only>`; `onClickHandler` scrolls to top + updates `?page=`
- `blog/index.vue` — full replacement of empty stub; `useAsyncData` with dynamic key lambda, `watch` array on category/page/order, `default` value; `$setSEO` + `$setStructuredData` (`@type: "Blog"`) on SSR and via watch; empty state shows `MessageDefault` + `RelatedArticles` fallback (most recent 12)
- `yarn nuxt typecheck` passes with zero TypeScript errors across all 3 files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create FilterArticles.vue and ArticleArchive.vue** - `a3d768c` (feat)
2. **Task 2: Complete blog/index.vue — page assembly, useAsyncData, SEO** - `f783847` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified
- `apps/website/app/components/FilterArticles.vue` — SSR-safe category + sort dropdowns; filter--articles BEM; URL param updates via router.push
- `apps/website/app/components/ArticleArchive.vue` — CardArticle grid; article--archive BEM; vue-awesome-paginate with scrollTo on click
- `apps/website/app/pages/blog/index.vue` — Full blog listing page: useAsyncData (dynamic key, watch, default), HeroArticles + FilterArticles + ArticleArchive + empty state + SEO

## Decisions Made
- `definePageMeta({})` — empty object, no alias needed (blog index is already at `/blog`)
- `@type: "Blog"` for structured data — correct schema.org type for a blog collection/listing, not `BlogPosting` (single post) or `SearchResultsPage`
- `FilterArticles` receives categories as prop from `blogData.value.categories` — no independent fetch, avoids double-fetch
- Category-aware SEO title uses `blogData.value.categories.find(c => c.slug === categorySlug)?.name` — resolves from already-loaded categories in useAsyncData result

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 067 complete: `/blog` listing page fully functional with filtering, sorting, pagination, empty state, and SEO
- Phase 068 (`blog/[slug].vue` single article page) can proceed — all infrastructure (Article type, store, components) is in place
- `RelatedArticles` (Plan 01) already supports same-category article recommendations for article detail pages

---
*Phase: 067-blog-listing-page*
*Completed: 2026-03-13*

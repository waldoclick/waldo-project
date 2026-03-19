---
phase: 067-blog-listing-page
plan: "01"
subsystem: ui
tags: [vue, nuxt, blog, components, typescript, bem, article-card]

# Dependency graph
requires:
  - phase: 066-article-infrastructure
    provides: Article TypeScript type (article.d.ts), BEM SCSS blocks (card--article, related--articles)
provides:
  - CardArticle.vue — article card component with cover, category, title, header, date, read-more link
  - RelatedArticles.vue — related articles block using CardArticle, mirrors RelatedAds pattern
affects:
  - 067-02 (ArticleArchive uses CardArticle)
  - 067-03 (blog/index.vue uses ArticleArchive which uses CardArticle; RelatedArticles used in blog/[slug].vue)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CardArticle mirrors CardAnnouncement pattern with article-specific BEM classes"
    - "RelatedArticles mirrors RelatedAds.vue pattern exactly (same structure, different type/BEM)"
    - "cover[0].formats.medium.url || cover[0].formats.thumbnail.url — Media type has no direct url field"

key-files:
  created:
    - apps/website/app/components/CardArticle.vue
    - apps/website/app/components/RelatedArticles.vue
  modified: []

key-decisions:
  - "Media type (from ad.d.ts) has no direct url field — use formats.medium?.url || formats.thumbnail.url for cover images"
  - "No onMounted CSS custom property for category color — per STATE.md: no category color tint on article cards"
  - "Cover image uses NuxtImg with format=webp, loading=lazy, remote (consistent with CardAnnouncement)"

patterns-established:
  - "Article component pattern: leaf display components (CardArticle, RelatedArticles) built first before container components (ArticleArchive)"

requirements-completed: [BLOG-17, BLOG-20]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 067 Plan 01: Blog Listing Page Display Components Summary

**CardArticle and RelatedArticles leaf components with BEM classes, NuxtImg cover, category badge, truncated title/header, es-CL date, and RelatedAds-mirrored grid**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T01:19:57Z
- **Completed:** 2026-03-13T01:21:57Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `CardArticle.vue` — displays all 6 required fields: cover (NuxtImg webp/lazy), category badge linked to /blog?category=, title (60-char truncation), header (120-char truncation), publishedAt date (es-CL locale, null-guarded), "Leer más" NuxtLink
- `RelatedArticles.vue` — mirrors RelatedAds.vue exactly: loading/error/empty/grid states, related--articles BEM, CardArticle loop
- Both components pass `yarn nuxt typecheck` with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CardArticle.vue** - `523f834` (feat)
2. **Task 2: Create RelatedArticles.vue** - `4a71a59` (feat)

**Plan metadata:** committed with this SUMMARY (docs)

## Files Created/Modified
- `apps/website/app/components/CardArticle.vue` — Article card component: cover image, category badge, title/header truncation, date, read-more link
- `apps/website/app/components/RelatedArticles.vue` — Related articles block with loading/error/empty/grid states, CardArticle loop

## Decisions Made
- `Media` type has no direct `url` field — cover images access `formats.medium?.url || formats.thumbnail.url` (GalleryItem extends Media with `url`, but cover is `Media[]`)
- No `onMounted` CSS custom property for category color — per Phase 066 STATE.md decision: white background, no tint
- Category badge uses `article.categories[0]!` non-null assertion after `length > 0` guard (strict TypeScript)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed cover image URL access for Media type**
- **Found during:** Task 1 (Create CardArticle.vue)
- **Issue:** Plan specified `cover[0]?.formats?.medium?.url || cover[0]?.url || ""` but `Media` type has no direct `url` field (only `GalleryItem extends Media` adds `url`). TypeScript error TS2339.
- **Fix:** Changed to `cover[0]?.formats?.medium?.url || cover[0]?.formats?.thumbnail?.url || ""`
- **Files modified:** apps/website/app/components/CardArticle.vue
- **Verification:** `yarn nuxt typecheck` passes with zero errors
- **Committed in:** 523f834 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed non-null TypeScript errors on categories array access**
- **Found during:** Task 1 (Create CardArticle.vue)
- **Issue:** `article.categories[0].slug` and `article.categories[0].name` reported TS2532 (object is possibly undefined) even after `length > 0` guard
- **Fix:** Added non-null assertion operators: `article.categories[0]!.slug` and `article.categories[0]!.name`
- **Files modified:** apps/website/app/components/CardArticle.vue
- **Verification:** `yarn nuxt typecheck` passes with zero errors
- **Committed in:** 523f834 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs — type mismatches caught by TypeScript strict mode)
**Impact on plan:** Both fixes required for TypeScript correctness. Plan's interface note about `cover[0]?.url` was accurate for GalleryItem but not for Media type. No scope creep.

## Issues Encountered
None — both deviations resolved within Task 1 execution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `CardArticle.vue` and `RelatedArticles.vue` are stable leaf components with zero TypeScript errors
- Plan 02 (`ArticleArchive` + `FilterArticles` + hero components) can proceed immediately
- Plan 03 (`blog/index.vue` + `blog/[slug].vue` pages) depends on Plan 02

---
*Phase: 067-blog-listing-page*
*Completed: 2026-03-13*

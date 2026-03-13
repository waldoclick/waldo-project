# Quick Task 18 — Fix dashboard article edit and preview pages showing blank

**Date:** 2026-03-13
**Status:** Complete

## What was built

Fixed `ArticlesDefault.vue` to use `article.documentId` (with numeric `id` fallback)
when navigating to article view/edit routes.

**Root cause:** The component was calling `handleViewArticle(article.id)` and
`handleEditArticle(article.id)` with a numeric id. The edit/preview pages query Strapi
using `filters: { documentId: { $eq: id } }` — which never matched a numeric value,
returning null and leaving the form/preview blank.

## Files changed

- `apps/dashboard/app/components/ArticlesDefault.vue`
  - `handleViewArticle(articleId: number)` → `handleViewArticle(article: Article)`
  - `handleEditArticle(articleId: number)` → `handleEditArticle(article: Article)`
  - Routes now use `article.documentId || article.id`
  - Template call sites updated to pass full article object

## Verification

- `yarn nuxt typecheck` → zero errors

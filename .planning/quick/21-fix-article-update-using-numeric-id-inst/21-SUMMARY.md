# Quick Task 21: Fix Article Update Using Numeric ID Instead of documentId Causing 400 Error

**Date:** 2026-03-13
**Status:** Complete

## Root Cause

`FormArticle.vue` was calling `strapi.update("articles", articleId, payload)` where `articleId` is a numeric integer (e.g. `12`).

Strapi v5 `PUT /api/articles/:documentId` requires a UUID `documentId` string (e.g. `abc-uuid-xxx`). Passing a numeric id caused Strapi to return a 400/422 error — it doesn't find any document matching an integer in the `documentId` slot.

The code already had `documentId` (the UUID string) computed from `props.article.documentId || route.params.id` just above the update call, but never used it for the actual `strapi.update()` invocation.

Additionally, the code contained a now-unnecessary `strapi.find()` lookup to resolve the numeric `articleId` from `documentId` — this whole block was dead weight once we stopped needing the numeric id.

## Fix

1. Changed `strapi.update("articles", articleId, ...)` → `strapi.update("articles", documentId, ...)`
2. Changed the guard check from `if (!articleId)` → `if (!documentId)`
3. Removed the dead numeric-id lookup block (`strapi.find` by `documentId` filter) — 12 lines deleted

## File Changed

| File | Change |
|------|--------|
| `apps/dashboard/app/components/FormArticle.vue` | Use `documentId` (UUID) in `strapi.update`; remove numeric id lookup; update guard check |

## Verification

- `yarn --cwd apps/dashboard nuxt typecheck` → zero errors ✓
- Network request will now hit `PUT /api/articles/{uuid}` instead of `PUT /api/articles/12`

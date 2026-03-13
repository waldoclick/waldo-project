# Quick Task 20: Fix Article Body Being Reset to Null on Save in Edit Page

**Date:** 2026-03-13
**Status:** Complete

## Root Cause

`articles/[id]/edit.vue` had an `ArticleData` interface missing the `body` field. When Strapi returned the article with `body: "..."`, the TypeScript cast stripped the field, making `props.article.body = undefined` in `FormArticle`.

`hydrateForm()` then set `form.value.body = props.article?.body || "" = ""`. When the `watch` on `props.article` re-fired (on any reactive change), it called `hydrateForm()` again — resetting the body back to `""` even after the user had typed content. On submit, `"".trim() || null` = `null`, hence `body: null` in every network request.

## Fix

Added `body?: string` to the `ArticleData` interface in `apps/dashboard/app/pages/articles/[id]/edit.vue`.

With `body` present in the interface, `props.article.body` correctly holds the existing body content, `hydrateForm()` initialises the textarea with the real value, and user edits are preserved through the reactive watch cycle.

## File Changed

| File | Change |
|------|--------|
| `apps/dashboard/app/pages/articles/[id]/edit.vue` | Added `body?: string` to `ArticleData` interface |

## Verification

- `grep "body" apps/dashboard/app/pages/articles/\[id\]/edit.vue` → `body?: string` present ✓
- `yarn --cwd apps/dashboard nuxt typecheck` → zero errors ✓

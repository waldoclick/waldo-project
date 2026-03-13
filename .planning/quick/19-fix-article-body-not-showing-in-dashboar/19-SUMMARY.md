# Quick Task 19: Fix Article Body Not Showing in Dashboard Edit and Preview Pages

**Date:** 2026-03-13
**Status:** Complete

## What Was Done

Two targeted one-line fixes to restore the article body field in the dashboard.

### Task 1: FormArticle.vue — payload bug fix

**Root cause:** `handleSubmit(values)` used `values.body` from vee-validate's submission context. But `TextareaArticle` is rendered as a plain `v-model` component outside any `<Field>` wrapper, so vee-validate never registers `body` — making `values.body` always `undefined` on submit. Every save was silently wiping the body.

**Fix:** Changed `payload.body` from `(values.body as string)?.trim() || null` to `form.value.body?.trim() || null`. The `form.value.body` ref is already correctly bound via `v-model` to `TextareaArticle` and hydrated from `props.article` in `hydrateForm()`.

### Task 2: articles/[id]/index.vue — missing body in preview

**Root cause:** `ArticleData` interface was missing the `body` field, and the `BoxInformation` template had no `<CardInfo>` for it — so the body was simply never rendered.

**Fix:**
- Added `body?: string` to the `ArticleData` interface
- Added `<CardInfo v-if="article" title="Cuerpo" :description="article.body" />` after "Encabezado" in the `#content` slot

## Files Changed

| File | Change |
|------|--------|
| `apps/dashboard/app/components/FormArticle.vue` | `values.body` → `form.value.body` in payload |
| `apps/dashboard/app/pages/articles/[id]/index.vue` | Added `body` to interface + `<CardInfo>` in template |

## Verification

- `grep "values.body" FormArticle.vue` → 0 matches ✓
- `grep "article.body" index.vue` → 1 match (CardInfo) ✓
- `yarn --cwd apps/dashboard nuxt typecheck` → zero errors ✓

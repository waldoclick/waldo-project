# Quick Task 23: Fix Article Body Paragraph Spacing in Website and Dashboard Preview

**Date:** 2026-03-13
**Status:** Complete

## Root Causes

**Website:** `ArticleSingle.vue` correctly uses `v-html="parseMarkdown(article.body)"` which produces `<p>` tags via `marked`. However `.article--single__body__description__text` had no CSS rules for `p`, `h2`, `ul`, `li`, or `blockquote` — so paragraphs rendered with zero spacing (CSS reset removes browser defaults).

**Dashboard:** The article preview page used `<CardInfo title="Cuerpo" :description="article.body" />` which renders via text interpolation (`{{ description }}`). Raw Markdown `\n\n` collapses to a single space in HTML — all paragraphs ran together as one block.

## Fixes

### Website — `_article.scss`
Added prose styles inside `.article--single__body__description__text`:
- `p { margin-bottom: 1em; &:last-child { margin-bottom: 0; } }`
- `h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }`
- `ul, ol { margin-bottom: 1em; padding-left: 1.5em; }`
- `li { margin-bottom: 0.25em; }`
- `blockquote` with left border

### Dashboard — `articles/[id]/index.vue`
Replaced `CardInfo` for "Cuerpo" with an inline prose block using `white-space: pre-wrap` — preserves `\n\n` as visible line breaks without needing Markdown parsing in the dashboard (which doesn't have `marked` installed).

## Files Changed

| File | Change |
|------|--------|
| `apps/website/app/scss/components/_article.scss` | Added prose paragraph/heading/list/blockquote styles |
| `apps/dashboard/app/pages/articles/[id]/index.vue` | Replaced CardInfo body with pre-wrap prose block |

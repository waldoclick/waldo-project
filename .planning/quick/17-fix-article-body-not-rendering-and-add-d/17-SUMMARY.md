---
phase: quick-17
plan: 01
subsystem: website/blog
tags: [blog, article, hero, markdown, rendering, date]
dependency_graph:
  requires: [phase-068-02]
  provides: [article-hero-date, article-body-rendering-verified]
  affects: [apps/website/app/components/HeroArticle.vue, apps/website/app/pages/blog/[slug].vue, apps/website/app/scss/components/_hero.scss]
tech_stack:
  added: []
  patterns: [Intl.DateTimeFormat es-CL, BEM hero--article__date, v-if formattedDate]
key_files:
  modified:
    - apps/website/app/components/HeroArticle.vue
    - apps/website/app/pages/blog/[slug].vue
    - apps/website/app/scss/components/_hero.scss
  created: []
decisions:
  - "publishedAt formatted with Intl.DateTimeFormat es-CL locale — matches Chile's date format"
  - "formattedDate computed returns null (not empty string) to allow clean v-if conditional rendering"
  - "Article body rendering code path confirmed intact — no changes needed to ArticleSingle.vue or useSanitize.ts"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-03-13"
  tasks_completed: 2
  files_modified: 3
---

# Quick Task 17: Fix Article Body Not Rendering and Add Date Summary

**One-liner:** Added `publishedAt` prop with `Intl.DateTimeFormat es-CL` date display to `HeroArticle.vue`; confirmed Markdown→HTML body rendering path already intact via `marked` + `sanitizeRich`.

## What Was Done

### Task 1: Add publishedAt prop and date display to HeroArticle (feat)

Three files updated atomically:

**`HeroArticle.vue`**
- Added `publishedAt: string | null` to `defineProps<{}>` (alongside existing `title`, `categoryName`, `categorySlug`)
- Added `formattedDate` computed using `Intl.DateTimeFormat("es-CL", { year: "numeric", month: "long", day: "numeric" })` — returns `null` when `publishedAt` is null
- Added `<div v-if="formattedDate" class="hero--article__date"><time :datetime="props.publishedAt ?? ''">{{ formattedDate }}</time></div>` below the H1 title div

**`blog/[slug].vue`**
- Added `:published-at="pageData.article.publishedAt"` to `<HeroArticle>` usage — passes ISO date string (or null for drafts)

**`_hero.scss`**
- Added `&__date` BEM element inside `&--article {}` block:
  ```scss
  &__date {
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.25px;
    color: $charcoal;
    margin-top: -10px;
    time { font-style: normal; }
  }
  ```
- No `box-shadow`, no `transform: scale` — SCSS nesting mirrors HTML hierarchy exactly

**Commit:** `02d4d03`

### Task 2: Verify article body rendering path is intact (no-op)

Audit confirmed all three conditions already correct — **no code changes made**:

1. ✅ `ArticleSingle.vue` line 12: `v-html="parseMarkdown(props.article.body)"` — already wired
2. ✅ `ArticleSingle.vue` line 48: `const { parseMarkdown } = useSanitize();` — already imported
3. ✅ `useSanitize.ts` lines 115–118: `parseMarkdown` defined and exported — runs `marked.parse(markdown, { async: false })` then `sanitizeRich(html)`
4. ✅ `apps/website/package.json`: `"marked": "^17.0.4"` — installed

Article body was rendering correctly via the existing code path. The plan's no-op verification was accurate.

## Verification Results

```
grep: publishedAt, formattedDate, hero--article__date — all 3 present in HeroArticle.vue ✅
grep: :published-at — present in blog/[slug].vue ✅
grep: &__date — present in _hero.scss ✅
grep: parseMarkdown — present in ArticleSingle.vue (import + usage) ✅
TypeScript typecheck — zero errors ✅
```

## Deviations from Plan

None — plan executed exactly as written. Task 1 made all three file changes. Task 2 confirmed no fixes needed.

## Self-Check

- [x] `apps/website/app/components/HeroArticle.vue` — modified with publishedAt prop + formattedDate + date element
- [x] `apps/website/app/pages/blog/[slug].vue` — modified with :published-at prop
- [x] `apps/website/app/scss/components/_hero.scss` — modified with &__date BEM element
- [x] Commit `02d4d03` exists — verified via `git log`

## Self-Check: PASSED

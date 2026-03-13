---
phase: 17-fix-article-body-not-rendering-and-add-d
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/components/HeroArticle.vue
  - apps/website/app/pages/blog/[slug].vue
  - apps/website/app/scss/components/_hero.scss
autonomous: true
requirements: [QUICK-17]

must_haves:
  truths:
    - "Article body renders formatted content (headings, lists, paragraphs) — not blank"
    - "Article hero shows publishedAt date below the H1 title"
    - "Date is only shown when publishedAt is non-null"
  artifacts:
    - path: "apps/website/app/components/HeroArticle.vue"
      provides: "Hero with publishedAt prop displayed as formatted date"
      contains: "publishedAt"
    - path: "apps/website/app/pages/blog/[slug].vue"
      provides: "Passes publishedAt from article to HeroArticle"
      contains: ":published-at"
    - path: "apps/website/app/scss/components/_hero.scss"
      provides: "BEM element hero--article__date styled"
      contains: "hero--article__date"
  key_links:
    - from: "apps/website/app/pages/blog/[slug].vue"
      to: "apps/website/app/components/HeroArticle.vue"
      via: ":published-at prop"
      pattern: ":published-at"
    - from: "apps/website/app/components/ArticleSingle.vue"
      to: "apps/website/app/composables/useSanitize.ts"
      via: "parseMarkdown(props.article.body)"
      pattern: "parseMarkdown"
---

<objective>
Fix two rendering issues on the article detail page:

1. **Body not rendering** — `ArticleSingle.vue` already calls `parseMarkdown(props.article.body)` and `useSanitize.ts` already exports `parseMarkdown` (uses `marked` to convert Markdown → HTML, then `sanitizeRich`). The wiring is already correct. The fix is a **no-op verification** — confirm the code path is intact and no regression exists. No changes needed to `ArticleSingle.vue` or `useSanitize.ts`.

2. **Date below hero title** — `HeroArticle.vue` accepts `title`, `categoryName`, `categorySlug` props but has no `publishedAt`. Add the prop, render it below the `<h1>` as a formatted date, add BEM element to SCSS, and pass the prop from `blog/[slug].vue`.

Purpose: Articles display their full body content and publication date, making the article detail page fully functional.
Output: Updated `HeroArticle.vue`, `blog/[slug].vue`, and `_hero.scss`.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/website/app/components/HeroArticle.vue
@apps/website/app/components/ArticleSingle.vue
@apps/website/app/composables/useSanitize.ts
@apps/website/app/types/article.d.ts
@apps/website/app/scss/components/_hero.scss
@apps/website/app/pages/blog/[slug].vue

<interfaces>
<!-- Article type — article.d.ts -->
```typescript
export interface Article {
  id: number;
  documentId: string;
  title: string;
  header: string;
  body: string;          // Strapi richtext = raw Markdown
  slug: string;
  cover: Media[];
  gallery: GalleryItem[];
  categories: Category[];
  seo_title: string | null;
  seo_description: string | null;
  publishedAt: string | null;  // ISO date string, null when draft
  createdAt: string;
}
```

<!-- useSanitize — already exports parseMarkdown -->
```typescript
const parseMarkdown = (markdown: string): string => {
  if (!markdown) return "";
  const html = marked.parse(markdown, { async: false }) as string;
  return sanitizeRich(html);
};
```

<!-- HeroArticle current props -->
```typescript
defineProps<{
  title: string;
  categoryName: string;
  categorySlug: string;
}>()
```

<!-- _hero.scss — &--article block (lines 377–394) -->
```scss
&--article {
  background-color: $white_smoke;

  &__container {
    @extend .container;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__breadcrumbs { display: flex; }

  &__title { margin-bottom: 0; }
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add publishedAt prop and date display to HeroArticle, pass prop from slug page, style in SCSS</name>
  <files>
    apps/website/app/components/HeroArticle.vue,
    apps/website/app/pages/blog/[slug].vue,
    apps/website/app/scss/components/_hero.scss
  </files>
  <action>
**HeroArticle.vue** — three changes:

1. Add `publishedAt: string | null` to `defineProps<{}>`. Keep existing `title`, `categoryName`, `categorySlug`.

2. Add a computed `formattedDate` that formats the ISO string using `Intl.DateTimeFormat`:
   ```typescript
   const formattedDate = computed(() => {
     if (!props.publishedAt) return null;
     return new Intl.DateTimeFormat("es-CL", {
       year: "numeric",
       month: "long",
       day: "numeric",
     }).format(new Date(props.publishedAt));
   });
   ```

3. In the template, after the `hero--article__title` div, add:
   ```html
   <div v-if="formattedDate" class="hero--article__date">
     <time :datetime="props.publishedAt ?? ''">{{ formattedDate }}</time>
   </div>
   ```

**blog/[slug].vue** — add `:published-at` to the `<HeroArticle>` usage:
```html
<HeroArticle
  :title="pageData.article.title"
  :category-name="pageData.article.categories[0]?.name || ''"
  :category-slug="pageData.article.categories[0]?.slug || ''"
  :published-at="pageData.article.publishedAt"
/>
```

**_hero.scss** — inside `&--article { }` block (after `&__title`), add:
```scss
&__date {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.25px;
  color: $charcoal;
  margin-top: -10px;

  time {
    font-style: normal;
  }
}
```

Do NOT add `box-shadow` or `transform: scale`. Keep SCSS nesting mirroring HTML hierarchy. BEM: `hero--article__date` is a direct element of `hero--article` — nest under `&--article { }` as `&__date { }`.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "error|HeroArticle|slug" | head -20 || echo "typecheck passed"</automated>
  </verify>
  <done>
    - `HeroArticle.vue` accepts `publishedAt: string | null` and renders it as `hero--article__date` when non-null
    - `blog/[slug].vue` passes `:published-at="pageData.article.publishedAt"` — no TypeScript errors
    - `_hero.scss` has `&__date` BEM element under `&--article`
    - TypeScript typecheck reports zero new errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Verify article body rendering path is intact</name>
  <files>
    apps/website/app/components/ArticleSingle.vue,
    apps/website/app/composables/useSanitize.ts
  </files>
  <action>
Audit the existing code path — make changes ONLY if a bug is found:

1. Confirm `ArticleSingle.vue` imports `useSanitize` and calls `parseMarkdown(props.article.body)` in `v-html`.
2. Confirm `useSanitize.ts` exports `parseMarkdown` which runs `marked.parse(markdown, { async: false })` then `sanitizeRich(html)`.
3. Confirm `marked` is listed in `apps/website/package.json` dependencies.

If all three are already correct (they appear to be based on the files read during planning), make **no changes** — document the verification result in the task output.

If any gap is found (e.g., `parseMarkdown` not exported, import missing, `marked` not installed), fix it:
- Missing export → add to the `return {}` block in `useSanitize.ts`
- Missing import in component → add import line
- `marked` not installed → run `yarn workspace website add marked` and note the version added

Do NOT refactor `sanitizeRich` or change existing sanitization logic.
  </action>
  <verify>
    <automated>cd apps/website && grep -n "parseMarkdown" app/components/ArticleSingle.vue app/composables/useSanitize.ts && grep "marked" package.json</automated>
  </verify>
  <done>
    - `parseMarkdown` is imported and used in `ArticleSingle.vue`
    - `parseMarkdown` is defined and exported from `useSanitize.ts`
    - `marked` is in `apps/website/package.json`
    - Article body will render formatted HTML from Strapi Markdown richtext
  </done>
</task>

</tasks>

<verification>
After both tasks:

1. Run TypeScript check: `cd apps/website && yarn nuxt typecheck` — zero errors related to HeroArticle props or ArticleSingle
2. Verify grep: `grep -n "publishedAt\|formattedDate\|hero--article__date" apps/website/app/components/HeroArticle.vue` — all three present
3. Verify grep: `grep -n "published-at" apps/website/app/pages/blog/\[slug\].vue` — prop passed
4. Verify grep: `grep -n "__date" apps/website/app/scss/components/_hero.scss` — BEM element present
5. Verify grep: `grep -n "parseMarkdown" apps/website/app/components/ArticleSingle.vue` — already wired
</verification>

<success_criteria>
- Article detail page hero shows formatted date (e.g. "13 de marzo de 2026") below H1 for published articles
- Hero date is hidden when `publishedAt` is null (draft articles)
- Article body renders full Markdown-to-HTML output — headings, lists, paragraphs visible, not blank
- Zero TypeScript errors introduced
- All SCSS follows BEM: `hero--article__date` scoped under `&--article`, no `box-shadow` or `transform: scale`
</success_criteria>

<output>
After completion, create `.planning/quick/17-fix-article-body-not-rendering-and-add-d/17-SUMMARY.md` with what was changed, files modified, and verification results.
</output>

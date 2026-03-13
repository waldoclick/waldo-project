---
phase: quick-19
plan: 19
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/FormArticle.vue
  - apps/dashboard/app/pages/articles/[id]/index.vue
autonomous: true
requirements: []

must_haves:
  truths:
    - "Saving an article edit persists the body field (not undefined)"
    - "The article preview page shows the Cuerpo (body) field"
  artifacts:
    - path: "apps/dashboard/app/components/FormArticle.vue"
      provides: "Payload uses form.value.body instead of values.body"
    - path: "apps/dashboard/app/pages/articles/[id]/index.vue"
      provides: "ArticleData interface includes body field, CardInfo renders it"
  key_links:
    - from: "FormArticle.vue handleSubmit"
      to: "payload.body"
      via: "form.value.body (not values.body)"
      pattern: "form\\.value\\.body"
    - from: "articles/[id]/index.vue template"
      to: "article.body"
      via: "CardInfo :description"
      pattern: "article\\.body"
---

<objective>
Fix two related bugs that prevent the article body field from appearing in the dashboard:

1. **Edit bug (FormArticle.vue):** `handleSubmit` reads `values.body` from vee-validate's submission context, but `TextareaArticle` is not wrapped in a `<Field>`, so `values.body` is always `undefined`. Fix: use `form.value.body` directly.

2. **Preview bug (articles/[id]/index.vue):** The `ArticleData` interface is missing the `body` field and no `<CardInfo>` renders it. Fix: add `body?: string` to the interface and a `<CardInfo title="Cuerpo">` after "Encabezado".

Purpose: Article body content is lost on save and invisible on preview — both bugs stem from the same missing `body` wiring.
Output: Two files patched; body saves correctly and displays in preview.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/dashboard/app/components/FormArticle.vue
@apps/dashboard/app/pages/articles/[id]/index.vue
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix FormArticle.vue — use form.value.body in payload</name>
  <files>apps/dashboard/app/components/FormArticle.vue</files>
  <action>
In `handleSubmit`, the `payload` object at line 139 reads `values.body`. Because `TextareaArticle` is rendered outside any vee-validate `<Field>`, `values.body` is always `undefined`.

Replace the `body` line inside `payload` from:
```ts
body: (values.body as string)?.trim() || null,
```
to:
```ts
body: form.value.body?.trim() || null,
```

No other changes needed — `form.value.body` is already correctly bound via `v-model` to `TextareaArticle` and hydrated from `props.article` in `hydrateForm()`.
  </action>
  <verify>
Search for `form.value.body` in FormArticle.vue — must appear in the payload construction block. Search for `values.body` — must no longer appear anywhere in the file.

```bash
grep -n "values\.body\|form\.value\.body" apps/dashboard/app/components/FormArticle.vue
```

Expected: only `form.value.body` appears (no `values.body`).
  </verify>
  <done>The payload correctly sends the body content typed in TextareaArticle on form submit; `values.body` is gone from the file.</done>
</task>

<task type="auto">
  <name>Task 2: Fix articles/[id]/index.vue — add body to interface and preview</name>
  <files>apps/dashboard/app/pages/articles/[id]/index.vue</files>
  <action>
Two changes in this file:

**1. Add `body` to the `ArticleData` interface** (line 69–79). Add `body?: string` after `header`:
```ts
interface ArticleData {
  id?: number;
  documentId?: string;
  title?: string;
  header?: string;
  body?: string;        // ← add this line
  seo_title?: string;
  seo_description?: string;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

**2. Add a `<CardInfo>` for "Cuerpo"** in the `#content` slot, immediately after the existing "Encabezado" `<CardInfo>` (after line 25). Insert:
```html
<CardInfo
  v-if="article"
  title="Cuerpo"
  :description="article.body"
/>
```

No other changes — leave sidebar, imports, and data-fetching logic untouched.
  </action>
  <verify>
```bash
grep -n "body" apps/dashboard/app/pages/articles/\[id\]/index.vue
```

Expected output includes:
- `body?: string` in the interface
- `title="Cuerpo"` and `:description="article.body"` in the template
  </verify>
  <done>The preview page shows a "Cuerpo" row with the article body content; TypeScript accepts `article.body` without errors.</done>
</task>

</tasks>

<verification>
After both tasks:

```bash
# Confirm values.body is gone from FormArticle
grep -c "values\.body" apps/dashboard/app/components/FormArticle.vue
# Expected: 0

# Confirm body field present in preview page
grep -c "article\.body" apps/dashboard/app/pages/articles/\[id\]/index.vue
# Expected: 1

# TypeScript check (dashboard)
yarn --cwd apps/dashboard nuxt typecheck 2>&1 | grep -E "error|warning" | head -20
```
</verification>

<success_criteria>
- `values.body` no longer appears in `FormArticle.vue`
- `form.value.body` is used in the payload
- `ArticleData` interface in `articles/[id]/index.vue` includes `body?: string`
- A `<CardInfo title="Cuerpo">` renders `article.body` in the preview template
- No TypeScript errors introduced in the dashboard app
</success_criteria>

<output>
After completion, create `.planning/quick/19-fix-article-body-not-showing-in-dashboar/19-SUMMARY.md` with what was changed and verified.
</output>

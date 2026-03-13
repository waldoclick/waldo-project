---
phase: quick-28
plan: 28
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/stores/articles.store.ts
  - apps/dashboard/app/components/LightBoxArticles.vue
autonomous: true
requirements: [QUICK-28]

must_haves:
  truths:
    - "Clicking 'Crear' with a URL already in the AI cache shows a Swal asking to reuse or regenerate"
    - "Using a cached response skips the Groq API call entirely"
    - "Posting to Strapi first checks for an existing article with the same source_url"
    - "If a duplicate is found, a Swal shows 'Esta noticia ya existe' with a button to edit it"
    - "The articles store has no persist (cache is session-only)"
  artifacts:
    - path: "apps/dashboard/app/stores/articles.store.ts"
      provides: "AI response cache keyed by source URL"
      exports: ["useArticlesStore", "IAIArticleCache"]
    - path: "apps/dashboard/app/components/LightBoxArticles.vue"
      provides: "Updated handleGenerate with cache check + duplicate check"
  key_links:
    - from: "LightBoxArticles.vue"
      to: "useArticlesStore"
      via: "getAICache / setAICache"
      pattern: "articlesStore\\.getAICache"
    - from: "LightBoxArticles.vue"
      to: "/articles?filters[source_url][$eq]="
      via: "useStrapiClient duplicate check before POST"
      pattern: "filters.*source_url"
---

<objective>
Add AI response caching and duplicate article detection to LightBoxArticles.

Purpose: Avoid redundant Groq API calls for the same news URL, and prevent creating articles that already exist in Strapi.
Output: `articles.store.ts` (session AI cache) + updated `LightBoxArticles.vue` with two new guard flows in `handleGenerate`.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/dashboard/app/stores/search.store.ts
@apps/dashboard/app/components/LightBoxArticles.vue
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create articles.store.ts with AI response cache</name>
  <files>apps/dashboard/app/stores/articles.store.ts</files>
  <action>
Create `apps/dashboard/app/stores/articles.store.ts` following the same Composition-API style as `search.store.ts`.

The store must:
- Define and export `IAIArticleCache` interface:
  ```ts
  export interface IAIArticleCache {
    sourceUrl: string;
    result: {
      title: string;
      header: string;
      body: string;
      seo_title: string;
      seo_description: string;
    };
    cachedAt: number;
  }
  ```
- Hold state: `aiCache = ref<Record<string, IAIArticleCache>>({})` — keyed by source URL string.
- Expose three methods:
  - `getAICache(sourceUrl: string): IAIArticleCache | null` — returns entry or null
  - `hasAICache(sourceUrl: string): boolean` — returns true if key exists with a result
  - `setAICache(sourceUrl: string, result: IAIArticleCache["result"]): void` — stores `{ sourceUrl, result, cachedAt: Date.now() }`
- Store ID: `"articles"`.
- NO `persist` option — session-only cache. Do NOT add persist or any localStorage config.
- Export as `useArticlesStore`.
  </action>
  <verify>
    <automated>yarn --cwd apps/dashboard typecheck 2>&1 | grep -c "articles.store" || echo "0 errors in articles.store"</automated>
  </verify>
  <done>File exists, TypeScript compiles without errors for the new store, no persist block present.</done>
</task>

<task type="auto">
  <name>Task 2: Add AI cache check and duplicate article guard in LightBoxArticles.vue</name>
  <files>apps/dashboard/app/components/LightBoxArticles.vue</files>
  <action>
Modify `handleGenerate()` in `LightBoxArticles.vue` to add two guards **before** the Groq call and **before** the Strapi POST respectively.

**Step A — Import and instantiate the articles store:**
In the `<script setup>` block, after the existing `searchStore` line, add:
```ts
import { useArticlesStore } from "@/stores/articles.store";
const articlesStore = useArticlesStore();
```

**Step B — AI cache check (before the Groq API call):**
After the `bodyText` empty-check block and before the `fullPrompt` construction, insert:

```ts
// Check AI cache first
let parsed: { title: string; header: string; body: string; seo_title: string; seo_description: string } | null = null;

if (articlesStore.hasAICache(item.link)) {
  const { isConfirmed, isDismissed } = await Swal.fire({
    title: "Respuesta guardada",
    text: "Ya generamos un artículo para esta noticia. ¿Quieres usar la respuesta guardada o generar una nueva?",
    icon: "question",
    showConfirmButton: true,
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: "Usar guardada",
    denyButtonText: "Generar nueva",
  });
  if (isDismissed) { loading.value = false; return; }
  if (isConfirmed) {
    parsed = articlesStore.getAICache(item.link)!.result;
  }
}
```

Then wrap the existing Groq call in an `if (!parsed)` block (so it only fires when no cache was used):
```ts
if (!parsed) {
  // 2. Build the final prompt ... (existing fullPrompt code)
  // 3. Send to Groq ... (existing client call)
  // 4. Parse JSON response ... (existing JSON.parse)
  // After parsing: cache the result
  articlesStore.setAICache(item.link, parsed!);
}
```

Make sure the `setAICache` call is placed right after the successful `JSON.parse`, before the duplicate check below.

**Step C — Duplicate article guard (before the Strapi POST):**
Replace the existing Strapi POST block (step 5) with:

```ts
// 5. Check for duplicate before creating
type ArticleListResponse = { data: { documentId: string }[] };
const existing = await client<ArticleListResponse>("/articles", {
  params: { filters: { source_url: { $eq: item.link } } } as Record<string, unknown>,
});

if (existing.data && existing.data.length > 0) {
  const docId = existing.data[0]!.documentId;
  await Swal.fire({
    title: "Esta noticia ya existe",
    text: "Ya existe un artículo creado con esta URL de origen.",
    icon: "warning",
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: "Ir al artículo",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await navigateTo(`/articles/edit/${docId}`);
      handleClose();
    }
  });
  return;
}

// 6. Create the article draft in Strapi — source_url always from Tavily, never from AI
await client("/articles?status=draft", {
  method: "POST",
  body: {
    data: {
      title: parsed!.title,
      header: parsed!.header,
      body: parsed!.body,
      seo_title: parsed!.seo_title,
      seo_description: parsed!.seo_description,
      source_url: item.link,
    },
  },
});

emit("created");
handleClose();
```

Note: the `Swal.fire` uses `await` + `.then()` here because there are two branches; alternatively use `const dupResult = await Swal.fire(...)` and check `dupResult.isConfirmed`. Use whichever is cleaner without nesting async inside `.then`.

The final `parsed` variable must be typed as `{ title: string; header: string; body: string; seo_title: string; seo_description: string }` (not null) at the POST site — ensure TypeScript is satisfied (use `parsed!` or a type guard).

After all changes, run `yarn --cwd apps/dashboard typecheck` to confirm no TS errors.
  </action>
  <verify>
    <automated>yarn --cwd apps/dashboard typecheck 2>&1 | tail -5</automated>
  </verify>
  <done>
  - `articlesStore.hasAICache` called before Groq in handleGenerate
  - Swal shown when cache hit, with "Usar guardada" / "Generar nueva" options
  - `articlesStore.setAICache` called after successful Groq parse
  - Duplicate check via GET /articles with source_url filter runs before POST
  - If duplicate found: Swal "Esta noticia ya existe" with button navigating to `/articles/edit/[documentId]`
  - TypeScript compiles without errors
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `yarn --cwd apps/dashboard typecheck` — zero errors
2. Open LightBoxArticles, select a news item, click "Crear" twice for the same item — second time should show "Respuesta guardada" Swal
3. If an article with the same URL already exists in Strapi, "Esta noticia ya existe" Swal appears with edit link
</verification>

<success_criteria>
- `apps/dashboard/app/stores/articles.store.ts` exists with `IAIArticleCache` interface and no persist
- `LightBoxArticles.vue` checks AI cache before calling Groq, stores response after parse
- `LightBoxArticles.vue` checks for duplicate `source_url` in Strapi before POST
- Duplicate found → Swal with navigate to `/articles/edit/[documentId]`
- Zero TypeScript errors in dashboard
</success_criteria>

<output>
After completion, create `.planning/quick/28-mejorar-store-de-articles-con-cache-de-r/28-SUMMARY.md` following the summary template.
</output>

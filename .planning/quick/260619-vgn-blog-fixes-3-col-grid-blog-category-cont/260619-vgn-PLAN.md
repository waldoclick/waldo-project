---
phase: quick-260619-vgn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/api/blog-category/content-types/blog-category/schema.json
  - apps/strapi/src/api/blog-category/controllers/blog-category.ts
  - apps/strapi/src/api/blog-category/services/blog-category.ts
  - apps/strapi/src/api/blog-category/routes/blog-category.ts
  - apps/strapi/src/api/article/content-types/article/schema.json
  - apps/strapi/seeders/blog-categories.ts
  - apps/strapi/seeders/articles.ts
  - apps/strapi/src/index.ts
  - apps/website/app/stores/blog-categories.store.ts
  - apps/website/app/types/blog-category.d.ts
  - apps/website/app/types/article.d.ts
  - apps/website/app/pages/blog/index.vue
  - apps/website/app/components/FilterArticles.vue
  - apps/website/app/components/ArticleArchive.vue
  - apps/website/app/components/CardArticle.vue
  - apps/website/app/components/ArticleSingle.vue
autonomous: true
requirements: [BLOG-FIX]

must_haves:
  truths:
    - "GET /api/blog-categories (with X-Proxy-Key) returns the 7 blog categories"
    - "The sqlite DB has 7 blog_categories rows and ~8 articles each linked to one blog_category"
    - "The /blog category dropdown lists Guía de compra / Mercado / Mantención / … (NOT Minería/Construcción)"
    - "The /blog article grid is 3 columns filling full width (no empty right-side column)"
    - "Filtering /blog by a blog-category slug returns only that category's articles"
    - "An article page badge shows the article's blog category name + accent hue"
    - "The 'Buscar artículos…' search input renders correctly (matches maqueta)"
  artifacts:
    - path: "apps/strapi/src/api/blog-category/content-types/blog-category/schema.json"
      provides: "blog-category content type (name, slug uid, color)"
      contains: "blog-category"
    - path: "apps/strapi/src/api/blog-category/routes/blog-category.ts"
      provides: "public read routes (find + findOne with auth:false)"
      contains: "auth: false"
    - path: "apps/strapi/seeders/blog-categories.ts"
      provides: "7 blog-category seed rows, idempotent by slug"
    - path: "apps/strapi/seeders/articles.ts"
      provides: "~8 sample articles each connected to one blog_category"
    - path: "apps/website/app/stores/blog-categories.store.ts"
      provides: "blog-categories fetch store"
  key_links:
    - from: "apps/strapi/src/api/article/content-types/article/schema.json"
      to: "api::blog-category.blog-category"
      via: "manyToMany blog_categories relation"
      pattern: "blog_categories"
    - from: "apps/strapi/src/index.ts"
      to: "seeders/blog-categories + seeders/articles"
      via: "bootstrap await calls (blog-categories before articles)"
      pattern: "populateBlogCategories|populateArticles"
    - from: "apps/website/app/pages/blog/index.vue"
      to: "blog-categories store + blog_categories filter"
      via: "useBlogCategoriesStore + blog_categories: { slug: { $eq } }"
      pattern: "blog_categories"
    - from: "apps/website/app/components/ArticleArchive.vue"
      to: "article--archive__list--blog (3-col grid)"
      via: "gridBlog prop"
      pattern: "gridBlog|article--archive__list--blog"
---

<objective>
Replace the misused AD categories on the blog with a real BLOG taxonomy and fix the
/blog list layout. Create a new Strapi `blog-category` content type (publicly readable
via the proxy), add a `blog_categories` manyToMany relation to articles, seed 7 blog
categories + ~8 sample articles, then wire the website to use blog categories for the
filter/badges and render the article grid as a full-width 3-column layout.

Purpose: The blog currently shows industry AD categories (Minería, Construcción…) in
its filter and badges, and the grid renders 4 columns leaving an empty right-side gap.
This makes the blog look wrong and unfinished.

Output: New `blog-category` API + relation + seeders, a website blog-categories store,
and frontend wiring (filter, grid, badges, search input verified) — all DB- and
visually-verified.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@./CLAUDE.md

<critical_findings>
ROOT-CAUSE NOTES (verified during planning — trust these over the original task hints):

1. The 3-column blog grid SCSS ALREADY EXISTS and is correct:
   `_article.scss` → `.article--archive__list--blog { grid-template-columns: repeat(3, minmax(0,1fr)); gap:24px; }`
   It was committed by the sibling task 260619-t66. DO NOT re-edit this rule.
   The bug is WIRING: `apps/website/app/pages/blog/index.vue` renders `<ArticleArchive>`
   WITHOUT any blog modifier, so it falls through to the default 4-column
   `.article--archive__list { grid-template-columns: 1fr 1fr 1fr 1fr }`.

2. The `blogSection` prop on ArticleArchive is COUPLED — it controls BOTH the
   "Aprende a comprar y vender mejor" intro head AND the 3-col list modifier.
   The HOME page (`pages/index.vue`) passes `:blog-section="true"` and WANTS the head.
   The /blog list page must NOT show that head (the maqueta `maqueta-blog-list.html`
   has only the hero "Activos industriales, explicados" then the grid — no intro head).
   => DECOUPLE: add a separate `gridBlog` prop for the list modifier only. Pass
   `:grid-blog="true"` on /blog (NO `blog-section`). Keep home page behavior identical.

3. The search input SCSS ALSO already matches the maqueta byte-for-byte
   (`flex:0 1 380px; max-width:380px; padding:12px 15px; gap:11px; border-radius:4px;
   font-size:15px`). DO NOT pre-edit `_filter.scss`. Only fix it IF the visual
   verification shows it deformed at runtime.

4. Articles store uses `populate: "*"`, so `blog_categories` is AUTO-populated once
   the relation exists. DO NOT add a populate path — only change the FILTER.
</critical_findings>

<interfaces>
Article type today (app/types/article.d.ts): has `categories: Category[]`.
Add `blog_categories: BlogCategory[]` (keep `categories` for safety/fallback).

Category type (app/types/category.d.ts): { id, documentId, name, slug, color?, icon?, ... }
BlogCategory mirrors this minus icon (no media): { id, documentId, name, slug, color?, createdAt, updatedAt, publishedAt }.

useApiClient (app/composables/useApiClient.ts): the SAME client the categories store
uses — `client("blog-categories", { method, params })` → goes through the Nuxt proxy
which injects X-Proxy-Key. Endpoint path is the pluralName: "blog-categories".

categoryHue util (app/utils/categoryHue.ts): getCategoryHue(name) is ALREADY keyed by
the 7 blog category names below — names MUST match exactly for the accent colors.

Strapi public-route pattern (api/category/routes/category.ts + ad routes):
export default { routes: [ { method:"GET", path:"/blog-categories", handler:"blog-category.find", config:{ auth:false, policies:[] } }, { method:"GET", path:"/blog-categories/:id", handler:"blog-category.findOne", config:{ auth:false, policies:[] } } ] }
NOTE: category/category.ts uses custom controller methods. For blog-category, prefer
the FACTORY controller (factories.createCoreController) + factory service — the core
find/findOne handlers ("blog-category.find"/"blog-category.findOne") work fine with the
custom router and auth:false. (proxy-auth middleware still gates on X-Proxy-Key; auth:false
only disables the users-permissions JWT requirement so no admin permission setup is needed.)

Seeder relation-connect shape (NOT shown in existing flat seeders — use this):
  const cat = await strapi.db.query("api::blog-category.blog-category").findMany({ where:{ slug }});
  await strapi.db.query("api::article.article").create({
    data: { title, slug, header, body, blog_categories: { connect: [{ id: cat[0].id }] } }
  });

The 7 blog category names (MUST match categoryHue HUE_MAP exactly):
  Guía de compra, Mercado, Mantención, Vender mejor, Financiamiento, Logística, Seguridad
</interfaces>

@.planning/quick/260619-vgn-blog-fixes-3-col-grid-blog-category-cont/260619-vgn-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create blog-category content type + public routes + article relation</name>
  <files>
    apps/strapi/src/api/blog-category/content-types/blog-category/schema.json,
    apps/strapi/src/api/blog-category/controllers/blog-category.ts,
    apps/strapi/src/api/blog-category/services/blog-category.ts,
    apps/strapi/src/api/blog-category/routes/blog-category.ts,
    apps/strapi/src/api/article/content-types/article/schema.json
  </files>
  <action>
    Mirror the FAQ api folder layout (factory controller + factory service) for a new
    `api::blog-category` content type. Create the four files:

    1. content-types/blog-category/schema.json — kind "collectionType",
       collectionName "blog_categories", info { singularName: "blog-category",
       pluralName: "blog-categories", displayName: "Blog Category" },
       options { draftAndPublish: false }, attributes:
         - name: { type: "string", required: true }
         - slug: { type: "uid", targetField: "name" }
         - color: { type: "string" }
       NO media attribute (no required icon — that was the AD-category trap).

    2. controllers/blog-category.ts — factory:
       `import { factories } from "@strapi/strapi"; export default factories.createCoreController("api::blog-category.blog-category");`

    3. services/blog-category.ts — factory:
       `import { factories } from "@strapi/strapi"; export default factories.createCoreService("api::blog-category.blog-category");`

    4. routes/blog-category.ts — custom router ARRAY (NOT createCoreRouter, so write ops
       stay unexposed) with ONLY find + findOne, both `config: { auth: false, policies: [] }`
       targeting handlers "blog-category.find" and "blog-category.findOne". Follow the
       exact shape in the <interfaces> block. Paths: "/blog-categories" and
       "/blog-categories/:id".

    5. Edit article schema.json — ADD a new attribute alongside the existing `categories`
       (do NOT remove `categories`):
         "blog_categories": { "type": "relation", "relation": "manyToMany",
           "target": "api::blog-category.blog-category" }

    Do not touch any other article attributes. Strapi runs in develop mode and will
    auto-reload + create the new table on save.
  </action>
  <verify>
    <automated>cd apps/strapi && pnpm tsc --noEmit 2>&1 | grep -iE "blog-category|article" || echo "no blog-category/article TS errors"</automated>
    Also confirm 4 new files exist and article schema contains "blog_categories".
  </verify>
  <done>
    blog-category content type (name/slug/color, no media) + factory controller/service +
    custom find/findOne routes with auth:false exist; article schema has a
    blog_categories manyToMany relation while keeping `categories`.
  </done>
</task>

<task type="auto">
  <name>Task 2: Seeders (blog-categories + articles) + bootstrap wiring + reseed & verify</name>
  <files>
    apps/strapi/seeders/blog-categories.ts,
    apps/strapi/seeders/articles.ts,
    apps/strapi/src/index.ts
  </files>
  <action>
    Mirror seeders/categories.ts (idempotent: findMany by slug → skip if exists → create).

    1. seeders/blog-categories.ts — export default `populateBlogCategories(strapi)`.
       Seed the 7 categories (names MUST match exactly — they key categoryHue):
         Guía de compra (slug guia-de-compra), Mercado (mercado),
         Mantención (mantencion), Vender mejor (vender-mejor),
         Financiamiento (financiamiento), Logística (logistica),
         Seguridad (seguridad).
       Give each a `color` hex (pick brand-ish values from the project palette / maqueta
       accent feel — e.g. amber-family / muted accents; any reasonable hex, color is
       only metadata, the live accent comes from categoryHue). Idempotent by slug.

    2. seeders/articles.ts — export default `populateArticles(strapi)`. Create ~8 sample
       articles with realistic Spanish industrial content: varied `title`, a `header`
       (1-2 sentence excerpt), and a `body` richtext of a few paragraphs (markdown — so
       "Leer más" has real content and read-time > 1 min). NO cover/gallery media needed.
       Each article linked to ONE blog_category via the connect shape in <interfaces>:
       resolve the category id by slug with strapi.db.query(...).findMany({where:{slug}}),
       then create with `blog_categories: { connect: [{ id }] }`. Spread the 8 across at
       least 4-5 different categories. Idempotent: skip if an article with the same slug
       (or title) already exists. Wrap each create in try/catch logging like categories.ts.

    3. src/index.ts — import both new seeders at top (mirror existing imports) and add
       awaits inside the runSeeders try block, in ORDER:
       `await populateBlogCategories(strapi);` BEFORE `await populateArticles(strapi);`
       (articles depend on categories existing). Place them with the other await calls.

    4. RELOAD + RESEED + VERIFY (actually run, capture output):
       - Strapi is running on :1337 in develop mode with APP_RUN_SEEDERS=true. Saving the
         seeder/index files triggers a dev reload which re-runs bootstrap. If the reload
         does NOT reseed (no "blog-categories" log lines), restart the Strapi develop
         process and capture the bootstrap log.
       - DB check (sqlite): query apps/strapi/.tmp/data.db for the blog_categories table
         (expect 7 rows) and the article ↔ blog_category links (the link table, e.g.
         articles_blog_categories_lnk, has rows for the ~8 seeded articles).
       - Endpoint check: read PROXY_SECRET_WEB from apps/website/.env and
         `curl -s http://localhost:1337/api/blog-categories -H "X-Proxy-Key: <key>"` →
         must return the 7 categories (NOT 401/403). Capture the JSON.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && sqlite3 .tmp/data.db "SELECT COUNT(*) FROM blog_categories;" 2>&1</automated>
    Expect 7. Then run:
    <automated>KEY=$(grep '^PROXY_SECRET_WEB=' /home/gab/Code/waldo-project/apps/website/.env | cut -d= -f2); curl -s http://localhost:1337/api/blog-categories -H "X-Proxy-Key: $KEY" | head -c 600</automated>
    Expect JSON with the 7 categories (data array length 7). Also verify article links exist:
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && sqlite3 .tmp/data.db "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%blog_categor%';"</automated>
  </verify>
  <done>
    blog_categories table has 7 rows; ~8 articles seeded each linked to a blog_category;
    bootstrap calls populateBlogCategories before populateArticles; GET /api/blog-categories
    with X-Proxy-Key returns the 7 categories.
  </done>
</task>

<task type="auto">
  <name>Task 3: Frontend — blog-categories store/type + wire filter, grid (decoupled), badges</name>
  <files>
    apps/website/app/stores/blog-categories.store.ts,
    apps/website/app/types/blog-category.d.ts,
    apps/website/app/types/article.d.ts,
    apps/website/app/pages/blog/index.vue,
    apps/website/app/components/FilterArticles.vue,
    apps/website/app/components/ArticleArchive.vue,
    apps/website/app/components/CardArticle.vue,
    apps/website/app/components/ArticleSingle.vue
  </files>
  <action>
    GRID FIX (decouple — see critical_findings #2): In ArticleArchive.vue add a new prop
    `gridBlog?: boolean`. Apply the list modifier when EITHER blogSection OR gridBlog is
    true: `:class="{ 'article--archive__list--blog': blogSection || gridBlog }"`. Leave
    the head `v-if="blogSection"` and root `--blog` class as-is. This keeps the home page
    (`:blog-section="true"` → head + grid) identical, and lets /blog opt into the 3-col
    grid WITHOUT the intro head. Do NOT edit _article.scss (the rule already exists).

    1. types/blog-category.d.ts — mirror category.d.ts: export interface BlogCategory
       { id, documentId, name, slug, color?, createdAt, updatedAt, publishedAt } and
       BlogCategoryResponse { data: BlogCategory[]; meta: { pagination {...} } }. No icon.

    2. types/article.d.ts — import BlogCategory; add `blog_categories: BlogCategory[];`
       to the Article interface (keep existing `categories`).

    3. stores/blog-categories.store.ts — mirror categories.store.ts but minimal: store id
       "blogCategories", state categories/loading/error, action `loadBlogCategories()`
       that calls `client("blog-categories", { method:"GET", params:{ pagination:{page:1,
       pageSize:1000}, sort:["name:asc"] }})` and a `getBlogCategoryBySlug(slug)` getter.
       (Endpoint has no media so no populate needed.) Guard with the existing
       `if (loading.value) return` pattern from categories.store.

    4. pages/blog/index.vue — inside the useAsyncData loader:
       - Replace the AD categoriesStore usage with the blog-categories store:
         load blog categories and return them as `categories` in BlogData (the
         FilterArticles + SEO code consume `blogData.categories` — keep that field name so
         downstream code is untouched; just feed it blog categories). Import the
         BlogCategory type and adjust BlogData.categories to BlogCategory[].
       - Change the article filter from `categories: { slug: { $eq } }` to
         `blog_categories: { slug: { $eq: category } }`. Do NOT add a populate path —
         the store already uses populate:"*".
       - Pass `:grid-blog="true"` to <ArticleArchive> (NOT :blog-section). Keep the
         existing useAsyncData key, watch list, SEO/structured-data logic unchanged.

    5. FilterArticles.vue — props type already `Category[]`; change it to `BlogCategory[]`
       (import the type). No template logic change (it uses cat.id/.slug/.name).

    6. CardArticle.vue — categoryName computed: prefer
       `props.article.blog_categories?.[0]?.name` and FALL BACK to
       `props.article.categories?.[0]?.name` then "". Keep getCategoryHue(categoryName).

    7. ArticleSingle.vue — categoryName computed: same precedence
       `props.article.blog_categories?.[0]?.name || props.article.categories?.[0]?.name || ""`.

    If you add any new util, add its unit test under apps/website/tests (CLAUDE.md). The
    store mirrors an existing store and needs no new util, so no new test file is required
    unless you introduce one.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/website && pnpm typecheck 2>&1 | tail -20</automated>
    typecheck passes (no new errors in the edited files).
  </verify>
  <done>
    /blog loads BLOG categories into the filter; articles filter by blog_categories slug;
    ArticleArchive renders the 3-col grid on /blog via gridBlog (no intro head); card +
    single badges read blog_categories with categories fallback; types updated.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Real BLOG categories end-to-end: new Strapi blog-category content type (publicly
    readable), seeded 7 categories + ~8 articles, and the website wired to use them
    (filter dropdown, 3-col grid, card + article badges). Default search-input SCSS was
    left unchanged (already matches the maqueta) unless verification shows it deformed.
  </what-built>
  <how-to-verify>
    Take Playwright screenshots and SAVE them to
    .planning/quick/260619-vgn-blog-fixes-3-col-grid-blog-category-cont/reference/after/.
    (If a logged-in view is needed, inject the waldo_jwt cookie per project memory; the
    public /blog and article pages should not need it.)

    1. Visit http://localhost:3000/blog (or the running website port). Confirm:
       - The article grid is 3 columns FILLING the full width — NO empty right-side column.
       - Open the category dropdown: it lists "Guía de compra", "Mercado", "Mantención",
         "Vender mejor", "Financiamiento", "Logística", "Seguridad" — and does NOT list
         AD categories (Minería, Construcción, Agricultura…).
       - The "Buscar artículos…" search input renders correctly (proper height/padding,
         not stretched/deformed). If it IS deformed, fix _filter.scss to match the maqueta
         values (flex:0 1 380px; max-width:380px; padding:12px 15px; gap:11px; font-size:15px;
         border-radius:4px) and re-screenshot. Otherwise leave _filter.scss untouched.
       - The list looks fuller (≈8 articles).
       - Select a category from the dropdown → URL gets ?category=<slug> and only that
         category's articles show.
    2. Visit an article (click a card). Confirm the category badge shows a BLOG category
       name with its accent hue (dot + colored text).
    3. Sanity: visit the home page "/" and confirm the article section STILL shows its
       "Aprende a comprar y vender mejor" intro head + 3-col grid (decoupling didn't
       regress home).

    Do NOT mark done on typecheck alone — screenshots must show the 3-col grid + blog
    categories.
  </how-to-verify>
  <resume-signal>Type "approved" or describe what looks wrong (paste screenshot paths).</resume-signal>
</task>

</tasks>

<verification>
- DB: blog_categories has 7 rows; ~8 articles each linked to one blog_category.
- API: GET /api/blog-categories with X-Proxy-Key returns 7 categories (not 401/403).
- Frontend typecheck passes (apps/website).
- Visual: /blog 3-col full-width grid, blog-category dropdown, correct search input,
  article badge shows blog category; home article section unchanged.
</verification>

<success_criteria>
- New api::blog-category content type + public find/findOne routes + article
  blog_categories relation exist (categories kept for fallback).
- Seeders create 7 blog categories + ~8 linked articles, idempotently, wired into
  bootstrap in the correct order; reseed verified against the DB and the proxy endpoint.
- Website uses blog categories for filter + badges, filters by blog_categories slug,
  renders the 3-col grid on /blog WITHOUT the home intro head, and the search input is
  correct — all confirmed by screenshots in reference/after/.
- Each task committed atomically.
</success_criteria>

<output>
After completion, create
.planning/quick/260619-vgn-blog-fixes-3-col-grid-blog-category-cont/260619-vgn-SUMMARY.md
</output>

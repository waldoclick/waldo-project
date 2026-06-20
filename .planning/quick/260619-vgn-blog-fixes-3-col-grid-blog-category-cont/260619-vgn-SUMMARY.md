---
phase: quick-260619-vgn
plan: 01
subsystem: blog
tags: [strapi, content-type, seeders, website, blog, bem]
status: blocked-on-environment
requires: []
provides:
  - api::blog-category content type (public read)
  - article.blog_categories manyToMany relation
  - blog-categories seeders + bootstrap wiring
  - website blog-categories store + frontend wiring (filter/grid/badges)
affects:
  - apps/strapi/src/api/blog-category/**
  - apps/strapi/src/api/article/content-types/article/schema.json
  - apps/strapi/seeders/blog-categories.ts
  - apps/strapi/seeders/articles.ts
  - apps/strapi/src/index.ts
  - apps/website/app/pages/blog/index.vue
  - apps/website/app/components/{FilterArticles,ArticleArchive,CardArticle,ArticleSingle}.vue
key-files:
  created:
    - apps/strapi/src/api/blog-category/content-types/blog-category/schema.json
    - apps/strapi/src/api/blog-category/controllers/blog-category.ts
    - apps/strapi/src/api/blog-category/services/blog-category.ts
    - apps/strapi/src/api/blog-category/routes/blog-category.ts
    - apps/strapi/seeders/blog-categories.ts
    - apps/strapi/seeders/articles.ts
    - apps/website/app/stores/blog-categories.store.ts
    - apps/website/app/types/blog-category.d.ts
  modified:
    - apps/strapi/src/api/article/content-types/article/schema.json
    - apps/strapi/src/index.ts
    - apps/website/app/types/article.d.ts
    - apps/website/app/pages/blog/index.vue
    - apps/website/app/components/FilterArticles.vue
    - apps/website/app/components/ArticleArchive.vue
    - apps/website/app/components/CardArticle.vue
    - apps/website/app/components/ArticleSingle.vue
decisions:
  - "blog-category uses factory controller + factory service + custom router array (find/findOne, auth:false) per plan"
  - "articles seeder uses strapi.documents().create with blog_categories:{connect:[id]} (document service handles v5 relation connect reliably) instead of the unproven strapi.db.query connect shape"
  - "articles seeder is repair-idempotent: existing-but-unlinked articles get relinked, so a re-run after a failed first boot self-heals"
  - "ArticleArchive gridBlog prop decoupled from blogSection so /blog gets the 3-col grid WITHOUT the home intro head"
metrics:
  duration: ~1h
  completed-date: 2026-06-19
---

# Phase quick-260619-vgn Plan 01: Blog Fixes (3-col grid + real blog categories) Summary

Replaced the misused AD categories on the blog with a real `blog-category` Strapi
taxonomy, added a `blog_categories` relation to articles, wrote the seeders +
bootstrap wiring, and wired the website (filter, decoupled 3-col grid, badges).
**Code for all three implementation tasks is committed and type-clean. The runtime
data seed and the visual checkpoint are UNVERIFIED because the Strapi and website dev
servers became unresponsive during this session — see "Environment Blocker" and the
"Orchestrator Handoff" below.**

## Tasks

### Task 1 — blog-category content type + public routes + article relation — DONE & VERIFIED
Created `api::blog-category` (collectionType `blog_categories`; attributes
`name`/`slug` uid/`color`; no media; `draftAndPublish:false`), a factory controller,
a factory service, and a custom router array exposing only `find` + `findOne` with
`config:{ auth:false, policies:[] }`. Added `blog_categories` manyToMany →
`api::blog-category.blog-category` to the article schema while keeping `categories`.

Verification evidence:
- `pnpm tsc --noEmit` (strapi): no blog-category/article TS errors.
- After save + dev reload, the `blog_categories` **table was created** in
  `apps/strapi/.tmp/data.db` (confirmed via `sqlite3 .tables`). DB file mtime updated
  during this session (22:54), proving a live server synced the schema.
- Commit: `3973f00b`

### Task 2 — Seeders (blog-categories + articles) + bootstrap wiring — WRITTEN, RUNTIME UNVERIFIED
- `seeders/blog-categories.ts`: 7 categories — Guía de compra, Mercado, Mantención,
  Vender mejor, Financiamiento, Logística, Seguridad — names byte-match
  `categoryHue` HUE_MAP (accents included). Idempotent by slug.
- `seeders/articles.ts`: 8 sample articles with multi-paragraph Spanish markdown
  bodies, each linked to one blog_category via
  `strapi.documents("api::article.article").create({ data:{ …, blog_categories:{ connect:[id] } } })`.
  Spread across 6 categories (Guía de compra ×2, Mercado, Mantención, Vender mejor,
  Financiamiento, Logística, Seguridad). **Repair-idempotency**: if an article slug
  exists but has no blog_category link, it is relinked; only skipped if already linked.
- `src/index.ts`: `populateBlogCategories` then `populateArticles` added inside the
  `runSeeders` try block, BEFORE conditions (categories must exist before articles).

Verification evidence:
- `pnpm tsc --noEmit` (strapi): no seeder/index TS errors (after typing the create
  args via `Parameters<ReturnType<typeof strapi.documents<...>>["create"]>[0]`).
- **NOT runtime-verified.** At session end: `SELECT COUNT(*) FROM blog_categories` = **0**;
  `articles_blog_categories_lnk` table is **ABSENT**; `GET /api/blog-categories` →
  connection refused (server down). The bootstrap reseed never completed because the
  server is down (see blocker).
- Commit: `10b888c8`

### Task 3 — Frontend wiring (store/type + filter, grid, badges) — DONE, TYPECHECK VERIFIED (visual pending)
- `types/blog-category.d.ts`: `BlogCategory` + `BlogCategoryResponse` (no icon).
- `stores/blog-categories.store.ts`: mirrors categories.store; `loadBlogCategories()`
  hits `client("blog-categories", …)` (no populate — no media); `loading` guard;
  `getBlogCategoryBySlug` getter.
- `types/article.d.ts`: added `blog_categories: BlogCategory[]` (kept `categories`).
- `pages/blog/index.vue`: loads blog categories into `blogData.categories`
  (`BlogData.categories` retyped to `BlogCategory[]`), filters articles by
  `blog_categories:{ slug:{ $eq } }`, passes `:grid-blog="true"` (NOT `:blog-section`).
  SEO/structured-data + useAsyncData key/watch untouched. No populate added (store
  already uses `populate:"*"`).
- `ArticleArchive.vue`: added `gridBlog?: boolean`; list modifier now applies on
  `blogSection || gridBlog` — home keeps head+grid, /blog gets grid only.
- `FilterArticles.vue`: prop type → `BlogCategory[]` (template logic unchanged).
- `CardArticle.vue` + `ArticleSingle.vue`: `categoryName` precedence
  `blog_categories?.[0]?.name || categories?.[0]?.name || ""`.

Verification evidence:
- `vue-tsc --noEmit` (apps/website, via `node ../../node_modules/.bin/vue-tsc`): **exit 0**
  (`pnpm typecheck` script does not exist; per project memory vue-tsc is the verifier).
- **Visual NOT verified** — website dev server down on :3000.
- Commit: `d4517e4c`

### Task 4 — checkpoint:human-verify (visual) — NOT REACHED
Requires live /blog + article screenshots. Both Strapi (:1337) and website (:3000) are
unresponsive, so no screenshots were produced. `reference/after/` was created but is
empty.

## Environment Blocker

Both dev servers are unresponsive at session end:
- `curl http://localhost:1337/admin` → connection refused (000)
- `curl http://localhost:1337/api/blog-categories` (with X-Proxy-Key) → 000
- `curl http://localhost:3000/` → 000
- `ss -ltnp` shows nothing listening on 1337 or 3000.
- The two `strapi develop` watcher processes (PIDs 1194175, 1195320) are alive but only
  have esbuild helper children — their actual server child is not running and the
  watcher has not respawned it.

**Diagnosis is partial / honest:** The `blog_categories` table WAS created during this
session (DB mtime 22:54), so a live server did sync the Task 1 schema. The server then
stopped responding and never recovered across ~6 polls (~5+ minutes), including after
the article-relation schema change (which should create `articles_blog_categories_lnk`,
a table that is absent). The likely trigger is resource pressure during the
article-relation rebuild, but this is **unconfirmed** — current-session server logs were
not located. NOTE: `/tmp/strapi-dev.log` ends with `Killed` / exit 137, but that log's
mtime is 17:38 (~5h before this session) — it is **stale and is NOT evidence of the
current failure**.

Per task constraints ("do NOT kill the Strapi/website processes; the orchestrator will
handle the restart"), I did not restart anything. All code is committed and durable.

## Orchestrator Handoff (required to finish this plan)

1. **Restart** the Strapi (:1337) and website (:3000) dev servers
   (`APP_RUN_SEEDERS=true`).
2. After bootstrap completes, verify the seed landed:
   - `sqlite3 apps/strapi/.tmp/data.db "SELECT COUNT(*) FROM blog_categories;"` → expect **7**
   - **THE KEY RISK** — link count:
     `sqlite3 apps/strapi/.tmp/data.db "SELECT COUNT(*) FROM articles_blog_categories_lnk;"`
     → expect **8** (or ≥1). If this is **0** while blog_categories = 7, the document-service
     `connect` shape failed; re-run the seeder (the repair-idempotency in
     `seeders/articles.ts` makes a re-run safe — it relinks existing-but-unlinked articles).
   - `KEY=$(grep '^PROXY_SECRET_WEB=' apps/website/.env | cut -d= -f2); curl -s http://localhost:1337/api/blog-categories -H "X-Proxy-Key: $KEY"`
     → expect the 7 categories (not 401/403).
3. **Then run the Task 4 visual checkpoint** (Playwright):
   - `/blog`: 3-col grid filling full width (no empty 4th column); open the dropdown
     (`.filter--articles__drop__button`) → must list Guía de compra/Mercado/Mantención/
     Vender mejor/Financiamiento/Logística/Seguridad and NOT Minería/Construcción/etc.;
     "Buscar artículos…" input not deformed; select a category → `?category=<slug>` filters.
   - An article: badge shows a blog-category name + accent hue.
   - Home `/`: article section STILL shows its "Aprende a comprar y vender mejor" intro
     head + 3-col grid (decoupling regression check).
   - Save before/after screenshots to `reference/after/`.
   - If the search input IS deformed, fix `_filter.scss` to the maqueta values
     (flex:0 1 380px; max-width:380px; padding:12px 15px; gap:11px; font-size:15px;
     border-radius:4px) and re-screenshot — otherwise leave it untouched.

## Deviations from Plan

- **[Rule 3 - Blocking] Document service instead of `strapi.db.query` connect.** The plan's
  `<interfaces>` suggested `strapi.db.query("api::article.article").create({ data:{ blog_categories:{ connect:[{id}] } } })`.
  That connect shape is unproven in this repo (existing seeders only set scalars) and is a
  known silent-failure point. Switched to `strapi.documents().create(... connect:[id])`, which
  reliably handles v5 relation connect. Added repair-idempotency so a re-run heals unlinked rows.
- **Typing of document-service create args.** `data … as unknown as Record<string, unknown>`
  is rejected by the create `Input` type; cast the whole args object via
  `Parameters<ReturnType<typeof strapi.documents<"api::article.article">>["create"]>[0]`.
- **No standalone bugs found in the touched code.**

## Known Stubs

None. (`reference/after/` is empty because the visual checkpoint could not run — this is
the environment blocker, not a code stub.)

## Self-Check

Files created (exist on disk):
- apps/strapi/src/api/blog-category/content-types/blog-category/schema.json — FOUND
- apps/strapi/src/api/blog-category/controllers/blog-category.ts — FOUND
- apps/strapi/src/api/blog-category/services/blog-category.ts — FOUND
- apps/strapi/src/api/blog-category/routes/blog-category.ts — FOUND
- apps/strapi/seeders/blog-categories.ts — FOUND
- apps/strapi/seeders/articles.ts — FOUND
- apps/website/app/stores/blog-categories.store.ts — FOUND
- apps/website/app/types/blog-category.d.ts — FOUND

Commits (exist in git log):
- 3973f00b (Task 1) — FOUND
- 10b888c8 (Task 2) — FOUND
- d4517e4c (Task 3) — FOUND

## Self-Check: PASSED (code) / BLOCKED (runtime + visual verification — see Orchestrator Handoff)

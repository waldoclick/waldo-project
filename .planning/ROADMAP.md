# Roadmap: Waldo Project

## Milestones

- ⛔ **v1.25 Unified Checkout** — forcibly closed 2026-03-09. See `.planning/milestones/v1.25-ROADMAP.md`
- ✅ **v1.26 Mostrar comprobante Webpay** — Phase 060 (shipped 2026-03-11). See `.planning/milestones/v1.26-ROADMAP.md`
- ✅ **v1.27 Reparar eventos GA4 ecommerce** — Phase 061 (shipped 2026-03-12). See `.planning/milestones/v1.27-ROADMAP.md`
- ✅ **v1.28 Logout Store Cleanup** — Phase 062 (shipped 2026-03-12). See `.planning/milestones/v1.28-ROADMAP.md`
- ✅ **v1.29 News Manager** — Phases 063–064 (shipped 2026-03-12). See `.planning/milestones/v1.29-ROADMAP.md`
- 🔄 **v1.30 Blog Public Views** — Phases 065–068 (in progress)

## Phases

<details>
<summary>✅ v1.26 Mostrar comprobante Webpay (Phase 060) — SHIPPED 2026-03-11</summary>

- [x] Phase 060: Mostrar comprobante Webpay (3/3 plans) — completed 2026-03-11

</details>

<details>
<summary>✅ v1.27 Reparar eventos GA4 ecommerce (Phase 061) — SHIPPED 2026-03-12</summary>

- [x] Phase 061: Fix GA4 ecommerce events (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.28 Logout Store Cleanup (Phase 062) — SHIPPED 2026-03-12</summary>

- [x] Phase 062: Logout Store Cleanup (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.29 News Manager (Phases 063–064) — SHIPPED 2026-03-12</summary>

- [x] Phase 063: News Content Type (1/1 plan) — completed 2026-03-12
- [x] Phase 064: Dashboard Articles UI (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>🔄 v1.30 Blog Public Views (Phases 065–068) — IN PROGRESS</summary>

- [x] **Phase 065: Strapi Slug Field** — Add `slug` field to Article schema with lifecycle hook; verify API response (completed 2026-03-13)
- [x] **Phase 066: Article Infrastructure** — TypeScript Article type + SCSS scaffolding (all blog SCSS files/blocks) (completed 2026-03-13)
- [x] **Phase 067: Blog Listing Page** — `/blog` listing page + all listing-related components (Hero, Filter, Archive, Card, Related) (completed 2026-03-13)
- [x] **Phase 068: Blog Detail Page** — `/blog/[slug]` detail page + article-level components (HeroArticle, ArticleSingle) (completed 2026-03-13)

</details>

## Phase Details

### Phase 065: Strapi Slug Field
**Goal**: The Article content type exposes a unique `slug` field auto-generated from the title, and the public API returns it alongside all related fields
**Depends on**: Nothing (v1.29 Article content type exists)
**Requirements**: BLOG-01, BLOG-02
**Success Criteria** (what must be TRUE):
  1. A new article created with a title automatically gets a slug value in the database (no manual input required)
  2. Updating an article title updates the slug accordingly via the beforeUpdate lifecycle hook
  3. `GET /api/articles` returns articles with `slug`, `categories`, `cover`, and `gallery` fields populated
  4. `slug` field is marked unique and required — the Strapi admin blocks saving an article without one
**Plans**: 1 plan

Plans:
- [ ] 065-01-PLAN.md — Add slug uid field to Article schema + beforeCreate/beforeUpdate lifecycle hooks with Jest tests

### Phase 066: Article Infrastructure
**Goal**: The shared TypeScript type and all SCSS building blocks that every blog component depends on are in place before any component is written
**Depends on**: Phase 065
**Requirements**: BLOG-03, BLOG-21, BLOG-22, BLOG-23, BLOG-24, BLOG-25, BLOG-26
**Success Criteria** (what must be TRUE):
  1. `Article` interface in `app/types/article.d.ts` covers all 13 fields — `id`, `documentId`, `title`, `header`, `body`, `slug`, `cover`, `gallery`, `categories`, `seo_title`, `seo_description`, `publishedAt`, `createdAt` — and TypeScript strict mode compiles with zero errors
  2. `_article.scss` exists with `article--archive` and `article--single` BEM blocks importable via `app.scss`
  3. `_hero.scss` has `hero--articles` and `hero--article` modifier blocks; `_filter.scss` has `filter--articles`; `_related.scss` has `related--articles`; `_card.scss` has `card--article` — all following BEM conventions
  4. `app.scss` includes `@use "components/article"` and the website builds without SCSS errors
**Plans**: 2 plans

Plans:
- [ ] 066-01-PLAN.md — Article TypeScript interface (article.d.ts) with all 13 fields
- [ ] 066-02-PLAN.md — SCSS scaffolding: _article.scss + blog blocks in _hero, _filter, _related, _card + app.scss import

### Phase 067: Blog Listing Page
**Goal**: Visitors can browse published articles at `/blog` with category filtering, sort order, pagination, and an empty-state fallback
**Depends on**: Phase 066
**Requirements**: BLOG-04, BLOG-05, BLOG-06, BLOG-07, BLOG-08, BLOG-09, BLOG-14, BLOG-15, BLOG-16, BLOG-17, BLOG-20
**Success Criteria** (what must be TRUE):
  1. Visiting `/blog` renders a paginated list of 12 articles per page with cover image, category badge, title, excerpt, date, and "Leer más" link on each card
  2. Selecting a category in the filter dropdown updates the `?category=` URL param and the article list filters accordingly without a full page reload
  3. Selecting "Más recientes" or "Más antiguos" updates the `?order=` URL param and the list re-sorts accordingly
  4. When no articles match the active filters, a `MessageDefault` empty state is shown alongside a `RelatedArticles` fallback block (most recent 12)
  5. The page has SSR-correct `$setSEO` title and description; `nuxt typecheck` passes with zero errors
**Plans**: 3 plans

Plans:
- [ ] 067-01-PLAN.md — CardArticle.vue + RelatedArticles.vue (leaf display components)
- [ ] 067-02-PLAN.md — articles.store.ts + HeroArticles.vue (data layer + hero)
- [ ] 067-03-PLAN.md — FilterArticles.vue + ArticleArchive.vue + blog/index.vue (full page assembly)

### Phase 068: Blog Detail Page
**Goal**: Visitors can read a full article at `/blog/[slug]` with rendered Markdown body, cover gallery, sidebar, and related articles at the bottom
**Depends on**: Phase 067
**Requirements**: BLOG-10, BLOG-11, BLOG-12, BLOG-13, BLOG-18, BLOG-19
**Success Criteria** (what must be TRUE):
  1. Visiting `/blog/some-slug` renders the article with: hero (breadcrumbs + H1 title), full cover gallery, rendered Markdown body, and sidebar with ShareDefault + article categories
  2. Visiting `/blog/nonexistent-slug` shows a Nuxt 404 error page (not a blank or broken page)
  3. The page emits SSR-correct `$setSEO` (title, description from `header`, cover image) and `BlogPosting` structured data (name, description, image, datePublished, author)
  4. A `RelatedArticles` block at the bottom of the article shows same-category articles first, falling back to most recent when not enough
**Plans**: 2 plans

Plans:
- [ ] 068-01-PLAN.md — HeroArticle.vue + ArticleSingle.vue (leaf display components)
- [ ] 068-02-PLAN.md — blog/[slug].vue (full detail page: fetch, 404, SEO, BlogPosting, RelatedArticles)

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
| 060   | v1.26     | 3/3            | Complete    | 2026-03-11 |
| 061   | v1.27     | 2/2            | Complete    | 2026-03-12 |
| 062   | v1.28     | 2/2            | Complete    | 2026-03-12 |
| 063   | v1.29     | 1/1            | Complete    | 2026-03-12 |
| 064   | v1.29     | 2/2            | Complete    | 2026-03-12 |
| 065   | 1/1 | Complete    | 2026-03-13 | —          |
| 066   | 2/2 | Complete    | 2026-03-13 | —          |
| 067   | 3/3 | Complete    | 2026-03-13 | —          |
| 068   | 2/2 | Complete    | 2026-03-13 | —          |

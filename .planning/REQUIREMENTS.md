# Requirements: Waldo Project — v1.30 Blog Public Views

**Defined:** 2026-03-12
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1 Requirements

### Strapi Schema

- [ ] **BLOG-01**: Article content type has a `slug` field (short text, unique, required) auto-generated from `title` via a Strapi lifecycle hook on beforeCreate and beforeUpdate
- [ ] **BLOG-02**: `GET /api/articles` endpoint returns published articles populated with `categories`, `cover`, and `gallery` fields

### Article Type Definition

- [ ] **BLOG-03**: `Article` TypeScript interface is defined in `apps/website/app/types/article.d.ts` covering all fields: `id`, `documentId`, `title`, `header`, `body`, `slug`, `cover`, `gallery`, `categories`, `seo_title`, `seo_description`, `publishedAt`, `createdAt`

### Blog Listing Page (`blog/index.vue`)

- [ ] **BLOG-04**: Visitor can view a paginated list of published articles at `/blog` (12 per page)
- [ ] **BLOG-05**: Visitor can filter articles by category using a dropdown that updates the URL query param
- [ ] **BLOG-06**: Visitor can sort articles by most recent or oldest using a dropdown that updates the URL query param
- [ ] **BLOG-07**: Visitor sees a `MessageDefault` empty state when no articles match the current filters
- [ ] **BLOG-08**: Visitor sees `RelatedArticles` (most recent 12) when no articles match the current filters, as a fallback content block
- [ ] **BLOG-09**: Page has SSR-correct `$setSEO` title, description, and `BlogPosting`-appropriate structured data

### Blog Detail Page (`blog/[slug].vue`)

- [ ] **BLOG-10**: Visitor can view a single article at `/blog/[slug]` showing: hero with title + breadcrumbs, full cover gallery, rendered Markdown body, and sidebar with ShareDefault + article categories
- [ ] **BLOG-11**: Visitor is shown a 404 error page when the article slug does not exist or the article is not published
- [ ] **BLOG-12**: Page has SSR-correct `$setSEO` title, description (derived from `header`), cover image, and `BlogPosting` structured data (name, description, image, datePublished, author)
- [ ] **BLOG-13**: Visitor sees `RelatedArticles` at the bottom of the article (same-category first, fall back to most recent)

### Blog-Specific Components

- [ ] **BLOG-14**: `HeroArticles` component exists — renders hero section with white background, breadcrumbs (Inicio → Blog), and "Blog" title; no category color tint
- [ ] **BLOG-15**: `FilterArticles` component exists — category dropdown + sort order dropdown; updates `?category=` and `?order=` URL params; client-only rendered (SSR-safe loading state)
- [ ] **BLOG-16**: `ArticleArchive` component exists — responsive 4-column grid of `CardArticle` with `vue-awesome-paginate` pagination updating `?page=` query param
- [ ] **BLOG-17**: `CardArticle` component exists — displays: cover image (NuxtImg, webp/lazy), category badge, title (truncated to 60 chars), header/excerpt (truncated to 120 chars), formatted `publishedAt` date, and "Leer más" NuxtLink to `/blog/[slug]`
- [ ] **BLOG-18**: `HeroArticle` component exists — renders hero section with white background, breadcrumbs (Inicio → Blog → Article title), and H1 article title
- [ ] **BLOG-19**: `ArticleSingle` component exists — two-column layout: body column (GalleryDefault + rendered Markdown body via `sanitizeRich`); sidebar column (article categories list + ShareDefault)
- [ ] **BLOG-20**: `RelatedArticles` component exists — same structure as `RelatedAds` but renders `CardArticle` instead of `CardAnnouncement`; accepts `articles`, `loading`, `error`, `title`, `text`, `centerHead` props

### SCSS

- [ ] **BLOG-21**: `_article.scss` file created in `apps/website/app/scss/components/` with BEM blocks: `article--archive` (mirrors `announcement--archive`) and `article--single` (mirrors `announcement--single` with sidebar layout)
- [ ] **BLOG-22**: `_hero.scss` extended with `hero--articles` (white bg, breadcrumbs) and `hero--article` (white bg, breadcrumbs, H1 title) blocks
- [ ] **BLOG-23**: `_filter.scss` extended with `filter--articles` block (mirrors `filter--announcement` layout)
- [ ] **BLOG-24**: `_related.scss` extended with `related--articles` block (same structure as `related--ads`)
- [ ] **BLOG-25**: `_card.scss` extended with `card--article` block: cover image with aspect ratio, category badge, title, excerpt, date, read more link
- [ ] **BLOG-26**: `app.scss` updated with `@use "components/article"` import

## v2 Requirements

### Future Enhancements

- **BLOG-F01**: Blog search — visitor can search articles by keyword via a search input
- **BLOG-F02**: Reading time estimate displayed on article cards and detail page
- **BLOG-F03**: Author attribution — article shows author name/avatar (requires author relation in schema)
- **BLOG-F04**: Social sharing pre-filled with article title and URL via Open Graph meta tags (currently covered by `$setSEO` but could be enhanced with article-specific OG image)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Comments on articles | Requires user auth integration, moderation — separate milestone |
| Article preview in dashboard | Dashboard already has Strapi admin for preview — redundant |
| Website search including blog | Website search targets ads, not articles — separate milestone |
| Article author relation in schema | No author entity in Strapi yet — future milestone |
| RSS feed for blog | Nice-to-have, not blocking public views — future milestone |

## Traceability

*Populated by roadmapper during roadmap creation.*

| Requirement | Phase | Status |
|-------------|-------|--------|
| BLOG-01 | — | Pending |
| BLOG-02 | — | Pending |
| BLOG-03 | — | Pending |
| BLOG-04 | — | Pending |
| BLOG-05 | — | Pending |
| BLOG-06 | — | Pending |
| BLOG-07 | — | Pending |
| BLOG-08 | — | Pending |
| BLOG-09 | — | Pending |
| BLOG-10 | — | Pending |
| BLOG-11 | — | Pending |
| BLOG-12 | — | Pending |
| BLOG-13 | — | Pending |
| BLOG-14 | — | Pending |
| BLOG-15 | — | Pending |
| BLOG-16 | — | Pending |
| BLOG-17 | — | Pending |
| BLOG-18 | — | Pending |
| BLOG-19 | — | Pending |
| BLOG-20 | — | Pending |
| BLOG-21 | — | Pending |
| BLOG-22 | — | Pending |
| BLOG-23 | — | Pending |
| BLOG-24 | — | Pending |
| BLOG-25 | — | Pending |
| BLOG-26 | — | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 0
- Unmapped: 26 ⚠️

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after initial definition*

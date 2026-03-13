---
gsd_state_version: 1.0
milestone: v1.30
milestone_name: Blog Public Views
status: in_progress
last_updated: "2026-03-13T00:46:01.966Z"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
  percent: 88
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12 after v1.30 milestone started)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.30 — Blog Public Views (Phase 065 next)

## Position

**Milestone:** v1.30 — Blog Public Views
**Phase:** 065 Plan 01 — complete
**Status:** Phase 065-01 complete — ready for Phase 066

**Progress:** [█████████░] 88%

## Session Log

- 2026-03-12: Milestone v1.29 complete — News Manager shipped
- 2026-03-12: Milestone v1.30 started — Blog Public Views
- 2026-03-12: Roadmap created — 4 phases (065–068), 26/26 requirements mapped
- 2026-03-13: Phase 065-01 complete — Article slug field + lifecycle hooks + 6 Jest tests

### Key Decisions

- Blog components replicated from ads equivalents — not reused directly (user requirement)
- `slug` field must be added to Strapi Article schema (missing — required for `blog/[slug].vue` routing)
- Slug auto-generated from title via Strapi lifecycle hook (beforeCreate/beforeUpdate)
- Blog hero: white background, breadcrumbs kept — no category color tint
- Article card fields: cover image, category badge, title, header/excerpt, publishedAt, read more link
- Blog index filters: category dropdown + sort order (recent/oldest)
- Article sidebar: ShareDefault + categories list (no seller/price)
- Related articles: same-category first, fill with most recent if not enough
- 12 articles per page
- SCSS requirements (BLOG-21–26) bundled with infrastructure phase (066), not standalone — they are implementation details of component/page work
- Article slug: uid type (not string) — gives admin auto-generation UI, uniqueness, matches category pattern
- Article slug beforeUpdate: fetches existing title via entityService.findOne before overwriting — prevents unnecessary regeneration
- slugify with strict:true: strips accents/special chars (¡Artículo Español! → articulo-espanol) for clean URL slugs

### Blockers/Concerns

None.

### Accumulated Context

**From v1.29:**
- Article content type in Strapi: `title`, `header`, `body` (richtext/Markdown), `cover` (media, multiple), `gallery` (media, multiple), `categories` (manyToMany → `api::category.category`), `seo_title`, `seo_description`, `draftAndPublish: true`
- API endpoint: `GET /api/articles` (default Strapi v5 core routes)
- Strapi v5 SDK delete requires `documentId || String(id)` — numeric id not accepted
- `richtext` in Strapi v5 stores Markdown — website must render it via `sanitizeRich` composable

**For v1.30:**
- Website pages: `apps/website/app/pages/blog/index.vue` and `apps/website/app/pages/blog/[slug].vue` (currently empty stubs)
- Reference layout: `anuncios/index.vue` (listing) and `anuncios/[slug].vue` (single)
- Components to create: `HeroArticles`, `FilterArticles`, `ArticleArchive`, `CardArticle`, `ArticleSingle`, `HeroArticle`, `RelatedArticles`
- Components to reuse: `HeaderDefault`, `FooterDefault`, `MessageDefault`, `BreadcrumbsDefault`, `ShareDefault`, `GalleryDefault`, `LoadingDefault`
- SCSS files to create: `_article.scss` (mirrors `_announcement.scss`), new blocks in `_hero.scss`, `_filter.scss`, `_related.scss`, `_card.scss`
- No article store or composable exists on website side yet — must be created
- `Article` TypeScript type must be defined in `app/types/article.d.ts`
- Slug field added to Article schema (Phase 065-01 complete) — uid type targeting title, auto-generated via lifecycle hooks

---
phase: 07-publico-vistas-core
plan: 01
subsystem: website-public
tags: [home, rebrand, hero, carousel, scss, bem, data-fetching]
requires:
  - phase-04 design tokens ($ink/$ink2/$muted/$amber/$amber_hover/$amber_tint/$tag/$cream/$line)
  - 06-02 public header (sticky/headroom) — hero clears it
provides:
  - Home page restyled to v1.47 mockup (hero + featured-card carousel, avisos destacados, categorías, dark vender CTA, blog)
  - SellCta component (reusable dark "vender" CTA band)
  - HeroHome featured-card carousel behavior (prev/next/dots)
  - Single-wave home data load (categories + featured ads + latest articles)
affects:
  - apps/website Home page; AdArchive/CardAnnouncement/CategoryArchive/CardCategory/ArticleArchive/CardArticle now have home-specific variants/restyle
tech-stack:
  added: []
  patterns:
    - "Section header lives inside the section component (AdArchive/ArticleArchive), gated by a *Section boolean prop — page stays composition-only"
    - "Carousel state (currentIndex ref + wrap-around prev/next/goTo) lives in HeroHome, fed a featuredAds array prop"
key-files:
  created:
    - apps/website/app/components/SellCta.vue
    - apps/website/app/scss/components/_sell-cta.scss
  modified:
    - apps/website/app/pages/index.vue
    - apps/website/app/components/HeroHome.vue
    - apps/website/app/components/AdArchive.vue
    - apps/website/app/components/CardAnnouncement.vue
    - apps/website/app/components/CategoryArchive.vue
    - apps/website/app/components/ArticleArchive.vue
    - apps/website/app/components/CardArticle.vue
    - apps/website/app/scss/app.scss
    - apps/website/app/scss/components/_hero.scss
    - apps/website/app/scss/components/_announcement.scss
    - apps/website/app/scss/components/_category.scss
    - apps/website/app/scss/components/_card.scss
    - apps/website/app/scss/components/_article.scss
decisions:
  - "Did NOT reuse SearchDefault in the hero (it always renders the category dropdown the new design dropped); built an inline single-input + amber Buscar that replicates handleSubmit's navigate to /anuncios?s=… without a category param"
  - "Ripped-and-replaced the old .hero--home SCSS entirely (was the dark $charcoal hero with fixed heights + !important) instead of layering — new bg is $cream + amber radial glow, grid split layout"
  - "Dark vender CTA = a dedicated SellCta component with its OWN BEM block (.sell-cta), justified as no close equivalent exists; pages stay composition-only and BEM encapsulation is preserved (not named .hero--home__cta in another file)"
  - "featuredAds sort = ['sort_priority:asc','createdAt:desc'] (no literal 'featured' token exists — copied from pages/anuncios/index.vue), pageSize 8; articles = ['createdAt:desc'], pageSize 3"
  - "Section headers (Destacados / Blog Waldo) implemented inside AdArchive/ArticleArchive behind featuredSection/blogSection props, keeping index.vue composition-only"
  - "Hover effects from the mockup (translateY + box-shadow on cards/tiles) deliberately NOT implemented — CLAUDE.md bans box-shadow/scale; used $line→$ink border shift instead"
metrics:
  duration: ~45m
  tasks: 3
  files-created: 2
  files-modified: 13
  completed: 2026-06-18
---

# Phase 07 Plan 01: Home Restyle Summary

Restyled the public Home (`pages/index.vue`) to the v1.47 mockup (`apps/design/index.dc.html` home view) — hero with inline search + floating featured-ad **carousel**, "Avisos destacados" ad grid, "Explora por categoría" tile grid, a dark "¿Tienes equipos para vender?" CTA band, and a "Blog Waldo" article grid — and consolidated the home's data fetching from three `useAsyncData` calls down to one (`Promise.all` over categories + featured ads + latest articles).

## What shipped

**Task 1 — single data load.** `index.vue` now has exactly one `useAsyncData("home-data")` running `Promise.all([categories, featuredAds, articles])` and returning `{ categories, featuredAds, articles }` with an object `default`. The old `home-packs` and `featured-faqs` loaders (and the Highlights/Howto/Packs/FAQ sections) were removed from Home — those bands moved to "Por qué Waldo" (07-02). Page is composition-only: `HeaderDefault → HeroHome → AdArchive(featured) → CategoryArchive → SellCta → ArticleArchive(blog) → FooterDefault`.

**Task 2 — hero + carousel.** `HeroHome.vue` rebuilt as a two-column split: left = eyebrow chip, Poppins-800 headline with amber underline on "Anuncia"/"busca", subhead, inline search (single input + amber Buscar), trust badges; right = a floating featured-ad card (amber `rotate(2.5deg)` plate behind, `floaty` keyframe, Destacado badge, category chip + condition, title, location·year meta, price + Ver aviso) with prev/next round buttons and a row of dots (shown only when `featuredAds.length > 1`). `_hero.scss` `.hero--home` was fully replaced (cream bg + amber glow + 104px top padding to clear the headroom header).

**Task 3 — destacados / categorías / dark CTA / blog.** `AdArchive` gained a "Destacados" header (behind `featuredSection`) and `CardAnnouncement` was restyled to the mockup AdCard (category pill with color dot, location·year·condition meta, price + IVA, logged-out "Inicia sesión para ver al anunciante" gate). `CategoryArchive` got a centered head + 4-col tile grid; `card--category` restyled to a white tile with a 52×52 per-industry color icon chip. New `SellCta` component renders the dark ($ink) rounded panel with amber radial glow and Anunciar ahora / Cómo funciona CTAs. `ArticleArchive` gained a "Blog Waldo" header (behind `blogSection`) + 3-col grid; `CardArticle` restyled to the BlogCard look (16/9 media, category pill overlay, Poppins title, 2-line excerpt, date · read-time footer).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed dead `EmptyState` import in AdArchive.vue**
- **Found during:** Task 3
- **Issue:** `EmptyState` was imported but never used; CLAUDE.md forbids unused imports (Codacy flags them).
- **Fix:** Deleted the import.
- **Files modified:** apps/website/app/components/AdArchive.vue
- **Commit:** 7927db5b

**2. [Rule 3 - Blocking] Dropped unused `separator` prop + `title` const from CategoryArchive.vue**
- **Found during:** Task 3
- **Issue:** The new centered head hardcodes "Explora por categoría", so the old `separator` prop and `title`/`isSeparator` computeds became unused. Page call updated to stop passing `:separator`.
- **Fix:** Removed the prop and dead computeds; updated `index.vue` call site.
- **Files modified:** CategoryArchive.vue, index.vue
- **Commit:** 7927db5b

### Notes (not deviations)
- "Cómo funciona" in SellCta links to `/preguntas-frecuentes` (closest existing how-it-works content) since the "Por qué Waldo" route is not built until 07-02. Swap to that route when it exists.

## Visual Verification

Logged-OUT, dev server on :3000, compared against `apps/design/index.dc.html` (home) and the live mockup on :3002. Screenshots saved to `/tmp/waldo-shots/`:

- `07-01-home-desktop.png` (1440 full-page) — section order confirmed: hero → destacados → categorías → dark CTA → blog; no Highlights/Howto/Packs/FAQ present.
- `07-01-hero-clip.png` (1440) vs `mockup-hero.png` — hero matches element-by-element (eyebrow, amber-underlined headline, subhead, search, trust badges, floating card + amber rotated plate, Destacado badge, category chip + condition, title, location·year, Precio + Ver aviso). Hero clears the headroom header (104px), nothing hidden behind the bar.
- Carousel verified programmatically: 8 dots for 8 featured ads; clicking next changed the card title (Wylie Lane → Shellie Duffy). prev/next/dots cycle the card.
- `07-01-cta.png` (1440) — dark vender CTA panel matches (dark $ink panel, amber radial glow, h2, copy, amber + outline CTAs); categorías tiles above match (icon chip per-industry color, name, "N anuncios ›").
- `07-01-blog.png` (1440) — Blog Waldo eyebrow+dot, h2, intro, "Ver todos los artículos →" link, 3-col article cards (category pill overlay, title, excerpt, date · read-time).
- `07-01-home-mobile.png` + `07-01-mobile-top.png` (390) — all sections collapse to single column correctly; hero stacks content-then-card; cards render with full AdCard/BlogCard detail.

A cookie-consent banner and a "Consigue 3 anuncios gratis" promo widget overlay parts of the page in screenshots — these are pre-existing site widgets, not part of this plan.

## Verification results
- `grep -c useAsyncData index.vue` = 1; object `default` present; no `home-packs|featured-faqs|ad-packs|faqsStore` references.
- `git diff apps/website/app/scss/abstracts/_variables.scss` = no changes (no existing SCSS variable modified; no new variable needed).
- `vue-tsc --noEmit` clean for all touched files (index.vue, HeroHome, AdArchive, CardAnnouncement, CategoryArchive, CardCategory, ArticleArchive, CardArticle, SellCta).
- phase-04 tokens only; BEM strict (every child under its block/modifier namespace; no standalone hyphenated classes); no box-shadow/scale added (rotate(2.5deg) on the hero plate is the sanctioned carve-out).

## Known Stubs
None — all sections are wired to live data (categories, featured ads, articles). The SellCta "Cómo funciona" link is a placeholder target (`/preguntas-frecuentes`) until the Por qué Waldo route ships in 07-02.

## Self-Check: PASSED
- Files created/modified all exist on disk (verified).
- Commit 7927db5b exists and contains the 15 staged files.

# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- ✅ **v1.3 Utility Extraction** — Phases 9-11 (shipped 2026-03-06)
- ✅ **v1.4 URL Localization** — Phases 12-15 (shipped 2026-03-06)
- ✅ **v1.5 Ad Credit Refund** — Phases 16-17 (shipped 2026-03-06)
- ✅ **v1.6 Website API Optimization** — Phases 18-19 (shipped 2026-03-06)
- ✅ **v1.7 Cron Reliability** — Phases 20-23 (shipped 2026-03-06)
- ✅ **v1.8 Free Featured Reservation Guarantee** — Phase 24 (shipped 2026-03-07)
- ✅ **v1.9 Website Technical Debt** — Phases 25-29 (shipped 2026-03-07)
- ✅ **v1.10 Dashboard Orders Dropdown UI** — Phase 30 (shipped 2026-03-07)
- ✅ **v1.11 GTM / GA4 Tracking Fix** — Phase 31 (shipped 2026-03-07)
- ✅ **v1.12 Ad Creation Analytics Gaps** — Phase 32 (shipped 2026-03-07)
- ✅ **v1.13 GTM Module Migration** — Phase 33 (shipped 2026-03-07)
- ✅ **v1.14 GTM Module: Dashboard** — Phase 34 (shipped 2026-03-07)
- ✅ **v1.15 Website SEO Audit** — Phase 35 (shipped 2026-03-07)
- **v1.16 Website Meta Copy Audit** — Phases 36-38 (in progress)

## Phases

<details>
<summary>✅ v1.1–v1.15 (Phases 3-35) — SHIPPED</summary>

All prior phases shipped. See `.planning/milestones/` for archived roadmaps.

</details>

<details>
<summary>🔄 v1.16 — Website Meta Copy Audit (Phases 36-38)</summary>

- [ ] **Phase 36: SEO Bug Fixes** — Eliminate double-suffix titles, remove stale counters, and add missing noindex on `packs/index.vue`
- [ ] **Phase 37: Dynamic Page Copy** — Rewrite meta copy for all four public dynamic pages (home, ad listing, ad detail, user profile) using canonical vocabulary
- [ ] **Phase 38: Static Page Copy** — Rewrite meta copy for all four public static pages (FAQ, contact, sitemap, privacy policy) using canonical vocabulary

### Phase 36: SEO Bug Fixes
**Goal**: All crawlable pages emit clean, well-formed title and description tags with no rendering artifacts
**Depends on**: Nothing (first phase of milestone)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04
**Success Criteria** (what must be TRUE):
  1. `anuncios/[slug].vue` renders `{ad name} en {commune} | Waldo.click®` (single suffix, no `| Venta de Equipo en Waldo.click` fragment) and description contains `Waldo.click®` with ® and produces no double-space when ad description is null
  2. `[slug].vue` (user profile) renders `Perfil de {username} | Waldo.click®` (single suffix, no manually embedded `| Waldo.click®`) and description contains no `${totalAds}` counter
  3. `anuncios/index.vue` calls `$setSEO` in the SSR-safe context so the initial server-rendered HTML contains the correct title and description, and the trailing brand string reads `Waldo.click®` (with ®)
  4. `packs/index.vue` declares `useSeoMeta({ robots: "noindex, nofollow" })` so the page is not crawlable
**Plans**: TBD

### Phase 37: Dynamic Page Copy
**Goal**: The four highest-traffic public pages carry SERP-ready copy that uses canonical vocabulary, respects character budgets, and is free of stale counters
**Depends on**: Phase 36 (bugs fixed; templates are clean before copy is written)
**Requirements**: COPY-01, COPY-02, COPY-03, COPY-04
**Success Criteria** (what must be TRUE):
  1. `index.vue` title is ≤ 45 chars, uses `anuncios` and/or `activos industriales` (never `avisos` or `maquinaria industrial`), final rendered title is `{title} | Waldo.click®`
  2. `anuncios/index.vue` default-state title is ≤ 45 chars; category and commune branches also stay ≤ 45 chars; description uses `Waldo.click®` (with ®) in all branches and is 120–155 chars
  3. `anuncios/[slug].vue` title template produces ≤ 45 chars for a representative ad name + commune combination; description is 120–155 chars, contains `Waldo.click®` (with ®), and gracefully omits ad description when null without producing a double-space
  4. `[slug].vue` (user profile) title template produces ≤ 45 chars; description is 120–155 chars, uses canonical vocabulary, and contains no numeric counter
**Plans**: TBD

### Phase 38: Static Page Copy
**Goal**: All four public static pages carry distinct, keyword-rich SERP copy that uses canonical vocabulary and hits the character budget targets
**Depends on**: Phase 36 (vocabulary conventions confirmed and bugs fixed)
**Requirements**: COPY-05, COPY-06, COPY-07, COPY-08
**Success Criteria** (what must be TRUE):
  1. `preguntas-frecuentes.vue` title is ≤ 45 chars, description is 120–155 chars, copy uses canonical vocabulary (`anuncios`, `activos industriales`, `Waldo.click®`)
  2. `contacto/index.vue` title expands beyond the single word `Contacto` (≤ 45 chars), description is 120–155 chars; the rendered title `{new title} | Waldo.click®` is unique across all indexed pages
  3. `sitemap.vue` description contains `Waldo.click®` (with ®, replacing bare `Waldo.click`); title is ≤ 45 chars; description is 120–155 chars
  4. `politicas-de-privacidad.vue` title is ≤ 45 chars, description is 120–155 chars, copy uses canonical vocabulary throughout
**Plans**: TBD

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 3-34 | v1.1–v1.14 | All | Complete | 2026-03-05 to 2026-03-07 |
| 35. Website SEO Audit | v1.15 | 3/3 | Complete | 2026-03-07 |
| 36. SEO Bug Fixes | v1.16 | 0/? | Not started | - |
| 37. Dynamic Page Copy | v1.16 | 0/? | Not started | - |
| 38. Static Page Copy | v1.16 | 0/? | Not started | - |

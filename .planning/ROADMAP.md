# Roadmap: Waldo Project

## Milestones

- ⛔ **v1.25 Unified Checkout** — forcibly closed 2026-03-09. See `.planning/milestones/v1.25-ROADMAP.md`
- ✅ **v1.26 Mostrar comprobante Webpay** — Phase 060 (shipped 2026-03-11). See `.planning/milestones/v1.26-ROADMAP.md`
- ✅ **v1.27 Reparar eventos GA4 ecommerce** — Phase 061 (shipped 2026-03-12). See `.planning/milestones/v1.27-ROADMAP.md`
- ✅ **v1.28 Logout Store Cleanup** — Phase 062 (shipped 2026-03-12). See `.planning/milestones/v1.28-ROADMAP.md`
- ✅ **v1.29 News Manager** — Phases 063–064 (shipped 2026-03-12). See `.planning/milestones/v1.29-ROADMAP.md`
- ✅ **v1.30 Blog Public Views** — Phases 065–068 (shipped 2026-03-13). See `.planning/milestones/v1.30-ROADMAP.md`
  - ✅ **v1.31 Article Manager Improvements** — Phases 069–070 (shipped 2026-03-13). See `.planning/milestones/v1.31-ROADMAP.md`
- ✅ **v1.32 Gemini AI Service** — Phase 071 (shipped 2026-03-13). See `.planning/milestones/v1.32-ROADMAP.md`
- ✅ **v1.33 Anthropic Claude AI Service** — Phase 072 (shipped 2026-03-13)
- 🚧 **v1.34 LightBoxArticles** — Phases 073–074 (in progress)

## Phases

<details>
<summary>✅ v1.33 Anthropic Claude AI Service (Phase 072) — SHIPPED 2026-03-13</summary>

- [x] Phase 072: Anthropic Claude AI Service (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.32 Gemini AI Service (Phase 071) — SHIPPED 2026-03-13</summary>

- [x] Phase 071: Gemini AI Service (1/1 plan) — completed 2026-03-13

</details>

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
<summary>✅ v1.30 Blog Public Views (Phases 065–068) — SHIPPED 2026-03-13</summary>

- [x] Phase 065: Strapi Slug Field (1/1 plan) — completed 2026-03-13
- [x] Phase 066: Article Infrastructure (2/2 plans) — completed 2026-03-13
- [x] Phase 067: Blog Listing Page (3/3 plans) — completed 2026-03-13
- [x] Phase 068: Blog Detail Page (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.31 Article Manager Improvements (Phases 069–070) — SHIPPED 2026-03-13</summary>

- [x] Phase 069: Strapi Schema (1/1 plan) — completed 2026-03-13
- [x] Phase 070: Dashboard Form & Detail (1/1 plan) — completed 2026-03-13

</details>

### v1.34 LightBoxArticles (Phases 073–074) — IN PROGRESS

- [ ] **Phase 073: Tavily Search Backend** - Strapi `TavilyService` + `POST /api/search/tavily` endpoint
- [ ] **Phase 074: LightBoxArticles Dashboard** - `LightBoxArticles.vue` component (3-step flow) + SCSS + integration in articles page

## Phase Details

### Phase 073: Tavily Search Backend
**Goal**: Strapi exposes a working Tavily news search endpoint — a typed `TavilyService` reads the API key from env and a custom endpoint accepts a query and returns structured news results.
**Depends on**: Nothing (self-contained Strapi addition following existing service patterns)
**Requirements**: BACK-01
**Success Criteria** (what must be TRUE):
  1. `POST /api/search/tavily` with `{ query: "noticias maquinaria" }` returns `{ news: [{ title, link, snippet, date, source }] }`
  2. The `TAVILY_API_KEY` environment variable in Strapi `.env` is the sole location of the API key — never hardcoded in any service or controller file
  3. `TavilyService` in `apps/strapi/src/services/tavily/` encapsulates all Tavily API calls; the controller contains no direct HTTP calls
  4. When the Tavily API is unreachable or returns an error, `POST /api/search/tavily` responds with an appropriate HTTP error (4xx/5xx) and Strapi does not crash
**Plans**: TBD

### Phase 074: LightBoxArticles Dashboard
**Goal**: The dashboard administrator can search for news articles, generate an article draft using Gemini AI, and review the result — all within a 3-step lightbox modal accessible from the articles index page.
**Depends on**: Phase 073 (Tavily search endpoint must exist)
**Requirements**: LB-01, LB-02, LB-03, LB-04, LB-05, LB-06, LB-07, LB-08, SCSS-01, INT-01
**Success Criteria** (what must be TRUE):
  1. The articles index page shows a "Generar artículo" button (`btn--announcement` + `Wand2` icon) that opens the `LightBoxArticles` modal
  2. Step 1 of the lightbox shows a pre-filled query textarea; pressing "Buscar" calls `POST /api/search/tavily` and renders news results (title, URL, date) for selection
  3. Clicking a news result in Step 1 fetches the full HTML of that URL and advances to Step 2 with the selected article's title, URL, and date displayed
  4. Step 2 shows a pre-filled Gemini prompt textarea; pressing "Generar artículo" calls `POST /api/ia/gemini` and advances to Step 3 showing the generated result (title, header, Markdown body, keywords, source_url, source_date)
  5. The user can navigate back from Step 3 → Step 2 → Step 1 without losing state; the lightbox can be closed at any step
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
| 073   | v1.34     | 0/TBD          | Not started | -          |
| 074   | v1.34     | 0/TBD          | Not started | -          |
| 072   | v1.33     | 1/1            | Complete    | 2026-03-13 |
| 071   | v1.32     | 1/1            | Complete    | 2026-03-13 |
| 060   | v1.26     | 3/3            | Complete    | 2026-03-11 |
| 061   | v1.27     | 2/2            | Complete    | 2026-03-12 |
| 062   | v1.28     | 2/2            | Complete    | 2026-03-12 |
| 063   | v1.29     | 1/1            | Complete    | 2026-03-12 |
| 064   | v1.29     | 2/2            | Complete    | 2026-03-12 |
| 065   | v1.30     | 1/1            | Complete    | 2026-03-13 |
| 066   | v1.30     | 2/2            | Complete    | 2026-03-13 |
| 067   | v1.30     | 3/3            | Complete    | 2026-03-13 |
| 068   | v1.30     | 2/2            | Complete    | 2026-03-13 |
| 069   | v1.31     | 1/1            | Complete    | 2026-03-13 |
| 070   | v1.31     | 1/1            | Complete    | 2026-03-13 |

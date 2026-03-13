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

## Phase Details

### Phase 072: Anthropic Claude AI Service
**Goal**: Strapi exposes a working Anthropic Claude AI integration — a typed service reads both API keys from env, implements a `web_search` tool loop via Brave Search, and a custom endpoint accepts a prompt and returns Claude-generated text (with optional web search) with proper error handling.
**Depends on**: Phase 071 (ia controller/routes pattern established)
**Requirements**: CLAUDE-01, CLAUDE-02, CLAUDE-03, CLAUDE-04, CLAUDE-05, CLAUDE-06
**Success Criteria** (what must be TRUE):
  1. `POST /api/ia/claude` with `{ prompt: "..." }` returns `{ text: "..." }` with a Claude-generated response
  2. `ANTHROPIC_API_KEY` and `BRAVE_SEARCH_API_KEY` in Strapi `.env` are the sole locations of the API keys — never hardcoded in any service or controller file
  3. `AnthropicService` in `apps/strapi/src/services/anthropic/` encapsulates all Anthropic API calls and Brave Search calls; the controller contains no direct HTTP calls
  4. When Claude calls the `web_search` tool, Strapi executes the Brave Search query and returns results back to Claude to continue the conversation loop
  5. When the Anthropic API or Brave Search is unreachable or returns an error, `POST /api/ia/claude` responds with an appropriate HTTP error (4xx/5xx) and Strapi does not crash
**Plans**: 1 plan
  - [x] 072-01-PLAN.md — Install @anthropic-ai/sdk, implement AnthropicService with web_search tool loop, add POST /api/ia/claude endpoint

### Phase 071: Gemini AI Service
**Goal**: Strapi exposes a working Gemini AI integration — a typed service reads the API key from env, and a custom endpoint accepts a prompt and returns generated text with proper error handling.
**Depends on**: Nothing (self-contained Strapi addition)
**Requirements**: GEMINI-01, GEMINI-02, GEMINI-03, GEMINI-04, GEMINI-05
**Success Criteria** (what must be TRUE):
  1. `POST /api/ia/gemini` with `{ prompt: "Hello" }` returns `{ text: "..." }` with a Gemini-generated response
  2. The `GEMINI_API_KEY` environment variable in Strapi `.env` is the sole location of the API key — it is never hardcoded in any service or controller file
  3. `GeminiService` in `apps/strapi/src/services/` encapsulates all Gemini API calls; the controller contains no direct HTTP calls to Google
  4. When the Gemini API is unreachable or returns an error, `POST /api/ia/gemini` responds with an appropriate HTTP error (4xx/5xx) and Strapi does not crash
**Plans**: 1 plan

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
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

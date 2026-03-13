# Roadmap: Waldo Project

## Milestones

- ⛔ **v1.25 Unified Checkout** — forcibly closed 2026-03-09. See `.planning/milestones/v1.25-ROADMAP.md`
- ✅ **v1.26 Mostrar comprobante Webpay** — Phase 060 (shipped 2026-03-11). See `.planning/milestones/v1.26-ROADMAP.md`
- ✅ **v1.27 Reparar eventos GA4 ecommerce** — Phase 061 (shipped 2026-03-12). See `.planning/milestones/v1.27-ROADMAP.md`
- ✅ **v1.28 Logout Store Cleanup** — Phase 062 (shipped 2026-03-12). See `.planning/milestones/v1.28-ROADMAP.md`
- ✅ **v1.29 News Manager** — Phases 063–064 (shipped 2026-03-12). See `.planning/milestones/v1.29-ROADMAP.md`
- ✅ **v1.30 Blog Public Views** — Phases 065–068 (shipped 2026-03-13). See `.planning/milestones/v1.30-ROADMAP.md`
- 🔄 **v1.31 Article Manager Improvements** — Phases 069–070 (in progress). See `.planning/milestones/v1.31-ROADMAP.md`

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
<summary>✅ v1.30 Blog Public Views (Phases 065–068) — SHIPPED 2026-03-13</summary>

- [x] Phase 065: Strapi Slug Field (1/1 plan) — completed 2026-03-13
- [x] Phase 066: Article Infrastructure (2/2 plans) — completed 2026-03-13
- [x] Phase 067: Blog Listing Page (3/3 plans) — completed 2026-03-13
- [x] Phase 068: Blog Detail Page (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>🔄 v1.31 Article Manager Improvements (Phases 069–070) — IN PROGRESS</summary>

- [x] **Phase 069: Strapi Schema** — Add `source_url` field to Article content type (completed 2026-03-13)
- [ ] **Phase 070: Dashboard Form & Detail** — Draft/publish toggle + source_url field in FormArticle + detail view

</details>

### Phase 069: Strapi Schema

**Goal:** `source_url` field exists in Article content type and is returned by the API

**Requirements:** ARTC-01

**Success criteria:**
1. `source_url` (string, optional) exists in Article's `schema.json`
2. Field is visible in Strapi admin Content Manager
3. `GET /api/articles/:id` response includes `source_url`

**Plans:** 1/1 plans complete

Plans:
- [ ] 069-01-PLAN.md — Add source_url to Article schema + website interface

### Phase 070: Dashboard Form & Detail

**Goal:** Admin can toggle draft/publish and enter source URL in FormArticle; detail page shows source URL

**Requirements:** ARTF-01, ARTF-02, ARTF-03, ARTF-04, ARTF-05

**Success criteria:**
1. Create form: toggle/checkbox lets admin choose Borrador or Publicado before saving
2. Edit form: toggle reflects current state and can be changed
3. Saving sends `publishedAt: null` (draft) or current ISO timestamp (published)
4. `source_url` input saves on create and pre-fills on edit
5. Detail page (`/articles/:id`) shows `source_url` as a clickable link when non-empty

**Plans:** 1 plan

Plans:
- [ ] 070-01-PLAN.md — FormArticle draft/publish toggle + source_url field + detail page link

**Depends on:** Phase 069

## Progress

| Phase | Milestone | Plans Complete | Status   | Completed  |
|-------|-----------|----------------|----------|------------|
| 060   | v1.26     | 3/3            | Complete | 2026-03-11 |
| 061   | v1.27     | 2/2            | Complete | 2026-03-12 |
| 062   | v1.28     | 2/2            | Complete | 2026-03-12 |
| 063   | v1.29     | 1/1            | Complete | 2026-03-12 |
| 064   | v1.29     | 2/2            | Complete | 2026-03-12 |
| 065   | v1.30     | 1/1            | Complete | 2026-03-13 |
| 066   | v1.30     | 2/2            | Complete | 2026-03-13 |
| 067   | v1.30     | 3/3            | Complete | 2026-03-13 |
| 068   | v1.30     | 2/2            | Complete | 2026-03-13 |
| 069   | 1/1 | Complete    | 2026-03-13 | - |
| 070   | v1.31     | 0/?            | Not started | - |

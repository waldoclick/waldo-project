# Roadmap: Waldo Project

## Milestones

- ⛔ **v1.25 Unified Checkout** — forcibly closed 2026-03-09. See `.planning/milestones/v1.25-ROADMAP.md`
- ✅ **v1.26 Mostrar comprobante Webpay** — Phase 060 (shipped 2026-03-11). See `.planning/milestones/v1.26-ROADMAP.md`
- ✅ **v1.27 Reparar eventos GA4 ecommerce** — Phase 061 (shipped 2026-03-12). See `.planning/milestones/v1.27-ROADMAP.md`
- ✅ **v1.28 Logout Store Cleanup** — Phase 062 (shipped 2026-03-12). See `.planning/milestones/v1.28-ROADMAP.md`
- 🚧 **v1.29 News Manager** — Phases 063–064 (in progress)

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
<summary>🚧 v1.29 News Manager (Phases 063–064) — IN PROGRESS</summary>

- [ ] **Phase 063: News Content Type** — Strapi schema, SEO fields, draft/publish native support
- [ ] **Phase 064: Dashboard News UI** — Full CRUD interface for news management

</details>

## Phase Details

### Phase 063: News Content Type
**Goal**: The `News` content type exists in Strapi with all fields, SEO metadata, category relation, and native draft/publish support — ready to be consumed by the dashboard API.
**Depends on**: Nothing (backend-only, no frontend prerequisite)
**Requirements**: NEWS-01, NEWS-02, NEWS-03, NEWS-08
**Success Criteria** (what must be TRUE):
  1. A `News` entry can be created in Strapi admin with title, header, body (rich text), cover gallery, and image gallery
  2. A `News` entry can be related to one or more `categorias` entries (optional relation)
  3. A `News` entry can be saved as draft or published using Strapi's native draft/publish toggle — no custom status field exists on the schema
  4. A `News` entry has optional `seo_title` and `seo_description` short-text fields visible in Strapi admin
**Plans**: 1 plan

Plans:
- [ ] 063-01-PLAN.md — Create News content type (schema + controller + routes + service)

### Phase 064: Dashboard News UI
**Goal**: Dashboard administrators can list, create, edit, and delete news entries through the dashboard UI, including filling in SEO fields.
**Depends on**: Phase 063 (News content type API must exist)
**Requirements**: NEWS-04, NEWS-05, NEWS-06, NEWS-07, NEWS-09
**Success Criteria** (what must be TRUE):
  1. Admin can navigate to a News section in the dashboard and see a list of news items showing title, published/draft status, and date
  2. Admin can create a new news entry filling in all fields (title, header, body, cover, gallery, category, seo_title, seo_description) and save it
  3. Admin can open an existing news entry and edit any of its fields, then save the update
  4. Admin can delete a news entry from the list or detail view
  5. Admin can fill in `seo_title` and `seo_description` fields when creating or editing a news entry
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
| 060   | v1.26     | 3/3            | Complete    | 2026-03-11 |
| 061   | v1.27     | 2/2            | Complete    | 2026-03-12 |
| 062   | v1.28     | 2/2            | Complete    | 2026-03-12 |
| 063   | v1.29     | 0/TBD          | Not started | -          |
| 064   | v1.29     | 0/TBD          | Not started | -          |

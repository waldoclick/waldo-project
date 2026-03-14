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
- ✅ **v1.33 Anthropic Claude AI Service** — Phase 072 (shipped 2026-03-13). See `.planning/milestones/v1.33-ROADMAP.md`
- ✅ **v1.34 LightBoxArticles** — Phases 073–074 (shipped 2026-03-13). See `.planning/milestones/v1.34-ROADMAP.md`
- ✅ **v1.35 Gift Reservations to Users** — Phases 075–076 (shipped 2026-03-13). See `.planning/milestones/v1.35-ROADMAP.md`
- ✅ **v1.36 Two-Step Login Verification** — Phases 077–078 (shipped 2026-03-14). See `.planning/milestones/v1.36-ROADMAP.md`
- ✅ **v1.37 Email Authentication Flows** — Phases 079–082 (shipped 2026-03-14). See `.planning/milestones/v1.37-ROADMAP.md`
- 🚧 **v1.38 GA4 Analytics Audit & Implementation** — Phases 083–085 (in progress)

## Phases

### v1.38 GA4 Analytics Audit & Implementation

- [x] **Phase 083: Ecommerce Bug Fixes** — Correct purchase value, add_to_cart timing, and item_id in existing GA4 events (completed 2026-03-14)
- [ ] **Phase 084: Ad Discovery Tracking** — Fire view_item_list, view_item, and search events across ad listing and detail pages
- [ ] **Phase 085: Contact, Auth & Blog Events** — Add seller contact, sign_up, login, and article_view events

## Phase Details

### Phase 083: Ecommerce Bug Fixes
**Goal**: GA4 ecommerce events report accurate data — real revenue, real item IDs, and free ad creation tracked as a conversion
**Depends on**: Nothing (first phase of milestone)
**Requirements**: ECOM-01, ECOM-02, ECOM-03
**Success Criteria** (what must be TRUE):
  1. GA4 Realtime → Ecommerce → Purchase events show the actual transaction amount (e.g. $19.990) instead of $0
  2. GA4 `purchase` event `item_id` field shows the order's `documentId` string, not an empty string
  3. GA4 Realtime shows a `purchase` event with `value: 0` when a user completes a free ad creation at `/anunciar/gracias`
  4. All 12 existing Vitest tests in `useAdAnalytics` pass after the fixes; new tests cover corrected behavior
**Plans**: 2 plans

Plans:
- [ ] 083-01-PLAN.md — Fix purchase() value coercion (ECOM-01) and item_id fallback (ECOM-02) in useAdAnalytics.ts + tests
- [ ] 083-02-PLAN.md — Add free-ad purchase event watcher to anunciar/gracias.vue (ECOM-03) + tests

### Phase 084: Ad Discovery Tracking
**Goal**: Users browsing ads generate GA4 discovery events — every listing view, detail view, and search is captured
**Depends on**: Phase 083
**Requirements**: DISC-01, DISC-02, DISC-03
**Success Criteria** (what must be TRUE):
  1. GA4 Realtime shows a `view_item_list` event with an `items` array when a user loads `/anuncios`
  2. GA4 Realtime shows a `view_item` event with `item_id`, `item_name`, `price`, and `item_category` when a user opens an ad detail page
  3. GA4 Realtime shows a `search` event with `search_term` populated when a user submits a keyword search or selects a commune filter on `/anuncios`
  4. Navigating between multiple ads generates distinct `view_item` events (one per ad) in GA4 Realtime
**Plans**: TBD

### Phase 085: Contact, Auth & Blog Events
**Goal**: User lifecycle and engagement actions — contacting a seller, registering, logging in, and reading articles — all produce GA4 events
**Depends on**: Phase 084
**Requirements**: CONT-01, CONT-02, LEAD-01, AUTH-01, AUTH-02, BLOG-01
**Success Criteria** (what must be TRUE):
  1. GA4 Realtime shows a `contact` event with `method: "email"` when a logged-in user clicks the seller's email link on an ad detail page
  2. GA4 Realtime shows a `contact` event with `method: "phone"` when a logged-in user clicks the seller's phone link on an ad detail page
  3. GA4 Realtime shows a `generate_lead` event when a user reaches `/contacto/gracias` after submitting the contact form
  4. GA4 Realtime shows a `sign_up` event with `method: "email"` immediately after a user completes registration via `FormRegister.vue`
  5. GA4 Realtime shows a `login` event with `method: "email"` or `method: "google"` after the 2-step verification completes successfully in `FormLogin.vue`
  6. GA4 Realtime shows an `article_view` event with `article_id`, `article_title`, and `article_category` when a user opens a blog article at `/blog/[slug]`
**Plans**: TBD

---

<details>
<summary>✅ v1.36 Two-Step Login Verification (Phases 077–078) — SHIPPED 2026-03-14</summary>

- [x] Phase 077: Strapi 2-Step Backend (4/4 plans) — completed 2026-03-13
- [x] Phase 078: Dashboard Verify Flow (2/2 plans) — completed 2026-03-14

</details>

<details>
<summary>✅ v1.35 Gift Reservations to Users (Phases 075–076) — SHIPPED 2026-03-13</summary>

- [x] Phase 075: Strapi Gift Endpoints (2/2 plans) — completed 2026-03-13
- [x] Phase 076: Dashboard Gift Lightbox (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.34 LightBoxArticles (Phases 073–074) — SHIPPED 2026-03-13</summary>

- [x] Phase 073: Tavily Search Backend (2/2 plans) — completed 2026-03-13
- [x] Phase 074: LightBoxArticles Dashboard (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.33 Anthropic Claude AI Service (Phase 072) — SHIPPED 2026-03-13</summary>

- [x] Phase 072: Anthropic Claude AI Service (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.32 Gemini AI Service (Phase 071) — SHIPPED 2026-03-13</summary>

- [x] Phase 071: Gemini AI Service (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.31 Article Manager Improvements (Phases 069–070) — SHIPPED 2026-03-13</summary>

- [x] Phase 069: Strapi Schema (1/1 plan) — completed 2026-03-13
- [x] Phase 070: Dashboard Form & Detail (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.30 Blog Public Views (Phases 065–068) — SHIPPED 2026-03-13</summary>

- [x] Phase 065: Strapi Slug Field (1/1 plan) — completed 2026-03-13
- [x] Phase 066: Article Infrastructure (2/2 plans) — completed 2026-03-13
- [x] Phase 067: Blog Listing Page (3/3 plans) — completed 2026-03-13
- [x] Phase 068: Blog Detail Page (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.29 News Manager (Phases 063–064) — SHIPPED 2026-03-12</summary>

- [x] Phase 063: News Content Type (1/1 plan) — completed 2026-03-12
- [x] Phase 064: Dashboard Articles UI (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.28 Logout Store Cleanup (Phase 062) — SHIPPED 2026-03-12</summary>

- [x] Phase 062: Logout Store Cleanup (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.27 Reparar eventos GA4 ecommerce (Phase 061) — SHIPPED 2026-03-12</summary>

- [x] Phase 061: Fix GA4 ecommerce events (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.26 Mostrar comprobante Webpay (Phase 060) — SHIPPED 2026-03-11</summary>

- [x] Phase 060: Mostrar comprobante Webpay (3/3 plans) — completed 2026-03-11

</details>

<details>
<summary>✅ v1.37 Email Authentication Flows (Phases 079–082) — SHIPPED 2026-03-14</summary>

- [x] Phase 079: Website Verify Flow + MJML Fix (1/1 plan) — completed 2026-03-14
- [x] Phase 080: Password Reset MJML + Context Routing (2/2 plans) — completed 2026-03-14
- [x] Phase 081: Email Verification Frontend (2/2 plans) — completed 2026-03-14
- [x] Phase 082: Email Verification Backend Activation (1/1 plan) — completed 2026-03-14

</details>

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
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
| 071   | v1.32     | 1/1            | Complete    | 2026-03-13 |
| 072   | v1.33     | 1/1            | Complete    | 2026-03-13 |
| 073   | v1.34     | 2/2            | Complete    | 2026-03-13 |
| 074   | v1.34     | 2/2            | Complete    | 2026-03-13 |
| 075   | v1.35     | 2/2            | Complete    | 2026-03-13 |
| 076   | v1.35     | 2/2            | Complete    | 2026-03-13 |
| 077   | v1.36     | 4/4            | Complete    | 2026-03-13 |
| 078   | v1.36     | 2/2            | Complete    | 2026-03-14 |
| 079   | v1.37     | 1/1            | Complete    | 2026-03-14 |
| 080   | v1.37     | 2/2            | Complete    | 2026-03-14 |
| 081   | v1.37     | 2/2            | Complete    | 2026-03-14 |
| 082   | v1.37     | 1/1            | Complete    | 2026-03-14 |
| 083   | 2/2 | Complete    | 2026-03-14 | -          |
| 084   | v1.38     | 0/?            | Not started | -          |
| 085   | v1.38     | 0/?            | Not started | -          |

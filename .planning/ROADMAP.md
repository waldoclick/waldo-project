# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- ✅ **v1.3 Utility Extraction** — Phases 9-11 (shipped 2026-03-06)
- 🚧 **v1.4 URL Localization** — Phases 12-15 (active)

## Phases

<details>
<summary>✅ v1.1 Dashboard Technical Debt Reduction (Phases 3-6) — SHIPPED 2026-03-05</summary>

Phases 3-6 completed in v1.1: double-fetch + pagination isolation, Sentry/dead-code cleanup,
AdsTable generic component, canonical domain types + typeCheck, Strapi aggregate endpoints.
Archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 Double-Fetch Cleanup (Phases 7-8) — SHIPPED 2026-03-05</summary>

Phases 7-8 completed in v1.2: eliminated redundant `onMounted` from all 10 non-ads dashboard
components; `watch({ immediate: true })` is now sole data-loading trigger across the entire dashboard.
Archive: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>✅ v1.3 Utility Extraction (Phases 9-11) — SHIPPED 2026-03-06</summary>

**Milestone Goal:** Extract all inline duplicated pure functions (date, price, string) into shared utility files and replace every inline copy with an import — zero duplicate function definitions remain in the dashboard.

- [x] **Phase 9: Date Utilities** - Create `app/utils/date.ts` and replace all 33 inline date formatting definitions
- [x] **Phase 10: Price Utilities** - Create `app/utils/price.ts` and replace all 13 inline currency formatting definitions
- [x] **Phase 11: String Utilities** - Create `app/utils/string.ts` and replace all 6 inline string utility definitions

Archive: `.planning/milestones/v1.3-ROADMAP.md`

</details>

---

### v1.4 URL Localization (Phases 12-15)

**Milestone Goal:** All dashboard URL segments are in English. Old Spanish URLs redirect to their English equivalents. No functional changes — pure route rename.

- [x] **Phase 12: Ads Migration** — Rename `anuncios` directory and all 6 sub-status pages to English equivalents (completed 2026-03-06)
- [x] **Phase 13: Catalog Segments Migration** — Rename `categorias`, `comunas`, `condiciones`, `ordenes`, `regiones`, `usuarios` to English (completed 2026-03-06)
- [ ] **Phase 14: Account, Featured & Reservations Migration** — Rename `cuenta`, `destacados`, `reservas` with their non-standard sub-routing patterns
- [ ] **Phase 15: Links, Redirects & Build Verification** — Update all internal route references, add Spanish→English redirects, verify `nuxt typecheck`

## Phase Details

### Phase 12: Ads Migration
**Goal**: The `/ads` route tree is fully functional with all 8 status sub-pages accessible
**Depends on**: Nothing (first phase of v1.4)
**Requirements**: URL-01, URL-02
**Success Criteria** (what must be TRUE):
  1. Navigating to `/ads` shows the ads list without errors
  2. Each status sub-page (`/ads/active`, `/ads/pending`, `/ads/abandoned`, `/ads/banned`, `/ads/expired`, `/ads/rejected`) loads the correct filtered list
  3. The old `/anuncios` paths are not relied upon by any renamed page file
**Plans**: 1 plan

Plans:
- [ ] 12-01-PLAN.md — Rename anuncios/ to ads/, translate sub-page filenames, update internal route refs

### Phase 13: Catalog Segments Migration
**Goal**: Six catalog sections are accessible at their English URLs — categories, communes, conditions, orders, regions, users
**Depends on**: Phase 12
**Requirements**: URL-03, URL-04, URL-05, URL-08, URL-09, URL-11
**Success Criteria** (what must be TRUE):
  1. Navigating to `/categories`, `/communes`, `/conditions`, `/orders`, `/regions`, `/users` each loads the correct list page
  2. Detail and edit sub-routes (e.g., `/categories/[id]/edit`, `/regions/new`) load without 404 or routing errors
  3. The renamed directory files are the sole source of routing for these 6 sections
**Plans**: 3 plans

Plans:
- [ ] 13-01-PLAN.md — Rename categorias→categories and regiones→regions, translate editar→edit sub-pages, update internal route refs
- [ ] 13-02-PLAN.md — Rename comunas→communes and condiciones→conditions, translate editar→edit sub-pages, update internal route refs
- [ ] 13-03-PLAN.md — Rename ordenes→orders and usuarios→users, update internal route refs

### Phase 14: Account, Featured & Reservations Migration
**Goal**: Account settings, featured ads, and reservations are accessible at their English URLs with correct sub-page routing
**Depends on**: Phase 12
**Requirements**: URL-06, URL-07, URL-10
**Success Criteria** (what must be TRUE):
  1. Navigating to `/account/profile`, `/account/profile/edit`, and `/account/change-password` each loads the correct page
  2. Navigating to `/featured`, `/featured/free`, `/featured/used`, `/featured/[id]` loads the correct content
  3. Navigating to `/reservations`, `/reservations/free`, `/reservations/used`, `/reservations/[id]` loads the correct content
**Plans**: 2 plans

Plans:
- [ ] 14-01-PLAN.md — Rename cuenta→account and destacados→featured, translate sub-page filenames, update internal route refs
- [ ] 14-02-PLAN.md — Rename reservas→reservations, translate sub-page filenames, update internal route refs

### Phase 15: Links, Redirects & Build Verification
**Goal**: Every internal link uses English URLs, Spanish URLs redirect rather than 404, and the dashboard builds cleanly
**Depends on**: Phase 12, Phase 13, Phase 14
**Requirements**: LINK-01, LINK-02, LINK-03, REDIR-01
**Success Criteria** (what must be TRUE):
  1. Clicking any sidebar or navigation menu item takes the user to an English URL
  2. Any `navigateTo()` or `<NuxtLink>` call in component code resolves to an English path
  3. Visiting a legacy Spanish URL (e.g., `/anuncios/pendientes`) redirects to the English equivalent (`/ads/pending`) without a 404
  4. `nuxt typecheck` completes with zero errors after all changes
**Plans**: TBD

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 12. Ads Migration | 1/1 | Complete    | 2026-03-06 |
| 13. Catalog Segments Migration | 3/3 | Complete    | 2026-03-06 |
| 14. Account, Featured & Reservations Migration | 1/2 | In Progress|  |
| 15. Links, Redirects & Build Verification | 0/? | Not started | - |

# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- ✅ **v1.3 Utility Extraction** — Phases 9-11 (shipped 2026-03-06)
- ✅ **v1.4 URL Localization** — Phases 12-15 (shipped 2026-03-06)

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

<details>
<summary>✅ v1.4 URL Localization (Phases 12-15) — SHIPPED 2026-03-06</summary>

**Milestone Goal:** All dashboard URL segments are in English. Old Spanish URLs redirect to their English equivalents. No functional changes — pure route rename.

- [x] **Phase 12: Ads Migration** — Renamed `anuncios/` → `ads/` with 8 status sub-pages (completed 2026-03-06)
- [x] **Phase 13: Catalog Segments Migration** — Renamed 6 directories to English (completed 2026-03-06)
- [x] **Phase 14: Account, Featured & Reservations Migration** — Renamed `cuenta`→`account`, `destacados`→`featured`, `reservas`→`reservations` (completed 2026-03-06)
- [x] **Phase 15: Links, Redirects & Build Verification** — Updated all route references, added 301 redirects, `nuxt typecheck` passes (completed 2026-03-06)

Archive: `.planning/milestones/v1.4-ROADMAP.md`

</details>

---

## v1.5 Ad Credit Refund

**Milestone Goal:** When an ad is rejected or banned, return the ad reservation and featured reservation credits to the user, and notify them via email that their credits were refunded.

### Phases

- [ ] **Phase 16: Credit Refund Logic** — Wire credit return into `rejectAd()` and `bannedAd()` in Strapi
- [ ] **Phase 17: Email Notification Update** — Update `ad-rejected.mjml` and `ad-banned.mjml` to include conditional credit-returned messaging

### Phase Details

#### Phase 16: Credit Refund Logic
**Goal**: When an ad is rejected or banned, its associated reservations are immediately freed for reuse
**Depends on**: Nothing (first phase of v1.5)
**Requirements**: REFUND-01, REFUND-02, REFUND-03, REFUND-04
**Success Criteria** (what must be TRUE):
  1. Rejecting an ad with an `ad_reservation` causes that reservation's `ad` field to become `null` in the database
  2. Rejecting an ad with an `ad_featured_reservation` causes that reservation's `ad` field to become `null` in the database
  3. Banning an ad with an `ad_reservation` causes that reservation's `ad` field to become `null` in the database
  4. Banning an ad with an `ad_featured_reservation` causes that reservation's `ad` field to become `null` in the database
  5. Reservations freed by reject/ban are immediately reusable by new ads (no orphan state)
**Plans**: 1 plan

Plans:
- [ ] 16-01-PLAN.md — Wire reservation-freeing into rejectAd() and bannedAd()

#### Phase 17: Email Notification Update
**Goal**: Users receive clear confirmation in reject/ban emails that their credits were refunded
**Depends on**: Phase 16 (refund flags `adReservationReturned` / `featuredReservationReturned` set in service layer)
**Requirements**: EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04
**Success Criteria** (what must be TRUE):
  1. Reject email sent for an ad that had an `ad_reservation` contains a message indicating the ad credit was returned
  2. Reject email sent for an ad that had an `ad_featured_reservation` contains a message indicating the featured credit was returned
  3. Ban email sent for an ad that had an `ad_reservation` contains a message indicating the ad credit was returned
  4. Ban email sent for an ad that had an `ad_featured_reservation` contains a message indicating the featured credit was returned
  5. Reject/ban emails for ads with no reservations do not include any credit-return messaging (conditional rendering)
**Plans**: TBD

### Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 16. Credit Refund Logic | 0/? | Not started | — |
| 17. Email Notification Update | 0/? | Not started | — |

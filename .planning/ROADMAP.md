# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- ✅ **v1.3 Utility Extraction** — Phases 9-11 (shipped 2026-03-06)
- ✅ **v1.4 URL Localization** — Phases 12-15 (shipped 2026-03-06)
- ✅ **v1.5 Ad Credit Refund** — Phases 16-17 (shipped 2026-03-06)
- ✅ **v1.6 Website API Optimization** — Phases 18-19 (shipped 2026-03-06)

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

Phases 9-11 completed in v1.3: date, price, and string utilities extracted into `app/utils/`; all
51 inline duplicate function definitions eliminated across the dashboard.
Archive: `.planning/milestones/v1.3-ROADMAP.md`

</details>

<details>
<summary>✅ v1.4 URL Localization (Phases 12-15) — SHIPPED 2026-03-06</summary>

Phases 12-15 completed in v1.4: all dashboard URL segments renamed to English; 301 redirects added
for legacy Spanish paths; `nuxt typecheck` passes with zero errors.
Archive: `.planning/milestones/v1.4-ROADMAP.md`

</details>

<details>
<summary>✅ v1.5 Ad Credit Refund (Phases 16-17) — SHIPPED 2026-03-06</summary>

**Milestone Goal:** When an ad is rejected or banned, return the ad reservation and featured reservation credits to the user, and notify them via email that their credits were refunded.

- [x] **Phase 16: Credit Refund Logic** — Wired reservation-freeing into `rejectAd()` and `bannedAd()` (completed 2026-03-06)
- [x] **Phase 17: Email Notification Update** — Updated `ad-rejected.mjml` and `ad-banned.mjml` with conditional credit-return messaging (completed 2026-03-06)

Archive: `.planning/milestones/v1.5-ROADMAP.md`

</details>

<details>
<summary>✅ v1.6 Website API Optimization (Phases 18-19) — SHIPPED 2026-03-06</summary>

**Milestone Goal:** Eliminate double-fetches and redundant API calls in the website, applying the same patterns already established in the dashboard (v1.2).

- [x] **Phase 18: Page Double-Fetch Fixes** — Fixed `preguntas-frecuentes.vue` (2 calls → 1); added `GET /api/ads/me/counts` Strapi endpoint; `mis-anuncios.vue` reduced from 6 API calls → 2 (completed 2026-03-06)
- [x] **Phase 19: Store Cache Guards & Component Cleanup** — 30-min timestamp-based cache guards added to `packs.store.ts`, `conditions.store.ts`, `regions.store.ts`; redundant `loadCommunes()` removed from `FormCreateThree.vue` (completed 2026-03-06)

Archive: `.planning/milestones/v1.6-ROADMAP.md`

</details>

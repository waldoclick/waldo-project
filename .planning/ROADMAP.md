# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- ✅ **v1.3 Utility Extraction** — Phases 9-11 (shipped 2026-03-06)

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

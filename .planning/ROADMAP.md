# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- 🚧 **v1.3 Utility Extraction** — Phases 9-11 (in progress)

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

### 🚧 v1.3 Utility Extraction (In Progress)

**Milestone Goal:** Extract all inline duplicated pure functions (date, price, string) into shared utility files and replace every inline copy with an import — zero duplicate function definitions remain in the dashboard.

- [ ] **Phase 9: Date Utilities** - Create `app/utils/date.ts` and replace all 33 inline date formatting definitions
- [ ] **Phase 10: Price Utilities** - Create `app/utils/price.ts` and replace all 13 inline currency formatting definitions
- [ ] **Phase 11: String Utilities** - Create `app/utils/string.ts` and replace all 6 inline string utility definitions

## Phase Details

### Phase 9: Date Utilities
**Goal**: Developers import date formatting from a single source; no inline date formatters exist anywhere in the dashboard
**Depends on**: Phase 8 (v1.2 complete)
**Requirements**: UTIL-01, UTIL-02, UTIL-07
**Success Criteria** (what must be TRUE):
  1. `app/utils/date.ts` exists and exports `formatDate` and `formatDateShort` with correct signatures (string | undefined input, string output, undefined → "--")
  2. No component or page in `apps/dashboard` contains an inline definition of `formatDate` or `formatDateShort`
  3. All 33 previously-inline call sites render dates identically to before (no visual regression)
  4. `nuxt typecheck` passes with zero TypeScript errors after replacements
**Plans**: 5 plans
- [ ] 09-01-utils-setup-PLAN.md — Create date utilities and tests
- [ ] 09-02-utils-replace-components-PLAN.md — Replace inline formatters in components (Part 1)
- [ ] 09-03-utils-replace-components-part2-PLAN.md — Replace inline formatters in components (Part 2)
- [ ] 09-04-utils-replace-pages-PLAN.md — Replace inline formatters in pages (Part 1)
- [ ] 09-05-utils-replace-pages-part2-PLAN.md — Replace inline formatters in pages (Part 2)

### Phase 10: Price Utilities
**Goal**: Developers import currency formatting from a single source; no inline currency formatters exist anywhere in the dashboard
**Depends on**: Phase 9
**Requirements**: UTIL-03, UTIL-04, UTIL-07
**Success Criteria** (what must be TRUE):
  1. `app/utils/price.ts` exists and exports `formatCurrency` accepting `number | string | undefined | null` with CLP as default currency and null/undefined/falsy → "--"
  2. No component or page in `apps/dashboard` contains an inline `formatCurrency` definition or bare `Intl.NumberFormat` currency pattern
  3. All 13 previously-inline call sites render prices identically to before (no visual regression)
  4. `nuxt typecheck` passes with zero TypeScript errors after replacements
**Plans**: TBD

### Phase 11: String Utilities
**Goal**: Developers import all string formatting helpers from a single source; no inline string utility definitions exist anywhere in the dashboard
**Depends on**: Phase 10
**Requirements**: UTIL-05, UTIL-06, UTIL-07
**Success Criteria** (what must be TRUE):
  1. `app/utils/string.ts` exists and exports `formatFullName`, `formatAddress`, `formatBoolean`, `formatDays`, and `getPaymentMethod` — all typed, all handle undefined/missing input gracefully
  2. No component or page in `apps/dashboard` contains an inline definition of any of those five functions
  3. All 6 previously-inline call sites render string values identically to before (no visual regression)
  4. `nuxt typecheck` passes with zero TypeScript errors after all v1.3 replacements complete
**Plans**: TBD

## Progress

**Execution Order:** Phases execute in numeric order: 9 → 10 → 11

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 9. Date Utilities | v1.3 | 0/5 | Not started | - |
| 10. Price Utilities | v1.3 | 0/? | Not started | - |
| 11. String Utilities | v1.3 | 0/? | Not started | - |

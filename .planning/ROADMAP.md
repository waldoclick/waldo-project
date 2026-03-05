# Roadmap: Waldo — v1.1 Dashboard Technical Debt Reduction

## Overview

This milestone eliminates critical technical debt in `apps/dashboard`: double fetch on mount, shared pagination state across unrelated views, silent error suppression in production, ~1,200 lines of duplicated Ads component code, 62+ untyped `any` references in domain-critical paths, and N+1 category queries. All work is confined to the dashboard app — no changes to Strapi or Website. When complete, the dashboard is maintainable, type-safe, and free of the performance anti-patterns that degrade operator experience at scale.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (3.1, 3.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 3: Quick Wins** - Eliminate double fetch, isolate pagination per section, pin dependency versions, restore error visibility, and remove dead code (completed -) (completed 2026-03-04)
- [x] **Phase 4: Component Consolidation** - Replace 6 duplicated Ads components with a single generic AdsTable and verify behavioral parity (completed 2026-03-05)
- [x] **Phase 5: Type Safety** - Define shared domain types for all major entities and enable typeCheck in build (completed 2026-03-05)
- [ ] **Phase 6: Performance** - Eliminate N+1 category queries, move ChartSales aggregation server-side, and consolidate StatisticsDefault calls

## Phase Details

### Phase 3: Quick Wins
**Goal**: The dashboard is free of the most impactful low-cost defects: components fetch once, each ads section has its own pagination, dependency versions are deterministic, errors are visible in production, and dead code is gone
**Depends on**: Nothing (v1.1 starting phase)
**Requirements**: QUICK-01, QUICK-02, QUICK-03, QUICK-04, QUICK-05, QUICK-06, QUICK-07
**Success Criteria** (what must be TRUE):
  1. Navigating to any ads list view triggers exactly one API call on mount — no duplicate request appears in the network tab
  2. Advancing the page in "Pending Ads" does not affect the page number shown in "Active Ads" or any other ads section
  3. `package.json` shows exact version strings for `vue` and `vue-router` (e.g., `"3.x.x"`) — `npm install` from scratch produces the same dependency tree every time
  4. A thrown error in a dashboard page handler is visible in the Sentry dashboard and is not swallowed silently on the client
  5. `AppStore` contains only state relevant to the dashboard; `nuxt.config.ts` contains no commented-out module blocks; no unused dependencies appear in `package.json`
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — Fix double-fetch and isolate pagination per ads section (QUICK-01, QUICK-02)
- [ ] 03-02-PLAN.md — Pin vue/vue-router versions and remove dead dependencies + auth middleware (QUICK-03, QUICK-06)
- [ ] 03-03-PLAN.md — Restore production error visibility via Sentry in useLogger (QUICK-04)
- [ ] 03-04-PLAN.md — Prune AppStore dead state and clean nuxt.config.ts commented blocks (QUICK-05, QUICK-07)

### Phase 4: Component Consolidation
**Goal**: A single `AdsTable.vue` component handles all ads list views; the six original components are deleted; every existing operator workflow (filter, paginate, ban, approve, reject) works identically
**Depends on**: Phase 3
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. `AdsTable.vue` exists and accepts `endpoint` and `status` props; the six `Ads*` component files are deleted from the codebase
  2. Each ads list page (`/ads/pending`, `/ads/active`, `/ads/archived`, `/ads/banned`, `/ads/rejected`, `/ads/abandoned`) renders correctly using `<AdsTable>` with no regressions in filters, pagination, or row actions
  3. If `Reservations*` or `Featured*` components show equivalent duplication on analysis, they are consolidated under the same pattern in this phase — or the decision to defer is documented
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Create AdsTable.vue generic component (COMP-01)
- [ ] 04-02-PLAN.md — Migrate six ads pages to AdsTable and delete Ads* components (COMP-02, COMP-03)
- [ ] 04-03-PLAN.md — Document COMP-04 deferral decision for Reservations*/Featured* (COMP-04)

### Phase 5: Type Safety
**Goal**: Domain entities have a single source of truth for their TypeScript types; the build enforces type correctness; no component uses `any` for `Ad`, `User`, `Order`, `Category`, or `Pack` data
**Depends on**: Phase 4
**Requirements**: TYPE-01, TYPE-02, TYPE-03
**Success Criteria** (what must be TRUE):
  1. `app/types/` contains interface definitions for `Ad`, `User`, `Order`, `Category`, and `Pack` — these are the only authoritative type declarations for those entities in the dashboard
  2. `AdsTable.vue` and all ads pages import and use the shared types; no `any` appears in their props, emits, or data bindings for domain fields
  3. `typeCheck: true` is set in `nuxt.config.ts` and `npm run build` completes without TypeScript errors
**Plans**: 4 plans

Plans:
- [ ] 05-01-PLAN.md — Define Ad, User, Order, Category, Pack interfaces in app/types/ (TYPE-01)
- [ ] 05-02-PLAN.md — Replace inline Ad types in AdsTable.vue and anuncios/[id].vue (TYPE-02)
- [ ] 05-03-PLAN.md — Replace inline types in Users/Orders/Categories/Packs components and detail pages (TYPE-02)
- [ ] 05-04-PLAN.md — Enable typeCheck: true and achieve clean build (TYPE-03)

### Phase 6: Performance
**Goal**: The dashboard makes the minimum number of Strapi calls required to render each view; category counts load in one round trip; sales chart data is aggregated on the server; statistics calls are as consolidated as layout allows
**Depends on**: Phase 5
**Requirements**: PERF-01, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. `CategoriesDefault.vue` triggers one Strapi call that returns per-category ad counts — the network tab shows no parallel N calls for individual category counts (requires a Strapi endpoint that returns aggregated counts; creating this endpoint is in scope for this phase if it does not already exist)
  2. `ChartSales.vue` fetches a single pre-aggregated monthly sales dataset from Strapi — it does not paginate through raw order records on the client (requires a Strapi aggregate endpoint; in scope to create if absent)
  3. `StatisticsDefault.vue`'s parallel calls are audited; any that can be served by a single endpoint are consolidated, and the reduction in call count is documented — the statistics card layout is unchanged
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — Create Strapi aggregate endpoints for category ad-counts and order sales-by-month (PERF-01, PERF-02)
- [ ] 06-02-PLAN.md — Create Strapi dashboard-stats endpoint consolidating all 16 StatisticsDefault counts (PERF-03)
- [ ] 06-03-PLAN.md — Update CategoriesDefault, ChartSales, and StatisticsDefault to use aggregate endpoints (PERF-01, PERF-02, PERF-03)

## Progress

**Execution Order:**
Phases execute in numeric order: 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 3. Quick Wins | 4/4 | Complete   | 2026-03-04 |
| 4. Component Consolidation | 3/3 | Complete   | 2026-03-05 |
| 5. Type Safety | 4/4 | Complete   | 2026-03-05 |
| 6. Performance | 2/3 | In Progress|  |

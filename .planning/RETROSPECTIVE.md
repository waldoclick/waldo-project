# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — Dashboard Technical Debt Reduction

**Shipped:** 2026-03-05
**Phases:** 4 (3-6) | **Plans:** 15 | **Timeline:** 2 days

### What Was Built
- Double-fetch eliminated and pagination isolated per ads section via dedicated settings store keys
- `AdsTable.vue` generic component replacing 6 duplicated Ads* components (~1,200 lines removed)
- Canonical domain types (Ad, User, Order, Category, Pack) in `app/types/` — single source of truth
- `typeCheck: true` enabled with clean build (resolved 200+ TypeScript errors across 50+ files)
- Sentry error visibility restored; dead code, deps, and auth middleware removed
- 3 Strapi aggregate endpoints (categories/ad-counts, orders/sales-by-month, indicators/dashboard-stats) wired to dashboard components — N+1 and client-side pagination loops eliminated

### What Worked
- Wave-based plan execution: quick wins first (Phase 3) unblocked all subsequent phases cleanly
- Atomic task commits made each plan reviewable and reversible at any point
- gsd-tools roadmap analyze correctly surfaced Phase 6 disk_status discrepancy (ROADMAP showed 2/3 but 3 SUMMARYs existed)
- The Strapi SDK v5 cast pattern (established in Phase 5) carried cleanly into Phase 6 — no rework

### What Was Inefficient
- Phase 5 (typeCheck) took ~90 min for a single plan — the 200+ errors were all systematic but required touching 50+ files. A pre-check run of vue-tsc before enabling typeCheck in config would have surfaced errors without the blocking build failure loop
- ROADMAP.md Phase 6 progress row was never updated to show 3/3 Complete — STATE.md and ROADMAP were out of sync at milestone close

### Patterns Established
- `watch({ immediate: true })` as sole data-loading trigger — never pair with `onMounted`
- Per-entity section keys in settings store — never share a key between distinct list views
- Strapi SDK v5 casts: `response.data as T[]`, `params as Record<string,unknown>`, `payload as unknown as Parameters<...>[N]`
- Aggregate endpoint pattern: `findMany` with `limit:-1` + server-side aggregation over N client HTTP round trips
- Custom Strapi route ordering: specific paths (e.g. `/categories/ad-counts`) before parameterized paths (`:id`)
- `Omit<DomainType, field> & { field?: NarrowShape }` for API response shape compatibility without full interface re-declaration

### Key Lessons
1. **Enable type checking early.** Running vue-tsc before touching code (not after enabling typeCheck) surfaces errors without blocking builds mid-work.
2. **Defer consolidation when prerequisites are missing.** Reservations*/Featured* correctly deferred — forced consolidation would have created pagination conflicts. Document the blockers explicitly so the next milestone can act on them.
3. **Strapi route ordering matters.** Specific routes must precede parameterized routes; Strapi processes arrays in order and will match `:id` before named paths if order is wrong.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: ~6-8 (estimated)
- Notable: Phase 5 typeCheck plan had the highest cost (50+ files, 90 min) — systematic but unavoidable given accumulated type debt

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 2 | 4 | Initial payment gateway abstraction |
| v1.1 | 4 | 15 | First full GSD workflow with wave parallelization |

### Cumulative Quality

| Milestone | Tests | typeCheck | Zero-Dep Additions |
|-----------|-------|-----------|-------------------|
| v1.0 | none | false | 0 |
| v1.1 | none | true | 1 (vue-tsc) |

### Top Lessons (Verified Across Milestones)

1. Keep Strapi as the single business logic layer — frontend stays stateless and swappable
2. Establish canonical types and patterns early; deferred type debt compounds across components

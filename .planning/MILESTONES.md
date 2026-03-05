# Milestones

## v1.2 Double-Fetch Cleanup (Shipped: 2026-03-05)

**Phases completed:** 2 phases (7-8), 2 plans, 4 tasks
**Files changed:** 10 source files modified
**Timeline:** 2026-03-05 (~28 minutes)

**Key accomplishments:**
1. Eliminated double-fetch from 6 catalog components (PacksDefault, UsersDefault, RegionsDefault, FaqsDefault, CommunesDefault, ConditionsDefault) — `onMounted` removed, `watch({ immediate: true })` retained as sole trigger
2. Eliminated double-fetch from 4 transactional components (ReservationsFree, ReservationsUsed, FeaturedFree, FeaturedUsed) — same purely subtractive approach
3. Fixed `searchParams: any` → `Record<string, unknown>` in all 10 affected components (Strapi SDK v5 pattern)
4. Resolved TS18046 narrowing errors from `Record<string, unknown>` nested property access via explicit cast pattern
5. Build passes `typeCheck: true` with zero TypeScript errors — double-fetch bug fully eliminated across entire non-ads dashboard

**Archive:** `.planning/milestones/v1.2-ROADMAP.md` | `.planning/milestones/v1.2-REQUIREMENTS.md`

---

## v1.1 Dashboard Technical Debt Reduction (Shipped: 2026-03-05)

**Phases completed:** 4 phases (3-6), 15 plans
**Files changed:** 82 files, 3,026 insertions, 524 deletions
**Timeline:** 2026-03-04 → 2026-03-05

**Key accomplishments:**
1. Eliminated double-fetch on mount; isolated pagination state across 6 ads sections with dedicated settings store keys
2. Restored Sentry error visibility in production; removed dead dependencies, auth middleware, and commented config blocks
3. Created generic `AdsTable.vue` replacing 6 duplicated Ads* components (~1,200 lines eliminated)
4. Defined canonical domain types (Ad, User, Order, Category, Pack) in `app/types/` — single source of truth
5. Enabled `typeCheck: true`; resolved 200+ TypeScript errors across 50+ files for a clean dashboard build
6. Added Strapi aggregate endpoints (categories/ad-counts, orders/sales-by-month, indicators/dashboard-stats); wired 3 dashboard components to eliminate N+1 and client-side paginated loops

**Archive:** `.planning/milestones/v1.1-ROADMAP.md` | `.planning/milestones/v1.1-REQUIREMENTS.md`

---

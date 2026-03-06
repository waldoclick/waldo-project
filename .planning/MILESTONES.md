# Milestones

## v1.5 Ad Credit Refund (Shipped: 2026-03-06)

**Phases completed:** 2 phases (16-17), 2 plans
**Files changed:** 3 source files modified
**Timeline:** 2026-03-06 (~4 minutes)
**Requirements:** 8/8 complete ✓

**Key accomplishments:**
1. **Credit Refund Logic**: Wired reservation-freeing into `rejectAd()` and `bannedAd()` in `apps/strapi/src/api/ad/services/ad.ts` — four `entityService.update` calls set `ad = null` on the FK-owning reservation side, matching the existing cron pattern; optional-chaining null guards mean no error when reservations are absent.
2. **Email Notification Update**: Added conditional Nunjucks blocks (`{% if adReservationReturned %}`, `{% if featuredReservationReturned %}`) to `ad-rejected.mjml` and `ad-banned.mjml`; both service methods compute the flags from `!!ad.ad_reservation?.id` evaluated on the pre-freed ad object and pass them to `sendMjmlEmail()`.

**Archive:** `.planning/milestones/v1.5-ROADMAP.md` | `.planning/milestones/v1.5-REQUIREMENTS.md`

---

## v1.4 URL Localization (Shipped: 2026-03-06)

**Phases completed:** 4 phases (12-15), 9 plans
**Files changed:** 94 files, +3,621 / -243 lines
**Timeline:** 2026-03-05 → 2026-03-06 (1 day)
**Requirements:** 15/15 complete ✓

**Key accomplishments:**
1. **Ads Migration**: Renamed `anuncios/` → `ads/` with all 8 status sub-pages (`active`, `pending`, `abandoned`, `banned`, `expired`, `rejected`); established `git mv` rename pattern for the milestone.
2. **Catalog Segments**: Renamed 6 directories (`categorias`→`categories`, `comunas`→`communes`, `condiciones`→`conditions`, `ordenes`→`orders`, `regiones`→`regions`, `usuarios`→`users`) with all `editar`→`edit` sub-pages.
3. **Account & Transactional**: Renamed `cuenta`→`account`, `destacados`→`featured`, `reservas`→`reservations`; preserved Spanish UI labels (breadcrumbs) — only route path strings updated.
4. **Navigation Links**: Updated all 5 navigation components (MenuDefault, DropdownUser, DropdownSales, DropdownPendings, StatisticsDefault) and 17 data/form components to English router paths.
5. **301 Redirects**: Added `routeRules` to `nuxt.config.ts` covering all legacy Spanish URL prefixes → English equivalents; no wildcard routes needed.
6. **Build Verification**: `nuxt typecheck` passes with zero errors after all changes; all 15 requirements satisfied.

**Archive:** `.planning/milestones/v1.4-ROADMAP.md` | `.planning/milestones/v1.4-REQUIREMENTS.md`

---

## v1.3 Utility Extraction (Shipped: 2026-03-06)

**Phases completed:** 3 phases (9-11), 7 plans, 66 files changed
**Timeline:** 2026-03-05 → 2026-03-06

**Key accomplishments:**
1. **Date Utilities**: Created `app/utils/date.ts`, replaced 33 inline date formatters across dashboard components/pages.
2. **Price Utilities**: Created `app/utils/price.ts`, replaced 13 inline currency formatters, standardized on CLP.
3. **String Utilities**: Created `app/utils/string.ts`, centralized 5 common helpers (Name, Address, Boolean, Days, PaymentMethod).
4. **Strict Typing**: All utilities handle `null`/`undefined` gracefully; `nuxt typecheck` passes with zero errors.
5. **Zero Duplication**: Eliminated 51 duplicated inline formatting definitions across the codebase.

**Archive:** `.planning/milestones/v1.3-ROADMAP.md` | `.planning/milestones/v1.3-REQUIREMENTS.md`

---

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

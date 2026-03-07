# Milestones

## v1.13 GTM Module Migration (Shipped: 2026-03-07)

**Phases completed:** 1 phase (33), 1 plan
**Files changed:** 3 modified, 1 deleted (apps/website)
**Timeline:** 2026-03-07 (~15 minutes)
**Requirements:** 4/4 complete ✓

**Key accomplishments:**
1. **GTM Plugin Replacement (Phase 33)**: Deleted broken hand-rolled `gtm.client.ts` plugin; installed `@saslavik/nuxt-gtm@0.1.3` (the only Nuxt 4-compatible GTM module); configured with `enableRouterSync: true` for automatic SPA `page_view` events; `runtimeConfig.public.gtm.id` replaces the flat `gtmId` field; feature flag updated to `!!config.public.gtm?.id`; `nuxt typecheck` passes with zero errors; GA4 Realtime confirmed working locally.

**Archive:** `.planning/milestones/v1.13-ROADMAP.md` | `.planning/milestones/v1.13-REQUIREMENTS.md`

---

## v1.12 Ad Creation Analytics Gaps (Shipped: 2026-03-07)

**Phases completed:** 1 phase (32), 1 plan
**Files changed:** 6 files (apps/website)
**Timeline:** 2026-03-07 (~10 minutes)
**Requirements:** 5/5 complete ✓

**Key accomplishments:**
1. **Dead Code Removal (ANA-01)**: Removed dead `useAdAnalytics` import and instantiation from `CreateAd.vue` — analytics are owned by the parent `index.vue` page.
2. **step_view Overcounting Fix (ANA-02)**: Removed `{ immediate: true }` from `watch(adStore.step)`; added explicit `adAnalytics.stepView(1, "Payment Method")` in `onMounted` — step 1 fires exactly once per flow entry.
3. **redirect_to_payment Event (ANA-03)**: Added `pushEvent("redirect_to_payment", [], { payment_method: "webpay" })` immediately before `handleRedirect()` in `resumen.vue`.
4. **Purchase Guard (ANA-04)**: `purchaseFired = ref(false)` guard prevents duplicate `purchase` events on `watchEffect` re-runs in `gracias.vue`.
5. **DataLayerEvent Typing (ANA-05)**: `DataLayerEvent` exported from `useAdAnalytics.ts`; `ecommerce` widened to `| null`; `window.dataLayer` typed as `(DataLayerEvent | Record<string, unknown>)[]` in `window.d.ts`.

**Archive:** `.planning/phases/32-ad-creation-analytics-gaps/`

---

## v1.11 GTM / GA4 Tracking Fix (Shipped: 2026-03-07)

**Phases completed:** 1 phase (31), 1 plan
**Files changed:** 2 files (apps/website)
**Timeline:** 2026-03-07 (~2 minutes)
**Requirements:** 2/2 complete ✓

**Key accomplishments:**
1. **Broken gtag() Shim Removed (GTM-01)**: Deleted the local `gtag()` function that was pushing JavaScript arrays (not objects) into `window.dataLayer`; SPA navigation `page_view` events now push plain objects via `window.dataLayer.push({ event: "page_view", page_path, page_title })`.
2. **Consent Mode v2 (GTM-02)**: Default denial pushed after `window.dataLayer` init and before GTM script injection (`analytics_storage: "denied"`, `ad_storage: "denied"`); `LightboxCookies.vue` `acceptCookies()` replaced `accept_cookies` event with correct Consent Mode v2 update command.

**Archive:** `.planning/phases/31-gtm-plugin-consent-mode-v2/`

---

## v1.10 Dashboard Orders Dropdown UI (Shipped: 2026-03-07)

**Phases completed:** 1 phase (30), 1 plan
**Files changed:** 1 file (apps/dashboard)
**Timeline:** 2026-03-07 (~5 minutes)
**Requirements:** 2/2 complete ✓

**Key accomplishments:**
1. **Dropdown Display Fix (Phase 30)**: `DropdownSales.vue` "Últimas órdenes" now shows buyer full name (`formatFullName(firstname, lastname)` with fallback to `username` → `email` → `"Usuario"`) instead of raw `buy_order` ID; full date + time (`"7 mar 2026 • 01:08 a. m."`) instead of time-only display. `getBuyerName()` wrapper helper encapsulates the `OrderUser` destructuring and fallback chain.

**Archive:** `.planning/phases/30-dropdown-display-fix/`

---

## v1.9 Website Technical Debt (Shipped: 2026-03-07)

**Phases completed:** 5 phases (25-29), 6 plans
**Files changed:** ~101 files (apps/website + apps/strapi), +614 / -401 lines
**Timeline:** 2026-03-06 → 2026-03-07
**Requirements:** 18/18 complete ✓

**Key accomplishments:**
1. **Critical Correctness Bugs (Phase 25)**: Fixed `$setStructuredData` type augmentation; corrected `useAsyncData` key collisions on `/`, `/packs`, and `/anuncios/[slug]`; restored `console.error`/`warn` visibility in production (only `log`/`debug` suppressed); fixed Strapi route ordering — `/ads/me/counts` and `/ads/me` shadowed by wildcard `:id` route, moved to top of `00-ad-custom.ts`.
2. **Data Fetching Cleanup (Phase 26)**: Moved `onMounted(async)` data-fetching to `useAsyncData` in 7 components/pages (`perfil/editar`, `anunciar/index`, `ResumeDefault`, `anuncios/index`, `packs/comprar`, `CreateAd`, `FormProfile`); all 33 remaining `onMounted` calls documented with classification comments (`UI-only`, `analytics-only`, `client-only-intentional`).
3. **TypeScript Migration (Phase 27)**: Added `lang="ts"` to all 17 pages that were plain JavaScript; eliminated `any` in `user.store`, `me.store`, `ad.store`, `useAdAnalytics`, `useAdPaymentSummary`, `usePackPaymentSummary`; exported `AnalyticsItem` and `DataLayerEvent` interfaces.
4. **Store Persist Audit (Phase 28)**: Added `// persist: CORRECT | REVIEW | RISK` classification comments to all 14 stores with `localStorage` persistence; applied Strapi SDK filter cast pattern (`filters: { ... } as unknown as Record<string, unknown>`) to 4 stores.
5. **TypeScript Strict Errors (Phase 29)**: Fixed all 183 `nuxt typecheck` errors across 55 files — created `app/types/window.d.ts` (GTM/Google globals) and `app/types/plugins.d.ts` (NuxtApp augmentation); extended `strapi.d.ts`, `ad.d.ts`, `category.d.ts`, `filter.d.ts`; fixed API mismatches (`useSeoMeta`, `createError statusMessage`); enabled `typeCheck: true` in `nuxt.config.ts` — `nuxt typecheck` passes with zero errors; `vue-tsc` added as devDependency (hotfix).

**Archive:** `.planning/phases/25-critical-correctness-bugs/` | `.planning/phases/26-data-fetching-cleanup/` | `.planning/phases/27-typescript-migration/` | `.planning/phases/28-typescript-strict-store-audit/` | `.planning/phases/29-typescript-strict-errors/`

---

## v1.8 Free Featured Reservation Guarantee (Shipped: 2026-03-07)

**Phases completed:** 1 phase (24), 1 plan
**Files changed:** ~6 source files (cron-tasks, cron-runner, ad-free-reservation-restore, featured.cron reverted)
**Timeline:** 2026-03-06 → 2026-03-07
**Requirements:** 3/3 complete ✓

**Key accomplishments:**
1. **ad-free-reservation-restore Logic Fix**: Reservations stay permanently linked to expired ads (history); `restoreUserFreeReservations` counts pool as `ad=null` OR `ad.active=true` (not `remaining_days>0`); simplified to single responsibility — guarantee 3 free reservations per user.
2. **Parallel Batch Processing**: `Promise.all` in batches of 50 users to avoid DB connection pool exhaustion; scalable cron pattern established.
3. **cron-runner API committed**: Controller + routes for manual cron execution via `POST /api/cron-runner/:name`; all 4 crons registerable.

**Archive:** `.planning/milestones/v1.8-ROADMAP.md` | `.planning/milestones/v1.8-REQUIREMENTS.md`

---

## v1.7 Cron Reliability (Shipped: 2026-03-06)

**Phases completed:** 4 phases (20-23), 4 plans
**Files changed:** 5 source files modified + 1 new API (cron-runner, untracked)
**Timeline:** 2026-03-06 (~35 minutes)
**Requirements:** 10/10 complete ✓

**Key accomplishments:**
1. **user.cron Bug Fix**: Fixed multi-ad-per-user deactivation loop (`for...of` over all expired ads per user instead of short-circuiting after first); removed unused `PaymentUtils` import; added English JSDoc throughout.
2. **backup.cron Bug Fix**: Corrected Strapi v5 config path to `strapi.config.get('database') as { connection: any }`; redacted DB password from logged shell command; added English docs.
3. **cleanup.cron Bug Fix**: Replaced incompatible relation sub-filter with two-step folderPath resolution via `db.query('plugin::upload.folder').findOne`; translated all Spanish comments to English.
4. **ad.cron + cron-tasks Docs**: Added English JSDoc to `ad.cron.ts` (deduplication via `remainings`, deactivation on 0 days, daily report email) and to all four job entries in `cron-tasks.ts`.

**Archive:** `.planning/milestones/v1.7-ROADMAP.md` | `.planning/milestones/v1.7-REQUIREMENTS.md`

---

## v1.6 Website API Optimization (Shipped: 2026-03-06)

**Phases completed:** 2 phases (18-19), 3 plans
**Files changed:** ~10 source files (pages, stores, new Strapi endpoint)
**Timeline:** 2026-03-06
**Requirements:** 6/6 complete ✓

**Key accomplishments:**
1. **Page Double-Fetch Fixes**: Fixed `preguntas-frecuentes.vue` (2 calls → 1); added `GET /api/ads/me/counts` Strapi endpoint; `mis-anuncios.vue` reduced from 6 API calls → 2 using aggregate endpoint.
2. **Store Cache Guards**: 30-min timestamp-based cache guards added to `packs.store.ts`, `conditions.store.ts`, `regions.store.ts`; `packs.store` gained localStorage `persist` to survive page refresh.
3. **Component Cleanup**: Removed redundant `loadCommunes()` call from `FormCreateThree.vue` — communes already loaded by plugin.

**Archive:** `.planning/milestones/v1.6-ROADMAP.md` | `.planning/milestones/v1.6-REQUIREMENTS.md`

---

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

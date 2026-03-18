## v1.41 Ad Preview Error Handling (Shipped: 2026-03-18)

**Phases completed:** 1 phase (093), 2 plans
**Timeline:** 2026-03-18 (same-day)
**Git range:** `bb909d4` → `fb55613`
**Files changed:** 14 files, +1,929 / -68

**Key accomplishments:**
- `createError({ statusCode: 404/500, fatal: true })` lanzado dentro de `useAsyncData` en `[slug].vue` — el website nunca más devuelve 500 en `/anuncios/[slug]`; `watchEffect` + `showError` + `getErrorMessage` eliminados completamente
- `default: () => null` agregado a `useAsyncData` — elimina estado `undefined` durante hidratación SSR (AGENTS.md compliance)
- `try/catch` + `strapi.log.error` en controller `findBySlug` — errores inesperados de DB devuelven respuesta limpia sin stack trace expuesto
- 4 tests Jest para el controller (TDD RED→GREEN): null→notFound, throw→internalServerError, happy path manager, happy path public
- Smoke test aprobado por usuario: curl devuelve HTTP 404 (no 500) para slugs inexistentes; avisos reales cargan sin errores de consola

**Archive:** `.planning/milestones/v1.41-ROADMAP.md` | `.planning/milestones/v1.41-REQUIREMENTS.md`

---

## v1.40 Shared Authentication Session (Shipped: 2026-03-16)

**Phases completed:** 2 phases (091–092), 3 plans
**Timeline:** 2026-03-16 (same-day)
**Git range:** `8f287a8` → `115599a`
**Files changed:** 22 files, +1,362 / -44

**Key accomplishments:**
- `useLogout.ts` composable created in dashboard — resets appStore, meStore, searchStore, then calls `strapiLogout()` + `navigateTo('/auth/login')`; `meStore.reset()` action added; 3 scattered call sites (DropdownUser.vue, FormVerifyCode.vue, guard.global.ts) migrated
- Conditional `COOKIE_DOMAIN` domain spread added to both `nuxt.config.ts` strapi.cookie blocks — production emits `Set-Cookie: waldo_jwt=...; Domain=.waldo.click`; local dev unaffected (host-only cookies unchanged)
- Old host-only `waldo_jwt` cleanup injected into both `useLogout.ts` composables via `if (import.meta.client)` guard — eliminates zombie sessions post-migration
- `COOKIE_DOMAIN` documented as commented-out examples in both `.env.example` files with production/staging values; human-verified login/logout regression-free
- `nuxt typecheck` exits 0 in both apps after all changes

**Known gaps:** SESS-01–04 require staging deployment with `COOKIE_DOMAIN=.waldoclick.dev` for full cross-subdomain smoke test (code is complete and correct)

**Archive:** `.planning/milestones/v1.40-ROADMAP.md` | `.planning/milestones/v1.40-REQUIREMENTS.md`

---

## v1.27 Reparar eventos GA4 ecommerce en flujo de pago unificado (Shipped: 2026-03-12)

## v1.39 Unified API Client (Shipped: 2026-03-15)

**Phases completed:** 2 phases (089–090), 7 plans
**Timeline:** 2026-03-15 (1 day)
**Git range:** `4035b8c` → `96653c4`

**Key accomplishments:**
- Confirmed `useApiClient` GET passthrough is correct without source changes; added 1 GET-with-params test to document the contract (9 tests total)
- Migrated 5 reference-data stores (filter, regions, communes, conditions, faqs) from `strapi.find()` to `useApiClient` with cache guards preserved
- Migrated 4 primary content stores (ads, related, articles, categories) and 3 user/business stores (me, user, indicator)
- Migrated 3 composables (`useStrapi`, `useOrderById`, `usePacksList`) — callers required zero changes (raw body shapes identical to SDK returns)
- Migrated 4 pages and 1 component (`index.vue`, `anunciar/gracias.vue`, `anunciar/index.vue`, `packs/index.vue`, `FormProfile.vue`)
- Final validation gate: `grep` confirms zero `strapi.find/findOne` calls remain; `typeCheck: true` passes; browser smoke test approved

**Archive:** `.planning/milestones/v1.39-ROADMAP.md` | `.planning/milestones/v1.39-REQUIREMENTS.md`

---

## v1.38 GA4 Analytics Audit & Implementation (Shipped: 2026-03-14)

**Phases completed:** 3 phases (083–085), 6 plans
**Timeline:** 2026-03-14 (1 day)
**Git range:** `bccfada` → `026f06c`

**Key accomplishments:**
- Fixed GA4 ecommerce bugs: `Number()` coercion on Strapi biginteger revenue fields and `||` fallback for `item_id` — GA4 now shows real revenue instead of $0
- Added `purchase` event (value: 0) on free ad creation at `/anunciar/gracias` via `watch(adData)` + `purchaseFired` guard — TDD (17 tests)
- Added `viewItemListPublic`, `viewItem`, `search` events to `useAdAnalytics.ts` via TDD (23 tests) and wired into ad listing/detail pages with SSR-safe guard patterns
- Added `contactSeller`, `generateLead`, `signUp`, `login`, `articleView` events (31 tests) and wired into `AdSingle.vue`, `gracias.vue`, `FormRegister.vue`, `FormVerifyCode.vue`, `blog/[slug].vue`
- GTM Version 6 published: `ga4-engagement-events` tag with dynamic `{{Event}}` name covers all new engagement/lifecycle/content events
- All 6 new event types verified in GA4 Realtime and GTM Tag Assistant

**Archive:** `.planning/milestones/v1.38-ROADMAP.md` | `.planning/milestones/v1.38-REQUIREMENTS.md`

---

## v1.37 Email Authentication Flows (Shipped: 2026-03-14)

**Phases completed:** 4 phases, 6 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.36 Two-Step Login Verification (Shipped: 2026-03-14)

**Phases completed:** 2 phases (077–078), 6 plans
**Timeline:** 2026-03-13 → 2026-03-14 (1 day)
**Files changed:** 26 files, 1,599 insertions, 163 deletions

**Key accomplishments:**
- `verification-code` content type (userId, code, expiresAt, attempts, pendingToken); `overrideAuthLocal` intercepts `POST /api/auth/local` — returns `{ pendingToken, email }` instead of JWT; Google OAuth bypassed via `ctx.method === "GET"` guard
- `POST /api/auth/verify-code` validates 6-digit code (15-min expiry, max 3 attempts, single-use) and issues JWT on success; `POST /api/auth/resend-code` rate-limited to 60s
- `verification-code.mjml` Spanish email template with 32px bold code display; daily cleanup cron at 4 AM (`deleteMany` expired records)
- Dashboard `FormLogin.vue` rewritten with `useStrapiClient()` POST + `useState('pendingToken')` handoff; `/auth/verify-code` page with `FormVerifyCode.vue` (6-digit auto-submit, 60s countdown, setToken + role check)
- Website `FormLogin.vue` and `/login/verificar` with `FormVerifyCode.vue` implemented (code present; phase 079 carried to next milestone)
- Post-ship bug fix: OAuth Google login was triggering 2-step flow — resolved by `ctx.method === "GET"` guard in `overrideAuthLocal`

**Known gaps:** VSTEP-13 to VSTEP-16 (website verify flow) — code exists but phase 079 not formally executed

**Archive:** `.planning/milestones/v1.36-ROADMAP.md` | `.planning/milestones/v1.36-REQUIREMENTS.md`

---

## v1.35 Gift Reservations to Users (Shipped: 2026-03-13)

**Phases completed:** 2 phases (075–076), 4 plans
**Timeline:** 2026-03-13 (same-day delivery)
**Files changed:** 35 files, 3,298 insertions, 71 deletions

**Key accomplishments:**
- `GET /api/users/authenticated` endpoint added to users-permissions plugin extension — server-side Authenticated role filter via `strapi.db.query`, returns `{ id, firstName, lastName }` only (no sensitive fields)
- `POST /api/ad-reservations/gift` and `POST /api/ad-featured-reservations/gift` endpoints implemented — create N reservation records assigned to any authenticated user, with non-fatal MJML email notification
- `gift-reservation.mjml` email template created with `name`, `quantity`, `type` variables in Spanish
- `LightboxGift.vue` reusable controlled lightbox built — `isOpen/endpoint/label` props + `close/gifted` emits; quantity input + searchable user select + Swal confirmation; `lightbox--gift` BEM modifier
- "Regalar Reservas" button wired into `reservations/[id].vue`; "Regalar Reservas Destacadas" button wired into `featured/[id].vue` — end-to-end gift flow complete for both reservation types

**Archive:** `.planning/milestones/v1.35-ROADMAP.md` | `.planning/milestones/v1.35-REQUIREMENTS.md`

---

## v1.34 LightBoxArticles (Shipped: 2026-03-13)

**Phases completed:** 2 phases, 4 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.32 Gemini AI Service (Shipped: 2026-03-13)

**Phases completed:** 1 phases, 1 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.31 Article Manager Improvements (Shipped: 2026-03-13)

**Phases completed:** 2 phases, 2 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.30 Blog Public Views (Shipped: 2026-03-13)

**Phases completed:** 4 phases, 8 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.29 News Manager (Shipped: 2026-03-12)

**Phases completed:** 2 phases, 3 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.28 Logout Store Cleanup (Shipped: 2026-03-12)

**Phases completed:** 1 phases, 2 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

**Phases completed:** 1 phase (061), 2 plans
**Timeline:** 2026-03-11 → 2026-03-12 (2 days)
**Git range:** `5e4da12` → `b1de40b`

**Key accomplishments:**
- `purchase()` method + `PurchaseOrderData` interface added to `useAdAnalytics` via TDD (12 tests passing)
- `pushEvent()` flow discriminator param added — distinguishes `ad_creation` vs `pack_purchase` GA4 flows
- `watch(orderData, { immediate: true })` + `purchaseFired` guard wired in `/pagar/gracias.vue` — fires exactly once per visit with all non-undefined values
- `beginCheckout()` wired in `/pagar/index.vue` for pack-only flow (`ad_id === null` guard)
- `adStore.clearAll()` preserved without interfering with event payload (purchase reads from order object, not store)

**Archive:** `.planning/milestones/v1.27-ROADMAP.md` | `.planning/milestones/v1.27-REQUIREMENTS.md`

---

## v1.26 Mostrar comprobante Webpay en /pagar/gracias (Shipped: 2026-03-11)

**Phases completed:** 1 phase (060), 3 plans
**Timeline:** 2026-03-09 → 2026-03-11

**Key accomplishments:**
- Webpay redirect now uses `order.documentId` (not `adId`) — thank-you flow is order-centric
- `prepareSummary()` extended with all 8 mandatory Webpay fields (amount, auth code, date/time, payment type, last 4 digits, order number, merchant info)
- `ResumeOrder.vue` displays `CardInfo` components for all Webpay receipt fields with Spanish labels and "No disponible" fallbacks
- Test scaffolds for `ResumeOrder` and `gracias.vue` created with Vitest; 7/7 tests passing
- Strapi `findOne()` fixed to query by `documentId` (string) not numeric `id`

**Archive:** `.planning/milestones/v1.26-ROADMAP.md` | `.planning/milestones/v1.26-REQUIREMENTS.md`

---

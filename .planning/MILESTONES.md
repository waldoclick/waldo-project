## v1.41 Ad Preview Error Handling (Shipped: 2026-03-18)

## v1.46 PRO Subscriptions + Post-Merge Hardening (Shipped: 2026-06-14)

**Phases completed:** 23 phases, 64 plans, 117 tasks

**Key accomplishments:**

- Server guard (Task 1):
- 7 dashboard components migrated from useStrapiClient to useApiClient, removing all manual reCAPTCHA token management from auth forms
- 8 components/stores migrated from useStrapi SDK to useApiClient so all admin CRUD mutations (FAQ, commune, region, category, pack, condition, password, username) now inject X-Recaptcha-Token
- reCAPTCHA coverage completed — ads/[id].vue (5 mutations) and all article files (4 mutations) migrated to useApiClient, achieving 100% dashboard mutation protection
- One-liner:
- All 19 dashboard detail pages migrated from strapi.find/findOne SDK calls to useApiClient GET requests, eliminating dual-SDK reads
- One-liner:
- Four custom session composables (useSessionUser, useSessionToken, useSessionClient, useSessionAuth) plus startup plugin replace @nuxtjs/strapi's auto-plugin behavior, with qs as direct dependency and server-side runtimeConfig.strapi explicitly declared
- 16 consumer files migrated from useStrapiX to useSessionX, @nuxtjs/strapi removed from modules and package.json, TypeScript clean via runtimeConfig union cast pattern and $fetch parameter cast
- SSR hydration flash eliminated — dashboard stats now load server-side via watch(immediate:true); useAdsStore moved to setup scope in [slug].vue to prevent Nuxt context errors
- Strapi `api::policy.policy` collection type with richtext field + idempotent seeder containing all 16 policies from PoliciesDefault.vue
- Pinia store with 1-hour cache fetching from /api/policies, replacing 280-line hardcoded array in PoliciesDefault.vue with typed prop binding and SSR-ready useAsyncData in the page
- Server-side ownership guards added to saveDraft update path and PUT/DELETE /api/ads/:id controller overrides, blocking cross-user ad mutation
- userId field persisted to localStorage via Pinia and ownership guard in wizard entry page resets store when a different user's draft is detected
- Eliminated ~22 Codacy any-type violations across 23 website files using unknown, Record<string, unknown>, and Component from vue — zero runtime changes, TypeScript compiles clean
- Eliminated ~35 any type violations across 31 dashboard files by typing vee-validate handlers, chart.js callbacks, window globals, plugin args, and all edit page refs
- Eliminated all `any` and `Function` type annotations from Strapi source files — 30+ violations across 22 files replaced with proper typed alternatives using Event, Core.Strapi, unknown catch blocks, and typed interfaces
- Zero any/Function violations confirmed across all three apps; four overlooked casts fixed using useStrapiUser<User>() generic and as unknown as typed interface patterns
- Eliminated all 12 residual `any` violations — 2 `Array<any>` props and 10 `ref<any>(null)` reactive state declarations — replacing with concrete TypeScript interfaces across website and dashboard
- All 27 Strapi test files moved to tests/ subdirectories with corrected relative imports — zero __tests__/ dirs and zero flat co-located tests remain
- Formal verification confirming all 23 website test files reside exclusively in apps/website/tests/ with mirrored structure — Phase 116 work validated, requirement STRUCT-117-WEB closed
- One-liner:
- One-liner:
- useExportCsv composable wired to /orders/export-csv endpoint with Blob download and Export button in OrdersDefault.vue header
- Two Jest test stub files (15 todo tests) scaffolding the subscription-pro collection type and charge-before-activate payment flow for Plans 01-04 to implement
- subscription-pro Strapi collection type with oneToOne user relation and idempotent card data migration on bootstrap
- subscription-charge.cron.test.ts
- period_end added to subscription-payment schema with DB migration and proResponse refactored to create the first subscription-payment record instead of writing pro_expires_at on the user
- Commit:
- One-liner:
- 12 Strapi files migrated from entityService to db.query — payment flows, order pagination, ad operations, gift controllers, all TypeScript cast artifacts removed
- One-liner:
- subscription-charge.cron.test.ts
- Three login flows migrated from router.push to navigateTo so the global onboarding-guard fires immediately after OTP, Google, and Facebook authentication
- Static countries.json (29 entries) + InputPhone Vue 3 v-model component with Chile-default dial-code select, longest-match decomposition, and 10 passing Vitest unit tests
- Three website forms (FormProfile, FormCreateThree, FormContact) now collect phone via InputPhone country-selector component instead of bare text/phone/tel inputs, with dead handlePhoneInput helpers deleted
- Dashboard-guard middleware + onboarding exemption + FormVerifyCode manager redirect + dashboard layout + search/settings stores — authentication routing infrastructure for /dashboard/
- 8 dashboard-exclusive npm packages installed in website workspace; vite.optimizeDeps extended with 4 chart/qs entries; 24 /dashboard/-prefixed routeRules and robots /dashboard/ disallow added to nuxt.config.ts
- 1. [Rule 1 - Bug] `HeroDefaultDashboard` vs `HeroDashboard` plan example
- 4 exclusive types and 3 composables moved from dashboard to website via git mv; all 9 useSessionX references across migrated components replaced with useStrapiAuth/useStrapiUser/useStrapiToken equivalents
- One-liner:
- 1. formatDate/formatDateShort/formatBoolean not found in template context (67 errors)
- Dashboard merge finalized: MenuUser uses internal /dashboard NuxtLink, Strapi email/reset URLs updated to FRONTEND_URL/dashboard/ paths, apps/dashboard workspace removed and 263 files deleted
- One-liner:
- One-liner:
- One-liner:
- 1. [Rule 3 - Blocking] Added nitro-globals.ts setupFile for Vitest server handler tests
- Commit:
- One-liner:
- Four-vector auth hardening: Google email_verified guard, plugin-JWT verification with no hardcoded fallback, two-layer rate limiting on auth endpoints, and reCAPTCHA hostname/action binding in both Strapi and Nuxt layers
- One-liner:
- Four-vector hardening: MJML autoescape, upload magic-byte + sizeLimit, user-list PII strip + filter whitelist, and content-API route lockdown
- Google-only users now receive a branded "Crea tu contraseña" email via create-password.mjml and have their provider flipped to 'local' after completing the reset flow, enabling email+password login alongside One Tap
- Three httpOnly-compatible session composables (useSessionUser/Auth/Client) plus an inert session.ts plugin and 11 Wave 0 regression-guard tests that lock in "fetchUser never clears a token"
- Catch-all proxy now injects Authorization: Bearer from httpOnly cookie; 6 Nitro auth intercept routes set/clear waldo_jwt server-side with reCAPTCHA guard on every JWT-issuing POST
- Found during:
- Five Google/Facebook OAuth files migrated to httpOnly model: popup carries no jwt, redirect pages call exchange routes via useApiClient (sending X-Recaptcha-Token), One Tap relies on server cookie — zero setToken/authenticateProvider remain
- useStrapiToken fully eliminated from website app: verify-code calls fetchUser after cookie is set server-side, uploads rely on proxy Authorization injection, logout posts to server route, all four middleware guards are token-free and user-state-based
- @nuxtjs/strapi fully removed from apps/website; session.ts activated; proxy is now the single Strapi exit point; all auth flows (login, OTP, Google OAuth, One Tap, logout, Webpay) verified working in local with the original Manager-deactivate logout bug fixed.

---

## v1.46 PRO Subscriptions (Shipped: 2026-03-29)

**Phases completed:** 6 phases, 13 plans, 25 tasks

**Key accomplishments:**

- Webpay Oneclick Mall inscription backend with OneclickService class, two API routes, and User schema extension for PRO subscription card enrollment
- MemoPro.vue rewired to Transbank Oneclick start endpoint; /pro/gracias page shows registered card type and last 4 digits after enrollment
- subscription-payment content type with 12 attributes, OneclickService.authorizeCharge() wrapping MallTransaction.authorize() with 3 unit tests, and env var documentation for ONECLICK_CHILD_COMMERCE_CODE and PRO_MONTHLY_PRICE
- SubscriptionChargeService cron class with 8 unit tests covering expired user charging, idempotency guards, retry scheduling, deactivation logic, and PRO_MONTHLY_PRICE env var validation
- Eliminated dual-source-of-truth: all Strapi backend code now reads/writes pro_status exclusively, with no code path writing pro: true or pro: false
- Replaced all frontend reads of user.pro boolean with user.pro_status === "active" checks across website and dashboard — 13 files updated, type definitions cleaned up
- One-liner:
- One-liner:
- 1. [Rule 1 - Bug] Fixed Jest mock hoisting in both test files
- One-liner:
- Two Nuxt pages (/pro/pagar, /pro/pagar/gracias) plus MemoPro navigation refactor completing the user-facing PRO subscription checkout flow
- Age confirmation and terms acceptance checkboxes added to registration step 2 with yup .oneOf([true]) blocking validation and NuxtLink to privacy policy

---

## v1.45 User Onboarding (Shipped: 2026-03-20)

**Phases completed:** 3 phases (099–101), 5 plans
**Timeline:** 2026-03-19 (same-day)
**Git range:** `1d945515` → `8d79910d`
**Files changed:** 48 files, +4,573 / −82

**Key accomplishments:**

- Dedicated onboarding layout (`layouts/onboarding.vue`) with minimal chrome — logo only, no header/footer/navigation; BEM SCSS for `onboarding--default` and `onboarding--thankyou` modifiers
- `FormProfile` emit refactor — `defineEmits(["success"]) + defineProps({ onboardingMode })` enables parent-controlled post-submit navigation; backward-compatible (AccountEdit unchanged)
- `OnboardingDefault` and `OnboardingThankyou` components with full Vitest coverage (12 tests); `/onboarding` preloads regions/communes via `useAsyncData`
- Global client-only `onboarding-guard.global.ts` middleware — redirects incomplete-profile users to `/onboarding`, reverse-guards complete profiles away from `/onboarding`, SSR-safe via `import.meta.server` check; `meStore.reset()` cache invalidation after profile save prevents redirect loop
- Google One Tap suppressed on `/onboarding` routes via `startsWith("/onboarding")` guard (INTEG-01); referer middleware excludes `/onboarding` from persisted referer (INTEG-02); INTEG-03 confirmed — guard already saves pre-redirect URL to `appStore.referer`
- 24+ Vitest tests covering all onboarding components, middleware guards, and integration points; `nuxt-meta-client-stub` Vite plugin pattern established for `import.meta.client` in tests

**Archive:** `.planning/milestones/v1.45-ROADMAP.md` | `.planning/milestones/v1.45-REQUIREMENTS.md`

---

## v1.44 Google One Tap Sign-In (Shipped: 2026-03-19)

**Phases completed:** 5 phases (094–098), 9 plans
**Timeline:** 2026-03-18 → 2026-03-19 (2 days)
**Git range:** `docs(094)` → `feat(098-03)`
**Files changed:** 74 files, +9,374 / −1,234

**Key accomplishments:**

- Root-caused SSR session persistence bug — dead `auth.populate` joins caused `setToken(null)` on `fetchUser()` SSR failure; purely subtractive fix (removed unused `ad_reservations.ad` and `ad_featured_reservations.ad`)
- Fixed cookie replacement on session swap — `useStrapiAuth().logout()` respects `COOKIE_DOMAIN` attribute; eliminates zombie cookies after manager login
- Added GIS CSP entries (`connect-src` + `frame-src`) and `GOOGLE_CLIENT_ID` env var for Google One Tap
- Built `POST /api/auth/google-one-tap` endpoint — Google JWT verification via `google-auth-library`, user find-or-create with `google_sub` field, 3 free ad slots for new users, 2-step bypass
- Rewrote `useGoogleOneTap` composable — `promptIfEligible()` replaces 90-line `initializeGoogleOneTap()`; `disableAutoSelect()` in `useLogout` prevents post-logout dead-loop
- Created `google-one-tap.client.ts` plugin — SSR-safe GIS initializer with auth guard, route guard, and credential-to-session wiring; full reload after One Tap login for clean state refresh

**Archive:** `.planning/milestones/v1.44-ROADMAP.md` | `.planning/milestones/v1.44-REQUIREMENTS.md`

---

## v1.43 Cross-App Session Replacement (Shipped: 2026-03-19)

**Phases completed:** 2 phases, 2 plans, 0 tasks

**Key accomplishments:**

- (none recorded)

---

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

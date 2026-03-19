---
gsd_state_version: 1.0
milestone: v1.44
milestone_name: Google One Tap Sign-In
current_phase: 098
status: executing
last_updated: "2026-03-19T04:32:14.861Z"
last_activity: "2026-03-19 — Phase 098 plan 02 complete: window.d.ts cleanup, disableAutoSelect() logout fix, useGoogleOneTap rewrite"
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 9
  completed_plans: 8
  percent: 97
---

# Session State

## Project Reference

See: .planning/PROJECT.md

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Milestone v1.44 — Google One Tap Sign-In

## Position

**Current Milestone:** v1.44 — Google One Tap Sign-In
**Current Phase:** 098
**Status:** In progress — Plan 02 complete

```
Progress: [██████████] 99% — Phase 098 in progress
Phase 096 ████ | Phase 097 ████ | Phase 098 ██░░
```

Last activity: 2026-03-19 — Phase 098 plan 02 complete: window.d.ts cleanup, disableAutoSelect() logout fix, useGoogleOneTap rewrite

## Phase Map

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 096 | CSP & Environment Setup | GTAP-01, GTAP-02 | ○ Not started |
| 097 | Strapi One Tap Endpoint | GTAP-03, GTAP-04, GTAP-05, GTAP-06 | ○ Not started |
| 098 | Frontend Rewrite + Logout Fix | GTAP-07, GTAP-08, GTAP-09, GTAP-10, GTAP-11, GTAP-12 | ○ Not started |

## Accumulated Context

### Key Decisions (carry forward)

- watch({ immediate: true }) on adsData in index.vue — ensures view_item_list fires even when data is already resolved on SSR hydration (DISC-01)
- No { immediate: true } on search watcher — search events should only fire on explicit user action, not page load (DISC-03)
- viewItemFired boolean ref + slug-change reset watcher in [slug].vue — Nuxt reuses component across [slug] navigations; guard must be explicitly reset (DISC-02)
- resolveSearchTerm maps commune ID → name via filterStore.filterCommunes for human-readable GA4 search_term (DISC-03)
- Inline shape type for ad params in useAdAnalytics (not importing Ad type) — keeps composable self-contained; category narrowed via typeof guard (DISC-01,02,03)
- search() passes empty items array — no ecommerce block; GA4 search events are not ecommerce events (DISC-03)
- Strapi biginteger defense: always wrap numeric fields from API responses with `Number()` before passing to GA4 (ECOM-01)
- Use `||` (not `??`) for item_id fallback chains where empty string should trigger fallback (ECOM-02)
- Free-ad purchase event uses `amount: 0` (not undefined) — enables GA4 funnel comparison between free and paid conversions (ECOM-03)
- documentId fallback to `route.query.ad` for free-ad analytics covers SSR edge case where ad.documentId may not be populated yet (ECOM-03)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- Auth extension pattern: override plugin controllers in `src/extensions/users-permissions/strapi-server.ts` — same pattern as `registerUserLocal`
- `recaptcha.ts` middleware already intercepts `POST /api/auth/local` — 2-step interception must be at **controller level** (after recaptcha passes), NOT in middleware
- `verification-code` content type fields: `userId` (integer), `code` (string), `expiresAt` (datetime), `attempts` (integer, default 0), `pendingToken` (string, unique)
- Google OAuth (`/api/connect/google/callback`) is unaffected — must bypass 2-step entirely
- `sendMjmlEmail()` for all email notifications; email failures wrapped in try/catch (non-fatal)
- `pendingToken` carried in transient state (not URL) between login → verify pages in both frontend apps
- AGENTS.md BEM convention applies to all new SCSS components
- `plugin.controllers.auth` is a factory function in Strapi v5 — overrides must wrap the factory, not set properties on it
- `overrideAuthLocal` guards `ctx.method === "GET"` to skip 2-step for OAuth callbacks
- `overrideForgotPassword` must FULLY REPLACE Strapi's `forgotPassword` (not wrap it) — calling original + MJML sends two emails
- `context` field in forgot-password POST body (not query param — query params are lost after form submit)
- `if (response.jwt)` guard in `FormRegister.vue` before `setToken()` — email confirmation returns no JWT
- `POST /api/auth/send-email-confirmation` is native Strapi — no custom code needed for resend
- DB migration hard gate: `confirmed = TRUE` for all users BEFORE enabling `email_confirmation` toggle
- `email_confirmation_redirection` requires full URL (Yup validation) — path-only values rejected
- `/registro/confirmar` page has NO middleware — must be accessible without auth state (post-registration, pre-confirmation)
- `useState('registrationEmail')` used as cross-page shared state from FormRegister → /registro/confirmar
- contactSeller/generateLead use flow='user_engagement', signUp/login use flow='user_lifecycle', articleView uses flow='content_engagement' (085-01)
- All new engagement/lifecycle/content GA4 events pass empty items array [] — no ecommerce block (085-01)
- signUp() has no method param — always pushes method='email'; Google sign-up uses OAuth flow (085-01)
- articleView() passes id as-is (string | number) without coercion — GA4 accepts both (085-01)
- reCAPTCHA v3 validated at Nitro proxy layer via X-Recaptcha-Token header — token never reaches Strapi (086-01)
- verifyRecaptchaToken imports createError from h3 explicitly (not Nitro auto-import) for Vitest testability (086-01)
- FormForgotPassword/ResetPassword/Contact used useStrapiClient() directly (SDK doesn't support custom headers) (086-01) — SUPERSEDED by 087-01: now use useApiClient()
- X-Recaptcha-Token travels browser→Nuxt server (same origin) then Nuxt→Strapi (server-to-server, CORS N/A) — no Strapi CORS changes needed (086-01)
- useApiClient() must explicitly import from #imports (not rely on Nuxt auto-imports) for Vitest vi.mock() interception to work (087-01)
- vi.hoisted() required for mock variables referenced in vi.mock() factory — prevents undefined at hoisting time (087-01)
- $recaptcha is optional in plugins.d.ts (client-only plugin, undefined on SSR) — out-of-scope components needing direct access use ! non-null assertion (087-01)
- All 15 mutation calls (POST/PUT/DELETE) in apps/website now flow through useApiClient — reCAPTCHA X-Recaptcha-Token header injected universally (088-01)
- deactivateAd accepts documentId: string (not adId: number) — Strapi v5 write operations must use documentId (088-01)
- Ad interface has documentId: string field — prerequisite for Strapi v5 write operations (088-01)
- useApiClient returns raw body — no .data wrapper; strapi.create()/update() SDK wrappers do wrap; always remove .data accessor after migrating from SDK (088-01)
- client = useApiClient() moved to store root level in user.store.ts — composable rules require setup-level instantiation (088-01)
- GET callers use client(url, { method: 'GET', params: {...} }) — response is raw body, no .data wrapper; confirmed by 9-test suite (089-01)
- useApiClient() placed inside factory function (not module level) for composables like usePacksList — Nuxt composable rules require setup-level instantiation (090-04)
- Raw body shapes for collection { data: T[] } and single-item { data: T } endpoints are identical to Strapi SDK returns — callers of useStrapi/useOrderById/usePacksList required no changes (090-04)
- For categories.store.ts (Options API store with per-action useStrapi()): migrated to single useApiClient() at setup root level — eliminates redundant instantiation and aligns with composable rules (090-02)
- anunciar/gracias.vue findOne response accessed via response.data (not { data: ad } destructure) — useApiClient returns raw body (090-05)
- index.vue and packs/index.vue were migrated in plan 090-03 alongside stores — plan 090-05 recognized them as already done (090-05)
- FormProfile.vue useStrapi() was truly dead code — no calls, purely subtractive removal (090-05)
- Store methods returning collection responses must declare explicit return types when callers access .data/.meta — TypeScript infers {} from raw client() result (090-06)
- Browser smoke test approved: all key pages load correctly with zero console errors after full migration (090-06)
- useLogout composable centralizes dashboard logout: appStore.$reset() + meStore.reset() + searchStore.clearTavily() + strapiLogout() + navigateTo('/auth/login') — single place for Phase 092 old-cookie cleanup (091-01)
- import { useStrapiAuth, navigateTo } from '#imports' in useLogout composable — required for Nuxt auto-import interception (091-01)
- findBySlug try/catch pattern: JWT decode inner try/catch stays OUTSIDE the new outer try — already guarded; outer try wraps service call through ctx.send; catch uses strapi.log.error (not console.error) for server-side logging (STRP-01, 093-01)
- SSR-safe 404/500 in Nuxt 4: throw createError({ statusCode, fatal: true }) inside useAsyncData callback — watchEffect/showError races SSR lifecycle and produces 500s; createError is the only pattern that honours Nuxt's error boundary (PREV-01..04, 093-02)
- default: () => null in useAsyncData options constrains return type to T | null (not T | null | undefined) — eliminates undefined from downstream null checks (093-02)
- COOKIE_DOMAIN lines are commented out in .env.example — local dev must NOT set this var (host-only cookie is correct for localhost); configure only in staging/production deployment environments (092-02)
- Production COOKIE_DOMAIN=.waldo.click; staging COOKIE_DOMAIN=.waldoclick.dev — both values documented inline in .env.example for both apps (092-02)
- SSR populate hygiene: only include populate fields present in the TypeScript User interface and consumed by dashboard components — dead populate joins cause slow /users/me queries that trigger setToken(null) in SSR fetchUser() catch (094-01)
- dashboard auth.populate: ["role", "commune", "region", "business_region", "business_commune"] — ad_reservations.ad and ad_featured_reservations.ad removed (not in User type, not used by any component) (094-01)
- FormLogin.vue (dashboard) línea 149: `existingCookie.value = null` es incorrecto — borra solo la cookie host-only, deja zombie la cookie compartida con domain=.COOKIE_DOMAIN — fix: llamar useLogout() antes del nuevo login (095-diagnosis)
- Fix scope: `apps/dashboard/app/components/FormLogin.vue` line 149 only — replace `existingCookie.value = null` with `const { logout: strapiLogout } = useStrapiAuth()` + `await strapiLogout()` so cookie removal respects the `domain` attribute from @nuxtjs/strapi module config (095-plan)
- Use useStrapiAuth().logout() (not useLogout() composable) mid-login flow — useLogout() also resets Pinia stores and navigates to /auth/login, which breaks login in progress (095-01)
- auth.populate must be lean in both apps: only fields in User TypeScript interface; dead joins (ad_reservations.ad, ad_featured_reservations.ad) removed from both website and dashboard (095-01)

### Key Decisions (v1.44 — carry forward as discovered)

- RED failures for 098-01 are behavioral (TypeError/module-not-found) not TS compile errors — test scaffolds will go GREEN once implementation exists without re-structuring (098-01)
- vi.hoisted() used in useGoogleOneTap.test.ts and plugin test for mock refs in vi.mock() factory, matching 087-01 pattern (098-01)
- Top-level vi.resetModules() + vi.clearAllMocks() in useLogout.test.ts beforeEach so GTAP-12 window.google stub is seen by dynamic import (098-01)
- TDD RED scaffolds fail at TypeScript compile level (TS2307): stricter RED guarantee than runtime import errors; both test files confirmed failing before any implementation written (097-01)
- `auth-one-tap.test.ts` mocks `'../../../services/google-one-tap'` as index export (not service file directly): plan 097-02 must export `googleOneTapService` singleton from `index.ts` (097-01)
- GIS CSP pattern: use `https://accounts.google.com/gsi/` (path prefix, trailing slash) in both `connect-src` and `frame-src` — never add to `script-src` (already covered by `accounts.google.com`); per Google's official CSP guidance (GTAP-01, GTAP-02, 096-01)
- GOOGLE_CLIENT_ID in Strapi .env = same credential as website GIS loader — single OAuth project, no new credential needed; must be set in staging/production deployment secrets (GTAP-02, 096-01)
- New Strapi endpoint uses standard content API (`src/api/auth-one-tap/`), NOT plugin extension routes — plugin route factory is broken in Strapi v5 (documented in `strapi-server.ts` lines 56–62); mirrors proven `auth-verify/` pattern (GTAP-03)
- Look up users by Google `sub` field first (not email) — Google explicitly prohibits email as primary key; account linking by email is only a fallback for existing users (GTAP-04)
- `google-auth-library` must be verified as explicit dep in `apps/strapi/package.json` — may be transitive via `googleapis@148.0.0`; run `yarn why google-auth-library` before deciding (GTAP-03)
- 2-step bypass for One Tap matches existing `/connect/google` OAuth behavior — `overrideAuthLocal` already has a `ctx.method === "GET"` guard; One Tap uses a POST endpoint in `src/api/`, so bypass is achieved by simply NOT intercepting it in `overrideAuthLocal` (GTAP-06)
- `google-one-tap.client.ts` plugin suffix ensures SSR exclusion automatically — no `if (import.meta.client)` guard needed inside the plugin (GTAP-08)
- Global `googleOneTapInitialized` flag in existing composable must be removed — it prevents `prompt()` from firing on subsequent SPA pages; `initialize()` moves to plugin (once on startup), `prompt()` stays in composable (per-page) (GTAP-07)
- `disableAutoSelect()` must be called before `strapiLogout()` in `useLogout.ts` — clears GIS `g_state` cookie; prerequisite before `auto_select: true` can ever be enabled safely (GTAP-12)
- `rut:'N/A'` placeholder for Google One Tap new users — rut is required in schema; profile completion deferred to Phase 098 (097-02)
- `GoogleOneTapService` constructor warns (not throws) on missing GOOGLE_CLIENT_ID — throwing kills Strapi startup; endpoint returns 401 for all requests when key is absent (097-02)
- `google_sub` field: lookup by sub first (immutable), then email fallback for existing account linking, then create new user with `provider:'google'` (097-02)
- Dynamic import for `createUserReservations` in auth-one-tap controller avoids circular dep between src/api/ and src/extensions/; Jest mock at top of test file correctly intercepts dynamic imports (097-03)
- `export` added to `createUserReservations` in authController.ts — needed for dynamic import pattern, no behavioral change to existing usages (097-03)
- 2-step bypass for One Tap: implementing endpoint in `src/api/auth-one-tap/` means `overrideAuthLocal` (which only intercepts POST /api/auth/local) never fires — no explicit bypass code needed (097-03)
- `disableAutoSelect()` placed outside `if(import.meta.client)` block — optional chain `window.google?.accounts?.id?.disableAutoSelect()` is SSR-safe; required for testability since `import.meta.client` is falsy in vitest happy-dom (098-02)
- `promptIfEligible()` composable replaces `initializeGoogleOneTap()` — auth guard + route guard + GIS guard; 90 lines → 25 lines, purely subtractive (098-02)

### Blockers/Concerns (open)

- **`google_sub` field gap**: Research recommends looking up users by `sub` using a dedicated `google_sub` field. Verify during Phase 097 whether Strapi's existing `provideridentifier` field already stores the Google `sub` — if yes, a new field may not be needed.
- **`prompt()` calling frequency**: Whether `prompt()` should be called on every route change or only on initial app load is unresolved. Decide before Phase 098 implementation begins (UX decision: per-page re-prompt vs. single app-load prompt).

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 29 | Create InputAutocomplete.vue component with integrated search for FormGift | 2026-03-13 | a079dc0 | [29-create-inputautocomplete-vue-component-w](.planning/quick/29-create-inputautocomplete-vue-component-w/) |
| 30 | Fix Strapi Handler not found auth.verifyCode startup error | 2026-03-13 | afb78d6 | [30-fix-strapi-handler-not-found-auth-verify](.planning/quick/30-fix-strapi-handler-not-found-auth-verify/) |
| 31 | Add /auth/verify-code to guard.global.ts publicRoutes | 2026-03-13 | ebf9324 | [31-add-auth-verify-code-to-public-routes](.planning/quick/31-add-auth-verify-code-to-public-routes/) |
| 32 | Restrict verify code input to digits only, max 6, auto-submit on 6th | 2026-03-13 | 2f663d6 | [32-restrict-verify-code-input-digits-only](.planning/quick/32-restrict-verify-code-input-digits-only/) |
| 33 | Fix registration broken by confirm_password check in registerUserLocal | 2026-03-13 | 3b2262e | [33-fix-register-confirm-password-check](.planning/quick/33-fix-register-confirm-password-check/) |
| 34 | Restore Facto invoice emission in unified Webpay checkout flow | 2026-03-14 | 0780984 | [34-restore-facto-invoice-emission-in-webpay](.planning/quick/34-restore-facto-invoice-emission-in-webpay/) |
| 35 | Forward is_invoice to Strapi checkout payload | 2026-03-14 | 3cc00fd | [35-verify-is-invoice-field-flows-from-check](.planning/quick/35-verify-is-invoice-field-flows-from-check/) |
| 36 | Fix dashboard FormForgotPassword missing reCAPTCHA token in payload | 2026-03-14 | ac77641 | [36-fix-dashboard-formforgotpassword-recaptc](.planning/quick/36-fix-dashboard-formforgotpassword-recaptc/) |
| 37 | Surface silent email delivery failures in forgot-password flow | 2026-03-14 | 9c64588 | [37-no-llega-el-correo-de-recuperar-contrase](.planning/quick/37-no-llega-el-correo-de-recuperar-contrase/) |
| 38 | Fix dashboard FormResetPassword missing recaptchaToken in submit payload | 2026-03-14 | f377ac1 | [38-fix-dashboard-formresetpassword-missing-](.planning/quick/38-fix-dashboard-formresetpassword-missing-/) |
| 39 | Replace Strapi default email confirmation with branded MJML (tasks 1-3 complete; awaiting human-verify) | 2026-03-14 | d85e1f7 | [39-fix-post-registration-redirect-and-missi](.planning/quick/39-fix-post-registration-redirect-and-missi/) |
| 40 | Fix AccountMain announcements banner to 2-column grid layout (text left, button right) | 2026-03-14 | 2898d11 | [40-fix-heroprofile-component-layout-to-3-co](.planning/quick/40-fix-heroprofile-component-layout-to-3-co/) |
| 41 | Fix dashboard header not updating after profile save (useStrapiClient flat body) | 2026-03-14 | 51fac50 | [41-fix-dashboard-header-not-updating-after-](.planning/quick/41-fix-dashboard-header-not-updating-after-/) |
| 42 | Make dashboard admin layout responsive (off-canvas sidebar with hamburger toggle) | 2026-03-14 | 8b253d1 | [42-make-dashboard-admin-layout-responsive-s](.planning/quick/42-make-dashboard-admin-layout-responsive-s/) |
| 43 | Fix image deletion endpoint call and ownership security | 2026-03-15 | 618d931 | [43-fix-image-deletion-endpoint-call-and-sec](.planning/quick/43-fix-image-deletion-endpoint-call-and-sec/) |
| 44 | defer image uploads in ad creation flow to save-draft step with local previews and multi-select support | 2026-03-15 | 39a752e | [44-defer-image-uploads-in-ad-creation-flow-](.planning/quick/44-defer-image-uploads-in-ad-creation-flow-/) |
| 45 | security report and cloudflare rate limiting recommendations | 2026-03-15 | 0f8def4 | [45-security-report-and-cloudflare-rate-limi](.planning/quick/45-security-report-and-cloudflare-rate-limi/) |
| 46 | replace any types with proper typed interfaces in order controller and cron files | 2026-03-15 | c84eb2d | [46-replace-any-types-with-proper-typed-inte](.planning/quick/46-replace-any-types-with-proper-typed-inte/) |
| 47 | fix strapi develop TS errors in ad controller populate cast and order controller populate cast | 2026-03-15 | 05dad51 | [47-fix-strapi-develop-ts-errors-in-ad-contr](.planning/quick/47-fix-strapi-develop-ts-errors-in-ad-contr/) |
| 48 | fix EEXIST mkdir error in vite-plugin-checker — disable dashboard typeCheck and set HMR port 24679 | 2026-03-15 | 124a026 | [48-fix-eexist-mkdir-error-in-vite-plugin-ch](.planning/quick/48-fix-eexist-mkdir-error-in-vite-plugin-ch/) |
| 49 | block Strapi robots.txt to prevent search engine indexing of API backend | 2026-03-15 | 30a8a94 | [49-block-strapi-robots-txt-to-prevent-searc](.planning/quick/49-block-strapi-robots-txt-to-prevent-searc/) |
| 50 | fix getActivePinia crash: replace raw localStorage guard with persistedState.localStorage in persist stores | 2026-03-16 | aa4f4c4 | [50-fix-getactivepinia-crash-replace-manual-](.planning/quick/50-fix-getactivepinia-crash-replace-manual-/) |
| 51 | fix all getActivePinia SSR crashes: guard/lazy-init all top-level store calls in 21 dashboard and website components | 2026-03-16 | 66cb9ab | [51-fix-all-getactivepinia-ssr-crashes-acros](.planning/quick/51-fix-all-getactivepinia-ssr-crashes-acros/) |
| 52 | batch all image uploads into a single POST request to eliminate Cloudflare rate-limit failures | 2026-03-16 | 3ed19cb | [52-batch-all-image-uploads-into-a-single-po](.planning/quick/52-batch-all-image-uploads-into-a-single-po/) |
| 53 | fix dashboard logout on refresh: point strapi.url directly to API_URL to prevent SSR self-proxy loop | 2026-03-16 | f12ad4e | [53-fix-dashboard-logout-on-refresh-point-ss](.planning/quick/53-fix-dashboard-logout-on-refresh-point-ss/) |
| 54 | replace dual-fetch ad detail with server-side ACL endpoint GET /api/ads/slug/:slug | 2026-03-16 | 2ec04b3 | [54-fix-ad-detail-page-access-control-active](.planning/quick/54-fix-ad-detail-page-access-control-active/) |
| 55 | add public view icon to all dashboard ads tables (pending, expired, banned, rejected, abandoned) | 2026-03-16 | 63ea3e6 | [55-add-public-view-icon-to-dashboard-ads-ta](.planning/quick/55-add-public-view-icon-to-dashboard-ads-ta/) |
| 56 | add authenticated thank-you endpoints for ads (bypasses publishedAt) and orders (ownership check) | 2026-03-16 | 33aa14f | [56-add-authenticated-thank-you-endpoints-fo](.planning/quick/56-add-authenticated-thank-you-endpoints-fo/) |
| 57 | fix dashboard guard middleware calling useLogout outside component context for non-manager users | 2026-03-16 | 8e06fc5 | [57-fix-dashboard-guard-middleware-calling-u](.planning/quick/57-fix-dashboard-guard-middleware-calling-u/) |

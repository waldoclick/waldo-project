---
gsd_state_version: 1.0
milestone: v1.38
milestone_name: GA4 Analytics Audit & Implementation
status: completed
last_updated: "2026-03-15T15:26:52.492Z"
last_activity: 2026-03-15 — Completed 090-05-PLAN.md
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 13
  completed_plans: 13
  percent: 100
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14 after v1.38 milestone started)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.39 — Unified API Client (roadmap created, Phase 089 next)

## Position

**Current Milestone:** v1.39 — Unified API Client
**Status:** Milestone complete
Phase: 090
Plan: 05 ✓ (of 6)

```
Progress: [██████████] 100% (13/13 plans)
```

Last activity: 2026-03-15 - Completed quick task 46: replace any types with proper typed interfaces in order controller and cron files

## Phase Map

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 089 | GET Support in useApiClient | API-05 | ✅ Complete (2026-03-15) |
| 090 | Migrate All GET Callers | API-01, API-02, API-03, API-04, API-06 | ✅ Complete (2026-03-15) |

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

### v1.38 Key Facts (GA4 analytics)

- `useAdAnalytics.ts` composable wraps all GA4 events via `window.dataLayer.push()` — all new event functions must be added here
- File: `apps/website/app/composables/useAdAnalytics.ts`
- All event functions follow the existing `pushEvent()` pattern
- `DataLayerEvent` is fully typed in `window.d.ts` (since v1.12)
- 12 existing Vitest tests in `tests/composables/` — new event functions need tests too
- Key files for new events:
  - `apps/website/app/pages/anuncios/index.vue` → `view_item_list`, `search`
  - `apps/website/app/pages/anuncios/[slug].vue` → `view_item`, `contact` (email + phone)
  - `apps/website/app/components/FormRegister.vue` → `sign_up`
  - `apps/website/app/components/FormLogin.vue` → `login` (after verify step completes)
  - `apps/website/app/pages/blog/[slug].vue` → `article_view`

### Blockers/Concerns (open)

None.

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

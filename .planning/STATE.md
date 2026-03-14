---
gsd_state_version: 1.0
milestone: v1.38
milestone_name: GA4 Analytics Audit & Implementation
status: planning
last_updated: "2026-03-14T17:15:25.660Z"
last_activity: "2026-03-14 — Completed 085-01 (CONT-01, CONT-02, LEAD-01, AUTH-01, AUTH-02, BLOG-01: 5 new analytics functions added to useAdAnalytics via TDD)"
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 6
  completed_plans: 5
  percent: 98
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14 after v1.38 milestone started)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.38 — GA4 Analytics Audit & Implementation (Phase 083 in progress)

## Position

**Current Milestone:** v1.38 — GA4 Analytics Audit & Implementation
**Status:** In progress
Phase: 085
Plan: 01 complete → 02 next

```
Progress: [██████████] 98% (44/45 plans across project)
```

Last activity: 2026-03-14 — Completed 085-01 (CONT-01, CONT-02, LEAD-01, AUTH-01, AUTH-02, BLOG-01: 5 new analytics functions added to useAdAnalytics via TDD)

## Phase Map

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 083 | Ecommerce Bug Fixes | ECOM-01, ECOM-02, ECOM-03 | Complete (2/2 plans done) |
| 084 | Ad Discovery Tracking | DISC-01, DISC-02, DISC-03 | Complete (2/2 plans done) |
| 085 | Contact, Auth & Blog Events | CONT-01, CONT-02, AUTH-01, AUTH-02, BLOG-01 | In Progress (1/2 plans done) |

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

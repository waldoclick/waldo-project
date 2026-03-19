---
gsd_state_version: 1.0
milestone: v1.44
milestone_name: Google One Tap Sign-In
current_phase: 098
status: milestone_complete
last_updated: "2026-03-19T19:30:00.000Z"
last_activity: "2026-03-19 — Milestone v1.44 archived. Google One Tap Sign-In shipped."
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 9
  completed_plans: 9
  percent: 100
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Planning next milestone

## Position

**Last Milestone:** v1.44 — Google One Tap Sign-In (shipped 2026-03-19)
**Status:** Between milestones — ready for `/gsd:new-milestone`

```
Progress: [██████████] 100% — v1.44 complete
```

Last activity: 2026-03-19 — Milestone v1.44 archived. Google One Tap Sign-In shipped.

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- Auth extension pattern: override plugin controllers in `src/extensions/users-permissions/strapi-server.ts`
- `recaptcha.ts` middleware intercepts `POST /api/auth/local` — 2-step interception at controller level (after recaptcha)
- `overrideAuthLocal` guards `ctx.method === "GET"` to skip 2-step for OAuth callbacks
- New Strapi auth endpoints use `src/api/` (standard content API), NOT plugin extension routes — plugin route factory broken in Strapi v5
- `google_sub` field: lookup by sub first (immutable), then email fallback for existing account linking
- `disableAutoSelect()` before `strapiLogout()` in `useLogout.ts` — clears GIS `g_state` cookie
- `google-one-tap.client.ts` plugin suffix ensures SSR exclusion automatically
- SSR populate hygiene: only include populate fields present in TypeScript User interface and consumed by components
- useApiClient returns raw body — no .data wrapper; Strapi SDK wrappers do wrap
- COOKIE_DOMAIN conditional spread in nuxt.config.ts strapi.cookie — production emits `Domain=.waldo.click`
- SSR-safe 404/500: throw `createError({ statusCode, fatal: true })` inside `useAsyncData` callback

### Blockers/Concerns (open)

(none)

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

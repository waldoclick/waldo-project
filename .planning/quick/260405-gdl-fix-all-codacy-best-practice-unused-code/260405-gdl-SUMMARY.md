---
phase: quick
plan: 260405-gdl
subsystem: monorepo-lint
tags: [codacy, lint, unused-code, best-practice]
dependency_graph:
  requires: []
  provides: [codacy-best-practice-clean]
  affects: [apps/website, apps/dashboard, apps/strapi]
tech_stack:
  added: []
  patterns: [underscore-prefix-unused-params, remove-unused-imports]
key_files:
  created: []
  modified:
    - apps/website/app/composables/useRut.ts
    - apps/website/app/composables/useApiClient.ts
    - apps/website/app/composables/useImage.ts
    - apps/website/app/composables/useAdAnalytics.ts
    - apps/website/app/composables/useLogger.ts
    - apps/website/app/stores/ad.store.ts
    - apps/website/app/stores/categories.store.ts
    - apps/website/app/stores/filter.store.ts
    - apps/website/app/types/plugins.d.ts
    - apps/website/app/types/window.d.ts
    - apps/website/app/plugins/recaptcha.client.ts
    - apps/website/app/plugins/sentry.ts
    - apps/website/app/plugins/communes.client.ts
    - apps/website/app/plugins/seo.ts
    - apps/website/app/plugins/microdata.ts
    - apps/website/app/middleware/guest.ts
    - apps/website/nuxt.config.ts
    - apps/website/cypress.config.ts
    - apps/website/server/api/dev-config.get.ts
    - apps/website/server/api/images/[...].ts
    - apps/website/app/components/AccountAnnouncements.spec.ts
    - apps/website/app/components/CardCategory.spec.ts
    - apps/website/app/components/FormLogin.spec.ts
    - apps/website/tests/components/AccountAnnouncements.ts
    - apps/website/tests/components/CardCategory.ts
    - apps/website/tests/components/FormLogin.ts
    - apps/website/tests/components/ResumeOrder.test.ts
    - apps/dashboard/app/composables/useRut.ts
    - apps/dashboard/app/composables/useApiClient.ts
    - apps/dashboard/app/types/plugins.d.ts
    - apps/dashboard/app/plugins/recaptcha.client.ts
    - apps/dashboard/app/plugins/seo.ts
    - apps/dashboard/nuxt.config.ts
    - apps/dashboard/cypress.config.ts
    - apps/dashboard/server/api/dev-config.get.ts
    - apps/dashboard/server/api/images/[...].ts
    - apps/strapi/src/cron/bbdd-backup.cron.ts
    - apps/strapi/src/api/contact/controllers/contact.ts
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/services/pro.service.ts
    - apps/strapi/src/api/payment/services/ad.service.ts
    - apps/strapi/src/api/payment/utils/order.utils.ts
    - apps/strapi/src/api/filter/services/filter.service.ts
    - apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts
    - apps/strapi/src/extensions/users-permissions/controllers/userController.ts
    - apps/strapi/src/services/facto/tests/facto.test.ts
    - apps/strapi/src/services/flow/services/flow.service.ts
    - apps/strapi/src/services/payment-gateway/types/gateway.interface.ts
    - apps/strapi/src/services/indicador/indicador.service.ts
    - apps/strapi/src/services/indicador/interfaces.ts
    - apps/strapi/src/services/google/types/google.types.ts
    - apps/strapi/src/services/google-one-tap/google-one-tap.types.ts
    - apps/strapi/src/services/zoho/interfaces.ts
    - apps/strapi/src/services/groq/groq.types.ts
    - apps/strapi/src/services/gemini/gemini.types.ts
    - apps/strapi/src/services/anthropic/anthropic.types.ts
    - apps/strapi/src/services/deepseek/deepseek.types.ts
    - apps/strapi/src/services/serper/serper.types.ts
    - apps/strapi/src/services/tavily/tavily.types.ts
    - apps/strapi/src/services/weather/http-client.d.ts
    - apps/strapi/src/admin/webpack.config.example.js
decisions:
  - "Prefix unused interface method params with _ rather than removing — preserves documentation intent"
  - "Remove unused imports entirely rather than adding eslint-disable — cleaner approach"
  - "eslint-disable-next-line used for private module-level functions that may be needed in future (createPackAnalyticsItem, createFeaturedAnalyticsItem)"
metrics:
  duration_minutes: 45
  completed_date: "2026-04-05"
  tasks_completed: 3
  files_modified: 62
---

# Quick Task 260405-gdl: Fix All Codacy Best-Practice Unused Code — Summary

## One-liner

Resolved ~80 Codacy best-practice "unused code" violations across website, dashboard, and Strapi by removing unused imports and prefixing unused params/variables with `_`.

## Objective

Clean up all Codacy "best practice — unused code" violations on the `codacy/fix-best-practice` branch so the PR passes quality gates without changing any runtime behavior.

## Tasks Completed

### Task 1: apps/website (e641294e)

Fixed unused code violations in composables, stores, types, plugins, middleware, tests, config, and server routes:

**Unused imports removed:**
- `ref` from `useRut.ts` (Vue — not used in body)
- `AdForm`, `AdState` from `ad.store.ts`
- `CategoryState` from `categories.store.ts`
- `FilterState` from `filter.store.ts`
- `fetchUser` assignment from `sentry.ts`
- `sass`, `Sentry` imports from `nuxt.config.ts`
- Unused `expect`, `mount`, component imports from spec/test files
- `beforeEach` from `ResumeOrder.test.ts`

**Unused params prefixed with `_`:**
- `action` in type literal in `useApiClient.ts`, `useImage.ts`, `plugins.d.ts`
- `error` → `_error: unknown` in `useLogger.ts`
- `config`, `callback`, `types` in `window.d.ts`
- `callback`, `siteKey`, `options` in `recaptcha.client.ts` global type
- `nuxtApp` in `communes.client.ts`
- `params` in `seo.ts` type declaration
- `data` in `microdata.ts` type declaration
- `to` in `guest.ts` middleware
- `on` in `cypress.config.ts`
- `path` in `images/[...].ts`
- `event` in `dev-config.get.ts`

**Other:**
- `eslint-disable-next-line` added for `createPackAnalyticsItem` and `createFeaturedAnalyticsItem` (private module constants, may be used in future)
- `_submitButton` prefix in FormLogin spec/test files

### Task 2: apps/dashboard (5d9486cb)

Mirrored the same pattern for dashboard (shared code structure):

- Removed `ref` from `useRut.ts`
- Removed `sass`, `Sentry` from `nuxt.config.ts`
- Prefixed `action` in `useApiClient.ts` type literal
- Prefixed `action` in `plugins.d.ts` (both `#app` and `vue` module augmentations)
- Prefixed `callback`, `siteKey`, `options` in `recaptcha.client.ts`
- Prefixed `params` in `seo.ts` type declaration
- Prefixed `on` in `cypress.config.ts`
- Prefixed `path` in `images/[...].ts`
- Prefixed `event` in `dev-config.get.ts`

### Task 3: apps/strapi (ed920f97)

Fixed violations across middlewares, cron, API controllers/services, service modules, and tests:

**Unused imports removed:**
- `ProService` from `payment/controllers/payment.ts`
- `FlowService`, `IFlowSubscriptionResponse`, `IFlowInvoice` from `pro.service.ts`
- `splitLastName` function removed from `pro.service.ts`
- `ad` default import from `payment/services/ad.service.ts`
- `OrderData` from `order.utils.ts`
- `StrapiFilter` from `filter.service.ts`
- `HttpClient` from `indicador.service.ts`
- Multiple unused imports from `facto.test.ts` (all in commented-out test code)

**Unused variables prefixed:**
- `stdout` → `stdout: _stdout` in `bbdd-backup.cron.ts`
- `recaptchaToken` → `recaptchaToken: _recaptchaToken` in `contact.ts`
- `ctxBody` → `_ctxBody` in `auth-one-tap.test.ts`
- `password`, `resetPasswordToken`, `confirmationToken` prefixed in `userController.ts`
- `endpoint` → `_endpoint` in `flow.service.ts` (placeholder function)
- `postProcessFilter` param type `(ads: ...)` → `(_ads: ...)` in `ad.ts`

**Interface method params prefixed:**
- `IPaymentGateway.createTransaction` params: `_amount`, `_orderId`, `_sessionId`, `_returnUrl`
- `IPaymentGateway.commitTransaction` param: `_gatewayRef`
- `IIndicadorService.getIndicator` param: `_code`
- `IIndicadorService.convert` params: `_amount`, `_from`, `_to`
- `IHttpClient.get` param: `_url`
- `IGoogleSheetsService.appendToSheet` param: `_data`
- `IGoogleRecaptchaService.verifyToken` param: `_token`
- `IGoogleOneTapService.verifyCredential` param: `_credential`
- `IGoogleOneTapService.findOrCreateUser` param: `_payload`
- All `IZohoService` method params prefixed with `_`
- All AI service interfaces (groq/gemini/anthropic/deepseek/serper/tavily): `_request`
- `weather/http-client.d.ts` HttpClient.get param: `_url`
- `webpack.config.example.js` second param: `_webpack`

**Test cleanup:**
- Removed unused `invoiceService`, `ticketService` vars from `facto.test.ts` (only used in commented-out tests)

## Deviations from Plan

None — plan executed exactly as written, with minor observations:
- `protect-user-fields.ts` `_config` and `_context` were already prefixed
- `guard.global.ts` already had `_from` prefix  
- `guest.ts` (dashboard) already had `_to`, `_from` prefixes
- `app.stub.ts` (both apps) already had `_key` prefixed
- `imports.stub.ts` already had `_name` and `_opts` prefixed
- gateway test already had `_amount`, `_orderId`, etc. prefixed
- `FormProfile.onboarding.test.ts` had no visible `values` variable to fix
- `google-one-tap.test.ts` — no `args`/`response` unused vars found at the referenced lines
- `contact.service.ts` `strapi` constructor param IS used as `this.strapi` (not unused)
- `google-auth.service.ts` `config`, `google-sheets.service.ts` `authService`, `zoho.service.ts` `httpClient` — all ARE used via TypeScript constructor shorthand (`this.X`)

## Verification

- TypeScript compiled cleanly in all three apps (zero errors)
- Strapi Jest tests: 19/19 passing for modified test files
- Website Vitest tests: pre-existing failures unrelated to these changes (FormLogin mount errors, useOrderById, RecaptchaProxy tests)

## Known Stubs

None.

## Self-Check: PASSED

Commits verified:
- e641294e — website fixes
- 5d9486cb — dashboard fixes  
- ed920f97 — strapi fixes

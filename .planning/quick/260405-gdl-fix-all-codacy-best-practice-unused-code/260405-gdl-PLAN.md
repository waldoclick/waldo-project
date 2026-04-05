---
phase: quick
plan: 260405-gdl
type: execute
wave: 1
depends_on: []
files_modified:
  # Website
  - apps/website/app/composables/useApiClient.ts
  - apps/website/app/composables/useRut.ts
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
  - apps/website/app/middleware/auth.ts
  - apps/website/app/middleware/guest.ts
  - apps/website/app/components/AccountAnnouncements.spec.ts
  - apps/website/app/components/CardCategory.spec.ts
  - apps/website/app/components/FormLogin.spec.ts
  - apps/website/tests/stubs/app.stub.ts
  - apps/website/tests/components/AccountAnnouncements.ts
  - apps/website/tests/components/CardCategory.ts
  - apps/website/tests/components/FormLogin.ts
  - apps/website/tests/components/ResumeOrder.test.ts
  - apps/website/tests/components/FormProfile.onboarding.test.ts
  - apps/website/tests/plugins/google-one-tap.test.ts
  - apps/website/nuxt.config.ts
  - apps/website/cypress.config.ts
  - apps/website/server/api/images/[...].ts
  - apps/website/server/api/dev-config.get.ts
  # Dashboard
  - apps/dashboard/app/composables/useApiClient.ts
  - apps/dashboard/app/composables/useRut.ts
  - apps/dashboard/app/types/plugins.d.ts
  - apps/dashboard/app/plugins/recaptcha.client.ts
  - apps/dashboard/app/plugins/seo.ts
  - apps/dashboard/app/middleware/guard.global.ts
  - apps/dashboard/app/middleware/guest.ts
  - apps/dashboard/tests/stubs/app.stub.ts
  - apps/dashboard/tests/stubs/imports.stub.ts
  - apps/dashboard/nuxt.config.ts
  - apps/dashboard/cypress.config.ts
  - apps/dashboard/server/api/images/[...].ts
  - apps/dashboard/server/api/dev-config.get.ts
  # Strapi
  - apps/strapi/src/middlewares/protect-user-fields.ts
  - apps/strapi/src/cron/bbdd-backup.cron.ts
  - apps/strapi/src/api/contact/controllers/contact.ts
  - apps/strapi/src/api/contact/services/contact.service.ts
  - apps/strapi/src/api/ad/controllers/ad.ts
  - apps/strapi/src/api/ad/services/ad.ts
  - apps/strapi/src/api/payment/controllers/payment.ts
  - apps/strapi/src/api/payment/services/pro.service.ts
  - apps/strapi/src/api/payment/services/ad.service.ts
  - apps/strapi/src/api/payment/utils/order.utils.ts
  - apps/strapi/src/api/filter/services/filter.service.ts
  - apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts
  - apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts
  - apps/strapi/src/extensions/users-permissions/controllers/userController.ts
  - apps/strapi/src/services/facto/factories/facto.factory.ts
  - apps/strapi/src/services/facto/tests/facto.test.ts
  - apps/strapi/src/services/flow/services/flow.service.ts
  - apps/strapi/src/services/payment-gateway/types/gateway.interface.ts
  - apps/strapi/src/services/payment-gateway/tests/gateway.test.ts
  - apps/strapi/src/services/indicador/indicador.service.ts
  - apps/strapi/src/services/indicador/interfaces.ts
  - apps/strapi/src/services/google/services/google-auth.service.ts
  - apps/strapi/src/services/google/services/google-sheets.service.ts
  - apps/strapi/src/services/google/types/google.types.ts
  - apps/strapi/src/services/google-one-tap/google-one-tap.types.ts
  - apps/strapi/src/services/zoho/zoho.service.ts
  - apps/strapi/src/services/zoho/interfaces.ts
  - apps/strapi/src/services/groq/groq.types.ts
  - apps/strapi/src/services/gemini/gemini.types.ts
  - apps/strapi/src/services/anthropic/anthropic.types.ts
  - apps/strapi/src/services/deepseek/deepseek.types.ts
  - apps/strapi/src/services/serper/serper.types.ts
  - apps/strapi/src/services/tavily/tavily.types.ts
  - apps/strapi/src/services/weather/http-client.d.ts
  - apps/strapi/src/admin/webpack.config.example.js
autonomous: true
must_haves:
  truths:
    - "All Codacy best-practice unused-code warnings are resolved across the monorepo"
    - "No functional behavior changes — only cosmetic/lint fixes"
    - "TypeScript compiles cleanly in all three apps"
  artifacts:
    - path: "apps/website/**"
      provides: "Website unused code fixes"
    - path: "apps/dashboard/**"
      provides: "Dashboard unused code fixes"
    - path: "apps/strapi/**"
      provides: "Strapi unused code fixes"
  key_links: []
---

<objective>
Fix all Codacy "best practice — unused code" errors across the monorepo (website, dashboard, strapi).

Purpose: Clean up Codacy violations on the codacy/fix-best-practice branch so the PR passes quality gates.
Output: All flagged files edited to resolve unused-code warnings without changing runtime behavior.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix unused code in apps/website (composables, stores, types, plugins, middleware, tests, config, server)</name>
  <files>
    apps/website/app/composables/useApiClient.ts,
    apps/website/app/composables/useRut.ts,
    apps/website/app/composables/useImage.ts,
    apps/website/app/composables/useAdAnalytics.ts,
    apps/website/app/composables/useLogger.ts,
    apps/website/app/stores/ad.store.ts,
    apps/website/app/stores/categories.store.ts,
    apps/website/app/stores/filter.store.ts,
    apps/website/app/types/plugins.d.ts,
    apps/website/app/types/window.d.ts,
    apps/website/app/plugins/recaptcha.client.ts,
    apps/website/app/plugins/sentry.ts,
    apps/website/app/plugins/communes.client.ts,
    apps/website/app/plugins/seo.ts,
    apps/website/app/plugins/microdata.ts,
    apps/website/app/middleware/auth.ts,
    apps/website/app/middleware/guest.ts,
    apps/website/app/components/AccountAnnouncements.spec.ts,
    apps/website/app/components/CardCategory.spec.ts,
    apps/website/app/components/FormLogin.spec.ts,
    apps/website/tests/stubs/app.stub.ts,
    apps/website/tests/components/AccountAnnouncements.ts,
    apps/website/tests/components/CardCategory.ts,
    apps/website/tests/components/FormLogin.ts,
    apps/website/tests/components/ResumeOrder.test.ts,
    apps/website/tests/components/FormProfile.onboarding.test.ts,
    apps/website/tests/plugins/google-one-tap.test.ts,
    apps/website/nuxt.config.ts,
    apps/website/cypress.config.ts,
    apps/website/server/api/images/[...].ts,
    apps/website/server/api/dev-config.get.ts
  </files>
  <action>
Read each file and apply the appropriate fix per error type:

**Unused imports** — Remove the unused import (or remove only the unused named symbol from a multi-import). Files:
- `useRut.ts:1` — remove unused `ref` from vue import
- `ad.store.ts:3` — remove `AdForm` import; `:7` — remove `AdState` import
- `categories.store.ts:8` — remove `CategoryState` import
- `filter.store.ts:7` — remove `FilterState` import
- `sentry.ts:6` — remove `fetchUser` assignment if unused (or prefix `_fetchUser`)
- `nuxt.config.ts:3,5` — remove unused `sass` and `Sentry` imports
- `AccountAnnouncements.spec.ts:1,2` and `tests/components/AccountAnnouncements.ts:1,2` — remove unused imports
- `CardCategory.spec.ts:1,2,3` and `tests/components/CardCategory.ts:1,2,3` — remove unused imports
- `FormLogin.spec.ts:2,10` and `tests/components/FormLogin.ts:2,10` — remove unused `expect` import and `submitButton` variable
- `ResumeOrder.test.ts:1` — remove unused `beforeEach` import
- `FormProfile.onboarding.test.ts` — remove unused `values` variable

**Unused function params — prefix with `_`** (params required by signature but not used in body):
- `useApiClient.ts:32` — prefix `action` with `_` in type union callback
- `useImage.ts:71` — prefix `action` with `_` in type union callback
- `useLogger.ts:4` — prefix `error` param(s) with `_`
- `plugins.d.ts:11` — prefix `action` with `_`
- `window.d.ts:14` — prefix `callback` with `_`; `:27` — prefix `types` with `_`; `:12` — prefix `config` with `_`
- `recaptcha.client.ts:4,6,7` — prefix `callback`, `siteKey`, `options` with `_`
- `communes.client.ts:3` — prefix `nuxtApp` with `_`
- `seo.ts:46` — prefix `params` with `_`
- `microdata.ts:28` — prefix `data` with `_`
- `auth.ts:1` — already uses `_from` convention; verify it matches or fix
- `guest.ts:1` — prefix `to` with `_`
- `cypress.config.ts:8` — prefix `on` with `_`
- `server/api/images/[...].ts:3` — prefix `path` with `_`
- `server/api/dev-config.get.ts:1` — prefix `event` with `_`

**Unused test variables:**
- `google-one-tap.test.ts:23,34,37` — remove or prefix unused `args`, `response` with `_`
- `app.stub.ts:25` — prefix `_key` (already prefixed, add eslint-disable comment if needed)

**Unused exported functions** — Check if `createPackAnalyticsItem` and `createFeaturedAnalyticsItem` in `useAdAnalytics.ts` are used anywhere. If not referenced in the codebase, prefix with `_` or add `// eslint-disable-next-line @typescript-eslint/no-unused-vars`. If they are exported for external use, add the eslint-disable comment.

IMPORTANT: Read each file fully before editing. Do NOT change any runtime behavior. Only suppress or remove genuinely unused symbols.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx turbo run typecheck --filter=website 2>&1 | tail -20</automated>
  </verify>
  <done>All Codacy unused-code flags in apps/website are resolved. TypeScript compiles clean.</done>
</task>

<task type="auto">
  <name>Task 2: Fix unused code in apps/dashboard (composables, types, plugins, middleware, tests, config, server)</name>
  <files>
    apps/dashboard/app/composables/useApiClient.ts,
    apps/dashboard/app/composables/useRut.ts,
    apps/dashboard/app/types/plugins.d.ts,
    apps/dashboard/app/plugins/recaptcha.client.ts,
    apps/dashboard/app/plugins/seo.ts,
    apps/dashboard/app/middleware/guard.global.ts,
    apps/dashboard/app/middleware/guest.ts,
    apps/dashboard/tests/stubs/app.stub.ts,
    apps/dashboard/tests/stubs/imports.stub.ts,
    apps/dashboard/nuxt.config.ts,
    apps/dashboard/cypress.config.ts,
    apps/dashboard/server/api/images/[...].ts,
    apps/dashboard/server/api/dev-config.get.ts
  </files>
  <action>
Read each file and apply the appropriate fix:

**Unused imports:**
- `useRut.ts:1` — remove unused `ref` from vue import
- `nuxt.config.ts:3,4` — remove unused `sass` and `Sentry` imports

**Unused function params — prefix with `_`:**
- `useApiClient.ts:32` — prefix `action` with `_`
- `plugins.d.ts:10` — prefix `action` with `_`
- `recaptcha.client.ts:4,6,7` — prefix `callback`, `siteKey`, `options` with `_`
- `seo.ts:24` — prefix `params` with `_`
- `guard.global.ts:3` — prefix `_from` (verify already prefixed or fix)
- `guest.ts:3` — prefix `_to`, `_from` (verify already prefixed or fix)
- `app.stub.ts:25` — prefix `_key` (verify or add eslint-disable)
- `imports.stub.ts:11` — prefix `_name` (verify or add eslint-disable)
- `cypress.config.ts:8` — prefix `on` with `_`
- `server/api/images/[...].ts:3` — prefix `path` with `_`
- `server/api/dev-config.get.ts:1` — prefix `event` with `_`

IMPORTANT: Many dashboard files mirror website files. Apply the same pattern. Read each file before editing.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx turbo run typecheck --filter=dashboard 2>&1 | tail -20</automated>
  </verify>
  <done>All Codacy unused-code flags in apps/dashboard are resolved. TypeScript compiles clean.</done>
</task>

<task type="auto">
  <name>Task 3: Fix unused code in apps/strapi (middlewares, cron, API controllers/services, service modules, tests)</name>
  <files>
    apps/strapi/src/middlewares/protect-user-fields.ts,
    apps/strapi/src/cron/bbdd-backup.cron.ts,
    apps/strapi/src/api/contact/controllers/contact.ts,
    apps/strapi/src/api/contact/services/contact.service.ts,
    apps/strapi/src/api/ad/controllers/ad.ts,
    apps/strapi/src/api/ad/services/ad.ts,
    apps/strapi/src/api/payment/controllers/payment.ts,
    apps/strapi/src/api/payment/services/pro.service.ts,
    apps/strapi/src/api/payment/services/ad.service.ts,
    apps/strapi/src/api/payment/utils/order.utils.ts,
    apps/strapi/src/api/filter/services/filter.service.ts,
    apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts,
    apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts,
    apps/strapi/src/extensions/users-permissions/controllers/userController.ts,
    apps/strapi/src/services/facto/factories/facto.factory.ts,
    apps/strapi/src/services/facto/tests/facto.test.ts,
    apps/strapi/src/services/flow/services/flow.service.ts,
    apps/strapi/src/services/payment-gateway/types/gateway.interface.ts,
    apps/strapi/src/services/payment-gateway/tests/gateway.test.ts,
    apps/strapi/src/services/indicador/indicador.service.ts,
    apps/strapi/src/services/indicador/interfaces.ts,
    apps/strapi/src/services/google/services/google-auth.service.ts,
    apps/strapi/src/services/google/services/google-sheets.service.ts,
    apps/strapi/src/services/google/types/google.types.ts,
    apps/strapi/src/services/google-one-tap/google-one-tap.types.ts,
    apps/strapi/src/services/zoho/zoho.service.ts,
    apps/strapi/src/services/zoho/interfaces.ts,
    apps/strapi/src/services/groq/groq.types.ts,
    apps/strapi/src/services/gemini/gemini.types.ts,
    apps/strapi/src/services/anthropic/anthropic.types.ts,
    apps/strapi/src/services/deepseek/deepseek.types.ts,
    apps/strapi/src/services/serper/serper.types.ts,
    apps/strapi/src/services/tavily/tavily.types.ts,
    apps/strapi/src/services/weather/http-client.d.ts,
    apps/strapi/src/admin/webpack.config.example.js
  </files>
  <action>
Read each file and apply the appropriate fix per error type:

**Unused imports — remove:**
- `payment/controllers/payment.ts:6` — remove `ProService` import
- `payment/services/pro.service.ts:3,6,10,13` — remove `FlowService`, `IFlowSubscriptionResponse`, `IFlowInvoice`, `splitLastName` imports
- `payment/services/ad.service.ts:2` — remove `ad` import
- `payment/utils/order.utils.ts:1` — remove `OrderData` import
- `filter/services/filter.service.ts:1` — remove `StrapiFilter` import
- `indicador/indicador.service.ts:13` — remove `HttpClient` import
- `facto/factories/facto.factory.ts:6,7,8` — remove `DocumentType` enum members if unused
- `facto/tests/facto.test.ts:2,6,7,8,9,10` — remove all unused imports

**Unused variables — remove or prefix:**
- `protect-user-fields.ts:42,43` — prefix `_config`, `_context` with `_` (may already be prefixed; verify and add eslint-disable if still flagged)
- `protect-user-fields.ts:92` — `userId` — if unused, remove or prefix with `_`
- `bbdd-backup.cron.ts:76` — `stdout` from destructure — use `void stdout;` after destructure or remove from destructure
- `contact/controllers/contact.ts:18` — `recaptchaToken` — if destructured but unused, prefix with `_`
- `contact/services/contact.service.ts:9` — `strapi` — prefix with `_` if unused in body
- `ad/controllers/ad.ts:489` — `_` from status destructure — already prefixed; add eslint-disable if still flagged
- `ad/services/ad.ts:191` — `ads` param — prefix with `_ads`
- `auth-one-tap/controllers/auth-one-tap.ts:43` — `user` — prefix with `_`
- `auth-one-tap/controllers/auth-one-tap.test.ts:49` — `ctxBody` — remove if unused
- `userController.ts:213` — `password` — prefix with `_password`
- `facto/tests/facto.test.ts:40,41` — unused vars — remove or prefix
- `flow/services/flow.service.ts:138` — `endpoint` — remove if unused or prefix with `_`

**Interface/type method params — prefix with `_`:**
These are params in interface method signatures. They exist for documentation but are flagged as unused. Prefix each with `_`:
- `gateway.interface.ts:18,19,20,21,24` — prefix all method params with `_` (e.g. `_amount`, `_orderId`, `_sessionId`, `_returnUrl`, `_gatewayRef`)
- `indicador/interfaces.ts:35,71,72` — prefix params with `_`
- `google/types/google.types.ts:13,17` — prefix params with `_`
- `google-one-tap/google-one-tap.types.ts:4,6` — prefix `credential`, `payload` with `_`
- `zoho/interfaces.ts:60,61,62,63,80,82,83` — prefix all params with `_`
- `groq/groq.types.ts:10` — prefix `request` with `_`
- `gemini/gemini.types.ts:10` — prefix `request` with `_`
- `anthropic/anthropic.types.ts:10` — prefix `request` with `_`
- `deepseek/deepseek.types.ts:10` — prefix `request` with `_`
- `serper/serper.types.ts:20` — prefix `request` with `_`
- `tavily/tavily.types.ts:20` — prefix `request` with `_`
- `weather/http-client.d.ts:2` — prefix `url` with `_`

**Constructor params used as class fields:**
- `indicador.service.ts:24` — `httpClient` constructor param — check if used as `this.httpClient`; if truly unused remove, otherwise add eslint-disable
- `google-auth.service.ts:8` — `config` constructor param — same check
- `google-sheets.service.ts:6` — `authService` constructor param — same check
- `zoho.service.ts:16` — `httpClient` constructor param — same check

**Test mock params — prefix with `_`:**
- `gateway.test.ts:80-83,89` — prefix `_amount`, `_orderId`, `_sessionId`, `_returnUrl`, `_gatewayRef`

**Webpack config (JS):**
- `webpack.config.example.js:4` — prefix `webpack` param with `_`

IMPORTANT: For interface method params, ONLY prefix the param name with `_` — do NOT change the type or remove the param. For constructor params with `private readonly`, verify if TypeScript shorthand creates a class field (making it "used") — if Codacy still flags it, add eslint-disable-next-line comment.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && cd apps/strapi && npx tsc --noEmit 2>&1 | tail -20</automated>
  </verify>
  <done>All Codacy unused-code flags in apps/strapi are resolved. TypeScript compiles clean.</done>
</task>

</tasks>

<verification>
After all three tasks complete:
1. Run `npx turbo run typecheck` from root to verify all apps compile
2. Run `cd apps/strapi && npx jest --passWithNoTests 2>&1 | tail -10` to verify Strapi tests pass
3. Run `cd apps/website && npx vitest run 2>&1 | tail -10` to verify website tests pass
4. Spot-check a sample of files to confirm no behavioral changes
</verification>

<success_criteria>
- All ~80+ Codacy best-practice unused-code errors resolved
- TypeScript compiles in all three apps (website, dashboard, strapi)
- Existing tests continue to pass
- No runtime behavior changes — only unused symbol cleanup
</success_criteria>

<output>
After completion, create `.planning/quick/260405-gdl-fix-all-codacy-best-practice-unused-code/260405-gdl-SUMMARY.md`
</output>

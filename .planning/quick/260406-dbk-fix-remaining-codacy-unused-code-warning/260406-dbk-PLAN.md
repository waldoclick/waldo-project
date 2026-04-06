---
phase: quick
plan: 260406-dbk
type: execute
wave: 1
depends_on: []
files_modified:
  # website
  - apps/website/app/plugins/communes.client.ts
  - apps/website/tests/stubs/app.stub.ts
  - apps/website/tests/plugins/google-one-tap.test.ts
  - apps/website/tests/middleware/referer.test.ts
  - apps/website/tests/middleware/onboarding-guard.test.ts
  - apps/website/tests/components/FormLogin.ts
  - apps/website/tests/components/FormLogin.website.test.ts
  - apps/website/tests/components/FormProfile.onboarding.test.ts
  - apps/website/app/middleware/auth.ts
  - apps/website/app/middleware/guest.ts
  - apps/website/server/api/images/[...].ts
  - apps/website/server/api/dev-config.get.ts
  - apps/website/app/composables/useAdAnalytics.ts
  - apps/website/app/composables/useLogger.ts
  - apps/website/cypress.config.ts
  - apps/website/test-csp-console.js
  # dashboard
  - apps/dashboard/tests/stubs/app.stub.ts
  - apps/dashboard/tests/stubs/imports.stub.ts
  - apps/dashboard/server/api/images/[...].ts
  - apps/dashboard/server/api/dev-config.get.ts
  - apps/dashboard/app/middleware/guest.ts
  - apps/dashboard/app/middleware/guard.global.ts
  - apps/dashboard/app/composables/useSanitize.ts
  - apps/dashboard/cypress.config.ts
  # strapi
  - apps/strapi/src/cron/subscription-charge.cron.ts
  - apps/strapi/src/cron/bbdd-backup.cron.ts
  - apps/strapi/src/api/ad/controllers/__tests__/ad.findBySlug.test.ts
  - apps/strapi/src/api/ad/controllers/ad.ts
  - apps/strapi/src/api/ad/services/__tests__/ad.compute-status.test.ts
  - apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts
  - apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts
  - apps/strapi/src/api/contact/controllers/contact.ts
  - apps/strapi/src/api/contact/services/contact.service.ts
  - apps/strapi/src/api/cron-runner/controllers/cron-runner.ts
  - apps/strapi/src/api/payment/controllers/payment.ts
  - apps/strapi/src/api/payment/utils/suscription.utils.ts
  - apps/strapi/src/extensions/users-permissions/controllers/userController.ts
  - apps/strapi/src/middlewares/protect-user-fields.ts
  - apps/strapi/src/services/facto/factories/facto.factory.ts
  - apps/strapi/src/services/google/services/google-auth.service.ts
  - apps/strapi/src/services/google/services/google-sheets.service.ts
  - apps/strapi/src/services/indicador/indicador.service.ts
  - apps/strapi/src/services/payment-gateway/tests/gateway.test.ts
  - apps/strapi/src/services/zoho/zoho.service.ts
  - apps/strapi/src/admin/webpack.config.example.js
autonomous: true
requirements: []
must_haves:
  truths:
    - "Zero Codacy unused-code warnings remain across all three apps"
    - "All existing tests still pass after changes"
    - "TypeScript compilation succeeds in website, dashboard, and strapi"
  artifacts: []
  key_links: []
---

<objective>
Fix all remaining Codacy unused-code warnings across website, dashboard, and strapi apps.

Purpose: Eliminate unused-code warnings from Codacy static analysis to achieve clean code quality reports.
Output: Modified source files with unused params prefixed with `_` or dead code removed.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix website and dashboard unused-code warnings</name>
  <files>
    apps/website/app/plugins/communes.client.ts
    apps/website/tests/stubs/app.stub.ts
    apps/website/tests/plugins/google-one-tap.test.ts
    apps/website/tests/middleware/referer.test.ts
    apps/website/tests/middleware/onboarding-guard.test.ts
    apps/website/tests/components/FormLogin.ts
    apps/website/tests/components/FormLogin.website.test.ts
    apps/website/tests/components/FormProfile.onboarding.test.ts
    apps/website/app/middleware/auth.ts
    apps/website/app/middleware/guest.ts
    apps/website/server/api/images/[...].ts
    apps/website/server/api/dev-config.get.ts
    apps/website/app/composables/useAdAnalytics.ts
    apps/website/app/composables/useLogger.ts
    apps/website/cypress.config.ts
    apps/website/test-csp-console.js
    apps/dashboard/tests/stubs/app.stub.ts
    apps/dashboard/tests/stubs/imports.stub.ts
    apps/dashboard/server/api/images/[...].ts
    apps/dashboard/server/api/dev-config.get.ts
    apps/dashboard/app/middleware/guest.ts
    apps/dashboard/app/middleware/guard.global.ts
    apps/dashboard/app/composables/useSanitize.ts
    apps/dashboard/cypress.config.ts
  </files>
  <action>
Read each file and apply the appropriate fix per warning:

**Prefix with `_` (structurally required but unused params):**
- `communes.client.ts:3` — if `_nuxtApp` already prefixed, verify ESLint argsIgnorePattern handles it; otherwise prefix
- `app.stub.ts:25` (both apps) — prefix `key` to `_key` in `useCookie`
- `google-one-tap.test.ts:34,37` — prefix `response` to `_response` in callback type params
- `google-one-tap.test.ts:23` — prefix `args` to `_args`
- `referer.test.ts:14` — prefix `args` to `_args`
- `onboarding-guard.test.ts:29` — prefix `args` to `_args`
- `FormLogin.website.test.ts:83` — prefix `v` to `_v` in `handleSubmit`
- `FormProfile.onboarding.test.ts:235` — prefix `values` to `_values` in `handleSubmit`
- `auth.ts:1` — ensure `_from` is prefixed (may already be)
- `guest.ts:1` (website) — ensure `_to`, `_from` are prefixed
- `dev-config.get.ts:1` (both apps) — ensure `_event` is prefixed
- `useLogger.ts:4` — ensure `_error` is prefixed
- `cypress.config.ts:8` (both apps) — ensure `_on` is prefixed; prefix `config` to `_config` if unused
- `imports.stub.ts:11` (dashboard) — prefix `_name`, `_opts` if not already
- `guard.global.ts:3` (dashboard) — ensure `_from` is prefixed
- `useSanitize.ts:44` (dashboard) — prefix `html` to `_html` in type signature

**Remove dead code:**
- `FormLogin.ts:10` — remove `_submitButton` variable assignment (assigned but never used)
- `useAdAnalytics.ts:37,47` — remove `createPackAnalyticsItem` and `createFeaturedAnalyticsItem` if truly dead (assigned but never used/exported). If they are exported, prefix instead.
- `test-csp-console.js:71,106,159,179` — remove dead functions `testUnsafeEval`, `testUnsafeInline`, `cleanup`, `checkCSP`

**Variable assigned but never read:**
- `server/api/images/[...].ts:3` (both apps) — `_path` is destructured but never used. Change destructuring to omit it or prefix appropriately (e.g., use `const { /* _path removed */ } = ...` or just remove the variable)
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace website exec vitest run --reporter=verbose 2>&1 | tail -5 && yarn workspace dashboard exec vitest run --reporter=verbose 2>&1 | tail -5</automated>
  </verify>
  <done>All Codacy unused-code warnings in website and dashboard apps are resolved. Tests pass.</done>
</task>

<task type="auto">
  <name>Task 2: Fix strapi unused-code warnings</name>
  <files>
    apps/strapi/src/cron/subscription-charge.cron.ts
    apps/strapi/src/cron/bbdd-backup.cron.ts
    apps/strapi/src/api/ad/controllers/__tests__/ad.findBySlug.test.ts
    apps/strapi/src/api/ad/controllers/ad.ts
    apps/strapi/src/api/ad/services/__tests__/ad.compute-status.test.ts
    apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts
    apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts
    apps/strapi/src/api/contact/controllers/contact.ts
    apps/strapi/src/api/contact/services/contact.service.ts
    apps/strapi/src/api/cron-runner/controllers/cron-runner.ts
    apps/strapi/src/api/payment/controllers/payment.ts
    apps/strapi/src/api/payment/utils/suscription.utils.ts
    apps/strapi/src/extensions/users-permissions/controllers/userController.ts
    apps/strapi/src/middlewares/protect-user-fields.ts
    apps/strapi/src/services/facto/factories/facto.factory.ts
    apps/strapi/src/services/google/services/google-auth.service.ts
    apps/strapi/src/services/google/services/google-sheets.service.ts
    apps/strapi/src/services/indicador/indicador.service.ts
    apps/strapi/src/services/payment-gateway/tests/gateway.test.ts
    apps/strapi/src/services/zoho/zoho.service.ts
    apps/strapi/src/admin/webpack.config.example.js
  </files>
  <action>
Read each file and apply the appropriate fix per warning:

**Prefix with `_` (structurally required but unused params):**
- `subscription-charge.cron.ts:355,356,360` — prefix `uid`, `params`, `id` with `_` (these are positional params in function signatures)
- `bbdd-backup.cron.ts:94` — prefix `stdout` to `_stdout` in destructure (already has `_` based on warning text, verify)
- `ad.findBySlug.test.ts:21,25,28` — prefix `args` to `_args` in type signatures
- `ad.compute-status.test.ts:82,83,85,86` — prefix `id` and `options` to `_id` and `_options`
- `auth-one-tap.test.ts:49` — `_ctxBody` is assigned but never used; remove the assignment or prefix
- `auth-one-tap.ts:43` — prefix `user` to `_user` in cast expression
- `contact.ts:18` — `_recaptchaToken` already prefixed, verify ESLint handles it
- `contact.service.ts:11` — prefix `strapi` constructor param to `_strapi` (or use `private readonly _strapi`)
- `cron-runner.ts:35` — prefix `ctx` to `_ctx` in task type
- `payment.ts:37` — prefix `ctx` to `_ctx` in handler wrapper
- `userController.ts:214,215,216` — already `_` prefixed, verify ESLint argsIgnorePattern
- `protect-user-fields.ts:42,43,92` — prefix `config` to `_config`, `context` to `_context`, `userId` to `_userId` (or verify already prefixed)
- `google-auth.service.ts:8` — prefix `config` constructor param: `private readonly _config`
- `google-sheets.service.ts:6` — prefix `authService` constructor param: `private readonly _authService`
- `indicador.service.ts:23` — prefix `httpClient` constructor param: `private readonly _httpClient`
- `gateway.test.ts:80-89` — already `_` prefixed, verify ESLint argsIgnorePattern
- `zoho.service.ts:16` — prefix `httpClient` constructor param: `private readonly _httpClient`
- `webpack.config.example.js:4` — already `_` prefixed, verify

**Remove dead code:**
- `ad.ts:22,31` — remove unused `PaginationMeta` and `QueryParams` interfaces entirely
- `suscription.utils.ts:1` — remove unused `IFlowSubscriptionResponse` import
- `facto.factory.ts:6,7,8` — remove unused `DocumentType` enum with `INVOICE`, `TICKET` members (or prefix if it is exported for future use; if only local and unused, delete)

For constructor params that are `private readonly` — change param name to `_paramName`. This preserves the class field for potential future use but signals it is currently unused. Example: `constructor(private readonly _httpClient: HttpClient)`.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace strapi run test --passWithNoTests 2>&1 | tail -10</automated>
  </verify>
  <done>All Codacy unused-code warnings in strapi app are resolved. Jest tests pass.</done>
</task>

<task type="auto">
  <name>Task 3: Verify TypeScript compilation across all apps</name>
  <files></files>
  <action>
Run TypeScript type-checking for all three apps to ensure none of the `_` prefix renames or dead code removals broke type resolution. If any errors arise, fix them immediately — they will be in the same files modified by Tasks 1 and 2.

Also run a quick grep to confirm no remaining obvious unused-code patterns were missed:
- `grep -rn "assigned but never used\|is defined but never used"` across lint output if available
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace strapi run build --no-optimization 2>&1 | tail -5 && npx nuxi typecheck apps/website 2>&1 | tail -5 && npx nuxi typecheck apps/dashboard 2>&1 | tail -5</automated>
  </verify>
  <done>TypeScript compiles cleanly across all three apps with zero errors from the changes made.</done>
</task>

</tasks>

<verification>
- All Codacy unused-code warnings from the provided list are addressed
- No new TypeScript errors introduced
- All existing test suites pass (vitest for website/dashboard, jest for strapi)
</verification>

<success_criteria>
- Zero remaining Codacy unused-code warnings for the listed files
- All tests pass across website, dashboard, and strapi
- TypeScript compilation succeeds for all apps
</success_criteria>

<output>
After completion, create `.planning/quick/260406-dbk-fix-remaining-codacy-unused-code-warning/260406-dbk-SUMMARY.md`
</output>

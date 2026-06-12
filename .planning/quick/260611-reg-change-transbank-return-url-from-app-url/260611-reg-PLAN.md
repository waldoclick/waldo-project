---
phase: quick-260611-reg
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/api/payment/services/ad.service.ts
  - apps/strapi/src/api/payment/services/pack.service.ts
  - apps/strapi/src/api/payment/services/checkout.service.ts
  - apps/strapi/src/api/payment/controllers/payment.ts
autonomous: true
requirements: [REG-01]
must_haves:
  truths:
    - "All Transbank return/response URLs point to FRONTEND_URL (the Nuxt proxy), not APP_URL (direct Strapi)"
    - "No remaining APP_URL references in payment return-URL construction in the four files"
    - "Strapi TypeScript still compiles after the change"
  artifacts:
    - path: "apps/strapi/src/api/payment/services/ad.service.ts"
      provides: "ad-response returnUrl via FRONTEND_URL"
      contains: "FRONTEND_URL}/api/payments/ad-response"
    - path: "apps/strapi/src/api/payment/services/pack.service.ts"
      provides: "pack-response returnUrl via FRONTEND_URL"
      contains: "FRONTEND_URL}/api/payments/pack-response"
    - path: "apps/strapi/src/api/payment/services/checkout.service.ts"
      provides: "webpay returnUrl via FRONTEND_URL (3 occurrences)"
      contains: "FRONTEND_URL}/api/payments/webpay"
    - path: "apps/strapi/src/api/payment/controllers/payment.ts"
      provides: "pro-response responseUrl via FRONTEND_URL"
      contains: "FRONTEND_URL}/api/payments/pro-response"
  key_links:
    - from: "Transbank callback"
      to: "Nuxt proxy server/api/[...].ts"
      via: "return_url/responseUrl built from FRONTEND_URL"
      pattern: "FRONTEND_URL}/api/payments/"
---

<objective>
Change Transbank `return_url`/`responseUrl` from `APP_URL` to `FRONTEND_URL` across the four Strapi payment files so Transbank redirects route through the Nuxt catch-all proxy (`apps/website/server/api/[...].ts`) instead of hitting the Strapi API directly. This keeps the direct Strapi URL unexposed in the payment callback flow.

Purpose: Consistency with the established proxy-routing pattern — `payment.ts` line 410 already uses `FRONTEND_URL` for the `pagar/gracias` redirect, and the pro-response at line 423 is the lone outlier still on `APP_URL`. The three service files follow the same fix.
Output: Five `APP_URL` → `FRONTEND_URL` substitutions across four files (all in payment return-URL construction only).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md

<interfaces>
The Nuxt proxy that these URLs will now route through (apps/website/server/api/[...].ts):
- Catch-all handler forwards every `/api/*` request to `${API_URL}/api/*` via `proxyRequest`.
- OAuth routes (`connect/google`, `connect/facebook`) are excluded and redirect directly — payment routes are NOT excluded, so `/api/payments/*` is proxied correctly.
- This is exactly why Transbank callbacks must target `FRONTEND_URL` (the Nuxt origin), not `APP_URL` (Strapi).

Exact current strings to replace (all use the literal `${process.env.APP_URL}` prefix):
- ad.service.ts:292 → `${process.env.APP_URL}/api/payments/ad-response`
- pack.service.ts:39 → `${process.env.APP_URL}/api/payments/pack-response`
- checkout.service.ts:55, 80, 132 → `${process.env.APP_URL}/api/payments/webpay`
- payment.ts:423 → `${process.env.APP_URL}/api/payments/pro-response`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace APP_URL with FRONTEND_URL in all four payment files</name>
  <files>apps/strapi/src/api/payment/services/ad.service.ts, apps/strapi/src/api/payment/services/pack.service.ts, apps/strapi/src/api/payment/services/checkout.service.ts, apps/strapi/src/api/payment/controllers/payment.ts</files>
  <action>
Make these exact string substitutions. Only change `APP_URL` → `FRONTEND_URL`; leave the path segment, surrounding code, and `const returnUrl`/`const responseUrl` variable names untouched.

1. apps/strapi/src/api/payment/services/ad.service.ts line 292:
   `const returnUrl = ` + "`${process.env.APP_URL}/api/payments/ad-response`;"
   → change `APP_URL` to `FRONTEND_URL`

2. apps/strapi/src/api/payment/services/pack.service.ts line 39:
   `const returnUrl = ` + "`${process.env.APP_URL}/api/payments/pack-response`;"
   → change `APP_URL` to `FRONTEND_URL`

3. apps/strapi/src/api/payment/services/checkout.service.ts — THREE occurrences (lines 55, 80, 132), each:
   `const returnUrl = ` + "`${process.env.APP_URL}/api/payments/webpay`;"
   → change `APP_URL` to `FRONTEND_URL` in all three.
   Because the three lines are textually identical, edit each occurrence by its distinct surrounding context (the `pack === "free"` block at ~55, the `pack === "paid"` block at ~80, and the named-pack block at ~132), or use a global replace of the full string `${process.env.APP_URL}/api/payments/webpay` → `${process.env.FRONTEND_URL}/api/payments/webpay`.

4. apps/strapi/src/api/payment/controllers/payment.ts line 423:
   `const responseUrl = ` + "`${process.env.APP_URL}/api/payments/pro-response`;"
   → change `APP_URL` to `FRONTEND_URL`

Do NOT touch any other `APP_URL` references elsewhere in these files (if any exist outside payment return-URL construction). Scope is strictly the five return/response URL lines listed above.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && ! grep -rq "process.env.APP_URL}/api/payments/" apps/strapi/src/api/payment/services/ad.service.ts apps/strapi/src/api/payment/services/pack.service.ts apps/strapi/src/api/payment/services/checkout.service.ts apps/strapi/src/api/payment/controllers/payment.ts && test $(grep -c "FRONTEND_URL}/api/payments/webpay" apps/strapi/src/api/payment/services/checkout.service.ts) -eq 3 && echo "OK: no payment APP_URL remains, checkout 3/3"</automated>
  </verify>
  <done>No `process.env.APP_URL}/api/payments/` reference remains in any of the four files (payment return-URL construction), and `checkout.service.ts` contains exactly 3 occurrences of `FRONTEND_URL}/api/payments/webpay`. Each of the five edited lines now reads `${process.env.FRONTEND_URL}/api/payments/{ad-response|pack-response|webpay|pro-response}`. The verify command prints `OK: no payment APP_URL remains, checkout 3/3`.</done>
</task>

</tasks>

<verification>
- `! grep -rq "process.env.APP_URL}/api/payments/" apps/strapi/src/api/payment/services/ad.service.ts apps/strapi/src/api/payment/services/pack.service.ts apps/strapi/src/api/payment/services/checkout.service.ts apps/strapi/src/api/payment/controllers/payment.ts` succeeds (no payment APP_URL remains).
- All five lines now use `process.env.FRONTEND_URL`.
- Strapi TypeScript compiles: `cd apps/strapi && pnpm exec tsc --noEmit` (string-only change, should remain clean).
- Codacy passes if run: `pnpm codacy` from root (no new variables or imports introduced).
</verification>

<success_criteria>
- The four payment files build all Transbank return/response URLs from `FRONTEND_URL`.
- Transbank callbacks now route through the Nuxt proxy (`server/api/[...].ts`) rather than the direct Strapi API URL.
- No behavioral code changed beyond the env-var name; no new imports or variables.
</success_criteria>

<output>
After completion, create `.planning/quick/260611-reg-change-transbank-return-url-from-app-url/260611-reg-SUMMARY.md`
</output>

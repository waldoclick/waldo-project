---
phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
plan: "06"
subsystem: auth
tags: [httponly-cookie, nuxtjs-strapi, session, proxy, webpay, oauth, jwt]

# Dependency graph
requires:
  - phase: 129-04
    provides: Nitro proxy with Authorization injection from waldo_jwt httpOnly cookie; all auth server routes setting/clearing the cookie
  - phase: 129-05
    provides: useStrapiToken fully eliminated; verify-code, uploads, logout, middleware guards migrated to useSessionX

provides:
  - "@nuxtjs/strapi fully removed from apps/website (nuxt.config.ts modules, package.json)"
  - "session.ts plugin active: fetchUser() runs on startup, reading user from proxy-injected Authorization"
  - "useApiClient wraps useSessionClient (not useStrapiClient)"
  - "Zero useStrapiX references in apps/website/app and tests"
  - "Zero direct API_URL / runtimeConfig.strapi reads in client or SSR"
  - "All auth flows verified end-to-end in local: login, OTP, Google popup/redirect, Google One Tap, logout, SSR refresh, create-ad + Webpay payment"
  - "Original Manager-deactivate logout bug fixed (was caused by @nuxtjs/strapi module's plugin conflict with session.ts)"
  - "Webpay callback routes marked auth:false to prevent proxy Authorization from conflicting with public role"

affects: [deploy-checklist, strapi-restart-required, future-payment-routes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "httpOnly cookie as sole JWT carrier: proxy injects Authorization: Bearer from waldo_jwt on all Nitro-forwarded requests"
    - "Gateway callback GET routes (Webpay return/response) must be auth:false because sameSite=lax sends the httpOnly cookie on top-level GET navigations, flipping the request to the authenticated role"
    - "session.ts plugin owns fetchUser() startup — no competing @nuxtjs/strapi auto-fetch plugin"

key-files:
  created: []
  modified:
    - apps/website/app/plugins/session.ts
    - apps/website/app/composables/useApiClient.ts
    - apps/website/nuxt.config.ts
    - apps/website/package.json
    - apps/website/tests/stubs/imports.stub.ts
    - apps/website/tests/composables/useGoogleOneTap.test.ts
    - apps/website/tests/plugins/google-one-tap.test.ts
    - apps/strapi/src/api/payment/routes/payment.ts

key-decisions:
  - "httpOnly proxy injects Authorization: Bearer on ALL forwarded requests including GET navigations — gateway callback routes (Webpay /payments/webpay and /payments/pro-response) must be auth:false; they are identified by the Transbank token, not ctx.state.user"
  - "Original Manager-deactivate logout bug resolved by migration: @nuxtjs/strapi module's auto-fetch plugin was writing user state in parallel with session.ts, causing a race condition that cleared the session on reload"
  - "VERCEL_AUTOMATION_BYPASS_SECRET must be set in Vercel staging/prod environment for SSR self-calls to pass Deployment Protection"
  - "Strapi must be restarted after deploy for route config changes (auth:false on payment routes) to take effect"
  - "LightboxRazon.vue Math.random() label id replaced with useId() to fix SSR hydration mismatch (pre-existing, unrelated to migration)"

patterns-established:
  - "Gateway callback pattern: any payment-gateway route receiving a GET redirect (sameSite=lax) must be auth:false when the proxy injects Authorization from cookie"

requirements-completed: [MECHANICAL-RENAME-SWEEP, MODULE-REMOVAL, SESSION-PLUGIN-ACTIVATION, AUTH-FLOWS-WORK]

# Metrics
duration: multi-session
completed: 2026-06-14
---

# Phase 129 Plan 06: Cutover — Eliminate @nuxtjs/strapi + Activate httpOnly Session Summary

**@nuxtjs/strapi fully removed from apps/website; session.ts activated; proxy is now the single Strapi exit point; all auth flows (login, OTP, Google OAuth, One Tap, logout, Webpay) verified working in local with the original Manager-deactivate logout bug fixed.**

## Performance

- **Duration:** Multi-session (Tasks 1-3 automated; Task 4 human-verify approved by user)
- **Started:** (Tasks 1-3 completed prior session)
- **Completed:** 2026-06-14
- **Tasks:** 4 (3 automated + 1 human-verify)
- **Files modified:** ~50 across app/, tests/, nuxt.config.ts, package.json, and Strapi routes

## Accomplishments

- Batch-renamed all `useStrapiUser` / `useStrapiAuth` / `useStrapiClient` / `useStrapiToken` to `useSessionX` across 43+ files in apps/website/app and tests (Task 1)
- Activated `session.ts` plugin (removed PLAN-06-REMOVE-THIS-LINE guard), removed `@nuxtjs/strapi` from `nuxt.config.ts` modules and `package.json`, removed the `runtimeConfig.strapi.url = API_URL` SSR-direct-to-Strapi hack, removed the top-level `strapi:` module options block (Task 2)
- Updated test mocks (imports.stub.ts, useGoogleOneTap.test.ts, google-one-tap.test.ts), ran final grep sweep (zero useStrapiX / zero @nuxtjs/strapi / zero direct API_URL references), TypeScript clean, 176 tests green with 14 pre-existing failures unchanged (Task 3)
- Human verification approved: login + OTP, Manager deactivate no longer logs out (original bug fixed), session persists on refresh, logout clears session, Google OAuth, create-ad + Webpay payment completes and returns to /pagar/gracias (Task 4)

## Task Commits

Each task was committed atomically:

1. **Task 1: Batch rename useStrapiX → useSessionX + useApiClient onto useSessionClient** - `598aaa3e` (feat)
2. **Task 2: Activate session.ts + remove @nuxtjs/strapi from nuxt.config/package + remove API_URL hack** - `d88d5ad8` (feat)
3. **Task 3: Update test mocks + final grep sweep + typecheck + full suite** - `0405d51c` (chore)
4. **Task 4: Human-verify all auth flows** - APPROVED (no code commit — verification only)

**Deviation commits (committed separately, not part of task sequence):**
- Webpay payment routes `auth:false` fix in `apps/strapi/src/api/payment/routes/payment.ts`
- LightboxRazon.vue `Math.random()` → `useId()` SSR hydration fix

## Files Created/Modified

- `apps/website/app/plugins/session.ts` — PLAN-06-REMOVE-THIS-LINE guard removed; plugin now active
- `apps/website/app/composables/useApiClient.ts` — wraps `useSessionClient()` instead of `useStrapiClient()`
- `apps/website/nuxt.config.ts` — `@nuxtjs/strapi` removed from modules; top-level `strapi:` block removed; `runtimeConfig.strapi.url` hack removed; `vercelBypassSecret` retained
- `apps/website/package.json` — `@nuxtjs/strapi` removed via `pnpm remove`
- `apps/website/tests/stubs/imports.stub.ts` — useStrapiX exports removed; useSessionX exports kept
- `apps/website/tests/composables/useGoogleOneTap.test.ts` — mock renamed to `useSessionUser`
- `apps/website/tests/plugins/google-one-tap.test.ts` — `setToken` mock/assertion removed
- `apps/strapi/src/api/payment/routes/payment.ts` — `/payments/webpay` and `/payments/pro-response` marked `config.auth: false` (deviation fix)
- 43+ Vue/TS files in `apps/website/app/` — mechanical `useStrapiX` → `useSessionX` rename

## Decisions Made

1. **httpOnly proxy injects Authorization on ALL GET navigations (sameSite=lax):** When the user follows a Webpay redirect back to the website, the browser sends the `waldo_jwt` cookie. The Nitro proxy injects `Authorization: Bearer` from that cookie on every forwarded request. The payment callback routes (`/payments/webpay`, `/payments/pro-response`) lack explicit `auth:false` in Strapi v5 config — so the authenticated role was applied, and the authenticated role lacked `payment.webpayResponse` permission → 403. Fix: mark these routes `auth:false`. Order identity is still `order.documentId` (not the gateway token) per payment rules.

2. **Strapi restart required post-deploy:** Route config in Strapi v5 is loaded at startup. The `auth:false` changes to payment routes require a Strapi restart to take effect. This must be included in the deploy runbook.

3. **VERCEL_AUTOMATION_BYPASS_SECRET in all Vercel environments:** SSR self-calls from Nitro go through the proxy with the bypass header (`x-vercel-protection-bypass`). This secret must be present in staging and prod Vercel env vars, or SSR data fetching will fail with 401.

4. **Original Manager logout bug root cause confirmed:** The `@nuxtjs/strapi` module registered its own auto-fetch plugin that ran alongside `session.ts`. The module plugin wrote `null` user state after a `window.location.reload()` (triggered by ad deactivation), racing with `session.ts`'s `fetchUser()`. Removing the module eliminates the competing writer — the bug is gone.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Webpay payment callback routes returned 403 after httpOnly cookie activation**
- **Found during:** Task 4 (human-verify — create-ad + Webpay payment flow)
- **Issue:** The Nitro proxy injects `Authorization: Bearer {waldo_jwt}` on ALL forwarded requests including top-level GET navigations (sameSite=lax sends the cookie). Transbank's return redirect to `/payments/webpay` arrived with a valid JWT, flipping the request from the `public` role to the `authenticated` role. The `authenticated` role lacked `payment.webpayResponse` permission in Strapi — returned 403 Forbidden, breaking the payment return.
- **Fix:** Marked `/payments/webpay` and `/payments/pro-response` routes with `config: { auth: false }` in `apps/strapi/src/api/payment/routes/payment.ts`. These are gateway callbacks identified solely by the Transbank token; order identity is always `order.documentId`, never `ctx.state.user`. `auth:false` is architecturally correct.
- **Files modified:** `apps/strapi/src/api/payment/routes/payment.ts`
- **Verification:** Direct curl returned 302 (controller redirect) instead of 401/403. Full user create-ad + Webpay flow completed and returned to `/pagar/gracias`.
- **Committed separately** (not part of tasks 1-3 sequence)
- **Deploy note:** Strapi must be restarted after deploy for this route config to reload.

**2. [Rule 1 - Bug] LightboxRazon.vue Math.random() label id caused SSR hydration mismatch**
- **Found during:** Task 4 (human-verify — observed hydration warning in console)
- **Issue:** A `Math.random()`-generated id for a label element produced different values between SSR and client hydration.
- **Fix:** Replaced `Math.random()` with `useId()` (Vue 3.5+ / Nuxt built-in).
- **Files modified:** `apps/website/app/components/LightboxRazon.vue`
- **Note:** Pre-existing bug, unrelated to the @nuxtjs/strapi migration. Committed separately.

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes required for correct operation. The payment route fix was blocking the full payment flow. The hydration fix was a pre-existing issue surfaced during verification. No scope creep.

## Issues Encountered

- The `@nuxtjs/strapi` module's auto-fetch plugin was the hidden cause of the recurring Manager-deactivate logout bug. The bug was not reproducible in isolation — only manifested when the module's plugin raced with session.ts on `window.location.reload()`. Removing the module eliminated both the plugin and the race condition.

## User Setup Required

**Post-deploy checklist (staging and production):**

1. **Restart Strapi** after deploying `apps/strapi` — required for the `auth:false` payment route config to reload.
2. **Verify `VERCEL_AUTOMATION_BYPASS_SECRET`** is set in the Vercel environment for all deployments where Deployment Protection is active. SSR self-calls from Nitro use this secret via the `x-vercel-protection-bypass` header.

## Next Phase Readiness

- Phase 129 is complete: `@nuxtjs/strapi` is fully eliminated from apps/website; the httpOnly waldo_jwt cookie is the sole JWT carrier; the Nitro proxy is the single Strapi exit point; all auth flows verified.
- Future payment routes that are gateway callbacks (GET redirects) must be marked `auth:false` — document this in the payment architecture notes.
- No blockers for subsequent phases.

---
*Phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie*
*Completed: 2026-06-14*

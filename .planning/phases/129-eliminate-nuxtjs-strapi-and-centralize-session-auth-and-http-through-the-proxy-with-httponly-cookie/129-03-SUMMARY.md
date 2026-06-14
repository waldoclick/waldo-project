---
phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
plan: "03"
subsystem: website/composables, website/config, strapi/auth-google
tags: [ssr, cookies, httponly, oauth, vercel-bypass, strapi, auth-google]
dependency_graph:
  requires: []
  provides: [APICLIENT-SSR-COOKIE, STRAPI-JSON-MODE, VERCEL-BYPASS-CONFIG]
  affects: [useApiClient, nuxt.config.ts, auth-google.ts]
tech_stack:
  added: []
  patterns:
    - useRequestHeaders(['cookie']) for SSR cookie forwarding in Nitro self-calls
    - Private runtimeConfig key for Vercel Deployment Protection bypass
    - ctx.query.json short-circuit in Strapi controller for JSON mode
key_files:
  created:
    - apps/strapi/tests/api/auth-google/controllers/auth-google.test.ts
  modified:
    - apps/website/app/composables/useApiClient.ts
    - apps/website/nuxt.config.ts
    - apps/strapi/src/api/auth-google/controllers/auth-google.ts
    - apps/website/tests/composables/useApiClient.test.ts
    - apps/website/tests/stubs/imports.stub.ts
decisions:
  - "X-Proxy-Key removed from useApiClient SSR headers even though SSR still routes direct to Strapi (plan 06 removes strapi.url=API_URL hack and closes the gap — do not deploy plan 03 without 06)"
  - "SSR header injection tests are documented-only assertions because vitest.config.ts Vite plugin replaces ALL import.meta.server with false — SSR block unreachable in unit tests"
  - "isNew: false mock in auth-google controller tests avoids the dynamic createUserReservations import() which is painful to stub in Jest"
metrics:
  duration: "~25 minutes"
  completed: "2026-06-14"
  tasks_completed: 3
  tasks_total: 3
  files_changed: 6
---

# Phase 129 Plan 03: SSR Cookie Forwarding + Vercel Bypass + Auth-Google JSON Branch Summary

useApiClient now forwards the incoming browser cookie jar on SSR (so the catch-all proxy can read `waldo_jwt` and inject `Authorization`), injects `x-vercel-protection-bypass` from a private runtimeConfig key on SSR self-calls, and drops `X-Proxy-Key` (which the proxy now owns). Strapi's `auth-google.callback` gains a backward-compatible `?json=true` branch that returns `{ jwt }` as JSON (no HTML popup) for the upcoming Nitro popup-callback route.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | useApiClient SSR cookie forwarding + vercel bypass; drop X-Proxy-Key | 98f336f8 | useApiClient.ts, useApiClient.test.ts, imports.stub.ts |
| 2 | Add vercelBypassSecret to runtimeConfig (private key) | fb71a730 | nuxt.config.ts |
| 3 | Strapi auth-google callback — add ?json=true JSON branch | a51aef1f | auth-google.ts, auth-google.test.ts |

## What Was Built

### Task 1: useApiClient SSR headers

Replaced the SSR block in `useApiClient.ts` from injecting `X-Proxy-Key` to:
1. `useRequestHeaders(["cookie"])` — forwards the browser's cookie jar so the Nitro catch-all proxy can read `waldo_jwt` (Pitfall 3)
2. `useRuntimeConfig().vercelBypassSecret` — injects `x-vercel-protection-bypass` on staging/production SSR self-calls to bypass Vercel Deployment Protection

`useStrapiClient` import retained (cutover to `useSessionClient` deferred to plan 06). `X-Recaptcha-Token` injection on POST/PUT/DELETE unchanged.

### Task 2: vercelBypassSecret runtimeConfig key

Added `vercelBypassSecret: process.env.VERCEL_AUTOMATION_BYPASS_SECRET || ""` in the private (non-public) section of `runtimeConfig`, adjacent to `proxySecretWeb`. The bypass secret must never reach the client.

`runtimeConfig.strapi.url = API_URL` (lines 370-372) and the top-level `strapi:` module block (lines ~290-315) remain untouched — removal is coupled with module elimination in plan 06.

### Task 3: Strapi auth-google ?json=true branch

After `jwt.issue()` in the `callback` method, before `popupResponse()`:

```typescript
if (ctx.query.json) {
  ctx.body = { jwt };
  return;
}
```

Default (no `?json`) path is byte-identical to today. Error paths (`google-oauth-error`) are unchanged. This unblocks the upcoming Nitro `server/api/auth/google-oauth/callback.get.ts` route that needs `{ jwt }` as JSON to set the httpOnly cookie.

## Test Coverage

### Website (Vitest)
- 12 tests pass in `tests/composables/useApiClient.test.ts`
- New tests: X-Proxy-Key removal assertion, SSR mock wiring tests (documented with vitest limitation)
- **Known vitest constraint**: `import.meta.server` is replaced with `false` by `vitest.config.ts` transform plugin. The SSR block in `useApiClient.ts` is unreachable in unit tests. SSR cookie forwarding and vercel bypass are verified via code inspection; the test file documents this explicitly.
- `useRequestHeaders` stub added to `tests/stubs/imports.stub.ts`

### Strapi (Jest)
- 7 tests pass in `tests/api/auth-google/controllers/auth-google.test.ts` (new file)
- JSON branch: `ctx.body = { jwt }`, `ctx.type` not `'html'`
- HTML branch: `ctx.type = 'html'`, body contains `google-oauth-success`
- Error paths: missing code, getToken throws, no id_token — all return HTML error popup

## Deviations from Plan

### Cross-Plan Coupling Discovered (documented, not diverged)

**Found during:** Task 1 verification

**Issue:** The plan instructs removing `X-Proxy-Key` from `useApiClient` SSR headers with the rationale "the catch-all proxy now owns it." However, Strapi's `proxy-auth.ts` middleware enforces `X-Proxy-Key` on ALL `/api/*` paths. While `runtimeConfig.strapi.url = API_URL` remains (kept per Task 2 constraints), SSR `useStrapiClient` calls still go **direct to Strapi** (bypassing the Nuxt catch-all proxy). Without `X-Proxy-Key`, these calls will receive `401 Unauthorized` from Strapi's proxy-auth middleware in any environment where `PROXY_SECRET_WEB` is set.

**Resolution:** Proceeded as the plan instructs (acceptance criteria gate on `X-Proxy-Key` removal). Plan 06 Task 2 removes `strapi.url = API_URL` and routes SSR through the catch-all proxy, which closes the gap. The 03→06 window is an intermediate broken state.

**Severity:** HIGH if plans 03-05 are deployed without 06. No risk if the phase lands atomically.

**Action required:** Do NOT deploy plan 03 to any environment without plan 06. The window between plan 03 and plan 06 leaves ALL SSR data loading unauthenticated (public and private routes alike — proxy-auth is unconditional on `/api/*`).

## Known Stubs

None — all changes are functional with no placeholder data.

## Cross-Plan Coupling Warning

**CRITICAL: Deploy plan 03 only together with plan 06 (never independently)**

Plan 03 removes `X-Proxy-Key` from `useApiClient` SSR headers.
Plan 02 keeps `runtimeConfig.strapi.url = API_URL` (Task 2 explicit constraint).
This combination means SSR calls bypass the proxy and go direct to Strapi, which rejects them without `X-Proxy-Key`.

Plan 06 Task 2 removes the `strapi.url = API_URL` hack, routing SSR through the catch-all proxy (which adds `X-Proxy-Key` toward Strapi). The coupling resolves there.

The develop branch is protected (not auto-deployed to production), so normal git flow prevents this intermediate state from reaching users. Staging deployments between plan 03 and 06 would exhibit SSR failures.

## Self-Check: PASSED

Files created/modified:
- `apps/website/app/composables/useApiClient.ts` — FOUND
- `apps/website/nuxt.config.ts` — FOUND
- `apps/strapi/src/api/auth-google/controllers/auth-google.ts` — FOUND
- `apps/website/tests/composables/useApiClient.test.ts` — FOUND
- `apps/website/tests/stubs/imports.stub.ts` — FOUND
- `apps/strapi/tests/api/auth-google/controllers/auth-google.test.ts` — FOUND

Commits verified:
- 98f336f8 — Task 1 (useApiClient)
- fb71a730 — Task 2 (nuxt.config.ts)
- a51aef1f — Task 3 (auth-google)

---
phase: 129
slug: eliminate-nuxtjs-strapi-centralize-session
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-14
---

# Phase 129 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 1.x (`@nuxt/test-utils`) for website; Jest 29.x for Strapi |
| **Config file** | `apps/website/vitest.config.ts` · `apps/strapi/jest.config.js` |
| **Quick run command** | `pnpm --filter website vitest run --reporter=verbose` |
| **Full suite command** | `pnpm turbo test --filter=website` (+ `cd apps/strapi && npx jest` for the auth-google change) |
| **TypeScript gate** | `cd apps/website && node ../../node_modules/.bin/vue-tsc --noEmit` (nuxi typecheck fails in CI on estree-walker — STATE 125-07) |
| **Estimated runtime** | ~129 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick run command (scoped to the touched test file where possible).
- **After every plan wave:** Run the full suite command.
- **Before `/gsd:verify-work`:** Full suite + `vue-tsc --noEmit` must be green; final grep sweep (plan 06 Task 3) must be clean.
- **Max feedback latency:** 129 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 129-01-01 | 01 | 1 | SESSION-COMPOSABLES | grep+unit | `grep -q session_user app/composables/useSessionUser.ts` | ✅ created in-task | ⬜ pending |
| 129-01-02 | 01 | 1 | HTTPONLY-NO-CLIENT-TOKEN | unit | `pnpm vitest run tests/composables/useSessionUser.test.ts tests/composables/useSessionAuth.test.ts` | ❌ W0 (created in-task) | ⬜ pending |
| 129-02-01 | 02 | 1 | PROXY-AUTH-INJECTION | grep | `grep -q 'Bearer ${jwt}' server/api/[...].ts` | n/a | ⬜ pending |
| 129-02-02 | 02 | 1 | AUTH-INTERCEPT-ROUTES / RECAPTCHA-PRESERVED | unit | `pnpm vitest run tests/server/api/auth/verify-code.test.ts` | ❌ W0 (created in-task) | ⬜ pending |
| 129-02-03 | 02 | 1 | OAUTH-CALLBACK-ROUTES | grep | `grep -q json=true server/api/auth/google-oauth/callback.get.ts` | n/a | ⬜ pending |
| 129-03-01 | 03 | 1 | APICLIENT-SSR-COOKIE | unit | `pnpm vitest run tests/composables/useApiClient.test.ts` | ✅ exists (extended) | ⬜ pending |
| 129-03-02 | 03 | 1 | VERCEL-BYPASS-CONFIG | grep | `grep -q vercelBypassSecret nuxt.config.ts` | n/a | ⬜ pending |
| 129-03-03 | 03 | 1 | STRAPI-JSON-MODE | unit | `cd apps/strapi && npx jest tests/api/auth-google/controllers/auth-google.test.ts` | ❌ W0 (created/extended in-task) | ⬜ pending |
| 129-04-01 | 04 | 2 | OAUTH-POPUP-NOJWT | grep | `grep -q useSessionAuth app/composables/useProviders.ts && ! grep -q setToken app/components/LoginWithGoogle.vue` | n/a | ⬜ pending |
| 129-04-02 | 04 | 2 | OAUTH-EXCHANGE-ROUTES | grep | `grep -q /api/auth/google/exchange app/pages/login/google.vue` | n/a | ⬜ pending |
| 129-04-03 | 04 | 2 | ONETAP-NO-SETTOKEN | grep | `! grep -q setToken app/plugins/google-one-tap.client.ts` | n/a | ⬜ pending |
| 129-05-01 | 05 | 2 | VERIFYCODE-NO-SETTOKEN / UPLOADS-NO-TOKEN | grep | `! grep -q setToken app/components/FormVerifyCode.vue && ! grep -rq useStrapiToken app/composables/useImage.ts app/components/UploadMedia.vue` | n/a | ⬜ pending |
| 129-05-02 | 05 | 2 | LOGOUT-SERVER-ROUTE | unit | `pnpm vitest run tests/composables/useLogout.test.ts` | ✅ exists (updated) | ⬜ pending |
| 129-05-03 | 05 | 2 | GUARDS-NO-TOKEN | unit | `pnpm vitest run tests/middleware/dashboard-guard.test.ts` | ✅ exists (updated) | ⬜ pending |
| 129-06-01 | 06 | 3 | MECHANICAL-RENAME-SWEEP | grep | `! grep -rq "useStrapiUser\|useStrapiAuth\|useStrapiToken\|useStrapiClient" app` | n/a | ⬜ pending |
| 129-06-02 | 06 | 3 | MODULE-REMOVAL / SESSION-PLUGIN-ACTIVATION | grep | `! grep -q @nuxtjs/strapi nuxt.config.ts package.json && ! grep -q PLAN-06-REMOVE-THIS-LINE app/plugins/session.ts` | n/a | ⬜ pending |
| 129-06-03 | 06 | 3 | full sweep + typecheck | suite | `node ../../node_modules/.bin/vue-tsc --noEmit && pnpm vitest run` | ✅ exists (mocks updated) | ⬜ pending |
| 129-06-04 | 06 | 3 | AUTH-FLOWS-WORK | manual | staging human-verify (10 flows) | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Created/extended in-task during Wave 1 (no separate Wave 0 plan needed — each test file is authored alongside the code it covers):

- [ ] `tests/composables/useSessionUser.test.ts` — NEW (plan 01) — useState init null
- [ ] `tests/composables/useSessionAuth.test.ts` — NEW (plan 01) — **CRITICAL**: 401 → user=null with NO token/cookie side effect (logout-bug regression guard)
- [ ] `tests/server/api/auth/verify-code.test.ts` — NEW (plan 02) — reCAPTCHA called before Strapi; no jwt in response; httpOnly cookie set
- [ ] `tests/api/auth-google/controllers/auth-google.test.ts` (strapi) — NEW/extended (plan 03) — ?json=true → { jwt }; default → HTML
- [ ] `tests/composables/useApiClient.test.ts` — extended (plan 03) — SSR cookie forwarding + vercel bypass; swap to useSessionClient mock (plan 06)
- [ ] `tests/composables/useLogout.test.ts` — updated (plan 05) — POST /api/auth/logout
- [ ] `tests/middleware/dashboard-guard.test.ts` — updated (plan 05) — user-based stubs, no token
- [ ] `tests/stubs/imports.stub.ts` — additive useSessionX (plan 01), remove useStrapiX (plan 06)
- [ ] `tests/composables/useGoogleOneTap.test.ts` — updated (plan 06) — useSessionUser mock
- [ ] `tests/plugins/google-one-tap.test.ts` — updated (plan 06) — remove setToken assertion

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Email/password + OTP login end-to-end | AUTH-FLOWS-WORK | Real reCAPTCHA token + real OTP email | Plan 06 Task 4, flow 1–2 |
| Google One Tap / popup / redirect | AUTH-FLOWS-WORK | Requires real Google account + popup/redirect + COOP | Plan 06 Task 4, flow 3–5 |
| Facebook OAuth | AUTH-FLOWS-WORK | Real Facebook account; Strapi creds may be inactive (Open Q #3) | Plan 06 Task 4, flow 6 |
| Logout clears httpOnly cookie | AUTH-FLOWS-WORK | httpOnly cookie state only observable in browser DevTools | Plan 06 Task 4, flow 7 |
| Logout-bug regression (reload keeps session) | AUTH-FLOWS-WORK | Requires window.location.reload() round trip on real SSR | Plan 06 Task 4, flow 8 |
| SSR refresh keeps session (cookie forwarding) | APICLIENT-SSR-COOKIE | Real Vercel staging + bypass header behavior | Plan 06 Task 4, flow 9 |
| Image/avatar/cover uploads via proxy | UPLOADS-NO-TOKEN | Multipart upload through proxy auth injection | Plan 06 Task 4, flow 10 |
| VERCEL_AUTOMATION_BYPASS_SECRET present in staging/prod | VERCEL-BYPASS-CONFIG | External Vercel env state | `vercel env ls` before plan 06 deploy (Open Q #2) |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or a documented manual-only checkpoint
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (every wave-1/2 task has grep or unit; wave-3 ends in suite + manual)
- [x] Wave 0 covers all MISSING references (test files authored in-task alongside code)
- [x] No watch-mode flags (all `vitest run` / `jest` one-shot)
- [x] Feedback latency < 129s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-14

---
phase: 127
slug: security-review-round-2
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-12
---

# Phase 127 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

This phase spans two apps. Strapi fixes use Jest; Nuxt fixes use Vitest. Tests live in the root-level `tests/` of each app, mirroring source.

| Property | Value |
|----------|-------|
| **Framework (Strapi)** | jest (apps/strapi) |
| **Framework (Nuxt)** | vitest + @nuxt/test-utils (apps/website) |
| **Config file (Strapi)** | apps/strapi/jest.config.* |
| **Config file (Nuxt)** | apps/website/vitest.config.* |
| **Quick run command (Strapi)** | `cd apps/strapi && pnpm test -- --testPathPattern=<pattern>` |
| **Quick run command (Nuxt)** | `cd apps/website && pnpm test -- <pattern>` |
| **Full suite command** | `pnpm test` (turbo, both apps) |
| **Estimated runtime** | ~60–120 seconds full suite |

---

## Sampling Rate

- **After every task commit:** Run the quick command for the touched app, scoped to the new test file.
- **After every plan wave:** Run the touched app's full test suite.
- **Before `/gsd:verify-work`:** `pnpm test` must be green in both apps; `pnpm codacy` clean.
- **Max feedback latency:** ~120 seconds

---

## Per-Task Verification Map

*One row per code-producing task. Every security fix has a Wave 0 (T1) regression test that FAILS without the fix and PASSES with it; the fix task (T2/T3) flips it green.*

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-T1 | 01 | 1 | SEC2-PAYMENT | unit (red) | `cd apps/strapi && pnpm test -- --testPathPattern=checkout.service` | ❌ W0 create | ⬜ pending |
| 01-T2 | 01 | 1 | SEC2-PAYMENT | unit (green) | `cd apps/strapi && pnpm test -- --testPathPattern=checkout.service` | ✅ from T1 | ⬜ pending |
| 02-T1 | 02 | 1 | SEC2-AUTHZ | unit (red) | `cd apps/strapi && pnpm test -- --testPathPattern="order.test\|ad-pack.route"` | ❌ W0 create | ⬜ pending |
| 02-T2 | 02 | 1 | SEC2-AUTHZ | unit (green) | `cd apps/strapi && pnpm test -- --testPathPattern="order.test\|ad-pack.route"` | ✅ from T1 | ⬜ pending |
| 03-T1 | 03 | 1 | SEC2-AUTH | unit (red) | `cd apps/strapi && pnpm test -- --testPathPattern="google-one-tap.service\|ad.jwt"` | ❌ W0 create | ⬜ pending |
| 03-T2 | 03 | 1 | SEC2-AUTH | unit (green) | `cd apps/strapi && pnpm test -- --testPathPattern="google-one-tap.service\|ad.jwt"` | ✅ from T1 | ⬜ pending |
| 03-T3 | 03 | 1 | SEC2-AUTH | unit | `cd apps/strapi && pnpm test && cd ../website && pnpm test -- recaptcha` | n/a (rate-limit + recaptcha) | ⬜ pending |
| 04-T1 | 04 | 1 | SEC2-XSS | unit (red) | `cd apps/website && pnpm test -- useSanitize` | ❌ W0 create | ⬜ pending |
| 04-T2 | 04 | 1 | SEC2-XSS | unit (green) | `cd apps/website && pnpm test -- useSanitize` | ✅ from T1 | ⬜ pending |
| 05-T1 | 05 | 2 | SEC2-LOCKDOWN | unit (red) | `cd apps/strapi && pnpm test -- --testPathPattern="upload\|userController"` | ❌ W0 create | ⬜ pending |
| 05-T2 | 05 | 2 | SEC2-LOCKDOWN | unit (green) | `cd apps/strapi && pnpm test -- --testPathPattern="upload\|userController"` | ✅ from T1 | ⬜ pending |
| 05-T3 | 05 | 2 | SEC2-LOCKDOWN | unit + manual | `cd apps/strapi && pnpm test` | route lockdown + .mjml audit | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### Test files created in Wave 0 (per plan T1)

- `apps/strapi/tests/api/payment/checkout.service.test.ts` (01)
- `apps/strapi/tests/api/payment/pack.service.test.ts` (01, if amount path lives there)
- `apps/strapi/tests/api/order/order.test.ts` (02)
- `apps/strapi/tests/api/ad-pack/ad-pack.route.test.ts` (02)
- `apps/strapi/tests/services/google-one-tap/google-one-tap.service.test.ts` (03)
- `apps/strapi/tests/api/ad/ad.jwt.test.ts` (03)
- `apps/website/tests/composables/useSanitize.test.ts` (04)
- `apps/strapi/tests/middlewares/upload.test.ts` (05)
- `apps/strapi/tests/extensions/users-permissions/controllers/userController.test.ts` (05)

---

## Wave 0 Requirements

- [ ] New Jest test files under `apps/strapi/tests/` mirroring touched services/controllers/middlewares (created in each plan's Task 1).
- [ ] New Vitest test file under `apps/website/tests/composables/useSanitize.test.ts` for SSR sanitizer behavior (plan 04 Task 1).
- [ ] Install runtime deps surfaced by research, added in each plan's first task:
  - `isomorphic-dompurify@2.35.0` → `apps/website` (plan 04)
  - `file-type@16.5.4` → `apps/strapi` (plan 05)
  - rate-limit: `koa2-ratelimit` is transitive via `@strapi/plugin-users-permissions`; Nuxt proxy uses in-memory store (no new dep) (plan 03)

*Existing Jest/Vitest infrastructure otherwise covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full Webpay end-to-end purchase still grants the pack exactly once | SEC2-PAYMENT | Requires a real/integration Transbank transaction | Run an integration-mode Webpay purchase; confirm one set of reservations created; replaying the return URL grants nothing extra and returns the same order.documentId |
| Strapi DB role permissions (Public vs Authenticated) audit | SEC2-AUTHZ, SEC2-LOCKDOWN | Lives in Strapi admin DB, not code | Export role permissions; confirm verification-code / order / subscription-payment write actions are not granted to non-managers |
| Google login with unverified-email account is rejected | SEC2-AUTH | Needs a real unverified Google identity | Attempt login with an unverified Google email; expect 401 rejection before link/create |
| MJML emails render without `&lt;`/`&amp;` artifacts and links work after autoescape | SEC2-LOCKDOWN | .mjml not covered by TS/unit checks | Render one transactional email + one cron report; confirm no double-escaping and confirmation/reset links resolve |
| duplicate buy_order pre-deploy check | SEC2-PAYMENT | DB state, pre-migration | Run `SELECT buy_order, COUNT(*) FROM orders GROUP BY buy_order HAVING COUNT(*) > 1;` before deploying the unique constraint |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (test files created in each plan's Task 1)
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready

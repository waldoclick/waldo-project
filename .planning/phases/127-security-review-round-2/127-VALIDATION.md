---
phase: 127
slug: security-review-round-2
status: draft
nyquist_compliant: false
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
| **Quick run command (Strapi)** | `pnpm --filter strapi test -- <pattern>` |
| **Quick run command (Nuxt)** | `pnpm --filter website test -- <pattern>` |
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

*Populated by the planner — one row per task. Every security fix must have a regression test that FAILS without the fix and PASSES with it (negative + positive case).*

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | — | SEC2-PAYMENT | unit | TBD | ❌ W0 | ⬜ pending |
| TBD | 02 | — | SEC2-AUTHZ | unit | TBD | ❌ W0 | ⬜ pending |
| TBD | 03 | — | SEC2-AUTH | unit | TBD | ❌ W0 | ⬜ pending |
| TBD | 04 | — | SEC2-XSS | unit | TBD | ❌ W0 | ⬜ pending |
| TBD | 05 | — | SEC2-LOCKDOWN | unit | TBD | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] New Jest test files under `apps/strapi/tests/` mirroring touched services/controllers/middlewares.
- [ ] New Vitest test files under `apps/website/tests/` for `useSanitize` SSR behavior.
- [ ] Install dev/runtime deps surfaced by research: `isomorphic-dompurify@~2.35`, `file-type@16.5.4`, rate-limit lib — added in the relevant plan's first task.

*Existing Jest/Vitest infrastructure otherwise covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full Webpay end-to-end purchase still grants the pack once | SEC2-PAYMENT | Requires a real/integration Transbank transaction | Run an integration-mode Webpay purchase; confirm one set of reservations created, replaying the return URL grants nothing extra |
| Strapi DB role permissions (Public vs Authenticated) audit | SEC2-AUTHZ, SEC2-LOCKDOWN | Lives in Strapi admin DB, not code | Export role permissions; confirm verification-code/order write actions are not granted to non-managers |
| Google login with unverified-email account is rejected | SEC2-AUTH | Needs a real unverified Google identity | Attempt login with an unverified Google email; expect rejection |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

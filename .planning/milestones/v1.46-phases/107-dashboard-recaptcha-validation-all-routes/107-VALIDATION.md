---
phase: 107
slug: dashboard-recaptcha-validation-all-routes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 107 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @nuxt/test-utils |
| **Config file** | `apps/dashboard/vitest.config.ts` |
| **Quick run command** | `yarn workspace dashboard test` |
| **Full suite command** | `yarn workspace dashboard test --run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace dashboard test`
- **After every plan wave:** Run `yarn workspace dashboard test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 107-01-01 | 01 | 1 | server-guard | unit | `yarn workspace dashboard test server/utils/recaptcha` | ❌ W0 | ⬜ pending |
| 107-01-02 | 01 | 1 | useApiClient | unit | `yarn workspace dashboard test composables/useApiClient` | ❌ W0 | ⬜ pending |
| 107-02-01 | 02 | 2 | call-site migration | integration | `yarn workspace dashboard test --run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/dashboard/tests/utils/recaptcha.test.ts` — stubs for server-side guard logic
- [ ] `apps/dashboard/tests/composables/useApiClient.test.ts` — stubs for client composable

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| reCAPTCHA token sent on form submit | all POST/PUT/DELETE | Requires browser interaction | Open dashboard, perform a create/update/delete, check Network tab for `X-Recaptcha-Token` header on the proxied request |
| Token verification on server | server-guard | Requires live reCAPTCHA secret | Check server logs for "reCAPTCHA validation passed/failed" on each mutating request |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

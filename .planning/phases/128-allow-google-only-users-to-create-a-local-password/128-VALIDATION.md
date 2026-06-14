---
phase: 128
slug: allow-google-only-users-to-create-a-local-password
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-13
---

# Phase 128 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (Strapi) |
| **Config file** | `apps/strapi/jest.config.ts` |
| **Quick run command** | `cd apps/strapi && npx jest tests/extensions/users-permissions/controllers/authController.test.ts --no-coverage` |
| **Full suite command** | `cd apps/strapi && npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 128-01-T1 | 01 | 1 | GOAUTH-128-01, GOAUTH-128-02, GOAUTH-128-05 | unit | `cd apps/strapi && npx jest tests/extensions/users-permissions/controllers/authController.test.ts -t "GOAUTH-128-01\|GOAUTH-128-02\|GOAUTH-128-05" --no-coverage` | ✅ | ⬜ pending |
| 128-01-T2 | 01 | 1 | GOAUTH-128-03, GOAUTH-128-04 | unit | `cd apps/strapi && npx jest tests/extensions/users-permissions/controllers/authController.test.ts tests/services/google-one-tap/google-one-tap.service.test.ts -t "GOAUTH-128-03\|GOAUTH-128-04" --no-coverage` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — no Wave 0 needed.

- `tests/extensions/users-permissions/controllers/authController.test.ts` — exists, extends with new `describe` blocks
- `tests/services/google-one-tap/google-one-tap.service.test.ts` — exists, add one case for converted user

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: both tasks have automated verify
- [x] Wave 0 not needed — all test files exist
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

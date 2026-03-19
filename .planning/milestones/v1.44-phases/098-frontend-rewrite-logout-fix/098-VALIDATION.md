---
phase: 098
slug: frontend-rewrite-logout-fix
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 098 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @nuxt/test-utils |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace waldo-website test --run` |
| **Full suite command** | `yarn workspace waldo-website test --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace waldo-website test --run`
- **After every plan wave:** Run `yarn workspace waldo-website test --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 098-01-01 | 01 | 1 | GTAP-12 | unit | `yarn workspace waldo-website test --run tests/composables/useLogout.test.ts` | ✅ | ⬜ pending |
| 098-01-02 | 01 | 1 | GTAP-07 | unit | `yarn workspace waldo-website test --run tests/composables/useGoogleOneTap.test.ts` | ❌ W0 | ⬜ pending |
| 098-02-01 | 02 | 2 | GTAP-08, GTAP-09, GTAP-10 | unit | `yarn workspace waldo-website test --run tests/plugins/google-one-tap.test.ts` | ❌ W0 | ⬜ pending |
| 098-02-02 | 02 | 2 | GTAP-11 | unit | `yarn workspace waldo-website test --run tests/composables/useGoogleOneTap.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/website/tests/composables/useGoogleOneTap.test.ts` — unit tests for rewritten composable (GTAP-07, GTAP-11)
- [ ] `apps/website/tests/plugins/google-one-tap.test.ts` — unit tests for plugin (GTAP-08, GTAP-09, GTAP-10)

*Note: `apps/website/tests/composables/useLogout.test.ts` already exists — extend it for GTAP-12.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| One Tap overlay appears in browser for unauthenticated user | GTAP-09 | GIS prompt is a real Google UI element, not mockable in unit tests | Visit homepage logged out, confirm prompt appears within 1-2s |
| Completing One Tap signs user in (waldo_jwt cookie set, header shows user) | GTAP-11 | Requires real Google credential flow | Use test Google account to complete One Tap flow; confirm cookie in DevTools |
| disableAutoSelect() prevents re-prompt after logout | GTAP-12 | Requires real GIS session state | Log in via One Tap, log out, confirm no prompt reappears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

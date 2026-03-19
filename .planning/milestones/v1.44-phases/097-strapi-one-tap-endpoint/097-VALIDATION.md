---
phase: 097
slug: strapi-one-tap-endpoint
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 097 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7.0 with ts-jest |
| **Config file** | `apps/strapi/jest.config.js` |
| **Quick run command** | `yarn workspace waldo-strapi test --testPathPattern="google-one-tap"` |
| **Full suite command** | `yarn workspace waldo-strapi test` |
| **Estimated runtime** | ~15 seconds (quick), ~60 seconds (full) |

---

## Sampling Rate

- **After every task commit:** `yarn workspace waldo-strapi test --testPathPattern="google-one-tap"`
- **After every plan wave:** `yarn workspace waldo-strapi test`
- **Before `/gsd-verify-work`:** Full suite must be green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 097-01-01 | 01 | 0 | GTAP-03,04,05 | unit | `yarn workspace waldo-strapi test --testPathPattern="google-one-tap.service"` | ❌ W0 | ⬜ pending |
| 097-01-02 | 01 | 0 | GTAP-06 | unit | `yarn workspace waldo-strapi test --testPathPattern="auth-one-tap"` | ❌ W0 | ⬜ pending |
| 097-01-03 | 01 | 1 | GTAP-03,04,05 | unit | `yarn workspace waldo-strapi test --testPathPattern="google-one-tap.service"` | ✅ W0 | ⬜ pending |
| 097-01-04 | 01 | 1 | GTAP-06 | unit | `yarn workspace waldo-strapi test --testPathPattern="auth-one-tap"` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/src/services/google-one-tap/google-one-tap.service.test.ts` — stubs for GTAP-03, GTAP-04, GTAP-05 (mock `OAuth2Client.verifyIdToken` and `strapi.db.query`)
- [ ] `apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts` — stubs for GTAP-06 (mock service + assert response shape is `{ jwt, user }`, not `{ pendingToken, email }`)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| One Tap `curl` end-to-end with real Google credential | GTAP-03 | Requires a valid live Google ID token — cannot be mocked in unit tests | Use `curl -X POST http://localhost:1337/api/auth/google-one-tap -d '{"credential":"<real-token>"}'` with a token obtained from browser DevTools during local dev |
| No duplicate account on second sign-in | GTAP-04 | Requires real DB state | Sign in twice with same Google account; verify `SELECT COUNT(*) FROM up_users WHERE email='...'` returns 1 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

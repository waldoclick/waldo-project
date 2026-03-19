---
phase: 096
slug: csp-environment-setup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 096 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual-only — no automated tests for config/env changes |
| **Config file** | n/a |
| **Quick run command** | n/a |
| **Full suite command** | n/a |
| **Estimated runtime** | ~2 min manual verification |

---

## Sampling Rate

- **After every task commit:** n/a — no automated tests for this phase
- **After every plan wave:** Manual: start Nuxt in staging, open Chrome DevTools → Network → filter `accounts.google.com/gsi/` — confirm no CSP blocked requests
- **Before `/gsd-verify-work`:** Full manual verification per all 4 success criteria

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 096-01-01 | 01 | 1 | GTAP-01 | manual | n/a — CSP only active when `NODE_ENV !== "local"` | n/a | ⬜ pending |
| 096-01-02 | 01 | 1 | GTAP-02 | manual | n/a — env var presence verified by Strapi startup | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — existing infrastructure covers all phase requirements. GTAP-01 and GTAP-02 are deployment/config changes verified manually.

*No test files need to be created for this phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `connect-src` + `frame-src` include `https://accounts.google.com/gsi/` | GTAP-01 | CSP is only active when `NODE_ENV !== "local"`; header validation requires a running Nuxt server + Chrome DevTools | Open Chrome → DevTools → Network → filter for `gsi` — confirm zero blocked (red) requests when One Tap initializes |
| `GOOGLE_CLIENT_ID` present in `apps/strapi/.env` | GTAP-02 | Env var presence is a deployment concern, not a unit-testable behavior | Start `apps/strapi` with `yarn develop` — confirm startup succeeds without "Missing GOOGLE_CLIENT_ID" error |
| `.env.example` documents `GOOGLE_CLIENT_ID` | GTAP-02 | File content check — visual verification | `cat apps/strapi/.env.example | grep GOOGLE_CLIENT_ID` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

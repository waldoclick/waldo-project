---
phase: 082
slug: email-verification-backend-activation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 082 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Operational phase — no unit tests; verification is SQL + HTTP smoke + browser |
| **Config file** | none — Wave 0 not applicable |
| **Quick run command** | `yarn workspace waldo-strapi test` (regression check only) |
| **Full suite command** | `yarn workspace waldo-strapi test` |
| **Estimated runtime** | ~30 seconds (regression); manual smoke tests ~5 minutes |

---

## Sampling Rate

- **Pre-toggle gate:** DB migration count check — `COUNT(*) = 0` is a hard gate (no proceed if > 0)
- **Post-toggle smoke:** Manual HTTP test (new registration) + browser test (confirmation link)
- **Before `/gsd-verify-work`:** All 4 Observable Truths verified

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 082-01-01 | 01 | 1 | REGV-06 | sql | `SELECT COUNT(*) FROM up_users WHERE confirmed != TRUE OR confirmed IS NULL` → must return 0 | N/A (SQL) | ⬜ pending |
| 082-01-02 | 01 | 1 | REGV-01, REGV-02 | manual-http | Register new user → attempt login; OAuth user gets `confirmed: true` | N/A (manual) | ⬜ pending |
| 082-01-03 | 01 | 1 | REGV-01 | manual-browser | Click confirmation link → lands on `https://waldo.click/login` | N/A (manual) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — this phase has no code files. Validation is entirely operational (SQL, HTTP, browser).

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All users have `confirmed = true` after migration | REGV-06 | Requires DB shell access; no automated test runner | Run: `SELECT COUNT(*) FROM up_users WHERE confirmed != TRUE OR confirmed IS NULL` — expect 0 |
| New form registration cannot login until email confirmed | REGV-01 | Requires a live Strapi instance with toggle ON + real email flow | Register new user → try `POST /api/auth/local` → expect no JWT / confirmation error |
| Google OAuth auto-sets `confirmed = true` | REGV-02 | Source-verified (providers.js L91); production test requires OAuth flow | Source verification: `confirmed: true` hardcoded in `providers.js` |
| Confirmation email link redirects to `waldo.click/login` | REGV-01 | Requires receiving and clicking a real email | Register → receive email → click link → verify landing URL is `https://waldo.click/login` |

---

## Validation Sign-Off

- [x] All tasks have manual-verify steps (no automated unit tests for operational phase)
- [x] Wave 0 not applicable — no code files created
- [x] No watch-mode flags
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

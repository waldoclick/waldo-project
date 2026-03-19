---
phase: 083
slug: ecommerce-bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 083 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @nuxt/test-utils |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace website test -- --run tests/composables/useAdAnalytics.test.ts` |
| **Full suite command** | `yarn workspace website test -- --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace website test -- --run tests/composables/useAdAnalytics.test.ts`
- **After every plan wave:** Run `yarn workspace website test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 083-01-01 | 01 | 1 | ECOM-01, ECOM-02 | unit | `yarn workspace website test -- --run tests/composables/useAdAnalytics.test.ts` | ✅ | ⬜ pending |
| 083-01-02 | 01 | 1 | ECOM-03 | unit + manual | `yarn workspace website test -- --run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — `useAdAnalytics.test.ts` (12 tests) already exists. One new test needed for ECOM-01 string-coercion regression.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `purchase` event shows real value in GA4 Realtime | ECOM-01 | GA4 Realtime cannot be unit-tested | Register a paid order → open GA4 Realtime → Events → purchase → verify `value` is non-zero |
| `purchase` event at `/anunciar/gracias` appears in GA4 | ECOM-03 | Requires live GA4 session | Complete free ad creation → open GA4 Realtime → verify `purchase` event fires with `value: 0` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

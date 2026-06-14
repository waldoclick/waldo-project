---
phase: 125
slug: merge-dashboard-into-website
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-10
---

# Phase 125 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @nuxt/test-utils |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace waldo-website test --run` |
| **Full suite command** | `yarn workspace waldo-website test --run --coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** `yarn workspace waldo-website nuxi typecheck`
- **After every plan wave:** `yarn workspace waldo-website test --run`
- **Before `/gsd:verify-work`:** Full typecheck + test suite must be green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| AUTH-01 | 01 | 1 | Manager redirect to /dashboard | unit | `yarn workspace waldo-website test --run tests/components/FormVerifyCode.test.ts` | ❌ Wave 0 | ⬜ pending |
| AUTH-02 | 01 | 1 | Non-manager redirect to /anuncios | unit | `yarn workspace waldo-website test --run tests/components/FormVerifyCode.test.ts` | ❌ Wave 0 | ⬜ pending |
| GUARD-01 | 01 | 1 | dashboard-guard: unauthenticated → /login | unit | `yarn workspace waldo-website test --run tests/middleware/dashboard-guard.test.ts` | ❌ Wave 0 | ⬜ pending |
| GUARD-02 | 01 | 1 | dashboard-guard: non-manager → / | unit | `yarn workspace waldo-website test --run tests/middleware/dashboard-guard.test.ts` | ❌ Wave 0 | ⬜ pending |
| GUARD-03 | 01 | 1 | onboarding-guard: managers exempt at /dashboard/** | unit | `yarn workspace waldo-website test --run tests/middleware/onboarding-guard.test.ts` | ❌ Wave 0 | ⬜ pending |
| SCSS-01 | 06 | 6 | No Sass compilation errors after SCSS merge | build | `yarn workspace waldo-website build` | — | ⬜ pending |
| TYPE-01 | 06 | 6 | Website typecheck passes after component migration | build | `yarn workspace waldo-website nuxi typecheck` | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/website/tests/components/FormVerifyCode.test.ts` — stubs for AUTH-01, AUTH-02
- [ ] `apps/website/tests/middleware/dashboard-guard.test.ts` — stubs for GUARD-01, GUARD-02
- [ ] `apps/website/tests/middleware/onboarding-guard.test.ts` — add GUARD-03 case (extend existing file or create new)

*Use `vi.stubGlobal("useStrapiUser", () => ({ value: { role: { name: "manager" } } }))` pattern (per STATE.md 109-01).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| /dashboard pages render correctly with sidebar layout | LAYOUT-01 | Requires browser rendering of Nuxt layout system | Start dev server, navigate to /dashboard, verify sidebar + header render |
| Dashboard page accessible to manager, 404/redirect for regular user | GUARD-E2E | Full SSR + middleware chain requires running app | Login as manager → verify /dashboard loads; login as regular user → verify redirect to / |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

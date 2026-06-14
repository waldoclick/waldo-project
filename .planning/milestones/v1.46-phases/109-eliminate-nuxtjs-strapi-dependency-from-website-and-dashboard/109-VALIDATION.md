---
phase: 109
slug: eliminate-nuxtjs-strapi-dependency-from-website-and-dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 109 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + happy-dom |
| **Config file** | `apps/dashboard/vitest.config.ts` |
| **Quick run command** | `yarn workspace waldo-dashboard vitest run` |
| **Full suite command** | `yarn workspace waldo-dashboard vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace waldo-dashboard vitest run`
- **After every plan wave:** Run `yarn workspace waldo-dashboard vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green + `yarn workspace waldo-dashboard nuxt typecheck` passes
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 109-W0-01 | 01 | 0 | REQ-109-01, REQ-109-02 | unit | `yarn workspace waldo-dashboard vitest run tests/composables/useSessionClient.test.ts` | ❌ W0 | ⬜ pending |
| 109-W0-02 | 01 | 0 | REQ-109-03 | unit | `yarn workspace waldo-dashboard vitest run tests/composables/useApiClient.test.ts` | ✅ needs mock update | ⬜ pending |
| 109-W0-03 | 01 | 0 | REQ-109-05 | regression | `yarn workspace waldo-dashboard vitest run` | ✅ | ⬜ pending |
| 109-01-01 | 01 | 1 | REQ-109-01, REQ-109-02 | unit | `yarn workspace waldo-dashboard vitest run tests/composables/useSessionClient.test.ts` | ❌ W0 | ⬜ pending |
| 109-01-02 | 01 | 1 | REQ-109-03 | unit | `yarn workspace waldo-dashboard vitest run tests/composables/useApiClient.test.ts` | ✅ | ⬜ pending |
| 109-01-03 | 01 | 2 | REQ-109-04 | typecheck | `yarn workspace waldo-dashboard nuxt typecheck` | N/A — build step | ⬜ pending |
| 109-01-04 | 01 | 2 | REQ-109-05 | regression | `yarn workspace waldo-dashboard vitest run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/composables/useSessionClient.test.ts` — stubs for REQ-109-01 (qs bracket notation) and REQ-109-02 (Authorization header injection)
- [ ] Update `tests/composables/useApiClient.test.ts` mock — swap `useStrapiClient` for `useSessionClient` (REQ-109-03)
- [ ] Update `tests/stubs/imports.stub.ts` — remove `useStrapiClient`/`useStrapiAuth`/`useStrapiUser` exports (no longer from `#imports`)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Session persists across browser refresh after JWT cookie set | REQ-109-02 | Requires browser cookie inspection | Log in, refresh, verify user state still populated |
| Logout clears session cookie and redirects to login | REQ-109 | Requires browser session state | Click logout, verify cookie cleared, verify redirect |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

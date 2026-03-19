---
phase: 093
slug: ad-preview-error-handling
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-18
---

# Phase 093 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (Strapi); Vitest + happy-dom (website) |
| **Config file** | `apps/strapi/jest.config.js` / `apps/website/vitest.config.ts` |
| **Quick run command** | `grep -n "watchEffect\|showError" apps/website/app/pages/anuncios/\[slug\].vue` |
| **Full suite command** | `yarn workspace website typecheck && yarn workspace strapi test --testPathPattern=ad.controller` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** `grep -n "watchEffect\|showError\|getErrorMessage" apps/website/app/pages/anuncios/\[slug\].vue` — must return empty
- **After every plan wave:** `yarn workspace website typecheck` — must exit 0
- **Before `/gsd-verify-work`:** Full suite + manual smoke test on running dev server
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 093-01-01 | 01 | 1 | STRP-01 | unit (TDD RED) | `yarn workspace strapi test --testPathPattern=ad.findBySlug` | ❌ W0 | ⬜ pending |
| 093-01-02 | 01 | 1 | STRP-01 | unit (TDD GREEN) | `yarn workspace strapi test --testPathPattern=ad.findBySlug` | ✅ (from W0) | ⬜ pending |
| 093-02-01 | 02 | 1 | PREV-01, PREV-02, PREV-03, PREV-04 | code review + typecheck | `grep -n "watchEffect\|showError\|getErrorMessage" apps/website/app/pages/anuncios/\[slug\].vue && yarn workspace website typecheck` | ✅ | ⬜ pending |
| 093-02-02 | 02 | 1 | PREV-01, PREV-02 | typecheck | `yarn workspace website typecheck` | ✅ | ⬜ pending |
| 093-02-03 | 02 | 1 | PREV-01, PREV-02 | manual smoke test | Visit `http://localhost:3000/anuncios/slug-that-does-not-exist` — must return 404, not 500 | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/src/api/ad/controllers/__tests__/ad.findBySlug.test.ts` — Jest test scaffold covering: null→notFound, throw→internalServerError, happy path manager, happy path public (STRP-01)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Non-existent slug returns 404 page (not 500) | PREV-01, PREV-02 | Requires full Nuxt SSR server + real HTTP response; cannot be unit-tested without complete rendering stack | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/anuncios/slug-that-does-not-exist` must return `404`. Also verify browser shows Nuxt error page, not blank/crash |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (093-01-01 creates the test file)
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

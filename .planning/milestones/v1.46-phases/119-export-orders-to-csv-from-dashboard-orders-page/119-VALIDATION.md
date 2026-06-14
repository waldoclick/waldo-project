---
phase: 119
slug: export-orders-to-csv-from-dashboard-orders-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 119 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @nuxt/test-utils (dashboard), Jest (strapi) |
| **Config file** | `apps/dashboard/vitest.config.ts`, `apps/strapi/jest.config.ts` |
| **Quick run command** | `cd apps/dashboard && yarn test` |
| **Full suite command** | `yarn turbo test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/dashboard && yarn test`
- **After every plan wave:** Run `yarn turbo test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 119-01-01 | 01 | 1 | CSV-export | unit | `cd apps/strapi && yarn test tests/api/order/order.export.test.ts` | No W0 | pending |
| 119-01-02 | 01 | 1 | CSV-export | unit | `cd apps/dashboard && yarn test tests/utils/csv.test.ts` | No W0 | pending |
| 119-02-01 | 02 | 2 | CSV-download | manual | See manual table | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/tests/api/order/order.export.test.ts` — stubs for Strapi exportCsv controller action
- [ ] `apps/dashboard/tests/utils/csv.test.ts` — stubs for CSV formatting utility

*Existing infrastructure (vitest, Jest) covers both apps — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CSV file downloads in browser | CSV-download | Requires real browser interaction with Blob URL | Click "Export CSV" button on dashboard orders page; verify file downloads with correct name and content |
| Strapi permission grant | CSV-permission | Strapi admin UI action | Settings > Roles > Authenticated > Orders > find `exportCsv` and enable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

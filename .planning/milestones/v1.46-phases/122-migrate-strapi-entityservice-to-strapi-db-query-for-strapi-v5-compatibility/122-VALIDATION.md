---
phase: 122
slug: migrate-strapi-entityservice-to-strapi-db-query-for-strapi-v5-compatibility
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-09
---

# Phase 122 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + ts-jest |
| **Config file** | `apps/strapi/jest.config.js` |
| **Quick run command** | `cd apps/strapi && npx tsc --noEmit` |
| **Full suite command** | `cd apps/strapi && yarn test --no-coverage` |
| **Estimated runtime** | ~30 seconds (tsc), ~60 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/strapi && npx tsc --noEmit`
- **After every plan wave:** Run `cd apps/strapi && yarn test --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green + zero `entityService` grep hits
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 122-01-01 | 01 | 1 | MIG-01 | TypeScript compile | `cd apps/strapi && npx tsc --noEmit` | ✅ | ⬜ pending |
| 122-01-02 | 01 | 1 | MIG-01 | TypeScript compile | `cd apps/strapi && npx tsc --noEmit` | ✅ | ⬜ pending |
| 122-02-01 | 02 | 1 | MIG-01 | TypeScript compile | `cd apps/strapi && npx tsc --noEmit` | ✅ | ⬜ pending |
| 122-02-02 | 02 | 1 | MIG-01 | TypeScript compile | `cd apps/strapi && npx tsc --noEmit` | ✅ | ⬜ pending |
| 122-03-01 | 03 | 1 | MIG-02 | unit | `cd apps/strapi && yarn jest tests/cron/ --no-coverage` | ✅ | ⬜ pending |
| 122-03-02 | 03 | 1 | MIG-02 | unit | `cd apps/strapi && yarn jest tests/cron/ --no-coverage` | ✅ | ⬜ pending |
| 122-04-01 | 04 | 2 | MIG-03 | unit | `cd apps/strapi && yarn test --no-coverage` | ✅ | ⬜ pending |
| 122-04-02 | 04 | 2 | MIG-04 | grep audit | `grep -r "entityService" apps/strapi/src/` | manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed.

- `apps/strapi/tests/cron/subscription-charge.cron.test.ts` — exists, will be updated in Plan 04 to use `strapi.db.query` mock pattern
- `apps/strapi/jest.config.js` — exists
- TypeScript compiler (`npx tsc --noEmit`) — always available

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Zero entityService references | MIG-04 | grep audit, not a test | Run `grep -r "entityService" apps/strapi/src/` — must return no output |

---
phase: 5
slug: audit-log-for-every-crud-operation-in-strapi
status: active
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-01
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (per CLAUDE.md — Strapi app uses Jest, AAA pattern, mocks external dependencies) |
| **Config file** | `apps/strapi/jest.config.js` (confirm exact test script name in `apps/strapi/package.json` at Wave 0 before running) |
| **Quick run command** | `pnpm --filter waldo-strapi test -- audit-log` |
| **Full suite command** | `pnpm --filter waldo-strapi test` |
| **Estimated runtime** | ~10 seconds (single new test file, mocked dependencies, no DB/network) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter waldo-strapi test -- audit-log`
- **After every plan wave:** Run `pnpm --filter waldo-strapi test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

*Rows are indexed by test behavior. 05-03 Task 1 covers the shared `logAudit` helper (level-preservation); 05-03 Tasks 2 (RED) / 3 (GREEN) cover the reworked subscriber, both gating on the same `audit-log.subscriber.test.ts` suite. 05-04/05/06 gate on regression (no new Jest/tsc failures) plus their own diff-scope checks.*

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-03-01 | 03 | 1 | `logAuditInfo`/`logAuditWarn`/`logAuditError` preserve their level (never collapsed to info) and enforce the `{ actor, actor_type, data }` envelope, defaulting `data` to `{}` | unit | `pnpm --filter waldo-strapi test -- utils/audit-log` | ✅ | ✅ green |
| 05-03-02/03 | 03 | 1 | afterCreate calls `logAuditInfo` with correct action/uid/actor (admin) via the `logAudit` helper (not `strapi.db.query`) | unit | `pnpm --filter waldo-strapi test -- audit-log.subscriber` | ✅ | ✅ green |
| 05-03-02/03 | 03 | 1 | afterUpdate/afterDelete call `logAuditInfo` with record_id/record_document_id from event.result (not params.where) | unit | `pnpm --filter waldo-strapi test -- audit-log.subscriber` | ✅ | ✅ green |
| 05-03-02/03 | 03 | 1 | Writes with no request context tagged actor="system"/actor_type="system" | unit | `pnpm --filter waldo-strapi test -- audit-log.subscriber` | ✅ | ✅ green |
| 05-03-02/03 | 03 | 1 | A thrown error inside `logAuditInfo` does not propagate to the caller (log-and-swallow) | unit | `pnpm --filter waldo-strapi test -- audit-log.subscriber` | ✅ | ✅ green |
| 05-04-* | 04 | 1 | Payment/ad logger calls reshaped to the `logAudit` envelope, level and message preserved; no NEW Jest/tsc failures vs the 05-01 baseline | regression + diff-scope | `cd apps/strapi && npx jest --maxWorkers=2` + `npx tsc --noEmit` | n/a | ⬜ pending |
| 05-05-* | 05 | 1 | Payment/ad logger calls reshaped to the `logAudit` envelope, level and message preserved; no NEW Jest/tsc failures vs the 05-01 baseline | regression + diff-scope | `cd apps/strapi && npx jest --maxWorkers=2` + `npx tsc --noEmit` | n/a | ⬜ pending |
| 05-06-* | 06 | 1 | Payment/ad logger calls reshaped to the `logAudit` envelope, level and message preserved; no NEW Jest/tsc failures vs the 05-01 baseline | regression + diff-scope | `cd apps/strapi && npx jest --maxWorkers=2` + `npx tsc --noEmit` | n/a | ⬜ pending |
| 05-02-01 | 02 | 3 | Log-file/Better Stack read-path visibility, actor tagging, homologated payment envelope, business writes unaffected — end-to-end | manual | n/a — human checkpoint | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/strapi/tests/utils/audit-log/index.test.ts` — covers the shared `logAuditInfo`/`logAuditWarn`/`logAuditError` helper (level preservation, `{ actor, actor_type, data }` envelope, `data` default to `{}`)
- [x] `apps/strapi/tests/subscribers/audit-log.subscriber.test.ts` — reworked to mock the `logAudit` helper (`src/utils/audit-log`), NOT `strapi.db.query`; covers action/uid/actor mapping (admin, users-permissions, system), `event.result`-sourced ids, and log-and-swallow on a thrown `logAuditInfo` call
- [x] Confirmed Jest test script/package name in `apps/strapi/package.json`: package `waldo-strapi`, script `"test": "jest"` — quick-run command above updated accordingly

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| Audit lines appear in the local rotating log file / Better Stack; the removed `Audit Log` collection-type no longer exists anywhere in the Strapi admin Content Manager (its presence would now be a DEFECT — the DB table was removed in 05-03) | Phase goal — storage-mechanism PIVOT (05-CONTEXT.md) | Requires a running Strapi instance; log tailing is not mockable in Jest | Start Strapi, then `tail -f apps/strapi/logs/app-*.log \| grep -E "Audit (create\|update\|delete):"`. Separately, log into `/admin` Content Manager and confirm it has no such collection-type entry |
| End-to-end: a real create/update/delete on an existing content-type (e.g. `term`) produces a correctly actor-tagged audit log line, and does not break the original write | Phase goal — full integration correctness | Requires the running app, real request context, real DB — beyond what a mocked unit test proves | Perform a create/update/delete via dashboard or Postman against an existing content-type, then confirm the corresponding `Audit <action>: <uid>` line in the local log file / Better Stack with correct `actor_type`/`actor`/`data` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

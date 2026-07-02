---
phase: 5
slug: audit-log-for-every-crud-operation-in-strapi
status: draft
nyquist_compliant: true
wave_0_complete: false
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

*Rows are indexed by test behavior (all proven by the same `audit-log.subscriber.test.ts` suite), not one row per task — Task 1 (schema creation) is verified structurally by its own `<automated>` schema-shape check, and Tasks 2 (RED) / 3 (GREEN) both gate on the 5 behaviors below via the same test file.*

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-02 | 01 | 1 | afterCreate writes audit row with correct action/uid/actor (admin) | unit | `pnpm --filter waldo-strapi test -- audit-log` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | afterUpdate/afterDelete write audit rows with record_id/record_document_id from event.result | unit | `pnpm --filter waldo-strapi test -- audit-log` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | Writes with no request context tagged actor_type "system" | unit | `pnpm --filter waldo-strapi test -- audit-log` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | Writes to the audit-log content-type itself are skipped (no recursion) | unit | `pnpm --filter waldo-strapi test -- audit-log` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | A thrown error inside the audit write does not propagate to the caller | unit | `pnpm --filter waldo-strapi test -- audit-log` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | Content Manager visibility, actor tagging, no recursion, business writes unaffected — end-to-end | manual | n/a — human checkpoint | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/tests/subscribers/audit-log.subscriber.test.ts` — covers all 5 unit behaviors in the table above, mocking `strapi.db.query`, `strapi.requestContext.get`, and `strapi.log.error`, following the existing `apps/strapi/tests/cron/subscription-charge.cron.test.ts` mock pattern
- [x] Confirmed Jest test script/package name in `apps/strapi/package.json`: package `waldo-strapi`, script `"test": "jest"` — quick-run command above updated accordingly

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| New `audit-log` content-type appears in Strapi admin Content Manager without extra permission wiring | Phase goal — "read via Content Manager" (05-CONTEXT.md) | Requires a running Strapi instance + logged-in admin session; not mockable in Jest | Log into `/admin`, open Content Manager, confirm `Audit Log` collection-type is listed and its entries are viewable |
| End-to-end: a real create/update/delete on an existing content-type (e.g. `term`) produces a correctly actor-tagged audit row, and does not break the original write | Phase goal — full integration correctness | Requires the running app, real request context, real DB — beyond what a mocked unit test proves | Perform a create/update/delete via dashboard or Postman against an existing content-type, then check the corresponding `audit-log` row in Content Manager for correct `actor_type`/`actor_id`/`action`/`content_type_uid`/`record_id` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

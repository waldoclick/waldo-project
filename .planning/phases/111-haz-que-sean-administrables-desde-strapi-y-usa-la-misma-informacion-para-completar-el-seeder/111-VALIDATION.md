---
phase: 111
slug: haz-que-sean-administrables-desde-strapi-y-usa-la-misma-informacion-para-completar-el-seeder
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-04
---

# Phase 111 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x (website) |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace @waldo/website test --run` |
| **Full suite command** | `yarn workspace @waldo/website test --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace @waldo/website test --run`
- **After every plan wave:** Run `yarn workspace @waldo/website test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 111-01-01 | 01 | 1 | POL-01 | manual | `grep "collectionType" apps/strapi/src/api/policy/content-types/policy/schema.json` | N/A | ⬜ pending |
| 111-01-02 | 01 | 1 | POL-02, POL-03 | manual | `grep -c "order:" apps/strapi/seeders/policies.ts` returns 16 | N/A | ⬜ pending |
| 111-01-03 | 01 | 1 | POL-07 | manual | `curl http://localhost:1337/api/policies` returns 200 | N/A | ⬜ pending |
| 111-02-01 | 02 | 2 | POL-04, POL-05, POL-06 | unit (Wave 0) | `yarn workspace @waldo/website test --run` | ❌ W0 | ⬜ pending |
| 111-02-02 | 02 | 2 | POL-04, POL-05 | unit | `yarn workspace @waldo/website test --run tests/stores/policies.store.test.ts` | ❌ W0 | ⬜ pending |
| 111-02-03 | 02 | 2 | POL-06 | unit | `yarn workspace @waldo/website test --run tests/components/PoliciesDefault.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/website/tests/stores/policies.store.test.ts` — stubs for POL-04 (store fetches from /api/policies), POL-05 (cache guard prevents double fetch within TTL)
- [ ] `apps/website/tests/components/PoliciesDefault.test.ts` — stubs for POL-06 (component renders prop data via AccordionDefault)

*Wave 0 is Task 1 of Plan 111-02. Tests are created in RED state before production code.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Policy content type has correct schema in Strapi admin | POL-01 | Requires running Strapi instance | Start Strapi, verify Policy collection type appears with title, text, order fields |
| Seeder creates 16 records on first boot | POL-02 | Requires running Strapi with database | Run with `APP_RUN_SEEDERS=true`, count records in admin |
| Seeder is idempotent (no duplicates on second run) | POL-03 | Requires running Strapi with database | Run seeder twice, verify count stays at 16 |
| Public role has find permission on policies endpoint | POL-07 | Requires Strapi admin UI interaction | Enable find/findOne in Settings -> Users & Permissions -> Roles -> Public -> Policy, then `curl http://localhost:1337/api/policies` returns 200 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

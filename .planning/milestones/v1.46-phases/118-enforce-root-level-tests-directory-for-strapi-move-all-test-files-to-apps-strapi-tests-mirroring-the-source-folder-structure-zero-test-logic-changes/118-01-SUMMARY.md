---
phase: 118-enforce-root-level-tests-directory-for-strapi
plan: 01
subsystem: strapi
tags: [testing, structure, jest, file-organization]
dependency_graph:
  requires: []
  provides: [STRUCT-118-STRAPI]
  affects: [apps/strapi/jest.config.js, apps/strapi/tests/]
tech_stack:
  added: []
  patterns: [root-level tests directory mirroring src/ structure]
key_files:
  created:
    - apps/strapi/tests/api/ad/controllers/ad.findBySlug.test.ts
    - apps/strapi/tests/api/ad/services/ad.approve.zoho.test.ts
    - apps/strapi/tests/api/ad/services/ad.compute-status.test.ts
    - apps/strapi/tests/api/ad/services/ad.sort-priority.test.ts
    - apps/strapi/tests/api/article/content-types/article/article.lifecycles.test.ts
    - apps/strapi/tests/api/auth-one-tap/controllers/auth-one-tap.test.ts
    - apps/strapi/tests/api/payment/controllers/payment.test.ts
    - apps/strapi/tests/api/payment/services/ad.service.test.ts
    - apps/strapi/tests/api/payment/services/ad.zoho.test.ts
    - apps/strapi/tests/api/payment/services/pack.service.test.ts
    - apps/strapi/tests/api/payment/services/pack.zoho.test.ts
    - apps/strapi/tests/api/payment/services/pro-cancellation.service.test.ts
    - apps/strapi/tests/api/payment/general.utils.test.ts
    - apps/strapi/tests/cron/subscription-charge.cron.test.ts
    - apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts
    - apps/strapi/tests/extensions/users-permissions/controllers/userController.test.ts
    - apps/strapi/tests/middlewares/protect-user-fields.test.ts
    - apps/strapi/tests/services/facto/facto.test.ts
    - apps/strapi/tests/services/flow/flow.test.ts
    - apps/strapi/tests/services/google-one-tap/google-one-tap.service.test.ts
    - apps/strapi/tests/services/indicador/indicador.test.ts
    - apps/strapi/tests/services/oneclick/oneclick.service.test.ts
    - apps/strapi/tests/services/payment-gateway/gateway.test.ts
    - apps/strapi/tests/services/tavily/tavily.test.ts
    - apps/strapi/tests/services/weather/weather.test.ts
    - apps/strapi/tests/services/zoho/http-client.test.ts
    - apps/strapi/tests/services/zoho/zoho.test.ts
  modified:
    - apps/strapi/jest.config.js
decisions:
  - "Jest roots changed from src/ to tests/ — single change required to scope Jest's file discovery to the new centralized test directory"
  - "Used git mv for all 27 files to preserve rename history in git log"
  - "Extended import rewrites to all 27 files, not just the 13 api/ files listed in the plan — all files had broken imports after the move"
metrics:
  duration: "6m"
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_changed: 29
---

# Phase 118 Plan 01: Enforce Root-Level Tests Directory for Strapi — Summary

**One-liner:** Lifted all 27 Strapi test files from src/ subdirectory tests/ dirs into a root-level apps/strapi/tests/ directory mirroring the source tree, updating Jest config and all import paths across all 27 test files.

## What Was Built

Enforced the Mandatory Testing Directory Rule for Strapi by relocating all 27 test files from scattered `src/**/tests/` subdirectories into a single root-level `apps/strapi/tests/` directory. The new structure mirrors `src/` exactly: `tests/api/`, `tests/cron/`, `tests/extensions/`, `tests/middlewares/`, `tests/services/`.

## Tasks Completed

| # | Name | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Update Jest config and git mv all 27 test files | f1278781 | jest.config.js, 27 test files via git mv |
| 2 | Rewrite relative imports in 13 api/ test files | 9dd8e64e | 13 api/ test files with corrected paths |
| Auto-fix | Rewrite imports in remaining 14 non-api test files | 6f865124 | 14 test files: cron, extensions, middlewares, services |

## Verification Results

- `find apps/strapi/tests -name "*.test.ts" | wc -l` = **27** (pass)
- `find apps/strapi/src -name "*.test.ts" | wc -l` = **0** (pass)
- `grep '"<rootDir>/tests"' apps/strapi/jest.config.js` = matches (pass)
- `grep -rn 'from "\.\.\/' tests/ | grep -v '/src/'` = 0 matches across all 27 files (pass)
- `grep -rn 'jest\.mock("\.\.' tests/ | grep -v '/src/'` = 0 matches across all 27 files (pass)

## Technical Notes

### Import Rewrite Rule

From the old location (`src/api/payment/services/tests/`), 4 `../` hops reached `src/`. From the new location (`tests/api/payment/services/`), 4 `../` hops reach `apps/strapi/`. Therefore every import that previously used `../../../../services/x` now becomes `../../../../src/services/x` — same hop count, but `src/` must be inserted.

The `__dirname` path in `weather.test.ts` also required updating: the dotenv `.env` path changed from `../../../../.env` (4 hops from `src/services/weather/tests/`) to `../../../.env` (3 hops from `tests/services/weather/`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed broken imports in 14 non-api test files**
- **Found during:** Post-Task 2 verification
- **Issue:** Plan Task 2 only scoped the 13 api/ test files for import rewrites, but all 14 remaining test files (cron, extensions, middlewares, services) also had relative imports that broke after the git mv. Every `../` import that previously resolved to a sibling source module now resolves to a non-existent path under `tests/`.
- **Fix:** Applied same depth-based import rewrite rule to all 14 files: cron (depth 2), middlewares (depth 2), services/* (depth 3), extensions/*/controllers (depth 4). Also corrected `__dirname`-relative `.env` path in weather.test.ts.
- **Files modified:** 14 test files under tests/cron/, tests/extensions/, tests/middlewares/, tests/services/
- **Commit:** 6f865124

## Known Stubs

None — this plan is a pure structural move with import rewrites. No data flow or UI logic changed.

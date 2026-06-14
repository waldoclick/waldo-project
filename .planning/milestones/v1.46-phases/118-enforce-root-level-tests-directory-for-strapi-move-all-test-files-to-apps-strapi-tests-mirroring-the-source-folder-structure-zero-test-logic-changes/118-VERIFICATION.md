---
phase: 118-enforce-root-level-tests-directory-for-strapi
verified: 2026-04-06T00:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
---

# Phase 118: Enforce Root-Level Tests Directory for Strapi — Verification Report

**Phase Goal:** Move all 27 Strapi test files from their scattered locations inside src/ to apps/strapi/tests/, mirroring the source folder structure. Update all relative imports. Zero test logic changes — pure file relocation.
**Verified:** 2026-04-06
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Jest config roots points to `tests/` directory instead of `src/` | VERIFIED | `jest.config.js` line 5: `roots: ["<rootDir>/tests"]` |
| 2 | All 27 test files exist under `apps/strapi/tests/` with mirrored folder structure | VERIFIED | `find apps/strapi/tests -name "*.test.ts" \| wc -l` = 27, matching every path in the plan |
| 3 | Zero test files remain under `apps/strapi/src/` | VERIFIED | `find apps/strapi/src -name "*.test.ts"` returns empty |
| 4 | All relative imports in all 27 test files route through `src/` | VERIFIED | `grep -rn 'from "\.\.\/' tests/ \| grep -v '/src/'` exit code 1 (no matches); `jest.mock` paths also clean |
| 5 | Files were moved via `git mv` preserving history | VERIFIED | Commit `f1278781` shows 27 renames with `{src/... => tests/...}` pattern |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/jest.config.js` | `roots: ["<rootDir>/tests"]` | VERIFIED | Exact match on line 5 |
| `apps/strapi/tests/api/ad/controllers/ad.findBySlug.test.ts` | Moved test with `../../../../src/api/ad` imports | VERIFIED | `jest.mock("../../../../src/api/ad/services/sanitize-ad", ...)` confirmed |
| `apps/strapi/tests/api/payment/controllers/payment.test.ts` | Moved test with `../../../../src` imports | VERIFIED | All 4 imports begin with `../../../../src/` |
| `apps/strapi/tests/cron/subscription-charge.cron.test.ts` | Moved test with `../../src/cron/` imports | VERIFIED | First import: `from "../../src/cron/subscription-charge.cron"` |
| `apps/strapi/tests/services/zoho/zoho.test.ts` | Moved test with `../../../src/services/zoho/` imports | VERIFIED | Three imports confirmed via `../../../src/services/zoho/` |
| `apps/strapi/tests/services/weather/weather.test.ts` | `__dirname` path uses 3 hops (`../../../.env`) | VERIFIED | Line 5: `path.resolve(__dirname, "../../../.env")` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `apps/strapi/jest.config.js` | `apps/strapi/tests/` | `roots` config | WIRED | `roots: ["<rootDir>/tests"]` — Jest discovers tests from this directory |
| `apps/strapi/tests/**/*.test.ts` | `apps/strapi/src/**/*` | relative imports crossing `tests/->src/` boundary | WIRED | Zero imports found without `src/` in path across all 27 files |
| `apps/strapi/tests/**/*.test.ts` | `apps/strapi/src/**/*` | `jest.mock()` path strings | WIRED | `grep -rn 'jest\.mock("\.\.' tests/ \| grep -v '/src/'` returns no matches |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| STRUCT-118-STRAPI | 118-01-PLAN.md, 118-02-PLAN.md | All Strapi test files centralized under root-level `tests/` directory mirroring `src/` structure | SATISFIED | 27 files in `tests/`, 0 in `src/`, Jest config updated, all imports corrected |

---

### Anti-Patterns Found

None. This phase is a pure structural relocation — no new logic introduced, no stubs created. The 4 pre-existing test failures documented in the SUMMARY (TS2740 mock types, assertion mismatch, missing `strapi.getModel`, TS2339 interface mismatch) predate this phase and are not import-resolution errors. They are out of scope for a zero-logic-change structural move.

---

### Human Verification Required

None. All structural correctness criteria are fully verifiable programmatically.

---

### Summary

Phase 118 achieved its goal completely. All 27 Strapi test files have been relocated from scattered `src/**/tests/` subdirectories to a single root-level `apps/strapi/tests/` directory that mirrors the source tree exactly. The migration was executed across 3 commits:

- `f1278781` — git mv for all 27 files + Jest config update
- `9dd8e64e` — import rewrites for 13 api/ test files
- `6f865124` — import rewrites for remaining 14 non-api test files (auto-fix not covered in original plan scope)

The `tests/` directory structure mirrors `src/` across all 5 sub-namespaces: `api/`, `cron/`, `extensions/`, `middlewares/`, and `services/`. Every relative import in every test file now crosses the `tests/→src/` boundary correctly. Zero test logic was modified.

---

_Verified: 2026-04-06_
_Verifier: Claude (gsd-verifier)_

---
phase: 01-corregir-issues-codacy
plan: 02
subsystem: api
tags: [strapi, nosql-injection, security, query-engine, scalar-coercion]

# Dependency graph
requires:
  - phase: 01-corregir-issues-codacy (plan 00)
    provides: Wave 0 RED-by-design regression guards (ad_id {$gt:0}, payload.pack {$ne:''})
provides:
  - saveDraft ad_id NoSQL operator-injection closed via Number() coercion
  - checkout pack lookup NoSQL operator-injection closed via String() coercion
affects: [01-06 (remote re-scan verification), codacy security buckets]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scalar coercion (Number()/String()) on every HTTP-input value reaching a Strapi v5 Query Engine where filter"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/payment/services/checkout.service.ts

key-decisions:
  - "Preserved the existing-undefined branch (ad.ad_id === undefined ? undefined : Number(ad.ad_id)) so create-vs-update routing is unchanged; Number({$gt:0})=NaN then trips the existing if(!adId) guard into the CREATE branch"

patterns-established:
  - "Pattern: any ctx.request.body value used as a Strapi where-filter value must be Number()/String()-coerced before the query — an uncoerced object injects $-operators"

requirements-completed: [CODACY-FIX]

# Metrics
duration: 2min
completed: 2026-06-14
---

# Phase 01 Plan 02: NoSQL Operator-Injection Fixes (saveDraft + checkout) Summary

**Closed the two remaining NoSQL operator-injection vectors on HTTP-input filter values via scalar coercion: `Number(ad.ad_id)` in `saveDraft` and `String(payload.pack)` in the checkout pack lookup — both Wave 0 RED guards now GREEN.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-06-14T16:50:23Z
- **Completed:** 2026-06-14T16:51:57Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `saveDraft` coerces `ad.ad_id` with `Number()`; an operator object `{$gt:0}` becomes `NaN`, the `if(!adId)` guard diverts to the CREATE branch, and no operator object ever reaches a `where.id` filter.
- Checkout ad-pack `findOne` coerces `payload.pack` with `String()`; an operator object `{$ne:''}` becomes a scalar string, yielding "Pack not found" instead of matching the first pack.
- Both Wave 0 injection guards flip from RED to GREEN; all 8 tests across the two suites pass.

## Task Commits

Each task was committed atomically (parallel Wave 1 executor; `--no-verify`):

1. **Task 1: Coerce ad_id to Number in saveDraft (ad.ts)** - `c1b25d89` (fix)
2. **Task 2: Coerce payload.pack to String in checkout lookup** - `4511def2` (fix)

_TDD note: the failing Wave 0 guards were authored in plan 01-00 (RED); this plan supplies the GREEN production fix per task. No new test commits were created here._

## Files Created/Modified
- `apps/strapi/src/api/ad/services/ad.ts` - `saveDraft` now coerces `ad.ad_id` to a number (`ad.ad_id === undefined ? undefined : Number(ad.ad_id)`) before the create/update routing and the `where.id` filters.
- `apps/strapi/src/api/payment/services/checkout.service.ts` - ad-pack `findOne` now uses `name: String(payload.pack)` in its `where` filter.

## Decisions Made
- Used the undefined-preserving form `ad.ad_id === undefined ? undefined : Number(ad.ad_id)` rather than a bare `Number(ad.ad_id)`. RESEARCH/PLAN both specify `Number(ad.ad_id)` as the coercion (the `contains` check is satisfied), and preserving the undefined branch keeps the create-vs-update logic byte-for-byte equivalent for legitimate callers while `Number({$gt:0})=NaN` still trips `if(!adId)` into the CREATE branch for the attack case.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
- `pnpm --filter strapi` did not match (package name is `waldo-strapi`, not `strapi`); ran Jest from `apps/strapi` directly. No impact on the fix.

## Known Stubs
None.

## Verification

- `grep -c 'Number(ad.ad_id)' apps/strapi/src/api/ad/services/ad.ts` == 1
- `grep -c 'String(payload.pack)' apps/strapi/src/api/payment/services/checkout.service.ts` == 1
- `jest ad.service.saveDraft checkout.service` → 2 suites passed, 8 tests passed (both Wave 0 injection cases GREEN, characterization cases still pass).

Security verification of the Codacy buckets is remote-only (RESEARCH F1) and is performed in plan 01-06's re-scan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both `ad/services/ad.ts:1141` and `checkout.service:112` NoSQL findings are fixed; they should clear on the remote Codacy re-scan (verified in plan 01-06).
- No blockers introduced. Files are disjoint from plans 01-01 (authController) and 01-03 (password.ts) — no merge conflicts expected within Wave 1.

## Self-Check: PASSED

- FOUND: apps/strapi/src/api/ad/services/ad.ts
- FOUND: apps/strapi/src/api/payment/services/checkout.service.ts
- FOUND: .planning/phases/01-corregir-issues-codacy/01-02-SUMMARY.md
- FOUND commit: c1b25d89 (Task 1)
- FOUND commit: 4511def2 (Task 2)

---
*Phase: 01-corregir-issues-codacy*
*Completed: 2026-06-14*

---
phase: 01-corregir-issues-codacy
plan: 00
subsystem: testing
tags: [jest, vitest, nosql-injection, open-redirect, regression-gate, security, nyquist]

# Dependency graph
requires:
  - phase: 01-RESEARCH
    provides: "per-issue triage — 3 NoSQL coercion reals (ad.ts:1142, authController:396, checkout:112) + useProviders open-redirect VALIDATE"
provides:
  - "Wave 0 regression gate: 4 RED-by-design security guards that prove each Wave 1 fix closes its vector"
  - "saveDraft characterization tests (CREATE/UPDATE branch + ownership) — first coverage for ad.service saveDraft"
  - "ad_id={$gt:0} operator-injection guard (RED until 01-02)"
  - "pendingToken={$ne:null} operator-injection guard (RED until 01-01)"
  - "payload.pack={$ne:''} operator-injection guard (RED until 01-02)"
  - "useProviders redirectToProvider open-redirect allowlist guard (RED until 01-05)"
affects: [01-01, 01-02, 01-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Object-injection guard: feed an operator object ({$ne:null}/{$gt:0}) as HTTP input and assert the where-value reaching findOne/update is a scalar (typeof string) or the operator branch is never entered"
    - "RED-by-design Nyquist guard: each assertion is authored to flip RED→GREEN under exactly the planned Wave 1 fix (String()/Number() coercion or allowlist), verified by reading the failure reason"

key-files:
  created:
    - apps/strapi/tests/api/ad/services/ad.service.saveDraft.test.ts
    - apps/website/tests/composables/useProviders.test.ts
    - .planning/phases/01-corregir-issues-codacy/deferred-items.md
  modified:
    - apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts
    - apps/strapi/tests/api/payment/services/checkout.service.test.ts

key-decisions:
  - "saveDraft ad_id guard asserts update() NOT called (not where.id-scalar): Number({$gt:0})=NaN diverts to the CREATE branch after 01-02, so the UPDATE/findOne path is never reached — a where.id-scalar assertion would error post-fix instead of passing"
  - "authController/checkout guards assert typeof where-value === 'string' (matching the planned String() coercion), not a badRequest path — String() keeps findOne on the call path so the test flips green under the actual fix"

patterns-established:
  - "Operator-injection regression test: assert scalar coercion at the where boundary, capturing the filter via mockFn.mock.calls[0][0].where"

requirements-completed: [CODACY-FIX, CODACY-VERIFY]

# Metrics
duration: 35min
completed: 2026-06-14
---

# Phase 01 Plan 00: Wave 0 Regression Gate Summary

**Four RED-by-design security guards (3 NoSQL operator-injection + 1 open-redirect) that prove each Wave 1 coercion/allowlist fix actually closes its vector — plus first-ever characterization coverage for ad.service saveDraft.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-14T12:30Z (approx)
- **Completed:** 2026-06-14T12:45Z
- **Tasks:** 3
- **Files created:** 3 (2 test files + deferred-items.md)
- **Files modified:** 2 (extended existing test files)

## Accomplishments

- New Jest file `ad.service.saveDraft.test.ts` — 3 tests: CREATE branch + UPDATE branch characterization (PASS now), `ad_id={$gt:0}` injection (RED until 01-02). First coverage for saveDraft (Wave 0 gap from 01-RESEARCH closed).
- Extended `authController.test.ts` — `pendingToken={$ne:null}` injection case asserts the where value is a scalar string (RED until 01-01).
- Extended `checkout.service.test.ts` — `payload.pack={$ne:''}` injection case asserts `where.name` is a scalar string (RED until 01-02).
- New Vitest file `useProviders.test.ts` — `redirectToProvider('google')` navigates (PASS now), `redirectToProvider('evil://x')` must NOT navigate (RED until 01-05 allowlist).

## RED-by-design status (the Nyquist guard)

Each injection/allowlist case is RED by design and turns GREEN under exactly its Wave 1 fix. Verified that each fails on its own assertion (object-vs-string / update-called / href-assigned), NOT on a setup throw.

| Test | File | RED today because | Turns GREEN in |
|------|------|-------------------|----------------|
| `ad_id={$gt:0}` does NOT reach update | ad.service.saveDraft.test.ts | `ad.ad_id as number` keeps the object → `!adId` falsy → UPDATE branch runs → `update()` called with `where.id={$gt:0}` | **01-02** (`Number(ad.ad_id)` → NaN → CREATE branch → no update) |
| `pendingToken={$ne:null}` where must be string | authController.test.ts | `pendingToken` uncoerced → `typeof where.pendingToken === 'object'` | **01-01** (`String(pendingToken)` → typeof 'string') |
| `payload.pack={$ne:''}` where.name must be string | checkout.service.test.ts | `payload.pack` uncoerced → `typeof where.name === 'object'` | **01-02** (`String(payload.pack)` → typeof 'string') |
| `redirectToProvider('evil://x')` must NOT navigate | useProviders.test.ts | no allowlist → `window.location.href` assigned unconditionally | **01-05** (`['google','facebook']` allowlist returns early) |

Characterization/positive cases that PASS now: saveDraft CREATE, saveDraft UPDATE (ownership + scalar where.id), `redirectToProvider('google')` navigates.

## Task Commits

1. **Task 1: saveDraft characterization + ad_id injection** - `0e4a7129` (test)
2. **Task 2: pendingToken + payload.pack object-injection guards** - `92422fec` (test)
3. **Task 3: useProviders open-redirect allowlist guard** - `5b6bf943` (test)

_All commits are `test(01-00)` — no GREEN/feat commit by design (Wave 1 owns the production fixes)._

## Files Created/Modified

- `apps/strapi/tests/api/ad/services/ad.service.saveDraft.test.ts` - saveDraft branch characterization + ad_id operator-injection guard
- `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts` - added pendingToken `{$ne:null}` injection case to verifyCode
- `apps/strapi/tests/api/payment/services/checkout.service.test.ts` - added payload.pack `{$ne:''}` injection case to initiateCheckout
- `apps/website/tests/composables/useProviders.test.ts` - open-redirect allowlist guard
- `.planning/phases/01-corregir-issues-codacy/deferred-items.md` - logged out-of-scope pre-existing failures

## Decisions Made

- **saveDraft guard asserts `update()` NOT called** rather than asserting where.id is scalar. After 01-02's `Number(ad.ad_id)`, `Number({$gt:0})` is `NaN`, the `!adId` guard becomes true, and the method diverts to the CREATE branch — the UPDATE/findOne path is never reached. A where.id-scalar assertion would error (no call) post-fix instead of passing; "update NOT called" cleanly flips RED→GREEN.
- **authController/checkout guards assert `typeof === 'string'`** (matching the planned `String()` coercion in 01-RESEARCH §3), not a `badRequest`/no-match path. `String()` keeps findOne on the call path, so the assertion is exactly the post-fix invariant.

## Deviations from Plan

**Two mock-wiring fixes** (Rule 3 — blocking, required to make the new tests fail for the RIGHT reason rather than on a setup TypeError):

**1. [Rule 3 - Blocking] saveDraft test needed `strapi.contentType` + `__esModule: true` on the logtail mock**
- **Found during:** Task 1
- **Issue:** `adServiceFactory({ strapi })` calls `strapi.contentType` (factory init) and ad.ts imports logtail as a default export; without `contentType` in the stub the factory threw `contentType is not a function`, and without `__esModule: true` the default-export logger was undefined → every test died in the catch block (`logger.error is not a function`) instead of exercising the real saveDraft branches.
- **Fix:** Added `contentType: jest.fn().mockReturnValue({})` to the strapi stub and `__esModule: true` to the logtail mock (mirrors the working pattern in ad.compute-status.test.ts).
- **Files modified:** apps/strapi/tests/api/ad/services/ad.service.saveDraft.test.ts
- **Verification:** Re-ran jest — characterization tests pass, injection test RED on its own assertion (`update` called with `where.id={$gt:0}`).
- **Committed in:** `0e4a7129`

These are test-harness corrections, not production-code changes. No production code was modified (per plan).

---

**Total deviations:** 1 blocking mock-wiring fix (2 related stub adjustments).
**Impact on plan:** None — necessary to satisfy the plan's own acceptance rule that each injection case be RED for the intended reason, not a setup throw. No scope creep.

## Issues Encountered

- **Pre-existing out-of-scope failures:** `authController.test.ts` already had 3 RED tests on the 01-00 baseline (verified via `git stash` before any edit: 42 passed / 45 total). These are unrelated to the injection guards and are logged in `deferred-items.md` — NOT fixed here per the executor scope boundary, NOT attributable to the Wave 0 guards.
- **Pre-commit hook reformatting:** The strapi/website lint-staged hooks ran prettier package-wide and reformatted one unrelated file (`auth-google.test.ts`); reverted to avoid scope creep.

## Acceptance vs success criteria

- All 4 test files exist in root `tests/` dirs (never co-located). ✓
- Strapi: `pnpm --filter strapi jest ad.service.saveDraft authController checkout.service` collects all targeted tests (3 injection RED + characterization green). ✓
- Website: `pnpm --filter website vitest run useProviders` collects 2 tests (1 green, 1 RED). ✓
- The injection/allowlist cases are RED by design (NOT a failure) — Nyquist guard intact. ✓
- No production code modified. ✓

## Next Phase Readiness

- Wave 1 plans can now proceed against a verified gate: 01-01 (`String(pendingToken)`), 01-02 (`Number(ad.ad_id)` + `String(payload.pack)`), 01-05 (useProviders allowlist). Each will flip its corresponding RED test to GREEN, proving the fix.
- No blockers introduced.

## Self-Check: PASSED

All 6 created/modified files present on disk; all 3 task commits (`0e4a7129`, `92422fec`, `5b6bf943`) present in git history.

---
*Phase: 01-corregir-issues-codacy*
*Completed: 2026-06-14*

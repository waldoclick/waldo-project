---
phase: 01-corregir-issues-codacy
plan: 01
subsystem: api
tags: [strapi, nosql-injection, insecure-random, security, csprng, scalar-coercion]

# Dependency graph
requires:
  - phase: 01-corregir-issues-codacy (plan 00)
    provides: Wave 0 RED-by-design regression guard (pendingToken {$ne:null})
provides:
  - verifyCode pendingToken NoSQL operator-injection closed via String() coercion
  - reserved-username suffix uses server CSPRNG (crypto.randomBytes) instead of Math.random
affects: [01-06 (remote re-scan verification), codacy security buckets (nosqli + insecure-random)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scalar coercion (String()) on every HTTP-input value reaching a Strapi v5 Query Engine where filter"
    - "Server-side randomness via node crypto.randomBytes (CSPRNG), never Math.random"

key-files:
  created: []
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts

key-decisions:
  - "Reused the existing top-of-file `import crypto from \"crypto\"` for randomBytes instead of adding a separate `import { randomBytes } from \"node:crypto\"` — avoids a duplicate import and matches how the rest of the file (3 randomBytes uses) and the test's crypto mock already address it"
  - "No suffix shape-assertion update was needed: the registerUserAuth Math.random suffix has no test pinning its value; the only suffix-shaped assertions (\\d{5}) target the unrelated ensureUniqueUsername helper"

patterns-established:
  - "Pattern: any ctx.request.body value used as a Strapi where-filter value must be String()/Number()-coerced before the query — an uncoerced object injects $-operators"
  - "Pattern: server-side (Strapi Node) randomness uses crypto.randomBytes; client (browser) randomness uses crypto.getRandomValues (split applied across this phase, never cross-applied)"

requirements-completed: [CODACY-FIX]

# Metrics
duration: 4min
completed: 2026-06-14
---

# Phase 01 Plan 01: authController NoSQL + insecure-random Fixes Summary

**Closed the two genuine security reals in `authController.ts`: `String(pendingToken)` scalar coercion in `verifyCode` (NoSQL operator-injection) and `crypto.randomBytes` for the reserved-username collision suffix (insecure-random) — the Wave 0 pendingToken injection guard now GREEN.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-06-14
- **Completed:** 2026-06-14
- **Tasks:** 2
- **Files modified:** 1 (file owned end-to-end by this plan)

## Accomplishments
- `verifyCode` coerces `pendingToken` with `String()` before the verification-code `findOne` `where` filter; an operator object `{$ne:null}` becomes a scalar string and can no longer reach the Query Engine as a `$`-operator.
- The `registerUserAuth` reserved-username collision suffix now uses `crypto.randomBytes(3).toString("hex").slice(0,4)` (server CSPRNG) instead of `Math.random().toString(36).slice(2,6)`.
- Wave 0 pendingToken `{$ne:null}` injection guard flipped from RED to GREEN (39 passed, up from 38).

## Task Commits

Each task was committed atomically (parallel Wave 1 executor; `--no-verify`):

1. **Task 1: Coerce pendingToken to scalar in verifyCode** - `8e15ea4a` (fix)
2. **Task 2: Use crypto.randomBytes for username suffix** - `54e7649a` (fix)

_TDD note: the failing Wave 0 pendingToken guard was authored in plan 01-00 (RED); this plan supplies the GREEN production fix (Task 1). Task 2 is a straight refactor covered by the existing reserved-username path. No new test commits were created here._

## Files Created/Modified
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`
  - `verifyCode`: added `const tokenValue = String(pendingToken);` after the existing `if (!pendingToken || !normalizedCode)` badRequest guard, and changed the lookup to `findOne({ where: { pendingToken: tokenValue } })`.
  - `registerUserAuth`: replaced `const suffix = Math.random().toString(36).slice(2, 6);` with `const suffix = crypto.randomBytes(3).toString("hex").slice(0, 4);`.

## Decisions Made
- **Reused the existing `crypto` import.** The file already had `import crypto from "crypto";` at the top (with 3 existing `crypto.randomBytes` uses). Adding `import { randomBytes } from "node:crypto"` per the literal PLAN text would have introduced a redundant import; reusing `crypto.randomBytes` satisfies the `contains: "crypto.randomBytes"` / `pattern: "randomBytes"` must-haves, avoids an unused/duplicate import (CLAUDE.md ban), and matches the test's existing `jest.mock("crypto", ... randomBytes ...)` mock.
- **No suffix shape-assertion update needed** (PLAN §3 Group 2 caveat). Verified `authController.test.ts` does not globally stub `Math.random` nor pin the exact base36 suffix of `registerUserAuth`. The only `\d{5}`-shaped suffix assertions target `ensureUniqueUsername` (a different function with its own digit suffix), so no assertion was touched.

## Deviations from Plan
- **[Rule 3 - Blocking] Crypto import already present.** PLAN Task 2 said "Add `import { randomBytes } from \"node:crypto\";` (or reuse an existing crypto import if present)". The existing `import crypto from "crypto"` was present, so the reuse branch was taken — `crypto.randomBytes(...)` rather than a bare `randomBytes(...)`. No functional difference; avoids a duplicate import.

## Issues Encountered
- `pnpm --filter strapi jest authController` did not work: the package name is `waldo-strapi` (not `strapi`) and there is no `jest` script (test script is `jest` under `test`). Ran Jest directly from `apps/strapi` via `pnpm exec jest authController`. No impact on the fix.

## Deferred Issues
- 3 pre-existing baseline failures remain in `authController.test.ts` and are NOT in scope (already logged in `deferred-items.md`): `verifyCode › VSTEP-04 › returns full login response on correct code`, `verifyCode › VSTEP-04 › deletes the verification-code record after successful verification`, and `registerUserLocal › calls original registerController when both consent fields are true`. These were RED on the 01-00 baseline (4 failed before this plan; 3 after, the dropped one being the pendingToken guard this plan fixed). Not attributable to this plan's changes.

## Known Stubs
None.

## Verification

- `grep -c 'Math.random' apps/strapi/src/extensions/users-permissions/controllers/authController.ts` == 0
- `grep -c 'String(pendingToken)' apps/strapi/src/extensions/users-permissions/controllers/authController.ts` == 1
- `grep -c 'randomBytes' apps/strapi/src/extensions/users-permissions/controllers/authController.ts` == 3 (>= 1; includes 2 pre-existing crypto.randomBytes uses plus the new suffix)
- `pnpm exec jest authController` → 39 passed / 3 failed / 42 total. The pendingToken `{$ne:null}` injection guard is GREEN; the 3 failures are the documented pre-existing baseline (deferred-items.md), unrelated to this plan.

Security verification of the Codacy `nosqli` + `insecure-random` buckets is remote-only (RESEARCH F1) and is performed in plan 01-06's re-scan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `authController:396` (pendingToken nosqli) and `authController:290` (insecure-random suffix) are fixed; both should clear on the remote Codacy re-scan (verified in plan 01-06).
- File is disjoint from plans 01-02 (ad/checkout), 01-03 (password.ts), 01-05 (useProviders) — no merge conflicts expected within Wave 1.

## Self-Check: PASSED

- FOUND: apps/strapi/src/extensions/users-permissions/controllers/authController.ts
- FOUND commit 8e15ea4a (Task 1)
- FOUND commit 54e7649a (Task 2)

---
*Phase: 01-corregir-issues-codacy*
*Completed: 2026-06-14*

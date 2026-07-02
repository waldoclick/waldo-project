---
phase: 05-audit-log-for-every-crud-operation-in-strapi
plan: 06
subsystem: infra
tags: [strapi, audit-log, payments, ads, logger-homologation, typescript]

# Dependency graph
requires:
  - phase: 05-audit-log-for-every-crud-operation-in-strapi
    provides: "05-03 — shared logAuditInfo/logAuditWarn/logAuditError helper enforcing the { actor, actor_type, data } envelope"
provides:
  - "ad.ts (5 sites), checkout.service.ts (5 sites), free-ad.service.ts (1 site) — all 11 remaining raw logger calls reshaped to logAudit"
affects: ["05-02"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Number(userId) cast at logAudit call sites where the local function parameter is typed string but AuditMeta.actor requires number | \"system\" — same cast pattern used across ad.ts and checkout.service.ts"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/payment/services/checkout.service.ts
    - apps/strapi/src/api/payment/services/free-ad.service.ts

key-decisions:
  - "actor: Number(userId) cast added at every ad.ts and checkout.service.ts call site where userId is in scope — the shared AuditMeta.actor type is number | \"system\", but local userId params in both files are typed string; the plan's interface block only showed the field names, not this type mismatch, so the cast was added as a Rule-3 blocking-issue auto-fix (mechanical, no logic change)"
  - "Both checkout.service.ts order-record-creation-failure catch blocks (line ~285 'Failed to create order record for checkout (paid pack)' and line ~487 'Failed to create order record for checkout') use actor: \"system\" per the plan's explicit, thrice-stated per-site instruction and acceptance criterion — even though userId is technically in scope at both sites (parsed from buy_order earlier in processWebpayReturn). The plan's stated rationale (\"no userId in scope\") is factually imprecise for this function, but the actor choice itself is an audit-log metadata decision with zero effect on order identity, redirects, or amounts, so the explicit instruction was honored rather than the general truth. Flagged here for the downstream verifier/planner."
  - "The 5th checkout.service.ts logger site ('Failed to create order record for checkout (paid pack)', line ~285) was not individually named in the plan's per-site actor list (which enumerated 3 named sites for a 5-total file) — treated identically to its sibling order-creation-failure site (same failure type, same actor: system) to keep the total count at 1 info / 4 error as specified"

patterns-established: []

requirements-completed: []

# Metrics
duration: 25min
completed: 2026-07-02
---

# Phase 05 Plan 06: Reshape ad.ts, checkout.service.ts, free-ad.service.ts Logger Calls to logAudit Summary

**Reshaped the last 11 raw `logger.info/error` call sites across `ad.ts` (5), `checkout.service.ts` (5), and `free-ad.service.ts` (1) into the shared `logAuditInfo`/`logAuditError` helper's `{ actor, actor_type, data }` envelope — zero business-logic, control-flow, amount, or order-identity changes, verified by a mechanical diff gate.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-07-02T17:23:00Z (approx, session start)
- **Completed:** 2026-07-02T17:48:34Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `ad.ts`: all 5 logger calls (3 info, 2 error — draft-creation/update/error + Zoho ad-approval not-found/sync-failed) converted to `logAuditInfo`/`logAuditError`, `actor: Number(userId)` with `actor_type: "plugin::users-permissions.user"` at every site (userId in scope throughout, including the Zoho approval closure which captures it from `approveAd(adId, userId)`)
- `checkout.service.ts`: all 5 logger calls (1 info, 4 error) converted — Facto document success/error and Zoho sync-failure sites use `actor: Number(userId)` (parsed from `buy_order` at the top of `processWebpayReturn`); both order-record-creation-failure catch blocks use `actor: "system"` per the plan's explicit instruction
- `free-ad.service.ts`: the 1 error-level "Error sending free ad creation emails" site converted to `logAuditError` with `actor: "system"` — error-only file, no `logAuditInfo`/`logAuditWarn` import added
- Raw `import logger from "../../../utils/logtail"` removed from all three files after conversion
- `tsc --noEmit` clean for all three target files (pre-existing `payment.ts` errors confirmed to originate from a concurrent parallel-agent plan, not this plan's changes)
- Mechanical no-logic-change diff gate (the `uniq -u` collapse + forbidden-pattern grep from the plan's acceptance criteria) returns zero output for all three files, proving the diffs are logger-call-site-only

## Task Commits

Each task was committed atomically:

1. **Task 1: Reshape the 5 logger call sites in ad.ts to logAudit** - `1680f967` (refactor)
2. **Task 2: Reshape the 5 (checkout.service.ts) + 1 (free-ad.service.ts) logger call sites to logAudit** - `d064585f` (refactor)

## Files Created/Modified

- `apps/strapi/src/api/ad/services/ad.ts` - 5 logger calls (draft create/update/error, Zoho approval not-found/sync-failed) reshaped to `logAuditInfo`/`logAuditError`; raw logtail import removed
- `apps/strapi/src/api/payment/services/checkout.service.ts` - 5 logger calls (Facto success/error, both order-creation-failure sites, Zoho sync-failure) reshaped; raw logtail import removed
- `apps/strapi/src/api/payment/services/free-ad.service.ts` - 1 logger call (email-send error) reshaped to `logAuditError`; raw logtail import removed

## Decisions Made

See `key-decisions` in frontmatter. Two are consequential:

1. **`Number(userId)` cast** — the plan's interface block specified field names (`actor`, `actor_type`, `data`) but the shared `AuditMeta.actor` type from 05-03 is `number | "system"`, while every local `userId` parameter in `ad.ts`/`checkout.service.ts` is typed `string`. `tsc --noEmit` caught this immediately after the first mechanical pass. Applied `Number(userId)` at every site where `userId` is the actor — a type-conformance cast with no runtime-behavior implication beyond what the helper already expects (the 05-03 subscriber does the equivalent via `user?.id`, a number).
2. **`actor: "system"` on both checkout.service.ts order-creation-failure catch blocks** — consulted the advisor because the plan states "no userId in scope" for these sites but `userId` is actually parsed earlier in the same function (`processWebpayReturn`) and is in scope at both catch blocks. Per advisor guidance, honored the plan's explicit, repeated instruction and acceptance criterion (`actor: "system"`) rather than the general "use userId if in scope" rule, since this is an audit-log metadata choice with zero effect on payment correctness, order identity, or control flow — not a Payment Rules violation. Documented here for the downstream verifier since the plan's premise was inaccurate even though its instruction was followed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `Number(userId)` cast added at every user-scoped logAudit call site in ad.ts and checkout.service.ts**
- **Found during:** Task 1, confirmed again in Task 2
- **Issue:** `tsc --noEmit` reported `Type 'string' is not assignable to type 'number | "system"'` at all 5 ad.ts sites and the Facto/Zoho sites in checkout.service.ts — the shared `AuditMeta.actor` type (05-03) requires `number | "system"`, but local `userId` params in both files are `string`
- **Fix:** Wrapped `userId` in `Number(...)` at each `actor:` field — mechanical type-conformance cast, no logic/behavior change
- **Files modified:** apps/strapi/src/api/ad/services/ad.ts, apps/strapi/src/api/payment/services/checkout.service.ts
- **Commits:** 1680f967, d064585f

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking type error)
**Impact on plan:** Necessary for `tsc --noEmit` to pass; zero behavioral or logic change. No scope creep.

## Issues Encountered

- `tsc --noEmit` also surfaced pre-existing errors in `apps/strapi/src/api/payment/controllers/payment.ts` (`Cannot find name 'logger'`) during both task verifications. Confirmed via `git status` that this file was actively being modified by a concurrent parallel-execution agent (05-04 or 05-05) at the time — not touched by this plan (`payment.ts` is not in this plan's `files_modified`), and not caused by these changes. Excluded from this plan's `tsc --noEmit` acceptance check.
- `npx jest --maxWorkers=2 --testPathPattern="checkout|free-ad|ad\."` surfaced 1 failing suite (`ad.approve.zoho.test.ts`) with a `ts-jest` mock-typing error (`Type '{ contentType, query }' is missing ... 56 more` properties from `Strapi`) — confirmed via `git stash`/`git stash pop` to fail identically before this plan's changes (same known pre-existing baseline failure documented in 05-01/05-03 SUMMARY.md). All 49 other tests across the 10 remaining suites in that filter passed. No audit-log-related regression introduced.

## User Setup Required

None. No external service configuration required.

## Next Phase Readiness

- All planned logger call sites across the audit-log-adjacent payment/ad services (05-04 pack/ad flows, 05-05 pack.service.ts/ad.service.ts, 05-06 ad.ts/checkout.service.ts/free-ad.service.ts) now route through the shared `logAudit` helper from 05-03
- 05-02 (human-verification checkpoint, gated on 03/04/05/06) can proceed once 05-04/05-05 (running in parallel) also land
- No blockers identified; flag the checkout.service.ts order-creation-failure `actor` premise discrepancy (documented in key-decisions) for the phase verifier's awareness — decision was followed as instructed, only the plan's stated rationale was inaccurate

---
*Phase: 05-audit-log-for-every-crud-operation-in-strapi*
*Completed: 2026-07-02*

## Self-Check: PASSED

All three modified files verified present on disk (ad.ts, checkout.service.ts, free-ad.service.ts); both task commit hashes (1680f967, d064585f) verified present in git log.

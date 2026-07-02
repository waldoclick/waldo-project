---
phase: 05-audit-log-for-every-crud-operation-in-strapi
plan: 05
subsystem: payments
tags: [strapi, payment, logging, audit-log, winston, reshape]

# Dependency graph
requires:
  - phase: 05-03
    provides: "Shared logAuditInfo/logAuditWarn/logAuditError helper enforcing the { actor, actor_type, data } envelope"
provides:
  - "ad.service.ts: all 12 logger call sites reshaped to route through the shared logAudit helper"
  - "pack.service.ts: all 16 logger call sites reshaped to route through the shared logAudit helper"
affects: ["05-02"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "actor is typed number | \"system\"; local userId sources in these two files are always string (method params or PaymentUtils.general.extractIdsFromMeta return shape) — coerced via Number(userId) at each logAudit call site, never widening the helper's type"
    - "Lexical-scope actor resolution: sites before a try-scoped `const { userId } = extractIdsFromMeta(...)` destructure, and the outer catch of processPaidWebpay (userId declared inside the sibling try block, not visible in catch), resolve to actor: \"system\" — not a userId guess"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/payment/services/ad.service.ts
    - apps/strapi/src/api/payment/services/pack.service.ts

key-decisions:
  - "ad.service.ts 'Error sending ad creation emails:' site uses actor: \"system\" per the plan's explicit acceptance criterion, even though userId is technically in lexical scope in processFreePayment — treated as an infra/email failure, not a user action, and documented here to avoid reading as an oversight"
  - "pack.service.ts processPaidWebpay: the two logger calls before the `const { userId, adId, isInvoice } = extractIdsFromMeta(buyOrder)` destructure (Webpay response error, transaction-not-authorized warn) use actor: \"system\" — no user id exists in scope at those lines"
  - "pack.service.ts processPaidWebpay outer catch (final catch block) uses actor: \"system\" — userId is declared with const inside the try block and is a ReferenceError if referenced from the catch block (verified via a Node scope test), so it cannot be captured there"
  - "Webpay/Transbank fields (buy_order, token, transaction amount/response) always kept under data, never used as actor, per CLAUDE.md Payment Rules"

patterns-established: []

requirements-completed: []

# Metrics
duration: 25min
completed: 2026-07-02
---

# Phase 05 Plan 05: Homologate ad.service.ts and pack.service.ts Logger Calls to Shared logAudit Helper Summary

**Reshaped all 28 logger.info/warn/error call sites across ad.service.ts (12) and pack.service.ts (16) — the two heaviest payment/ad-creation service files — to route through the 05-03 shared logAudit helper, enforcing the `{ actor, actor_type, data }` envelope with zero business-logic, control-flow, amount, or order-identity changes.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-07-02
- **Tasks:** 2 (ad.service.ts, pack.service.ts)
- **Files modified:** 2

## Accomplishments

- `ad.service.ts`: all 12 logger calls (8 info, 4 error, 0 warn) converted to `logAuditInfo`/`logAuditError`; raw `logger` import removed, `logAuditInfo`/`logAuditError` imported from `../../../utils/audit-log`
- `pack.service.ts`: all 16 logger calls (8 info, 3 warn, 5 error) converted to `logAuditInfo`/`logAuditWarn`/`logAuditError`; all 3 warn sites (`Pack no encontrado`, `Transacción no autorizada`, amount-mismatch) preserved as warn — no level downgrade; raw `logger` import removed, all three level functions imported
- `actor` resolved to `Number(userId)` (method params and `extractIdsFromMeta` destructures are typed `string`; the helper's `actor` field is `number | "system"`) with `actor_type: "plugin::users-permissions.user"` everywhere a local userId was in lexical scope at the call site
- Sites with no userId in scope (email-send catch handler documented per plan, pre-extraction Webpay response sites, and the outer `processPaidWebpay` catch in pack.service.ts) use `actor: "system", actor_type: "system"`
- Message-only template-literal calls (e.g. `Aviso ${ad.ad_id} modificado...`, the pack amount-mismatch warn) kept their message verbatim and omitted `data` per the helper's default
- Webpay/Transbank references (`buy_order`, `token`, transaction amount/response) stayed under `data`, never promoted to `actor`

## Task Commits

1. **Task 1: Reshape ad.service.ts** - `2f5739a5` (refactor)
2. **Task 2: Reshape pack.service.ts** - `b9ee8643` (refactor)

## Files Created/Modified

- `apps/strapi/src/api/payment/services/ad.service.ts` — 12 logger calls reshaped, raw logger import removed
- `apps/strapi/src/api/payment/services/pack.service.ts` — 16 logger calls reshaped, raw logger import removed

## Decisions Made

See `key-decisions` in frontmatter. The most consequential deviation from a literal read of the plan text: `Number(userId)` coercion was required at every actor site because `userId` in both files is always a `string` (function parameters and `PaymentUtils.general.extractIdsFromMeta()`'s return type), while the `AuditMeta.actor` field from 05-03 is typed `number | "system"`. This is a type-coercion detail, not a business-logic or scope change, and is required for `tsc --noEmit` to pass — the plan's interface block implied `actor: userId` directly would type-check, which it does not for these two files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `Number(userId)` coercion at every actor call site**
- **Found during:** Task 1 (writing the first logAudit call)
- **Issue:** `logAuditInfo`/`logAuditWarn`/`logAuditError`'s `AuditMeta.actor` field is `number | "system"` (05-03); `userId` throughout ad.service.ts and pack.service.ts is always `string` (method params, `extractIdsFromMeta()` return shape) — passing it directly fails `tsc --noEmit`
- **Fix:** Wrapped every userId-derived actor value in `Number(userId)` at the call site; did not widen the shared helper's type (out of scope, would affect 05-03/04/06's envelope contract and tests)
- **Files modified:** apps/strapi/src/api/payment/services/ad.service.ts, apps/strapi/src/api/payment/services/pack.service.ts
- **Commits:** 2f5739a5, b9ee8643

No architectural changes were required — this was a mechanical, reshape-only pass on both files.

## Issues Encountered

None. Both files' full `git diff` were confirmed reshape-only via the plan's mechanical no-logic-change gate (`uniq -u` + forbidden-token grep — zero output on both files) and a manual read. `tsc --noEmit` exits clean project-wide (no new errors). Targeted Jest run (`ad.service.test.ts`, `pack.service.test.ts`, `payment.test.ts` — these mock `utils/logtail` and assert nothing on logger calls) confirmed 14/14 tests passing unchanged, plus the 05-03 `logAudit` helper and subscriber test suites (9/9) confirmed unaffected.

## User Setup Required

None. Takes effect automatically on next Strapi restart — ad/pack payment-flow audit lines now flow through the same `{ actor, actor_type, data }` envelope as the rest of the audited surface.

## Next Phase Readiness

- `ad.service.ts` and `pack.service.ts` now match the envelope established in 05-03 and used by 05-04 (`payment.ts`) and 05-06 (`ad.ts`, `checkout.service.ts`, `free-ad.service.ts`)
- 05-02 (human-verification checkpoint, gated on 05-03/04/05/06) can proceed once all four homologation plans land
- No blockers identified

---
*Phase: 05-audit-log-for-every-crud-operation-in-strapi*
*Completed: 2026-07-02*

## Self-Check: PASSED

Both modified files verified present and containing `logAudit`; commits `2f5739a5` and `b9ee8643` verified present in `git log`.

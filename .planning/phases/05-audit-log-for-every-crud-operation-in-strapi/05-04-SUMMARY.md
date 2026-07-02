---
phase: 05-audit-log-for-every-crud-operation-in-strapi
plan: 04
subsystem: payments
tags: [strapi, payment, logging, audit-log, winston, reshape]

# Dependency graph
requires:
  - phase: 05-03
    provides: "Shared logAuditInfo/logAuditWarn/logAuditError helper enforcing the { actor, actor_type, data } envelope"
provides:
  - "payment.ts controller: all 23 logger call sites reshaped to route through the shared logAudit helper"
affects: ["05-02"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "actor resolution for nullable/optional user id in scope: `actor: userId ?? \"system\"`, `actor_type: userId ? \"plugin::users-permissions.user\" : \"system\"` — keeps the invariant that actor is a number iff actor_type is a user type"
    - "Webpay/Transbank unauthenticated callback sites always use actor: \"system\", actor_type: \"system\" — never a gateway reference (buyOrder/token_ws/TBK_*) as actor"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/payment/controllers/payment.ts

key-decisions:
  - "result.ad.user.id (typed number | string per WebpayAdResult) cast via Number(...) at each logAudit call site — matches the existing Number(result.ad.user.id) cast pattern already used elsewhere in the same file (e.g. createAdOrder call), rather than introducing a new cast style"
  - "'Proceso de pago falló' / 'Proceso de pago completado exitosamente' sites (optional chaining result?.ad?.user?.id) resolve actor via a ternary to system when the chain is undefined, consistent with the plan's nullable-userId rule for adResponse-adjacent sites"

patterns-established: []

requirements-completed: []

# Metrics
duration: 25min
completed: 2026-07-02
---

# Phase 05 Plan 04: Homologate payment.ts Logger Calls to Shared logAudit Helper Summary

**All 23 `logger.info/warn/error` call sites in `payment.ts` reshaped to `logAuditInfo`/`logAuditWarn`/`logAuditError`, preserving every log level, message string, and metadata field — zero business-logic, control-flow, amount, or order-identity changes.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-07-02T17:21:00Z (approx, session start)
- **Completed:** 2026-07-02T17:46:21Z
- **Tasks:** 2 (baseline capture, reshape)
- **Files modified:** 1

## Accomplishments

- Baseline captured before any change: `npx jest --maxWorkers=2 payment` — all payment suites pass except the pre-existing `general.utils.test.ts` Strapi-instance-startup failure (documented in 05-01/05-03 as a known pre-existing failure, unrelated to this plan)
- Pre-change `tsc --noEmit` showed pre-existing errors from sibling parallel-executing plans (05-05/05-06 concurrently editing `apps/strapi/src/api/ad/services/ad.ts` and `apps/strapi/src/api/payment/services/ad.service.ts`) — confirmed via `git status` that these files are outside this plan's scope (`payment.ts` only) and were untouched/clean at the start of this task
- All 23 `logger.*` call sites in `payment.ts` converted to `logAuditInfo`/`logAuditWarn`/`logAuditError` — final counts: 10 info, 3 warn, 10 error, 0 raw `logger.*` calls remaining
- `import logger from "../../../utils/logtail"` replaced with `import { logAuditInfo, logAuditWarn, logAuditError } from "../../../utils/audit-log"`
- Actor resolution applied per the plan's rules:
  - `adCreate` flow (7 sites): `actor: userId` (from `ctx.state.user.id`), `actor_type: "plugin::users-permissions.user"`
  - `adResponse` flow (nullable `userId = ctx.state.user?.id || null`, 4 sites incl. "Procesando respuesta de pago de anuncio", "Token de Webpay no válido, redirigiendo" [warn], "Respuesta de Webpay procesada", "Respuesta de Webpay inválida" [error]): `actor: userId ?? "system"`, `actor_type` ternary
  - `result.ad.user.id`-sourced sites (5 sites incl. "Detalles de facturación obtenidos", "Documento Facto generado exitosamente", "Error generando documento Facto" [error], "Orden creada exitosamente"): `actor: Number(result.ad.user.id)`, `actor_type: "plugin::users-permissions.user"`
  - "Proceso de pago falló" [error] / "Proceso de pago completado exitosamente" (optional-chained `result?.ad?.user?.id`, 2 sites): ternary to `"system"` when absent
  - `webpayResponse` unauthenticated Transbank callback sites (3 sites: "Webpay checkout cancelled or invalid token" [warn], "Checkout Webpay return failed" [error], "Checkout Webpay return missing orderDocumentId" [error]): `actor: "system"`, `actor_type: "system"` — Webpay/TBK references kept under `data` only, never as actor
  - `proResponse` sites using `user.id` (3 sites: "proResponse: first-month charge failed" [error], "proResponse: order/Facto creation failed" [error], "proResponse: sort_priority recalculation failed on pro activation" [error]): `actor: user.id`, `actor_type: "plugin::users-permissions.user"`
- Mechanical diff-scope gate (from the plan's verify block) ran clean: zero forbidden-surface matches (`ctx.redirect`, `buy_order`, `TBK_`, `token_ws`, `.documentId`, `amount`, `price`, `total`, `if/else/return/await`) survived the `uniq -u` collapse — only the two `logger.error(...)` → `logAuditError(...)` call-site renames matched, confirming reshape-only
- Post-change `tsc --noEmit` shows zero new errors attributable to `payment.ts` (all remaining errors are in sibling-plan files `ad.ts`/`ad.service.ts`, confirmed pre-existing/concurrent via `git status`)
- Post-change `npx jest --maxWorkers=2 payment` — identical pass/fail signature to baseline: all payment suites (including `payment.test.ts`) pass, single pre-existing `general.utils.test.ts` failure unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Establish the Jest and tsc baseline before touching payment.ts** - no commit (measurement-only, no files modified, per plan design)
2. **Task 2: Reshape all 23 logger call sites in payment.ts to logAudit** - `97a8c254` (refactor)

## Files Created/Modified

- `apps/strapi/src/api/payment/controllers/payment.ts` - All 23 `logger.*` calls reshaped to `logAuditInfo`/`logAuditWarn`/`logAuditError`; raw `logtail` import replaced with the shared `utils/audit-log` import; zero business-logic changes

## Decisions Made

See `key-decisions` in frontmatter. No architectural changes — purely mechanical metadata reshaping within the existing task scope.

## Deviations from Plan

None - plan executed exactly as written. All 23 call sites matched the plan's anchor-site enumeration and actor-resolution rules exactly; level counts (info=10, warn=3, error=10) matched the plan's pre-verified counts with no discrepancy.

## Issues Encountered

- Pre-change `tsc --noEmit` and post-change `tsc --noEmit` both showed unrelated errors in `apps/strapi/src/api/ad/services/ad.ts` and `apps/strapi/src/api/payment/services/ad.service.ts` — these are sibling parallel-executor plans (05-05/05-06) concurrently reshaping those files' logger calls in the same session. Confirmed via `git status --short` that these files are outside this plan's `files_modified` scope and were not touched by this plan's work. No new errors were introduced in `payment.ts` itself (`grep "payment.ts" tsc-output` returns empty both before and after).
- One `Edit` tool call transiently failed with a "File has been modified since read" error mid-Task-2 (no actual content loss — a stale internal read-cache flag). Resolved by re-reading the file and immediately retrying the identical edit, which succeeded. Not a deviation from the plan's intended change, just a tool-state resync.

## User Setup Required

None - no external service configuration required. The reshaped logger calls take effect automatically on the next Strapi restart; payment/order audit lines will appear in the same Winston-backed log destinations (Better Stack + rotating file) as before, now carrying the homologated `{ actor, actor_type, data }` envelope.

## Next Phase Readiness

- `payment.ts` audit logging is now fully homologated onto the shared `logAudit` envelope established in 05-03
- 05-02 (human-verification checkpoint, wave 3) can exercise this file's logger-based read path once 05-05/05-06 also land
- No blockers identified

---
*Phase: 05-audit-log-for-every-crud-operation-in-strapi*
*Completed: 2026-07-02*

## Self-Check: PASSED

`apps/strapi/src/api/payment/controllers/payment.ts` confirmed present; `.planning/phases/05-audit-log-for-every-crud-operation-in-strapi/05-04-SUMMARY.md` confirmed present; task commit hash `97a8c254` confirmed present in git log.

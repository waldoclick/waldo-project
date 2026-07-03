---
phase: 05-audit-log-for-every-crud-operation-in-strapi
plan: 01
subsystem: infra
tags: [strapi, lifecycles, audit-log, jest, tdd]

# Dependency graph
requires: []
provides:
  - "api::audit-log.audit-log content-type (schema-only, no controller/route/service)"
  - "registerAuditLogSubscriber(strapi) — global db.lifecycles.subscribe hook wired into bootstrap()"
  - "Actor discrimination pattern: admin::user / plugin::users-permissions.user / system via strapi.requestContext.get()"
affects: [05-02, future audit-log dashboard/retention plans]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "strapi.db.lifecycles.subscribe({afterCreate, afterUpdate, afterDelete}) SubscriberMap for global cross-content-type hooks"
    - "strapi.requestContext.get() for actor resolution outside custom middleware"
    - "Recursion guard via early-return on event.model.uid, not SubscriberMap models allowlist"
    - "Log-and-swallow error handling for non-critical side-effect writes"

key-files:
  created:
    - apps/strapi/src/api/audit-log/content-types/audit-log/schema.json
    - apps/strapi/src/subscribers/audit-log.subscriber.ts
    - apps/strapi/tests/subscribers/audit-log.subscriber.test.ts
  modified:
    - apps/strapi/src/index.ts

key-decisions:
  - "audit-log content-type is schema-only (no controller/route/service) — read exclusively via admin Content Manager per CONTEXT.md read-path decision"
  - "record_id/record_document_id pulled from event.result (post-write state), never from event.params.where, per RESEARCH — proven by test using a deliberately different where.id value"
  - "Recursion guard implemented as an early-return inside the handler (if event.model.uid === AUDIT_LOG_UID return), not via SubscriberMap's models allowlist — matches RESEARCH-verified dispatcher behavior"
  - "Subscriber registered as the FIRST statement in bootstrap(), before seeders run, so seeder/backfill writes are captured and correctly tagged system"
  - "Bulk *Many operations (createMany/updateMany/deleteMany) intentionally out of scope — documented inline as SCOPE BOUNDARY comment; only bulk caller is verification-code-cleanup.cron.ts"

patterns-established:
  - "Global lifecycle subscriber pattern for cross-cutting content-type concerns (audit, future: soft-delete, versioning)"
  - "strapi.requestContext.get() actor resolution without custom middleware — reusable for any future context-aware side effect"

requirements-completed: []

# Metrics
duration: 25min
completed: 2026-07-02
---

# Phase 05 Plan 01: Global Audit-Log Subscriber Summary

**Single `db.lifecycles.subscribe()` hook records every create/update/delete across all Strapi content-types into a new `audit-log` table, tagging the actor as admin, public API user, or system, with a built-in recursion guard and log-and-swallow error handling.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-07-02T03:36:33Z (session resume)
- **Completed:** 2026-07-02T04:01Z
- **Tasks:** 3 (schema, RED test, GREEN implementation)
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments
- `audit-log` collectionType schema created — 6 attributes (action, content_type_uid, record_id, record_document_id, actor_id, actor_type), no API surface
- `audit-log.subscriber.ts` implements `registerAuditLogSubscriber(strapi)` — subscribes to `afterCreate`/`afterUpdate`/`afterDelete` across every content-type via `strapi.db.lifecycles.subscribe()`
- Actor discrimination fully working: `admin::user` (admin panel), `plugin::users-permissions.user` (public API), `system` (seeders/crons/boot — no request context)
- Recursion guard confirmed: writes to `api::audit-log.audit-log` itself never trigger a further audit row
- Audit failures are caught and logged via `strapi.log.error`, never propagated — a broken audit write cannot break the original business write
- Subscriber registered as the first statement in `bootstrap()`, ahead of all 10 seeders and the `recalculateSortPriorities()` backfill
- 6 Jest tests (covering the 5 required behaviors, with Test 2 split into afterUpdate/afterDelete sub-cases) — all GREEN

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the audit-log content-type schema** - `02c9b737` (feat)
2. **Task 2 (RED): Write the failing subscriber test suite** - `e11ddb4f` (test)
3. **Task 3 (GREEN): Implement the subscriber and wire it into bootstrap** - `26a7757a` (feat)

_TDD flow: RED (task 2) confirmed failing on `Cannot find module '../../src/subscribers/audit-log.subscriber'` before GREEN (task 3) implemented it. No REFACTOR commit needed — implementation matched plan verbatim, no cleanup required._

## Files Created/Modified
- `apps/strapi/src/api/audit-log/content-types/audit-log/schema.json` - New collectionType schema, schema-only (no controller/route/service)
- `apps/strapi/src/subscribers/audit-log.subscriber.ts` - `registerAuditLogSubscriber(strapi)` default export; `recordAuditEntry()` handler with recursion guard, actor resolution, and try/catch swallow
- `apps/strapi/tests/subscribers/audit-log.subscriber.test.ts` - 6 Jest tests covering all 5 required behaviors
- `apps/strapi/src/index.ts` - Added import + `registerAuditLogSubscriber(strapi)` call as first line of `bootstrap()`

## Decisions Made
- No new decisions beyond those already recorded in `key-decisions` above — plan's interfaces (RESEARCH.md) were followed verbatim, including exact lifecycle event shape, SubscriberMap registration form, and `strapi.requestContext.get()` actor-read pattern.

## Deviations from Plan

None — plan executed exactly as written. Schema, subscriber, and bootstrap wiring all match the plan's exact code blocks; all acceptance criteria and automated verify commands passed without modification.

## Issues Encountered

- Running the full Jest suite (`npx jest`, default worker concurrency) in this sandboxed environment caused 36 of 45 test suites to report `Test suite failed to run` due to worker processes being SIGKILLed (apparent OOM in the sandbox, not a code defect). Re-running with `npx jest --maxWorkers=2` resolved the resource issue and reduced failures to 3 pre-existing suites (`ad.approve.zoho.test.ts`, `indicador.test.ts`, `general.utils.test.ts`), all confirmed failing identically on the pre-plan commit via `git stash`. These are unrelated to the audit-log subscriber and are logged in `deferred-items.md` per the deviation-rules scope boundary — not fixed.
- The dedicated `audit-log.subscriber.test.ts` suite (this plan's actual verification target) passes cleanly in all runs: 6/6 tests green.

## User Setup Required

None — no external service configuration required. The `audit-log` content-type will register automatically on next Strapi boot/restart; no migration script needed since it's a brand-new collection.

## Next Phase Readiness

- Global audit-log capture mechanism is live and will start recording rows on next Strapi restart (dev/staging/prod)
- `system`-tagged rows will appear immediately from the existing seeders and `recalculateSortPriorities()` backfill on every boot — expected per plan's explicit "conscious, do NOT reopen" note
- Ready for 05-02 (next plan in phase 05, likely covering read/retention/dashboard surface for the new audit-log data — not yet read at time of this summary)
- No blockers identified

---
*Phase: 05-audit-log-for-every-crud-operation-in-strapi*
*Completed: 2026-07-02*

## Self-Check: PASSED

All created files verified present on disk; all 3 task commit hashes (02c9b737, e11ddb4f, 26a7757a) verified present in git log.

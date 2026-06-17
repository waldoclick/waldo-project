---
phase: 06-cierre-cuenta
plan: 01
subsystem: api
tags: [strapi, permissions, bootstrap, users-permissions]

requires:
  - phase: 05-07
    provides: "ad-view and ad-contact API endpoints (stats, panelViewsTotal, recordContact)"

provides:
  - "Authenticated role holds api::ad-view.ad-view.stats permission"
  - "Authenticated role holds api::ad-view.ad-view.panelViewsTotal permission"
  - "Authenticated role holds api::ad-contact.ad-contact.recordContact permission"
  - "Authenticated role holds api::ad-contact.ad-contact.contactsTotal permission"
  - "Idempotent bootstrap permission grant — safe to re-run on every Strapi boot"

affects: [06-02, 06-03, 06-04, 06-05]

tech-stack:
  added: []
  patterns:
    - "Idempotent permission seeder via bootstrap(): query role with populated permissions, build Set of existing UIDs, create only missing ones"

key-files:
  created: []
  modified:
    - apps/strapi/src/index.ts

key-decisions:
  - "Grant via bootstrap() not admin UI — ensures permissions survive DB wipes and environment recreations"
  - "Use Set<string> of existing action UIDs as idempotency guard — prevents duplicate permission rows on re-run"
  - "recordContact route is auth:false — its permission grant is a no-op for access control but kept for D-05 fidelity"
  - "contactsTotal (06-04) pre-granted here — avoids a second bootstrap block in a later plan"
  - "No enabled field on permission create — v5 plugin::users-permissions.permission has only action + role"

patterns-established:
  - "Permission seeder pattern: strapi.db.query('plugin::users-permissions.role').findOne({ where: { type }, populate: ['permissions'] }) + create only when not in existing Set"

requirements-completed: [STAT-PERM]

duration: 5min
completed: 2026-06-17
---

# Phase 06 Plan 01: Stats Permission Grant Summary

**Idempotent bootstrap block in apps/strapi/src/index.ts grants the Authenticated role four action UIDs (stats, panelViewsTotal, recordContact, contactsTotal) on every Strapi boot, converting 403 responses to 200 for authenticated ad owners**

## Performance

- **Duration:** 5 min
- **Started:** 2026-06-17T00:00:00Z
- **Completed:** 2026-06-17T00:05:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added idempotent stats permission grant to `bootstrap()` in `apps/strapi/src/index.ts`
- Authenticated role now receives four action UIDs on every boot with no duplicate row risk
- TSC clean — no TypeScript errors introduced
- `GET /api/ads/me/views-total` and `GET /api/ads/:documentId/stats` will return 200 (not 403) for authenticated users after the next Strapi restart

## Task Commits

1. **Task 1: Add idempotent stats-permission grant to bootstrap()** - `fc4d1d57` (feat)

## Files Created/Modified
- `apps/strapi/src/index.ts` - Added idempotent permission grant block after sort_priority backfill; grants Authenticated role the four stats action UIDs on every boot

## Decisions Made
- Used `Set<string>` of existing action UIDs as idempotency guard — O(1) lookup, prevents duplicate rows on re-run
- Pre-granted `contactsTotal` (06-04 endpoint) here to avoid a second bootstrap block in that plan
- `recordContact` route is `auth:false` so the permission grant is a no-op for access; kept for D-05 fidelity
- Cast permission rows as `Array<{ action: string }>` inline (documented comment) — v5 shape confirmed from plugin source

## Deviations from Plan

None — plan executed exactly as written. The implementation was found already committed from a prior interrupted attempt (`fc4d1d57`); verified it matched the spec exactly before proceeding.

## Issues Encountered

None — code was already in place from a prior interrupted attempt. Verified all acceptance criteria, ran `tsc --noEmit` (clean), confirmed the commit exists.

## User Setup Required

**Strapi restart required.** The permission grant runs in `bootstrap()`, so the four permission rows are not created until Strapi boots. After restarting Strapi, `GET /api/ads/me/views-total` and `GET /api/ads/:documentId/stats` will return 200 for authenticated users.

## Next Phase Readiness
- Stats endpoints (stats, panelViewsTotal) will return 200 for authenticated owners after restart — unblocks 06-05 (stats modal data wiring)
- `contactsTotal` endpoint does not exist yet (plan 06-04) — permission pre-granted, will activate when route is added
- Ready for 06-02 (header/menu redesign) and 06-03 (action wiring) which are independent of this plan

---
*Phase: 06-cierre-cuenta*
*Completed: 2026-06-17*

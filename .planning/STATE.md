---
gsd_state_version: 1.0
milestone: v1.8
milestone_name: Free Featured Reservation Guarantee
status: Milestone closed
stopped_at: Closed milestone v1.8
last_updated: "2026-03-07T01:30:21.292Z"
last_activity: 2026-03-07 — Milestone v1.8 closed, all fixes shipped
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.8 COMPLETE — next milestone TBD

## Current Position

Phase: 24 of 24 (featuredCron Implementation)
Plan: 24-01 (complete)
Status: Milestone closed
Last activity: 2026-03-07 — Milestone v1.8 closed, all fixes shipped

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: ~2 min
- Total execution time: ~2 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 24 | 1 | ~2 min | ~2 min |

## Accumulated Context

### Decisions

All decisions from v1.1–v1.7 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.5**: Reservation freeing updates reservation side (FK lives on reservation), not ad side
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.7 cron pattern**: class-based service (`class XxxCronService`), `logger` from `../utils/logtail`, per-item try/catch inside user loop, `entityService.findMany` + `entityService.create`
- **v1.7 cron-tasks.ts JSDoc pattern**: state purpose + schedule expression meaning + timezone + service method called
- **v1.8**: `featuredCron` "free available" = price=0 AND (ad=null OR ad.active=false)
- **v1.8**: Featured reservations created with no `total_days` (field is optional, featured slots have no expiry)
- **v1.8**: Free ad reservations stay permanently linked to their ad when it expires — never unlinked. A new reservation is created to replace it.
- **v1.8**: `restoreUserFreeReservations` counts pool as: `ad=null` (available) + `ad.active=true` (in use). Reservations linked to `ad.active=false` are consumed history, not counted.
- **v1.8**: Cron parallelization pattern — `Promise.all` in batches of 50 to avoid DB connection pool exhaustion

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T01:30:00.000Z
Stopped at: Closed milestone v1.8
Resume file: None

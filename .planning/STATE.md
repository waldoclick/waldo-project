---
gsd_state_version: 1.0
milestone: v1.9
milestone_name: Website Technical Debt
status: Defining requirements
stopped_at: Defining requirements for v1.9
last_updated: "2026-03-07T00:00:00.000Z"
last_activity: 2026-03-07 — Milestone v1.9 started
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.9 — Website Technical Debt

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-07 — Milestone v1.9 started

## Accumulated Context

### Decisions

All decisions from v1.1–v1.8 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.5**: Reservation freeing updates reservation side (FK lives on reservation), not ad side
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.7 cron pattern**: class-based service, `logger` from `../utils/logtail`, per-item try/catch inside user loop
- **v1.8**: Free ad reservations stay permanently linked to their ad when it expires — never unlinked
- **v1.8**: `restoreUserFreeReservations` counts pool as: `ad=null` + `ad.active=true`
- **v1.8**: Cron parallelization pattern — `Promise.all` in batches of 50

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T00:00:00.000Z
Stopped at: Milestone v1.9 started — defining requirements
Resume file: None

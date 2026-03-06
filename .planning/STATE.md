---
gsd_state_version: 1.0
milestone: v1.7
milestone_name: Cron Reliability
status: planning
stopped_at: Completed 22-01-PLAN.md (Cleanup Cron Fix & Docs)
last_updated: "2026-03-06T23:07:31.889Z"
last_activity: 2026-03-06 — Roadmap created, 4 phases mapped to 10 requirements
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 3
  completed_plans: 3
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.7 Cron Reliability — Phase 20: user.cron Fix & Docs

## Current Position

Phase: 20 of 23 (user.cron Fix & Docs)
Plan: — (not yet planned)
Status: Ready to plan
Last activity: 2026-03-06 — Roadmap created, 4 phases mapped to 10 requirements

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

*Updated after each plan completion*
| Phase 20 P01 | 77s | 1 tasks | 1 files |
| Phase 21 P01 | 77 | 1 tasks | 1 files |
| Phase 22 P01 | 1 | 1 tasks | 1 files |

## Accumulated Context

### Decisions

All decisions from v1.1–v1.6 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.5**: Reservation freeing updates reservation side (FK lives on reservation), not ad side
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- [Phase 20]: Use Map<userId,{user,ads[]}> two-phase approach in restoreFreeAds: collect all expired ads first, then process per user — ensures every ad is deactivated and restoreUserFreeReservations is called exactly once per user
- [Phase 21]: Use strapi.config.get('database') as { connection: any } to satisfy TypeScript — get() returns unknown so cast is required
- [Phase 21]: Build sanitizedCommand locally before log calls — raw backupCommand passed unchanged to execAsync
- [Phase 22]: Use db.query('plugin::upload.folder').findOne to resolve folder path, then filter upload files by folderPath — direct relation filter silently returns empty array in Strapi v5
- [Phase 22]: Null guard returns [] when 'ads' folder doesn't exist — safe skip, not an error

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-06T23:07:31.887Z
Stopped at: Completed 22-01-PLAN.md (Cleanup Cron Fix & Docs)
Resume file: None

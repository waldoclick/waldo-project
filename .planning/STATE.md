---
gsd_state_version: 1.0
milestone: v1.7
milestone_name: Cron Reliability
status: defining_requirements
stopped_at: Defining requirements
last_updated: "2026-03-06T00:00:00.000Z"
last_activity: 2026-03-06 — Milestone v1.7 started
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.7 Cron Reliability — defining requirements

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-06 — Milestone v1.7 started

## Accumulated Context

### Decisions

All decisions from v1.1–v1.6 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Per-entity section keys in settings store — never share a key between distinct list views
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- All utility functions accept `null | undefined` and return `"--"` for missing data
- Nuxt auto-import picks up `app/utils/*.ts` — no explicit imports needed
- **v1.5**: Reservation freeing updates reservation side (FK lives on reservation), not ad side
- **v1.5**: No try/catch around freeing calls — if freeing fails, whole reject/ban fails
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.6**: Cache guard: array-length + timestamp check (not timestamp-only)

### Pending Todos

None.

### Blockers/Concerns

None.

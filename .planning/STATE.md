---
gsd_state_version: 1.0
milestone: v1.5
milestone_name: Ad Credit Refund
status: defining_requirements
stopped_at: Milestone v1.5 started — defining requirements
last_updated: "2026-03-06T20:00:00.000Z"
last_activity: 2026-03-06 — Milestone v1.5 Ad Credit Refund started
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
**Current focus:** Defining requirements for v1.5 Ad Credit Refund

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-06 — Milestone v1.5 started

## Accumulated Context

### Decisions

All decisions from v1.1–v1.4 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Per-entity section keys in settings store — never share a key between distinct list views
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- All utility functions accept `null | undefined` and return `"--"` for missing data
- Nuxt auto-import picks up `app/utils/*.ts` — no explicit imports needed

### Pending Todos

None.

### Blockers/Concerns

None.

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
| :--- | :--- | :--- | :--- | :--- |

## Session Continuity

Last session: 2026-03-06
Stopped at: Milestone v1.5 started — requirements not yet written
Resume file: None

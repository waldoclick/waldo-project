---
gsd_state_version: 1.0
milestone: v1.6
milestone_name: Website API Optimization
status: defining_requirements
stopped_at: null
last_updated: "2026-03-06T21:30:00.000Z"
last_activity: "2026-03-06 — Milestone v1.6 started"
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
**Current focus:** Defining requirements for v1.6 Website API Optimization

## Current Position

```
[ defining requirements — v1.6 Website API Optimization ]
```

Status: Defining requirements
Last activity: 2026-03-06 — Milestone v1.6 started

## Accumulated Context

### Decisions

All decisions from v1.1–v1.5 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Per-entity section keys in settings store — never share a key between distinct list views
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- All utility functions accept `null | undefined` and return `"--"` for missing data
- Nuxt auto-import picks up `app/utils/*.ts` — no explicit imports needed
- **v1.5**: Reservation freeing updates reservation side (FK lives on reservation), not ad side — `entityService.update(uid, id, { data: { ad: null } })`
- **v1.5**: No try/catch around freeing calls — if freeing fails, whole reject/ban fails (caller handles)
- **v1.5**: Email templates use `!!ad.ad_reservation?.id` evaluated on pre-freed ad object — correctly reflects "was a credit returned?" boolean

### Pending Todos

None.

### Blockers/Concerns

None.

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
| :--- | :--- | :--- | :--- | :--- |
| 16-credit-refund-logic | 01 | 2min | 2 | 1 |
| 17-email-notification-update | 01 | 2min | 2 | 3 |

## Session Continuity

Last session: 2026-03-06T21:05:00.000Z
Stopped at: v1.5 milestone complete — archived
Resume file: None

---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: URL Localization
status: active
stopped_at: null
last_updated: "2026-03-05T00:00:00.000Z"
last_activity: 2026-03-05 — Roadmap created for v1.4
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-05)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.4 URL Localization — Phase 12 (Ads Migration) up next

## Current Position

Phase: 12 — Ads Migration
Plan: —
Status: Not started
Last activity: 2026-03-05 — Roadmap created for v1.4

```
v1.4 Progress: ░░░░░░░░░░ 0% (0/4 phases)
```

## Accumulated Context

### Decisions

All decisions from v1.1, v1.2, and v1.3 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Per-entity section keys in settings store — never share a key between distinct list views
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- All utility functions accept `null | undefined` and return `"--"` for missing data
- Nuxt auto-import picks up `app/utils/*.ts` — no explicit imports needed

### v1.4-Specific Context

- Nuxt 4 uses file-based routing: renaming a directory renames the route automatically
- Redirects should be added in `nuxt.config.ts` under `routeRules` or as server middleware
- ~30 components contain internal route references that will need updating (navigateTo, NuxtLink, router.push)
- No API changes, no store changes, no functional behavior changes — pure path rename
- Phase 12 and Phase 14 can be executed in parallel (independent segments), but Phase 15 must be last

### Pending Todos

None.

### Blockers/Concerns

None.

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
| :--- | :--- | :--- | :--- | :--- |
| 09 | 02 | 15 min | 2 | 8 |
| 09 | 03 | 5 min | 2 | 8 |
| 09 | 04 | 3 min | 2 | 8 |
| 09 | 05 | 5 min | 3 | 9 |
| 10 | 01 | 15 min | 3 | 14 |
| 11 | 01 | ~15 min | 3 | 8 |

## Session Continuity

Last session: 2026-03-05
Stopped at: v1.4 roadmap created
Resume file: None

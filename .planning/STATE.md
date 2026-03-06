---
gsd_state_version: 1.0
milestone: v1.6
milestone_name: Website API Optimization
status: completed
stopped_at: Completed 18-02-PLAN.md
last_updated: "2026-03-06T21:45:06.786Z"
last_activity: 2026-03-06 — Completed 18-02 (mis-anuncios tab-count consolidation, 2 requests instead of 6)
progress:
  total_phases: 2
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.6 Website API Optimization — Phase 18 complete

## Current Position

```
Phase 18 of 19 — Page Double-Fetch Fixes [ complete: 2/2 plans ]
[██████████] 100%
```

Status: Phase 18 complete — both plans executed
Last activity: 2026-03-06 — Completed 18-02 (mis-anuncios tab-count consolidation, 2 requests instead of 6)

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
  - **v1.6 (18-01)**: `useAsyncData` is sole data-loading trigger in Nuxt pages — no bare `await store.method()` before it
  - **v1.6 (18-01)**: Route `/ads/me/counts` placed before `/ads/me` — Strapi matches routes top-to-bottom, specific paths precede parameterless ones
  - **v1.6 (18-02)**: Tab counts loaded once on mount from `/ads/me/counts` — not refreshed on filter/page change (counts are totals, not filter-dependent)

### Pending Todos

None.

### Blockers/Concerns

None.

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
| :--- | :--- | :--- | :--- | :--- |
| 16-credit-refund-logic | 01 | 2min | 2 | 1 |
| 17-email-notification-update | 01 | 2min | 2 | 3 |
| 18-page-double-fetch-fixes | 01 | 3min | 2 | 3 |
| 18-page-double-fetch-fixes | 02 | 2min | 2 | 2 |

## Session Continuity

Last session: 2026-03-06T21:38:24Z
Stopped at: Completed 18-02-PLAN.md
Resume file: None

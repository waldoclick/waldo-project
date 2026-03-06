---
gsd_state_version: 1.0
milestone: v1.6
milestone_name: Website API Optimization
status: completed
stopped_at: Completed 19-01-PLAN.md
last_updated: "2026-03-06T21:59:36Z"
last_activity: 2026-03-06 — Completed 19-01 (cache guards in packs/conditions/regions stores, removed redundant loadCommunes from FormCreateThree)
progress:
  total_phases: 2
  completed_phases: 2
  total_plans: 3
  completed_plans: 3
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.6 Website API Optimization — Phase 19 complete

## Current Position

```
Phase 19 of 19 — Store Cache Guards & Component Cleanup [ complete: 1/1 plans ]
[██████████] 100%
```

Status: Phase 19 complete — plan executed
Last activity: 2026-03-06 — Completed 19-01 (cache guards in packs/conditions/regions stores, removed redundant loadCommunes from FormCreateThree)

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
  - **v1.6 (19-01)**: Options API cache guard pattern — `lastFetch: 0` in state, length + timestamp check before HTTP fetch, `lastFetch = Date.now()` after successful fetch

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
| 19-store-cache-guards-component-cleanup | 01 | 2min | 2 | 6 |

## Session Continuity

Last session: 2026-03-06T21:59:36Z
Stopped at: Completed 19-01-PLAN.md
Resume file: None

---
gsd_state_version: 1.0
milestone: v1.9
milestone_name: Website Technical Debt
status: Phase 25 complete — ready to plan Phase 26
stopped_at: Completed 25-01-PLAN.md — Phase 25 Critical Correctness Bugs done, ready for Phase 26 planning
last_updated: "2026-03-07T02:49:58.745Z"
last_activity: 2026-03-06 — Phase 25 complete (5 bugs fixed; Strapi route ordering, useAsyncData keys, plugin types, console filter)
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.9 — Website Technical Debt

## Current Position

Phase: 26 — Data Fetching Cleanup
Plan: TBD (planning next)
Status: Phase 25 complete — ready to plan Phase 26
Last activity: 2026-03-06 — Phase 25 executed and verified (5 bugs fixed)

Progress: [██░░░░░░░░] 25% (1/4 phases)

### v1.9 Phases

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 25 | Critical Correctness Bugs | BUG-01..05 (5) | ✅ Complete |
| 26 | Data Fetching Cleanup | FETCH-01..08 (8) | Not started |
| 27 | TypeScript Migration | TS-01..03 (3) | Not started |
| 28 | TypeScript Strict + Store Audit | TS-04, STORE-01 (2) | Not started |

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
- [Phase 25]: BUG-04/05 root cause was Strapi route ordering — /ads/me routes shadowed by wildcard :id; frontend files restored to original state after backend fix confirmed
- [Phase 25]: useAsyncData key naming pattern: '<page>-<data>' for static pages, 'page-${param}' for dynamic routes — established as project convention
- [Phase 25]: Strapi route ordering: specific paths (e.g. /ads/me) must always be registered BEFORE wildcard param routes (:id) in the same route array

### v1.9 Context

- Pre-existing LSP errors in website stores (`ads.store.ts`, `me.store.ts`, `user.store.ts`, `packs.store.ts`, `categories.store.ts`) confirm TS-01..04 scope
- **Phase 25 DONE** — correct `useAsyncData` key pattern now established; Strapi route ordering bug fixed; `$setStructuredData` types clean
- Phase 26 (FETCH) must precede Phase 27 (TS migration) — pages being refactored should not have `lang="ts"` added mid-refactor
- Phase 27 (TS types clean) is prerequisite for Phase 28 (`typeCheck: true`) — enabling strict build before types are clean = build failure
- `mis-anuncios.vue` and `mis-ordenes.vue` are in original state (no await/key) — Phase 26 will address their data-fetching as part of the onMounted audit

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T02:49:58.744Z
Stopped at: Completed 25-01-PLAN.md — Phase 25 Critical Correctness Bugs done, ready for Phase 26 planning
Resume with: `/gsd-plan-phase 26`

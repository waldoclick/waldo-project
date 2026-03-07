---
gsd_state_version: 1.0
milestone: v1.9
milestone_name: Website Technical Debt
status: Phase 25 planned — ready to execute
stopped_at: Phase 25 plan written (25-PLAN-01.md)
last_updated: "2026-03-06T00:00:00.000Z"
last_activity: 2026-03-06 — Phase 25 planned (1 plan, 5 tasks, 1 wave)
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 1
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.9 — Website Technical Debt

## Current Position

Phase: 25 — Critical Correctness Bugs
Plan: 25-PLAN-01 (1 wave, 5 tasks — all parallel)
Status: Ready to execute
Last activity: 2026-03-06 — Phase 25 planned

Progress: ░░░░░░░░░░ 0% (0/4 phases)

### v1.9 Phases

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 25 | Critical Correctness Bugs | BUG-01..05 (5) | Not started |
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

### v1.9 Context

- Pre-existing LSP errors in website stores (`ads.store.ts`, `me.store.ts`, `user.store.ts`, `packs.store.ts`, `categories.store.ts`) confirm TS-01..04 scope
- Phase 25 (bugs) must land first — establishes correct `useAsyncData` + key patterns before Phase 26 replicates them
- Phase 26 (FETCH) must precede Phase 27 (TS migration) — pages being refactored should not have `lang="ts"` added mid-refactor
- Phase 27 (TS types clean) is prerequisite for Phase 28 (`typeCheck: true`) — enabling strict build before types are clean = build failure

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T00:00:00.000Z
Stopped at: Roadmap defined — 4 phases (25-28), 18 requirements mapped, 100% coverage
Resume with: `/gsd-plan-phase 25`

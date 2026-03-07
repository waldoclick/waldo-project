---
gsd_state_version: 1.0
milestone: v1.9
milestone_name: Website Technical Debt
status: Phase 27 planned — ready to execute 27-01-PLAN.md
Stopped at: Phase 27 plan written (27-01-PLAN.md) — ready to execute
last_updated: "2026-03-07T03:30:00.000Z"
last_activity: 2026-03-07 — Phase 27 plan written (3 tasks: 12 simple pages, stores/composables any, 6 complex pages)
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 2
  completed_plans: 2
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.9 — Website Technical Debt

## Current Position

Phase: 27 — TypeScript Migration
Plan: 27-01-PLAN.md (written, not yet executed)
Status: Plan ready — awaiting execution
Last activity: 2026-03-07 — Phase 27 plan written (3 tasks: simple page batch, stores/composables any elimination, complex pages)

Progress: [████░░░░░░] 50% (2/4 phases)

### v1.9 Phases

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 25 | Critical Correctness Bugs | BUG-01..05 (5) | ✅ Complete |
| 26 | Data Fetching Cleanup | FETCH-01..08 (8) | ✅ Complete |
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
- [Phase 26]: Parent-page preload pattern: useAsyncData at page level fills stores before child components mount — child reads stores synchronously in onMounted
- [Phase 26]: watch({ immediate: true }) for multi-parent components — avoids duplicating fetch logic when a component is used in multiple parent pages
- [Phase 26]: onMounted classification format: `// onMounted: UI-only|analytics-only|client-only fetch — [reason]` — standardized across all website components
- [Phase 26]: ResumeDefault.vue uses watch({ immediate: true }) not page-level useAsyncData — component used in both resumen.vue and gracias.vue; moving to both parents would duplicate logic
- [Phase 26]: FooterDefault economic indicator fetch intentionally client-only — non-critical footer content; onMounted(async) acceptable here

### v1.9 Context

- Pre-existing LSP errors in website stores (`ads.store.ts`, `me.store.ts`, `user.store.ts`, `packs.store.ts`, `categories.store.ts`) confirm TS-01..04 scope
- **Phase 25 DONE** — correct `useAsyncData` key pattern now established; Strapi route ordering bug fixed; `$setStructuredData` types clean
- **Phase 26 DONE** — all 7 components migrated from onMounted(async) to useAsyncData/watch({ immediate: true }); all 33 onMounted calls documented with classification comments
- Phase 27 (TS types clean) is prerequisite for Phase 28 (`typeCheck: true`) — enabling strict build before types are clean = build failure
- Pages modified in Phase 26 (`anunciar/index.vue`, `packs/comprar.vue`, `anuncios/index.vue`, `perfil/editar.vue`) are now stable — safe to add `lang="ts"` in Phase 27
- Known pre-existing LSP errors: `ads.store.ts` (6 errors), `me.store.ts` (1 error), `user.store.ts` (1 error), `packs.store.ts` (1 error), `categories.store.ts` (2 errors) — all in scope for Phase 27 TS-02

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T03:30:00.000Z
Stopped at: Phase 27 plan written — execute 27-01-PLAN.md next
Resume with: Execute 27-01-PLAN.md (3 tasks: simple pages, stores/composables, complex pages)

---
gsd_state_version: 1.0
milestone: v1.10
milestone_name: Dashboard Orders Dropdown UI
status: defining-requirements
stopped_at: Defining requirements for v1.10
last_updated: "2026-03-07T19:00:00.000Z"
last_activity: "2026-03-07 — Milestone v1.10 started"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Defining requirements for v1.10 — Dashboard Orders Dropdown UI

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-07 — Milestone v1.10 started

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
- [Phase 27]: AdWithPriceData extends Omit<Ad, fields> pattern for page-level API response types that differ from store/form types
- [Phase 27]: Inline interface pattern for useAsyncData return shapes (ProfileData, AdWithPriceData) — defined locally in page file, not in shared types
- [Phase 27]: String() cast for route.params.slug (string | string[] → string) in typed pages
- [Phase 27]: DataLayerEvent requires [key: string]: unknown index signature to allow extraData spread
- [Phase 27]: prepareSummary() refactored to zero-param — uses store already in scope, avoids typing Pinia store parameter
- [Phase 27]: AnalyticsItem exported from ad.store.ts (co-located with store logic, importable by pages)
- [Phase 28]: TS-04 deferred to Phase 29 — running typeCheck revealed 183 errors across 55 files (18x scope increase from the 10 known pre-existing errors)
- [Phase 28]: persist audit comment classification finalized: 9 CORRECT (static ref data with TTL or wizard state), 3 REVIEW (volatile UI or missing TTL), 2 RISK (query results or view-specific data that survives reload)
- [Phase 28]: Strapi SDK filter type cast pattern locked in: `filters: { ... } as unknown as Record<string, unknown>` — applied to ads.store, packs.store, categories.store, communes.store
- [Phase 29]: window.d.ts consolidates all Window globals — TypeScript merges all declare global blocks; one file avoids per-file duplication
- [Phase 29]: StrapiUser augmented in strapi.d.ts — one declaration makes custom fields available everywhere useStrapiUser() is called without a generic
- [Phase 29]: Ad.category and Ad.commune widened to union types (number | object) — models populated vs. unpopulated Strapi responses
- [Phase 29]: createError statusMessage not description — NuxtError has no description property; statusMessage is the correct H3Error field
- [Phase 29]: useAsyncData default option eliminates T | undefined without changing runtime behavior
- [Phase 29]: typeCheck: true is now the permanent setting — all future builds enforce TypeScript

### v1.9 Context

- **Phase 25 DONE** — correct `useAsyncData` key pattern now established; Strapi route ordering bug fixed; `$setStructuredData` types clean
- **Phase 26 DONE** — all 7 components migrated from onMounted(async) to useAsyncData/watch({ immediate: true }); all 33 onMounted calls documented with classification comments
- **Phase 27 DONE** — all 18 pages have `lang="ts"`; zero `any` in 3 stores and 3 composables; AnalyticsItem exported; DataLayerEvent interface defined
- **Phase 28 DONE** — STORE-01 complete (14 stores with persist audit comments); TS-04 deferred after typeCheck revealed 183 errors
- **Phase 29 DONE** — all 183 typecheck errors fixed; `typeCheck: true` enabled; `nuxt typecheck` passes with zero errors; TS-04 complete

### Milestone v1.9 — COMPLETE

All 18 requirements satisfied:
- BUG-01..05: Critical correctness bugs (Phase 25)
- FETCH-01..08: Data fetching cleanup (Phase 26)
- TS-01..03: TypeScript migration (Phase 27)
- STORE-01: Store persist audit (Phase 28)
- TS-04: typeCheck: true enabled (Phase 29)

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T19:00:00.000Z
Stopped at: Defining requirements for v1.10
Resume with: `/gsd-new-milestone` — continue to requirements and roadmap

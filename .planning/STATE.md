---
gsd_state_version: 1.0
milestone: v1.9
milestone_name: Website Technical Debt
status: Phase 28 closed — Phase 29 is next
Stopped at: Phase 28 closed (STORE-01 complete, TS-04 deferred to Phase 29)
last_updated: "2026-03-07T14:00:00.000Z"
last_activity: 2026-03-07 — Phase 28 closed; STORE-01 complete (14 stores with persist audit comments); TS-04 deferred after typeCheck revealed 183 errors across 55 files
progress:
  total_phases: 5
  completed_phases: 3
  partial_phases: 1
  total_plans: 5
  completed_plans: 4
  percent: 70
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.9 — Website Technical Debt

## Current Position

Phase: 29 — TypeScript Strict Errors
Plan: not yet written
Status: Ready to plan Phase 29
Last activity: 2026-03-07 — Phase 28 closed (STORE-01 complete; TS-04 deferred — 183 typecheck errors across 55 files discovered)

Progress: [███████░░░] 70% (3.5/5 phases — Phase 28 partial)

### v1.9 Phases

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 25 | Critical Correctness Bugs | BUG-01..05 (5) | ✅ Complete |
| 26 | Data Fetching Cleanup | FETCH-01..08 (8) | ✅ Complete |
| 27 | TypeScript Migration | TS-01..03 (3) | ✅ Complete |
| 28 | TypeScript Strict + Store Audit | TS-04 (deferred), STORE-01 (done) | ⚠️ Partial |
| 29 | TypeScript Strict Errors | TS-04 | Not started |

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

### v1.9 Context

- **Phase 25 DONE** — correct `useAsyncData` key pattern now established; Strapi route ordering bug fixed; `$setStructuredData` types clean
- **Phase 26 DONE** — all 7 components migrated from onMounted(async) to useAsyncData/watch({ immediate: true }); all 33 onMounted calls documented with classification comments
- **Phase 27 DONE** — all 18 pages have `lang="ts"`; zero `any` in 3 stores and 3 composables; AnalyticsItem exported; DataLayerEvent interface defined
- **Phase 28 CLOSED (partial)** — STORE-01 complete (14 stores with persist audit comments); TS-04 deferred
- **Phase 29 scope** — Fix 183 typecheck errors across 55 files, then enable `typeCheck: true`

### Phase 29 Error Catalogue (from Phase 28 typeCheck run)

183 errors across 55 files. Known categories:

1. **Window globals** — `window.$crisp`, `window.dataLayer`, `window.google` have no type declarations
2. **Plugin type augmentation** — `$strapi`, `$setStructuredData`, `$sentry`, `$reCaptcha` not in NuxtApp interface
3. **User type mismatches** — `useAuth()` / `useStrapiUser()` return type incompatible with local `User` interface
4. **API response mismatches** — Strapi SDK return shapes differ from manually-typed store interfaces
5. **Vue component prop types** — implicit `any` on props in migrated pages
6. **Composable return type gaps** — inferred types incompatible with explicit annotations added in Phase 27

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T14:00:00.000Z
Stopped at: Phase 28 closed — plan and execute Phase 29 next
Resume with: Plan Phase 29 (29-01-PLAN.md): fix 183 typecheck errors across 55 files, then enable typeCheck: true

---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: milestone
status: planning
stopped_at: Completed 47-01-PLAN.md
last_updated: "2026-03-08T14:25:15.033Z"
last_activity: 2026-03-08 — Roadmap created
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 2
  completed_plans: 1
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.20 — TypeScript any Elimination — Phase 47 next

## Current Position

Phase: 47 (not started)
Plan: —
Status: Roadmap ready — planning Phase 47
Last activity: 2026-03-08 — Roadmap created

### v1.20 Phase List

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 47 | Ad API any Elimination | TSANY-01–07 | Not started |
| 48 | Type Files + Flow Service any Elimination | TSANY-08–12 | Not started |
| 49 | Zoho + Facto + Other Services any Elimination | TSANY-13–23 | Not started |
| 50 | Payment Utils + Middlewares any Elimination | TSANY-24–32 | Not started |
| 51 | Seeders + Test Files any Elimination | TSANY-33–36 | Not started |

## Accumulated Context

### Decisions

All decisions from v1.1–v1.19 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.9**: `typeCheck: true` permanently enabled in both apps
- [Phase 33-34]: GTM delivered via `@saslavik/nuxt-gtm` module in both apps
- **v1.15**: `$setSEO` derives ogTitle/ogDescription from title/description — zero call-site changes when extending plugin
- **v1.15**: `key: "structured-data"` on useHead script entry prevents JSON-LD accumulation on SPA nav
- **v1.15**: `useSeoMeta({ robots: "noindex, nofollow" })` for private page noindex defense-in-depth
- **v1.16**: `descPart` leading-space pattern eliminates double-space when ad description is null
- **v1.16**: `descPrefix`/`descSuffix` split for budget-aware ad description slicing
- **v1.17**: Use `strapi.db.query` to bypass content-API sanitizer for server-enforced role filtering
- **v1.17**: Use `dsn: undefined` pattern (not conditional init) in sentry.*.config.ts
- **v1.18**: `stepRoutes` Record map pattern for wizard step-to-URL routing in `CreateAd.vue`
- **v1.18**: Per-page analytics — each wizard step page owns its own `stepView` in `onMounted`; no centralized watcher
- **v1.18**: `if (import.meta.server) return;` is mandatory first line of any client-only middleware reading a localStorage-backed store
- **v1.19**: Floating promise pattern for any Zoho sync inside a redirect handler — capture variables before `Promise.resolve().then()`
- **v1.19**: First-publish guard pattern: `isPending` check before firing any "ad published" side effects
- **v1.19**: Zoho stage names must match CRM pipeline exactly — validate before hardcoding
- [Phase 47-ad-api-any-elimination]: Use AdQueryOptions interface for ad service methods replacing options: any — Expresses intent for query shape; allows typed access to page, pageSize, filters, sort, populate, orderBy, pagination fields
- [Phase 47-ad-api-any-elimination]: Strapi SDK v5 cast pattern for entityService filter params — filters as unknown as Record<string, unknown> — matches AGENTS.md Strapi SDK v5 cast pattern; used in meCounts controller for all 5 entityService.count calls

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-08T14:25:04.030Z
Stopped at: Completed 47-01-PLAN.md
Resume with: `/gsd-plan-phase 47`

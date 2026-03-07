---
gsd_state_version: 1.0
milestone: v1.16
milestone_name: Website Meta Copy Audit
status: DEFINING_REQUIREMENTS
stopped_at: Milestone started — running research
last_updated: "2026-03-07T23:00:00.000Z"
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
**Current focus:** v1.16 — defining requirements (Website Meta Copy Audit)

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements

## Accumulated Context

### Decisions

All decisions from v1.1–v1.15 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.9**: `typeCheck: true` permanently enabled in both apps
- [Phase 33-34]: GTM delivered via `@saslavik/nuxt-gtm` module in both apps
- **v1.15**: `$setSEO` derives ogTitle/ogDescription from title/description — zero call-site changes when extending plugin
- **v1.15**: `key: "structured-data"` on useHead script entry prevents JSON-LD accumulation on SPA nav
- **v1.15**: `useSeoMeta({ robots: "noindex, nofollow" })` for private page noindex defense-in-depth

### Pending Todos

None — requirements definition in progress.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T23:00:00.000Z
Stopped at: Milestone v1.16 started — research phase
Resume with: Continue requirements definition

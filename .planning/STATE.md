---
gsd_state_version: 1.0
milestone: v1.19
milestone_name: — Next Milestone (TBD)
status: planning
stopped_at: v1.18 milestone complete
last_updated: "2026-03-08T03:00:00.000Z"
last_activity: 2026-03-08 — v1.18 milestone archived
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Planning v1.19 — next milestone TBD

## Current Position

Status: v1.18 complete — ready for next milestone
Plan: —
Last activity: 2026-03-08 — v1.18 archived (Phase 42 complete, wizard-guard added, milestone committed + tagged)

```
Progress: [░░░░░░░░░░] 0% — no active milestone
```

## Accumulated Context

### Decisions

All decisions from v1.1–v1.18 are logged in PROJECT.md Key Decisions table.

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
- **v1.18**: `wizard-guard.ts` — step-skip prevention middleware; client-only; redirects to first incomplete step

### Pending Todos

None — v1.18 complete and archived. Ready for `/gsd-new-milestone`.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-08
Stopped at: v1.18 milestone archived
Resume with: `/gsd-new-milestone`

---
gsd_state_version: 1.0
milestone: v1.13
milestone_name: GTM Module Migration
status: planned
stopped_at: Phase 33 planned — ready to execute
last_updated: "2026-03-07T15:00:00.000Z"
last_activity: 2026-03-07 — v1.12 complete, v1.13 planned (GTM module migration)
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 1
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.13 — GTM Module Migration (PLANNED)

## Current Position

Phase: 33 — GTM Module Migration (planned)
Plan: 0 of 1 complete
Status: planned — ready to execute

```
[░░░░░░░░░░]   0% — 0/1 phases complete (v1.13)
```

## Accumulated Context

### Decisions

All decisions from v1.1–v1.12 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.5**: Reservation freeing updates reservation side (FK lives on reservation), not ad side
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.7 cron pattern**: class-based service, `logger` from `../utils/logtail`, per-item try/catch inside user loop
- **v1.8**: Free ad reservations stay permanently linked to their ad when it expires — never unlinked
- **v1.8**: `restoreUserFreeReservations` counts pool as: `ad=null` + `ad.active=true`
- **v1.8**: Cron parallelization pattern — `Promise.all` in batches of 50
- [Phase 25]: useAsyncData key naming pattern: '<page>-<data>' for static pages, 'page-${param}' for dynamic routes
- [Phase 25]: Strapi route ordering: specific paths must always be registered BEFORE wildcard param routes
- [Phase 26]: Parent-page preload pattern: useAsyncData at page level fills stores before child components mount
- [Phase 26]: watch({ immediate: true }) for multi-parent components — avoids duplicating fetch logic
- [Phase 26]: onMounted classification format: `// onMounted: UI-only|analytics-only|client-only fetch — [reason]`
- [Phase 27]: AdWithPriceData extends Omit<Ad, fields> pattern for page-level API response types
- [Phase 27]: Inline interface pattern for useAsyncData return shapes — defined locally in page file
- [Phase 28]: persist audit comment classification: 9 CORRECT, 3 REVIEW, 2 RISK
- [Phase 28]: Strapi SDK filter type cast pattern: `filters: { ... } as unknown as Record<string, unknown>`
- [Phase 29]: window.d.ts consolidates all Window globals
- [Phase 29]: StrapiUser augmented in strapi.d.ts
- [Phase 29]: useAsyncData default option eliminates T | undefined
- [Phase 29]: typeCheck: true is now the permanent setting
- [Phase 30]: getBuyerName wrapper pattern — formatFullName takes (firstname, lastname) separately; wrapper adds username/email fallback chain for OrderUser objects
- [Phase 31-gtm-plugin-consent-mode-v2]: Removed gtag() shim entirely — all dataLayer interactions use direct window.dataLayer.push() with plain objects
- [Phase 31-gtm-plugin-consent-mode-v2]: Consent Mode v2: push default denial before GTM script injection; LightboxCookies pushes update command (flat structure) on user acceptance
- [Phase 32-analytics-gaps]: window.dataLayer typed as (DataLayerEvent | Record<string, unknown>)[] — union covers GA4 events and GTM consent commands
- [Phase 32-analytics-gaps]: DataLayerEvent.ecommerce accepts null to support GTM ecommerce clear pattern
- [Phase 32-analytics-gaps]: step_view fires from onMounted (step 1, once) + watcher (steps 2-5 on change); no immediate:true on step watcher

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07
Stopped at: v1.12 complete — tagged v1.12; v1.13 GTM Module Migration planned
Resume with: `/gsd-execute-phase 33-gtm-module-migration`

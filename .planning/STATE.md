---
gsd_state_version: 1.0
milestone: v1.14
milestone_name: GTM Module Dashboard
status: planning
stopped_at: roadmap written — ready for /gsd-plan-phase 34
last_updated: "2026-03-07T16:30:00.000Z"
last_activity: 2026-03-07 — v1.14 started, requirements confirmed
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.14 — GTM Module: Dashboard. Install `@saslavik/nuxt-gtm` in `apps/dashboard`, mirror the v1.13 website configuration, and remove legacy `gtmId` flat field.

## Current Position

Phase: 34 — GTM Module: Dashboard (planning)
Plan: 0 of 1 complete
Status: planning — roadmap not yet written

```
[__________] 0% — 0/1 phases complete (v1.14)
```

## Accumulated Context

### Decisions

All decisions from v1.1–v1.13 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.9**: `typeCheck: true` permanently enabled in both apps
- [Phase 33-gtm-module-migration]: GTM delivered via @saslavik/nuxt-gtm module (NOT @nuxtjs/gtm which is Nuxt 2 only)
- [Phase 33-gtm-module-migration]: Module config: top-level `gtm: { id, enableRouterSync: true, debug: false }` in nuxt.config.ts
- [Phase 33-gtm-module-migration]: runtimeConfig.public.gtm.id replaces gtmId — optional chaining `?.id` in feature flags

### v1.14 Context

- `apps/dashboard/nuxt.config.ts` currently has `gtmId: process.env.GTM_ID || "GTM-N4B8LDKS"` in `runtimeConfig.public` — needs migration to `gtm: { id }`
- `apps/dashboard/package.json` does NOT have `@saslavik/nuxt-gtm` — needs installing
- Dashboard has no `gtm.client.ts` plugin to delete (unlike website in v1.13)
- Dashboard has no `useAppConfiguration` composable — no feature flag to update
- CSP in dashboard `nuxt.config.ts` already includes `https://www.googletagmanager.com` in `script-src` and `frame-src` — no CSP changes needed
- Reference implementation: `apps/website/nuxt.config.ts` (v1.13 output)

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07
Stopped at: roadmap written — ready for `/gsd-plan-phase 34`
Next: `/gsd-plan-phase 34`

---
gsd_state_version: 1.0
milestone: v1.18
milestone_name: Ad Creation URL Refactor
status: in_progress
stopped_at: Defining requirements
last_updated: "2026-03-07T00:00:00.000Z"
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
**Current focus:** v1.18 — Ad Creation URL Refactor

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-07 — Milestone v1.18 started

## Accumulated Context

### Decisions

All decisions from v1.1–v1.17 are logged in PROJECT.md Key Decisions table.

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

### v1.18 Context

- **Current wizard:** `/anunciar` (index.vue) hosts all 5 steps via `?step=N` query params
- **Step routing:** adStore.step synced manually to `route.query.step` on mount; `router.push({ query: { step: N } })` on next/back
- **Step components:** FormCreateOne (step 1), FormCreateTwo (2), FormCreateThree (3), FormCreateFour (4), FormCreateFive (5) — all `v-if="step === N"` inside `<ClientOnly>`
- **Target routes:** `/anunciar/tipo-de-anuncio`, `/anunciar/datos-del-producto`, `/anunciar/datos-personales`, `/anunciar/ficha-de-producto`, `/anunciar/galeria-de-imagenes`
- **Store:** adStore.step stays as number (1–5) for internal ordering; URL is navigation source of truth
- **Analytics:** Keep Google Ecommerce-compatible English step names (`"Payment Method"`, `"General"`, etc.)
- **resumen.vue back:** Currently `/anunciar?step=5` → must update to `/anunciar/galeria-de-imagenes`
- **Untouched:** `/anunciar/resumen`, `/anunciar/gracias`, `/anunciar/error`
- **Rendering:** All step pages are client-only (`<ClientOnly>` or `definePageMeta` client-side)
- **AGENTS.md rule:** `git mv` for all Nuxt page directory and file renames (preserves Git rename history)
- **Existing phase 39** in roadmap (Spanish Default Language) is already there — v1.18 phases continue from 42

### Pending Todos

None — milestone just started.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07
Stopped at: Milestone v1.18 started — requirements being defined
Resume with: `/gsd-plan-phase 42` after roadmap is created

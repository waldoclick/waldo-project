---
gsd_state_version: 1.0
milestone: v1.18
milestone_name: — Ad Creation URL Refactor
status: Roadmap created — awaiting phase plan
stopped_at: Completed 42-02-PLAN.md
last_updated: "2026-03-08T00:36:37.528Z"
last_activity: 2026-03-07 — Roadmap created for v1.18
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 4
  completed_plans: 2
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.18 — Ad Creation URL Refactor

## Current Position

Phase: 42 — Ad Creation URL Refactor
Plan: —
Status: Roadmap created — awaiting phase plan
Last activity: 2026-03-07 — Roadmap created for v1.18

```
Progress: [░░░░░░░░░░] 0% — Phase 42 not started
```

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
- [Phase 42-ad-creation-url-refactor]: Used onMounted (not watcher) for updateStep + stepView in each new step page — mount is the correct trigger since each page mounts on navigation — Consistent with index.vue step 1 pattern; avoids overcounting on back-navigation
- [Phase 42-ad-creation-url-refactor]: No architectural changes needed — both fixes were single-line edits to existing files

### v1.18 Context

- **Current wizard:** `/anunciar` (index.vue) hosts all 5 steps via `?step=N` query params
- **Step routing:** adStore.step synced manually to `route.query.step` on mount; `router.push({ query: { step: N } })` on next/back
- **Step components:** FormCreateOne (step 1), FormCreateTwo (2), FormCreateThree (3), FormCreateFour (4), FormCreateFive (5) — all `v-if="step === N"` inside `<ClientOnly>`
- **Target routes:**
  - `/anunciar` → Step 1 (FormCreateOne) — index.vue stays as entry point
  - `/anunciar/datos-del-producto` → Step 2 (FormCreateTwo) — new page
  - `/anunciar/datos-personales` → Step 3 (FormCreateThree) — new page
  - `/anunciar/ficha-de-producto` → Step 4 (FormCreateFour) — new page
  - `/anunciar/galeria-de-imagenes` → Step 5 (FormCreateFive) — new page
- **Store:** adStore.step stays as number (1–5) for internal ordering; URL is navigation source of truth
- **Analytics:** Keep Google Ecommerce-compatible English step names (`"Payment Method"`, `"General"`, `"Personal Information"`, `"Product Sheet"`, `"Image Gallery"`)
- **resumen.vue back:** Currently `/anunciar?step=5` → must update to `/anunciar/galeria-de-imagenes`
- **Untouched:** `/anunciar/resumen`, `/anunciar/gracias`, `/anunciar/error`
- **Rendering:** All step pages are client-only (`<ClientOnly>` or `definePageMeta` client-side)
- **AGENTS.md rule:** `git mv` for all Nuxt page directory and file renames (preserves Git rename history)
- **Key files changing:**
  - `apps/website/app/pages/anunciar/index.vue` (step 1 shell, simplify to only host FormCreateOne)
  - NEW: `apps/website/app/pages/anunciar/datos-del-producto.vue`
  - NEW: `apps/website/app/pages/anunciar/datos-personales.vue`
  - NEW: `apps/website/app/pages/anunciar/ficha-de-producto.vue`
  - NEW: `apps/website/app/pages/anunciar/galeria-de-imagenes.vue`
  - `apps/website/app/pages/anunciar/resumen.vue` (back button fix only)
  - `apps/website/app/stores/ad.store.ts` (step sync logic: route path → step number)
  - `apps/website/app/components/CreateAd.vue` (navigation: `router.push` to named routes, not `?step=N`)

### Pending Todos

None — roadmap created, ready for `/gsd-plan-phase 42`.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-08T00:36:33.926Z
Stopped at: Completed 42-02-PLAN.md
Resume with: `/gsd-plan-phase 42`

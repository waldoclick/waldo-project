---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: milestone
status: ROADMAP_DEFINED — awaiting `/gsd-plan-phase 36`
stopped_at: Completed 36-1-PLAN.md — SEO Bug Fixes
last_updated: "2026-03-07T18:11:13.457Z"
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.16 — roadmap defined, ready to plan Phase 36

## Current Position

Phase: 36 (next to plan)
Plan: —
Status: ROADMAP_DEFINED — awaiting `/gsd-plan-phase 36`

```
Progress: ░░░░░░░░░░ 0% (0/3 phases complete)
```

## Phase Registry

### Phase 36: SEO Bug Fixes
**Goal:** Eliminate double-suffix titles, remove stale counters, and add missing noindex on `packs/index.vue` so all crawlable pages emit clean, well-formed title and description tags.
**Requirements:** BUG-01, BUG-02, BUG-03, BUG-04
**Files to change:**
- `apps/website/app/pages/anuncios/[slug].vue` — strip `| Venta de Equipo en Waldo.click` from title template; add `®` to trailing brand string in description; guard against double-space when `newData.description` is null/empty
- `apps/website/app/pages/[slug].vue` — strip manually embedded `| Waldo.click®` from title template; remove `${totalAds}` counter from description template
- `apps/website/app/pages/anuncios/index.vue` — ensure `$setSEO` executes in an SSR-safe context (not only inside `watch(route.query)`); add `®` to trailing `Waldo.click` brand string in `generateSEODescription()`
- `apps/website/app/pages/packs/index.vue` — add `useSeoMeta({ robots: "noindex, nofollow" })`
**Acceptance criteria:**
- `anuncios/[slug].vue`: browser `<title>` for an ad named "Torno CNC en Santiago" renders as `Torno CNC en Santiago | Waldo.click®` (one separator, no `Venta de Equipo` fragment); description contains `Waldo.click®`; when `newData.description` is null, no double-space appears in the description
- `[slug].vue`: browser `<title>` renders as `Perfil de {username} | Waldo.click®` (single `| Waldo.click®` suffix); description string contains no `${totalAds}` interpolation and no numeric ad count
- `anuncios/index.vue`: SSR-rendered HTML `<title>` is non-empty on first server response (not deferred to client); description ends with `Waldo.click®` (with ®) in all code branches
- `packs/index.vue`: page `<meta name="robots">` contains `noindex, nofollow`
**Estimated complexity:** M

---

### Phase 37: Dynamic Page Copy
**Goal:** The four highest-traffic public pages carry SERP-ready copy that uses canonical vocabulary (`anuncios`, `activos industriales`, `Waldo.click®`), respects the 45-char title budget and 120–155-char description budget, and is free of stale counters.
**Requirements:** COPY-01, COPY-02, COPY-03, COPY-04
**Depends on:** Phase 36 (bugs fixed; templates are clean before copy is written)
**Files to change:**
- `apps/website/app/pages/index.vue` — rewrite `$setSEO({ title, description })` strings
- `apps/website/app/pages/anuncios/index.vue` — rewrite all branches of `generateSEOTitle()` and `generateSEODescription()` using canonical vocabulary and removing any dynamic counters
- `apps/website/app/pages/anuncios/[slug].vue` — rewrite title and description template strings (after BUG-01 fix); adjust `ad.description` slice budget so full description stays 120–155 chars
- `apps/website/app/pages/[slug].vue` — rewrite title and description template strings (after BUG-02 fix)
**Acceptance criteria:**
- `index.vue`: `$setSEO` title ≤ 45 chars; uses at least one of `anuncios` / `activos industriales`; contains no `avisos`, `maquinaria industrial`, or `clasificados`; description is 120–155 chars; `"${title} | Waldo.click®".length <= 60`
- `anuncios/index.vue`: default-state title (no filters) ≤ 45 chars; category-only branch title ≤ 45 chars; commune-only branch title ≤ 45 chars; all description branches are 120–155 chars and end with `Waldo.click®`; no `${totalAds}` or `${count}` in any description branch
- `anuncios/[slug].vue`: title template for a 30-char ad name + 12-char commune stays ≤ 45 chars; description for a 60-char ad description is 120–155 chars; description for a null ad description is 120–155 chars with no double-space; description contains `Waldo.click®`
- `[slug].vue`: title template for a 20-char username stays ≤ 45 chars; description is 120–155 chars; contains no numeric interpolation; uses canonical vocabulary
**Estimated complexity:** M

---

### Phase 38: Static Page Copy
**Goal:** All four public static pages carry distinct, keyword-rich SERP copy using canonical vocabulary, with titles ≤ 45 chars and descriptions 120–155 chars.
**Requirements:** COPY-05, COPY-06, COPY-07, COPY-08
**Depends on:** Phase 36 (vocabulary conventions confirmed and bugs fixed)
**Files to change:**
- `apps/website/app/pages/preguntas-frecuentes.vue` — rewrite `$setSEO({ title, description })` strings
- `apps/website/app/pages/contacto/index.vue` — rewrite `$setSEO({ title, description })` strings; expand title beyond single word `Contacto`
- `apps/website/app/pages/sitemap.vue` — rewrite `$setSEO({ title, description })` strings; replace `Waldo.click` with `Waldo.click®` in description
- `apps/website/app/pages/politicas-de-privacidad.vue` — rewrite `$setSEO({ title, description })` strings
**Acceptance criteria:**
- `preguntas-frecuentes.vue`: title ≤ 45 chars; description 120–155 chars; copy uses `anuncios` and/or `activos industriales` and `Waldo.click®`; no `avisos`, `maquinaria industrial`, or `clasificados`
- `contacto/index.vue`: title is NOT `Contacto` alone (must be more descriptive); title ≤ 45 chars; `"${title} | Waldo.click®"` is unique across all indexed pages; description 120–155 chars
- `sitemap.vue`: description contains `Waldo.click®` (with ®, not bare `Waldo.click`); title ≤ 45 chars; description 120–155 chars
- `politicas-de-privacidad.vue`: title ≤ 45 chars; description 120–155 chars; copy uses canonical vocabulary; no forbidden terms
**Estimated complexity:** S

---

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
- [Phase 36]: descPart variable with leading space eliminates double-space when ad description is null
- [Phase 36]: SSR-safe $setSEO placed at synchronous top-level scope above watch block in anuncios/index.vue
- [Phase 36]: useSeoMeta({ robots: noindex, nofollow }) added to packs/index.vue, login/facebook.vue, login/google.vue, dev.vue

### v1.16 Canonical Vocabulary (hard constraints)
- ✅ `anuncios` — NEVER `avisos`, NEVER `clasificados`
- ✅ `activos industriales` — NEVER `maquinaria industrial`
- ✅ `Waldo.click®` — with ® symbol always (never plain `Waldo.click`)
- Title budget: ≤ 45 chars per `$setSEO` title param (`| Waldo.click®` is appended automatically — 15 chars — so rendered title ≤ 60 chars total)
- Description budget: 120–155 chars
- Titles MUST NOT contain `| Waldo.click` — module adds it; manual inclusion doubles the suffix

### Pending Todos

None — roadmap defined, ready to plan phases.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-07T18:11:13.451Z
Stopped at: Completed 36-1-PLAN.md — SEO Bug Fixes
Resume with: `/gsd-plan-phase 36`

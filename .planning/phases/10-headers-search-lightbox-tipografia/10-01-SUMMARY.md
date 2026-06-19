---
phase: 10-headers-search-lightbox-tipografia
plan: 01
subsystem: ui
tags: [nuxt, vue, scss, header, navigation, bem]

# Dependency graph
requires: []
provides:
  - HeaderDefault.vue with showMenu default: true (nav visible on all content pages)
  - 19 flow pages with explicit :show-menu="false" to suppress nav
  - _header.scss with position:fixed, z-index:50, transition cubic-bezier, backdrop-filter always-on
affects: [10-02, 10-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "showMenu prop default flipped to true — explicit :show-menu='false' on flow pages to suppress"
    - "Header fixed positioning with cubic-bezier transition for headroom hide/show behavior"
    - "Backdrop-filter always-on (not scroll-conditional) for persistent glass effect"

key-files:
  created: []
  modified:
    - apps/website/app/components/HeaderDefault.vue
    - apps/website/app/pages/anunciar/index.vue
    - apps/website/app/pages/anunciar/datos-del-producto.vue
    - apps/website/app/pages/anunciar/datos-personales.vue
    - apps/website/app/pages/anunciar/ficha-de-producto.vue
    - apps/website/app/pages/anunciar/galeria-de-imagenes.vue
    - apps/website/app/pages/anunciar/resumen.vue
    - apps/website/app/pages/anunciar/gracias.vue
    - apps/website/app/pages/anunciar/error.vue
    - apps/website/app/pages/pagar/index.vue
    - apps/website/app/pages/pagar/gracias.vue
    - apps/website/app/pages/pagar/error.vue
    - apps/website/app/pages/packs/index.vue
    - apps/website/app/pages/packs/comprar.vue
    - apps/website/app/pages/packs/gracias.vue
    - apps/website/app/pages/packs/error.vue
    - apps/website/app/pages/pro/pagar/index.vue
    - apps/website/app/pages/pro/pagar/gracias.vue
    - apps/website/app/pages/pro/error.vue
    - apps/website/app/pages/pro/gracias.vue
    - apps/website/app/scss/components/_header.scss

key-decisions:
  - "showMenu default flipped to true before adding :show-menu=false guards — Task 1 must run before Task 2 to avoid exposing nav on flow pages during the transition"
  - "Scroll-conditional background modifiers (--scrolled-dark, --scrolled-light, --white) deleted entirely — backdrop-filter is always-on per design; no rgba bg on scroll"
  - "transition narrowed from 'all 0.3s ease-in-out' to 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' — animates only transform for headroom hide/show, not all properties"

patterns-established:
  - "Flow page nav suppression: add :show-menu='false' to HeaderDefault on every checkout/wizard page"
  - "Header fixed with headroom: position:fixed + z-index:50 + transition:transform cubic-bezier; .header--default--hidden sets translateY(-100%)"

requirements-completed: [HDR-PUBLIC]

# Metrics
duration: 35min
completed: 2026-06-19
---

# Phase 10 Plan 01: Header Público — showMenu default flip + position:fixed + transition Summary

**showMenu default flipped to true with :show-menu="false" guards on 19 flow pages; header changed from position:sticky to position:fixed with cubic-bezier transition and always-on backdrop-filter, removing scroll-conditional background modifiers**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-19T17:00:00Z
- **Completed:** 2026-06-19T17:46:14Z
- **Tasks:** 3 auto + 1 checkpoint (approved)
- **Files modified:** 21

## Accomplishments
- 19 flow pages (anunciar/*, pagar/*, packs/*, pro/*) now have explicit `:show-menu="false"` — nav suppressed safely before the default flip
- `HeaderDefault.vue` `showMenu` default changed from `false` → `true`; all content pages (/anuncios, /blog, /[slug], etc.) now show nav automatically without any prop change
- `_header.scss` updated: `position:fixed`, `z-index:50`, `transition:transform 0.35s cubic-bezier(0.4,0,0.2,1)`, and three scroll-background modifiers (`--scrolled`, `--scrolled-dark`, `--scrolled-light`, `--white`) deleted entirely

## Task Commits

Each task was committed atomically:

1. **Task 1: Agregar :show-menu="false" a todas las páginas de flujo** - `625b577e` (feat)
2. **Task 2: Cambiar showMenu default a true en HeaderDefault.vue** - `143d68b1` (feat)
3. **Task 3: Actualizar _header.scss — position:fixed, z-index:50, transition, limpiar scroll modifiers** - `75d8b727` (fix)

**Plan metadata:** (pending — this commit)

## Files Created/Modified
- `apps/website/app/components/HeaderDefault.vue` — showMenu default changed false → true
- `apps/website/app/pages/anunciar/index.vue` — added :show-menu="false"
- `apps/website/app/pages/anunciar/datos-del-producto.vue` — added :show-menu="false"
- `apps/website/app/pages/anunciar/datos-personales.vue` — added :show-menu="false"
- `apps/website/app/pages/anunciar/ficha-de-producto.vue` — added :show-menu="false"
- `apps/website/app/pages/anunciar/galeria-de-imagenes.vue` — added :show-menu="false"
- `apps/website/app/pages/anunciar/resumen.vue` — added :show-menu="false"
- `apps/website/app/pages/anunciar/gracias.vue` — added :show-menu="false"
- `apps/website/app/pages/anunciar/error.vue` — added :show-menu="false"
- `apps/website/app/pages/pagar/index.vue` — added :show-menu="false"
- `apps/website/app/pages/pagar/gracias.vue` — added :show-menu="false"
- `apps/website/app/pages/pagar/error.vue` — added :show-menu="false"
- `apps/website/app/pages/packs/index.vue` — added :show-menu="false" (preserved is-trasparent="true")
- `apps/website/app/pages/packs/comprar.vue` — added :show-menu="false"
- `apps/website/app/pages/packs/gracias.vue` — added :show-menu="false"
- `apps/website/app/pages/packs/error.vue` — added :show-menu="false"
- `apps/website/app/pages/pro/pagar/index.vue` — added :show-menu="false"
- `apps/website/app/pages/pro/pagar/gracias.vue` — added :show-menu="false"
- `apps/website/app/pages/pro/error.vue` — added :show-menu="false"
- `apps/website/app/pages/pro/gracias.vue` — added :show-menu="false"
- `apps/website/app/scss/components/_header.scss` — position:fixed, z-index:50, cubic-bezier transition, scroll modifiers removed

## Decisions Made
- Task 1 (add guards) was required to execute strictly before Task 2 (flip default) to avoid a window where flow pages would briefly show nav unexpectedly
- Scroll-conditional background modifiers deleted rather than kept as dead code — they conflict with the always-on backdrop-filter design and their class names no longer exist in the JS headroom logic
- `packs/index.vue` special case preserved: `is-trasparent="true"` kept alongside the new `:show-menu="false"` — transparent header on the dark packs hero was already correct behavior

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 10-02 (LightboxSearch) and 10-03 (Header cuenta + dashboard typography) can begin in parallel — file ownership is disjoint from this plan
- HeaderDefault.vue is stable; 10-02/10-03 do not need to modify showMenu logic

---
*Phase: 10-headers-search-lightbox-tipografia*
*Completed: 2026-06-19*

---
phase: 35-website-seo-audit
plan: 02
subsystem: ui
tags: [nuxt, seo, structured-data, schema-org, noindex, vue3]

requires:
  - phase: 35-01
    provides: Extended $setSEO plugin + hardcoded URL replacement

provides:
  - SEO coverage added to packs/index.vue, packs/comprar.vue, cuenta/mis-ordenes.vue, cuenta/mis-anuncios.vue
  - User profile page [slug].vue SEO restored with ProfilePage + Person schema
  - WebSite + Organization structured data on home page (index.vue) with SearchAction
  - noindex added to all 18 private/transactional pages

affects: [35-03, future-seo-pages]

tech-stack:
  added: []
  patterns:
    - useSeoMeta({ robots: "noindex, nofollow" }) for private page noindex
    - watch() with immediate:true for SEO on data-dependent pages (profile, packs/gracias)
    - $setStructuredData([WebSite, Organization]) for home page multi-schema

key-files:
  created: []
  modified:
    - apps/website/app/pages/index.vue
    - apps/website/app/pages/[slug].vue
    - apps/website/app/pages/packs/index.vue
    - apps/website/app/pages/packs/comprar.vue
    - apps/website/app/pages/packs/gracias.vue
    - apps/website/app/pages/packs/error.vue
    - apps/website/app/pages/cuenta/mis-ordenes.vue
    - apps/website/app/pages/cuenta/mis-anuncios.vue
    - apps/website/app/pages/cuenta/index.vue
    - apps/website/app/pages/cuenta/perfil/index.vue
    - apps/website/app/pages/cuenta/perfil/editar.vue
    - apps/website/app/pages/cuenta/avatar.vue
    - apps/website/app/pages/cuenta/cover.vue
    - apps/website/app/pages/cuenta/username.vue
    - apps/website/app/pages/cuenta/cambiar-contrasena.vue
    - apps/website/app/pages/anunciar/index.vue
    - apps/website/app/pages/anunciar/resumen.vue
    - apps/website/app/pages/anunciar/gracias.vue
    - apps/website/app/pages/anunciar/error.vue
    - apps/website/app/pages/login/index.vue
    - apps/website/app/pages/registro.vue
    - apps/website/app/pages/recuperar-contrasena.vue
    - apps/website/app/pages/restablecer-contrasena.vue

key-decisions:
  - "packs/comprar.vue had no $setSEO at all — added SEO + noindex together"
  - "cuenta/mis-ordenes.vue and cuenta/mis-anuncios.vue also had no $setSEO — added with noindex"
  - "[slug].vue entire SEO block was commented out — replaced with working watch() implementation"
  - "packs/gracias.vue noindex placed before watch() block (data-dependent SEO)"

patterns-established:
  - "noindex pattern: useSeoMeta({ robots: 'noindex, nofollow' }) immediately after $setSEO call"
  - "Data-dependent SEO: watch(data, handler) with immediate:true for async-loaded pages"

requirements-completed: [SEO-03, SEO-04, SEO-05, SEO-07]

duration: 45min
completed: 2026-03-07
---

# Plan 35-02: SEO Coverage + Noindex Summary

**Missing SEO added to 4 pages, profile page SEO restored, home page WebSite/Organization schema added, noindex applied to all 18 private/transactional pages**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-07T21:00:00Z
- **Completed:** 2026-03-07T21:45:00Z
- **Tasks:** 4 (SEO-03, SEO-04, SEO-05, SEO-07)
- **Files modified:** 23

## Accomplishments

- Added `$setSEO` + `$setStructuredData` to `packs/index.vue`, `packs/comprar.vue`, `cuenta/mis-ordenes.vue`, `cuenta/mis-anuncios.vue`
- Restored commented-out SEO block in `[slug].vue` with working `watch()` + ProfilePage/Person schema
- Added `$setStructuredData([WebSite, Organization])` with `SearchAction` to `index.vue`
- Applied `useSeoMeta({ robots: "noindex, nofollow" })` to all 18 private/transactional pages

## Files Created/Modified

- `apps/website/app/pages/index.vue` — WebSite + Organization structured data added
- `apps/website/app/pages/[slug].vue` — Commented-out SEO block replaced with watch()-based implementation
- `apps/website/app/pages/packs/index.vue` — $setSEO + $setStructuredData + WebPage schema added
- `apps/website/app/pages/packs/comprar.vue` — $setSEO + noindex added (had none before)
- `apps/website/app/pages/packs/gracias.vue` — noindex added before watch() block
- `apps/website/app/pages/packs/error.vue` — noindex added
- `apps/website/app/pages/cuenta/mis-ordenes.vue` — $setSEO + noindex added
- `apps/website/app/pages/cuenta/mis-anuncios.vue` — $setSEO + noindex added
- `apps/website/app/pages/cuenta/index.vue` — noindex added
- `apps/website/app/pages/cuenta/perfil/index.vue` — noindex added
- `apps/website/app/pages/cuenta/perfil/editar.vue` — noindex added
- `apps/website/app/pages/cuenta/avatar.vue` — noindex added
- `apps/website/app/pages/cuenta/cover.vue` — noindex added
- `apps/website/app/pages/cuenta/username.vue` — noindex added
- `apps/website/app/pages/cuenta/cambiar-contrasena.vue` — noindex added
- `apps/website/app/pages/anunciar/index.vue` — noindex added
- `apps/website/app/pages/anunciar/resumen.vue` — noindex added
- `apps/website/app/pages/anunciar/gracias.vue` — noindex added
- `apps/website/app/pages/anunciar/error.vue` — noindex added
- `apps/website/app/pages/login/index.vue` — noindex added
- `apps/website/app/pages/registro.vue` — noindex added
- `apps/website/app/pages/recuperar-contrasena.vue` — noindex added
- `apps/website/app/pages/restablecer-contrasena.vue` — noindex added

## Decisions Made

- `packs/comprar.vue`, `cuenta/mis-ordenes.vue`, `cuenta/mis-anuncios.vue` had no SEO at all — added both `$setSEO` and `noindex` together in one pass
- `[slug].vue` SEO was fully commented out — replaced with a `watch()` + `immediate: true` pattern consistent with other data-dependent pages; used ProfilePage + Person schema
- `packs/gracias.vue` uses a `watch(data, ...)` pattern for SEO — noindex placed before the watch block to ensure it fires unconditionally

## Deviations from Plan

None - plan executed exactly as written. Four additional pages discovered with missing SEO were handled as part of the same tasks.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SEO-03, SEO-04, SEO-05, SEO-07 complete
- Plan 35-03 ready: fix JSON-LD accumulation (microdata.ts key) + restructure sitemap

---
*Phase: 35-website-seo-audit*
*Completed: 2026-03-07*

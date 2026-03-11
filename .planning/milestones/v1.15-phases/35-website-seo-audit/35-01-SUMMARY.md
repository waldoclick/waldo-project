---
phase: 35-website-seo-audit
plan: 01
subsystem: ui
tags: [nuxt, seo, og-tags, twitter-card, baseUrl, plugins, vue3]

requires: []

provides:
  - Extended $setSEO plugin emitting full OG + Twitter Card tag set (ogTitle, ogDescription, ogUrl, ogType, twitterCard, twitterTitle, twitterDescription)
  - All 21 page files with hardcoded https://waldo.click URLs updated to use config.public.baseUrl

affects: [35-02, 35-03]

tech-stack:
  added: []
  patterns:
    - useSeoMeta with full OG + Twitter Card set in seo.ts plugin
    - config.public.baseUrl for all absolute URL construction in SEO calls

key-files:
  created: []
  modified:
    - apps/website/app/plugins/seo.ts
    - apps/website/app/pages/registro.vue
    - apps/website/app/pages/restablecer-contrasena.vue
    - apps/website/app/pages/sitemap.vue
    - apps/website/app/pages/politicas-de-privacidad.vue
    - apps/website/app/pages/preguntas-frecuentes.vue
    - apps/website/app/pages/anuncios/index.vue
    - apps/website/app/pages/contacto/index.vue
    - apps/website/app/pages/contacto/gracias.vue
    - apps/website/app/pages/anunciar/index.vue
    - apps/website/app/pages/anunciar/resumen.vue
    - apps/website/app/pages/anunciar/gracias.vue
    - apps/website/app/pages/anunciar/error.vue
    - apps/website/app/pages/packs/error.vue
    - apps/website/app/pages/packs/gracias.vue
    - apps/website/app/pages/login/index.vue
    - apps/website/app/pages/cuenta/index.vue
    - apps/website/app/pages/cuenta/avatar.vue
    - apps/website/app/pages/cuenta/cover.vue
    - apps/website/app/pages/cuenta/username.vue
    - apps/website/app/pages/cuenta/cambiar-contrasena.vue
    - apps/website/app/pages/cuenta/perfil/index.vue
    - apps/website/app/pages/cuenta/perfil/editar.vue

key-decisions:
  - "twitterCard param cast to union type literal in useSeoMeta — useSeoMeta expects specific union not plain string"
  - "ogUrl accepts string | undefined — params.url passed directly without default (undefined is valid)"
  - "No duplicate useRuntimeConfig() declarations — skipped where config already present"

patterns-established:
  - "$setSEO plugin derives ogTitle/ogDescription/twitterTitle/twitterDescription from title/description — no call-site changes needed"

requirements-completed: [SEO-01, SEO-02]

duration: 30min
completed: 2026-03-07
---

# Plan 35-01: $setSEO Plugin Extension + Hardcoded URL Replacement Summary

**$setSEO plugin extended with full OG + Twitter Card tag set; 74+ hardcoded https://waldo.click URLs replaced with config.public.baseUrl across 21 page files**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-07T20:00:00Z
- **Completed:** 2026-03-07T20:30:00Z
- **Tasks:** 3 (SEO-01 plugin, SEO-02 URL replacement, typecheck)
- **Files modified:** 22

## Accomplishments

- Extended `apps/website/app/plugins/seo.ts` — `useSeoMeta` now emits `ogTitle`, `ogDescription`, `ogUrl`, `ogType` (default `"website"`), `twitterCard` (default `"summary_large_image"`), `twitterTitle`, `twitterDescription` in addition to existing fields
- Updated TypeScript interface for `$setSEO` to include optional `ogType` and `twitterCard` params
- Replaced all 74+ hardcoded `https://waldo.click` URL strings across 21 page files with `config.public.baseUrl` template expressions
- Added `const config = useRuntimeConfig()` where not already present; skipped where already declared
- `nuxt typecheck` passes with zero errors

## Files Created/Modified

- `apps/website/app/plugins/seo.ts` — Extended useSeoMeta with full OG + Twitter Card tag set; interface updated
- 21 page files updated for SEO-02 URL replacement (see key-files above)

## Decisions Made

- `twitterCard` in `useSeoMeta` expects a strict union type literal — cast via `(params.twitterCard || "summary_large_image") as "summary" | "summary_large_image" | "app" | "player"` to satisfy TypeScript without introducing `any`
- `ogTitle` and `ogDescription` derived from existing `title`/`description` params — zero call-site changes required

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SEO-01, SEO-02 complete
- Plan 35-02 ready: add missing SEO coverage to packs/mis-ordenes/mis-anuncios; restore profile page SEO; add home structured data; add noindex to private pages

---
*Phase: 35-website-seo-audit*
*Completed: 2026-03-07*

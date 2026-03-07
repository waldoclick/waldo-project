---
phase: 35-website-seo-audit
plan: 03
subsystem: ui
tags: [nuxt, seo, structured-data, json-ld, sitemap, nuxt-simple-sitemap]

requires:
  - phase: 35-01
    provides: Extended $setSEO plugin + hardcoded URL replacement
  - phase: 35-02
    provides: Full SEO coverage + noindex on private pages

provides:
  - JSON-LD deduplication via useHead key in microdata.ts
  - Sitemap static entries merged with dynamic ad URLs in single async urls function
  - Static sitemap entries include changefreq and priority metadata
  - nuxt typecheck passes with zero errors

affects: [future-seo-phases]

tech-stack:
  added: []
  patterns:
    - useHead key property for JSON-LD deduplication across SPA navigation
    - Single async urls() function in sitemap config combining static + dynamic entries

key-files:
  created: []
  modified:
    - apps/website/app/plugins/microdata.ts
    - apps/website/nuxt.config.ts

key-decisions:
  - "nuxt-simple-sitemap does not support both a static array and async function under same urls key — merged both into single async function"
  - "Private paths (/login, /registro, /recuperar-contrasena, /anunciar) removed from sitemap static entries (already in exclude)"
  - "changefreq values: / daily, /anuncios hourly, /packs monthly, /preguntas-frecuentes monthly, /contacto yearly, /politicas-de-privacidad yearly"
  - "as const casts on changefreq string literals prevent TypeScript widening to string type"

patterns-established:
  - "JSON-LD dedup pattern: key: 'structured-data' on useHead script entry ensures replace-on-navigate"
  - "Sitemap pattern: single async urls() function with staticUrls prepended, dynamicUrls appended via spread"

requirements-completed: [SEO-06, SEO-08, SEO-09]

duration: 15min
completed: 2026-03-07
---

# Plan 35-03: JSON-LD Dedup + Sitemap Restructure Summary

**JSON-LD accumulation fixed via useHead key; sitemap restructured with static entries carrying changefreq/priority merged into single async urls function**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-07T21:45:00Z
- **Completed:** 2026-03-07T22:00:00Z
- **Tasks:** 3 (Task 1: microdata.ts, Task 2: nuxt.config.ts sitemap, Task 3: typecheck)
- **Files modified:** 2

## Accomplishments

- Added `key: "structured-data"` to `microdata.ts` script entry — JSON-LD tags now replace on SPA navigation instead of accumulating
- Replaced `sitemap.sources` array with a single `async urls()` function that prepends 6 static entries (with `changefreq`/`priority`) and appends dynamic ad URLs
- Removed private/transactional paths from sitemap static entries (they remain in `exclude`)
- `nuxt typecheck` passes with zero errors

## Files Created/Modified

- `apps/website/app/plugins/microdata.ts` — Added `key: "structured-data"` to useHead script entry
- `apps/website/nuxt.config.ts` — Replaced `sitemap.sources` array with merged `async urls()` function

## Decisions Made

- `nuxt-simple-sitemap` cannot have both a static array and an async function under the same `urls` config key (JS object duplicate key). Resolved by merging static entries as `staticUrls` const at the top of the single async function.
- `changefreq` values cast with `as const` to satisfy TypeScript union literal type requirement.
- `/login`, `/registro`, `/recuperar-contrasena`, `/anunciar` removed from static sitemap entries — they are already in `exclude` and have `noindex`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 9 SEO requirements (SEO-01 through SEO-09) complete
- Phase 35 complete — milestone v1.15 ready for planning file updates
- No blockers for next milestone

---
*Phase: 35-website-seo-audit*
*Completed: 2026-03-07*

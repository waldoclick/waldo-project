---
phase: 38-static-page-copy
plan: "02"
subsystem: ui
tags: [seo, vue, nuxt, copy, meta-description, structured-data]

# Dependency graph
requires:
  - phase: 36-seo-bug-fixes
    provides: canonical vocabulary conventions and bug-free SEO templates
provides:
  - Sitemap page SEO copy with Waldo.click® trademark and canonical keywords
  - Privacy Policy page SEO copy with canonical keywords at full description budget
affects: [38-static-page-copy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "$setSEO description mirrored verbatim into $setStructuredData description field"
    - "sitemap.vue pattern: no url: in $setSEO call (consistent with existing file pattern)"

key-files:
  created: []
  modified:
    - apps/website/app/pages/sitemap.vue
    - apps/website/app/pages/politicas-de-privacidad.vue

key-decisions:
  - "sitemap description uses 'Navega fácilmente por Waldo.click®' prefix to front-load the trademark fix"
  - "privacy policy description focuses on publishing and buying workflow to add specificity vs prior generic wording"

patterns-established:
  - "Both $setSEO and $setStructuredData always carry identical description strings"

requirements-completed: [COPY-07, COPY-08]

# Metrics
duration: 2min
completed: 2026-03-07
---

# Phase 38 Plan 02: Static Page Copy (Sitemap + Privacy Policy) Summary

**Replaced bare `Waldo.click` with `Waldo.click®` in sitemap and expanded both sitemap (91→132 chars) and privacy policy (102→134 chars) descriptions to canonical vocabulary using `anuncios` and `activos industriales`**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-07T18:51:27Z
- **Completed:** 2026-03-07T18:53:59Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Fixed critical bare `Waldo.click` (no ®) trademark issue in sitemap.vue description
- Expanded sitemap description from 91 to 132 chars with canonical keywords (`anuncios`, `activos industriales`)
- Expanded privacy policy description from 102 to 134 chars with canonical keywords
- Mirrored both updated descriptions into their respective `$setStructuredData()` calls
- All forbidden terms (`avisos`, `maquinaria industrial`, `clasificados`) absent from both files
- `npx nuxt typecheck` exits 0

## Task Commits

Each task was committed atomically:

1. **Task 1: COPY-07 — Update sitemap.vue SEO copy** - `6c60f19` (copy)
2. **Task 2: COPY-08 — Update politicas-de-privacidad.vue SEO copy** - `ba7fd9b` (copy)

**Plan metadata:** (docs commit — created below)

## Files Created/Modified

- `apps/website/app/pages/sitemap.vue` — Updated `$setSEO()` description (91→132 chars, added ®, anuncios, activos industriales); mirrored into `$setStructuredData()`
- `apps/website/app/pages/politicas-de-privacidad.vue` — Updated `$setSEO()` description (102→134 chars, added canonical keywords); mirrored into `$setStructuredData()`

## Decisions Made

- Used "Navega fácilmente por Waldo.click®" as sitemap description prefix to immediately front-load the trademark fix while creating a natural navigational framing
- Replaced privacy policy's generic "asegura la privacidad en tus transacciones" with platform-specific "al publicar y comprar anuncios de activos industriales en nuestra plataforma" to satisfy canonical vocabulary requirements

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- COPY-07 and COPY-08 requirements complete
- Remaining Phase 38 requirements (COPY-05, COPY-06 — preguntas-frecuentes.vue and contacto/index.vue) handled in plan 38-01
- Phase 38 complete when 38-01-SUMMARY.md also exists

---
*Phase: 38-static-page-copy*
*Completed: 2026-03-07*

## Self-Check: PASSED

- FOUND: apps/website/app/pages/sitemap.vue ✓
- FOUND: apps/website/app/pages/politicas-de-privacidad.vue ✓
- FOUND: .planning/phases/38-static-page-copy/38-02-SUMMARY.md ✓
- FOUND commit: 6c60f19 ✓
- FOUND commit: ba7fd9b ✓

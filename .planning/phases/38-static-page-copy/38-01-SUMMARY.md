---
phase: 38-static-page-copy
plan: 01
subsystem: ui
tags: [seo, copy, meta, nuxt, vue]

# Dependency graph
requires:
  - phase: 36-seo-bug-fixes
    provides: clean title/description templates with canonical vocabulary conventions
provides:
  - FAQ page SEO copy with canonical vocabulary (COPY-05)
  - Contact page SEO copy with expanded descriptive title (COPY-06)
affects: [38-static-page-copy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "$setSEO and $setStructuredData description strings kept identical (same string literal)"
    - "Title strings never include '| Waldo.click' — module appends it automatically"

key-files:
  created: []
  modified:
    - apps/website/app/pages/preguntas-frecuentes.vue
    - apps/website/app/pages/contacto/index.vue

key-decisions:
  - "FAQ title expanded to 'Preguntas Frecuentes sobre Anuncios' (35 chars) — adds keyword 'Anuncios' for relevance"
  - "Contact title expanded to 'Contacto y Soporte' (18 chars) — avoids bare 'Contacto' which fails COPY-06 and avoids brand-name double-suffix"
  - "Both descriptions updated to 120–155 char budget with anuncios, activos industriales, Waldo.click® canonical vocabulary"

patterns-established:
  - "Description mirroring: $setSEO and $setStructuredData always use the same string literal"

requirements-completed: [COPY-05, COPY-06]

# Metrics
duration: 4min
completed: 2026-03-07
---

# Phase 38 Plan 01: FAQ and Contact Page SEO Copy Summary

**FAQ title expanded to "Preguntas Frecuentes sobre Anuncios" (35 chars) and contact title to "Contacto y Soporte" (18 chars); both descriptions updated to 120–155-char budget with canonical vocabulary (anuncios, activos industriales, Waldo.click®)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-07T18:51:26Z
- **Completed:** 2026-03-07T18:55:31Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `preguntas-frecuentes.vue`: title "Preguntas Frecuentes sobre Anuncios" (35 chars, was "Preguntas Frecuentes" — 20 chars); description 143 chars (was 110 — too short); `$setStructuredData` description mirrored
- `contacto/index.vue`: title "Contacto y Soporte" (18 chars, was bare "Contacto" — 8 chars, failed COPY-06); description 137 chars (was 113 — too short); `$setStructuredData` description mirrored
- Both pages now contain canonical keywords: `anuncios`, `activos industriales`, `Waldo.click®`
- No forbidden terms (avisos, maquinaria industrial, clasificados) in either file
- `npx nuxt typecheck` exits 0

## Task Commits

Each task was committed atomically:

1. **Task 1: COPY-05 — Update preguntas-frecuentes.vue SEO copy** - `6c60f19` (copy)
2. **Task 2: COPY-06 — Update contacto/index.vue SEO copy** - `ba7fd9b` (copy)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `apps/website/app/pages/preguntas-frecuentes.vue` — Updated `$setSEO` title/description and mirrored description into `$setStructuredData` call
- `apps/website/app/pages/contacto/index.vue` — Updated `$setSEO` title/description and mirrored description into `$setStructuredData` call

## Decisions Made
- FAQ title uses "sobre Anuncios" suffix to add keyword relevance while staying within 45-char budget
- Contact title uses "y Soporte" suffix — descriptive, avoids brand name (would cause double-suffix), unique across all indexed pages
- Both descriptions use a question-format opener to increase SERP click-through appeal

## Deviations from Plan

None — plan executed exactly as written. Both tasks were already committed in a prior session (commits `6c60f19` and `ba7fd9b`) with the exact string substitutions specified.

## Issues Encountered

None — `npx nuxt typecheck` exits 0; all copy constraints verified.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

Phase 38 plan 01 complete. Plan 38-02 (sitemap and privacy pages) was already executed in the same prior session. Phase 38 is complete — all four static pages have canonical SEO copy.

---
*Phase: 38-static-page-copy*
*Completed: 2026-03-07*

## Self-Check: PASSED

- `apps/website/app/pages/preguntas-frecuentes.vue` — FOUND ✓
- `apps/website/app/pages/contacto/index.vue` — FOUND ✓
- Commit `6c60f19` (Task 1: FAQ page) — FOUND ✓
- Commit `ba7fd9b` (Task 2: Contact page) — FOUND ✓
- Commit `0fd5a6d` (metadata) — FOUND ✓

---
phase: 08-publico-anuncios-perfil
plan: 01
subsystem: ui
tags: [nuxt, vue, scss, bem, lucide, ad-card, listing]

# Dependency graph
requires:
  - phase: 06-cierre-cuenta
    provides: "06-02 fixed/overlay headroom header (hero must clear it)"
  - phase: 04-tokens
    provides: "phase-04 design tokens ($ink, $ink2, $muted, $amber, $cream, $line, $tag)"
  - phase: 08-04
    provides: "Strapi soldAds endpoint + contact obfuscation (08-03 Vendidos tab consumer of the sold card)"
provides:
  - "Shared CardAnnouncement restyled to AdCard.dc.html (active state) — PHASE OWNER"
  - "CardAnnouncement sold variant (sold + soldWhen props) FINAL for the phase — 08-03 only passes props"
  - "/anuncios results toolbar (filter-icon ubicación select + '{N} anuncios' count + Ordenar por), grid repeat(auto-fill,minmax(224px,1fr)) gap 22px, and 'Sin resultados' empty state"
  - "Restyled .hero--results (breadcrumb + Poppins 800 title + category icon tile, clears overlay header)"
affects: [08-02, 08-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sold-variant via single .card--announcement--sold modifier under the owner block; all visual state driven by props, active path byte-identical"
    - "Scoped breadcrumb overrides under .hero--results (shared BreadcrumbsDefault untouched)"
    - "Empty-state inlined as scoped .announcement--archive__empty (shared MessageDefault never restyled)"

key-files:
  created: []
  modified:
    - apps/website/app/components/CardAnnouncement.vue
    - apps/website/app/components/FilterResults.vue
    - apps/website/app/pages/anuncios/index.vue
    - apps/website/app/scss/components/_card.scss
    - apps/website/app/scss/components/_announcement.scss
    - apps/website/app/scss/components/_filter.scss
    - apps/website/app/scss/components/_hero.scss

key-decisions:
  - "CardAnnouncement active state was already restyled (markup + _card.scss &--announcement); only the sold variant was net-new work for Task 1"
  - "Restyle-first: no left-sidebar filter panel added — kept existing FilterResults behavior (ubicación + orden query params), only restyled to the mockup toolbar look"
  - "{N} anuncios count wired by passing :total=adsData.pagination.total from index.vue into FilterResults (Rule 3 — count had no data source in FilterResults)"
  - "Empty state replaces shared MessageDefault on /anuncios with a scoped .announcement--archive__empty block; MessageDefault (9+ consumers) left untouched"
  - "Split .filter--announcement out of the shared '&--announcement, &--articles' selector so /articulos does not regress"

patterns-established:
  - "Sold card: .card--announcement--sold modifier toggles $ink2 title + strikethrough $muted price; sold badge/veil/footer are own elements gated by v-if=sold; active elements gated by v-if=!sold"

requirements-completed: [PUB-ADS]

# Metrics
duration: 35min
completed: 2026-06-18
---

# Phase 8 Plan 1: /anuncios listing restyle + shared CardAnnouncement sold variant Summary

**Shared ad card finalized (active + sold variant) plus /anuncios hero, toolbar, responsive grid and empty state translated to the v1.47 mockup with the single-load data path preserved.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-18
- **Completed:** 2026-06-18
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Added the sold variant to the shared CardAnnouncement (PHASE OWNER): `sold` + `soldWhen` props drive a "Vendido" badge (`$ink` bg, check icon), darkened image veil, `$ink2` title, strikethrough `$muted` price and a "Vendido {soldWhen}" footer, hiding image-count/Destacado badges, meta line, login prompt and seller row — active cards are byte-identical in behavior.
- Restyled the `/anuncios` toolbar to the mockup: filter-icon ubicación select + **{N} anuncios** count on the left, "Ordenar por" outline select on the right; grid switched to `repeat(auto-fill, minmax(224px,1fr))` gap 22px.
- Built the "Sin resultados" empty state (dashed `$line` border, `$cream` bg, search icon, amber "Limpiar filtros" → `/anuncios`) as a scoped block, leaving the shared MessageDefault untouched.
- Restyled `.hero--results` (breadcrumb `$muted`/no-underline with `$ink` bold last item, Poppins 800 40px title, 58px category-color icon tile with white icon) — clears the 06-02 overlay header with 104px top padding.

## Task Commits

Each task was committed atomically:

1. **Task 1: Sold variant on CardAnnouncement (phase owner)** - `6b0108ea` (feat)
2. **Task 2: Toolbar + grid + empty state (AdArchive/FilterResults/index)** - `b2271b67` (feat)
3. **Task 3: Results hero (HeroResults)** - `51325c72` (feat)

## Files Created/Modified
- `apps/website/app/components/CardAnnouncement.vue` - Added sold/soldWhen props, sold badge + veil + sold footer, gated active elements behind `!sold`
- `apps/website/app/components/FilterResults.vue` - Toolbar: filter-icon ubicación select + count + Ordenar por; added `total` prop
- `apps/website/app/pages/anuncios/index.vue` - Pass `:total` to FilterResults; replaced shared MessageDefault with scoped empty-state block; swapped import to IconSearch
- `apps/website/app/scss/components/_card.scss` - `.card--announcement--sold` modifier + `__media__veil`/`__media__sold`/`__body__sold` (phase owner)
- `apps/website/app/scss/components/_announcement.scss` - `--archive__list` grid (auto-fill minmax 224px gap 22px) + `__empty` card (only `--archive` touched, `--single` reserved for 08-02)
- `apps/website/app/scss/components/_filter.scss` - Split `.filter--announcement` from shared `--articles` rule; restyled to toolbar look
- `apps/website/app/scss/components/_hero.scss` - `.hero--results` block restyle (scoped breadcrumb + title + icon overrides)

## Decisions Made
- The active-state card (markup + `.card--announcement` SCSS) was already migrated before this plan; Task 1's real work was the net-new sold variant. Verified the active card unregressed via screenshot.
- No left-sidebar filter panel (mockup's checkbox aside) added — restyle-first per plan. The mockup "Filtros" button opens a sidebar that has no behavior in the current app, so the ubicación select serves as the filter control.
- 5 columns appear at 1440px (full 1300px container, no sidebar) vs the mockup's ~4 cols (which sit in a narrower content column beside a sidebar). This is the natural consequence of auto-fill at full width; cards individually match AdCard.dc.html. Mobile collapses to 2 columns (minmax 160px).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] "{N} anuncios" count had no data source in FilterResults**
- **Found during:** Task 2 (toolbar restyle)
- **Issue:** The must-have count lives in `adsData.pagination.total` (index.vue), but FilterResults never received pagination, so the mockup count could not render.
- **Fix:** Added a `total` prop to FilterResults and passed `:total="adsData.pagination?.total || 0"` from index.vue (a small edit to index.vue, beyond the plan's `files_modified`).
- **Files modified:** apps/website/app/components/FilterResults.vue, apps/website/app/pages/anuncios/index.vue
- **Verification:** Screenshot shows "**42** anuncios"; vue-tsc clean.
- **Committed in:** b2271b67 (Task 2 commit)

**2. [Rule 3 - Blocking] Shared MessageDefault could not be restyled globally**
- **Found during:** Task 2 (empty state)
- **Issue:** MessageDefault is used by 9+ pages; restyling the generic component to the "Sin resultados" card would regress every other consumer.
- **Fix:** Replaced the MessageDefault usage on /anuncios with a scoped `.announcement--archive__empty` block matching the mockup; removed the now-unused MessageDefault import (no-unused-vars rule).
- **Files modified:** apps/website/app/pages/anuncios/index.vue, apps/website/app/scss/components/_announcement.scss
- **Verification:** Hit `?s=zzqxnoresultsxyz123` — empty state renders exactly per mockup.
- **Committed in:** b2271b67 (Task 2 commit)

**3. [Rule 3 - Blocking] .filter--announcement shared a selector with .filter--articles**
- **Found during:** Task 2 (toolbar restyle)
- **Issue:** `&--announcement, &--articles` shared one rule block; restyling the announcement toolbar in place would mutate /articulos styling.
- **Fix:** Split `.filter--announcement` into its own block; left `.filter--articles` exactly as it was.
- **Files modified:** apps/website/app/scss/components/_filter.scss
- **Verification:** vue-tsc clean; announcement toolbar restyled, articles rule byte-identical.
- **Committed in:** b2271b67 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 3 - blocking). **Impact:** All necessary to render the mockup without regressing shared consumers. No scope creep — no new behavior, no sidebar, data path untouched.

## Issues Encountered
- The cookie consent banner overlaps card bodies in some screenshots; dismissed via the "Aceptar" click in the verification scripts. Not a regression — it is the standard site-wide banner.
- The sold variant has no live route on /anuncios (no sold ads there). Verified by injecting the `--sold` modifier + a `soldWhen` footer onto a live card via Playwright `page.evaluate` (forced-class trick): the Vendido badge, image veil, `$ink2` title, strikethrough price and sold footer all render correctly. The real consumer is 08-03's Vendidos tab.

## Sold-variant card props for 08-03 (CONFIRMED)
08-03's Vendidos tab passes these props to `<CardAnnouncement>` — the card is FINAL, do NOT re-touch it or `_card.scss .card--announcement`:

```
<CardAnnouncement :all="ad" :sold="true" :sold-when="'hace 3 días'" />
```

- `all` (Object/Ad, required) — the ad record (image, title, price, category drive the card as usual)
- `sold` (Boolean, default `false`) — `true` activates the sold variant: Vendido badge + veil, `$ink2` title, strikethrough `$muted` price; hides image-count/Destacado badges, meta line, login prompt and seller row
- `sold-when` / `soldWhen` (String, default `""`) — when set, renders the "Vendido {soldWhen}" footer (top border, `$muted` 12.5px). Pass a human-readable string (e.g. "hace 3 días", "12 jun 2026").

## Self-Check: PASSED

- FOUND: apps/website/app/components/CardAnnouncement.vue
- FOUND: apps/website/app/components/FilterResults.vue
- FOUND: apps/website/app/pages/anuncios/index.vue
- FOUND: apps/website/app/scss/components/_card.scss
- FOUND: apps/website/app/scss/components/_announcement.scss
- FOUND: apps/website/app/scss/components/_filter.scss
- FOUND: apps/website/app/scss/components/_hero.scss
- FOUND commit: 6b0108ea (Task 1)
- FOUND commit: b2271b67 (Task 2)
- FOUND commit: 51325c72 (Task 3)

## Next Phase Readiness
- The shared CardAnnouncement (active + sold) is FINAL — 08-02 (ad detail relacionados) and 08-03 (seller profile + Vendidos tab) reuse it and must NOT re-touch the component or `.card--announcement` in `_card.scss`.
- `_announcement.scss` `--single` section is untouched and reserved for 08-02.
- Data path unchanged: index.vue keeps 2 separate `useAsyncData` (category-${slug} + adsData-...), single `ads/catalog` paginated call, no N+1.

---
*Phase: 08-publico-anuncios-perfil*
*Completed: 2026-06-18*

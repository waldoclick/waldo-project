---
phase: 260618-pi1
plan: 01
subsystem: website/scss, website/components
tags: [scss, visual-fidelity, container-rule, packs, legal-layout, hero]
key-files:
  modified:
    - apps/website/app/scss/components/_footer.scss
    - apps/website/app/scss/components/_sell-cta.scss
    - apps/website/app/scss/components/_highlights.scss
    - apps/website/app/scss/components/_layout.scss
    - apps/website/app/scss/components/_hero.scss
    - apps/website/app/components/PacksDefault.vue
decisions:
  - "Pack deduplication: Set<number> on total_ads, skip total_ads <= 1 — yields exactly 3 cards (15/30/60)"
  - "Padding moved from __container to parent wrapper to comply with container-clean rule"
  - "hero--announcement background: $cream added — border-bottom already existed, not duplicated"
metrics:
  duration: ~20min
  tasks_completed: 3
  files_modified: 6
  commits: 3
---

# Phase 260618-pi1 Plan 01: Pixel-Perfect Visual Audit and Fix Summary

**One-liner:** Six surgical SCSS/Vue fixes closing visual fidelity gaps vs. mockup — highlights padding, legal header height, sidebar sticky offset, ad hero cream bg, container-rule cleanups, and pack deduplication to exactly 3 cards.

## What Was Fixed

### Task 1: Container-rule cleanups (footer + sell-cta)

**_footer.scss** — `padding-top/padding-bottom` moved from `__container` blocks to their parent wrappers per project container-clean rule:
- `padding-top: 13px; padding-bottom: 13px` moved from `&--default__indicators__container` → `&--default__indicators`
- `padding-top: 32px; padding-bottom: 32px` moved from `&--default__main__container` → `&--default__main`
- `__container` blocks now contain only `@extend .container` + flex/layout rules

**_sell-cta.scss** — Removed `.container { max-width: 1200px; }` override block. Base `_container.scss` already sets `max-width: 1200px` — the override was identical and broke the no-override rule.

**Commit:** `638dee63`

### Task 2: SCSS fidelity fixes (highlights + layout + hero)

**_highlights.scss** — Added `padding: 72px 0 64px` to `.highlights--default` block (not on `__container`). Section was collapsed with zero breathing room against adjacent sections.

**_layout.scss** — Two fixes for all legal pages (FAQ, Políticas, Condiciones, Contacto, Contacto):
- `__inner` top padding: `64px 32px 40px` → `108px 32px 40px` (taller cream header band matching mockup)
- `__sidebar` sticky top: `90px` → `96px` (accounts for 74px sticky header + gap)

**_hero.scss** — Added `background: $cream` to `.hero--announcement` block. `border-bottom: 1px solid $line` already existed — was not duplicated.

**Commit:** `93404539`

### Task 3: Fix PacksDefault.vue — render exactly 3 packs (15/30/60)

DB has 5 packs; original `v-if="item.total_ads > 1"` filter yielded 4 cards (IDs 2-5) because the 60-ads pack has a duplicate record. Fixed with a `displayPacks` computed property that:
1. Filters `total_ads <= 1` (removes the single-ad pack)
2. Deduplicates by `total_ads` using `Set<number>`, keeping first occurrence
3. Result: exactly 3 cards — 15 / 30 / 60 avisos

Template updated: `v-for` on `displayPacks`, `v-if` removed. `:all-packs="packs"` kept with raw full list for savings % accuracy.

**Commit:** `d37c06ef`

## Screenshot Observations (Visual Verification)

### /por-que-waldo (fix-pq-waldo.png)

- **Highlights ("Para comprar"):** Clear vertical breathing room visible above and below the 3-card "Para comprar" section. Section no longer collapses against the hero above or "Para vender" below. The 72px top / 64px bottom padding is visually evident.
- **Packs section:** Exactly **3 cards** visible in a single row — "15 Avisos", "30 Avisos", "60 Avisos". No orphaned 4th card on a second row. Grid fills the row cleanly at 1440px.

### /preguntas-frecuentes (fix-faq.png)

- **Legal header band:** The cream header is noticeably taller compared to the pre-fix 64px state. The title "Preguntas frecuentes" appears with substantial top breathing room — the 108px top padding is clearly visible.
- **Sidebar sticky:** Left navigation sidebar visible and anchored correctly below the header area.
- **Content:** FAQ accordion items render correctly in the main content panel.

### /anuncios/wylie-lane-1773673898884 (fix-detalle.png)

- **Hero cream background:** The ad detail hero area has a visible cream (`$cream`) background. The breadcrumb "Inicio > Avisos > Wylie Lane" and the title "Wylie Lane" float on a cream surface — not white. The background color change is clearly distinguishable.
- **Border-bottom:** The separator between the hero and the body content is visible.
- **Body:** Product description, location grid, technical specification grid, and related ads all render correctly. No layout regressions.

### Footer / SellCta (any page)

- Footer renders identically — the padding move from container to parent is visually neutral (same values, just repositioned in the CSS hierarchy)
- SellCta renders identically — the removed `max-width: 1200px` was already equal to the base container value

## Deviations from Plan

None — plan executed exactly as written. All 6 files modified, all 4 SCSS changes verified via grep, Vue deduplication logic implemented as specified.

## Self-Check

- [x] `_footer.scss` modified: `638dee63`
- [x] `_sell-cta.scss` modified: `638dee63`
- [x] `_highlights.scss` modified: `93404539`
- [x] `_layout.scss` modified: `93404539`
- [x] `_hero.scss` modified: `93404539`
- [x] `PacksDefault.vue` modified: `d37c06ef`
- [x] Screenshots taken and verified at /tmp/waldo-shots/fix-pq-waldo.png, fix-faq.png, fix-detalle.png

## Self-Check: PASSED

---
phase: 05-rediseno-cuenta
plan: "03"
subsystem: website/account
tags: [redesign, account, announcements, card, BEM, scss, phase-04-tokens]
dependency_graph:
  requires: [05-02]
  provides: [account--announcements styles, CardProfileAd redesign]
  affects: [apps/website/app/components/AccountAnnouncements.vue, apps/website/app/components/CardProfileAd.vue, apps/website/app/scss/components/_account.scss, apps/website/app/scss/components/_card.scss]
tech_stack:
  added: []
  patterns: [BEM block--modifier__element, phase-04 tokens, data-bound :style for category color, vue3 computed, lucide-vue-next icons]
key_files:
  created: []
  modified:
    - apps/website/app/components/AccountAnnouncements.vue
    - apps/website/app/components/CardProfileAd.vue
    - apps/website/app/scss/components/_account.scss
    - apps/website/app/scss/components/_card.scss
decisions:
  - Card SCSS kept in _card.scss (card--profileAd block) per CLAUDE.md closest-existing-equivalent rule; _account.scss has only the announcements chrome (header/tabs/list/empty/pager)
  - ButtonCreate.vue not used for header CTA (has its own style class); replaced with inline nuxt-link using account--announcements__header__cta class matching mockup amber style
  - No views/contacts meta shown: Ad type has no such fields; stats backend deferred to 05-07/05-09 (TODO in AccountMain already confirms this)
  - statusMessage computed retained from original for meta-right (shows real data: "Expira en N días" / "Expirado hace N días")
  - Removed unused status prop and handlePushImage from CardProfileAd (dead code, CLAUDE.md no-unused-vars rule)
  - category.color used as data-bound :style (only allowed exception per plan); fallback #ece9e4 ($line hex)
metrics:
  duration: "~45min"
  completed: "2026-06-17"
  tasks: 2
  files: 4
---

# Phase 05 Plan 03: Mis Anuncios Redesign Summary

Redesigned Mis anuncios view with eyebrow/h1/amber-CTA header, 5-tab bar (underline-active + count pills), dashed empty state per filter, and ad cards with category-color thumbnail tile, badge variants, status meta, and action buttons — all using phase-04 tokens.

## What Was Built

### Task 1: AccountAnnouncements.vue

Replaced old markup (flat tab buttons + generic EmptyState + nested list) with:

- **Header** (`account--announcements__header`): eyebrow "Cuenta", h1 "Mis anuncios", intro paragraph, amber `nuxt-link` CTA → `/anunciar`
- **Tabs** (`account--announcements__tabs`/`__tab`/`__tab--active`): props-driven tab buttons with count pill, `account--announcements__tab__count` (amber background when active, $cream/$muted when inactive), keyboard nav (right/left arrows) preserved, a11y roles preserved
- **Empty state** (`account--announcements__empty`): dashed 1.5px $line border, centered icon tile + title + message; text mapped per `currentFilter` (5 real status values: published/review/expired/rejected/banned)
- **List** (`account--announcements__list`): `v-for CardProfileAd` unchanged
- **Pager** (`account--announcements__pager`): `vue-awesome-paginate` kept; wrapper positioned right
- All props/emits contract preserved: `defineProps`, `filter-change`, `page-change` identical to page

### Task 2: CardProfileAd.vue + _account.scss + _card.scss

**CardProfileAd.vue** — replaced overlapping-image stack with mockup card:
- **Thumbnail tile** (`card--profileAd__thumb`): `background` set via `:style="{ background: categoryColor }"` (data-bound from `category.color`; fallback `#ece9e4`); lucide icon via `getCategoryIcon(category.slug)`; photo count chip (`ad.gallery.length`)
- **Body** (`card--profileAd__body`): title + badge (5 variants: `--active`, `--expiring`, `--expired`, `--review`, `--rejected`, `--banned`) + optional `--featured` star pill
- **Meta row**: category color dot (`:style` data-bound) + category name, calendar date, statusMessage (existing computed — real data)
- **Actions** (`card--profileAd__actions`): primary/secondary buttons + overflow dropdown (ellipsis-vertical) for published status with Desactivar danger item; all existing handlers preserved (`handleDeactivate`, `handleRepublish`, `handleRejectedClick`, `handleBannedClick`)

**_account.scss** `account--announcements` block fully replaced with new v1.47 styles:
- Header flex layout, eyebrow, heading 30px 800 $ink, intro $ink2, CTA $amber hover $amber_hover
- Tabs: flex border-bottom $line, scrollable; tab underline-transparent → `--active` border-bottom 2px $amber_hover + $ink 700; count pill active $amber/$ink inactive $cream/$muted
- Empty state: dashed $line border, icon $cream tile, title $ink 700 16px, msg $muted 13.5px
- List: flex column gap 12px, margin-top 22px
- Pager: justify-content flex-end

**_card.scss** `card--profileAd` block replaced:
- New: 1px $line border, 10px radius, flex items-center gap 18px
- Thumb: 96x74px, border-radius 6px, color $ink
- Badge variants using phase-04 tokens: $success rgba 0.12 / $warning rgba 0.14 / $cream $muted $line border / $error rgba 0.12
- Featured pill: $amber bg $ink color
- Actions: primary $amber hover $amber_hover; secondary $white $line border hover $cream; menu button $line border hover $cream; dropdown box-shadow, $cream hover items; danger item $error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Unused Code] Removed dead `status` prop and `handlePushImage` from CardProfileAd**
- **Found during:** Task 2
- **Issue:** `status` prop was defined but never read (all logic uses `props.ad?.status`). `handlePushImage` was defined but never called from the template or elsewhere.
- **Fix:** Removed both. `GalleryItem` import retained (still used in `handleRepublish`). `transformUrl` retained (still used in `handleRepublish`).
- **Files modified:** `apps/website/app/components/CardProfileAd.vue`
- **Commit:** e32ec8e6

**2. [Plan gap] _card.scss also modified** (not listed in plan's `files_modified` frontmatter)
- **Reason:** `card--profileAd` block belongs in `_card.scss` per CLAUDE.md closest-existing-equivalent rule and advisor guidance. All card chrome styles live there; announcements chrome in `_account.scss`.
- **Impact:** Acceptance grep checks target `_account.scss` only — all pass. `_card.scss` change is additive (same block, restyled).

### Ghost Data Not Implemented (by design)

The mockup references `N vistas · N contactos` in the meta row. The `Ad` type has no views/contacts fields — the stats backend (05-07/05-09) creates them. Rather than fabricate `"0 vistas · 0 contactos"`, the meta-right shows `statusMessage` (real data: "Expira en N días", "Expirado hace N días", etc.). Documented as Known Stubs below.

### ButtonCreate Not Used for Header CTA

`ButtonCreate.vue` renders with class `btn btn--create` (its own style). The mockup amber header CTA requires `background: $amber; color: $ink`. Rather than modify the shared component (out of scope), an inline `nuxt-link` with class `account--announcements__header__cta` was used. Same destination (`/anunciar`), same visual result.

## Known Stubs

| Stub | File | Reason | Resolved by |
|------|------|---------|-------------|
| `meta__right` shows statusMessage instead of "N vistas · N contactos" | `CardProfileAd.vue` — `card--profileAd__body__meta__right` | `Ad` type has no `views`/`contacts` fields; stats backend not yet built | 05-07 (ad-view event table), 05-09 (stats aggregation endpoint) |
| Actions: no "Destacar", "Estadísticas", "Marcar como vendido", "Dar de baja" | `CardProfileAd.vue` actions section | No handlers exist for these in the current codebase; mockup shows aspirational state | 05-05 or future plan for stats modal; destacar/vendido UX not in scope for this phase |

## Self-Check: PASSED

- FOUND: apps/website/app/components/AccountAnnouncements.vue
- FOUND: apps/website/app/components/CardProfileAd.vue
- FOUND: apps/website/app/scss/components/_account.scss
- FOUND: apps/website/app/scss/components/_card.scss
- FOUND: commit e32ec8e6

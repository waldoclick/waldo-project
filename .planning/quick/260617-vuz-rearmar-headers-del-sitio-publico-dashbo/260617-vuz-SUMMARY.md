---
phase: quick-260617-vuz
plan: 01
subsystem: website-chrome
tags: [redesign, header, dashboard, bem, visual-verification]
requires:
  - "phase-04 tokens in _variables.scss ($ink, $ink2, $amber, $cream, $line)"
  - "MenuUser finalized in 06-03 (shared by public + dashboard)"
  - "Search lightbox (LightboxSearch.vue) from a06f2546"
provides:
  - "Public header matching index.dc.html:99-125 (logo-black, nav, search icon, auth/CTA)"
  - "Dashboard topbar matching dashboard.dc.html:69-134 (rounded icon buttons + divider + avatar)"
affects:
  - "apps/website/app/pages/index.vue (home no longer transparent-themed)"
tech-stack:
  added: []
  patterns:
    - "withDefaults() for boolean props that must default true (bare type-only boolean prop resolves to false when absent, so `?? true` never fires)"
key-files:
  created: []
  modified:
    - apps/website/app/components/HeaderDefault.vue
    - apps/website/app/components/MenuDefault.vue
    - apps/website/app/components/SearchIcon.vue
    - apps/website/app/components/HeaderDashboard.vue
    - apps/website/app/pages/index.vue
    - apps/website/app/scss/components/_header.scss
    - apps/website/app/scss/components/_menu.scss
    - apps/website/app/scss/components/_toolbar.scss
    - apps/website/app/scss/components/_dropdown.scss
decisions:
  - "Home logo/search bug root cause was is-trasparent=true → LogoWhite + white search icon, both invisible on the light header zone; removing the prop aligns home with the already-correct baseline (every other public page omits it)"
  - "Dashboard avatar kept as MenuUser 4px-radius pill (06-03 approved) rather than the mockup's 99px pill — MenuUser is shared with the public/account header; matching the dashboard would regress the approved public version"
  - "Artículos (newspaper) trigger kept in ToolbarDefault though absent from the dashboard mockup — removing it is a functional change, not a restyle; styled consistently with sibling icon buttons"
metrics:
  duration: "~1h active"
  tasks: 3
  files: 9
  completed: "2026-06-18"
---

# Phase quick-260617-vuz Plan 01: Rebuild site headers to /design mockups Summary

Rebuilt the public header and dashboard topbar to the `/design/*.dc.html` mockups with
mandatory screenshot verification (Playwright → Read PNG → compare → fix loop), translating
inline mockup styles to existing BEM with phase-04 tokens. No new components created; no
existing SCSS variables modified.

## Tasks

### Task 1 — Public header → index.dc.html:99-125  ·  commit `54c27858`
- `_header.scss .header--default`: bar 74px, `gap:32px`, `backdrop-filter:blur(16px) saturate(1.08)`,
  logo `img height:30px` (no clip), search wrapper `display:flex`, search-icon button 40x40
  `border:1px solid $line` radius 4px hover `$ink`, amber CTA `11px/20px` 15px, auth login/register
  re-styled to plain text links ($ink2 500 15px, hover `$cream`/`$ink`) scoped under
  `.header--default__auth .menu--auth` (global `.btn--login` untouched).
- `_menu.scss .menu--default`: nav links $ink2 500 15px gap 24px hover $ink (were invisible white-on-white).
- `MenuDefault.vue`: links replaced with Anuncios (`/anuncios`), Por qué Waldo (`/#por-que-waldo`), Blog (`/blog`).
- `HeaderDefault.vue`: `withDefaults` so `searchIcon` truly defaults true (the bare boolean prop
  was resolving to `false`, hiding the icon); dropped dead `bgColor` prop.
- `SearchIcon.vue`: removed two `console.log` debug lines + unused `ref` import.
- `index.vue`: removed `:is-trasparent="true"` (Rule 1 fix — see Deviations).

Screenshots confirmed visually matching the mockup:
- `/tmp/waldo-shots/pub-header-out.png` (logged-out): full waldo.click wordmark, nav
  Anuncios/Por qué Waldo/Blog, 40x40 search icon, Iniciar sesión + Registrate text links + amber CTA.
- `/tmp/waldo-shots/pub-header-in.png` (logged-in, waldo_jwt): logo, nav, search icon, amber CTA
  with + icon, UserMenu pill; no login/register links.
- `/tmp/waldo-shots/lightbox-recheck.png`: clicking `.search--icon button` opens the centered
  620px lightbox ("Busca un aviso o categoría…" + Esc + Explora por categoría) — matches index.dc.html:159-212.

### Task 2 — Dashboard topbar → dashboard.dc.html:69-134  ·  commit `26ba9a2e`
- `_header.scss .header--dashboard`: `border-bottom:1px solid $line` (was #e5e5e5), `padding:0 36px`,
  right cluster `gap:6px`; added `&__divider` (1px × 26px `$line`).
- `_toolbar.scss` + `_dropdown.scss` triggers: 38x38, radius 8px, `border:1px solid $line`, white bg,
  $ink2, hover `$cream` (Servicios/Órdenes/Notificaciones/Artículos/Fullscreen all consistent).
- `HeaderDashboard.vue`: inserted `header--dashboard__divider` between ToolbarDefault and MenuUser.
- Sidebar (`layout--dashboard__menu`) untouched.

Screenshots confirmed visually matching the mockup:
- `/tmp/waldo-shots/dash-topbar.png`: white bar, $line bottom border, ~64px, right-side rounded
  icon buttons + divider + avatar pill.
- `/tmp/waldo-shots/dash-dropdown.png`: Servicios dropdown opens — white panel, title, $line border,
  rounded corners, services grid (matches dashboard.dc.html:80-89).

### Task 3 — Visual re-check of account header + search lightbox (no regression)  ·  no commit
- `/tmp/waldo-shots/account-header.png` (logged-in, `/cuenta`): logo + amber "Anunciar ahora" +
  UserMenu only, NO nav, NO search icon — matches account.dc.html:28-37. The `withDefaults` change
  in Task 1 correctly preserves `:search-icon="false"`. **No regression; no code change.**
- Search lightbox re-checked in Task 1 (`lightbox-recheck.png`) — matches index.dc.html:159-212.
  **No regression; no code change.**

## Resolved facts
- **Logo was not a broken asset and not a clip bug.** Root cause: `index.vue` passed
  `is-trasparent=true`, which rendered `LogoWhite` (white-on-light = invisible wordmark) and the white
  search icon. Removing the prop fixed logo + search icon + auth theming in one change.
- **Header search is an icon-only button** (no inline form) — confirmed; `showSearch` stays false,
  the icon opens the lightbox.
- **Dashboard topbar left side** has no global title source; the per-page Hero provides breadcrumb+title.
  Restyled topbar chrome only.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Home header rendered the invisible white logo + white search icon**
- **Found during:** Task 1 (first screenshot showed clipped/invisible wordmark and missing search icon).
- **Issue:** `pages/index.vue` passed `:is-trasparent="true"`, selecting `LogoWhite` and `SearchIcon :white="true"`; both are white assets and disappeared on the light header zone. The planner's FACT 1 assumed `logo-black.svg` was rendering and being CSS-clipped — that premise was false.
- **Fix:** Removed `:is-trasparent="true"` from `index.vue` (the only public page passing it; all others already default to false → black logo + dark text).
- **Files modified:** apps/website/app/pages/index.vue
- **Commit:** 54c27858

**2. [Rule 1 - Bug] searchIcon prop defaulted to false instead of true**
- **Found during:** Task 1 (`.header--default__search` wrapper absent in the DOM).
- **Issue:** `defineProps<{ searchIcon?: boolean }>()` makes Vue treat it as a Boolean prop; when absent it resolves to `false`, so `props.searchIcon ?? true` never produced `true` and the icon was hidden site-wide.
- **Fix:** Switched to `withDefaults(..., { searchIcon: true, ... })`. Account's explicit `:search-icon="false"` still works (verified in Task 3).
- **Files modified:** apps/website/app/components/HeaderDefault.vue
- **Commit:** 54c27858

**3. [Rule 1 - Cleanup] Removed dead `bgColor` prop/const in HeaderDefault**
- Pre-existing unused; touched the same lines while adding withDefaults, removed it (no caller passes it) to avoid leaving an unused var Codacy would flag.
- **Commit:** 54c27858

### Intentional scope choices (not auto-fixes)
- **Dashboard avatar not converted to the mockup's 99px pill.** MenuUser is shared with the public/account header (approved 06-03 at 4px radius). Matching the dashboard 1:1 would regress the public version, so the public UserMenu styling was preserved and the non-1:1 dashboard avatar accepted.
- **Artículos (newspaper) topbar trigger kept** though absent from dashboard.dc.html — removing it would be a functional change (Rule 4), out of scope for a restyle. Styled consistently with the other icon buttons.
- **SearchIcon stays an `<img>`** (no new component): the black SVG does not recolor on hover; the *button* border/color transitions instead, which is the visible chrome in the mockup.

## Verification
- Public header (logged-out + logged-in) matches index.dc.html:99-125 — screenshot-verified.
- Search icon opens the lightbox; lightbox matches index.dc.html:159-212 — screenshot-verified.
- Dashboard topbar matches dashboard.dc.html:69-134; sidebar untouched; dropdown opens styled — screenshot-verified.
- Account header matches account.dc.html:28-37 — screenshot-verified, no regression.
- `vue-tsc --noEmit` clean after each task. No full test suite run (OOM rule). BEM strict, phase-04 tokens only, no box-shadow/scale, no unused vars/imports.

## Self-Check: PASSED

All 9 modified files exist on disk; both task commits (54c27858, 26ba9a2e) are present in git history; SUMMARY.md written.

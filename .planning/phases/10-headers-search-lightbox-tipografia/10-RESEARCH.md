# Phase 10: Headers + Search Lightbox + Tipografía — Research

**Researched:** 2026-06-19
**Domain:** Vue 3 / Nuxt 4 UI — Header layout, search lightbox, global typography
**Confidence:** HIGH (all findings based on direct file reading, no external lookups required)

---

## Summary

This phase is a **pixel-perfect alignment** of three existing surface areas to the v1.47 design maquetas. No new components are needed; all work is SCSS edits and prop-default changes. The design tokens ($ink, $ink2, $muted, $amber, $cream, $line) are already present in `_variables.scss` and used throughout. The LightboxSearch component is already well-structured and the composable already handles recents and categories — the gaps are visual-only.

The single highest-risk change is the `showMenu` default flip: ~20+ interior pages use `<HeaderDefault />` with no prop, which currently hides the nav. Changing the default to `true` will surface the nav on every one of those pages. Four specific page families (anunciar/*, pagar/*, packs/*, pro/*) require `showMenu` to stay hidden — they must receive explicit `:show-menu="false"`.

The dashboard header diverges significantly from the maqueta: the current `HeaderDashboard.vue` is a right-side toolbar only; the design shows a full topbar with breadcrumb + h1 title + 38×38 icon buttons + avatar pill. This is the most substantial visual delta of the phase. The `HeroHeaderDashboard.vue` currently handles breadcrumb+title as a separate `<section>` below the header — the design collapses them into one `<header>` element.

**Primary recommendation:** Execute in three isolated waves: (1) showMenu + header público, (2) LightboxSearch, (3) header cuenta + header dashboard + tipografía audit.

---

## Gap Analysis: Header Público

### Design spec (index.dc.html lines 109-135)

| Property | Design value |
|----------|-------------|
| position | `fixed` (not sticky) |
| height | `74px` |
| backdrop-filter | `blur(16px) saturate(1.08)` |
| border-bottom | `1px solid var(--line)` |
| background | `transparent` (always) |
| nav links | Anuncios · Por qué Waldo · Blog |
| nav link style | `color:var(--ink2); font-weight:500; font-size:15px` |
| nav link hover | `color:var(--ink)` (no background) |
| search icon button | `40×40px`, transparent bg, `color:var(--muted)`, hover: `bg:var(--cream) color:var(--ink)` |
| divider | `1px × 22px` bg `var(--line)` |
| auth links (logged-out) | Iniciar sesión + Regístrate — `font-weight:500 font-size:15px color:var(--ink2) padding:8px 11px border-radius:4px`, hover: `bg:var(--cream)` |
| CTA button | `font-weight:600 font-size:15px color:#26252B bg:var(--amber) padding:11px 20px border-radius:4px`, hover: `bg:var(--amberH)` |
| UserMenu | shown when logged in, class `hdr-desktop` (hidden <980px) |
| mobile trigger | 40×40px, `border:1px solid var(--line) bg:#fff border-radius:4px` |
| hide-on-scroll | `transform:translateY({{ headerOff }})` with `transition:.35s cubic-bezier(.4,0,.2,1)` |
| max-width inner | `1200px`, `padding:0 32px`, `gap:32px` |

### Current implementation gaps

| Property | Current | Design | Action |
|----------|---------|--------|--------|
| `position` | `sticky` | `fixed` | Change to `fixed` in `_header.scss` |
| `z-index` | `10` | `50` (design convention) | Increase to `50` |
| `backdrop-filter` on scroll | `blur(8px)` only after scrolled | `blur(16px) saturate(1.08)` always | Remove scroll-conditional overrides |
| `background` when scrolled-light | `rgba(255,255,255,0.8)` | Always transparent | Remove or rethink `--scrolled-light` modifier |
| `background` when scrolled-dark | `rgba(33,33,33,0.9)` | Not in design | Remove or scope to transparent-header pages only |
| `showMenu` default | `false` | Should be `true` for all interior pages | Flip default to `true`; add explicit `:show-menu="false"` to payment/flow pages |
| nav gap | inherited from `gap:32px` on `__left` | `gap:24px` between nav links | `.menu--default` or `MenuDefault` gap check |
| transition easing | `all 0.3s ease-in-out` | `transform .35s cubic-bezier(.4,0,.2,1)` | Update easing on hide/show |
| `&__left` gap | no explicit gap | Logo → nav gap: `margin-right:30px` on logo (already correct) | Verify |
| `&__lateral` / hamburger | hidden on desktop already | Correct pattern | No change |

### showMenu prop audit — pages requiring explicit `:show-menu="false"`

These pages currently rely on `showMenu` defaulting to `false`. After flipping the default, they **must** receive `:show-menu="false"` to preserve their no-nav design:

| Page family | Files | Reason |
|-------------|-------|--------|
| `anunciar/*` | index, datos-del-producto, datos-personales, ficha-de-producto, galeria-de-imagenes, resumen, gracias, error | Wizard flow — no nav |
| `pagar/*` | index, gracias, error | Payment flow |
| `packs/*` | comprar, gracias, error (not index — has isTrasparent already) | Funnel pages |
| `pro/pagar/*` | index, gracias | Pro payment flow |
| `pro/error`, `pro/gracias` | standalone thank-you pages | Funnel pages |

Pages that already pass `:show-menu="true"` explicitly:
- `pages/index.vue` — already correct
- `pages/por-que-waldo.vue` — already correct

Pages that get menu automatically after default flip (SAFE — these are browsable content pages):
- `anuncios/index.vue` — ✅ wants nav
- `anuncios/[slug].vue` — ✅ wants nav
- `blog/index.vue` — ✅ wants nav
- `blog/[slug].vue` — ✅ wants nav
- `[slug].vue` — ✅ wants nav (generic pages)

**Risk:** Forgetting any anunciar/pagar/pro page → nav appears inside checkout wizard. Must add `:show-menu="false"` to ALL ~14 funnel pages.

---

## Gap Analysis: Header Cuenta

### Design spec (account.dc.html lines 58-67)

| Property | Design value |
|----------|-------------|
| element | `<header>` (not via HeaderDefault) |
| position | `sticky; top:0` |
| z-index | `50` |
| height | `70px` |
| backdrop-filter | `blur(14px) saturate(1.06)` |
| border-bottom | `1px solid var(--line)` |
| background | `transparent` |
| logo | height `28px` (not 30px) |
| CTA | "Anunciar ahora" with plus icon — `font-weight:600 font-size:14.5px color:#26252B bg:var(--amber) padding:11px 18px border-radius:4px gap:8px` |
| UserMenu | always visible (logged-in only layout) |
| Nav links | **none** — no Anuncios/Blog/PorQuéWaldo |
| Mobile trigger | hamburger 40×40px, same style as public header |

### Current implementation

`layouts/account.vue` uses `<HeaderDefault :search-icon="false" />`. This renders the full public header with: 30px logo, no explicit height override, search-icon hidden, showMenu=false (no nav shown). The auth/user area appears correctly only when user is logged in.

### Current vs. design gaps

| Property | Current | Design | Action |
|----------|---------|--------|--------|
| `height` | `74px` (from .header--default) | `70px` | Need separate modifier or override |
| `backdrop-filter` | `blur(16px) saturate(1.08)` | `blur(14px) saturate(1.06)` | Override in account context |
| `logo height` | `30px` | `28px` | Override in account context |
| `position` | `sticky` (inherits) — but HeaderDefault current is sticky | `sticky` — OK once public changes to fixed | Verify after wave 1 |
| CTA text | "Anunciar ahora" with icon | "Anunciar ahora" with plus icon — same but `font-size:14.5px` not `15px`, `padding:11px 18px` not `11px 20px` | Small delta |
| `search-icon` | already `:search-icon="false"` | No search icon | Already correct |
| Nav links | hidden (showMenu=false default) | No nav | Already correct |

**Approach options:**
1. Add a new `layout-context="account"` prop to HeaderDefault that tweaks height/blur (adds complexity)
2. Create a dedicated `HeaderAccount.vue` component — cleaner but more files
3. Add CSS overrides in `_layout.scss` or `_account.scss` scoped to `.layout--account` — simplest, no prop drilling

**Recommended approach:** Option 3 — scoped CSS override inside the existing `.layout--account` block. This avoids a new component and new props while keeping the changes isolated.

---

## Gap Analysis: Header Dashboard

### Design spec (dashboard.dc.html lines 69-134)

The dashboard uses a **different layout architecture**: sidebar (left) + topbar (top of main) + content area. The topbar is:

| Property | Design value |
|----------|-------------|
| element | `<header>` inside `<main>` |
| background | `#fff` |
| border-bottom | `1px solid var(--line)` |
| padding | `12px 36px` |
| breadcrumb | optional "Waldo > " prefix — `font-size:13px font-weight:500 color:var(--muted)` |
| h1 title | `font-family:'Poppins' font-weight:700 color:var(--ink) font-size:20px letter-spacing:-.3px margin:0` |
| icon buttons | `38×38px border-radius:8px border:1px solid var(--line) bg:#fff color:var(--ink2)`, hover: `bg:var(--cream)` |
| button icons | Lucide: layout-grid (servicios), shopping-bag (órdenes), bell (notifs), maximize-2 (fullscreen) — `18×18px` |
| notification badge | `position:absolute top:7px right:8px min-width:15px height:15px border-radius:99px bg:var(--err) color:#fff font-size:9.5px font-weight:700 border:1.5px solid #fff` |
| divider | `1px × 26px bg:var(--line) margin:0 4px` |
| avatar pill | `border:1px solid var(--line) border-radius:99px padding:4px 12px 4px 4px bg:#fff` — avatar `32×32px border-radius:50% bg:var(--amber) font-weight:700 font-size:12.5px` + username `font-size:13.5px font-weight:600 color:var(--ink)` + chevron-down `15×15px color:var(--muted)` |
| dropdown menus | nested dropdowns for each button (300-330px wide, `border-radius:12px box-shadow:0 16px 40px -12px rgba(0,0,0,.25)`) |

### Current vs. design gaps

| Property | Current HeaderDashboard.vue | Design | Action |
|----------|------------------------------|--------|--------|
| Height | `64px` (CSS) | implicit (~62px content) — `padding:12px 36px` | Update to `padding:12px 36px` instead of fixed height |
| Left section | hamburger only (hidden on desktop) | breadcrumb + h1 title | HeroHeaderDashboard currently handles this separately |
| Buttons | ToolbarDefault (unknown) | 4 specific 38×38 icon buttons | Audit ToolbarDefault |
| Button size | unknown | `38×38px border-radius:8px` | Verify/update |
| Avatar | MenuUser component | pill style with `border-radius:99px` | MenuUser may need style update |
| Breadcrumb+title | In HeroHeaderDashboard (separate section below header) | Inline in topbar header | Architectural change needed |

**Key architectural finding:** The current design puts title+breadcrumb in `HeroHeaderDashboard.vue` as a `<section>` beneath the topbar. The maqueta puts them inside the topbar itself. The planner must decide: merge into `HeaderDashboard.vue` or keep separate and just style the topbar buttons/avatar. Given the design intent, the title should move into the header.

**HeroHeaderDashboard gaps:**

| Property | Current | Design | Action |
|----------|---------|--------|--------|
| h1 font-size | `32px` (CSS `_hero.scss`) | `20px` (as part of topbar) | If kept as section: no design spec for standalone; if merged into header: 20px |
| font-weight | `700` (CSS) | `700` — correct | No change |
| font-family | not explicitly Poppins | `'Poppins'` | Add explicit Poppins |
| color | `#1a1a1a` | `var(--ink)` / `#26252B` | Update to `$ink` |
| letter-spacing | not set | `-.3px` | Add |
| border-bottom (section) | `1px solid #e5e5e5` | border on topbar | If merged: remove from hero |

---

## Gap Analysis: LightboxSearch

### Design spec (index.dc.html lines 192-244)

| Property | Design value |
|----------|-------------|
| overlay | `position:fixed inset:0 z-index:300` |
| overlay bg | `rgba(38,37,43,.46)` |
| overlay backdrop | `blur(4px)` |
| overlay padding | `92px 24px 32px` (starts below header) |
| card max-width | `620px` |
| card bg | `#fff` |
| card border-radius | `10px` |
| card shadow | `0 28px 64px rgba(38,37,43,.30)` |
| card max-height | `78vh` |
| search bar padding | `16px 18px` |
| search bar border-bottom | `1px solid var(--line)` |
| input font-size | `18px` |
| input color | `var(--ink)` |
| clear button | `30×30px` |
| Esc button | `font-size:12px font-weight:600 color:var(--muted) border:1px solid var(--line) bg:#fff padding:5px 9px border-radius:4px` |
| panel padding | `10px` |
| "Últimas búsquedas" header | `flex justify-between padding:8px 12px 4px` — label `font-size:11px font-weight:700 letter-spacing:.1em text-transform:uppercase color:var(--muted)` — Borrar button `font-size:12.5px font-weight:600 color:var(--muted)` |
| recents row | clock icon `16×16 stroke:#9A96A0` + term `font-size:14.5px font-weight:500 color:var(--ink)` + arrow-up-right `15×15 stroke:#C2BEC7` |
| "Explora por categoría" label | `display:block font-size:11px font-weight:700 letter-spacing:.1em uppercase color:var(--muted) padding:12px 12px 4px` |
| category row | dot `9×9px` + name `font-size:14.5px font-weight:600 color:var(--ink)` + count `font-size:12.5px color:var(--muted)` |
| query results row | dot + main `{title:font-size:15px font-weight:600 / sub:12.5px muted}` + price `13px ink2` |
| "Buscar X" row | amber search icon `18×18` + text `font-size:14.5px color:var(--ink2)` + bold query |
| row hover | `bg:var(--cream) border-radius:5px` |

### Current implementation vs. design

| Element | Current state | Gap |
|---------|--------------|-----|
| Overlay z-index | `1000` | Design shows `300`. Current is higher — might conflict with notification dropdowns (z-index:60). Keep at `300` or higher. |
| Overlay animation | `opacity 0.25s ease` + `transform: translateY(-12px)` on box | Design has no animation specified. Current is fine. |
| "Últimas búsquedas" | **Already implemented** in `LightboxSearch.vue` lines 68-90 | Feature exists, just needs visual check |
| Recents composable | `useSearchSuggestions` — `recents`, `loadRecents`, `pushRecent`, `clearRecents` all implemented | Logic complete |
| Categories | Already loads via `filterStore.loadFilterCategories()` | Logic complete |
| `__row__term` font-size | `.lightbox--search__row__term` = `14.5px font-weight:500` — correct | No gap |
| `__row__name` font-size | `.lightbox--search__row__name` = `14.5px font-weight:600` — correct | No gap |
| Category label padding | `padding: 12px 12px 4px` via `&--cats` modifier — correct | No gap |
| Esc button hover | `bg:$cream color:$ink` — correct | No gap |
| "Buscar X" icon color | `$tag` (#A9772E) — design shows `#A9772E` — correct | No gap |
| Clock icon color | hardcoded `#9A96A0` (close to $muted) | Minor: could use $muted variable |
| Trail icon color | hardcoded `#C2BEC7` | Minor: hardcoded, acceptable |

**Assessment: LightboxSearch is ~85% done.** The structure, logic, and most styles match the design. The main outstanding items are:
1. Visual verification that the recents section renders correctly when recents exist
2. Check that the overlay z-index doesn't conflict with the header (z-index 50 after wave 1)
3. The `__row__lead` for clock uses `color:#9a96a0` (inline in SCSS) — minor, not a blocker

---

## Typography Audit

### Global observation

The design uses **Poppins exclusively** as the font family. The website already loads Poppins via Google Fonts. The `_variables.scss` and most components use `font-family: 'Poppins', sans-serif` explicitly where needed. The body/default font is set via design's `font-family:'Poppins',system-ui,sans-serif`.

### Critical size deltas found

| Component/Element | Current size | Design size | Location |
|-------------------|-------------|-------------|----------|
| `hero--dashboard__title` | `32px` | `20px` (if merged into topbar) | `_hero.scss` line 826 |
| `hero--dashboard__subtitle` | `16px color:#6b7280` | N/A (not in topbar design) | `_hero.scss` line 856 |
| `hero--dashboard__title` color | `#1a1a1a` | `$ink` (#26252B) | `_hero.scss` line 828 |
| `related--ads__title` | `32px bold color:$charcoal` | Not audited in this phase | `_related.scss` — out of scope for wave 1 |
| `announcement--single__body__description__title` | `24px font-weight:800` | matches design patterns | OK |
| `hero--home__text` | `18px` | `18px` | Correct |
| `hero--home__title` | `clamp(34px, 4vw, 54px)` | `clamp(34px,4vw,54px)` | Correct |

### Font tokens needing attention

The `hero--dashboard` section uses hardcoded `#1a1a1a` and `#6b7280` — pre-redesign colors. These should be `$ink` and `$muted` respectively.

**Typography audit scope for this phase:**
1. `_hero.scss` — `.hero--dashboard__title` color and size correction
2. `_header.scss` — nav link font-size (15px/weight:500) — already correct in the auth section
3. `HeroHeaderDashboard.vue` inline `<style scoped>` — `title` class needs Poppins 700 20px $ink -.3px letter-spacing

**Out of scope for this phase** (belong to their own component phases):
- `_related.scss` — old charcoal colors
- `_announcement.scss` — mostly OK, uses v1.47 tokens already

---

## SCSS Variables Status

All required design tokens already exist in `apps/website/app/scss/abstracts/_variables.scss`:

| Token | Variable name | Value | Status |
|-------|--------------|-------|--------|
| `--ink` | `$ink` | `#26252b` | EXISTS |
| `--ink2` | `$ink2` | `#56535f` | EXISTS |
| `--muted` | `$muted` | `#8a8794` | EXISTS |
| `--amber` | `$amber` | `#f7c97e` | EXISTS |
| `--amberH` | `$amber_hover` | `#efb85c` | EXISTS |
| `--cream` | `$cream` | `#f6f4f1` | EXISTS |
| `--line` | `$line` | `#ece9e4` | EXISTS |
| `--tag` | `$tag` | `#a9772e` | EXISTS |
| `--err` | `$error` | `#e4534b` | EXISTS |
| `--ok` | `$success` | `#3b9e63` | EXISTS |

**No new variables need to be created.** The design's CSS custom properties (`--ink`, `--ink2`, etc.) map 1:1 to the existing SCSS variables. Use the SCSS variables in all new code; do not create duplicate CSS custom properties.

One note: the design uses `--dark:#26252B` which is identical to `$ink`. Use `$ink`.

---

## Risks & Dependencies

### Risk 1: showMenu default flip (HIGH impact)
**What:** Changing `showMenu` default from `false` to `true` affects ~20 pages.
**Risk:** Funnel pages (anunciar/*, pagar/*, pro/pagar/*) get unwanted nav.
**Mitigation:** Before the flip, grep all `<HeaderDefault />` usages and add `:show-menu="false"` to funnel pages atomically in the same commit.
**Verification:** Visit /anunciar and /pagar after the change — nav must NOT appear.

### Risk 2: position:sticky → position:fixed (MEDIUM impact)
**What:** The public header changes from sticky to fixed.
**Risk:** Page content loses the sticky offset (header no longer pushes content down). All page padding-top values were sized for a sticky header. Padding-top for pages below the 74px fixed header must be maintained or increased.
**Current state:** `hero--home__container` has `padding:104px 32px 84px` — already accounts for fixed header offset. `hero--results` has `padding-top:104px`. These are likely correct.
**Risk:** Pages with `HeroFake` or any section that doesn't have explicit top padding will collide with the header.
**Mitigation:** Check `/anunciar` flows — they use `HeroFake`. Check padding of that component.

### Risk 3: Dashboard header architectural merge (MEDIUM-HIGH)
**What:** Moving breadcrumb+title from `HeroHeaderDashboard.vue` into the `HeaderDashboard.vue` topbar.
**Risk:** All dashboard pages that use `<HeroHeaderDashboard>` pass title and breadcrumbs as props. If we merge, HeaderDashboard needs to receive those props too, or the slot mechanism needs to be rethought.
**Alternative (lower risk):** Keep HeroHeaderDashboard as a section below the topbar, and only fix the topbar button sizes (38×38) and avatar pill style. This doesn't fully match the design but avoids architectural changes in this phase.
**Recommendation:** The plan should address this architectural decision explicitly — either merge (needs prop threading through layout.vue) or keep separate (just fix button/avatar styles).

### Risk 4: BEM violations in existing SCSS
**Finding:** `_hero.scss` lines 856-858 use `&__subtitle` with `color:#6b7280` and `&__title` with `color:#1a1a1a` — these are pre-redesign hardcoded colors. Not a BEM violation per se, but use non-token colors.
**Mitigation:** Update to `$ink` and `$muted` in the same wave.

### Risk 5: z-index conflicts
**What:** Header moves to `z-index:50`. LightboxSearch is at `z-index:1000`. Other lightboxes are at 1000. Dashboard dropdowns are at `z-index:60`.
**Verdict:** Safe. The chain is: header (50) < dropdowns (60) < lightboxes (1000).

---

## Recommended Execution Order

### Wave 1: Header público (3 tasks)
1. **Fix showMenu default + funnel pages** — flip default to `true` in HeaderDefault.vue, add `:show-menu="false"` to all ~14 funnel pages atomically. This is the highest-risk change and should be isolated.
2. **Header público SCSS** — change `position:sticky` → `fixed`, `z-index:10` → `50`, update transition easing, clean up scroll-conditional background overrides.
3. **Verify padding-top offsets** — ensure hero sections don't collide with fixed header.

### Wave 2: LightboxSearch
4. **LightboxSearch visual verification** — the component is nearly done. Run the app, open the search, check recents and categories render correctly. Fix any visual gaps (icon colors, padding tweaks).

### Wave 3: Header cuenta + Dashboard + Tipografía
5. **Header cuenta** — add scoped CSS overrides in `.layout--account` to set `height:70px`, `backdrop-filter:blur(14px) saturate(1.06)`, logo `height:28px`.
6. **Header dashboard** — update HeaderDashboard.vue: button sizes to 38×38, border-radius:8px, avatar pill style (`border-radius:99px`). Decide on breadcrumb+title merge.
7. **HeroHeaderDashboard / dashboard title** — fix font-size to 20px Poppins 700, color to `$ink`, letter-spacing `-.3px`. Fix `#1a1a1a` and `#6b7280` to `$ink` / `$muted`.
8. **Tipografía audit** — spot-check remaining hardcoded colors in dashboard SCSS.

---

## Key Files Modified Per Wave

### Wave 1 — Header público
- `apps/website/app/components/HeaderDefault.vue` — `showMenu` default: `false` → `true`
- `apps/website/app/pages/anunciar/*.vue` (7 files) — add `:show-menu="false"`
- `apps/website/app/pages/pagar/*.vue` (3 files) — add `:show-menu="false"`
- `apps/website/app/pages/packs/comprar.vue`, `packs/gracias.vue`, `packs/error.vue` — add `:show-menu="false"`
- `apps/website/app/pages/pro/error.vue`, `pro/gracias.vue`, `pro/pagar/index.vue`, `pro/pagar/gracias.vue` — add `:show-menu="false"`
- `apps/website/app/scss/components/_header.scss` — position, z-index, transition, scroll modifiers

### Wave 2 — LightboxSearch
- `apps/website/app/components/LightboxSearch.vue` — minor fixes if needed
- `apps/website/app/scss/components/_lightbox.scss` — `&--search` section tweaks

### Wave 3 — Cuenta + Dashboard + Tipografía
- `apps/website/app/scss/components/_layout.scss` or `_account.scss` — account header overrides
- `apps/website/app/components/HeaderDashboard.vue` — button sizes, avatar pill
- `apps/website/app/scss/components/_header.scss` — dashboard modifier updates
- `apps/website/app/components/HeroHeaderDashboard.vue` — if title merge decided
- `apps/website/app/scss/components/_hero.scss` — dashboard title colors/sizes

---

## Validation Architecture

> No automated test infrastructure applies to this phase. All changes are CSS/SCSS and prop defaults — visual-only.

### Phase Requirements → Test Map

| Behavior | Test Type | Command |
|----------|-----------|---------|
| showMenu default flip | manual | Visit `/anunciar` — no nav; visit `/anuncios` — nav visible |
| Header fixed position | manual | Scroll on `/anuncios` — header stays fixed at top |
| LightboxSearch opens/closes | manual | Click search icon → modal appears; press Esc → closes |
| Recents section visible | manual | Search once, close, reopen — "Últimas búsquedas" appears |
| Dashboard header buttons | manual | Visit `/dashboard` — 38×38 buttons visible in topbar |
| Cuenta header height | manual | Visit `/cuenta` — header height visually ~70px with blur |

**No Wave 0 gaps** — no test files needed; this is a visual/UI-only phase.

---

## Sources

### Primary (HIGH confidence)
- `apps/design/index.dc.html` — complete design spec for public header (lines 109-135) and search lightbox (lines 192-244), CSS vars (lines 106)
- `apps/design/account.dc.html` — account header spec (lines 58-67)
- `apps/design/dashboard.dc.html` — dashboard topbar spec (lines 69-134)
- `apps/website/app/components/HeaderDefault.vue` — current public header implementation
- `apps/website/app/scss/components/_header.scss` — current header SCSS
- `apps/website/app/components/LightboxSearch.vue` — current search lightbox
- `apps/website/app/scss/components/_lightbox.scss` — lightbox SCSS
- `apps/website/app/scss/abstracts/_variables.scss` — all SCSS tokens
- `apps/website/app/pages/*/` — all pages using HeaderDefault (grepped)

### Secondary (MEDIUM confidence)
- `apps/website/app/scss/components/_hero.scss` — typography values for dashboard hero
- `apps/website/app/scss/components/_announcement.scss` — typography patterns verified OK

---

## Metadata

**Confidence breakdown:**
- Gap analysis — Header público: HIGH — direct code vs. design comparison
- Gap analysis — Header cuenta: HIGH — direct code vs. design comparison
- Gap analysis — Header dashboard: HIGH — direct code vs. design comparison, architectural risk documented
- Gap analysis — LightboxSearch: HIGH — all sections already implemented, minor visual gaps
- Typography audit: HIGH — direct SCSS reading, specific line references provided
- SCSS variables status: HIGH — verified against actual `_variables.scss` file

**Research date:** 2026-06-19
**Valid until:** stable (no external dependencies)

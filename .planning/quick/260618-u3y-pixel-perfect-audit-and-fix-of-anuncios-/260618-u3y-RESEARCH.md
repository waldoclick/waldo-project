# Quick Task 260618-u3y — /anuncios Pixel-Perfect Audit

**Researched:** 2026-06-18
**Domain:** /anuncios page layout — HeroResults, FilterResults, AdArchive grid, sidebar
**Confidence:** HIGH (screenshot taken, mockup inspected, all component files read)

---

## 1. Current State vs Mockup Diff (exhaustive)

### Screenshot observation
Current `/anuncios` renders with:
- Old-style compact header (transparent, old logo variant)
- Hero: white/cream tint background, breadcrumb + "Anuncios" h1 (Poppins 800 40px) — no search box in the hero
- A horizontal toolbar bar (FilterResults) below the hero: ubicación selector + "{N} anuncios" + order select
- Ad grid: `repeat(auto-fill, minmax(280px, 1fr))` gap 22px — renders 4 cols at 1440px
- Pagination: `vue-awesome-paginate` at bottom of grid (renders numbered buttons: 1 2 3 4 5)

### Mockup specification (index.dc.html lines 635–763)
The `/anuncios` (list) view in the mockup has:

| Element | Mockup | Current | Delta |
|---------|--------|---------|-------|
| **Hero background** | `wash(category)` = `oklch(0.975 0.02 {HUE})` when category selected; `#F6F4F1` (`$cream`) when no category | `bgColorWithTransparency(categoryColor, 0.2)` — hex-to-rgba 20% opacity of the raw category hex | **BROKEN** — current converts a hex RGB color to rgba(…,0.2). Mockup uses oklch-based wash which is a perceptually neutral tint. The result is similar in intent but the mechanism differs; more importantly, the fallback when no category is selected should be exactly `#F6F4F1` ($cream), not `rgba(#f0f0f0, 0.2)`. The fallback in index.vue passes `'#f0f0f0'` when no category, giving `rgba(240,240,240,0.2)` which is nearly transparent — should be solid $cream. |
| **Hero container** | `max-width:1200px; margin:0 auto; padding:104px 32px 34px` | `@extend .container` (1300px wide) in `__container`; padding-top 104px OK | Container is 1200px in mockup vs 1300px (`.container`) in code. 100px wide difference. |
| **Hero layout** | Title + search box side-by-side in a flex row (`justify-content:space-between`) — search box `min-width:min(540px,100%)` is on the RIGHT of the title row | Title only — no search box | **MISSING: search box inside hero.** The mockup embeds SearchDefault (540px wide) inside the hero, aligned right of the h1. Current hero has no search box. |
| **Hero sub-text** | `{{ heroSub }}` — e.g. "Equipos de Minería publicados en Waldo.click." or "Explora equipos, vehículos, repuestos e insumos de toda la industria." — rendered as `<p style="margin:10px 0 0;font-size:15px;color:var(--ink2)">` | `<div v-if="queryValue">Resultados para: <b>…</b></div>` — only shows if a `?s=` query is present | **MISSING: heroSub paragraph.** The mockup always renders a subtitle below the h1. |
| **Hero tile icon** | 58×58px, `border-radius:4px`, `background:{{ heroTileBg }}` = `baseC(category)` = `oklch(0.66 0.16 {HUE})`, white SVG icon 26px, **only shown when a category is selected** | 58×58px `background: var(--category-icon-bg-color)` = raw `props.color` (the hex category color) | Tile shows even when no category selected (because categoryIcon is undefined, so `v-if="categoryIcon"` hides the tile correctly — this part is OK). But the background color is the raw hex from Strapi; the mockup uses `baseC()` which is an oklch-computed color. The visual difference is minor but technically different. |
| **Hero border-bottom** | `border-bottom: 1px solid var(--line)` | `border-bottom: 1px solid $line` | Same — OK. |
| **Body layout** | `max-width:1200px; margin:0 auto; padding:40px 32px 80px; display:grid; grid-template-columns: 266px 1fr; gap:42px` — **LEFT SIDEBAR (266px) + RIGHT CONTENT** | No sidebar. HeroResults + FilterResults (toolbar) + AdArchive (full-width grid) stacked vertically | **MAJOR: sidebar filter panel missing.** Mockup has a sticky left sidebar (266px) with: Filtros title, Categoría checkboxes, Condición radios, Precio radios, Año radios, Ubicación dropdown. Current has no sidebar. |
| **Sidebar** | Sticky `top:96px`, `background:#fff; border:1px solid var(--line); border-radius:4px; padding:22px 20px`. Sections: Categoría (checkboxes), Condición (radios: Todos/Nuevo/Usado), Precio (radio ranges), Año (radio ranges), Ubicación (select dropdown) | **Does not exist** | **OUT OF SCOPE per STATE.md (08-01 key decision).** The 08-01 plan explicitly states: "no left-sidebar filter panel — the mockup 'Filtros' button has no app behavior". However the FilterResults toolbar was kept. This sidebar gap is **intentional** per 08-01. Do NOT implement sidebar for this task. |
| **Toolbar (FilterResults)** | In the RIGHT content column: `display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px`. LEFT side: "Filtros" button (mobile-only) + "{N} anuncios". RIGHT side: "Ordenar por" label + select. | `filter filter--announcement` section: left side has ubicación icon-select + count; right side has "Ordenar por" + select | **LAYOUT CORRECT** but current toolbar has a ubicación dropdown that the mockup does not have in the same position (ubicación is in the sidebar which is deferred). The toolbar in the mockup only has: Filtros button (mobile) + count on left; sort on right. |
| **Ad card grid** | `display:grid; grid-template-columns:repeat(auto-fill,minmax(224px,1fr)); gap:22px` — `minmax(224px,1fr)` | `repeat(auto-fill, minmax(280px, 1fr))` gap 22px | **minWidth 280px vs 224px.** At 1440px viewport with 1200px container and 266px sidebar, the available width for the grid is ~892px. With `minmax(224px,1fr)` that fits 3–4 cols. With `minmax(280px,1fr)` fewer cols fit. However **the sidebar is not implemented**, so current has full-width which gives 4 cols at 280px — matches the 08-01 "3–4 cols at 1440" spec. This is intentional per 08-01 notes. |
| **Pagination** | **Not present** in the mockup list view (mockup is client-side filtered, no server pages). The mockup `view:'list'` has no paginate element. | `vue-awesome-paginate` component renders numbered buttons 1–5 at bottom | Pagination is correct app behavior (server-side paging) not present in mockup. Keep as-is. |
| **Empty state** | `border:1px dashed var(--line); border-radius:4px; background:var(--cream)` + search icon ($placeholder color) + "Sin resultados" + "Prueba ajustar o limpiar los filtros." + amber "Limpiar filtros" button | `.announcement--archive__empty` — identical spec | MATCHES — OK. |
| **FilterResults ubicación selector** | Sidebar in mockup, not in toolbar | Toolbar has a ubicación select with left filter icon, `background:$cream`, `padding-left:36px` | The ubicación is an extra element that exists in the current toolbar but not in the mockup toolbar. Since the sidebar is deferred, the ubicación select should stay in the toolbar (existing behavior). |

### Net Visual Differences (actionable for this task)

1. **Hero fallback background** — When no category: current passes `#f0f0f0` → `rgba(240,240,240,0.2)` (nearly transparent white). Should be solid `$cream` = `#F6F4F1`. Fix: in `index.vue` pass `categoryData?.color || ''` and in `HeroResults` fall back to `$cream` solid, OR just pass a sentinel. Simplest fix: change the default in index.vue from `'#f0f0f0'` to `'#F6F4F1'` and in `bgColorWithTransparency` detect that it should be alpha=1 when no category.

2. **Hero missing sub-text** — Mockup always shows a subtitle: category-specific or generic. Current only shows `?s=` query text. Fix: add a `sub` prop to HeroResults and render `<p class="hero--results__sub">`.

3. **Hero missing SearchDefault** — The mockup places a full SearchDefault (SearchDefault.vue already exists and is styled for this exact use case) on the RIGHT of the h1 inside the hero. Current implementation has no search box in the hero. Fix: add a search-wrap slot or conditional SearchDefault inside HeroResults, or pass it as content from the parent.

4. **Hero container width** — Mockup uses `max-width:1200px` not `@extend .container` (1300px). The `hero--results__container` should use `max-width:1200px; margin:0 auto; padding-left:32px; padding-right:32px` rather than the shared `.container` extension. This is consistent with the rest of the mockup (detail hero, gsplit body all use 1200px).

5. **FilterResults toolbar** — The toolbar's left side should be: "Filtros" button (mobile-only, hidden on desktop) + "{N} anuncios". Currently the ubicación select is on the left — that filter belongs to the deferred sidebar. For this task: remove the ubicación select from FilterResults on desktop or keep it (it's functional app behavior not in the mockup). **Recommendation: keep the ubicación select** since the sidebar is deferred — removing it would lose filtering functionality.

---

## 2. Hero Color Mechanism

### Mockup approach (oklch perceptual)
```js
// From index.dc.html lines 1783–1787
HUE = {'Minería':62,'Comunicaciones':250,'Transporte':210,'Energía':96,...}
wash(c)  { return 'oklch(0.975 0.02 '+(this.HUE[c]||60)+')'; }   // hero background (very light tint)
baseC(c) { return 'oklch(0.66 0.16 '+(this.HUE[c]||60)+')'; }    // tile icon background, dots
onC(c)   { return 'oklch(0.52 0.13 '+(this.HUE[c]||60)+')'; }    // text color on tint
tint(c)  { return 'oklch(0.955 0.035 '+(this.HUE[c]||60)+')'; }  // pill background
```

- `heroBg` = `wash(category)` when category selected; `'#F6F4F1'` ($cream) when no category
- `heroTileBg` = `baseC(category)` (the 58px icon tile background)
- These colors are computed from the **category name string** using a lookup table of HUE angles
- The Strapi category color field (hex) is what the current implementation uses

### Current approach (hex-to-rgba)
```ts
// useColor.ts — bgColorWithTransparency(hex, alpha=0.2)
// HeroResults.vue line 46: bgColorWithTransparency(props.bgColor || '#f0f0f0')
```
- Takes the `category.color` hex from Strapi
- Converts to `rgba(r,g,b,0.2)` — 20% opacity on white = very light tint
- **This is functionally equivalent** to `wash()` conceptually (both produce a pale tint)
- **The critical bug is the fallback**: `'#f0f0f0'` → `rgba(240,240,240,0.2)` is nearly invisible vs `#F6F4F1` solid

### Fix strategy
The mockup uses oklch computed from category name. The app uses Strapi's hex `category.color`. Since the Strapi categories already have custom brand colors, the current hex→rgba approach is acceptable. The key fix is:
1. **Default background when no category**: must be solid `$cream` (#F6F4F1), not transparent
2. **Fix `bgColorWithTransparency`** or change the fallback: pass `'#F6F4F1'` directly when `categoryData` is null, and use `alpha=1` for that case

Alternate cleaner fix: in HeroResults computed heroStyle, check if bgColor is a "real" category color or the fallback:
```ts
const heroStyle = computed(() => ({
  "--hero-bg-color": props.bgColor
    ? bgColorWithTransparency(props.bgColor)
    : '#F6F4F1',  // solid $cream when no category
  "--category-icon-bg-color": props.color || "transparent",
}));
```
And in index.vue: pass `:bg-color="categoryData?.color || ''"` (empty string → falls to cream).

---

## 3. Pagination Design Spec from Mockup

**The mockup has no pagination in the /anuncios view.** The mockup is a client-side prototype filtering ~30 in-memory listings. No paginate element exists in the list view (lines 635–763).

The current `vue-awesome-paginate` implementation is **correct application behavior** (server-side 20 results per page). Keep as-is. No visual changes needed for pagination in this task.

The `PaginationDefault.vue` component is a separate dashboard-style component (shows "Mostrando X-Y de Z registros") not used on /anuncios. The AdArchive uses `vue-awesome-paginate` directly.

---

## 4. Component / File Map

| Component | File | SCSS Owner |
|-----------|------|------------|
| Page | `apps/website/app/pages/anuncios/index.vue` | n/a |
| Hero | `apps/website/app/components/HeroResults.vue` | `_hero.scss` `.hero--results` |
| Toolbar | `apps/website/app/components/FilterResults.vue` | `_filter.scss` `.filter--announcement` |
| Ad grid | `apps/website/app/components/AdArchive.vue` | `_announcement.scss` `.announcement--archive` |
| Ad card | `apps/website/app/components/CardAnnouncement.vue` | `_card.scss` `.card--announcement` |
| Pagination | inline in AdArchive (vue-awesome-paginate) | `_announcement.scss` `.announcement--archive__paginate` |
| Search | `apps/website/app/components/SearchDefault.vue` | `_search.scss` `.search--default` |
| Breadcrumbs | `apps/website/app/components/BreadcrumbsDefault.vue` | `_breadcrumbs.scss` |
| Color util | `apps/website/app/composables/useColor.ts` | n/a |

### Relevant SCSS variable names in use
| Token | Value | Used in |
|-------|-------|---------|
| `$ink` | `#26252b` | hero title, body text |
| `$ink2` | `#56535f` | hero sub, secondary text |
| `$muted` | `#8a8794` | breadcrumb links, placeholder |
| `$amber` | `#f7c97e` | search button bg, CTA buttons |
| `$amber_hover` | `#efb85c` | search button hover |
| `$cream` | `#f6f4f1` | hero fallback bg, card bg |
| `$line` | `#ece9e4` | borders, hero border-bottom |
| `$tag` | `#a9772e` | icon accent color |
| `$white` | `#ffffff` | search box bg |

---

## 5. SearchDefault Integration Status

**SearchDefault is NOT integrated into /anuncios** currently.

- The hero (`HeroResults.vue`) has no search box
- The header (`HeaderDefault`) has a search icon that opens the `LightboxSearch` modal
- SearchDefault is used on `HeroHome` (but it's a different inline implementation there; the hero home has its own search that navigates to `/anuncios?s=`)
- SearchDefault.vue is a standalone component ready to be placed in the hero

**Mockup hero search spec** (line 659):
```html
<div style="position:relative; background:#fff; border:1px solid var(--line); border-radius:4px; 
  padding:6px; display:flex; align-items:center; gap:2px; min-width:min(540px,100%)">
  <!-- icon + input + clear button | Buscar button -->
</div>
```
This exactly matches the `.search--default` BEM block in `_search.scss` / `SearchDefault.vue`.

**Integration pattern needed:**
- Pass `categories` prop to SearchDefault (from categoriesStore in page)
- Place SearchDefault inside the hero title row (right side)
- The hero layout becomes a flex row: `justify-content:space-between; gap:28px; flex-wrap:wrap`

---

## 6. Recommended Fix Order

### Priority 1 — Hero background color (visual correctness)
**Files:** `apps/website/app/pages/anuncios/index.vue` + `apps/website/app/components/HeroResults.vue`

Change index.vue: `:bg-color="categoryData?.color || ''"` (empty string signals no category).
Change HeroResults computed: when `bgColor` is empty/falsy → use solid `#F6F4F1`; when truthy → existing `bgColorWithTransparency`.

### Priority 2 — Hero subtitle
**Files:** `apps/website/app/components/HeroResults.vue` + `apps/website/app/scss/components/_hero.scss`

Add `sub?: string` prop. Render `<p class="hero--results__sub">{{ sub }}</p>` after the title block.
Pass from index.vue: `:sub="categoryData ? 'Equipos de ' + categoryData.name + ' publicados en Waldo.click.' : 'Explora equipos, vehículos, repuestos e insumos de toda la industria.'"`.
Add to `_hero.scss` under `.hero--results`:
```scss
&__sub {
  margin: 10px 0 0;
  font-size: 15px;
  color: $ink2;
}
```

### Priority 3 — Hero SearchDefault integration
**Files:** `apps/website/app/components/HeroResults.vue` + `apps/website/app/scss/components/_hero.scss`

Add `categories` prop to HeroResults (type `FilterCategory[]`, optional). Place SearchDefault in a flex row alongside the title. Add SCSS for the row layout in `hero--results__title` or a new `hero--results__row` element:
```scss
&__row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  flex-wrap: wrap;
}
```
In index.vue: pass `:categories="categoriesStore.categories"`.

### Priority 4 — Hero container max-width
**Files:** `apps/website/app/scss/components/_hero.scss`

Change `.hero--results__container`:
```scss
// Before:
@extend .container;

// After:
max-width: 1200px;
margin: 0 auto;
padding-left: 32px;
padding-right: 32px;
```
This aligns with the rest of the redesigned pages (announcement single, why hero) that all use 1200px.

---

## 7. What Stays As-Is (intentional deviations from mockup)

Per STATE.md 08-01 key decisions — DO NOT change:
- **Left sidebar filter panel** — deferred. Mockup has 266px sidebar with Categoría/Condición/Precio/Año/Ubicación checkboxes/radios. App keeps the toolbar approach. No sidebar needed for this task.
- **Grid min-width** — current `minmax(280px,1fr)` is intentional per 08-01 ("3-4 cols at 1440, 1 col at 390"). Mockup `224px` was designed for the 892px constrained column. With no sidebar, 280px with 1300px container also yields 4 cols.
- **Pagination** — vue-awesome-paginate is correct for server-side paging. Mockup has none.
- **FilterResults toolbar** — the ubicación select is an app feature not in the mockup. Keep it.
- **Card design** — CardAnnouncement is owned by 08-01 and must not be re-touched.

---

## Sources

- `apps/design/index.dc.html` — lines 635–763 (list view), 1783–1793 (color functions), 2288–2302 (hero data binding) — HIGH confidence
- `apps/website/app/components/HeroResults.vue` — read directly — HIGH confidence
- `apps/website/app/components/FilterResults.vue` — read directly — HIGH confidence
- `apps/website/app/components/AdArchive.vue` — read directly — HIGH confidence
- `apps/website/app/scss/components/_hero.scss` (`.hero--results` block) — read directly — HIGH confidence
- `apps/website/app/scss/components/_filter.scss` — read directly — HIGH confidence
- `apps/website/app/scss/abstracts/_variables.scss` — read directly — HIGH confidence
- `apps/website/app/composables/useColor.ts` — read directly — HIGH confidence
- Playwright screenshot `/tmp/anuncios-current.png` at 1440×900 — HIGH confidence

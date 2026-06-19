---
phase: quick-260619-dps
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/components/FilterSidebar.vue
  - apps/website/app/pages/anuncios/index.vue
  - apps/website/app/components/FilterResults.vue
  - apps/website/app/components/AdArchive.vue
  - apps/website/app/components/HeroResults.vue
  - apps/website/app/scss/components/_filter.scss
  - apps/website/app/scss/components/_announcement.scss
  - apps/website/app/scss/components/_hero.scss
autonomous: false
requirements: [ANUNCIOS-SIDEBAR, ANUNCIOS-LAYOUT, ANUNCIOS-FILTERS, ANUNCIOS-TOOLBAR, ANUNCIOS-GRID, ANUNCIOS-PAGINATION, ANUNCIOS-HERO-SEARCH]

must_haves:
  truths:
    - "A filter sidebar renders on /anuncios (desktop) with Categoría, Condición, Precio, Año, and Ubicación sections — and renders even when there are zero results"
    - "Clicking a category checkbox sets ?category=slug and re-fetches the listing; clicking the active one clears it (single-select)"
    - "Selecting Condición/Precio/Año/Ubicación options writes ?condition / ?price / ?year / ?commune to the URL and filters the catalog server-side"
    - "The 'Limpiar' button removes all filter params (preserving ?s= if present) and navigates to /anuncios"
    - "The toolbar (FilterResults) shows '{N} anuncios' on the left and only an Ordenar-por select on the right — ubicación select removed"
    - "The card grid shows ~4 columns on desktop using a 224px minmax track; pagination uses PaginationDefault (no vue-awesome-paginate)"
    - "The hero SearchDefault keeps a usable min-width instead of collapsing on the results row"
  artifacts:
    - path: "apps/website/app/components/FilterSidebar.vue"
      provides: "Sidebar filter component (filter--sidebar) driving category/condition/price/year/commune URL params"
      min_lines: 120
    - path: "apps/website/app/pages/anuncios/index.vue"
      provides: "Refactored grid layout (listing--anuncios) + condition/price/year filter params in useAsyncData"
      contains: "listing--anuncios"
    - path: "apps/website/app/components/FilterResults.vue"
      provides: "Slim toolbar (filter--toolbar) with count + order select only"
      contains: "filter--toolbar"
    - path: "apps/website/app/components/AdArchive.vue"
      provides: "PaginationDefault-based paginator"
      contains: "PaginationDefault"
  key_links:
    - from: "apps/website/app/components/FilterSidebar.vue"
      to: "route.query (category/condition/price/year/commune)"
      via: "router.push on checkbox/radio/select change"
      pattern: "router.push"
    - from: "apps/website/app/pages/anuncios/index.vue"
      to: "ads/catalog (filtersParams)"
      via: "condition/price/year mapped into filtersParams in useAsyncData"
      pattern: "filtersParams"
    - from: "apps/website/app/components/AdArchive.vue"
      to: "PaginationDefault @page-change"
      via: "onClickHandler pushes ?page"
      pattern: "page-change"
---

<objective>
Implement the full /anuncios listing redesign per the mockup: a new left filter sidebar (categoría/condición/precio/año/ubicación), a 2-column grid page layout, three new URL+API filters (condition/price/year), a slimmed-down toolbar, a corrected card grid track, the shared PaginationDefault paginator, and a hero search min-width fix.

Purpose: Bring /anuncios to pixel + functional parity with the approved mockup; give users real server-side filtering.
Output: 1 new component + 4 modified components/pages + 3 modified SCSS files.

CRITICAL CORRECTION vs the task brief: In the Strapi Ad schema, `condition` is a RELATION to `api::condition.condition` (it has `name`/`slug`), NOT a string field. The brief's `filtersParams.condition = { $eq: 'Nuevo' }` would silently match nothing. Use a relation query against the auto-generated slug instead: `condition: { slug: { $eq: 'nuevo' } }` / `{ $eq: 'usado' }`. `price` and `year` are `biginteger` — numeric `$lt/$gte/$lte` are correct.
</objective>

<context>
@.planning/STATE.md

# Page + components being refactored
@apps/website/app/pages/anuncios/index.vue
@apps/website/app/components/FilterResults.vue
@apps/website/app/components/AdArchive.vue
@apps/website/app/components/HeroResults.vue

<interfaces>
<!-- Use these directly. No codebase exploration needed. -->

// filterStore (Pinia, useFilterStore) — CLIENT-ONLY (see SSR note below)
//   filterStore.filterCategories: FilterCategory[]  // { id, name, slug, color?, icon?, count? } — count IS populated by the backend filter.service
//   filterStore.filterCommunes:  FilterCommune[]    // { id, name, slug, region:{id,name} } — NO count

// Strapi Ad schema relevant fields (apps/strapi/.../ad/content-types/ad/schema.json):
//   condition: RELATION -> api::condition.condition  (populated as { id, name }; slug auto = slugify(name,{lower,strict}))
//   price:     biginteger (required)
//   year:      biginteger
//   category:  RELATION -> { slug }
//   commune:   RELATION -> { id }
// Catalog filter chain: useAsyncData -> adsStore.loadAds(filtersParams,...) -> client('ads/catalog', { params:{ filters,... } })
//   -> controller catalog() -> service activeAds() -> getAdvertisements(): merges options.filters into the db.query `where`.
//   => client-supplied condition/price/year filters DO flow through to Strapi.

// PaginationDefault.vue props/emits:
//   props: currentPage:number, totalPages:number, totalRecords?:number, pageSize?:number
//   emits: pageChange: [page:number]

// Current FilterResults SSR guard (KEEP THIS PATTERN for FilterSidebar):
//   const filterStore = import.meta.client ? useFilterStore() : ({} as ReturnType<typeof useFilterStore>);
//   + an isClient ref set true in onMounted, used to v-if the store-backed lists.

// Design tokens already defined in scss/abstracts/_variables.scss (DO NOT redefine):
//   $ink #26252b, $ink2 #56535f, $muted #8a8794, $amber #f7c97e, $amber_hover #efb85c,
//   $cream #f6f4f1, $line #ece9e4, $tag #a9772e, $white. Mixin: @include screen-medium.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create FilterSidebar.vue + filter--sidebar SCSS</name>
  <files>apps/website/app/components/FilterSidebar.vue, apps/website/app/scss/components/_filter.scss</files>
  <action>
Create `apps/website/app/components/FilterSidebar.vue`. Model its SSR pattern on FilterResults.vue:
`const filterStore = import.meta.client ? useFilterStore() : ({} as ReturnType<typeof useFilterStore>);`
plus an `isClient` ref set true in `onMounted`, used to v-if the categoría/ubicación lists (store is client-only). Import `useRoute`, `useRouter` from vue-router and `Filter as IconFilter` from lucide-vue-next.

Root element: `<aside class="filter filter--sidebar">`. BEM hierarchy (NO standalone hyphenated classes):
- `filter--sidebar__header` (flex, space-between): left = `filter--sidebar__header__title` (IconFilter 17px + "Filtros"); right = `filter--sidebar__header__clear` button "Limpiar".
- Repeat for each group: `filter--sidebar__section` with `filter--sidebar__section__label` (the uppercase section label) and rows `filter--sidebar__section__row` (label.row wrapping an input). Within a row: `filter--sidebar__section__row__check` (the checkbox/radio input), `filter--sidebar__section__row__name`, and for categoría `filter--sidebar__section__row__count`.
- Ubicación: `filter--sidebar__location` wrapper (position:relative) containing a native `<select>` + chevron.

Behavior (all via `router.push({ query: { ...route.query, X, page: 1 } })`, set param to `undefined` to remove):
- Categoría: SINGLE-select. A category is active when `route.query.category === cat.slug`. Click toggles: if active -> set `category: undefined`; else `category: cat.slug`. Show `cat.count` on the right. Render `filterStore.filterCategories` (v-if isClient).
- Condición: radios named "condition". Options Todos(value '')/Nuevo('nuevo')/Usado('usado'); checked when `(route.query.condition||'') === value`. On change push `condition: value || undefined`.
- Precio: radios named "price". Options '' / lt5 / 5to20 / 20to50 / gt50 with labels Cualquier precio / Menos de $5M / $5M - $20M / $20M - $50M / Más de $50M. Push `price: value || undefined`.
- Año: radios named "year". Options '' / lt2010 / 2010to2019 / 2020to2024 / gte2025 with labels Cualquier año / Antes de 2010 / 2010 - 2019 / 2020 - 2024 / 2025 en adelante. Push `year: value || undefined`.
- Ubicación: `<select>` bound to `route.query.commune`; option "Todas las ubicaciones" (value '') + `filterStore.filterCommunes` (value = commune.id). On change push `commune: value || undefined`.
- "Limpiar": `router.push({ path: '/anuncios', query: route.query.s ? { s: route.query.s } : {} })`.

No unused imports/vars (Codacy). Use `@/stores/filter.store` and the `FilterCategory`/`FilterCommune` types from `@/types/filter`.

Then APPEND to `apps/website/app/scss/components/_filter.scss` a `&--sidebar { ... }` block under the existing `.filter {` root (add it alongside `--announcement`). Use ONLY existing tokens. Spec:
- `&--sidebar`: position:sticky; top:96px; background:$white; border:1px solid $line; border-radius:4px; padding:22px 20px; display:flex; flex-direction:column. Wrap in `@include screen-medium { display:none; }` (mobile hides sidebar).
- `&__header`: flex; align-items:center; justify-content:space-between; margin-bottom:6px. `&__header__title`: flex; gap:8px; align-items:center; font-family:"Poppins"; font-weight:700; font-size:16px; color:$ink (icon color:$ink). `&__header__clear`: background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; color:$tag.
- `&__section`: border-top:1px solid $line; margin-top:16px; padding-top:16px. `&__section__label`: font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:$muted; margin-bottom:8px; display:block.
- `&__section__row`: display:flex; align-items:center; justify-content:space-between; gap:10px; cursor:pointer; padding:5px 0. A left inner wrapper holding check+name uses display:flex; align-items:center; gap:10px. `&__section__row__check`: width:16px; height:16px; flex:none; accent-color:$amber; cursor:pointer. `&__section__row__name`: font-size:14px; color:$ink2. `&__section__row__count`: font-size:12px; color:$muted.
- `&__location` (label margin-bottom:10px on its own label): position:relative; `select`: width:100%; appearance:none; border:1px solid $line; outline:none; font-size:14px; font-weight:500; color:$ink; background:$cream; padding:11px 34px 11px 13px; border-radius:4px. Chevron svg absolute right ~13px, $muted, pointer-events:none.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/website && node ../../node_modules/.bin/vue-tsc --noEmit 2>&1 | grep -i "FilterSidebar" || echo "no FilterSidebar type errors"</automated>
  </verify>
  <done>FilterSidebar.vue exists, compiles, uses filter--sidebar BEM hierarchy, pushes category/condition/price/year/commune query params and a Limpiar reset; _filter.scss has a .filter--sidebar block using only existing tokens.</done>
</task>

<task type="auto">
  <name>Task 2: Refactor anuncios/index.vue layout + condition/price/year filters; slim FilterResults to toolbar</name>
  <files>apps/website/app/pages/anuncios/index.vue, apps/website/app/components/FilterResults.vue, apps/website/app/scss/components/_filter.scss, apps/website/app/scss/components/_announcement.scss</files>
  <action>
**A. anuncios/index.vue — layout.** Import FilterSidebar from `@/components/FilterSidebar.vue`. Replace the current `<FilterResults v-if=...>` + `<AdArchive ...>` block with:
```html
<section class="listing listing--anuncios">
  <div class="listing--anuncios__container">
    <FilterSidebar />
    <div class="listing--anuncios__content">
      <FilterResults :total="adsData?.pagination?.total || 0" />
      <AdArchive
        v-if="adsData && adsData.ads && adsData.ads.length > 0"
        :ads="adsData.ads"
        :pagination="adsData.pagination"
      />
      <AdArchive
        v-else-if="adsData && adsData.ads && adsData.ads.length === 0"
        :ads="[]"
        :empty-state="true"
      />
    </div>
  </div>
</section>
```
IMPORTANT: FilterSidebar AND FilterResults must render UNCONDITIONALLY (no `v-if="ads.length>0"`) so a user who filters to zero results can still adjust/clear filters. Keep `<RelatedAds>` exactly as-is, placed after the `</section>`.

**B. anuncios/index.vue — filters.** Add condition/price/year:
- useAsyncData key: append `-${route.query.condition||''}-${route.query.price||''}-${route.query.year||''}` to the existing template-literal key.
- watch array: add `() => route.query.condition, () => route.query.price, () => route.query.year`.
- In the loader, read the three params and extend `filtersParams`:
```ts
const condition = route.query.condition?.toString() || null;
if (condition === "nuevo") filtersParams.condition = { slug: { $eq: "nuevo" } };
else if (condition === "usado") filtersParams.condition = { slug: { $eq: "usado" } };

const price = route.query.price?.toString() || null;
if (price === "lt5") filtersParams.price = { $lt: 5000000 };
else if (price === "5to20") filtersParams.price = { $gte: 5000000, $lte: 20000000 };
else if (price === "20to50") filtersParams.price = { $gte: 20000000, $lte: 50000000 };
else if (price === "gt50") filtersParams.price = { $gt: 50000000 };

const year = route.query.year?.toString() || null;
if (year === "lt2010") filtersParams.year = { $lt: 2010 };
else if (year === "2010to2019") filtersParams.year = { $gte: 2010, $lte: 2019 };
else if (year === "2020to2024") filtersParams.year = { $gte: 2020, $lte: 2024 };
else if (year === "gte2025") filtersParams.year = { $gte: 2025 };
```
Note: `filtersParams` is currently an object-literal with spreads; convert it to a mutable `const filtersParams: Record<string, unknown> = { ...(name && {...}), ...(category && {...}), ...(commune && {...}) };` then assign the conditional props onto it.

**C. FilterResults.vue — slim to toolbar.** Remove the commune `<select>` and ALL its logic: `selectedCommune` ref, its `watch`, the `IconFilter` import, and the `filter--announcement__selector` markup. Change root from `<section class="filter filter--announcement">` to `<div class="filter filter--toolbar">`. Final structure:
```html
<div class="filter filter--toolbar">
  <span class="filter--toolbar__count">
    <strong>{{ total }}</strong> {{ total === 1 ? "anuncio" : "anuncios" }}
  </span>
  <label class="filter--toolbar__order">
    <span class="filter--toolbar__order__label">Ordenar por</span>
    <span class="filter--toolbar__order__field">
      <select v-if="isClient" v-model="selectedOrder" class="filter--toolbar__select" aria-label="Ordenar anuncios">
        <option value="featured">Destacados</option>
        <option value="recent">Recientes</option>
      </select>
      <div v-else class="filter--toolbar__select filter--toolbar__select--loading">Cargando...</div>
      <IconChevron :size="15" class="filter--toolbar__order__chevron" />
    </span>
  </label>
</div>
```
Keep `selectedOrder`, its `onMounted` init, its `watch`, `isClient`, and `IconChevron` (ChevronDown) import. Drop the now-unused `useFilterStore` import/var and `route.query.commune` read if no longer referenced (Codacy: no unused vars). Keep the `total` prop.

**D. _filter.scss.** Remove the `&--announcement` block's selector-only sub-rules that are now dead: `&__selector`, `&__selector__icon`, `&__group`, `&__select--loading` usage, and the `&__selector &__select` override. Simplest correct move: rename the whole `&--announcement { ... }` block to `&--toolbar { ... }` and within it keep only `__container`(now the root flex — actually the root is the block itself now, so apply flex/align/justify/gap/flex-wrap/margin-bottom:24px directly to `&--toolbar`), `__count`, `__order` (+`__label`,`__field`,`__chevron`), and `__select` (+`--loading`). Drop `__group`, `__selector`, `__selector__icon`, and the `&__selector &__select` rule. `&--toolbar` itself: display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap (do NOT @extend .container — it lives inside listing__content now). Verify /articulos `.filter--articles` is untouched.

**E. _announcement.scss.** Add a top-level `.listing` block (sibling of `.announcement`, NOT nested):
```scss
.listing {
  &--anuncios {
    &__container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 32px 80px;
      display: grid;
      grid-template-columns: 266px 1fr;
      gap: 42px;
      align-items: start;

      @include screen-medium {
        grid-template-columns: 1fr;
        gap: 28px;
        padding-left: 18px;
        padding-right: 18px;
      }
    }
    &__content { min-width: 0; }
  }
}
```
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/website && node ../../node_modules/.bin/vue-tsc --noEmit 2>&1 | grep -iE "anuncios/index|FilterResults" || echo "no index/FilterResults type errors"</automated>
  </verify>
  <done>index.vue renders FilterSidebar + FilterResults unconditionally inside listing--anuncios; condition/price/year are in the useAsyncData key, watch, and filtersParams (condition as relation slug query); FilterResults is a filter--toolbar div with count+order only; _filter.scss has filter--toolbar and _announcement.scss has the listing grid; vue-tsc clean for these files.</done>
</task>

<task type="auto">
  <name>Task 3: Fix card grid track, swap paginator to PaginationDefault, hero search min-width</name>
  <files>apps/website/app/components/AdArchive.vue, apps/website/app/scss/components/_announcement.scss, apps/website/app/components/HeroResults.vue, apps/website/app/scss/components/_hero.scss</files>
  <action>
**A. _announcement.scss grid (line ~107).** In `.announcement--archive__list`, change `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));` to `repeat(auto-fill, minmax(224px, 1fr));`. (Inside listing__content's `1fr` column ~892px wide, 224px minmax yields ~4 columns desktop, 1 mobile.)

**B. AdArchive.vue paginator.** Replace the `<client-only><div class="paginate"><vue-awesome-paginate .../></div></client-only>` block inside `announcement--archive__paginate` with:
```html
<PaginationDefault
  :current-page="pagination.page"
  :total-pages="pagination.pageCount"
  :total-records="pagination.total"
  :page-size="pagination.pageSize"
  @page-change="onClickHandler"
/>
```
Add `import PaginationDefault from "@/components/PaginationDefault.vue";` to the script. Keep the existing `onClickHandler(page)` (it already pushes `?page` and scrolls to top) — PaginationDefault emits `pageChange` with a number, matching the handler signature. Leave the surrounding `v-if="pagination && pagination.pageCount > 1 && ..."` guard as-is.

**C. HeroResults.vue + _hero.scss.** In HeroResults.vue add the class to the search: `<SearchDefault :categories="categories" class="hero--results__search" />`. Then in `_hero.scss`, inside the existing `.hero { &--results { ... } }` block (add alongside `&__row` / `&__sub`), add:
```scss
&__search {
  min-width: min(540px, 100%);
  flex-shrink: 0;
}
```
NOTE: there is an unrelated `&__search { margin-top:32px }` under `hero--home` — do NOT touch it; add this NEW one under `hero--results`.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/website && node ../../node_modules/.bin/vue-tsc --noEmit 2>&1 | grep -iE "AdArchive|HeroResults" || echo "no AdArchive/HeroResults type errors"</automated>
  </verify>
  <done>Grid track is minmax(224px,1fr); AdArchive renders PaginationDefault wired to onClickHandler (no vue-awesome-paginate); HeroResults SearchDefault has hero--results__search with min-width:min(540px,100%); vue-tsc clean.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Full /anuncios redesign: new FilterSidebar (categoría/condición/precio/año/ubicación), 2-col grid layout (listing--anuncios), condition/price/year server-side filters, slim toolbar (count + Ordenar por), 224px card grid track, PaginationDefault paginator, hero search min-width.
  </what-built>
  <how-to-verify>
Run the website dev server, then verify in the browser AND with one API curl.

1) API filter sanity — the central correctness check. A dropped/ignored filter leaves total == full catalog, so a `<=` test proves nothing. Assert STRICT inequality.
   First confirm the real condition slugs (records are admin-created, not seeded — do NOT trust `nuevo`/`usado` blindly):
   `curl -s 'http://localhost:3000/api/conditions' | python3 -c 'import sys,json;print([c.get("slug") for c in json.load(sys.stdin)["data"]])'`
   If the slugs are NOT `nuevo`/`usado`, the hardcoded mapping in Task 1/2 must be updated to the real slugs before approving.
   Then capture totals (use `pageSize=1`, read `meta.pagination.total`):
   - `T`  = unfiltered: `.../ads/catalog?pagination[pageSize]=1`
   - `Pf` = price band: `.../ads/catalog?filters[price][$lt]=5000000&pagination[pageSize]=1`
   - `N`  = condition nuevo: `.../ads/catalog?filters[condition][slug][$eq]=nuevo&pagination[pageSize]=1`
   - `U`  = condition usado: `.../ads/catalog?filters[condition][slug][$eq]=usado&pagination[pageSize]=1`
   PASS requires STRICT: `Pf < T`, `N < T`, and `U < T` (and ideally `N + U ≈ T`). If any equals `T`, that filter is being silently ignored → FAIL (the bug the condition-relation fix exists to prevent).

2) Visit http://localhost:3000/anuncios :
   - Left sidebar visible (desktop) with Filtros header + Limpiar, the 5 sections, category counts on the right.
   - Click a category -> URL gains ?category=slug, list re-filters, that checkbox shows active; click again -> param clears.
   - Pick Condición=Usado, a Precio band, an Año band, an Ubicación -> URL gains the params, results change. Sidebar still renders if results hit zero.
   - Click Limpiar -> back to /anuncios (or ?s=... preserved if you came from a search).
   - Toolbar: "{N} anuncios" left, only "Ordenar por" select right (no ubicación select).
   - Card grid ~4 columns at desktop width; resize narrow -> 1 column, sidebar hidden.
   - Paginator is the PaginationDefault style (Anterior / pages / Siguiente), and clicking changes ?page.
   - Hero search box keeps a comfortable width (not collapsed).

Compare side-by-side against the mockup in apps/design.
  </how-to-verify>
  <resume-signal>Type "approved" or describe visual/functional issues to fix.</resume-signal>
</task>

</tasks>

<verification>
- `cd apps/website && node ../../node_modules/.bin/vue-tsc --noEmit` exits 0 (per STATE.md, nuxi typecheck is broken at root by estree-walker — use vue-tsc).
- `grep -rn "vue-awesome-paginate" apps/website/app/components/AdArchive.vue` returns nothing.
- `grep -rn "filter--announcement" apps/website/app` returns nothing (renamed to filter--toolbar).
- No standalone hyphenated classes introduced (all under filter--sidebar / listing--anuncios / filter--toolbar namespaces).
- No unused imports/vars (Codacy) in FilterResults.vue / FilterSidebar.vue / AdArchive.vue.
</verification>

<success_criteria>
- FilterSidebar renders the 5 filter sections and drives category/condition/price/year/commune URL params (sidebar + toolbar render even at zero results).
- condition/price/year reach ads/catalog: condition as a relation slug query (`condition.slug $eq`), price/year as numeric biginteger ranges; filtered totals change vs unfiltered (curl-verified).
- Toolbar shows "{N} anuncios" + Ordenar por only.
- Card grid uses minmax(224px,1fr); paginator is PaginationDefault.
- Hero search has min-width:min(540px,100%).
- vue-tsc clean; no vue-awesome-paginate / filter--announcement references remain.
</success_criteria>

<output>
After completion, create `.planning/quick/260619-dps-implementacion-completa-de-anuncios-segu/260619-dps-SUMMARY.md`
</output>

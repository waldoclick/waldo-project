---
phase: 260409-nhj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/MenuMaintenance.vue
  - apps/dashboard/app/components/MenuDefault.vue
  - apps/dashboard/app/components/MenuMain.vue
  - apps/dashboard/app/layouts/dashboard.vue
  - apps/dashboard/app/scss/components/_menu.scss
  - apps/dashboard/app/pages/articles/**
  - apps/dashboard/app/pages/categories/**
  - apps/dashboard/app/pages/communes/**
  - apps/dashboard/app/pages/conditions/**
  - apps/dashboard/app/pages/faqs/**
  - apps/dashboard/app/pages/packs/**
  - apps/dashboard/app/pages/policies/**
  - apps/dashboard/app/pages/regions/**
  - apps/dashboard/app/pages/terms/**
autonomous: true
requirements:
  - QUICK-260409-NHJ
must_haves:
  truths:
    - "Clicking the Mantenedores icon in MenuMain swaps the nav panel to MenuMaintenance"
    - "Clicking the Dashboard or Usuarios icon in MenuMain swaps the nav panel back to MenuDefault"
    - "MenuMaintenance shows a flat list of 9 links (Categorías, Condiciones, Packs, Regiones, Comunas, Artículos, Preguntas frecuentes, Políticas de privacidad, Condiciones de Uso) with no accordion"
    - "All 9 maintenance pages are served under /maintenance/* URLs and resolve correctly"
    - "Internal links inside moved pages (e.g. /articles/new → /maintenance/articles/new) point to the new /maintenance/* URLs"
    - "MenuDefault no longer contains the Mantenedores or Legales sections"
    - "The Mantenedores button in MenuMain shows an active visual state when the current route is under /maintenance"
  artifacts:
    - path: "apps/dashboard/app/components/MenuMaintenance.vue"
      provides: "Flat maintenance nav with 9 NuxtLinks under menu--maintenance block"
      contains: "menu--maintenance"
    - path: "apps/dashboard/app/components/MenuMain.vue"
      provides: "Rail with activeMenu prop + select emit and active modifier"
      contains: "menu--main__btn--active"
    - path: "apps/dashboard/app/layouts/dashboard.vue"
      provides: "activeMenu state switching between MenuDefault and MenuMaintenance"
      contains: "activeMenu"
    - path: "apps/dashboard/app/pages/maintenance/categories/index.vue"
      provides: "Relocated categories index"
    - path: "apps/dashboard/app/pages/maintenance/articles/index.vue"
      provides: "Relocated articles index"
  key_links:
    - from: "apps/dashboard/app/layouts/dashboard.vue"
      to: "MenuMain + MenuDefault/MenuMaintenance"
      via: "activeMenu ref passed as prop, updated via @select"
      pattern: "activeMenu"
    - from: "apps/dashboard/app/components/MenuMain.vue"
      to: "parent layout"
      via: "emit('select', 'maintenance'|'default')"
      pattern: "\\$emit\\('select'"
    - from: "apps/dashboard/app/components/MenuMaintenance.vue"
      to: "/maintenance/* routes"
      via: "NuxtLink to='/maintenance/...'"
      pattern: "/maintenance/"
---

<objective>
Split the dashboard nav into two panels: the existing MenuDefault (dashboard/orders/ads/reservations/featured/users/subscriptions) and a new flat MenuMaintenance that groups all Mantenedores + Legales links under /maintenance/*. Wire the MenuMain rail icons so the Mantenedores icon toggles to MenuMaintenance and the Dashboard/Usuarios icons toggle back to MenuDefault. Relocate all 9 maintenance page directories under /pages/maintenance/ using git mv and update internal route references.

Purpose: Reduce vertical menu clutter on MenuDefault and give maintenance tooling its own dedicated surface.
Output: MenuMaintenance.vue + updated layout + 9 moved page directories + updated route references.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@apps/dashboard/app/components/MenuDefault.vue
@apps/dashboard/app/components/MenuMain.vue
@apps/dashboard/app/layouts/dashboard.vue
@apps/dashboard/app/scss/components/_menu.scss

<interfaces>
<!-- Current MenuMain.vue has NO props/emits — fully static. Must add prop+emit. -->
<!-- MenuDefault emits 'close' only. MenuMaintenance must match that contract. -->
<!-- Active-route helper pattern from MenuDefault: -->

From MenuDefault.vue:
```ts
const emit = defineEmits<{ (e: "close"): void }>();
const route = useRoute();

const isRouteActive = (path: string): boolean => {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};

// Close-on-navigate pattern (immediate: true watcher):
watch(() => route.path, (path) => { /* ... */ emit("close"); }, { immediate: true });
```

Icons in lucide-vue-next reused: Tag, FileCheck, Box, MapPin, Building, Newspaper, HelpCircle, Shield, ScrollText.

From MenuMain.vue (current — must be extended):
```vue
<!-- Currently static. Adding: -->
<!-- props: { activeMenu: string } -->
<!-- emits: (e: 'select', panel: 'default' | 'maintenance') => void -->
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create MenuMaintenance.vue with flat link list</name>
  <files>apps/dashboard/app/components/MenuMaintenance.vue</files>
  <action>
Create a new SFC at `apps/dashboard/app/components/MenuMaintenance.vue` modeled EXACTLY on the structure of `MenuDefault.vue` (emits, script-setup style, composition API with `<script setup lang="ts">`, useRoute import, isRouteActive helper, immediate watcher that emits 'close').

BEM: root element is `<nav class="menu menu--maintenance">`. The block is `menu` and the modifier is `maintenance`. ALL child elements MUST be scoped under `menu--maintenance__*` (never `menu--default__*` and never standalone hyphenated names like `menu-maintenance-list`). Per CLAUDE.md BEM Modifier Encapsulation, child elements are `menu--maintenance__list`, `menu--maintenance__item`, `menu--maintenance__item--active`, `menu--maintenance__link`, `menu--maintenance__icon`.

Structure: a single `<ul class="menu--maintenance__list">` containing 9 `<li class="menu--maintenance__item">` entries (NO sublists, NO accordion, NO toggle buttons). Each `<li>` gets `:class="{ 'menu--maintenance__item--active': isRouteActive('/maintenance/xxx') }"` and contains a `<NuxtLink>` with class `menu--maintenance__link`, an icon with class `menu--maintenance__icon`, and a `<span>` label.

The 9 entries in order (label → path → icon from lucide-vue-next):
1. Categorías → /maintenance/categories → Tag
2. Condiciones → /maintenance/conditions → FileCheck
3. Packs → /maintenance/packs → Box
4. Regiones → /maintenance/regions → MapPin
5. Comunas → /maintenance/communes → Building
6. Artículos → /maintenance/articles → Newspaper
7. Preguntas frecuentes → /maintenance/faqs → HelpCircle
8. Políticas de privacidad → /maintenance/policies → Shield
9. Condiciones de Uso → /maintenance/terms → ScrollText

Script: `defineEmits<{ (e: 'close'): void }>()`, import only the 9 icons above (NO unused imports — Codacy will flag any extras), `useRoute()`, `isRouteActive(path)` helper copied verbatim from MenuDefault, and a `watch(() => route.path, () => { emit('close'); }, { immediate: true })`.

NO styling in this file — styles will be added to `_menu.scss` in Task 4. No `<style>` block needed.
  </action>
  <verify>
    <automated>cd apps/dashboard && yarn nuxt typecheck 2>&1 | grep -E "MenuMaintenance|error" | head -20</automated>
  </verify>
  <done>File exists at apps/dashboard/app/components/MenuMaintenance.vue; renders a flat &lt;ul&gt; with 9 NuxtLinks under `menu--maintenance` namespace; no TypeScript errors; no unused imports.</done>
</task>

<task type="auto">
  <name>Task 2: git mv 9 page directories into pages/maintenance/ and update internal route refs</name>
  <files>apps/dashboard/app/pages/maintenance/{articles,categories,communes,conditions,faqs,packs,policies,regions,terms}/**</files>
  <action>
First, create the parent directory: `mkdir -p apps/dashboard/app/pages/maintenance`

Then run `git mv` for each of the 9 directories (CLAUDE.md requires git mv for all Nuxt page renames to preserve rename history):

```
git mv apps/dashboard/app/pages/articles apps/dashboard/app/pages/maintenance/articles
git mv apps/dashboard/app/pages/categories apps/dashboard/app/pages/maintenance/categories
git mv apps/dashboard/app/pages/communes apps/dashboard/app/pages/maintenance/communes
git mv apps/dashboard/app/pages/conditions apps/dashboard/app/pages/maintenance/conditions
git mv apps/dashboard/app/pages/faqs apps/dashboard/app/pages/maintenance/faqs
git mv apps/dashboard/app/pages/packs apps/dashboard/app/pages/maintenance/packs
git mv apps/dashboard/app/pages/policies apps/dashboard/app/pages/maintenance/policies
git mv apps/dashboard/app/pages/regions apps/dashboard/app/pages/maintenance/regions
git mv apps/dashboard/app/pages/terms apps/dashboard/app/pages/maintenance/terms
```

After moving, search for ALL stale `/articles`, `/categories`, `/communes`, `/conditions`, `/faqs`, `/packs`, `/policies`, `/regions`, `/terms` route references inside the moved files and rewrite them to the `/maintenance/*` prefix. Use Grep (not bash grep) to find them:

```
Grep pattern: "(to=['\"`]|/)(articles|categories|communes|conditions|faqs|packs|policies|regions|terms)(/|['\"`])"
path: apps/dashboard/app/pages/maintenance
```

Known references that MUST be updated (but find all others with grep):
- `pages/maintenance/articles/index.vue`: `to="/articles/new"` → `to="/maintenance/articles/new"`
- `pages/maintenance/articles/[id]/index.vue`: `` `/articles/${route.params.id}/edit` `` → `` `/maintenance/articles/${route.params.id}/edit` ``
- `pages/maintenance/categories/index.vue`: `to="/categories/new"` → `to="/maintenance/categories/new"`
- `pages/maintenance/categories/[id]/index.vue`: `` `/categories/${route.params.id}/edit` `` → `` `/maintenance/categories/${route.params.id}/edit` ``, and breadcrumb `{ label: "Categorías", to: "/categories" }` → `{ label: "Categorías", to: "/maintenance/categories" }`
- Same patterns for communes, conditions, faqs, packs, policies, regions, terms — including any `to: "/<section>"` in breadcrumbs, any `navigateTo('/<section>...')` calls, and any hardcoded strings in composables/stores that are imported by the moved pages.

CRITICAL: Do NOT touch Spanish UI labels (breadcrumb labels like "Categorías", "Artículos", page titles) — CLAUDE.md: "Never change Spanish UI labels in a URL/route migration". Only the `to:` / `to=""` / template-literal URL paths change.

Also check: the moved pages likely import from `@/composables/useApiClient` and call `apiClient("categories", ...)` — the Strapi endpoint name ("categories", "articles", etc.) is NOT a URL route, it's a Strapi content-type identifier and MUST NOT be changed. Only change things that are router paths (start with `/`).
  </action>
  <verify>
    <automated>cd apps/dashboard && git status --porcelain | grep -E "^R.*pages/(articles|categories|communes|conditions|faqs|packs|policies|regions|terms)" | wc -l</automated>
  </verify>
  <done>All 9 directories moved under pages/maintenance/ via git mv (git status shows R renames); no stale `/articles`, `/categories`, etc. router references remain inside the moved files (Spanish labels untouched); `yarn nuxt typecheck` in apps/dashboard has no new errors caused by broken imports.</done>
</task>

<task type="auto">
  <name>Task 3: Strip Mantenedores and Legales sections from MenuDefault.vue</name>
  <files>apps/dashboard/app/components/MenuDefault.vue</files>
  <action>
Edit `apps/dashboard/app/components/MenuDefault.vue` to remove:

1. The entire `<!-- Mantenedores -->` `<li>` block (template lines ~270-358 — the whole li with its button, sublist, and all 6 subitems).
2. The entire `<!-- Legales -->` `<li>` block (template lines ~360-415 — li with button and 3 subitems).
3. The `isMantenedoresActive` computed (script lines ~469-478).
4. The `isLegalesActive` computed (script lines ~489-495).
5. In the `watch(() => route.path, ...)` callback, remove the `else if (path.startsWith("/categories") || ...)` branch that sets `openMenu.value = "mantenedores"` AND the `else if (path.startsWith("/faqs") || ...)` branch that sets `openMenu.value = "legales"`. Keep the other branches (ads, reservations, featured, subscriptions) and the final `else { openMenu.value = null; }`.
6. Remove icons from the lucide-vue-next import that are ONLY used in the removed sections. After removal, these icons are no longer referenced anywhere in the file: `Settings`, `Tag`, `FileCheck`, `Box`, `MapPin`, `Building`, `Newspaper`, `Scale`, `HelpCircle`, `Shield`, `ScrollText`. VERIFY each one by searching the remaining template — if an icon still appears in the (dashboard/orders/ads/reservations/featured/users/subscriptions) sections, keep it. Per CLAUDE.md: "Never leave unused variables or imports — delete them, do not rename with `_` prefix".

Do NOT touch the `isSubscripcionesActive` computed or the subscriptions branch of the watch — those stay.
  </action>
  <verify>
    <automated>cd apps/dashboard && yarn nuxt typecheck 2>&1 | grep -iE "menudefault|unused|error" | head -20</automated>
  </verify>
  <done>MenuDefault.vue no longer contains "Mantenedores", "Legales", `isMantenedoresActive`, `isLegalesActive`, or any unused icon imports; typecheck passes; dashboard/orders/ads/reservations/featured/users/subscriptions sections remain intact.</done>
</task>

<task type="auto">
  <name>Task 4: Wire MenuMain active state + dashboard.vue panel switching + _menu.scss styles</name>
  <files>apps/dashboard/app/components/MenuMain.vue, apps/dashboard/app/layouts/dashboard.vue, apps/dashboard/app/scss/components/_menu.scss</files>
  <action>
**A) Update `MenuMain.vue`:**

Add `<script setup lang="ts">`:
```ts
defineProps<{ activeMenu: 'default' | 'maintenance' }>();
const emit = defineEmits<{ (e: 'select', panel: 'default' | 'maintenance'): void }>();
// Keep existing import: LayoutDashboard, Users, Settings
```

Template updates:
- Dashboard button: `@click="emit('select', 'default')"`
- Usuarios button: `@click="emit('select', 'default')"`
- Mantenedores button: `@click="emit('select', 'maintenance')"` and add `:class="{ 'menu--main__btn--active': activeMenu === 'maintenance' }"`

Also add an active state to Dashboard/Usuarios when `activeMenu === 'default'`? NO — keep it scoped only to the Mantenedores button per the task spec. Only Mantenedores receives `menu--main__btn--active`.

**B) Update `apps/dashboard/app/layouts/dashboard.vue`:**

Add import: `import MenuMaintenance from "@/components/MenuMaintenance.vue";`

Add state: `const activeMenu = ref<'default' | 'maintenance'>('default');`

Update `<MenuMain />` usage to:
```vue
<MenuMain :active-menu="activeMenu" @select="activeMenu = $event" />
```

Replace the single `<MenuDefault @close="isSidebarOpen = false" />` inside `layout--dashboard__menu__nav` with conditional rendering:
```vue
<MenuDefault v-if="activeMenu === 'default'" @close="isSidebarOpen = false" />
<MenuMaintenance v-else-if="activeMenu === 'maintenance'" @close="isSidebarOpen = false" />
```

Optional polish (do NOT implement unless trivial): auto-switch `activeMenu` based on route — SKIP, not in spec.

**C) Update `apps/dashboard/app/scss/components/_menu.scss`:**

Inside the existing `&--main { ... }` block, next to the existing `&__btn { ... }` rule, add a sibling rule for the active modifier. Per CLAUDE.md BEM, the modifier goes directly under `&--main` as `&__btn--active`:

```scss
&__btn--active {
  background-color: #f5f5f5;
  color: #1a1a1a;
}
```

Place it immediately after the `&__btn { ... }` closing brace inside `&--main`.

Also add a complete new `&--maintenance { ... }` block inside the `.menu { ... }` root, mirroring the structure of `&--default` but simplified (no sublist — flat only). Include:
- `&--maintenance { display: flex; flex-direction: column; }`
- `&__list { list-style: none; margin: 0; padding: 16px 0; flex: 1; overflow-y: auto; }`
- `&__item { margin: 0; &--active { .menu--maintenance__link { font-weight: 600; color: #1a1a1a; text-decoration: underline; text-underline-offset: 3px; .menu--maintenance__icon { color: #1a1a1a; } } } }`
- `&__link { display: flex; align-items: center; gap: 12px; padding: 11px 24px; color: #1a1a1a; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.25px; transition: text-decoration 0.2s; &:hover, &.router-link-active, &.router-link-exact-active { color: #1a1a1a; text-decoration: underline; text-underline-offset: 3px; .menu--maintenance__icon { color: #1a1a1a; } } span { flex: 1; } }`
- `&__icon { width: 20px; height: 20px; color: #1a1a1a; flex-shrink: 0; transition: color 0.2s ease; }`

SCSS nesting must mirror HTML hierarchy (CLAUDE.md rule). All selectors scoped under `menu--maintenance` — no standalone hyphenated class names.
  </action>
  <verify>
    <automated>cd apps/dashboard && yarn nuxt typecheck 2>&1 | tail -20 && yarn lint 2>&1 | tail -20</automated>
  </verify>
  <done>Clicking Mantenedores icon swaps nav to MenuMaintenance; clicking Dashboard/Usuarios swaps back to MenuDefault; Mantenedores btn gets `menu--main__btn--active` class when active; MenuMaintenance links render with proper hover/active styling; typecheck + lint pass; from root `yarn codacy` has no new violations on touched files.</done>
</task>

</tasks>

<verification>
Run from `apps/dashboard`:
1. `yarn nuxt typecheck` — zero new errors.
2. `yarn lint` — zero new warnings on touched files.
3. `yarn dev` — manually visit /maintenance/categories, /maintenance/articles, /maintenance/faqs and confirm they render; confirm /categories, /articles, /faqs 404 (pages moved).
4. Click the Mantenedores icon in the rail → MenuMaintenance panel appears with 9 flat links → click Categorías → lands on /maintenance/categories → Mantenedores icon has active background.
5. Click Dashboard icon in the rail → MenuDefault reappears.
6. `git status` shows 9 `R` (rename) entries for the moved directories — rename history preserved.
7. From repo root: `yarn codacy` — no new violations on the touched files.
</verification>

<success_criteria>
- MenuMaintenance.vue exists with flat 9-link list under `menu--maintenance` BEM namespace, no accordion.
- 9 page directories live under `apps/dashboard/app/pages/maintenance/` and were moved via `git mv` (visible as `R` in git status).
- All internal route references inside moved pages updated to `/maintenance/*`; Strapi content-type identifiers in `apiClient(...)` calls unchanged; Spanish UI labels unchanged.
- MenuDefault.vue no longer contains Mantenedores/Legales sections, computeds, watch branches, or unused icon imports.
- MenuMain.vue has `activeMenu` prop, `select` emit, active modifier on Mantenedores button.
- dashboard.vue conditionally renders MenuDefault or MenuMaintenance based on `activeMenu` state, wired through MenuMain @select.
- `_menu.scss` has new `&--maintenance { ... }` block and `&__btn--active` modifier inside `&--main`.
- `yarn nuxt typecheck`, `yarn lint`, and `yarn codacy` all pass.
</success_criteria>

<output>
After completion, create `.planning/quick/260409-nhj-create-menumaintenance-with-flat-links-m/260409-nhj-01-SUMMARY.md`
</output>

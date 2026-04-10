---
phase: quick
plan: 260409-ujs
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/MenuMain.vue
  - apps/dashboard/app/components/MenuIntegrations.vue
  - apps/dashboard/app/pages/integrations/index.vue
  - apps/dashboard/app/layouts/dashboard.vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "A Plug icon button appears in the MenuMain rail alongside existing icons"
    - "Clicking the Plug button opens a MenuIntegrations side panel with a single /integrations link"
    - "Navigating to /integrations renders a page titled Integraciones"
    - "The Plug button is highlighted (menu--main__btn--active) when activeMenu === 'integrations'"
    - "The integrations panel auto-activates when the route starts with /integrations"
  artifacts:
    - path: "apps/dashboard/app/components/MenuMain.vue"
      provides: "Plug button emitting select('integrations'), activeMenu prop updated to include 'integrations'"
    - path: "apps/dashboard/app/components/MenuIntegrations.vue"
      provides: "Side nav panel with single /integrations NuxtLink, following MenuUsers pattern"
    - path: "apps/dashboard/app/pages/integrations/index.vue"
      provides: "Blank page with HeroDefault title=Integraciones, layout=dashboard"
    - path: "apps/dashboard/app/layouts/dashboard.vue"
      provides: "MenuIntegrations wired in nav panel, resolveActiveMenu handles /integrations, activeMenu type includes 'integrations'"
  key_links:
    - from: "MenuMain.vue"
      to: "dashboard.vue"
      via: "emit('select', 'integrations') → activeMenu = 'integrations'"
    - from: "dashboard.vue"
      to: "MenuIntegrations.vue"
      via: "v-else-if=\"activeMenu === 'integrations'\""
    - from: "MenuIntegrations.vue"
      to: "/integrations"
      via: "NuxtLink to='/integrations'"
---

<objective>
Add an Integrations section to the dashboard: a Plug icon rail button in MenuMain, a MenuIntegrations side panel component, a blank /integrations index page, and layout wiring to switch panels and resolve active route.

Purpose: Gives the dashboard a dedicated Integrations section following the established rail + panel pattern (same as Users and Maintenance).
Output: 4 modified/created files; /integrations route is navigable from the menu.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<interfaces>
<!-- MenuMain.vue current props/emits — MUST extend, not replace -->
defineProps<{ activeMenu: "default" | "users" | "maintenance" }>();
const emit = defineEmits<{
  (e: "select", panel: "default" | "users" | "maintenance"): void;
}>();
import { LayoutDashboard, Users, Settings } from "lucide-vue-next";

<!-- dashboard.vue current activeMenu type and resolver -->
const resolveActiveMenu = (path: string): "default" | "users" | "maintenance" => {
  if (path.startsWith("/users")) return "users";
  if (path.startsWith("/maintenance")) return "maintenance";
  return "default";
};
const activeMenu = ref<"default" | "users" | "maintenance">(resolveActiveMenu(route.path));

<!-- MenuUsers.vue pattern (replicate for MenuIntegrations) -->
// Single-level list, emits "close" on route change via watch({ immediate: true })
// BEM: menu menu--users / menu--users__list / menu--users__item / menu--users__link / menu--users__icon
// isRouteActive(path): path === "/" ? route.path === "/" : route.path.startsWith(path)

<!-- _menu.scss — &--users block is the canonical pattern to replicate for &--integrations -->
// No new CSS file needed; add &--integrations block inside existing _menu.scss &--users pattern
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update MenuMain and create MenuIntegrations</name>
  <files>
    apps/dashboard/app/components/MenuMain.vue
    apps/dashboard/app/components/MenuIntegrations.vue
    apps/dashboard/app/scss/components/_menu.scss
  </files>
  <action>
**MenuMain.vue** — add `Plug` to the lucide import alongside existing icons. Extend the `activeMenu` prop type and the emit panel union to include `"integrations"`. Add a new `<button>` after the Settings button, following the exact same structure as the existing buttons:

```html
<button
  type="button"
  class="menu--main__btn"
  :class="{ 'menu--main__btn--active': activeMenu === 'integrations' }"
  aria-label="Integraciones"
  @click="emit('select', 'integrations')"
>
  <Plug class="menu--main__icon" />
</button>
```

**MenuIntegrations.vue** — create as a new file, replicating MenuUsers.vue exactly. Differences:
- BEM class: `menu menu--integrations` (and all child BEM names use `--integrations`)
- Single `<li>` linking to `/integrations` with label "Integraciones" and the `Plug` icon from lucide-vue-next
- `isRouteActive` helper identical to MenuUsers.vue
- `watch(() => route.path, () => emit('close'), { immediate: true })` — same close-on-navigate behaviour
- No computed for special root exclusions needed (only one link)

**_menu.scss** — append a `&--integrations` block at the end of the `.menu` block, duplicating the `&--users` block verbatim and replacing every `users` token with `integrations`. No visual changes, just the namespace.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/dashboard && yarn nuxi typecheck 2>&1 | grep -E "ERROR|error TS" | head -20</automated>
  </verify>
  <done>MenuMain has Plug button with correct active class and emit; MenuIntegrations.vue exists with single /integrations link; _menu.scss has &--integrations block; typecheck passes.</done>
</task>

<task type="auto">
  <name>Task 2: Wire layout and create integrations page</name>
  <files>
    apps/dashboard/app/layouts/dashboard.vue
    apps/dashboard/app/pages/integrations/index.vue
  </files>
  <action>
**dashboard.vue** — four changes, all additive:

1. Import `MenuIntegrations` alongside the other menu imports.
2. Extend `resolveActiveMenu` return type and body:
   ```ts
   const resolveActiveMenu = (path: string): "default" | "users" | "maintenance" | "integrations" => {
     if (path.startsWith("/users")) return "users";
     if (path.startsWith("/maintenance")) return "maintenance";
     if (path.startsWith("/integrations")) return "integrations";
     return "default";
   };
   ```
3. Update `activeMenu` ref type to `"default" | "users" | "maintenance" | "integrations"`.
4. Add `<MenuIntegrations v-else-if="activeMenu === 'integrations'" @close="isSidebarOpen = false" />` in the nav panel, after the `MenuMaintenance` block.

**apps/dashboard/app/pages/integrations/index.vue** — create following the same template as `apps/dashboard/app/pages/users/index.vue`:

```vue
<template>
  <div>
    <HeroDefault title="Integraciones" :breadcrumbs="breadcrumbs" />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Integraciones" }];
</script>
```

No additional content component needed — the task spec says blank page with title.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/dashboard && yarn nuxi typecheck 2>&1 | grep -E "ERROR|error TS" | head -20</automated>
  </verify>
  <done>Navigating to /integrations shows HeroDefault with title "Integraciones"; clicking Plug icon in rail opens integrations panel; breadcrumb shows Integraciones; no TypeScript errors.</done>
</task>

</tasks>

<verification>
After both tasks:
- `yarn nuxi typecheck` in apps/dashboard exits with 0 errors
- MenuMain renders 4 rail buttons (Dashboard / Usuarios / Mantenedores / Integraciones)
- Clicking Plug opens side panel with single "Integraciones" link
- Navigating to /integrations auto-activates the Plug button (menu--main__btn--active)
- Page at /integrations shows HeroDefault with title "Integraciones"
</verification>

<success_criteria>
- Plug button in rail, active-highlighted when on /integrations routes
- MenuIntegrations panel renders with /integrations link
- /integrations page renders with title "Integraciones"
- TypeScript compiles clean
- No new standalone compound CSS class names (BEM compliant)
</success_criteria>

<output>
After completion, create `.planning/quick/260409-ujs-add-integrations-section-to-dashboard-me/260409-ujs-SUMMARY.md`
</output>

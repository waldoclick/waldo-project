---
phase: quick-42
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/layouts/dashboard.vue
  - apps/dashboard/app/components/HeaderDefault.vue
  - apps/dashboard/app/components/MenuDefault.vue
  - apps/dashboard/app/scss/components/_layout.scss
  - apps/dashboard/app/scss/components/_header.scss
  - apps/dashboard/app/scss/components/_menu.scss
autonomous: true
requirements: [QUICK-42]

must_haves:
  truths:
    - "On mobile (≤1024px) the sidebar is hidden by default"
    - "A hamburger button in the header toggles the sidebar open/closed on mobile"
    - "When the sidebar is open on mobile, clicking the overlay closes it"
    - "On desktop (>1024px) the sidebar is always visible and the hamburger is hidden"
    - "The header spans full width on mobile (no left offset)"
    - "Navigating to a new page auto-closes the mobile sidebar"
  artifacts:
    - path: "apps/dashboard/app/layouts/dashboard.vue"
      provides: "isSidebarOpen state + overlay element + CSS class bindings"
    - path: "apps/dashboard/app/components/HeaderDefault.vue"
      provides: "Hamburger button that emits toggle-sidebar event"
    - path: "apps/dashboard/app/components/MenuDefault.vue"
      provides: "Accepts isSidebarOpen prop, emits close event on route change"
    - path: "apps/dashboard/app/scss/components/_layout.scss"
      provides: "Mobile breakpoint: sidebar hidden/visible, overlay, full-width content"
    - path: "apps/dashboard/app/scss/components/_header.scss"
      provides: "Mobile breakpoint: full-width header, hamburger visible"
    - path: "apps/dashboard/app/scss/components/_menu.scss"
      provides: "Mobile breakpoint: sidebar off-canvas translation"
  key_links:
    - from: "HeaderDefault.vue"
      to: "dashboard.vue"
      via: "emit('toggle-sidebar') → isSidebarOpen.value = !isSidebarOpen.value"
    - from: "dashboard.vue overlay"
      to: "isSidebarOpen"
      via: "@click closes sidebar"
    - from: "MenuDefault.vue route watch"
      to: "emit('close')"
      via: "watch(route.path) → emit on mobile"
---

<objective>
Make the dashboard admin layout responsive: sidebar collapses off-canvas on mobile (≤1024px), header shows a hamburger toggle, overlay closes the sidebar on tap.

Purpose: Admin dashboard is currently unusable on tablets and phones — fixed 350px sidebar covers all content.
Output: Fully responsive layout with hamburger-controlled sidebar on mobile, no changes to page content.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Key constraints from AGENTS.md:
  - BEM naming convention (block--modifier__element)
  - No box-shadow, no transform: scale
  - Brand colors from palette only ($charcoal, $gainsboro, $platinum, etc.)
  - SCSS: @use "../abstracts/mixins" as * and @use "../abstracts/variables" as *
  - Breakpoints: screen-medium (768px), screen-large (1024px)
  - Sidebar breakpoint: screen-large (1024px)
-->

<interfaces>
<!-- Existing layout structure (dashboard.vue) -->
<!-- layout--dashboard wraps: __menu (fixed 350px) + __content (margin-left 350px) -->

<!-- Available SCSS mixins -->
@mixin screen-large { @media (max-width: 1024px) { @content; } }
@mixin screen-medium { @media (max-width: 768px) { @content; } }

<!-- Available SCSS variables -->
$charcoal: #313338;
$gainsboro: #eaebeb;
$platinum: #ededed;
$jet: #2d2d2e;

<!-- Current header structure: -->
<!-- .header--default { position: fixed; top: 0; left: 350px; width: calc(100% - 350px); height: 64px } -->
<!-- .header--default__right { display: flex; align-items: center; gap: 16px } -->

<!-- MenuDefault.vue auto-closes submenus on route.path watch — reuse this watch to also emit close -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wire sidebar toggle state in layout and header</name>
  <files>
    apps/dashboard/app/layouts/dashboard.vue,
    apps/dashboard/app/components/HeaderDefault.vue
  </files>
  <action>
**dashboard.vue** — Rewrite to manage `isSidebarOpen` ref and expose it to children:

```vue
<template>
  <div
    class="layout layout--dashboard"
    :class="{ 'layout--dashboard--open': isSidebarOpen }"
  >
    <!-- Overlay: visible on mobile when sidebar is open -->
    <div
      class="layout--dashboard__overlay"
      @click="isSidebarOpen = false"
    />
    <div class="layout--dashboard__menu">
      <MenuDefault @close="isSidebarOpen = false" />
    </div>
    <div class="layout--dashboard__content">
      <HeaderDefault @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      <main class="layout--dashboard__main">
        <slot />
      </main>
      <FooterDefault />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MenuDefault from "@/components/MenuDefault.vue";
import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

const isSidebarOpen = ref(false);
</script>
```

**HeaderDefault.vue** — Add hamburger button that emits `toggle-sidebar`. Place it in `__right` at the far left (use `__left` side). Restructure header to have `__left` + `__right`:

```vue
<template>
  <header
    ref="header"
    class="header header--default"
    :class="{ 'header--default--hidden': isHeaderHidden }"
  >
    <div class="header--default__left">
      <button
        class="header--default__hamburger"
        aria-label="Abrir menú"
        @click="emit('toggle-sidebar')"
      >
        <Menu :size="24" />
      </button>
    </div>
    <div class="header--default__right">
      <ToolbarDefault v-if="user" />
      <DropdownUser v-if="user" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useScroll } from "@vueuse/core";
import { Menu } from "lucide-vue-next";
import ToolbarDefault from "@/components/ToolbarDefault.vue";
import DropdownUser from "@/components/DropdownUser.vue";

const emit = defineEmits<{ (e: "toggle-sidebar"): void }>();

const header = ref<HTMLElement | null>(null);
const user = useStrapiUser();
const lastScrollPosition = ref(0);
const isHeaderHidden = ref(false);
const { y: scrollY } = useScroll(window);

watch(scrollY, (newY) => {
  const scrollingDown = newY > lastScrollPosition.value;
  isHeaderHidden.value = scrollingDown && newY > 80 ? true : false;
  lastScrollPosition.value = newY;
});
</script>
```
  </action>
  <verify>
    `yarn --cwd apps/dashboard nuxt typecheck` passes (no new TS errors in these files).
  </verify>
  <done>
    dashboard.vue has isSidebarOpen ref + overlay div + layout--dashboard--open class binding. HeaderDefault.vue has hamburger button emitting toggle-sidebar. No TypeScript errors.
  </done>
</task>

<task type="auto">
  <name>Task 2: Auto-close sidebar on navigation (MenuDefault)</name>
  <files>apps/dashboard/app/components/MenuDefault.vue</files>
  <action>
Add `emit('close')` to the existing `route.path` watcher so navigating on mobile auto-closes the sidebar. Also define the `close` emit.

In the `<script setup>` section, add after the existing imports:

```ts
const emit = defineEmits<{ (e: "close"): void }>();
```

Then update the existing `watch(() => route.path, ...)` to also emit close:

```ts
watch(
  () => route.path,
  (path) => {
    // Auto-expand active submenu
    if (path.startsWith("/ads")) {
      openMenu.value = "ads";
    } else if (path.startsWith("/reservations")) {
      openMenu.value = "reservations";
    } else if (path.startsWith("/featured")) {
      openMenu.value = "featured";
    } else if (
      path.startsWith("/categories") ||
      path.startsWith("/conditions") ||
      path.startsWith("/faqs") ||
      path.startsWith("/packs") ||
      path.startsWith("/regions") ||
      path.startsWith("/communes") ||
      path.startsWith("/articles")
    ) {
      openMenu.value = "mantenedores";
    } else {
      openMenu.value = null;
    }
    // Close sidebar on navigation (no-op on desktop — CSS hides the toggle)
    emit("close");
  },
  { immediate: true },
);
```

Do NOT change the template, existing logic, or icon imports.
  </action>
  <verify>
    `yarn --cwd apps/dashboard nuxt typecheck` passes. Component emits `close` type is declared.
  </verify>
  <done>
    MenuDefault.vue emits 'close' on every route.path change. Existing menu logic unchanged.
  </done>
</task>

<task type="auto">
  <name>Task 3: Responsive SCSS for layout, header, and menu</name>
  <files>
    apps/dashboard/app/scss/components/_layout.scss,
    apps/dashboard/app/scss/components/_header.scss,
    apps/dashboard/app/scss/components/_menu.scss
  </files>
  <action>
**_layout.scss** — Add mobile rules inside the existing `&--dashboard` block. The sidebar slides in from the left via `translateX` (NOT scale). The overlay uses `opacity` transition. Add after the existing `&__main` rule:

```scss
// Inside .layout { &--dashboard { ... } }
// Add at the end of the &--dashboard block:

@include screen-large {
  &__menu {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    z-index: 30;
  }

  &__content {
    margin-left: 0;
  }

  &__main {
    padding-top: 64px;
  }

  &__overlay {
    display: none;
    position: fixed;
    inset: 0;
    background-color: rgba($jet, 0.4);
    z-index: 25;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &--open {
    .layout--dashboard__menu {
      transform: translateX(0);
    }

    .layout--dashboard__overlay {
      display: block;
      opacity: 1;
    }
  }
}
```

On desktop (>1024px), `__overlay` must not display. Add this rule at the root of `&--dashboard` (outside any mixin), after `&__main`:

```scss
&__overlay {
  display: none; // Hidden on desktop always
}
```

**_header.scss** — Add mobile rules inside `&--default`. Hamburger hidden on desktop, visible on mobile. Full-width header on mobile:

```scss
// Inside .header { &--default { ... } }
// Add at the end of the &--default block:

&__left {
  display: none; // Hidden on desktop
}

&__right {
  display: flex;
  align-items: center;
  gap: 16px;
}

&__hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: $charcoal;
  border-radius: 4px;

  &:hover {
    background-color: $platinum;
  }
}

@include screen-large {
  left: 0;
  width: 100%;

  &__left {
    display: flex;
    align-items: center;
  }
}
```

Also update the existing `left: 350px` and `width: calc(100% - 350px)` to remain desktop-only — they are already outside a mixin so they apply desktop-first and the `@include screen-large` override above takes effect on mobile. No change needed to existing desktop rules.

**_menu.scss** — No structural changes needed. The sidebar width (350px) is set in `_layout.scss` via `__menu { width: 350px }`. The `translateX` slide is handled in `_layout.scss`. `_menu.scss` just needs to ensure `height: 100vh` and `overflow-y: auto` work correctly on mobile — they already do. No changes required to `_menu.scss`.

**Summary of changes per file:**
- `_layout.scss`: add `&__overlay { display: none }` in desktop block + `@include screen-large` block with slide + overlay behavior
- `_header.scss`: add `&__left`, `&__right`, `&__hamburger` rules + `@include screen-large` for full-width + show hamburger
- `_menu.scss`: no changes needed (existing styles already work)
  </action>
  <verify>
    1. `yarn --cwd apps/dashboard build` completes without SCSS errors.
    2. On mobile viewport (DevTools, ≤1024px): sidebar hidden by default, hamburger visible in header.
    3. Clicking hamburger slides sidebar in from left; overlay appears.
    4. Clicking overlay closes sidebar.
    5. On desktop (>1024px): sidebar always visible, hamburger hidden.
  </verify>
  <done>
    Layout is fully responsive. Sidebar slides off-canvas on mobile behind a tap-to-close overlay. Header spans full width on mobile with hamburger visible. Desktop behavior unchanged.
  </done>
</task>

</tasks>

<verification>
After all tasks:
- `yarn --cwd apps/dashboard nuxt typecheck` — no new TypeScript errors
- `yarn --cwd apps/dashboard build` — no SCSS compilation errors
- Manual browser check at ≤1024px: sidebar hidden → hamburger tap → sidebar slides in → overlay tap → sidebar closes
- Manual browser check at >1024px: sidebar always visible, hamburger hidden, layout unchanged
</verification>

<success_criteria>
- Mobile (≤1024px): sidebar off-canvas by default, hamburger in header, overlay closes sidebar, navigation auto-closes sidebar
- Desktop (>1024px): behavior identical to before — sidebar always visible, no hamburger
- No TypeScript errors, no SCSS errors, no box-shadow or transform: scale added
- All new CSS classes follow BEM convention under existing `layout--dashboard`, `header--default` namespaces
- Only brand colors used ($charcoal, $platinum, $jet via rgba)
</success_criteria>

<output>
After completion, create `.planning/quick/42-make-dashboard-admin-layout-responsive-s/42-SUMMARY.md` with what was implemented.
</output>

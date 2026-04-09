---
phase: quick-260409-kru
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/MenuMain.vue
  - apps/dashboard/app/components/MenuDefault.vue
  - apps/dashboard/app/layouts/dashboard.vue
  - apps/dashboard/app/scss/components/_menu.scss
  - apps/dashboard/app/scss/components/_layout.scss
autonomous: true
---

<objective>
Split layout--dashboard__menu into 3 parts:
1. Logo at top (full width, extracted from MenuDefault into dashboard.vue)
2. Left rail below logo: new MenuMain component with 3 icon-only buttons
3. Right nav below logo: existing MenuDefault list (logo removed from it)

Structure in dashboard.vue:
```
layout--dashboard__menu
├── layout--dashboard__menu__logo  (logo, full width, 64px)
└── layout--dashboard__menu__panels  (flex row)
    ├── layout--dashboard__menu__rail  (48px, MenuMain)
    └── layout--dashboard__menu__nav   (flex:1, MenuDefault)
```
</objective>

<context>
@CLAUDE.md
@apps/dashboard/app/layouts/dashboard.vue
@apps/dashboard/app/components/MenuDefault.vue
@apps/dashboard/app/scss/components/_menu.scss
@apps/dashboard/app/scss/components/_layout.scss
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove logo from MenuDefault.vue</name>
  <files>apps/dashboard/app/components/MenuDefault.vue</files>
  <read_first>apps/dashboard/app/components/MenuDefault.vue</read_first>
  <action>
    Remove the entire `<div class="menu--default__logo">...</div>` block from the template.
    It currently contains a NuxtLink with NuxtImg (the logo). Remove only that div and its children.
    Do NOT touch the `<ul class="menu--default__list">` or any script logic.
  </action>
  <acceptance_criteria>
    - MenuDefault.vue no longer contains `menu--default__logo`
    - MenuDefault.vue still contains `menu--default__list`
    - No TypeScript errors
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 2: Create MenuMain.vue with 3 icon-only buttons</name>
  <files>apps/dashboard/app/components/MenuMain.vue</files>
  <read_first>apps/dashboard/app/components/MenuDefault.vue</read_first>
  <action>
    Create apps/dashboard/app/components/MenuMain.vue:

    ```vue
    <template>
      <nav class="menu menu--main">
        <button type="button" class="menu--main__btn" aria-label="Dashboard">
          <LayoutDashboard class="menu--main__icon" />
        </button>
        <button type="button" class="menu--main__btn" aria-label="Usuarios">
          <Users class="menu--main__icon" />
        </button>
        <button type="button" class="menu--main__btn" aria-label="Mantenedores">
          <Settings class="menu--main__icon" />
        </button>
      </nav>
    </template>

    <script setup lang="ts">
    import { LayoutDashboard, Users, Settings } from "lucide-vue-next";
    </script>
    ```

    No props, no emits, no @click, no router-link, no state. Pure visual.
  </action>
  <acceptance_criteria>
    - File exists at apps/dashboard/app/components/MenuMain.vue
    - Contains exactly 3 buttons with aria-labels in Spanish
    - Imports LayoutDashboard, Users, Settings from lucide-vue-next
    - No TypeScript errors, no unused imports
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 3: Update dashboard.vue layout structure</name>
  <files>apps/dashboard/app/layouts/dashboard.vue</files>
  <read_first>apps/dashboard/app/layouts/dashboard.vue</read_first>
  <action>
    Replace:
    ```vue
    <div class="layout--dashboard__menu">
      <MenuDefault @close="isSidebarOpen = false" />
    </div>
    ```

    With:
    ```vue
    <div class="layout--dashboard__menu">
      <div class="layout--dashboard__menu__logo">
        <NuxtLink to="/" title="Waldo.click">
          <NuxtImg
            loading="lazy"
            decoding="async"
            src="/images/logo-black.svg"
            alt="Waldo.click"
            title="Waldo.click"
          />
        </NuxtLink>
      </div>
      <div class="layout--dashboard__menu__panels">
        <div class="layout--dashboard__menu__rail">
          <MenuMain />
        </div>
        <div class="layout--dashboard__menu__nav">
          <MenuDefault @close="isSidebarOpen = false" />
        </div>
      </div>
    </div>
    ```

    In script setup, add import:
    ```ts
    import MenuMain from "@/components/MenuMain.vue";
    ```
    Place it next to the existing MenuDefault import. Do NOT remove any existing imports.
  </action>
  <acceptance_criteria>
    - dashboard.vue contains layout--dashboard__menu__logo div with NuxtLink + NuxtImg
    - dashboard.vue contains layout--dashboard__menu__panels div
    - layout--dashboard__menu__rail contains MenuMain
    - layout--dashboard__menu__nav contains MenuDefault with @close handler
    - MenuMain is imported in script setup
    - No TypeScript errors
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 4: Update SCSS — _layout.scss and _menu.scss</name>
  <files>
    apps/dashboard/app/scss/components/_layout.scss
    apps/dashboard/app/scss/components/_menu.scss
  </files>
  <read_first>
    apps/dashboard/app/scss/components/_layout.scss
    apps/dashboard/app/scss/components/_menu.scss
  </read_first>
  <action>
    **_layout.scss** — inside the existing `&--dashboard` block:

    1. Modify `&__menu`: remove `overflow-y: auto`, add `display: flex; flex-direction: column` (column so logo is on top, panels below).

    2. Add after `&__menu { }`:
    ```scss
    &__menu__logo {
      height: 64px;
      padding: 0 24px;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      align-items: center;
      flex-shrink: 0;

      a {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: inherit;

        img {
          height: 32px;
          width: auto;
        }
      }
    }

    &__menu__panels {
      flex: 1;
      display: flex;
      flex-direction: row;
      min-height: 0;
      overflow: hidden;
    }

    &__menu__rail {
      width: 48px;
      flex-shrink: 0;
      border-right: 1px solid #e5e5e5;
      height: 100%;
    }

    &__menu__nav {
      flex: 1;
      min-width: 0;
      height: 100%;
      overflow-y: auto;
    }
    ```

    **_menu.scss** — inside the existing `.menu { }` wrapper, after the `&--mobile` block, add:
    ```scss
    &--main {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 0;
      gap: 8px;

      &__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        background: none;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        color: #1a1a1a;
        transition: background-color 0.15s ease;

        &:hover {
          background-color: #f5f5f5;
        }
      }

      &__icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    }
    ```

    Also remove the `menu--default__logo` block from `_menu.scss` since that div no longer exists in MenuDefault.vue.
  </action>
  <acceptance_criteria>
    - _layout.scss &__menu has display:flex; flex-direction:column and NO overflow-y:auto
    - _layout.scss contains &__menu__logo, &__menu__panels, &__menu__rail, &__menu__nav
    - _menu.scss contains &--main with &__btn and &__icon nested inside existing .menu block
    - _menu.scss no longer contains &__logo styles (removed since the div no longer exists)
  </acceptance_criteria>
</task>

</tasks>

<success_criteria>
- Logo renders at top of sidebar, full 350px width, 64px height
- Below logo: 48px rail on the left with 3 stacked icon buttons
- To the right of rail: existing MenuDefault list (without logo)
- No TypeScript errors
- MenuDefault @close event handler preserved
- BEM respected throughout
</success_criteria>

<output>
After completion, create .planning/quick/260409-kru-split-layout-dashboard-menu-into-rail-me/260409-kru-SUMMARY.md
</output>

---
phase: quick
plan: 26
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/cuenta/mi-perfil.vue
  - apps/website/app/components/AccountMiPerfil.vue
  - apps/website/app/components/MenuUser.vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "User can see Edit Profile form and Change Password form on the same page at /cuenta/mi-perfil"
    - "MenuUser has a single 'Mi Perfil' item linking to /cuenta/mi-perfil (no separate 'Cambiar contraseña' item)"
    - "Edit profile form pre-fills current user data and submits via FormProfile"
    - "Change password form includes show/hide toggle and submits via FormPassword"
  artifacts:
    - path: "apps/website/app/pages/cuenta/mi-perfil.vue"
      provides: "New Mi Perfil page (layout:account, middleware:auth, useAsyncData for regions/communes)"
    - path: "apps/website/app/components/AccountMiPerfil.vue"
      provides: "Container with two section blocks: edit profile + change password"
  key_links:
    - from: "apps/website/app/components/MenuUser.vue"
      to: "/cuenta/mi-perfil"
      via: "NuxtLink to='/cuenta/mi-perfil'"
    - from: "apps/website/app/components/AccountMiPerfil.vue"
      to: "FormProfile + FormPassword"
      via: "component composition"
---

<objective>
Create a unified "Mi Perfil" page at /cuenta/mi-perfil with two form blocks — Edit Profile and Change Password — and consolidate the user menu to a single "Mi Perfil" item.

Purpose: Replace two separate pages (perfil/editar + cambiar-contrasena) with a single profile management page. Clean up the user menu.
Output: New page + container component + updated menu.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Key existing files to build on — read before implementing -->
@apps/website/app/components/AccountEdit.vue
@apps/website/app/components/AccountPassword.vue
@apps/website/app/components/FormProfile.vue
@apps/website/app/components/FormPassword.vue
@apps/website/app/pages/cuenta/perfil/editar.vue
@apps/website/app/components/MenuUser.vue
@apps/website/app/scss/components/_account.scss

<interfaces>
<!-- AccountEdit.vue wraps FormProfile in account--edit block -->
<!-- AccountPassword.vue wraps FormPassword with isExternalProvider guard -->
<!-- editar.vue pre-loads regions + communes via useAsyncData before FormProfile mounts -->

FormProfile.vue: reads from useRegionsStore + useCommunesStore (must be pre-loaded via useAsyncData in the page)
FormPassword.vue: uses useStrapiAuth().changePassword(), includes passwordType toggle (ref("password") toggled by handleShowPassword)

Existing SCSS modifiers in _account.scss:
  .account--edit { &__header, &__title, &__text, &__form }
  .account--password { &__memo, &__form }
  .account--profile { &__box, &__heading, &__grid }

MenuUser.vue current links:
  /cuenta              → Mi cuenta
  /cuenta/mis-anuncios → Mis anuncios
  /cuenta/perfil       → Mi perfil       ← change to /cuenta/mi-perfil
  /cuenta/cambiar-contrasena → Cambiar contraseña  ← remove this item
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create AccountMiPerfil.vue + mi-perfil.vue page</name>
  <files>
    apps/website/app/components/AccountMiPerfil.vue
    apps/website/app/pages/cuenta/mi-perfil.vue
  </files>
  <action>
**AccountMiPerfil.vue** — new component, composing existing AccountEdit and AccountPassword:

```vue
<template>
  <div class="account account--miperfil">
    <div class="account--miperfil__block">
      <AccountEdit />
    </div>
    <div class="account--miperfil__block account--miperfil__block--password">
      <AccountPassword />
    </div>
  </div>
</template>

<script setup lang="ts">
import AccountEdit from "@/components/AccountEdit.vue";
import AccountPassword from "@/components/AccountPassword.vue";
</script>
```

Add to `apps/website/app/scss/components/_account.scss` — append at the end of the `.account { }` block (before the closing brace), after the existing `&--password` modifier:

```scss
  &--miperfil {
    display: flex;
    flex-direction: column;
    gap: 60px;

    &__block {
      &--password {
        padding-top: 60px;
        border-top: 1px solid $gainsboro;
      }
    }
  }
```

**mi-perfil.vue** — new page at `apps/website/app/pages/cuenta/mi-perfil.vue`. Pattern mirrors `perfil/editar.vue` exactly: pre-loads regions + communes via `useAsyncData`, layout `account`, middleware `auth`:

```vue
<template>
  <div class="page">
    <AccountMiPerfil />
  </div>
</template>

<script setup lang="ts">
import AccountMiPerfil from "@/components/AccountMiPerfil.vue";
import { useRegionsStore } from "@/stores/regions.store";
import { useCommunesStore } from "@/stores/communes.store";

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

const regionsStore = useRegionsStore();
const communesStore = useCommunesStore();

await useAsyncData("mi-perfil-regions-communes", async () => {
  await regionsStore.loadRegions();
  await communesStore.loadCommunes();
});

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Mi Perfil",
  description:
    "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y cambia tu contraseña.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/mi-perfil`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mi Perfil",
  url: `${config.public.baseUrl}/cuenta/mi-perfil`,
  description:
    "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y cambia tu contraseña.",
});
</script>
```
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20</automated>
  </verify>
  <done>
    - /cuenta/mi-perfil page exists with layout:account and middleware:auth
    - AccountMiPerfil.vue renders both AccountEdit and AccountPassword blocks stacked with a divider
    - No TypeScript errors introduced
  </done>
</task>

<task type="auto">
  <name>Task 2: Update MenuUser.vue — consolidate to single Mi Perfil item</name>
  <files>apps/website/app/components/MenuUser.vue</files>
  <action>
In `MenuUser.vue`, make two changes to the first `<ul class="menu--user__menu__links">`:

1. Change the "Mi perfil" `<li>` link from `/cuenta/perfil` → `/cuenta/mi-perfil`
2. Remove the entire "Cambiar contraseña" `<li>` entry (the one linking to `/cuenta/cambiar-contrasena`)

The first `<ul>` should end up with three items: Mi cuenta, Mis anuncios, Mi perfil (no Cambiar contraseña).

Result after edit:
```html
<ul class="menu--user__menu__links">
  <li @click="menuOpen">
    <NuxtLink to="/cuenta" title="Mi cuenta">Mi cuenta</NuxtLink>
  </li>
  <li @click="menuOpen">
    <NuxtLink to="/cuenta/mis-anuncios/" title="Mis anuncios">
      <span>Mis anuncios</span>
    </NuxtLink>
  </li>
  <li @click="menuOpen">
    <NuxtLink to="/cuenta/mi-perfil" title="Mi perfil">Mi perfil</NuxtLink>
  </li>
</ul>
```
  </action>
  <verify>
    <automated>grep -n "cambiar-contrasena\|mi-perfil\|/cuenta/perfil" apps/website/app/components/MenuUser.vue</automated>
  </verify>
  <done>
    - MenuUser.vue has exactly one "Mi Perfil" link pointing to /cuenta/mi-perfil
    - No link to /cuenta/cambiar-contrasena in MenuUser.vue
    - No link to /cuenta/perfil (old path) in MenuUser.vue
  </done>
</task>

</tasks>

<verification>
- `grep "mi-perfil" apps/website/app/components/MenuUser.vue` → shows link to /cuenta/mi-perfil
- `grep "cambiar-contrasena" apps/website/app/components/MenuUser.vue` → no output (removed)
- `ls apps/website/app/pages/cuenta/mi-perfil.vue` → file exists
- `ls apps/website/app/components/AccountMiPerfil.vue` → file exists
- `grep "account--miperfil" apps/website/app/scss/components/_account.scss` → SCSS present
</verification>

<success_criteria>
- /cuenta/mi-perfil page loads with two sections: Edit Profile (FormProfile) and Change Password (FormPassword)
- FormProfile pre-fills with user data (regions/communes loaded via useAsyncData)
- FormPassword has show/hide toggle (inherited from existing FormPassword component)
- MenuUser has exactly one profile-related link: "Mi perfil" → /cuenta/mi-perfil
- "Cambiar contraseña" menu item removed from MenuUser
- Zero TypeScript errors
- SCSS follows BEM: .account--miperfil with __block and __block--password elements
</success_criteria>

<output>
After completion, create `.planning/quick/26-create-profile-view-with-edit-profile-an/26-SUMMARY.md`
</output>

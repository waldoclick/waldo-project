---
phase: quick
plan: 26
subsystem: website/account
tags: [profile, menu, account, nuxt-page, scss, bem]
dependency_graph:
  requires: [AccountEdit.vue, AccountPassword.vue, regions.store.ts, communes.store.ts]
  provides: [AccountMiPerfil.vue, /cuenta/mi-perfil page]
  affects: [MenuUser.vue]
tech_stack:
  added: []
  patterns: [useAsyncData pre-load, layout:account, middleware:auth, BEM --miperfil modifier]
key_files:
  created:
    - apps/website/app/components/AccountMiPerfil.vue
    - apps/website/app/pages/cuenta/mi-perfil.vue
  modified:
    - apps/website/app/components/MenuUser.vue
    - apps/website/app/scss/components/_account.scss
decisions:
  - Compose AccountMiPerfil from existing AccountEdit + AccountPassword rather than duplicating form logic
  - Add .account--miperfil SCSS modifier with flex-column + gap-60px layout and border-top divider on password block
metrics:
  duration: "~2 minutes"
  completed_date: "2026-03-13"
  tasks_completed: 2
  files_changed: 4
---

# Quick Task 26: Create Profile View with Edit Profile and Change Password Summary

**One-liner:** Unified `/cuenta/mi-perfil` page composing AccountEdit + AccountPassword blocks, with MenuUser consolidated to single "Mi Perfil" item replacing separate profile and password links.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create AccountMiPerfil.vue + mi-perfil.vue page | 41a43fc | AccountMiPerfil.vue, mi-perfil.vue, _account.scss |
| 2 | Update MenuUser.vue — consolidate to single Mi Perfil item | 7f96a69 | MenuUser.vue |

## What Was Built

### AccountMiPerfil.vue
New container component that stacks `AccountEdit` and `AccountPassword` in a flex-column layout. The password block has a `border-top` divider separator. BEM class: `account account--miperfil`.

### /cuenta/mi-perfil page
New page at `apps/website/app/pages/cuenta/mi-perfil.vue` with:
- `layout: "account"` and `middleware: "auth"`
- Pre-loads regions + communes via `useAsyncData("mi-perfil-regions-communes")` before FormProfile mounts
- SEO metadata with `noindex, nofollow` and JSON-LD WebPage schema
- Pattern mirrors `perfil/editar.vue` exactly

### SCSS — .account--miperfil modifier
Added to `_account.scss`:
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

### MenuUser.vue
- Changed "Mi perfil" link: `/cuenta/perfil` → `/cuenta/mi-perfil`
- Removed "Cambiar contraseña" `<li>` item (password management now in Mi Perfil page)
- First `<ul>` now has exactly 3 items: Mi cuenta, Mis anuncios, Mi perfil

## Verification Results

- ✅ `grep "mi-perfil" MenuUser.vue` → shows `/cuenta/mi-perfil` link
- ✅ `grep "cambiar-contrasena" MenuUser.vue` → no output (removed)
- ✅ `ls apps/website/app/pages/cuenta/mi-perfil.vue` → file exists
- ✅ `ls apps/website/app/components/AccountMiPerfil.vue` → file exists
- ✅ `grep "miperfil" _account.scss` → SCSS present at line 569
- ✅ `yarn nuxt typecheck` → zero TypeScript errors

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- ✅ apps/website/app/components/AccountMiPerfil.vue — created
- ✅ apps/website/app/pages/cuenta/mi-perfil.vue — created
- ✅ apps/website/app/components/MenuUser.vue — updated
- ✅ apps/website/app/scss/components/_account.scss — updated
- ✅ Commit 41a43fc — Task 1
- ✅ Commit 7f96a69 — Task 2

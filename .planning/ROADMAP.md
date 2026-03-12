# Roadmap: Waldo Project

## Milestones

- ⛔ **v1.25 Unified Checkout** — forcibly closed 2026-03-09. See `.planning/milestones/v1.25-ROADMAP.md`
- ✅ **v1.26 Mostrar comprobante Webpay** — Phase 060 (shipped 2026-03-11). See `.planning/milestones/v1.26-ROADMAP.md`
- ✅ **v1.27 Reparar eventos GA4 ecommerce** — Phase 061 (shipped 2026-03-12). See `.planning/milestones/v1.27-ROADMAP.md`
- 🔄 **v1.28 Logout Store Cleanup** — Phase 062 (in progress)

## Phases

<details>
<summary>✅ v1.26 Mostrar comprobante Webpay (Phase 060) — SHIPPED 2026-03-11</summary>

- [x] Phase 060: Mostrar comprobante Webpay (3/3 plans) — completed 2026-03-11

</details>

<details>
<summary>✅ v1.27 Reparar eventos GA4 ecommerce (Phase 061) — SHIPPED 2026-03-12</summary>

- [x] Phase 061: Fix GA4 ecommerce events (2/2 plans) — completed 2026-03-12

</details>

### v1.28 Logout Store Cleanup

- [ ] **Phase 062: Logout Store Cleanup** — Composable `useLogout` centraliza el logout y resetea los 5 stores de usuario; los 3 componentes de entrada usan el composable; typecheck pasa sin errores

## Phase Details

### Phase 062: Logout Store Cleanup
**Goal**: Al hacer logout en el website, todos los datos de usuario almacenados en memoria y localStorage son eliminados para que el siguiente usuario inicie sesión con estado limpio
**Depends on**: Nothing (self-contained, `apps/website` only)
**Requirements**: LGOUT-01, LGOUT-02, LGOUT-03, LGOUT-04, LGOUT-05, QUAL-01
**Success Criteria** (what must be TRUE when this phase completes):
  1. Un usuario que hace logout y vuelve a la home no ve datos del usuario anterior en el formulario del wizard de creación de avisos (campos email, teléfono, dirección, datos del aviso en blanco)
  2. Un usuario que hace logout y visita un listing no ve la caché de avisos ni el historial de navegación del usuario anterior
  3. Un usuario que hace logout no ve el perfil del usuario anterior (nombre, email, datos de `useMeStore`/`useUserStore`) al navegar a la cuenta
  4. El `referer`, `contactFormSent` e `isMobileMenuOpen` de `useAppStore` vuelven a sus valores iniciales después del logout
  5. Los tres puntos de logout (`MenuUser.vue`, `MobileBar.vue`, `SidebarAccount.vue`) usan `useLogout()` — no hay código de logout duplicado; `nuxt typecheck` pasa con zero errores
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
| 060   | v1.26     | 3/3            | Complete    | 2026-03-11 |
| 061   | v1.27     | 2/2            | Complete    | 2026-03-12 |
| 062   | v1.28     | 0/?            | Not started | -          |

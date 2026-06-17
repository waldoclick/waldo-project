# 05-01 SUMMARY — Account sidebar + layout shell

**Status:** Complete (visually verified)
**Requirement:** ACC-LAYOUT

## What was done
- Rewrote `SidebarAccount.vue` to the mockup (design/account.dc.html lines 41-73): name, location (map-pin), "Ver mi perfil público" outline button, divider, 5-item nav (Panel/Mis anuncios/Mis órdenes/Mi perfil/Cambiar contraseña) with lucide icons + amber active bar, credits card (number + "+3 gratis" + "Comprar packs"). Kept `useSessionUser`/`getUbication`. Removed old PRO/username/avatar/cover items + logout from sidebar (logout lives in header UserMenu). `credits = 0` placeholder, TODO 05-09.
- Rewrote `.sidebar--account` in `_sidebar.scss` to the new BEM structure with phase-04 tokens.
- Split `.layout--account` out of the shared `--about` selector in `_layout.scss`; new account shell: container max-width 1200 / padding 0 32 / flex gap 40; sidebar sticky 268px top 70; content flex padding 40 0 96; mobile stacks at screen-medium.

## Verification (visual loop)
- vue-tsc clean. Screenshot of `/cuenta/` (logged-in via waldo_jwt cookie) measured: sidebar 268px, 5 nav items, active "Panel"; container 1200px, content left 460px (32+268+40). Sidebar matches the mockup.
- `_variables.scss` unchanged; no inline styles in SidebarAccount.vue.

## Notes
- Found + fixed a Strapi boot crash from plan 05-07: `ad-contact` schema field `created_at` collided with Strapi's built-in column → renamed to `contacted_at` (schema + service). Required a dev-server restart.

## Commits
- `1acb9066` feat(05-01): redesign account sidebar + layout shell
- `fix(05-07)` ad-contact contacted_at rename

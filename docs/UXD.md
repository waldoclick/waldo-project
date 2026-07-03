# UX/UI Design Document (UXD)

**Status:** As-built, verified against live source in `apps/website/app/` on 2026-07-02. Not copied from `.planning/codebase/*` or prior `/docs/*.md` drafts — those are leads only and may be stale.

This document is the design-system reference for the Waldo Project: the page inventory (public vs. dashboard), the component naming taxonomy, the BEM/SCSS conventions, and the brand color palette. It complements [docs/TRD.md](./TRD.md), which owns the architecture-level explanation of why dashboard routes live inside the website app instead of a separate package (see TRD's "Inconsistencias detectadas" note).

## Table of Contents

1. [Inventario de páginas](#inventario-de-páginas)
   - [Públicas](#públicas)
   - [Dashboard (rol manager, gated by dashboard-guard.global.ts)](#dashboard-rol-manager-gated-by-dashboard-guardglobalts)
2. [Taxonomía de componentes](#taxonomía-de-componentes)
3. [Convenciones BEM y SCSS](#convenciones-bem-y-scss)
4. [Paleta de marca](#paleta-de-marca)
5. [Preguntas abiertas](#preguntas-abiertas)

## Inventario de páginas

All pages live under a single Nuxt 4 app, `apps/website/app/pages/`. There is no separate `apps/dashboard` package — dashboard views are a route subtree (`/dashboard/**`) inside the same app, gated by `apps/website/app/middleware/dashboard-guard.global.ts` (manager-role check). See [docs/TRD.md](./TRD.md) for the full architectural note on this merge.

### Públicas

Verified from `apps/website/app/pages/` (top level, excluding the `dashboard/` subtree):

| Route group | Files/dirs | Purpose |
|---|---|---|
| `/` | `index.vue` | Home |
| `/[slug]` | `[slug].vue` | User public profile page |
| `/anunciar/**` | `anunciar/` | Ad creation wizard (multi-step, dedicated routes per step) |
| `/anuncios/**` | `anuncios/` | Ad listing/search + ad detail |
| `/blog/**` | `blog/` | Article listing (`index.vue`) + article detail (`[slug].vue`) |
| `/contacto` | `contacto/` | Contact form |
| `/cuenta/**` | `cuenta/` | Authenticated user account area (orders, ads, profile) |
| `/login/**` | `login/` | Login, Google OAuth, Facebook OAuth, 2-step verification |
| `/onboarding/**` | `onboarding/` | Post-registration profile completion |
| `/packs/**` | `packs/` | Ad pack catalog / purchase entry point |
| `/pagar/**` | `pagar/` | Central checkout hub (`CheckoutDefault.vue` logic), thank-you receipt page |
| `/pro/**` | `pro/` | PRO subscription checkout + management |
| `/registro/**` | `registro/` | Registration, email confirmation, activation |
| `/politicas-de-cookies` | `politicas-de-cookies.vue` | Cookie policy (Phase 4) |
| `/politicas-de-privacidad` | `politicas-de-privacidad.vue` | Privacy policy |
| `/politicas-de-seguridad` | `politicas-de-seguridad.vue` | Security policy (Phase 4) |
| `/terminos-y-condiciones-de-uso` | `terminos-y-condiciones-de-uso.vue` | Terms of use |
| `/preguntas-frecuentes` | `preguntas-frecuentes.vue` | FAQ |
| `/recuperar-contrasena` | `recuperar-contrasena.vue` | Forgot password |
| `/restablecer-contrasena` | `restablecer-contrasena.vue` | Reset password |
| `/sitemap` | `sitemap.vue` | Human-readable sitemap |
| `/dev` | `dev.vue` | Internal dev-only page (`noindex, nofollow`) |

### Dashboard (rol manager, gated by dashboard-guard.global.ts)

Verified from `apps/website/app/pages/dashboard/`. Every route under `/dashboard/**` is intercepted by `dashboard-guard.global.ts`, which requires an authenticated session with `role.name.toLowerCase() === "manager"` (SSR fail-open skip when role is not yet resolved, then re-enforced client-side).

| Route group | Dir/file | Purpose |
|---|---|---|
| `/dashboard` | `index.vue` | Dashboard home (stats, charts) |
| `/dashboard/account/**` | `account/` | Manager account settings |
| `/dashboard/ads/**` | `ads/` | Ad moderation (approve/reject/ban), drafts, published listing |
| `/dashboard/articles/**` | `articles/` | Blog article CRUD (incl. AI-assisted creation lightbox) |
| `/dashboard/featured/**` | `featured/` | Featured-ad reservation management |
| `/dashboard/integrations/**` | `integrations/` | Google Analytics, Search Console, Cloudflare, Better Stack panels |
| `/dashboard/maintenance/**` | `maintenance/` | Catalog maintainers: categories, communes, regions, conditions, FAQs, terms, policies, cookie policy, security policy |
| `/dashboard/orders/**` | `orders/` | Order listing, CSV export |
| `/dashboard/reservations/**` | `reservations/` | Ad reservation management, gift-reservation flow |
| `/dashboard/users/**` | `users/` | User management, PRO subscriptions/payments |

## Taxonomía de componentes

`apps/website/app/components/` is a **flat directory** — 225 `.vue` files, PascalCase, auto-imported by Nuxt. The only subdirectory is `icons/` (custom SVG icon wrapper components, e.g. `IconGtm.vue`, `IconWhatsApp.vue`, `IconX.vue`; note two lowercase-prefixed legacy outliers, `iconBetterStack.vue` and `iconCloudflare.vue`).

Naming follows a **role-prefix convention** (per CLAUDE.md's "Project Structure" section) rather than a nested-folder taxonomy. Confirmed prefixes and representative examples from the live directory listing:

| Prefix | Role | Examples |
|---|---|---|
| `Form*` | Form components (create/edit) | `FormLogin.vue`, `FormRegister.vue`, `FormCheckout.vue`, `FormArticle.vue`, `FormVerifyCode.vue` |
| `Card*` | Card/summary display units | `CardAnnouncement.vue`, `CardArticle.vue`, `CardOrder.vue`, `CardPack.vue`, `CardInfo.vue`, `CardStat.vue` |
| `Lightbox*` | Modal/lightbox overlays | `LightboxLogin.vue`, `LightboxRegister.vue`, `LightboxGift.vue`, `LightboxCookies.vue`, `LightBoxArticles.vue` (note inconsistent internal casing on this one file) |
| `Menu*` | Navigation menus (dashboard rail/panels, public menus) | `MenuMain.vue`, `MenuMaintenance.vue`, `MenuUsers.vue`, `MenuUser.vue`, `MenuAbout.vue`, `MenuFooter.vue` |
| `Login*` | Auth provider buttons/widgets | `LoginWithGoogle.vue`, `LoginWithFacebook.vue` |
| `Bar*` | Action/toolbar bars | `BarAnnouncement.vue`, `BarCheckout.vue`, `BarCreate.vue`, `BarPro.vue` |
| `Account*` | Account-area sections | `AccountProfile.vue`, `AccountOrders.vue`, `AccountPassword.vue`, `AccountAvatar.vue` |
| `Breadcrumbs*` | Breadcrumb variants | `BreadcrumbsDefault.vue`, `BreadcrumbsDashboard.vue` |
| Domain-suffixed `*Default.vue` | Default/base display variant per domain | `CategoriesDefault.vue`, `ConditionsDefault.vue`, `CommunesDefault.vue`, `ContactDefault.vue` |
| Domain-suffixed `*Dashboard.vue` | Dashboard-specific variant of a domain component | `CookiePoliciesDashboard.vue` (paired with `CookiePoliciesDefault.vue`) |

Other observed families without a single shared prefix but grouped by domain noun: `Ad*` (`AdArchive.vue`, `AdSingle.vue`, `AdsTable.vue`), `Chart*` (`ChartSales.vue`), `Cloudflare*`/`BetterStack*` (integration widgets), `Checkout*` (`CheckoutDefault.vue`, `CheckoutPro.vue`).

Components never contain page-level composition logic — per CLAUDE.md, `pages/` files are composition-only (import + arrange components), while BEM/HTML structure lives inside the component itself.

## Convenciones BEM y SCSS

BEM conventions are defined authoritatively in the repo root `CLAUDE.md` ("CSS / SCSS" section) and enforced across `apps/website/app/scss/`. Summary of the rules (quoted/paraphrased from CLAUDE.md, the source of truth — do not re-derive):

- **Block** = a single semantic noun (`upload`, `form`, `card`, `gallery`) — never a hyphenated compound (`upload-media` is invalid; that is block+modifier written wrong).
- **Modifier** extends the block with `--`: `upload--media`, `form--checkout`, `card--article`. The root HTML element carries both classes: `class="upload upload--media"`.
- **Elements** are children of the modifier namespace, using `__`: `upload--media__grid`, `upload--media__item`, with sub-levels chaining further: `upload--media__item__image`.
- **No standalone compound class names.** Classes like `lightbox-backdrop`, `section-user`, `modal-overlay` are invalid — every class must descend from a BEM block/modifier hierarchy (e.g. `.lightbox--demo__backdrop`, not `.lightbox-backdrop`).
- **Modifier encapsulation:** once a block has a modifier (`form--checkout`), all of its children are scoped under that modifier's namespace (`form--checkout__field__title`), never mixed back into the base block's namespace (`form__section-title` is wrong inside a `form--checkout` context).
- **`form__label` caveat:** `form__label` is absolutely positioned to float over an input border; it must never be applied directly to non-input groups (upload, gallery). Non-input groups use the `form__group--upload` modifier instead, which sets `position: static`.
- **One SCSS file per BEM block**, named after the base class (e.g. `_form.scss` for `.form`, `_card.scss` for `.card`). SCSS nesting mirrors HTML hierarchy exactly.
- No `box-shadow` or `transform: scale`; transitions stay simple (no scale-on-hover).

### BEM block → SCSS file mapping (sample, verified from `apps/website/app/scss/components/`)

`apps/website/app/scss/components/` contains one partial per BEM block (60+ files, `_<block>.scss` naming, imported into `apps/website/app/scss/app.scss`). Representative sample:

| BEM block | SCSS file |
|---|---|
| `.form` (incl. `form--checkout`, `form--cookie-policy`, `form--security`) | `_form.scss` |
| `.card` (incl. `card--article`, `card--info`) | `_card.scss` |
| `.upload` | `_upload.scss` |
| `.lightbox` (incl. `lightbox--demo`, `lightbox--gift`) | `_lightbox.scss` |
| `.menu` | `_menu.scss` |
| `.payment` (incl. `payment--ad`, `payment--gateway`) | `_payment.scss` |
| `.checkout` | `_checkout.scss` |
| `.article` / `.articles` | `_article.scss` / `_articles.scss` |
| `.cookies` | `_cookies.scss` |
| `.security` | `_security.scss` |
| `.terms` | `_terms.scss` |
| `.reservations` | `_reservations.scss` |
| `.sidebar` | `_sidebar.scss` |
| `.table` | `_table.scss` |
| `.toast` | `_toast.scss` |
| `.faq` / `.faqs` | `_faq.scss` / `_faqs.scss` |

`apps/website/app/scss/abstracts/_variables.scss` is the single source for SCSS color tokens (cross-checked against CLAUDE.md's brand palette table below — the SCSS file matches CLAUDE.md's 15 documented tokens exactly, plus one additional utility token `$white: #ffffff` not listed in CLAUDE.md's table).

## Paleta de marca

The brand palette below is quoted **verbatim** from `CLAUDE.md` (repo root, "Brand Colors" section) — it is the single source of truth. Do not invent, approximate, or re-derive hex values.

| Token | Hex | Usage |
|-------|-----|-------|
| `$light_peach` | `#ffd699` | Primary CTA buttons, brand backgrounds, email button background |
| `$charcoal` | `#313338` | Primary text, dark button background, email button text on `#ffd699` |
| `$davys_grey` | `#555555` | Secondary text |
| `$silver` | `#c8c8c9` | Disabled states, borders |
| `$gainsboro` | `#eaebeb` | Dividers, subtle borders |
| `$platinum` | `#ededed` | Background surfaces |
| `$cultured` | `#f5f5f5` | Light backgrounds |
| `$ghost_white` | `#f7f7f7` | Alternate light backgrounds |
| `$white_smoke` | `#f2f2f2` | Input backgrounds |
| `$eerie_black` | `#333333` | High-contrast text |
| `$jet` | `#2d2d2e` | Near-black surfaces |
| `$red_salsa` | `#ff6b6b` | Errors, destructive actions |
| `$dodger_blue` | `#2196f3` | Links, info states |
| `$independence` | `#4e6297` | Secondary/muted blue accents |
| `$magic_mint` | `#c2e3d9` | Success states |

**MJML email templates:** use `#ffd699` for button `background-color` and `#313338` for button `color`. Never use any other color for CTA buttons in emails (verbatim rule from CLAUDE.md).

## Preguntas abiertas

- `06-RESEARCH.md`'s "UXD.md Source Orientation" section explicitly notes its confidence as MEDIUM: it is a structural inventory (file/directory listing) only, not a deep per-component visual/interaction audit. Individual component internals (prop contracts, slot usage, accessibility attributes, responsive breakpoint behavior) were not opened file-by-file for this document — flagged for a future dedicated component-level design audit if needed.
- Two components deviate from strict PascalCase file naming (`iconBetterStack.vue`, `iconCloudflare.vue`, lowercase-prefixed, inside `icons/`) and one has inconsistent internal casing (`LightBoxArticles.vue` vs. the `Lightbox*` prefix used elsewhere) — cosmetic naming drift, not corrected here since this document is descriptive (as-built), not prescriptive.
- `$white: #ffffff` exists in `_variables.scss` but is not part of CLAUDE.md's documented brand palette table — unclear whether it is an intentional utility token outside the "brand" palette proper or an undocumented gap in CLAUDE.md. Not resolved here; flagged for the CLAUDE.md maintainer.

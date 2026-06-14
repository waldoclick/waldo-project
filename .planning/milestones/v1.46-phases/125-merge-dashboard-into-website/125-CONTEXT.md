# Phase 125 Context — Merge Dashboard into Website as /dashboard

## Goal

Move the entire `apps/dashboard` app into `apps/website` so that the dashboard is accessible at `/dashboard/**` within the website. The dashboard app is then deleted. A single login flow handles both regular users and managers, redirecting managers to `/dashboard` after authentication.

---

## Locked Decisions

### 1. Authentication — shared login, manager redirect

- Website's existing login flow (`FormVerifyCode.vue`) is the sole login for both regular users and managers.
- After `fetchUser()` completes at the OTP step, check `useStrapiUser().value?.role?.name === 'manager'`.
- If manager → `navigateTo('/dashboard')` (bypasses `appStore.getReferer` logic).
- If not manager → existing flow unchanged (`appStore.getReferer || '/anuncios'`).
- The dashboard's own auth pages (`/auth/login`, `/auth/forgot-password`, etc.) are removed — the website's equivalents (`/login`, `/recuperar-contrasena`, etc.) cover all users.

### 2. Manager bypasses onboarding

- The `onboarding-guard.global.ts` must exempt `/dashboard/**` paths entirely.
- Managers skip profile-completeness check — they are internal admins, not public users.
- Add `/dashboard` to the exempt prefix list alongside `/login`, `/registro`, `/logout`.

### 3. Dashboard guard in website

- New `dashboard-guard.global.ts` middleware in website's `app/middleware/`.
- Fires ONLY for paths starting with `/dashboard`.
- Checks: user logged in (`useStrapiUser()`) AND `role.name === 'manager'`.
- If not logged in → `navigateTo('/login')`.
- If logged in but not manager → `navigateTo('/')` (regular users cannot access dashboard).
- SSR caveat: role is only populated after `/users/me` (client-side); skip role check on SSR same as dashboard's original guard to avoid OOM redirect loop.

### 4. Session system — website's system wins

- Dashboard currently uses custom `useSessionUser/Token/Auth/Client` composables (Phase 109 remnants).
- After merge, ALL dashboard components migrate to website's session system:
  - `useSessionUser<User>()` → `useStrapiUser<User>()`
  - `useSessionToken()` → `useStrapiToken()`
  - `useSessionAuth()` → `useStrapiAuth()`
  - `useSessionClient()` → `useApiClient()` (website's existing composable)
- The 4 custom session composables from dashboard are NOT copied into website — they are dropped.
- Website's `useApiClient` reads from `waldo_jwt` cookie (same cookie used by `@nuxtjs/strapi`) — this is the correct JWT after login via website.

### 5. Component naming — collision resolution

- 29 components exist in both apps with the same name.
- Dashboard version gets `Dashboard` suffix: `HeroDefault` → `HeroDashboard`, `HeaderDefault` → `HeaderDashboard`, etc.
- Full collision list: `AvatarDefault`, `BreadcrumbsDefault`, `CardInfo`, `FooterDefault`, `FormDev`, `FormForgotPassword`, `FormLogin`, `FormPack`, `FormPassword`, `FormResetPassword`, `FormVerifyCode`, `GalleryDefault`, `HeaderDefault`, `HeroDefault`, `IntroduceAuth`, `LightboxAdblock`, `LightboxCookies`, `LightboxRazon`, `LoadingDefault`, `LogoWhite`, `MenuDefault`, `MenuMobile`, `PacksDefault`, `PictureDefault`, `PoliciesDefault`, `SearchDefault`, `TermsDefault`, `IconX`.
- 73 non-colliding dashboard components keep their original names.
- All internal references in dashboard pages/components must be updated to the new names.

### 6. SCSS merge strategy

- Colliding SCSS files (same filename in both apps): dashboard content is appended to the existing website file as a new `&--dashboard` modifier block inside the root class.
  - Example: dashboard's `_hero.scss` has `&--default { ... }` → becomes `&--dashboard { ... }` appended inside `.hero {}` in website's `_hero.scss`.
- Non-colliding SCSS files (dashboard-exclusive): copied as new files into `apps/website/app/scss/components/` and imported in `app.scss`.
  - Examples: `_ads.scss`, `_chart.scss`, `_table.scss`, `_toolbar.scss`, `_badge.scss`, `_box.scss`, `_better-stack.scss`, `_cloudflare.scss`, `_communes.scss`, `_conditions.scss`, `_dropdown.scss`, `_faqs.scss`, `_featured.scss`, `_google-analytics.scss`, `_orders.scss`, `_pagination.scss`, `_regions.scss`, `_reservations.scss`, `_search-console.scss`, `_statistics.scss`, `_stats.scss`, `_subscription-payments.scss`, `_subscription-pros.scss`, `_table.scss`, `_textarea.scss`, `_users.scss`, `_verify-code.scss`.
- SCSS variables/mixins: both apps share the same abstracts (`_variables.scss`, `_mixins.scss`) — no merge needed; dashboard components use website's existing abstracts.

### 7. Dashboard layout in website

- New `dashboard.vue` layout file at `apps/website/app/layouts/dashboard.vue`.
- Built from dashboard's current layout file(s) — sidebar, header, menu system.
- All migrated dashboard pages use `definePageMeta({ layout: 'dashboard' })`.
- Website's existing layouts (`default.vue`, `account.vue`, `auth.vue`, `onboarding.vue`) are untouched.

### 8. Pages routing

- All 86 dashboard pages move to `apps/website/app/pages/dashboard/`.
- Route examples: `ads/[id].vue` → `dashboard/ads/[id].vue` → URL `/dashboard/ads/:id`.
- Dashboard's own auth pages (`auth/login.vue`, `auth/forgot-password.vue`, `auth/reset-password.vue`, `auth/verify-code.vue`) are dropped — website's auth pages handle all users.
- Dashboard's `account/profile.vue` becomes `dashboard/account/profile.vue`.

### 9. Stores — website's stores take precedence

- Overlapping stores (`app.store.ts`, `articles.store.ts`, `me.store.ts`): dashboard components use the website's existing versions.
- Dashboard-exclusive stores (`search.store.ts`, `settings.store.ts`): copied into website's `app/stores/`.
- Dashboard's `me.store.ts` is dropped — website's version covers authenticated user state.

### 10. nuxt.config additions

- The following dashboard-exclusive Vite deps must be added to website's `nuxt.config.ts` `vite.optimizeDeps.include`:
  `floating-vue`, `dompurify`, `vue-awesome-paginate`, `qs`, `vue-chartjs`, `chart.js`, `chartjs-plugin-annotation`, `lucide-vue-next`, `@vueuse/core`.
- Dashboard `routeRules` (Spanish → English URL redirects) are dashboard-internal routes — they go into website's `nuxt.config.ts` under a `/dashboard/**` prefix context or simply dropped if they only applied to dashboard's standalone routing.
- Dashboard's `devMode` runtimeConfig key: dropped — website has no dev-mode gate and the `dev.global.ts` middleware is not migrated.
- CSP additions: dashboard had LogRocket and extended Google/Sentry/Cloudflare sources. Research phase must audit which are already in website's CSP and add only the missing ones.

### 11. DevMode gate

- Dashboard's `dev.global.ts` middleware is NOT migrated.
- Website's existing dev-mode protection (if any) covers the entire app, including `/dashboard`.
- `/dashboard/dev` page is dropped.

### 12. Package dependencies

- Dashboard-exclusive packages must be added to `apps/website/package.json`:
  `floating-vue`, `dompurify`, `vue-awesome-paginate`, `vue-chartjs`, `chart.js`, `chartjs-plugin-annotation`, `lucide-vue-next`, `@vueuse/core`, `logrocket` (check if already present).
- Research phase must diff both `package.json` files and identify exact additions needed.

---

### 13. robots.txt

- Add `Disallow: /dashboard/` to website's robots config in `nuxt.config.ts`.
- The dashboard app previously blocked everything (`Disallow: /`) via its own `robots` config — after merge, the website's robots must explicitly block the new `/dashboard/` prefix.

### 14. Dashboard routeRules — migrate with /dashboard/ prefix

- Dashboard has 22 routeRules (Spanish → English URL redirects, e.g. `/anuncios` → `/ads`).
- Migrate all 22 with the `/dashboard/` prefix: `/dashboard/anuncios` → `/dashboard/ads`, etc.
- These go into website's `nuxt.config.ts` `routeRules` block.

### 15. GTM — single container

- Drop the dashboard's GTM container ID entirely.
- The website's existing GTM container (`GTM-TC8LS8NQ`) is the only one active after merge.
- Dashboard-specific GTM tracking is intentionally lost.

### 16. SCSS @use fix for dashboard-exclusive files

- 18 dashboard-only SCSS files use `@extend .container` without `@use "../base/container"` at the top.
- When copied into website's compilation chain, they will fail at build time.
- Each of these 18 files must have `@use "../base/container";` added before being imported in website's `app.scss`.
- The researcher identified these explicitly in RESEARCH.md.

### 17. Component collision count correction

- Confirmed 28 top-level component collisions (not 29 as initially listed).
- `icons/IconX.vue` is identical in both apps — no rename needed, website's version is kept.
- The 28 colliding components all receive the `Dashboard` suffix as per Decision 5.

---

## Non-Goals (out of scope for this phase)

- Migrating `apps/strapi` — Strapi is untouched.
- Changing any public website routes or functionality.
- Adding new dashboard features.
- Changing the Strapi API endpoints.

---

## Code Context

| Area | Location |
|------|----------|
| Website login OTP component | `apps/website/app/components/FormVerifyCode.vue` |
| Website onboarding guard | `apps/website/app/middleware/onboarding-guard.global.ts` |
| Dashboard guard (reference) | `apps/dashboard/app/middleware/guard.global.ts` |
| Dashboard session composables | `apps/dashboard/app/composables/useSession*.ts` |
| Website `useApiClient` | `apps/website/app/composables/useApiClient.ts` |
| Website layouts | `apps/website/app/layouts/` |
| Dashboard pages | `apps/dashboard/app/pages/` (86 files) |
| Dashboard components | `apps/dashboard/app/components/` (102 files) |
| Dashboard SCSS | `apps/dashboard/app/scss/components/` (61 files) |
| Website SCSS | `apps/website/app/scss/components/` (79 files) |
| Dashboard nuxt.config | `apps/dashboard/nuxt.config.ts` |
| Website nuxt.config | `apps/website/nuxt.config.ts` |

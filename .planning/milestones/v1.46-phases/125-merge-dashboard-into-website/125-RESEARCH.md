# Phase 125: Merge Dashboard into Website — Research

**Researched:** 2026-06-10
**Domain:** Nuxt 4 app consolidation — migrating 73 pages + 96 components + 57 SCSS files + 5 stores from one Nuxt 4 app into another
**Confidence:** HIGH (all findings verified from actual project files)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

1. **Auth** — Website's `FormVerifyCode.vue` is the sole login for all users. After `fetchUser()`, check `role.name === 'manager'` → `/dashboard`; else existing flow.
2. **Manager bypasses onboarding** — `onboarding-guard.global.ts` must exempt `/dashboard/**` entirely.
3. **Dashboard guard** — New `dashboard-guard.global.ts`, fires only for `/dashboard/**` paths. Not-logged-in → `/login`. Logged-in non-manager → `/`. SSR role-check skip (dashboard's original guard pattern).
4. **Session system** — Website's `@nuxtjs/strapi` wins. All `useSessionUser/Token/Auth/Client` calls replaced with `useStrapiUser/Token/Auth` + `useApiClient`.
5. **Component naming** — 29 colliding components get `Dashboard` suffix. See collision list in CONTEXT.md.
6. **SCSS merge** — Colliding files: append `&--dashboard` modifier. Non-colliding: copy as new files.
7. **Dashboard layout** — New `dashboard.vue` in `apps/website/app/layouts/`.
8. **Pages routing** — All 73 dashboard pages → `apps/website/app/pages/dashboard/`. Dashboard auth pages dropped.
9. **Stores** — Website's stores win. Dashboard-exclusive `search.store.ts` + `settings.store.ts` copied in.
10. **nuxt.config additions** — Vite `optimizeDeps.include` additions, routeRules migration.
11. **DevMode gate** — Dashboard's `dev.global.ts` NOT migrated. `/dashboard/dev` page dropped.
12. **Packages** — Dashboard-exclusive packages must be added to website's `package.json`.

### Claude's Discretion
None specified.

### Deferred Ideas (OUT OF SCOPE)
- Migrating `apps/strapi`
- Changing public website routes or functionality
- Adding new dashboard features
- Changing Strapi API endpoints
</user_constraints>

---

## Summary

This phase moves the `apps/dashboard` Nuxt 4 application wholesale into `apps/website`, making the dashboard accessible at `/dashboard/**` within a single deployment. The work spans five categories: (1) middleware and guard migration, (2) session system unification, (3) component/SCSS/store migration with collision resolution, (4) nuxt.config consolidation, and (5) runtime system updates for DASHBOARD_URL references.

The highest-risk items are: (a) `typeCheck: true` on website will type-check 73 dashboard pages for the first time — this will surface type errors that need a dedicated wave; (b) Strapi's `DASHBOARD_URL` env var is embedded in live server code for email links, CORS, and password reset — these must be updated in Strapi or redirected; (c) the `MenuUser.vue` in website hardlinks to `dashboardUrl` as an external href — after merge that link must become an internal `/dashboard` route.

The merge does NOT require changes to Strapi's business logic. The `@nuxtjs/strapi` auth.populate config already includes `"role"`, so `useStrapiUser().value.role` is populated after `fetchUser()` — the dashboard guard can use it. The locked decision to keep the SSR role-check skip (`if (!roleName) return`) is honored; however, under the new session system this skip is fail-open rather than a technical necessity (see Open Questions #4).

**Primary recommendation:** Execute in waves: (Wave 0) type infrastructure + new layout; (Wave 1) pages + component moves with renames; (Wave 2) session system migration; (Wave 3) guard updates + login flow; (Wave 4) SCSS merge; (Wave 5) runtime state updates (DASHBOARD_URL); (Wave 6) cleanup and app removal.

---

## Standard Stack

### Core (already in website — no installation needed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `nuxt` | ^4.1.3 | App framework | Present in both |
| `@nuxtjs/strapi` | ^2.1.1 | Auth + API client | Website only — this is the session system that wins |
| `@pinia/nuxt` | ^0.11.2 | State management | Present in both |
| `@pinia-plugin-persistedstate/nuxt` | ^1.2.1 | Store persistence | Present in both |
| `floating-vue` | ^5.2.2 | Tooltips/popovers | Present in both |
| `dompurify` | ^3.3.0 | HTML sanitization | Present in both |
| `vue-awesome-paginate` | ^1.2.0 | Pagination UI | Present in both |
| `lucide-vue-next` | ^0.486.0 | Icons | Present in both |
| `@vueuse/core` | ^13.0.0 | Vue utilities | Present in both |
| `logrocket` | ^10.1.0 | Session recording | Present in both |

### Packages to Add to Website (VERIFIED diff — not in website's package.json)
| Package | Version | Used By |
|---------|---------|---------|
| `chart.js` | ^4.5.1 | StatisticsDefault, chart pages |
| `vue-chartjs` | ^5.3.3 | Chart components |
| `chartjs-plugin-annotation` | ^3.1.0 | Chart annotations |
| `qs` | ^6.14.0 | useSessionClient, useApiClient query serialization |
| `@types/qs` | ^6.9.18 | TypeScript types for qs |
| `vuedraggable` | ^4.1.0 | FaqsDefault, PoliciesDefault, TermsDefault drag-reorder |
| `slugify` | ^1.6.6 | useSlugify composable → FormRegion/Category/Commune/Condition |
| `highlight.js` | ^11.11.1 | CardInfo.vue (code highlighting) |

### Packages NOT Needed (verify before adding)
| Package | Reason |
|---------|--------|
| `@vueform/multiselect` | Zero `.vue` or `.ts` imports found in dashboard — dead dependency |

**Installation:**
```bash
yarn workspace waldo-website add chart.js vue-chartjs chartjs-plugin-annotation qs slugify highlight.js vuedraggable
yarn workspace waldo-website add -D @types/qs
```

---

## Architecture Patterns

### Verified File Counts (from actual directory listings)

| Asset | Dashboard | Website (current) | Post-merge |
|-------|-----------|-------------------|------------|
| Pages (.vue) | 73 | — | +73 under `pages/dashboard/` |
| Components (.vue) | 96 flat files + `icons/` subfolder | 145 flat files + `icons/` subfolder | ~241 (28 renamed + 68 new); `icons/` subfolder merged |
| SCSS component files | 57 | 70 | 70 + 30 new files; 28 files appended |
| Stores | 5 | 20 | +2 new (`search.store.ts`, `settings.store.ts`) |
| Composables | 14 | 21 | +3 net (useExportCsv, useServices, useSlugify; 4 session composables dropped) |

### Component Collision Count — Authoritative

Verified by directory listing: **28 files** collide (same filename in both `components/` roots). The CONTEXT.md collision list enumerates 28 items ending with `IconX`; CONTEXT.md says "29" which is an off-by-one.

The `icons/` subfolder shows up in the directory listing as a collision entry because both apps have `components/icons/` directories. Inside:
- Dashboard `components/icons/`: `IconGtm.vue`, `IconX.vue`, `iconBetterStack.vue`, `iconCloudflare.vue`
- Website `components/icons/`: `IconWhatsApp.vue`, `IconX.vue`

`IconX.vue` in `components/icons/` is the X (Twitter social logo) — an SVG file with `defineOptions({ name: "IconX" })`. Both apps contain **identical** copies of this file (verified byte-for-byte). This is not the same as the lucide-vue-next `X as IconX` close icon used in LightboxAdblock and similar — those use an explicit `import { X as IconX } from "lucide-vue-next"` in the `<script setup>` block and are NOT auto-imported from `components/icons/`. Since both apps' `components/icons/IconX.vue` are identical, there is no behavioral collision — the dashboard copy is a no-op merge (copy without rename). The three non-colliding dashboard icons (`IconGtm.vue`, `iconBetterStack.vue`, `iconCloudflare.vue`) are imported by path (`@/components/icons/iconBetterStack.vue`) not by Nuxt auto-import, so they copy without conflict.

**Planner action:** Rename the 28 top-level file collisions per CONTEXT.md locked decision 5. The `icons/` subfolder: copy `IconGtm.vue`, `iconBetterStack.vue`, `iconCloudflare.vue` into website's `components/icons/`. Omit `IconX.vue` (already identical in website).

### SCSS Collision List (28 files — verified)
Both apps have SCSS files with the same name. Merge strategy: append `&--dashboard` modifier block into website's existing file.

```
auth, avatar, body, button, card, easy, filter, footer, form, gallery, header,
hero, input, introduce, layout, lightbox, loading, logo, menu, packs, page,
policies, recaptcha, search, swal, terms, title, upload
```

### Dashboard-Only SCSS Files (30 files — copy as-is into website)
```
ads, articles, badge, better-stack, box, breadcrumbs, categories, chart,
cloudflare, communes, conditions, dropdown, faqs, featured, google-analytics,
orders, pagination, regions, reservations, search-console, statistics, stats,
subscription-payments, subscription-pros, table, textarea, toolbar, users,
verify-code
```

**SCSS @use dependency check — critical action required for dashboard-only files:**

When copying dashboard-only SCSS files, each file that uses `@extend .container` requires `@use "../base/container"` at the top of the copied file. Website's colliding files already have this import, but dashboard-only files were developed as standalone and need it added explicitly.

Files requiring `@use "../base/container"` to be added on copy (18 files verified):
```
_ads.scss, _articles.scss, _better-stack.scss, _box.scss, _categories.scss,
_communes.scss, _conditions.scss, _faqs.scss, _featured.scss, _orders.scss,
_policies.scss, _regions.scss, _reservations.scss, _search-console.scss,
_statistics.scss, _subscription-payments.scss, _subscription-pros.scss
```

**The _loading.scss collision:** Both apps' `_loading.scss` already have `@use "../abstracts/animations"` — this is the one SCSS `@use` dep that differs from the standard trio (`mixins`, `variables`, `container`). No action needed; both files already have it.

Verify the SCSS merge is correct by running `yarn workspace waldo-website build` after Wave 4 and fixing any Sass compilation errors before proceeding to Wave 5.

### Recommended Migration Wave Structure

```
Wave 0 — Infrastructure
  - Add packages to website/package.json
  - Create apps/website/app/layouts/dashboard.vue (port from dashboard)
  - Create apps/website/app/middleware/dashboard-guard.global.ts
  - Patch onboarding-guard.global.ts to exempt /dashboard/**
  - Patch FormVerifyCode.vue for manager redirect
  - Copy search.store.ts + settings.store.ts into website

Wave 1 — Pages (73 .vue files) — use git mv for each file
  - Move dashboard pages → apps/website/app/pages/dashboard/
  - Drop: auth/login.vue, auth/forgot-password.vue, auth/reset-password.vue, auth/verify-code.vue, dev.vue
  - Add definePageMeta({ layout: 'dashboard' }) to all surviving pages (most already have it)
  - Update all internal links from /auth/login → /login, /auth/forgot-password → /recuperar-contrasena

Wave 2 — Components (96 files → rename 28, copy 68)
  - Rename 28 colliding top-level components with Dashboard suffix (git mv each)
  - Update all internal references in dashboard pages/components/layout to renamed names
  - Copy 68 non-colliding components into website's components/
  - Copy icons subfolder: IconGtm.vue, iconBetterStack.vue, iconCloudflare.vue (skip IconX.vue — identical)

Wave 3 — Session system migration (replaces useSessionX in 29 files)
  - useSessionUser<User>() → useStrapiUser<User>()
  - useSessionToken() → useStrapiToken()
  - useSessionAuth() → useStrapiAuth()
  - useSessionClient() → useApiClient()
  - Drop the 4 session composables and session.ts plugin
  - Migrate useLogout.ts: replace navigateTo("/auth/login") → navigateTo("/login"), add searchStore.clearTavily()
  - Keep useExportCsv.ts, useServices.ts, useSlugify.ts (copy into website)

Wave 4 — SCSS merge
  - 28 colliding files: append &--dashboard blocks
  - 30 non-colliding files: copy + add @use line to app.scss
  - Add @use "../base/container" to each of the 18 dashboard-only files listed above
  - Gate: yarn workspace waldo-website build must succeed before Wave 5

Wave 5 — Runtime state (DASHBOARD_URL references)
  - See Runtime State Inventory section below

Wave 6 — Cleanup
  - nuxt.config.ts consolidation (routeRules, runtimeConfig, robots, vite optimizeDeps)
  - Remove waldo-dashboard from turbo.json, root package.json workspaces
  - Remove/archive apps/dashboard/
  - Update MenuUser.vue to use internal NuxtLink to /dashboard instead of external href
```

### Pattern 1: Scoped Global Middleware (dashboard guard)

The dashboard guard must fire ONLY for `/dashboard/**` paths without adding overhead to every non-dashboard route. Pattern verified from existing `guard.global.ts`:

```typescript
// apps/website/app/middleware/dashboard-guard.global.ts
import type { User } from "@/types/user";

export default defineNuxtRouteMiddleware(async (to) => {
  // Fast path: skip entirely for non-dashboard routes
  if (!to.path.startsWith("/dashboard")) return;

  const user = useStrapiUser<User>();

  if (!user.value) {
    const token = useStrapiToken();
    if (!token.value) return navigateTo("/login");
    const { fetchUser } = useStrapiAuth();
    await fetchUser();
  }

  if (!user.value) return navigateTo("/login");

  const roleName = user.value.role?.name?.toLowerCase() ?? null;

  // Per locked decision 3: keep the SSR role-check skip from the original guard.
  // Note: under @nuxtjs/strapi, role IS populated on SSR (auth.populate includes "role").
  // The skip is now fail-open (null role → allow through) rather than load-bearing.
  // See Open Questions #4 for the tradeoff.
  if (!roleName) return;

  if (roleName !== "manager") {
    return navigateTo("/");
  }
});
```

### Pattern 2: Onboarding guard — adding /dashboard exempt

```typescript
// apps/website/app/middleware/onboarding-guard.global.ts
// Add /dashboard to AUTH_EXEMPT_PATHS is WRONG — the exempt check only skips
// the auth page fast path, not the profile-completeness check.
// Instead, add a /dashboard prefix check alongside the /onboarding check:

if (!profileComplete) {
  if (to.path.startsWith("/onboarding")) return;
  if (to.path.startsWith("/dashboard")) return;  // ADD THIS
  return navigateTo("/onboarding");
}
```

### Pattern 3: Manager redirect in FormVerifyCode.vue

The manager check must run AFTER `fetchUser()` and BEFORE the `isProfileComplete` check. The current flow (lines 150-178):

```typescript
const { setToken, fetchUser } = useStrapiAuth();
setToken(responseRaw.jwt);
await fetchUser();

// INSERT HERE (after fetchUser, before isProfileComplete)
const loggedUser = useStrapiUser<User>();
if (loggedUser.value?.role?.name?.toLowerCase() === "manager") {
  await navigateTo("/dashboard");
  return;
}

meStore.reset();
const isComplete = await meStore.isProfileComplete();
// ... rest of existing flow unchanged
```

### Pattern 4: Dashboard layout path fixup

When pages move from `apps/dashboard/app/pages/ads/index.vue` to `apps/website/app/pages/dashboard/ads/index.vue`, the `resolveActiveMenu` function in `dashboard.vue` must prepend `/dashboard`:

```typescript
// BEFORE (dashboard standalone):
if (path.startsWith("/articles")) return "articles";

// AFTER (inside website at /dashboard/**):
if (path.startsWith("/dashboard/articles")) return "articles";
if (path.startsWith("/dashboard/users")) return "users";
if (path.startsWith("/dashboard/maintenance")) return "maintenance";
if (path.startsWith("/dashboard/integrations")) return "integrations";
return "default"; // /dashboard/ads, /dashboard/orders, /dashboard/index, etc.
```

### Pattern 5: Dashboard routeRules need /dashboard prefix

Dashboard's `routeRules` redirect Spanish → English paths (e.g., `/anuncios` → `/ads`). After merge these clash with website's existing public routes. They must be either:
- Dropped entirely (dashboard admins don't need legacy URL support), or
- Prefixed: `/dashboard/anuncios` → `/dashboard/ads`

**Recommendation:** Drop them. They redirect dashboard-internal navigation that managers no longer use.

### Anti-Patterns to Avoid

- **Do NOT copy dashboard's `session.ts` plugin** — it calls `fetchUser()` via `useSessionAuth` which is being dropped. Website's `@nuxtjs/strapi` module handles session hydration automatically.
- **Do NOT copy dashboard's `referer.client.ts` plugin** — it uses the excluded routes from the dashboard context (`/auth/forgot-password`, `/auth/reset-password`). Website already has `referer.global.ts` middleware that handles referer tracking correctly.
- **Do NOT copy dashboard's `guest.ts` middleware** — it redirects to `/auth/login`. After merge the equivalent path is `/login`.
- **Do NOT copy dashboard's `dev.global.ts` middleware** — locked decision 11.
- **Do NOT import `useSessionClient` from dashboard** — `useApiClient` in website already handles qs-encoded params via the `useStrapiClient()` call (the qs serialization lives in Strapi's SDK, not website's `useApiClient`). However note: `useSessionClient` had explicit `qs.stringify` — verify each dashboard component that passes complex filter `params` still serializes correctly via `useStrapiClient`.
- **Do NOT rename SCSS `&--default` modifiers inside the merged file** — dashboard SCSS uses `&--default` (e.g., `hero--default`) as its own modifier name. After merge these become `&--dashboard` ONLY in the new modifier block appended to website's file. The original website modifiers (`&--default`, `&--profile`, etc.) stay untouched.
- **Do NOT copy dashboard-only SCSS files without verifying `@use` deps** — 18 dashboard-only files use `@extend .container` and need `@use "../base/container"` prepended when copied (see SCSS section above).
- **Use `git mv` for every file/directory rename or move** — CLAUDE.md mandates this for all page and component renames to preserve Git rename history. Atomic ref updates (all imports to the renamed file updated in the same commit as the `git mv`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Component auto-import in 241-component app | Manual import resolver | Nuxt auto-imports | Nuxt scans all subdirectories of `components/` automatically |
| SCSS namespace collision | Parallel CSS class trees | `&--dashboard` modifier block | BEM modifier scoping per CLAUDE.md |
| TypeScript errors from strict typecheck | Silencing with `any` | Fix + verify against website's `User` type | Codacy flags `any` and `_`-prefixed unused vars |
| Session hydration after merge | Custom plugin | `@nuxtjs/strapi` module (already present) | Module runs on both SSR + client automatically |
| Role populate for guard | Custom `/users/me` call in middleware | Existing `auth.populate: ["role"]` config | Already configured; `fetchUser()` populates role |

---

## Runtime State Inventory

This is a merge/migration phase. Runtime systems outside git must be updated.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| **Stored data** | None — no databases store dashboard URL strings as keys | None |
| **Live service config** | Strapi `DASHBOARD_URL` env var used in: (1) CORS `allowedOrigins`, (2) password reset email link builder (`context: "dashboard"` → `DASHBOARD_URL + "/auth/reset-password"`), (3) ad lifecycle email links (`DASHBOARD_URL/ads/${id}`), (4) payment service email (`DASHBOARD_URL/ads/${result.ad.id}`) | After merge: `DASHBOARD_URL` must be changed to `FRONTEND_URL` (same host) in the Strapi `.env` file — OR Strapi's `authController.ts` must be patched so `context: "dashboard"` uses `FRONTEND_URL + "/dashboard/restablecer-contrasena"` and the ad email links point to `FRONTEND_URL/dashboard/ads/${id}`. This is a Strapi code change + env change. |
| **OS-registered state** | `pm2` process `waldo-dashboard` registered via `apps/dashboard/ecosystem.config.cjs`. Turbo has a `waldo-dashboard#build` task and `waldo-dashboard#dev` task in `turbo.json`. Root `package.json` workspaces includes `"apps/dashboard"`. | Stop and delete pm2 process; remove `waldo-dashboard` entries from `turbo.json`; remove `apps/dashboard` from root `package.json` workspaces. |
| **Secrets/env vars** | `DASHBOARD_URL` in website's `.env` and `.env.example` (used in `runtimeConfig.public.dashboardUrl`). `BASE_URL` in dashboard's `.env` = port 3001. Dashboard `.env` has `FRONTEND_URL` pointing to website. | After merge: `runtimeConfig.public.dashboardUrl` in website becomes unused (the `MenuUser.vue` link will be an internal NuxtLink). Remove from `runtimeConfig` and `.env.example`. |
| **Build artifacts** | Dashboard `.nuxt/` and `.output/` build artifacts at `apps/dashboard/.nuxt/` and `apps/dashboard/.output/`. No egg-info or global npm installs. | Delete `apps/dashboard/` directory entirely after migration. |

### Critical Strapi Action Required

Strapi's `authController.ts` (line 553-558) branches on `context === "dashboard"` to build password reset URLs pointing to `DASHBOARD_URL/auth/reset-password`. After the dashboard app is removed:

- The dashboard's `FormForgotPassword.vue` sends `context: "dashboard"` in its request body.
- After migration this component becomes `FormForgotPasswordDashboard.vue` in website.
- **It must be updated to send `context: "website"` (or no context) so the reset URL points to `FRONTEND_URL/restablecer-contrasena`**, which is the website's actual reset page.
- The separate `DASHBOARD_URL` env var in Strapi's `middlewares.ts` CORS allowlist can be removed once the dashboard subdomain/port is decommissioned.

### Cross-App Link in MenuUser.vue

`apps/website/app/components/MenuUser.vue` renders a "Ver dashboard" link as an `<a :href="config.public.dashboardUrl">` external link. After merge this must become an internal `<NuxtLink to="/dashboard">`. The `runtimeConfig.public.dashboardUrl` key becomes unused and should be removed.

---

## Common Pitfalls

### Pitfall 1: TypeCheck Escalation (HIGH RISK)
**What goes wrong:** Website has `typeCheck: true`. Dashboard has `typeCheck: false` (explicit comment in nuxt.config). Moving 73 pages and 96 components into website exposes them to strict TypeScript type checking for the first time. Expect 20–60 type errors.
**Why it happens:** Dashboard used `any` casts and less-strict patterns that pass with typeCheck off. Website's compiler sees them for the first time.
**How to avoid:** Run `yarn workspace waldo-website nuxi typecheck` after each wave before committing. Fix type errors within the same wave, not at the end. Budget this as a distinct subtask in each wave.
**Warning signs:** Red underlines in dashboard pages when opened in VS Code after pasting into website project.

### Pitfall 2: User Type Shape Mismatch
**What goes wrong:** Dashboard's `app/types/user.ts` exports `interface User` with slightly different field shapes than website's `app/types/user.d.ts`. Dashboard's `User` has `role?: UserRole` (where `UserRole = { name: string; id?: number }`). Website's `User.role` has an extra `type: string` field.
**Why it happens:** Two independently maintained type definitions diverged over time.
**How to avoid:** Do NOT copy dashboard's `user.ts` into website. Use website's `User` type everywhere after migration. In migrated dashboard components, remove the `import type { User } from "@/types/user"` line that previously imported dashboard's type — website's auto-import provides `User` from `app/types/user.d.ts`.
**Warning signs:** TypeScript error `Property 'type' is missing` on role objects.

### Pitfall 3: Auto-Import Component Name Collision
**What goes wrong:** Nuxt 4 auto-imports all `.vue` files from `components/`. If a dashboard component is copied before being renamed, the website's version is silently shadowed (last directory scan wins — behavior is Nuxt-version dependent and not reliable).
**Why it happens:** Nuxt resolves conflicts by last-writer-wins. There is no build error — the wrong component is silently used.
**How to avoid:** Rename ALL 28 colliding components BEFORE copying to website. Never have a component with the same name in `apps/website/app/components/` that differs from the dashboard version. The icons subfolder collision (`IconX.vue`) is safe to skip rename — both files are identical SVG components.
**Warning signs:** Dashboard pages rendering website-styled components instead of admin-styled ones.

### Pitfall 4: useSessionClient qs Serialization Gap
**What goes wrong:** Dashboard's `useSessionClient` explicitly stringifies `params` using `qs.stringify({ encodeValuesOnly: true })` before calling `$fetch`. Website's `useApiClient` calls `useStrapiClient()` from `@nuxtjs/strapi` which uses its own param serialization internally. Complex nested filter params (like `filters: { status: { $eq: "active" } }`) may serialize differently.
**Why it happens:** The two HTTP clients use different query string serialization strategies.
**How to avoid:** When replacing `useSessionClient` with `useApiClient`, test each page that uses deeply nested `params` objects. If a dashboard component was built explicitly around `qs`-style bracket notation, keep the pattern using `qs.stringify` manually before passing `params` as a string URL.
**Warning signs:** Dashboard list pages returning empty results or 400 errors after session migration.

### Pitfall 5: DASHBOARD_URL in Strapi Email Links (SILENTLY BROKEN)
**What goes wrong:** Strapi sends admin notification emails with links to `DASHBOARD_URL/ads/${id}` (from `lifecycles.ts` and `payment` services). After the dashboard app is removed, those links point to a dead host.
**Why it happens:** Strapi's email templates use hardcoded `DASHBOARD_URL` env var, not the merged path.
**How to avoid:** Update `DASHBOARD_URL` in Strapi's `.env` to `FRONTEND_URL` AND update the url patterns to include the `/dashboard/` prefix (e.g., `${process.env.FRONTEND_URL}/dashboard/ads/${id}`). This requires a Strapi code change in `lifecycles.ts` and `payment/services/`.
**Warning signs:** Admin gets email with "Ver anuncio" link returning 404.

### Pitfall 6: Dashboard layout resolveActiveMenu using wrong paths
**What goes wrong:** Dashboard layout's `resolveActiveMenu` checks `path.startsWith("/articles")` etc. After pages move to `/dashboard/articles`, this check always falls through to `"default"`, causing the wrong sidebar panel to show.
**Why it happens:** Path prefix changed but the function was not updated.
**How to avoid:** Update all `startsWith` checks to include `/dashboard/` prefix (see Architecture Patterns section). Add automated route test or visual smoke test.
**Warning signs:** Sidebar always shows the default panel regardless of current section.

### Pitfall 7: SCSS @use Dependencies Missing in Dashboard-Only Files
**What goes wrong:** 18 dashboard-only SCSS files use `@extend .container` but do not have `@use "../base/container"` at the top. In the dashboard they compiled because the container module was already loaded by another file in the same compilation context. When these files are copied standalone into website and imported from `app.scss`, the `@extend .container` reference fails with "Undefined variable or selector."
**Why it happens:** Cross-file `@extend` is fragile — it relies on the target selector being loaded elsewhere in the same compilation. The dashboard's `app.scss` included the container module early; website's may load these new files in a different order.
**How to avoid:** Add `@use "../base/container"` as the first line of all 18 affected dashboard-only files when copying them. The list is in the SCSS section above. Verify with `yarn workspace waldo-website build`.
**Warning signs:** Sass compilation error "Can't extend .container: it's not defined" after Wave 4.

---

## Code Examples

### Verified: website's strapi auth.populate includes role
```typescript
// apps/website/nuxt.config.ts (verified at lines 303-314)
strapi: {
  auth: {
    populate: [
      "role",        // role IS populated on SSR — guard can check role.name
      "commune",
      "region",
      "business_region",
      "business_commune",
    ],
  },
}
```

### Verified: website's User type has role field
```typescript
// apps/website/app/types/user.d.ts (verified at lines 66-70)
role?: {
  id: number;
  name: string;
  type: string;
};
```

### Dashboard composables to MIGRATE (copy, don't drop)
```typescript
// These 3 composables have no website equivalent — copy into website:
// apps/dashboard/app/composables/useExportCsv.ts  → uses useApiClient, useSettingsStore, useSweetAlert2
// apps/dashboard/app/composables/useServices.ts   → uses runtimeConfig.public.websiteUrl
// apps/dashboard/app/composables/useSlugify.ts    → wraps slugify package
```

### Dashboard composables to DROP (not copy)
```typescript
// These 4 session composables are replaced by @nuxtjs/strapi equivalents:
// useSessionUser.ts   → useStrapiUser()
// useSessionToken.ts  → useStrapiToken()
// useSessionAuth.ts   → useStrapiAuth()
// useSessionClient.ts → useApiClient() [with qs caveat above]

// These composables exist in both apps — website's version wins:
// useApiClient.ts, useImage.ts, useLogger.ts, useLogout.ts, useRut.ts,
// useSanitize.ts, useSweetAlert2.ts
```

### SCSS double @use — confirmed safe for colliding files
Verified from actual file inspection: website's `_loading.scss` already has `@use "../abstracts/animations"` — the same import dashboard's version needs. For all 28 colliding SCSS files, the website version's `@use` block already covers what the appended `&--dashboard` modifier block requires. No `@use` additions needed for the append operation. The `@use` risk is confined to the dashboard-only files (copy operation), not the collision append operation.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dashboard used custom `useSessionX` composables | Website uses `@nuxtjs/strapi` module | Phase 109 (dashboard), now merging back | Drop 4 composables + 1 plugin |
| Dashboard `guard.global.ts` checks all routes | New guard uses `startsWith("/dashboard")` fast-exit | This phase | No overhead on public website routes |
| `MenuUser.vue` links to external `dashboardUrl` | Internal `NuxtLink to="/dashboard"` | This phase | No cross-origin navigation; SSR-compatible link |
| Dashboard had its own SSR guard with explicit role-skip | Under `@nuxtjs/strapi`, role IS populated on SSR | This phase | The skip is now fail-open, not load-bearing |

---

## Open Questions

1. **Strapi `context: "dashboard"` password reset flow**
   - What we know: `FormForgotPasswordDashboard.vue` (renamed) sends `context: "dashboard"`, triggering Strapi to build a reset URL at `DASHBOARD_URL/auth/reset-password`. After merge, that path is `/restablecer-contrasena` on the website.
   - What's unclear: Should the Strapi authController be patched to treat `context: "dashboard"` the same as `context: "website"` (pointing to the single reset page)? Or should the migrated component be updated to send `context: "website"`?
   - Recommendation: Update the migrated `FormForgotPasswordDashboard.vue` to send `context: "website"`. This is a single-line change with no Strapi code change required.

2. **Dashboard's `robots: { disallow: "/" }` vs website's detailed robots config**
   - What we know: Website's robots config doesn't currently include `/dashboard/**` in the disallow list.
   - What's unclear: The CONTEXT.md doesn't mention this.
   - Recommendation: Add `/dashboard/**` to website's robots `disallow` array to prevent search engine indexing of admin pages.

3. **Dashboard's `routeRules` after merge**
   - What we know: 22 Spanish→English redirect rules exist in `apps/dashboard/nuxt.config.ts`. These conflict with website's public Spanish routes (`/anuncios` already points to a public page).
   - Recommendation: Drop all dashboard routeRules — they only serve manager muscle memory and clash with website's public routes.

4. **SSR role-check skip is now fail-open (locked decision 3 honored but rationale changed)**
   - What we know: The original dashboard guard's SSR skip (`if (!roleName) return`) was justified by "role is only populated client-side." Under `@nuxtjs/strapi`, this is no longer true — `auth.populate: ["role"]` means role IS available on SSR after `fetchUser()`. The skip is now fail-open: a manager whose `useStrapiUser()` temporarily returns null (e.g., hydration window) passes through the guard without a redirect, then on the next navigation cycle the guard fires again client-side with role populated. This is the same behavior as the original design but for a different reason.
   - What's unclear: Whether the planner/user wants fail-closed behavior instead (null role → treat as non-manager → redirect to `/login`).
   - Recommendation: Honor the lock (keep the SSR skip). If a security review is needed, test: navigate to `/dashboard/ads` directly (no session) on SSR — guard should redirect to `/login`. Navigate as a logged-in non-manager — guard should redirect to `/`. The `if (!roleName) return` only affects the window where `useStrapiUser()` is momentarily null during hydration transfer; the client-side re-run will enforce the role check.
   - Evidence: `onboarding-guard.global.ts` runs on both SSR and client and already relies on `useStrapiUser()` returning a populated user after `await fetchUser()`. The same pattern is safe for the dashboard guard.

5. **GTM container ID divergence**
   - What we know: Website uses `GTM-N4B8LDKS`. Dashboard uses `GTM-TC8LS8NQ`.
   - What this means: After merge, all dashboard pages will be tracked under website's GTM container (`GTM-N4B8LDKS`) since they inherit website's `nuxt.config.ts`. Dashboard events currently flowing to `GTM-TC8LS8NQ` will stop.
   - Recommendation: Confirm with the team this is intended. Dashboard pages are admin-only — tracking is optional. If dashboard-specific analytics are needed, the GTM container merge is a separate concern outside this phase's scope.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @nuxt/test-utils |
| Config file | `apps/website/vitest.config.ts` (or `nuxt.config.ts` module integration) |
| Quick run command | `yarn workspace waldo-website test --run` |
| Full suite command | `yarn workspace waldo-website test --run --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Manager user redirected to /dashboard after OTP verify | unit (stub `useStrapiUser` to manager role, assert `navigateTo('/dashboard')`) | `yarn workspace waldo-website test --run tests/components/FormVerifyCode.test.ts` | ❌ Wave 0 |
| AUTH-02 | Non-manager redirected to /anuncios after OTP verify | unit (stub `useStrapiUser` to regular role) | `yarn workspace waldo-website test --run tests/components/FormVerifyCode.test.ts` | ❌ Wave 0 |
| GUARD-01 | dashboard-guard redirects unauthenticated to /login for /dashboard/** | unit | `yarn workspace waldo-website test --run tests/middleware/dashboard-guard.test.ts` | ❌ Wave 0 |
| GUARD-02 | dashboard-guard redirects non-manager to / for /dashboard/** | unit | `yarn workspace waldo-website test --run tests/middleware/dashboard-guard.test.ts` | ❌ Wave 0 |
| GUARD-03 | onboarding-guard does NOT redirect managers at /dashboard/** | unit | `yarn workspace waldo-website test --run tests/middleware/onboarding-guard.test.ts` | ❌ Wave 0 |
| SCSS-01 | No Sass compilation errors after SCSS merge | build | `yarn workspace waldo-website build` | — |
| TYPE-01 | Website typecheck passes after all components migrated | build | `yarn workspace waldo-website nuxi typecheck` | — |

AUTH-01 and AUTH-02 are automatable using `vi.stubGlobal("useStrapiUser", () => ({ value: { role: { name: "manager" } } }))` pattern (consistent with how STATE.md (109-01) documents auto-import stubs with `vi.stubGlobal`).

### Sampling Rate
- **Per task commit:** `yarn workspace waldo-website nuxi typecheck`
- **Per wave merge:** `yarn workspace waldo-website test --run`
- **Phase gate:** Full typecheck + test suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/website/tests/components/FormVerifyCode.test.ts` — covers AUTH-01, AUTH-02
- [ ] `apps/website/tests/middleware/dashboard-guard.test.ts` — covers GUARD-01, GUARD-02
- [ ] `apps/website/tests/middleware/onboarding-guard.test.ts` — add GUARD-03 case to existing file (if it exists) or create new

---

## Sources

### Primary (HIGH confidence — verified from actual project files)
- `apps/website/nuxt.config.ts` — strapi auth.populate, vite optimizeDeps, runtimeConfig, robots
- `apps/dashboard/nuxt.config.ts` — typeCheck: false, vite optimizeDeps, routeRules, GTM container ID
- `apps/website/package.json` vs `apps/dashboard/package.json` — package diff
- `apps/dashboard/app/middleware/guard.global.ts` — SSR role check pattern
- `apps/website/app/middleware/onboarding-guard.global.ts` — exempt path pattern, SSR fetchUser behavior
- `apps/website/app/components/FormVerifyCode.vue` — manager redirect insertion point
- `apps/dashboard/app/layouts/dashboard.vue` — resolveActiveMenu function
- `apps/website/app/types/user.d.ts` — User interface with role shape
- `apps/dashboard/app/composables/useSession*.ts` — 4 composables to drop
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — DASHBOARD_URL usage
- `apps/strapi/src/api/ad/content-types/ad/lifecycles.ts` — DASHBOARD_URL in email
- `apps/strapi/config/middlewares.ts` — CORS DASHBOARD_URL
- `turbo.json` + root `package.json` — waldo-dashboard workspace entries
- `apps/dashboard/ecosystem.config.cjs` — pm2 process name
- `apps/website/app/components/MenuUser.vue` — dashboardUrl external link
- `apps/dashboard/app/scss/components/` — @extend .container usage in 18+ files
- `apps/website/app/scss/components/_hero.scss`, `_loading.scss` — @use dep baseline check

### Secondary (MEDIUM confidence)
- Nuxt 4 auto-import collision behavior: based on framework internals + practical observation that last-scanned wins; recommend avoiding the scenario entirely.
- `vi.stubGlobal` test pattern for `useStrapiUser`: based on STATE.md (109-01) documentation of auto-import stubs.

---

## Metadata

**Confidence breakdown:**
- Package diff: HIGH — verified from both `package.json` files
- SCSS collision list: HIGH — verified from actual directory listings
- Component collision count: HIGH — 28 verified (CONTEXT.md off-by-one documented)
- Role populate on SSR: HIGH — confirmed in `nuxt.config.ts` `auth.populate`
- SSR role skip fail-open status: HIGH — confirmed `onboarding-guard` runs SSR+client successfully with same pattern
- DASHBOARD_URL runtime impact: HIGH — grep across all Strapi source files
- TypeCheck escalation risk: HIGH — dashboard nuxt.config explicitly disables it
- SCSS @use dep risk: HIGH — verified 18 dashboard-only files use `@extend .container` without `@use "../base/container"`
- SCSS double @use safety for colliding files: HIGH — both apps already compile with matching `@use` blocks
- GTM container divergence: HIGH — both nuxt.config files read directly

**Research date:** 2026-06-10
**Valid until:** 2026-07-10 (stable libraries; Nuxt 4 / @nuxtjs/strapi v2 APIs unlikely to change)

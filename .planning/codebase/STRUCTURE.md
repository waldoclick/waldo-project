# Codebase Structure

**Analysis Date:** 2026-06-10

## Directory Layout

```
waldo-project/
├── apps/
│   ├── website/                  # Nuxt 4 app (public site + admin dashboard)
│   │   ├── app/                  # Nuxt 4 app directory (compatibilityVersion: 4)
│   │   │   ├── components/       # 239 auto-imported Vue components
│   │   │   ├── composables/      # Auto-imported composables
│   │   │   ├── layouts/          # Nuxt layouts (default, auth, dashboard, onboarding, account)
│   │   │   ├── middleware/       # Route middleware (auth, dashboard-guard, wizard-guard, etc.)
│   │   │   ├── pages/            # File-based routing
│   │   │   ├── plugins/          # Nuxt plugins (client + universal)
│   │   │   ├── scss/             # Global SCSS (abstracts, base, components)
│   │   │   ├── shared/           # Shared constants
│   │   │   ├── stores/           # Pinia stores
│   │   │   ├── types/            # TypeScript type declarations (.d.ts)
│   │   │   ├── utils/            # Pure utility functions (auto-imported)
│   │   │   ├── content/          # Static JSON content (FAQ, howto, packs)
│   │   │   ├── data/             # Static data (countries.json)
│   │   │   └── locales/          # i18n locale files (es.json)
│   │   ├── server/               # Nitro server (proxy/security layer)
│   │   │   ├── api/              # Nitro API handlers
│   │   │   ├── routes/           # Nitro route handlers (sitemap.xml)
│   │   │   └── utils/            # Server utilities (recaptcha.ts)
│   │   ├── public/               # Static assets
│   │   │   ├── emails/           # Email asset images
│   │   │   ├── favicons/
│   │   │   ├── images/           # Static images (transbank logos, etc.)
│   │   │   └── json/             # Public JSON data
│   │   ├── tests/                # All test files (mirrors app/ structure)
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   ├── middleware/
│   │   │   ├── pages/
│   │   │   ├── plugins/
│   │   │   ├── server/
│   │   │   ├── stores/
│   │   │   └── stubs/
│   │   └── nuxt.config.ts
│   │
│   └── strapi/                   # Strapi v5 backend
│       ├── src/
│       │   ├── api/              # 31 API modules (routes + controllers + services + schema)
│       │   ├── services/         # 20 external integration service directories
│       │   ├── middlewares/      # Global Koa middlewares
│       │   ├── cron/             # Scheduled job implementations
│       │   ├── policies/         # Authorization policies
│       │   ├── extensions/       # Plugin overrides (users-permissions)
│       │   ├── bootstrap/        # One-time migration scripts
│       │   ├── mjml/             # MJML email templates
│       │   ├── types/            # Global TypeScript declarations
│       │   └── utils/            # Shared utilities (logtail logger)
│       ├── config/               # Strapi configuration files
│       ├── database/
│       │   └── migrations/       # Knex migration files
│       ├── seeders/              # DB seed scripts
│       ├── tests/                # All test files (mirrors src/ structure)
│       ├── public/               # Strapi public assets (uploads, email images)
│       ├── backups/              # Database backup output directory
│       └── types/generated/      # Auto-generated Strapi types
│
├── .planning/                    # GSD planning documents
├── .github/                      # GitHub Actions / instructions
├── .husky/                       # Git hooks
├── docs/                         # Project documentation
├── data/                         # Root-level data files
├── logs/                         # Root-level log output
├── turbo.json                    # Turbo monorepo task config
├── pnpm-workspace.yaml           # pnpm workspace definition
└── package.json                  # Root package (turbo, codacy scripts)
```

## Directory Purposes

**`apps/website/app/pages/`:**

- Purpose: File-based routing. Pages are composition-only — they import and arrange components, never contain HTML sections or BEM classes directly.
- Key subdirectories: `anunciar/` (multi-step ad creation wizard), `pagar/` (checkout flow), `pro/` (PRO subscription flow), `dashboard/` (admin panel), `anuncios/` (public ad catalog), `blog/` (article listing and detail), `cuenta/` (user account pages)

**`apps/website/app/components/`:**

- Purpose: All reusable Vue components. Auto-imported by Nuxt. PascalCase filenames.
- Naming pattern: `{Context}{Role}.vue` — e.g., `AccountEdit.vue`, `AdArchive.vue`, `LightboxLogin.vue`, `FormDefault.vue`
- Each component has a corresponding SCSS file in `app/scss/components/`

**`apps/website/app/composables/`:**

- Purpose: Auto-imported reusable composable functions. All start with `use`.
- Key files: `useApiClient.ts` (always use this instead of `useStrapiClient` directly), `useOrderById.ts`, `useAdAnalytics.ts`, `useUser.ts`, `useLogout.ts`, `useNotifications.ts`

**`apps/website/app/stores/`:**

- Purpose: Pinia stores for client-side state management.
- Naming: `{domain}.store.ts`
- Key stores: `ad.store.ts` (wizard state), `me.store.ts` (current user), `filter.store.ts`, `categories.store.ts`, `packs.store.ts`, `search.store.ts`

**`apps/website/app/types/`:**

- Purpose: TypeScript type and interface declarations. `*.d.ts` for ambient types, `.ts` for exported types.
- Key files: `user.d.ts`, `ad.d.ts`, `order.ts`, `pack.d.ts`, `subscription-pro.ts`, `window.d.ts` (all Window globals go here)

**`apps/website/app/scss/`:**

- Structure: `abstracts/` (variables, mixins, animations), `base/` (reset, fonts, global), `components/` (one `_name.scss` per component)
- Main entry: imported via `nuxt.config.ts` `css` array
- Pattern: One SCSS file per component, named after the BEM block (e.g., `_header.scss` for `.header`)

**`apps/website/server/`:**

- Purpose: Nitro server layer. reCAPTCHA verification proxy and image optimization proxy. No business logic.
- Key files: `server/utils/recaptcha.ts` (token verification helper), `server/api/images/` (image proxy)
- Routes: `server/routes/sitemap.xml.ts` (dynamic sitemap generation)

**`apps/strapi/src/api/{module}/`:**

- Purpose: One directory per Strapi content type or custom endpoint.
- Structure per module: `content-types/{module}/schema.json` (schema), `controllers/{module}.ts` (HTTP handler), `routes/{module}.ts` (route definitions; custom routes prefixed `00-` load before default), `services/{module}.ts` (business logic)
- Custom endpoint modules (no content-type schema): `payment`, `filter`, `search`, `related`, `indicator`, `ia`, `cloudflare`, `google-analytics`, `auth-one-tap`, `auth-verify`, `better-stack`, `cron-runner`, `search-console`

**`apps/strapi/src/services/{service}/`:**

- Purpose: Self-contained external integration. Consumed via `index.ts` barrel import only — never import from individual files.
- Structure: `{service}.service.ts`, `{service}.types.ts`, `{service}.factory.ts` (if applicable), `index.ts`
- Key services: `payment-gateway/` (IPaymentGateway abstraction + registry), `transbank/` (Webpay Plus), `oneclick/` (Transbank Oneclick), `facto/` (electronic invoicing), `zoho/` (CRM), `mjml/` (email rendering), `gemini/`, `anthropic/`, `cerebras/`, `groq/`, `deepseek/` (AI providers), `tavily/`, `serper/` (search/research)

**`apps/strapi/src/cron/`:**

- Purpose: Cron job implementations. Registered in `apps/strapi/config/cron-tasks.ts`.
- Naming: `{domain}-{function}.cron.ts`

**`apps/strapi/src/extensions/users-permissions/`:**

- Purpose: Strapi `users-permissions` plugin extension — custom user schema fields, custom controllers for profile updates.
- Key files: `content-types/user/schema.json` (custom user fields), `controllers/` (avatar, cover, username, profile update controllers)
- Note: Custom controllers are supported here via extension pattern (different from plugin extension controllers which are not supported in Strapi v5)

**`apps/strapi/database/migrations/`:**

- Purpose: Knex migration files for schema changes.
- Naming: `YYYY.MM.DDT00.00.00.description.ts`

**`apps/strapi/tests/`:**

- Purpose: All Strapi test files. Mirrors `src/` directory structure exactly. Never co-locate test files with source files.

## Key File Locations

**Entry Points:**

- `apps/website/nuxt.config.ts` — Nuxt configuration (modules, runtime config, security, build)
- `apps/website/app/app.vue` — root Vue component
- `apps/strapi/config/cron-tasks.ts` — all cron job registrations
- `apps/strapi/config/middlewares.ts` — middleware pipeline order

**Configuration:**

- `apps/website/nuxt.config.ts` — Nuxt modules, security headers, Strapi URL, reCAPTCHA keys
- `apps/strapi/config/server.ts` — Strapi server port/host
- `apps/strapi/config/database.ts` — database connection
- `apps/strapi/config/plugins.ts` — Strapi plugin config (upload, i18n, etc.)
- `turbo.json` — monorepo task dependencies and caching
- `pnpm-workspace.yaml` — workspace package paths

**Core Business Logic:**

- `apps/strapi/src/api/payment/controllers/payment.ts` — entire payment lifecycle
- `apps/strapi/src/api/payment/services/ad.service.ts` — ad payment validation and processing
- `apps/strapi/src/api/payment/services/checkout.service.ts` — checkout flow
- `apps/strapi/src/api/payment/services/pro.service.ts` — PRO subscription logic
- `apps/strapi/src/services/payment-gateway/registry.ts` — gateway selection
- `apps/strapi/src/api/ad/services/ad.ts` — ad lifecycle (status, approval, expiry)

**Type Definitions:**

- `apps/website/app/types/user.d.ts` — User type with extended fields (pro_status, role, commune)
- `apps/website/app/types/ad.d.ts` — Ad type
- `apps/website/app/types/order.ts` — Order type
- `apps/website/app/types/window.d.ts` — Window global augmentations (all go here)
- `apps/strapi/types/generated/` — auto-generated Strapi content type types

**Shared Constants:**

- `apps/website/app/shared/constants.ts` — application-wide constants

## Naming Conventions

**Files:**

- Vue components: `PascalCase.vue` — `AdArchive.vue`, `LightboxLogin.vue`
- Pages: `kebab-case.vue` — `datos-del-producto.vue`, `gracias.vue`
- Composables: `camelCase.ts` starting with `use` — `useApiClient.ts`, `useOrderById.ts`
- Stores: `{domain}.store.ts` — `ad.store.ts`, `me.store.ts`
- SCSS: `_kebab-case.scss` in `components/` — `_header.scss`, `_lightbox.scss`
- Strapi services: `{service}.service.ts`, `{service}.types.ts`, `{service}.factory.ts`
- Strapi crons: `{domain}-{function}.cron.ts` — `ad-expiry.cron.ts`
- Strapi migrations: `YYYY.MM.DDT00.00.00.description.ts`

**Directories:**

- Strapi API modules: `kebab-case` matching content type name — `ad-featured-reservation/`, `subscription-pro/`
- Strapi service directories: `kebab-case` matching integration name — `payment-gateway/`, `google-analytics/`
- Page subdirectories: `kebab-case` Spanish words (domain-appropriate) — `anunciar/`, `anuncios/`

## Where to Add New Code

**New public page:**

- Implementation: `apps/website/app/pages/{route}/index.vue` (or `{slug}.vue` for dynamic)
- Mirror closest sibling page structure exactly before writing
- Tests: `apps/website/tests/pages/{route}/`

**New dashboard page:**

- Implementation: `apps/website/app/pages/dashboard/{section}/index.vue`
- Apply `dashboard-guard.global.ts` middleware automatically via path prefix

**New Vue component:**

- Implementation: `apps/website/app/components/{Context}{Role}.vue`
- SCSS: `apps/website/app/scss/components/_{block}.scss`
- Mirror closest equivalent component before writing

**New composable:**

- Implementation: `apps/website/app/composables/use{Name}.ts`
- Tests: `apps/website/tests/composables/use{Name}.test.ts`
- Must have 100% unit test coverage at creation time

**New Pinia store:**

- Implementation: `apps/website/app/stores/{domain}.store.ts`
- If adding `persist:`, add audit comment directly above and add cache guard to state

**New TypeScript type:**

- Simple type: `apps/website/app/types/{domain}.d.ts` or `.ts`
- Window global: add to `apps/website/app/types/window.d.ts` only

**New Strapi API module (content type):**

- Directory: `apps/strapi/src/api/{name}/`
- Required: `controllers/{name}.ts`, `routes/{name}.ts`, `services/{name}.ts`, `content-types/{name}/schema.json`
- Tests: `apps/strapi/tests/api/{name}/`

**New Strapi service (external integration):**

- Directory: `apps/strapi/src/services/{name}/`
- Required: `{name}.service.ts`, `{name}.types.ts`, `index.ts` (barrel re-export)
- Consumers import from `index.ts` only — never from individual files
- Tests: `apps/strapi/tests/services/{name}/`

**New cron job:**

- Implementation: `apps/strapi/src/cron/{domain}-{function}.cron.ts`
- Registration: add entry to `apps/strapi/config/cron-tasks.ts`
- Tests: `apps/strapi/tests/cron/`
- Audit existing crons for overlapping responsibility before creating

**New Strapi middleware:**

- Implementation: `apps/strapi/src/middlewares/{name}.ts`
- Registration: add to array in `apps/strapi/config/middlewares.ts`

**New database migration:**

- File: `apps/strapi/database/migrations/YYYY.MM.DDT00.00.00.description.ts`

**Utility functions:**

- Nuxt: `apps/website/app/utils/{name}.ts` (auto-imported by Nuxt)
- Strapi (payment domain): `apps/strapi/src/api/payment/utils/{name}.utils.ts`
- Strapi (global): `apps/strapi/src/utils/{name}.ts`

## Special Directories

**`.planning/`:**

- Purpose: GSD planning documents (milestones, phases, codebase analysis)
- Generated: No (hand-managed + AI-generated)
- Committed: Yes

**`apps/strapi/backups/`:**

- Purpose: Output directory for `bbdd-backup.cron.ts` pg_dump files
- Generated: Yes (by cron)
- Committed: No (in `.gitignore`)

**`apps/strapi/types/generated/`:**

- Purpose: Auto-generated Strapi content type TypeScript definitions
- Generated: Yes (by `strapi ts:generate-types`)
- Committed: Yes (needed for TypeScript compilation)

**`apps/strapi/public/uploads/`:**

- Purpose: Strapi media upload storage (local fallback; production uses Cloudinary)
- Generated: Yes
- Committed: No

**`apps/website/app/cypress/`:**

- Purpose: Cypress E2E test infrastructure (fixtures, support files, e2e specs)
- Generated: No
- Committed: Yes

---

Structure analysis: 2026-06-10

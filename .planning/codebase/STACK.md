# Technology Stack

**Analysis Date:** 2026-06-10

## Languages

**Primary:**

- TypeScript 5.6+ - All three apps (strict mode enabled; `typeCheck: true` in website/dashboard; `@strapi/typescript-utils` tsconfig base for Strapi)
- Vue 3 SFC with `<script setup>` - `apps/website` and `apps/dashboard` components and pages

**Secondary:**

- SCSS/Sass 1.79+ - Component-scoped styling in website/dashboard (BEM convention)
- MJML 4.16.1 - Transactional email templates in `apps/strapi/src/services/mjml/templates/`
- JavaScript (CJS) - PM2 ecosystem config files (`ecosystem.config.cjs`, `ecosystem.config.js`)

## Runtime

**Environment:**

- Node.js >=20.18.0 (website), >=20.0.0 (Strapi)
- Compatible with Node 23+ per website `engines` field

**Package Manager:**

- pnpm 11.1.1 (declared in root `package.json` → `packageManager` field)
- Lockfile: `pnpm-lock.yaml` at monorepo root

## Frameworks

**Core:**

- Nuxt 4.1.3 (`apps/website`) - SSR public-facing website with `future.compatibilityVersion: 4`
- Strapi v5.41.1 (`apps/strapi`) - Headless CMS and REST API; all business logic lives here

**Testing:**

- Vitest 3.0.9 + `@nuxt/test-utils` 3.19.2 - Website unit tests (`apps/website/vitest.config.ts`)
- Jest 29.7 + ts-jest 29.2 - Strapi unit tests (`apps/strapi/jest.config.js`)
- Cypress 14.2 - E2E framework configured (`apps/website/cypress.config.ts`); not wired into CI pipeline
- happy-dom 20 - Vitest DOM environment (website)

**Build/Dev:**

- Vite 6.2.5 - Website build tool (via Nuxt)
- Turbo 2.8.17 - Monorepo task orchestration (`turbo.json`); build order: Strapi → website
- Nitro - Website server-side runtime (proxy at `server/api/[...].ts`, Nitro routes, event handlers)
- PM2 - Production process management (`ecosystem.config.cjs` for website, `ecosystem.config.js` for Strapi)

## Key Dependencies

**Critical:**

- `@nuxtjs/strapi` 2.1.1 - Strapi v5 SDK integration for Nuxt; sole mechanism for API calls in website
- `pinia` 2.2.2 + `@pinia-plugin-persistedstate/nuxt` 1.2.1 - Store state management with persistence
- `transbank-sdk` 5.0.0 - Webpay and Oneclick payment processing (Strapi only)
- `ioredis` 5.6.0 - Redis caching middleware (`apps/strapi/src/middlewares/cache.ts`); optional in dev
- `mjml` 4.16.1 + `nunjucks` 3.2.4 - Email template rendering pipeline (Strapi)
- `vee-validate` 4.13.2 + `yup` 1.4.0 - Form validation (website)
- `dompurify` 3.3 - XSS sanitization for user-generated content (website)
- `bad-words` 4.0.0 - Profanity filtering for ad submissions (website)

**Infrastructure:**

- `better-sqlite3` 12.2.0 - SQLite driver (dev/default database for Strapi)
- `mysql2` 3.12.0 - MySQL driver (primary production database per `.env.example`)
- `pg` 8.16 - PostgreSQL driver (optional; Strapi `config/database.ts` supports all three)
- `sharp` 0.33.5 - Image processing (Strapi media uploads + Nuxt IPX provider)
- `@strapi/provider-upload-cloudinary` 5.20.0 - Cloudinary upload provider (installed but `config/plugins.ts` currently sets `local` provider)
- `@strapi/provider-email-mailgun` 5.41.1 - Transactional email delivery
- `@sentry/nuxt` 9.17.0 - Error tracking, session replay, browser profiling (website)
- `@sentry/node` 9.26.0 + `@strapi/plugin-sentry` 5.15.0 - Error tracking (Strapi, production-only)
- `winston` 3.17 + `@logtail/winston` 0.5.4 + `@logtail/node` 0.5.4 - Structured logging with Better Stack transport (`apps/strapi/src/utils/logtail/`)
- `soap` 1.1.10 - SOAP client for Facto electronic invoicing service
- `chart.js` 4.5.1 + `vue-chartjs` 5.3.3 - Analytics charts in dashboard
- `date-fns` 4.1 - Date formatting/manipulation (Strapi)
- `slugify` 1.6.6 - URL slug generation (both Strapi and website)
- `googleapis` 148.0.0 - Google Sheets API (backup export), Search Console, GA4 service accounts
- `google-auth-library` 9.0.0 - Google One Tap JWT verification

**AI/ML (all in `apps/strapi/src/services/`):**

- `@anthropic-ai/sdk` 0.78.0 - Claude (Anthropic) API client (`services/anthropic/`)
- `@google/generative-ai` 0.24.1 - Gemini API client (`services/gemini/`)
- Groq - HTTP client via `fetch` (`services/groq/`); env var `GROQ_API_KEY`
- DeepSeek - HTTP client via `fetch` (`services/deepseek/`); env var `DEEPSEEK_API_KEY`
- Cerebras - HTTP client via `fetch` (`services/cerebras/`); env var `CEREBRAS_API_KEY`
- Serper - Web search API (`services/serper/`); env var `SERPER_API_KEY`
- Tavily - Web search API (`services/tavily/`); env var `TAVILY_API_KEY`

**UI Utilities (website):**

- `lucide-vue-next` 0.486 - Icon set
- `floating-vue` 5.2.2 - Tooltips/popovers
- `sweetalert2` 11.14 - Modal dialogs
- `vue-toastification` 2.0.0-rc.5 - Toast notifications
- `vue-easy-lightbox` 1.2.2 - Image lightbox
- `vuedraggable` 4.1 - Drag-and-drop lists
- `vue-awesome-paginate` 1.2 - Pagination component
- `qrcode.vue` 3.6 - QR code generation
- `logrocket` 10.1 - Session recording (website)

## Configuration

**Environment:**

- Website: `apps/website/.env` (template: `apps/website/.env.example`)
- Strapi: `apps/strapi/.env` (template: `apps/strapi/.env.example`)
- Dashboard: `.env.dashboard` at monorepo root
- Key Strapi vars: `DATABASE_CLIENT`, `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `MAILGUN_API_KEY`, `WEBPAY_COMMERCE_CODE`, `WEBPAY_API_KEY`, `REDIS_HOST`, `SENTRY_DSN`, `GOOGLE_CLIENT_ID`, `PAYMENT_GATEWAY`
- Key website vars: `API_URL`, `BASE_URL`, `SENTRY_DSN`, `GTM_ID`, `RECAPTCHA_SITE_KEY`, `GOOGLE_CLIENT_ID`, `LOGROCKET_APP_ID`

**Build:**

- `turbo.json` - Monorepo pipeline; website build depends on `waldo-strapi#build`
- `apps/website/nuxt.config.ts` - Modules, runtime config, CSP headers, Strapi proxy routing, route rules
- `apps/strapi/config/database.ts` - Multi-client DB config (SQLite/MySQL/PostgreSQL with SSL support)
- `apps/strapi/config/plugins.ts` - Email (Mailgun), users-permissions (Google OAuth), Sentry, upload provider
- `apps/strapi/config/server.ts` - Host, port, cron tasks enabled via env `CRON_ENABLED`
- `apps/website/vitest.config.ts` - Vitest with happy-dom, alias for `@` → `app/`, stubs for `#app` and `#imports`
- `apps/strapi/jest.config.js` - Jest ts-jest preset, test roots at `<rootDir>/tests`

## Platform Requirements

**Development:**

- Node >=20.18.0
- pnpm 11.1.1 (via `corepack enable pnpm`)
- Redis optional (cache middleware in Strapi degrades gracefully; skips when unavailable)
- MySQL or SQLite for Strapi database (SQLite is default via `DATABASE_CLIENT=sqlite`)

**Production:**

- Website: Vercel (primary; `vercel.json` present at monorepo root) or self-hosted via PM2
- Strapi: Self-hosted via PM2 (`waldo-api` process, `max_memory_restart: 1G`)
- Redis required for production API response caching
- MySQL as production database (default in `.env.example`)
- Cloudflare as CDN/proxy layer (referenced in CSP headers and cache `s-maxage` strategy)

---

Stack analysis: 2026-06-10

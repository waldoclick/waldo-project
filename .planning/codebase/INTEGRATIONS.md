# External Integrations

**Analysis Date:** 2026-06-10

## APIs & External Services

**Payment Processing:**

- Transbank Webpay Plus - Credit/debit card payments (Chilean market)
  - SDK/Client: `transbank-sdk` 5.0.0
  - Auth: `WEBPAY_COMMERCE_CODE`, `WEBPAY_API_KEY`
  - Environment: `WEBPAY_ENVIRONMENT` (`integration` or `production`)
  - Adapter: `apps/strapi/src/services/payment-gateway/adapters/transbank.adapter.ts`

- Transbank Oneclick Mall - Tokenized recurring payments
  - SDK/Client: `transbank-sdk` 5.0.0
  - Auth: `ONECLICK_COMMERCE_CODE`, `ONECLICK_API_KEY`, `ONECLICK_CHILD_COMMERCE_CODE`
  - Service: `apps/strapi/src/services/oneclick/`

- Payment Gateway Registry - Abstraction layer selecting gateway via `PAYMENT_GATEWAY` env var
  - Registry: `apps/strapi/src/services/payment-gateway/registry.ts`
  - Currently only `transbank` adapter registered; designed for multi-gateway extension

**Email Delivery:**

- Mailgun - Transactional email sending
  - SDK/Client: `@strapi/provider-email-mailgun` 5.41.1
  - Auth: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_EMAIL`
  - Config: `apps/strapi/config/plugins.ts`
  - Templates: MJML + Nunjucks at `apps/strapi/src/services/mjml/templates/`
  - Send helper: `apps/strapi/src/services/mjml/send-email.ts`

**Authentication & Identity:**

- Strapi Users & Permissions - JWT-based auth with cookie `waldo_jwt`
  - Config: `apps/strapi/config/plugins.ts` → `users-permissions`
  - Session cookie: `waldo_jwt` (path `/`, maxAge configurable via `SESSION_MAX_AGE`)
  - Extended fields on registration: RUT, commune, region, business fields

- Google OAuth2 - Social login via Strapi users-permissions provider
  - Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Callback URL: `GOOGLE_CALLBACK_URL` (default `http://localhost:1337/api/connect/google/callback`)
  - Config: `apps/strapi/config/plugins.ts`
  - Website proxy: `apps/website/server/api/[...].ts` handles OAuth redirect flow

- Google One Tap - Passwordless login via JWT token verification
  - Auth: `GOOGLE_CLIENT_ID` (shared with OAuth)
  - Service: `apps/strapi/src/services/google-one-tap/`
  - API endpoint: `apps/strapi/src/api/auth-one-tap/`
  - Library: `google-auth-library` 9.0.0

**Security & Anti-Abuse:**

- Google reCAPTCHA v2 - Bot protection on public forms
  - Auth: `RECAPTCHA_SITE_KEY` (client), `RECAPTCHA_SECRET_KEY` (server-only in Nitro)
  - Website verification: `apps/website/server/utils/recaptcha.ts`
  - Strapi middleware: `apps/strapi/src/middlewares/recaptcha.ts`
  - Toggle: `RECAPTCHA_ENABLED` env var (set to `false` to skip in dev/testing)

**CRM & Customer Support:**

- Zoho CRM - Lead and contact management
  - Auth: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`
  - API URL: `ZOHO_API_URL` (default `https://www.zohoapis.com`)
  - Service: `apps/strapi/src/services/zoho/`

- Zoho SalesIQ - Live chat widget (website frontend)
  - Auth: `ZOHO_WIDGET_CODE`
  - Toggle: `ZOHO_CHAT` env var
  - CSP: `salesiq.zohopublic.com`, `salesiq.zoho.com` whitelisted in `nuxt.config.ts`

**AI & Machine Learning (all in `apps/strapi/src/services/`):**

- Anthropic Claude - LLM with web search capability
  - Auth: `ANTHROPIC_API_KEY`
  - Service: `apps/strapi/src/services/anthropic/`

- Google Gemini - LLM
  - Auth: `GEMINI_API_KEY`
  - Service: `apps/strapi/src/services/gemini/`

- Groq - Fast LLM inference (OpenAI-compatible API)
  - Auth: `GROQ_API_KEY`
  - Base URL: `https://api.groq.com/openai/v1/chat/completions`
  - Service: `apps/strapi/src/services/groq/`

- DeepSeek - LLM
  - Auth: `DEEPSEEK_API_KEY`
  - Service: `apps/strapi/src/services/deepseek/`

- Cerebras - Fast LLM inference
  - Auth: `CEREBRAS_API_KEY`
  - Base URL: `https://api.cerebras.ai/v1/chat/completions`
  - Service: `apps/strapi/src/services/cerebras/`

- Serper - Google search results API
  - Auth: `SERPER_API_KEY`
  - Service: `apps/strapi/src/services/serper/`

- Tavily - AI-optimized web search API
  - Auth: `TAVILY_API_KEY`
  - Service: `apps/strapi/src/services/tavily/`

**Analytics & Tracking:**

- Google Analytics 4 - Traffic and event analytics
  - Auth: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` (service account), `GA4_PROPERTY_ID`
  - SDK: `@google-analytics/data` 5.2.1
  - Service: `apps/strapi/src/services/google-analytics/`
  - API endpoint: `apps/strapi/src/api/google-analytics/`

- Google Search Console - Search performance data
  - Auth: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` (shared service account), `GOOGLE_SC_SITE_URL`
  - Service: `apps/strapi/src/services/search-console/`
  - API endpoint: `apps/strapi/src/api/search-console/`

- Google Tag Manager - Tag management container
  - Auth: `GTM_ID` (default `GTM-N4B8LDKS`)
  - Nuxt module: `@saslavik/nuxt-gtm` 0.1.3
  - Config: `nuxt.config.ts` → `gtm`

- LogRocket - Session recording and user analytics (website)
  - Auth: `LOGROCKET_APP_ID` (default `myogth/waldo`)
  - Package: `logrocket` 10.1

- Hotjar - Heatmaps and session recordings (referenced in CSP; loaded externally)
  - Domains: `static.hotjar.com`, `script.hotjar.com`, `vc.hotjar.io` in CSP

- Vercel Speed Insights - Core Web Vitals tracking
  - Package: `@vercel/speed-insights` 2.0.0
  - Nuxt module: `@vercel/speed-insights` in `nuxt.config.ts`

**Infrastructure & Observability:**

- Sentry - Error tracking, performance monitoring, user feedback
  - Auth: `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (source maps upload), `SENTRY_ORG`, `SENTRY_PROJECT`
  - Website: `@sentry/nuxt` 9.17.0; config at `apps/website/sentry.client.config.ts` and `apps/website/sentry.server.config.ts`
  - Strapi: `@sentry/node` 9.26.0 + `@strapi/plugin-sentry` 5.15.0; production-only

- Better Stack (Uptime) - Uptime monitoring and incident tracking
  - Auth: `BETTER_STACK_API_TOKEN`
  - Service: `apps/strapi/src/services/better-stack/`
  - API endpoint: `apps/strapi/src/api/better-stack/`

- Better Stack (Logs/Logtail) - Structured log shipping
  - Auth: `LOGTAIL_TOKEN`, `LOGTAIL_ENDPOINT`
  - Integration: Winston transport via `@logtail/winston`
  - Logger singleton: `apps/strapi/src/utils/logtail/index.ts`

- Cloudflare - CDN, DDoS protection, analytics via GraphQL API
  - Auth: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`
  - Service: `apps/strapi/src/services/cloudflare/`
  - API endpoint: `apps/strapi/src/api/cloudflare/`
  - Cache strategy: Strapi sets `Cache-Control: no-store, s-maxage={TTL}` for CDN caching

- Slack - Internal notifications for new ad submissions
  - Auth: Slack Bot Token (via `SLACK_BOT_TOKEN` or equivalent; uses `https://slack.com/api/chat.postMessage`)
  - Service: `apps/strapi/src/services/slack/`

**External Data Providers:**

- mindicador.cl - Chilean economic indicators (UF, USD, EUR, UTM, IPC)
  - No API key required (public API)
  - Base URL: `https://mindicador.cl/api`
  - Service: `apps/strapi/src/services/indicador/`
  - Caches to filesystem at `data/indicators.json`; refreshes daily

- OpenWeatherMap - Weather data by Chilean commune
  - Auth: `OPENWEATHERMAP_API_KEY` (accessed as `apiKey` in service)
  - Service: `apps/strapi/src/services/weather/`
  - Caches to filesystem at `data/weather.json`

- Facto - Electronic invoicing via SOAP
  - Auth: `FACTO_URL`, `FACTO_USER`, `FACTO_PASSWORD`
  - Client: `soap` 1.1.10 with BasicAuth security
  - Service: `apps/strapi/src/services/facto/`

**Google Platform:**

- Google Fonts - Poppins (100–900 weights)
  - Module: `@nuxtjs/google-fonts` 3.2.2
  - Served locally (downloaded at build time; `download: true`)

- Google Spreadsheet - Database backup export destination
  - Auth: `GOOGLE_SPREADSHEET_ID`, shared `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY`
  - SDK: `googleapis` 148.0.0
  - Used in: `apps/strapi/src/services/google/`

## Data Storage

**Databases:**

- MySQL (production default) - Primary relational database for Strapi content
  - Connection: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
  - Client package: `mysql2` 3.12.0
  - Pool: min 2, max 10 (configurable via `DATABASE_POOL_MIN/MAX`)
  - Config: `apps/strapi/config/database.ts`

- SQLite (development default) - Local development database
  - File: `.tmp/data.db` (relative to Strapi root)
  - Client package: `better-sqlite3` 12.2.0

- PostgreSQL (optional) - Supported but not the default
  - Client package: `pg` 8.16

**File Storage:**

- Local filesystem (current active provider) - Media uploads stored on disk
  - Config: `apps/strapi/config/plugins.ts` → `upload.config.provider: "local"`

- Cloudinary (installed, not active) - Cloud media storage
  - Package: `@strapi/provider-upload-cloudinary` 5.20.0
  - Would require `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`

**Caching:**

- Redis (optional) - API response cache layer in Strapi
  - Connection: `REDIS_HOST` (default `localhost`), `REDIS_PORT` (default `6379`), `REDIS_PASSWORD`
  - TTL: `REDIS_TTL` (default 14400 seconds / 4 hours)
  - Enable flag: `REDIS_ENABLED`
  - Middleware: `apps/strapi/src/middlewares/cache.ts`
  - Excluded routes: `/api/admin`, `/api/auth`, `/api/orders`, `/api/users`
  - Invalidation: cache keys for a collection are purged on POST/PUT/DELETE/PATCH

## Authentication & Identity

**Auth Provider:**

- Strapi Users & Permissions plugin - Custom JWT auth with cookie storage
  - Cookie name: `waldo_jwt`
  - Cookie maxAge: `SESSION_MAX_AGE` (default 604800 seconds / 1 week)
  - Cookie domain: `COOKIE_DOMAIN` (unset for local; `.waldo.click` for production)
  - Populate on login: `role`, `commune`, `region`, `business_region`, `business_commune`

- Google OAuth2 + One Tap - Social auth via Strapi provider and custom One Tap endpoint

## Monitoring & Observability

**Error Tracking:**

- Sentry (website + Strapi) - Production-only; disabled in dev/CI
- Sample rates: 10% traces, 5% session replays, 10% error replays, 10% profiles (website)

**Logs:**

- Winston + Logtail transport (Strapi) - Structured JSON logs shipped to Better Stack
- Logger singleton at `apps/strapi/src/utils/logtail/index.ts`

**Uptime:**

- Better Stack monitors polled via `apps/strapi/src/services/better-stack/`

## CI/CD & Deployment

**Hosting:**

- Website: Vercel (primary); `vercel.json` at monorepo root; build command: `pnpm --filter waldo-website run build`
- Strapi: Self-hosted Linux server via PM2; process name `waldo-api`

**CI Pipeline:**

- Not detected (no `.github/workflows/` or equivalent CI config found)
- TypeScript check disabled in CI: `typeCheck: !process.env.CI` in `nuxt.config.ts`

## Webhooks & Callbacks

**Incoming:**

- `POST /api/payment/confirm` - Webpay payment confirmation callback (Transbank calls this after transaction)
- `GET /api/payment/cancel` - Webpay cancellation callback
- `GET /api/connect/google/callback` - Google OAuth2 callback (proxied from website to Strapi)

**Outgoing:**

- Strapi webhooks: `WEBHOOKS_POPULATE_RELATIONS=false` in `config/server.ts`; outgoing webhook endpoints configurable in Strapi admin

## Environment Configuration

**Required Strapi env vars (production):**

- `DATABASE_CLIENT`, `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`
- `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_EMAIL`
- `WEBPAY_COMMERCE_CODE`, `WEBPAY_API_KEY`, `WEBPAY_ENVIRONMENT`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `SENTRY_DSN`

**Required website env vars (production):**

- `API_URL`, `BASE_URL`
- `GTM_ID`
- `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
- `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- `GOOGLE_CLIENT_ID`

**Secrets location:**

- `.env` files at app roots (gitignored)
- Template files: `apps/strapi/.env.example`, `apps/website/.env.example`

---

Integration audit: 2026-06-10

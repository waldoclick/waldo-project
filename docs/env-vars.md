# Environment Variables

Complete reference for all environment variables across the three apps. Copy `.env.example` from each app as a starting point. Never commit `.env` files to the repository.

Rotate secrets immediately if they are accidentally exposed. `APP_KEYS`, `JWT_SECRET`, and Transbank keys must each be treated as production credentials.

---

## apps/website

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `API_URL` | server | yes | Strapi base URL for SSR requests (e.g. `http://localhost:1337`) |
| `BASE_URL` | public | yes | Public website base URL (e.g. `http://localhost:3000`). Used for SEO, sitemap, and the Nitro proxy target. |
| `RECAPTCHA_SITE_KEY` | public | yes | Google reCAPTCHA v3 site key (client-side) |
| `RECAPTCHA_SECRET_KEY` | server | yes | Google reCAPTCHA v3 secret key (server-side Nitro proxy only) |
| `GTM_ID` | public | no | Google Tag Manager container ID (defaults to `GTM-N4B8LDKS`) |
| `SENTRY_DSN` | public | no | Sentry DSN for frontend error tracking |
| `SENTRY_ORG` | server | no | Sentry organization slug (build-time source map upload) |
| `SENTRY_PROJECT` | server | no | Sentry project slug (build-time source map upload) |
| `SENTRY_AUTH_TOKEN` | server | no | Sentry auth token (build-time source map upload) |
| `SENTRY_FEEDBACK` | server | no | Set to `"true"` to enable Sentry user feedback widget |
| `SENTRY_DEBUG` | server | no | Set to `"true"` to enable verbose Sentry logging |
| `DEV_MODE` | server | no | Set to `"true"` to enable development access restriction (all routes require `/dev` login) |
| `DEV_USERNAME` | server | no | Username for `DEV_MODE` login |
| `DEV_PASSWORD` | server | no | Password for `DEV_MODE` login |

---

## apps/dashboard

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `API_URL` | server | yes | Strapi base URL for SSR requests (e.g. `http://localhost:1337`) |
| `BASE_URL` | public | yes | Public dashboard base URL (e.g. `http://localhost:3001`). Used for SEO and the Nitro proxy target. |
| `RECAPTCHA_SITE_KEY` | public | yes | Google reCAPTCHA v3 site key (client-side) |
| `RECAPTCHA_SECRET_KEY` | server | yes | Google reCAPTCHA v3 secret key (server-side Nitro proxy only) |
| `COOKIE_DOMAIN` | server | no | Cookie domain for `waldo_jwt` session cookie (e.g. `.waldo.click` for cross-subdomain sharing) |
| `GTM_ID` | public | no | Google Tag Manager container ID (defaults to `GTM-TC8LS8NQ`) |
| `SENTRY_DSN` | public | no | Sentry DSN for frontend error tracking |
| `SENTRY_ORG` | server | no | Sentry organization slug (build-time source map upload) |
| `SENTRY_PROJECT` | server | no | Sentry project slug (build-time source map upload) |
| `SENTRY_AUTH_TOKEN` | server | no | Sentry auth token (build-time source map upload) |
| `SENTRY_FEEDBACK` | server | no | Set to `"true"` to enable Sentry user feedback widget |
| `SENTRY_DEBUG` | server | no | Set to `"true"` to enable verbose Sentry logging |

---

## apps/strapi

### Core

| Variable | Required | Purpose |
| --- | --- | --- |
| `HOST` | yes | Bind address (typically `0.0.0.0`) |
| `PORT` | yes | Strapi port (typically `1337`) |
| `APP_URL` | yes | Public Strapi URL (e.g. `http://localhost:1337`) |
| `APP_KEYS` | yes | Comma-separated list of 4 random strings — used for session signing |
| `API_TOKEN_SALT` | yes | Salt for API token generation |
| `ADMIN_JWT_SECRET` | yes | Secret for Strapi admin panel JWT |
| `TRANSFER_TOKEN_SALT` | yes | Salt for Strapi transfer tokens |
| `JWT_SECRET` | yes | Secret for user JWT (authentication tokens) |

### Database

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_CLIENT` | yes | Database driver (`postgres` or `mysql`) |
| `DATABASE_HOST` | yes | Database server hostname |
| `DATABASE_PORT` | yes | Database server port (PostgreSQL: `5432`, MySQL: `3306`) |
| `DATABASE_NAME` | yes | Database name |
| `DATABASE_USERNAME` | yes | Database user |
| `DATABASE_PASSWORD` | yes | Database password |
| `DATABASE_SSL` | no | Set to `"true"` to enable SSL for the database connection |

### Frontend URLs

| Variable | Required | Purpose |
| --- | --- | --- |
| `FRONTEND_URL` | yes | Website base URL — used in email links and payment redirects |
| `DASHBOARD_URL` | yes | Dashboard base URL — used in password reset email links |

### Payment (Transbank)

| Variable | Required | Purpose |
| --- | --- | --- |
| `WEBPAY_COMMERCE_CODE` | yes | Webpay Plus commerce code |
| `WEBPAY_API_KEY` | yes | Webpay Plus API key |
| `WEBPAY_ENVIRONMENT` | yes | `"integration"` or `"production"` |
| `ONECLICK_COMMERCE_CODE` | yes | Oneclick Mall parent commerce code |
| `ONECLICK_API_KEY` | yes | Oneclick Mall API key |
| `ONECLICK_ENVIRONMENT` | yes | `"integration"` or `"production"` |
| `ONECLICK_CHILD_COMMERCE_CODE` | yes | Oneclick Mall child commerce code (used for charges) |
| `PRO_ENABLE` | no | Set to `"true"` to enable PRO subscription feature (default: `false`) |
| `PRO_MONTHLY_PRICE` | no | Monthly PRO price in Chilean pesos (e.g. `9990`) |

### Email (Mailgun)

| Variable | Required | Purpose |
| --- | --- | --- |
| `MAILGUN_API_KEY` | yes | Mailgun API key |
| `MAILGUN_DOMAIN` | yes | Mailgun sending domain |
| `MAILGUN_EMAIL` | yes | From address for transactional emails |

### Google (OAuth + Analytics + Search Console)

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | yes | Google OAuth client ID — used for OAuth sign-in and One Tap token verification |
| `GOOGLE_CLIENT_SECRET` | yes | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | yes | OAuth redirect URI (e.g. `http://localhost:3000/login/google`) |
| `GOOGLE_CLIENT_EMAIL` | no | Service account email — shared between Search Console and GA4 integrations |
| `GOOGLE_PRIVATE_KEY` | no | Service account private key (PEM format with `\n` newlines) |
| `GOOGLE_SC_SITE_URL` | no | Search Console site URL (e.g. `sc-domain:waldo.click`) |
| `GA4_PROPERTY_ID` | no | Google Analytics 4 property ID |
| `GOOGLE_SPREADSHEET_ID` | no | Google Spreadsheet ID for reporting exports |

### Cloudflare

| Variable | Required | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | no | Cloudflare API token with Analytics read permission |
| `CLOUDFLARE_ZONE_ID` | no | Cloudflare Zone ID for the production domain |

### Sentry

| Variable | Required | Purpose |
| --- | --- | --- |
| `SENTRY_DSN` | no | Sentry DSN for Strapi error tracking |

### AI Integrations

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | no | Google Gemini API key |
| `DEEPSEEK_API_KEY` | no | DeepSeek API key |
| `ANTHROPIC_API_KEY` | no | Anthropic Claude API key |
| `TAVILY_API_KEY` | no | Tavily search API key |
| `SERPER_API_KEY` | no | Serper search API key |

### CRM

| Variable | Required | Purpose |
| --- | --- | --- |
| `ZOHO_CLIENT_ID` | no | Zoho CRM OAuth client ID |
| `ZOHO_CLIENT_SECRET` | no | Zoho CRM OAuth client secret |
| `ZOHO_REFRESH_TOKEN` | no | Zoho CRM refresh token |
| `ZOHO_API_URL` | no | Zoho CRM API base URL |

### Redis (optional caching)

| Variable | Required | Purpose |
| --- | --- | --- |
| `REDIS_ENABLED` | no | Set to `"true"` to enable Redis caching (default: `false`) |
| `REDIS_HOST` | no | Redis server hostname (default: `127.0.0.1`) |
| `REDIS_PORT` | no | Redis server port (default: `6379`) |
| `REDIS_PASSWORD` | no | Redis password (leave empty if none) |
| `REDIS_TTL` | no | Cache TTL in seconds (default: `14400`) |

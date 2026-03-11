# External Integrations

**Analysis Date:** 2026-03-10

## APIs & External Services

**CMS:**
- Strapi - Primary backend CMS/API powered by `@nuxtjs/strapi` package
  - SDK/Client: `@nuxtjs/strapi`
  - Auth: Handles JWT via cookies (`waldo_jwt` and `waldo_dashboard_jwt`)

**Error Tracking:**
- Sentry - Monitors and tracks errors across both frontend apps
  - SDK/Client: `@sentry/nuxt`
  - Auth: Utilizes `SENTRY_DSN` via environment variables

**Payment Gateway:**
- Transbank (Webpay) - Handles payment flow for the Chilean market
  - SDK/Client: `transbank-sdk`
  - Configured via environment variables: `WEBPAY_API_KEY`, `WEBPAY_COMMERCE_CODE`
- Flow - Alternative gateway/"back-office" level compatibility with payment providers
  - SDK/Client: RESTful services provided via `FLOW_API_KEY` and `FLOW_SECRET_KEY`

**Authentication:**
- Google OAuth2 - Used for admin dashboards and user login through `googleapis` library
  - Primary env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CREDENTIAL_PATHS` define scope/files

## Data Storage

**Databases:**
- MySQL v8.0/PG connectors are supported; available configurations within environments.
  - ORM: natively structured; SQL JOIN rules reflected JSON response.

**File Storage Providers/Inline-CDNs:**
Directly configured `bucket/lifecycle` subapartment standards for civic local-run hosting img-min Google LazyLoad again Desktop extendmaps
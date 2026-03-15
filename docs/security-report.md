# Waldo Security Audit Report

**Date:** 2026-03-15
**Scope:** apps/strapi (Strapi v5), apps/website (Nuxt 4), apps/dashboard (Nuxt 4)
**Auditor:** Claude Code (automated static analysis)

---

## Executive Summary

Waldo's security posture presents a mixed picture: the core payment flow is well-implemented (using Strapi `documentId` throughout, idempotency in Webpay callbacks, and proper auth guards in payment controllers), and the 2-step authentication system shows careful design with attempt limiting, expiry enforcement, and rate-limiting for resend. However, several critical gaps exist that require immediate attention.

The most urgent risk is the combination of **unauthenticated AI endpoints** (4 endpoints proxying to Anthropic Claude, Google Gemini, Groq, and DeepSeek — all paid APIs) with **no Cloudflare rate limiting currently in place**. An attacker who discovers these endpoints can run unlimited paid API calls and drain API budgets within hours. Similarly, the **cron-runner endpoint** (`POST /api/cron-runner/:name`) has no code-level auth policy — it relies solely on Strapi Admin panel permissions, but if the Admin panel is accessible, an attacker can trigger database backups, user migrations, and other high-impact tasks. The **Tavily search endpoint** (`POST /api/search/tavily`) is in the same category — no auth, proxies to a paid external API.

Priority actions: (1) Immediately add `auth: { scope: ['authenticated'] }` or an `isAuthenticated` policy to AI/search/cron-runner routes; (2) deploy Cloudflare rate limiting rules before any other hardening; (3) verify the `.env` has never been committed to any branch; (4) gate the `dev-login` endpoint to non-production environments. The findings below provide specific file paths and actionable fixes for every issue.

---

## Severity Legend

| Severity | Definition |
|----------|-----------|
| 🔴 CRITICAL | Exploitable now, direct data/money loss or full compromise |
| 🟠 HIGH | Serious risk, exploitable with moderate effort |
| 🟡 MEDIUM | Real risk, requires specific conditions |
| 🟢 LOW | Defense-in-depth improvement |
| ℹ️ INFO | Observation, no direct risk |

---

## Part 1: Security Findings

### 1.1 Secrets & Credential Exposure

**[SEC-001] `.env` file present on disk with production secrets**
- **Severity:** 🔴 CRITICAL
- **File:** `apps/strapi/.env` (confirmed present at runtime; `.gitignore` line 111 excludes it)
- **Description:** The `.env` file contains real API keys for Cloudinary, Mailgun, Webpay/Transbank, Google OAuth, Zoho CRM, Slack, Gemini, Anthropic, Serper, Tavily, DeepSeek, Groq, reCAPTCHA, Sentry, and database credentials. The `.gitignore` correctly excludes `.env`, so the file is NOT tracked in git. However, the file is present on the production server filesystem with no documented rotation policy.
- **Risk:** If the server is compromised (even read-only access via directory traversal or misconfigured file permissions), all API keys, payment gateway credentials, and database passwords are exposed. Any historical git commits should be verified with `git log --all --diff-filter=A -- apps/strapi/.env` to confirm it was never committed.
- **Fix:** (1) Rotate all secrets in `.env` as a precaution; (2) migrate to a secrets manager (Doppler, AWS Secrets Manager, or HashiCorp Vault) so secrets are injected at runtime rather than stored in flat files; (3) restrict file permissions: `chmod 600 apps/strapi/.env`; (4) add a pre-commit hook (`git-secrets` or `detect-secrets`) to block future `.env` commits.

**[SEC-002] Strapi internal URL exposed in `runtimeConfig.public`**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/website/nuxt.config.ts` (line 333), `apps/dashboard/nuxt.config.ts` (line 288)
- **Description:** `apiUrl: process.env.API_URL` is placed in `runtimeConfig.public`, which is serialized to the client-side bundle. This means the internal Strapi URL (e.g., `https://api.waldo.click:1337`) is visible to anyone who inspects the page source or JS bundles.
- **Risk:** Exposes the internal Strapi hostname and port, allowing direct API attacks that bypass the Nuxt proxy layer (and therefore bypass reCAPTCHA enforcement in Nitro). An attacker can call `https://api.waldo.click:1337/api/auth/local` directly, bypassing the proxy's reCAPTCHA middleware.
- **Fix:** Move `apiUrl` to the private `runtimeConfig` (no `.public`). Any server-side code using `apiUrl` will still work. Client-side code should use relative URLs through the proxy. Audit all `useRuntimeConfig().public.apiUrl` callers to ensure none are client-side-only.

**[SEC-003] Client-side source maps enabled in production**
- **Severity:** 🟢 LOW
- **File:** `apps/website/nuxt.config.ts` (line 430), `apps/dashboard/nuxt.config.ts` (line 417)
- **Description:** `sourcemap: { client: true, server: true }` is unconditional. Client source maps are served publicly.
- **Risk:** Source maps expose the full original TypeScript source code to anyone with browser devtools, including internal business logic, API endpoint structures, and error handling paths.
- **Fix:** `sourcemap: { client: process.env.NODE_ENV !== 'production', server: true }`. Upload source maps to Sentry via `sourceMapsUploadOptions` (already configured), then delete them from the public build output. The `sentry.sourceMapsUploadOptions` config is already present — just disable the public serving.

---

### 1.2 Authentication & Authorization

**[SEC-004] AI endpoints unauthenticated — unlimited paid API abuse**
- **Severity:** 🔴 CRITICAL
- **File:** `apps/strapi/src/api/ia/routes/ia.ts` (lines 8, 15, 22, 29)
- **Description:** All four AI endpoints (`POST /api/ia/gemini`, `/api/ia/groq`, `/api/ia/deepseek`, `/api/ia/claude`) have `policies: []` and no `auth: { scope: ... }` config. The controllers (`apps/strapi/src/api/ia/controllers/ia.ts`) perform no `ctx.state.user` check. These endpoints proxy directly to Anthropic Claude, Google Gemini, Groq, and DeepSeek — all charged per-token paid APIs.
- **Risk:** Any unauthenticated HTTP client can POST arbitrary prompts and run unlimited paid AI calls. A single attacker script could exhaust API credits in minutes. The `search/tavily` endpoint (`apps/strapi/src/api/search/routes/search.ts`) has the same issue — it proxies to Tavily (paid search API) with no auth.
- **Fix:**
  ```typescript
  // In apps/strapi/src/api/ia/routes/ia.ts — add to every route config:
  config: {
    policies: ['global::is-authenticated'],
    // OR: middlewares: [{ name: 'plugin::users-permissions.rateLimit' }]
  }
  ```
  Alternatively, add `auth: { scope: ['authenticated'] }` to each route config. Also add a check in controllers: `if (!ctx.state.user) return ctx.unauthorized('Authentication required');`.

**[SEC-005] Cron-runner endpoint has no code-level auth policy**
- **Severity:** 🔴 CRITICAL
- **File:** `apps/strapi/src/api/cron-runner/routes/cron-runner.ts` (lines 8–15)
- **Description:** `POST /api/cron-runner/:name` has no `config` property at all — no `policies`, no `auth` constraint. The file comment says "Access is controlled via Strapi Admin panel (Roles & Permissions)" but this is a content-API route, not an admin route. The controller (`apps/strapi/src/api/cron-runner/controllers/cron-runner.ts`) performs no `ctx.state.user` check. Any unauthenticated request to `POST /api/cron-runner/backup-cron` will trigger a full database backup.
- **Risk:** An attacker can trigger any of the 6 registered cron jobs (`user-cron`, `ad-cron`, `cleanup-cron`, `backup-cron`, `verification-code-cleanup`, `user-confirmed-migration`) without authentication. `backup-cron` and `user-confirmed-migration` are particularly dangerous.
- **Fix:**
  ```typescript
  // apps/strapi/src/api/cron-runner/routes/cron-runner.ts
  export default {
    routes: [{
      method: "POST",
      path: "/cron-runner/:name",
      handler: "cron-runner.run",
      config: {
        policies: ['global::is-authenticated'],
        // Additionally add admin role check in controller:
        // if (ctx.state.user?.role?.name !== 'manager') return ctx.forbidden()
      },
    }],
  };
  ```
  Also add Cloudflare IP allowlist rule to block all non-admin IPs from reaching this endpoint.

**[SEC-006] Tavily search endpoint unauthenticated — paid API abuse**
- **Severity:** 🟠 HIGH
- **File:** `apps/strapi/src/api/search/routes/search.ts` (lines 1–12)
- **Description:** `POST /api/search/tavily` has `policies: []` and the controller (`apps/strapi/src/api/search/controllers/search.ts`) performs no auth check. Tavily is a paid search API.
- **Risk:** Unlimited free Tavily searches at the operator's expense.
- **Fix:** Same as SEC-004 — add `global::is-authenticated` policy or `auth: { scope: ['authenticated'] }`.

**[SEC-007] `pendingToken` brute-force window (subtle)**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` (lines 260–327)
- **Description:** `verifyCode` looks up records by `pendingToken` (a `crypto.randomUUID()` — 122 bits of entropy). MAX_ATTEMPTS = 3 attempts before record deletion. The attempt limit is enforced per-record. However, the `pendingToken` itself is never rate-limited at the route level — an attacker with a valid `pendingToken` gets exactly 3 attempts before lockout (good), but there's no IP-level rate limiting for the `POST /api/auth/verify-code` endpoint in Strapi code. Cloudflare rate limiting (see Part 2) would mitigate this.
- **Risk:** With 3 attempts and a 6-digit code (1,000,000 possibilities), brute force is statistically impossible per-token. The main risk is that a high-volume attacker testing stolen `pendingToken` values (e.g. from a session fixation) isn't slowed by rate limiting. Low practical risk given UUID entropy.
- **Fix:** Add Cloudflare rate limiting: 10 req/300s per IP on `POST /api/auth/verify-code`. The application-level attempt limit is correctly implemented.

**[SEC-008] `proResponse` controller exposes user data without auth check**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/strapi/src/api/payment/controllers/payment.ts` (lines 413–418), `apps/strapi/src/api/payment/routes/payment.ts` (lines 52–60)
- **Description:** `GET /api/payments/pro-response` has `policies: []` and the `proResponse` handler does `const userId = ctx.state.user.id` — but `ctx.state.user` may be `null` for unauthenticated requests (route has no auth enforcement). The `const { data } = ctx.request.body` is returned directly as `ctx.body`. This is currently a stub, but the pattern is dangerous.
- **Risk:** If `ctx.state.user` is null, line 415 will throw a TypeError crash rather than return 401, leaking stack traces. The unauthenticated access pattern should be fixed before this handler is implemented.
- **Fix:** Add `auth: { scope: ['authenticated'] }` to the `pro-response` route config. The `adCreate`, `freeAdCreate`, and `checkoutCreate` handlers correctly access `ctx.state.user.id` — they also need explicit auth enforcement in the route config (currently relying on Strapi Admin permissions).

**[SEC-009] Payment routes missing explicit auth enforcement in route config**
- **Severity:** 🟠 HIGH
- **File:** `apps/strapi/src/api/payment/routes/payment.ts` (lines 12–65)
- **Description:** All payment routes (`POST /api/payments/ad`, `/api/payments/free-ad`, `/api/payments/checkout`, `GET /api/payments/webpay`, `POST /api/payments/pro`, `GET /api/payments/pro-response`) have `policies: []` and no `auth` constraint. The controllers for `adCreate`, `freeAdCreate`, `checkoutCreate` DO access `ctx.state.user.id` (which would throw if null), but this is controller-level defense, not route-level enforcement.
- **Risk:** Strapi Admin panel permissions control access. If Admin permissions are misconfigured (e.g., during a platform update or migration), all payment endpoints become unauthenticated. The `adResponse` (Webpay callback) handler intentionally uses `ctx.state.user?.id || null` — but it also doesn't validate the `token_ws` parameter against a stored transaction record before calling `processPaidWebpay(token)`.
- **Fix:** Add `auth: { scope: ['authenticated'] }` to `payments/ad`, `payments/free-ad`, `payments/checkout`, `payments/pro`. The Webpay callback (`payments/webpay`) legitimately needs no auth since Webpay POST-redirects to it.

**[SEC-010] Dashboard middleware only guards by role name string comparison**
- **Severity:** 🟢 LOW
- **File:** `apps/dashboard/app/middleware/guard.global.ts` (lines 25–31)
- **Description:** The dashboard forces logout for any user whose role is not `"manager"`. This relies on the role name being exactly `"manager"` (case-insensitive). If a Strapi admin renames the role, all legitimate admins get locked out. Also: the middleware reads `user.value?.role?.name` which requires the `role` field to be populated on the auth cookie — if the `populate` array is missing `role`, all users get kicked out.
- **Risk:** Logic flaw, not a direct security risk. A misconfiguration could lock out all admins or fail silently.
- **Fix:** Use role `id` or a dedicated boolean `is_admin` field rather than role name string. Document that the `role` must be in `auth.populate` in dashboard's strapi config (already present on line 243 of `apps/dashboard/nuxt.config.ts`).

---

### 1.3 Input Validation & Injection

**[SEC-011] MIME type validation relies on user-controlled `mimetype` field**
- **Severity:** 🟠 HIGH
- **File:** `apps/strapi/src/middlewares/upload.ts` (lines 35, 44)
- **Description:** The upload middleware validates file types by checking `f.mimetype` (the MIME type reported in the multipart form data). This value is entirely controlled by the HTTP client — any tool (curl, Burp Suite) can send a `.php` file with `Content-Type: image/jpeg` and bypass the validation.
- **Risk:** An attacker can upload arbitrary files (PHP webshells, HTML files, JavaScript files) by spoofing the `mimetype` field. If the storage provider is local (`apps/strapi/config/plugins.ts` line 72: `provider: "local"`), uploaded files are stored in `public/uploads/` and may be directly accessible via HTTP, enabling remote code execution.
- **Fix:** Use magic byte validation — read the first 8-16 bytes of the file buffer and compare against known signatures:
  - PNG: `89 50 4E 47 0D 0A 1A 0A`
  - JPEG: `FF D8 FF`
  - WebP: `52 49 46 46 ?? ?? ?? ?? 57 45 42 50`
  Use the `file-type` npm package: `const { fileTypeFromBuffer } = await import('file-type'); const type = await fileTypeFromBuffer(buffer);`. Also enforce a file size limit (recommend 5MB max).

**[SEC-012] Mass-assignment via `allowedFields` in registration**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/strapi/config/plugins.ts` (lines 20–41)
- **Description:** The `allowedFields` list includes `rut`, `birthdate`, `business_rut`, `business_address`, `business_name`, and other sensitive fields. These are bulk-assigned directly from user registration input. The `registerUserLocal` controller in `authController.ts` (line 77) explicitly extracts only `{ is_company, firstname, lastname, email, rut, password, username }` and rebuilds `ctx.request.body`, which limits the actual attack surface. However, `allowedFields` also covers OAuth registration (via `registerUserAuth`) where no field filtering occurs.
- **Risk:** A malicious registration request via OAuth (`/api/connect/google/callback`) could set arbitrary allowed fields including `business_rut`, `birthdate`, and others that should be set through a separate profile update flow.
- **Fix:** Reduce `allowedFields` to the minimum required at registration time: `['is_company', 'firstname', 'lastname', 'rut']`. Require profile completion in a separate authenticated flow for other fields.

**[SEC-013] Webpay `buy_order` parsing is injection-susceptible**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/strapi/src/api/payment/services/checkout.service.ts` (lines 150–155)
- **Description:** The `buy_order` string (e.g., `"order-{userId}-{packId}-{adId}-{featured}-{isInvoice}"`) is parsed by splitting on `-`. If any embedded value contains a `-` (e.g., a negative number, a userId with dashes), the `parts` array indices will be wrong and extract incorrect values. The `userId` from `parts[1]` will then be used to create reservations and orders.
- **Risk:** In practice, `userId` is a numeric Strapi ID (no dashes), but if the format ever changes (e.g., UUID users), parsing could extract the wrong userId and associate payments with the wrong account.
- **Fix:** Use a more robust encoding: URL-encode or base64-encode the data object and embed a single base64 blob in `buy_order`. Alternatively, use a separator that cannot appear in any field value (e.g., `|`): `order|{userId}|{packId}|{adId}|{featured}|{isInvoice}`.

**[SEC-014] `limit` parameter in related ads endpoint accepts arbitrary values**
- **Severity:** 🟢 LOW
- **File:** `apps/strapi/src/api/related/controllers/related.ts` (line 11)
- **Description:** `const limit = (ctx.query as QueryParams).limit || 16;` — the `limit` parameter is passed directly to the service without validation. An attacker could set `limit=999999` to trigger a massive DB query.
- **Risk:** Database-level DoS — a single request could lock the `ads` table for seconds with a full table scan.
- **Fix:** `const limit = Math.min(parseInt(String(ctx.query.limit) || '16', 10), 50);`

---

### 1.4 Security Headers & CSP

**[SEC-015] Strapi Admin `frameguard` disabled — clickjacking risk**
- **Severity:** 🟠 HIGH
- **File:** `apps/strapi/config/middlewares.ts` (line 34)
- **Description:** `frameguard: false` explicitly disables `X-Frame-Options` on the Strapi Admin. This means the Strapi Admin panel can be embedded in an `<iframe>` on any attacker-controlled domain.
- **Risk:** Clickjacking attacks — an attacker can overlay the Strapi Admin interface in a transparent iframe and trick an authenticated admin into clicking buttons (e.g., deleting content, changing passwords, modifying permissions).
- **Fix:** Remove `frameguard: false` (or set `frameguard: { action: 'SAMEORIGIN' }`). The comment says "Desactiva x-frame-options" without explanation — verify why it was disabled. The Strapi Admin panel should never be embeddable in external iframes.

**[SEC-016] `unsafe-inline` in script-src CSP for Strapi Admin**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/strapi/config/middlewares.ts` (line 17)
- **Description:** The Strapi Admin CSP includes `'unsafe-inline'` in `script-src`. This neutralizes CSP protection against XSS — any injected `<script>` tag or inline event handler executes without restriction.
- **Risk:** If an XSS vulnerability is found in the Strapi Admin UI (or its dependencies), `unsafe-inline` allows the attack payload to execute. Combined with the disabled X-Frame-Options (SEC-015), the admin panel is particularly vulnerable.
- **Fix:** Use nonces or hashes for inline scripts. Strapi's admin build would need to be updated to include nonce attributes. Alternatively, remove `unsafe-inline` and test whether the admin panel still works — some Strapi versions support this.

**[SEC-017] Website CSP `img-src: https:` and `connect-src: https:` wildcards**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/website/nuxt.config.ts` (lines 84–85, 99–100)
- **Description:** `"img-src": ["'self'", "data:", "blob:", "https:", ...]` and `"connect-src": ["'self'", "https:", ...]` use the `https:` wildcard, which allows loading images and making fetch requests to ANY HTTPS URL.
- **Risk:** In an XSS scenario, the attacker can exfiltrate data to any HTTPS endpoint. The `connect-src: https:` wildcard is particularly dangerous as it permits `fetch()` to arbitrary external services.
- **Fix:** Replace `"https:"` with explicit allowed domains. For images: `"img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://www.google-analytics.com"]`. Audit all image sources and XHR targets to build the explicit allowlist.

**[SEC-018] `nuxt-security` conditionally disabled in `local` mode**
- **Severity:** 🟢 LOW
- **File:** `apps/website/nuxt.config.ts` (lines 20, 36)
- **Description:** `process.env.NODE_ENV !== "local"` gates the entire `nuxt-security` module. In `local` mode, no security headers, no rate limiting, no CSP.
- **Risk:** Local development with no security headers may mask issues that only appear in production. More importantly, if `NODE_ENV=local` is set accidentally in a staging environment, security is completely disabled.
- **Fix:** This is intentional for developer convenience but should be documented. Add a startup warning log when `NODE_ENV=local`. Consider using a separate `NODE_ENV=development` value for local dev so `local` is never accidentally set on deployed servers.

---

### 1.5 CORS Configuration

**[SEC-019] `X-Mobile-App-Api-Key` in Strapi CORS `allowedHeaders`**
- **Severity:** ℹ️ INFO
- **File:** `apps/strapi/config/middlewares.ts` (line 56)
- **Description:** The `X-Mobile-App-Api-Key` header is allowed in CORS, and `apps/strapi/src/middlewares/recaptcha.ts` shows a full mobile API key validation system (`getValidMobileApiKeys`, `isValidMobileApiKey` with timing-safe comparison). This implies a mobile app bypasses reCAPTCHA by providing this key. However, the reCAPTCHA middleware is **disabled** (line 70: `// "global::recaptcha"`), so the bypass mechanism is active but the protection being bypassed is inactive.
- **Risk:** When/if reCAPTCHA is re-enabled at the Strapi level, mobile clients with the API key will bypass it. The `MOBILE_APP_API_KEYS` env variable must be set and rotated securely.
- **Fix:** Document the mobile client architecture. Verify `MOBILE_APP_API_KEYS` is set in `.env`. When reCAPTCHA is moved back to Strapi level, ensure timing-safe comparison is preserved (it is — `crypto.timingSafeEqual` is used).

**[SEC-020] CORS restricted to explicit origins (good)**
- **Severity:** ℹ️ INFO
- **File:** `apps/strapi/config/middlewares.ts` (lines 41–43)
- **Description:** CORS is correctly configured to only allow `FRONTEND_URL` and `DASHBOARD_URL` — no wildcard. The origin list is environment-driven.
- **Risk:** None — this is implemented correctly.
- **Fix:** Ensure `FRONTEND_URL` and `DASHBOARD_URL` are exact production URLs in `.env` (no trailing slashes, no wildcards). Verify with: `curl -H "Origin: https://evil.com" -I https://api.waldo.click/api/ads` — should not return `Access-Control-Allow-Origin: https://evil.com`.

---

### 1.6 Payment Security

**[SEC-021] Webpay token replay — no idempotency check before `commitTransaction`**
- **Severity:** 🟠 HIGH
- **File:** `apps/strapi/src/api/payment/services/checkout.service.ts` (lines 134–137)
- **Description:** The `processWebpayReturn(token)` function immediately calls `getPaymentGateway().commitTransaction(token)` without first checking whether this token has already been committed. If the Webpay return URL is hit twice (e.g., browser back button, double-click, network retry), `commitTransaction` will be called twice. Transbank rejects the second commit (returns a non-AUTHORIZED status), but the code between the first and second call may have already created reservations and orders.
- **Risk:** Double-charge protection relies entirely on Transbank returning a failure for the second commit. If Transbank's behavior changes or there's a race condition in the DB, a user could get two sets of ad reservations for one payment.
- **Fix:** Before calling `commitTransaction`, insert a lock record keyed on the Webpay token:
  ```typescript
  // Check for existing order with this buy_order first
  const existingOrder = await strapi.db.query("api::order.order")
    .findOne({ where: { buy_order: webpayResponse.response.buy_order } });
  if (existingOrder) {
    return { success: true, orderDocumentId: existingOrder.documentId, adId: ... };
  }
  ```
  The order creation step should be wrapped in a DB transaction. Alternatively, store the Webpay token in a `processed_tokens` table and check it before committing.

**[SEC-022] Order identity correctly uses `documentId` (payment rule compliance)**
- **Severity:** ℹ️ INFO
- **File:** `apps/strapi/src/api/payment/controllers/payment.ts` (lines 290–297), `apps/strapi/src/api/payment/services/checkout.service.ts` (lines 200–223, 361–385)
- **Description:** All redirect URLs after payment correctly use `?order=${order.documentId}`. The AGENTS.md Payment Rules are followed.
- **Risk:** None — this is implemented correctly.
- **Fix:** No action needed.

---

### 1.7 Infrastructure & Configuration

**[SEC-023] `host: "0.0.0.0"` — Strapi binds all network interfaces**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/strapi/config/server.ts` (line 5)
- **Description:** `host: env("HOST", "0.0.0.0")` binds Strapi to all available network interfaces including internal VPC interfaces, Docker bridge networks, and public interfaces.
- **Risk:** If firewall rules are misconfigured or a network interface is inadvertently exposed, Strapi becomes directly accessible without going through the Nuxt proxy. An attacker bypassing the proxy layer also bypasses reCAPTCHA enforcement (since it lives in Nitro).
- **Fix:** In production, set `HOST=127.0.0.1` in `.env` if Strapi and Nuxt run on the same host. If they run on separate hosts in a private VPC, set `HOST=<private_IP>` to bind only to the internal interface. Never bind to `0.0.0.0` in production unless explicitly required.

**[SEC-024] `proxy.koa: true` trusts all `X-Forwarded-For` headers**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/strapi/config/server.ts` (lines 13–15)
- **Description:** `proxy: { koa: true }` enables Koa's proxy trust mode, which makes `ctx.ip` return the value of the first `X-Forwarded-For` header. This is correct when behind a trusted reverse proxy, but dangerous if the Strapi port is reachable directly.
- **Risk:** If an attacker can reach Strapi directly (bypassing Cloudflare/Nginx), they can spoof their IP address by sending `X-Forwarded-For: 127.0.0.1`. Any IP-based rate limiting or logging would see the spoofed IP.
- **Fix:** Combine with SEC-023 fix — if Strapi is only bound to `127.0.0.1` or a private IP, direct access is impossible. Additionally, configure Koa's `app.proxy = true` with a trusted IP range: set `APP_PROXY_TRUST_IP_PREFIX` or use Strapi's proxy configuration to trust only Cloudflare IP ranges.

**[SEC-025] Database SSL disabled by default**
- **Severity:** 🟠 HIGH
- **File:** `apps/strapi/config/database.ts` (line 6)
- **Description:** `DATABASE_SSL: false` is the default. Unless `DATABASE_SSL=true` is set in `.env`, all database connections are unencrypted.
- **Risk:** In a cloud environment where Strapi and the database are on different hosts (e.g., Strapi on EC2, DB on RDS), database traffic traverses the network unencrypted and can be intercepted via ARP spoofing or MITM attacks within the VPC.
- **Fix:** Set `DATABASE_SSL=true` in production `.env`. For managed databases (AWS RDS, Google Cloud SQL, Supabase), also set `DATABASE_SSL_REJECT_UNAUTHORIZED=true` and provide the CA certificate. Add to `.env.example` with a note: `DATABASE_SSL=true # Required in production`.

**[SEC-026] `dev-login` endpoint always active, no environment gate**
- **Severity:** 🟠 HIGH
- **File:** `apps/website/server/api/dev-login.post.ts` (all)
- **Description:** The `dev-login.post.ts` endpoint is unconditionally present in all deployments. There is no `if (process.env.NODE_ENV !== 'production') return` guard. The endpoint is discoverable via `POST /api/dev-login`.
- **Risk:** In production, the endpoint is live and accepts `DEV_USERNAME`/`DEV_PASSWORD` credentials from `runtimeConfig`. If these env vars are set in production (even accidentally), the dev bypass mechanism is exposed. The `devmode` cookie is set with `httpOnly: false` (line 29), making it readable via JavaScript — defeating cookie security protections.
- **Fix:**
  ```typescript
  // apps/website/server/api/dev-login.post.ts — add at top of handler:
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' });
  }
  ```
  Also change `httpOnly: false` to `httpOnly: true` (the comment "NECESARIO: Permitir acceso desde JavaScript" should be implemented differently — use a separate `devMode` flag cookie instead of the session token itself).

**[SEC-027] Google OAuth dedup uses in-memory `Set` — resets on restart**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/strapi/src/middlewares/user-registration.ts` (lines 24–25, 188)
- **Description:** `const processedTokens = new Set<string>()` is a module-level variable. The deduplication logic prevents double-execution of `createInitialFreeReservations` on rapid OAuth callbacks by tracking the `access_token`. This Set resets on every Strapi restart.
- **Risk:** After a restart (e.g., rolling deploy, crash recovery), the same user completing a Google OAuth flow will have their token missing from `processedTokens` and free reservations will be created again. The code has a secondary guard (lines 280–297: checks `existingReservations.length > 0` before creating), so the actual data integrity is preserved. However, the Set approach is fragile in multi-instance deployments.
- **Fix:** The `existingReservations` check is the real guard — the Set is redundant. Remove the Set-based dedup and rely solely on the DB-level check. This also eliminates the memory leak risk (tokens accumulate indefinitely in the Set until restart).

---

### 1.8 Denial of Service

**[SEC-028] No rate limiting on AI endpoints at Strapi level — money drain risk**
- **Severity:** 🔴 CRITICAL
- **File:** `apps/strapi/src/api/ia/routes/ia.ts`, `apps/strapi/src/api/search/routes/search.ts`
- **Description:** Combined with SEC-004 (no auth) and no Cloudflare rules deployed, AI endpoints have zero rate limiting protection. Each request to `/api/ia/claude` triggers an Anthropic API call with unbounded token usage (prompt is passed as-is from request body, no token limit).
- **Risk:** A single attacker can run an infinite loop of requests, exhausting API credits for Anthropic ($), Google Gemini ($), Groq ($), DeepSeek ($), and Tavily ($) simultaneously.
- **Fix:** (1) Add auth (SEC-004); (2) Add prompt length limit in controllers: `if (prompt.length > 2000) return ctx.badRequest('Prompt too long');`; (3) Deploy Cloudflare rules (Part 2); (4) Add application-level rate limiting per user (e.g., 10 requests/hour per userId in Redis).

**[SEC-029] Image proxy endpoint has no validation — SSRF potential**
- **Severity:** 🟡 MEDIUM
- **File:** `apps/website/server/api/images/[...].ts` (lines 7–8)
- **Description:** The image proxy reads `config.public.apiUrl` (the Strapi internal URL) and appends the user-provided path: `const strapiUrl = \`${config.public.apiUrl}/uploads/${fullPath}\``. The `fullPath` is derived from `event.node.req.url` without sanitization.
- **Risk:** While Nuxt routing constrains what paths can reach this handler, a crafted URL like `/api/images/../../../api/auth/local` could potentially be used to proxy requests to internal Strapi API endpoints. The `Access-Control-Allow-Origin: process.env.BASE_URL || "*"` fallback also defaults to `"*"` if `BASE_URL` is unset.
- **Fix:** Sanitize `fullPath`: strip `..` sequences and validate it matches `^[a-zA-Z0-9/_.-]+$`. Ensure `BASE_URL` is always set in production (add startup validation). Change `"*"` fallback to `""` (no CORS header) rather than wildcard.

**[SEC-030] Website/Dashboard rate limiter is overly generous**
- **Severity:** 🟢 LOW
- **File:** `apps/website/nuxt.config.ts` (lines 40–44), `apps/dashboard/nuxt.config.ts` (lines 33–37)
- **Description:** `tokensPerInterval: 500, interval: 300000` (500 tokens per 5 minutes = 100 req/min) is extremely permissive and applies globally across all routes including login, registration, and payment endpoints.
- **Risk:** The Nuxt-level rate limiter provides minimal protection. It does not differentiate between endpoint sensitivity. A login brute-force attack gets 500 attempts per 5 minutes before triggering.
- **Fix:** Rely on Cloudflare rate limiting (Part 2) for fine-grained per-endpoint control. Reduce the global Nuxt limiter to 60 req/min as a backstop.

---

## Part 2: Cloudflare Rate Limiting Rules

### Architecture Overview

```
Internet → Cloudflare (WAF + Rate Limiting) → Nuxt Nitro (proxy) → Strapi
```

Cloudflare is the first and most critical line of defense. All rules below target paths as seen by Cloudflare (the Nuxt app's public paths). Strapi's internal paths (`apps/strapi/config/server.ts` — port 1337) should NOT be publicly exposed.

### Rule Priority Order

Rules are evaluated in priority order (lower number = higher priority). When a rule matches and takes a Block/Challenge action, subsequent rules are not evaluated. Order matters: specific endpoint rules should have higher priority (lower number) than catchall rules.

**Priority table:** Rules 1–9 = specific endpoints (high priority). Rules 10–11 = catchall (low priority).

---

### 2.1 Authentication Endpoints

**Rule CF-AUTH-01: Login brute-force protection**

| Field | Value |
|-------|-------|
| Rule Name | `Auth - Login Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/auth/local" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 5 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 10 minutes |
| Rationale | Prevents brute-force credential stuffing. 5 attempts/minute is sufficient for legitimate use; failed attempts are rare in normal flows. |

**Rule CF-AUTH-02: Registration spam protection**

| Field | Value |
|-------|-------|
| Rule Name | `Auth - Registration Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/auth/local/register" and http.request.method eq "POST")` |
| Action | Managed Challenge |
| Rate | 3 requests per 3600 seconds |
| Counting dimension | IP |
| Mitigation timeout | 24 hours |
| Rationale | A legitimate user registers once. 3 per hour covers legitimate retries (email typo); more indicates spam. Challenge rather than block to allow legitimate re-attempts. |

**Rule CF-AUTH-03: Forgot password protection**

| Field | Value |
|-------|-------|
| Rule Name | `Auth - Forgot Password Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/auth/forgot-password" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 3 requests per 3600 seconds |
| Counting dimension | IP |
| Mitigation timeout | 1 hour |
| Rationale | Account enumeration and email flood protection. Users rarely need to reset password more than once per hour. |

**Rule CF-AUTH-04: Password reset protection**

| Field | Value |
|-------|-------|
| Rule Name | `Auth - Reset Password Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/auth/reset-password" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 5 requests per 300 seconds |
| Counting dimension | IP |
| Mitigation timeout | 30 minutes |
| Rationale | Password reset tokens are single-use; 5 attempts per 5 minutes covers UI re-submissions while blocking token brute-force. |

**Rule CF-AUTH-05: Verify code rate limit**

| Field | Value |
|-------|-------|
| Rule Name | `Auth - Verify Code Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/auth/verify-code" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 10 requests per 300 seconds |
| Counting dimension | IP |
| Mitigation timeout | 15 minutes |
| Rationale | Application-level MAX_ATTEMPTS=3 handles per-token limits. Cloudflare limit handles IP-level abuse (attacker cycling through pendingTokens). 10 per 5 minutes is generous enough for legitimate users who retry. |

**Rule CF-AUTH-06: Resend code rate limit**

| Field | Value |
|-------|-------|
| Rule Name | `Auth - Resend Code Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/auth/resend-code" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 3 requests per 300 seconds |
| Counting dimension | IP |
| Mitigation timeout | 15 minutes |
| Rationale | Application-level 60s cooldown handles per-session limits. Cloudflare limit prevents IP-cycling abuse. |

**Rule CF-AUTH-07: Google OAuth callback**

| Field | Value |
|-------|-------|
| Rule Name | `Auth - Google OAuth Rate Limit` |
| Expression | `(http.request.uri.path contains "/api/connect/google/callback")` |
| Action | Managed Challenge |
| Rate | 10 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | OAuth callbacks are browser-redirected; high volume indicates abuse. Managed Challenge avoids blocking legitimate slow browsers. |

---

### 2.2 Payment Endpoints

**Rule CF-PAY-01: Ad payment creation**

| Field | Value |
|-------|-------|
| Rule Name | `Payment - Ad Create Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/payments/ad" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 10 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | A user creating multiple ads in quick succession is legitimate, but 10/min is more than enough. |

**Rule CF-PAY-02: Free ad processing**

| Field | Value |
|-------|-------|
| Rule Name | `Payment - Free Ad Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/payments/free-ad" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 5 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | Free ad processing is even more abuse-prone; limit tighter. |

**Rule CF-PAY-03: Checkout initiation**

| Field | Value |
|-------|-------|
| Rule Name | `Payment - Checkout Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/payments/checkout" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 10 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | Prevents checkout flow abuse and Webpay transaction spam (each creates a Webpay session). |

**Rule CF-PAY-04: Webpay callback (generous — browser redirect)**

| Field | Value |
|-------|-------|
| Rule Name | `Payment - Webpay Callback Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/payments/webpay")` |
| Action | Block |
| Rate | 20 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 2 minutes |
| Rationale | Webpay GET/POST redirects legitimately; users may retry on error. 20/min is generous to avoid blocking legitimate browser retries. |

**Rule CF-PAY-05: Pro subscription**

| Field | Value |
|-------|-------|
| Rule Name | `Payment - Pro Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/payments/pro" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 10 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | Subscription creation rate-limited. |

**Rule CF-PAY-06: Pro response callback**

| Field | Value |
|-------|-------|
| Rule Name | `Payment - Pro Response Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/payments/pro-response")` |
| Action | Block |
| Rate | 20 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 2 minutes |
| Rationale | Callback endpoint — same rationale as CF-PAY-04. |

---

### 2.3 AI Endpoints (High Priority — Cost Risk)

**Rule CF-AI-01: AI endpoint rate limiting (per-minute)**

| Field | Value |
|-------|-------|
| Rule Name | `AI - Rate Limit Per Minute` |
| Expression | `(http.request.uri.path matches "^/api/ia/")` |
| Action | Block |
| Rate | 10 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 10 minutes |
| Rationale | 10/min per IP is generous for legitimate AI-assisted ad creation. Attacker scripts making 100s of requests are immediately blocked. |

**Rule CF-AI-02: AI endpoint rate limiting (per-hour sliding)**

| Field | Value |
|-------|-------|
| Rule Name | `AI - Rate Limit Per Hour` |
| Expression | `(http.request.uri.path matches "^/api/ia/")` |
| Action | Block |
| Rate | 50 requests per 3600 seconds |
| Counting dimension | IP |
| Mitigation timeout | 1 hour |
| Rationale | Sliding hourly cap prevents sustained abuse that stays under the per-minute limit. An attacker making 10 req/min every minute would hit this after 5 minutes. |

**Rule CF-AI-03: Tavily search rate limiting**

| Field | Value |
|-------|-------|
| Rule Name | `AI - Tavily Search Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/search/tavily" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 10 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 10 minutes |
| Rationale | Same as AI endpoints — Tavily is a paid API. |

**Additional recommendation:** Require authentication cookie presence before AI endpoints are reached. Use Cloudflare Workers or a WAF rule:
```
(http.request.uri.path matches "^/api/ia/") and not http.cookie contains "waldo_jwt"
→ Action: Block (or JS Challenge)
```

---

### 2.4 Cron Runner

**Rule CF-CRON-01: Cron runner IP allowlist**

| Field | Value |
|-------|-------|
| Rule Name | `Cron - Admin IP Allowlist` |
| Expression | `(http.request.uri.path matches "^/api/cron-runner/") and not ip.src in {YOUR_ADMIN_IP YOUR_CI_IP}` |
| Action | Block |
| Rate | N/A (IP allowlist, not rate limit) |
| Counting dimension | IP |
| Mitigation timeout | N/A |
| Rationale | Cron runner should only be accessible from known admin IPs. Block all other sources unconditionally. |

**Rule CF-CRON-02: Cron runner rate limit (for allowlisted IPs)**

| Field | Value |
|-------|-------|
| Rule Name | `Cron - Rate Limit` |
| Expression | `(http.request.uri.path matches "^/api/cron-runner/")` |
| Action | Block |
| Rate | 3 requests per 3600 seconds |
| Counting dimension | IP |
| Mitigation timeout | 1 hour |
| Rationale | Even from trusted IPs, manual cron triggering should be rare. |

---

### 2.5 File Upload

**Rule CF-UPLOAD-01: Ad image upload**

| Field | Value |
|-------|-------|
| Rule Name | `Upload - Ad Images Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/ads/upload" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 20 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | Users may upload several images in rapid succession for one ad; 20/min accommodates this. |

**Rule CF-UPLOAD-02: Ad image deletion**

| Field | Value |
|-------|-------|
| Rule Name | `Upload - Ad Image Delete Rate Limit` |
| Expression | `(http.request.uri.path matches "^/api/ads/upload/" and http.request.method eq "DELETE")` |
| Action | Block |
| Rate | 10 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | Bulk deletion is unusual; limit protects against storage abuse. |

**Rule CF-UPLOAD-03: Strapi default upload**

| Field | Value |
|-------|-------|
| Rule Name | `Upload - Strapi Default Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/upload" and http.request.method eq "POST")` |
| Action | Block |
| Rate | 20 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | Covers the default Strapi upload endpoint. |

---

### 2.6 Contact & Lead Generation

**Rule CF-CONTACT-01: Contact form**

| Field | Value |
|-------|-------|
| Rule Name | `Contact - Form Submission Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/contacts" and http.request.method eq "POST")` |
| Action | Managed Challenge |
| Rate | 5 requests per 300 seconds |
| Counting dimension | IP |
| Mitigation timeout | 30 minutes |
| Rationale | Contact form spam protection. Managed Challenge presents a CAPTCHA rather than blocking, to accommodate slow users. |

---

### 2.7 Search & Listing (DoS Protection)

**Rule CF-SEARCH-01: Ad listing endpoint**

| Field | Value |
|-------|-------|
| Rule Name | `Search - Ad Listing Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/ads" and http.request.method eq "GET")` |
| Action | Block |
| Rate | 60 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | Public listing endpoint — 60 req/min accommodates heavy browsing while protecting against scraping loops. |

**Rule CF-SEARCH-02: Tavily search via content API**

| Field | Value |
|-------|-------|
| Rule Name | `Search - Search Endpoint Rate Limit` |
| Expression | `(http.request.uri.path matches "^/api/search/")` |
| Action | Block |
| Rate | 30 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 10 minutes |
| Rationale | Search is more expensive than listing; tighter limit. |

**Rule CF-SEARCH-03: Related ads**

| Field | Value |
|-------|-------|
| Rule Name | `Search - Related Ads Rate Limit` |
| Expression | `(http.request.uri.path matches "^/api/related/")` |
| Action | Block |
| Rate | 60 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | Related ads are loaded per page view; 60/min covers rapid navigation. |

---

### 2.8 General API Catchall

**Rule CF-CATCHALL-01: General GET catchall**

| Field | Value |
|-------|-------|
| Rule Name | `API - General GET Catchall` |
| Expression | `(http.request.uri.path matches "^/api/") and http.request.method eq "GET"` |
| Action | Block |
| Rate | 200 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | Permissive backstop for all uncategorized GET requests. Legitimate browsing rarely exceeds 200 req/min. |

**Rule CF-CATCHALL-02: General POST catchall**

| Field | Value |
|-------|-------|
| Rule Name | `API - General POST Catchall` |
| Expression | `(http.request.uri.path matches "^/api/") and http.request.method eq "POST"` |
| Action | Block |
| Rate | 30 requests per 60 seconds |
| Counting dimension | IP |
| Mitigation timeout | 5 minutes |
| Rationale | POST requests should be rare outside of specific flows; 30/min is generous for uncategorized POSTs. |

---

### 2.9 Strapi Admin Protection

**Rule CF-ADMIN-01: Block Strapi Admin from public internet**

| Field | Value |
|-------|-------|
| Rule Name | `Admin - Block Public Access` |
| Expression | `(http.request.uri.path matches "^/admin")` and not ip.src in {YOUR_ADMIN_IP_RANGES} |
| Action | Block |
| Rate | N/A |
| Counting dimension | IP |
| Mitigation timeout | N/A |
| Rationale | The Strapi Admin panel should NEVER be publicly accessible. `frameguard: false` (SEC-015) makes this especially urgent. Use Cloudflare Access (Zero Trust) or IP allowlist. |

**Note:** If Cloudflare Access (Zero Trust) is available on your plan, prefer it over IP allowlist — it provides SSO, audit logs, and device posture checks.

---

### 2.10 Cloudflare WAF Managed Rules

Enable the following on the Cloudflare WAF dashboard:

1. **Cloudflare OWASP Core Ruleset** — Blocks SQL injection, XSS, path traversal, RFI, LFI, RCE attempts. Set sensitivity to Medium initially, raise to High after validating no false positives.
2. **Cloudflare Managed Ruleset** — Cloudflare's own threat intelligence rules, updated continuously.
3. **Bot Fight Mode** (Free/Pro) or **Super Bot Fight Mode** (Business/Enterprise) — Blocks known bot networks from reaching the origin. Especially effective against scraping and credential stuffing.
4. **"I'm Under Attack" mode** — Enable during DDoS incidents. Presents a JS challenge to all visitors before allowing access. Use only during active attacks.
5. **Hotlink Protection** — Enable to prevent external sites from embedding Waldo images directly.

---

### 2.11 Rule Configuration Reference

Example Cloudflare Terraform snippets for the three most critical rules:

**AI Endpoint Rate Limit (CF-AI-01):**
```hcl
resource "cloudflare_ruleset" "ai_rate_limit" {
  zone_id     = var.cloudflare_zone_id
  name        = "AI Endpoints Rate Limiting"
  description = "Block excessive AI API calls"
  kind        = "zone"
  phase       = "http_ratelimit"

  rules {
    action = "block"
    ratelimit {
      characteristics      = ["ip.src"]
      period               = 60
      requests_per_period  = 10
      mitigation_timeout   = 600
    }
    expression  = "(http.request.uri.path matches \"^/api/ia/\")"
    description = "AI - Rate Limit Per Minute"
    enabled     = true
  }
}
```

**Login Brute-Force Protection (CF-AUTH-01):**
```hcl
resource "cloudflare_ruleset" "auth_rate_limit" {
  zone_id     = var.cloudflare_zone_id
  name        = "Auth Rate Limiting"
  description = "Protect authentication endpoints"
  kind        = "zone"
  phase       = "http_ratelimit"

  rules {
    action = "block"
    ratelimit {
      characteristics      = ["ip.src"]
      period               = 60
      requests_per_period  = 5
      mitigation_timeout   = 600
    }
    expression  = "(http.request.uri.path eq \"/api/auth/local\" and http.request.method eq \"POST\")"
    description = "Auth - Login Rate Limit"
    enabled     = true
  }
}
```

**Cron Runner Admin IP Allowlist (CF-CRON-01):**
```hcl
resource "cloudflare_ruleset" "cron_protection" {
  zone_id     = var.cloudflare_zone_id
  name        = "Cron Runner Protection"
  description = "Restrict cron runner to admin IPs only"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  rules {
    action = "block"
    expression  = "(http.request.uri.path matches \"^/api/cron-runner/\") and not ip.src in {203.0.113.10 203.0.113.11}"
    description = "Cron - Admin IP Allowlist"
    enabled     = true
    action_parameters {
      response {
        status_code  = 404
        content_type = "application/json"
        content      = "{\"error\":\"Not Found\"}"
      }
    }
  }
}
```

---

## Part 3: Additional Security Hardening

### 3.1 JWT & Session Hardening

The JWT configuration lives in Strapi's users-permissions plugin. Currently, the JWT is issued with Strapi's default settings:

- **Current state:** JWT token is issued via `strapi.plugins["users-permissions"].services.jwt.issue({ id: user.id })` (`apps/strapi/src/extensions/users-permissions/controllers/authController.ts` line 314). No custom expiry is set in code.
- **Default Strapi JWT expiry:** 30 days. This is very long for a session token.
- **Recommendations:**
  1. **Reduce JWT TTL:** Set `STRAPI_JWT_SECRET` and configure the JWT expiry to 1 hour via Strapi's users-permissions configuration: `jwtSecret` and `jwt.expiresIn: '1h'` in `config/plugins.ts`.
  2. **Implement refresh token rotation:** Issue a short-lived access token (1 hour) and a long-lived refresh token (7 days). On refresh, rotate both tokens (invalidate old refresh token).
  3. **Cookie flags:** The `waldo_jwt` cookie (`apps/website/nuxt.config.ts` line 287) should have `secure: true`, `sameSite: 'strict'`, and `httpOnly: true`. Verify that `@nuxtjs/strapi` sets these flags. The current config sets `path: "/"` and `maxAge: 604800` (7 days) but does not explicitly configure `httpOnly` or `secure`.
  4. **Token revocation:** Strapi's default JWT has no server-side revocation. Consider implementing a token blacklist in Redis for logout and password-change invalidation.

### 3.2 CORS Hardening

CORS is well-configured (only `FRONTEND_URL` and `DASHBOARD_URL` allowed — no wildcard). Remaining improvements:

1. **Reduce `allowedHeaders`:** Remove `X-Requested-With`, `Access-Control-Request-Method`, and `Access-Control-Request-Headers` from `headers` list in `apps/strapi/config/middlewares.ts` (lines 53–56). These are browser-standard and don't need explicit allowlisting.
2. **Document `X-Mobile-App-Api-Key`:** Add a comment explaining which mobile client uses this header, when the header was introduced, and how the API key is rotated.
3. **Verify in production:** Run `curl -H "Origin: https://evil.com" -H "Access-Control-Request-Method: POST" -X OPTIONS https://api.waldo.click/api/auth/local -v` and verify the response does NOT include `Access-Control-Allow-Origin: https://evil.com`.

### 3.3 CSP Hardening

Progressive steps to tighten CSP across all three apps:

1. **Remove `unsafe-inline` from Strapi Admin** (`apps/strapi/config/middlewares.ts` line 17): Use nonces via Koa middleware that generates a per-request nonce and injects it into both the CSP header and Strapi's admin HTML. This is a significant effort but eliminates the XSS risk.
2. **Tighten `img-src` wildcards** (`apps/website/nuxt.config.ts` line 84): Replace `"https:"` with `"https://res.cloudinary.com", "https://strapi.waldo.click"` (actual image hosts). Run a CSP report endpoint first to discover all image sources before blocking.
3. **Tighten `connect-src` wildcards** (`apps/website/nuxt.config.ts` line 99): Replace `"https:"` with explicit allowed domains. Enable `report-uri` or `report-to` to collect violations before switching from report-only to enforce mode.
4. **Re-enable `frameguard`** on Strapi Admin (SEC-015 fix).
5. **Add `Content-Security-Policy-Report-Only`** header first to measure impact before enforcing.

### 3.4 File Upload Hardening

1. **Magic byte validation** (SEC-011 fix): Implement using the `file-type` npm package in `apps/strapi/src/middlewares/upload.ts`.
2. **File size limit:** Add `if (f.size > 5 * 1024 * 1024) ctx.throw(400, 'File too large: maximum 5MB');` in the upload middleware. Currently there is no size limit enforced in code.
3. **Cloudinary migration:** The upload provider is currently `local` (`apps/strapi/config/plugins.ts` line 72). Cloudinary (already integrated for image transformation) would eliminate the SSRF risk from locally-served files. The `image-uploader.ts` and `image-converter.ts` middlewares are commented out (lines 67–68 in `middlewares.ts`). Re-evaluate using Cloudinary as the Strapi upload provider to remove files from the local filesystem entirely.
4. **Content-Disposition header:** When serving uploads, set `Content-Disposition: attachment` for non-image files to prevent browser execution.

### 3.5 Database Security

1. **Enable SSL in production:** Set `DATABASE_SSL=true` in `.env` and provide `DATABASE_SSL_CA` for the CA certificate of your managed database (`apps/strapi/config/database.ts` lines 6–14).
2. **Principle of least privilege:** The database user in `.env` should only have `SELECT, INSERT, UPDATE, DELETE` on Strapi tables. Avoid granting `CREATE, DROP, ALTER` in production. Create a separate migration user with DDL rights for schema changes only.
3. **Connection pool sizing:** Current pool settings (`min: 2, max: 10` — `apps/strapi/config/database.ts` lines 31–33) are reasonable. Monitor pool exhaustion under load.
4. **Backup encryption:** If `backup-cron` (`apps/strapi/config/cron-tasks`) generates database dumps, ensure dumps are encrypted at rest (AES-256) and stored off-server (S3 with SSE-KMS).

### 3.6 Secrets Management

1. **Immediate rotation priority:** All API keys found in `apps/strapi/.env` should be rotated as a precaution, in this order:
   - Payment (Webpay/Transbank) — highest risk if compromised
   - Anthropic, Google Gemini, Groq, DeepSeek — direct money drain
   - Mailgun — email spoofing/spam risk
   - Database password — full data access
   - Cloudinary — storage manipulation
   - reCAPTCHA — bypass verification
   - JWT secret — JWT forgery
2. **Secrets manager:** Adopt Doppler (easiest to integrate with existing `.env` workflow) or AWS Secrets Manager. All apps should read secrets from the manager at startup rather than from `.env` files.
3. **`.env.example` documentation:** Create `apps/strapi/.env.example` with all required keys documented (no values). This file SHOULD be in git. Run `diff <(grep -o '^[^=]*' apps/strapi/.env | sort) <(grep -o '^[^=]*' apps/strapi/.env.example | sort)` to verify alignment.
4. **Pre-commit hook:** Add `detect-secrets` or `git-secrets` to `.git/hooks/pre-commit` to block commits containing secrets patterns.

### 3.7 Monitoring & Incident Response

1. **Sentry:** Already configured for production in all three apps. Verify alert thresholds are set for: error spike (>10 new errors/5 min), payment failures, Webpay commit failures.
2. **Cloudflare Analytics:** Enable rate limit trigger alerts — configure notifications for when any rate limit rule fires more than 100 times per hour. This signals an active attack or legitimate traffic spike.
3. **AI API spend alerts:** Set billing alerts in Anthropic, Google AI Studio, Groq, and Tavily dashboards to notify when monthly spend exceeds thresholds (e.g., 2x baseline). This is the fastest way to detect AI endpoint abuse (SEC-004/028).
4. **Anomalous pattern detection:** The Logrocket integration is already configured (`apps/website/nuxt.config.ts` line 346). Configure session replay alerts for authentication failure patterns.
5. **Incident runbook:** Create `.planning/docs/incident-response.md` covering: (1) API key compromise response (rotate, revoke, re-deploy); (2) DDoS response (enable Cloudflare "Under Attack" mode); (3) Payment gateway incident (Webpay emergency stop procedure).

### 3.8 Dev Mode Endpoint

For `apps/website/server/api/dev-login.post.ts`:

1. **Immediate fix (SEC-026):** Add environment gate at the top of the handler.
2. **httpOnly fix:** Change `httpOnly: false` to `httpOnly: true`. The rationale "NECESARIO: Permitir acceso desde JavaScript" means the middleware reading the `devmode` cookie needs to be moved server-side (the cookie is read in `apps/website/app/middleware/dev.global.ts`). Move the `devmode` check to a Nitro server middleware instead of a client-side middleware.
3. **Dev mode architecture:** Consider replacing the `dev-login` mechanism entirely with a simple Nitro server middleware that checks `process.env.DEV_MODE === 'true'` and sets a server-side session, rather than a cookie-based system accessible from JavaScript.

---

## Part 4: Prioritized Remediation Roadmap

| Priority | Finding ID | Finding | Effort | Impact |
|----------|-----------|---------|--------|--------|
| 1 | SEC-004 | Add auth to AI endpoints (ia/gemini, ia/groq, ia/deepseek, ia/claude) | **Low** (3 file edits) | 🔴 Critical |
| 2 | SEC-005 | Add auth policy to cron-runner route | **Low** (1 file edit) | 🔴 Critical |
| 3 | SEC-006 | Add auth to search/tavily endpoint | **Low** (1 file edit) | 🟠 High |
| 4 | CF-AI-01 | Deploy Cloudflare AI endpoint rate limiting (CF-AI-01/02/03) | **Low** (Cloudflare dashboard) | 🔴 Critical |
| 5 | CF-AUTH-* | Deploy Cloudflare auth endpoint rate limiting (CF-AUTH-01–07) | **Low** (Cloudflare dashboard) | 🟠 High |
| 6 | SEC-026 | Gate dev-login endpoint to non-production environments | **Low** (2 line change) | 🟠 High |
| 7 | SEC-009 | Add explicit auth to payment routes in route config | **Low** (6 route config edits) | 🟠 High |
| 8 | SEC-025 | Enable DATABASE_SSL in production `.env` | **Low** (env var change) | 🟠 High |
| 9 | SEC-015 | Re-enable Strapi Admin frameguard (remove `frameguard: false`) | **Low** (1 line delete) | 🟠 High |
| 10 | SEC-011 | Add magic byte validation for file uploads | **Medium** (new npm package + middleware rewrite) | 🟠 High |
| 11 | CF-ADMIN-01 | Block Strapi Admin from public internet via Cloudflare Access | **Medium** (Cloudflare Zero Trust setup) | 🟠 High |
| 12 | SEC-001 | Rotate all API keys in `.env` | **Medium** (coordination with all services) | 🔴 Critical |
| 13 | SEC-021 | Add Webpay token replay protection (idempotency check) | **Medium** (DB query + conditional) | 🟠 High |
| 14 | SEC-002 | Move `apiUrl` from `runtimeConfig.public` to private | **Medium** (requires client-side refactor) | 🟡 Medium |
| 15 | CF-PAY-* | Deploy Cloudflare payment endpoint rate limiting | **Low** (Cloudflare dashboard) | 🟠 High |
| 16 | SEC-027 | Remove in-memory `processedTokens` Set from user-registration middleware | **Low** (delete 3 lines) | 🟡 Medium |
| 17 | SEC-023 | Bind Strapi to `127.0.0.1` instead of `0.0.0.0` in production | **Low** (env var change) | 🟡 Medium |
| 18 | SEC-013 | Fix Webpay buy_order parsing to use delimiter-safe encoding | **Medium** (service refactor) | 🟡 Medium |
| 19 | SEC-003 | Disable client source maps in production builds | **Low** (config change) | 🟢 Low |
| 20 | SEC-036 | Implement secrets manager (Doppler/AWS Secrets Manager) | **High** (infrastructure setup) | 🔴 Critical (long-term) |
| 21 | SEC-016/017 | Progressively harden CSP (remove unsafe-inline, tighten wildcards) | **High** (iterative testing) | 🟡 Medium |
| 22 | SEC-014 | Add `limit` parameter validation in related ads controller | **Low** (1 line change) | 🟢 Low |
| 23 | SEC-012 | Reduce allowedFields to minimum at registration | **Medium** (profile flow changes) | 🟡 Medium |

---

## Appendix: Files Audited

The following files were read and analyzed during this security audit:

**Strapi — Routes:**
- `apps/strapi/src/api/ia/routes/ia.ts`
- `apps/strapi/src/api/payment/routes/payment.ts`
- `apps/strapi/src/api/cron-runner/routes/cron-runner.ts`
- `apps/strapi/src/api/order/routes/01-order-me.ts`
- `apps/strapi/src/api/order/routes/order.ts`
- `apps/strapi/src/api/ad/routes/ad.ts`
- `apps/strapi/src/api/ad/routes/00-ad-custom.ts`
- `apps/strapi/src/api/auth-verify/routes/auth-verify.ts`
- `apps/strapi/src/api/search/routes/search.ts`
- `apps/strapi/src/api/indicator/routes/indicator.ts`
- `apps/strapi/src/api/related/routes/related.ts`

**Strapi — Controllers:**
- `apps/strapi/src/api/ia/controllers/ia.ts`
- `apps/strapi/src/api/payment/controllers/payment.ts`
- `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts`
- `apps/strapi/src/api/auth-verify/controllers/auth-verify.ts`
- `apps/strapi/src/api/search/controllers/search.ts`
- `apps/strapi/src/api/indicator/controllers/indicator.ts`
- `apps/strapi/src/api/related/controllers/related.ts`
- `apps/strapi/src/api/ad/controllers/ad.ts`

**Strapi — Extensions:**
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts`
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`

**Strapi — Middlewares:**
- `apps/strapi/src/middlewares/upload.ts`
- `apps/strapi/src/middlewares/user-registration.ts`
- `apps/strapi/src/middlewares/recaptcha.ts`

**Strapi — Services:**
- `apps/strapi/src/api/payment/services/ad.service.ts`
- `apps/strapi/src/api/payment/services/checkout.service.ts`

**Strapi — Configuration:**
- `apps/strapi/config/middlewares.ts`
- `apps/strapi/config/plugins.ts`
- `apps/strapi/config/server.ts`
- `apps/strapi/config/database.ts`
- `apps/strapi/.gitignore`

**Website (Nuxt 4):**
- `apps/website/nuxt.config.ts`
- `apps/website/server/api/dev-login.post.ts`
- `apps/website/server/api/images/[...].ts`
- `apps/website/server/utils/recaptcha.ts`
- `apps/website/app/middleware/auth.ts`

**Dashboard (Nuxt 4):**
- `apps/dashboard/nuxt.config.ts`
- `apps/dashboard/app/middleware/guard.global.ts`

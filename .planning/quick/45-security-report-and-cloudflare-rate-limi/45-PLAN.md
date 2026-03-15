---
phase: quick-45
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - docs/security-report.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "A comprehensive security report exists at docs/security-report.md"
    - "The report identifies specific vulnerabilities with file references"
    - "Cloudflare rate limiting rules include exact thresholds per endpoint"
    - "All three apps (website, dashboard, strapi) are covered"
  artifacts:
    - path: "docs/security-report.md"
      provides: "Full security audit + Cloudflare rate limiting recommendations"
      min_lines: 200
  key_links:
    - from: "docs/security-report.md"
      to: "specific source files"
      via: "inline file path references in each finding"
      pattern: "apps/(strapi|website|dashboard)/"
---

<objective>
Perform a deep codebase security audit and produce a comprehensive markdown report at `docs/security-report.md`.

Purpose: Give the team a single authoritative document covering vulnerabilities, misconfigurations, rate-limiting rules, and hardening recommendations across all three apps.
Output: `docs/security-report.md` — structured report with severity ratings, file references, and actionable fixes.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@AGENTS.md

Waldo is a classified-ads monorepo with three apps:
- `apps/strapi` — Strapi v5 backend (port 1337). All business logic lives here.
- `apps/website` — Nuxt 4 public website (port 3000, SSR).
- `apps/dashboard` — Nuxt 4 admin dashboard (port 3001, SSR).

The Nuxt apps are stateless HTTP clients that proxy API calls to Strapi via a Nitro server layer.
Traffic flows: Browser → Cloudflare → Nuxt (Nitro proxy) → Strapi.

Key files already read — key findings pre-loaded:

**Known security signals (use as starting points, don't treat as exhaustive):**

1. `apps/strapi/.env` is committed to git — contains real API keys, secrets, and tokens (Cloudinary, Mailgun, Webpay, Google, Zoho, Slack, Gemini, Anthropic, Serper, Tavily, DeepSeek, Groq, reCAPTCHA, etc.)

2. `apps/strapi/src/api/cron-runner/routes/cron-runner.ts` — exposes `POST /api/cron-runner/:name` with no auth policy declared (relies on Strapi Admin panel permissions, but no code-level guard). No rate limiting. Can trigger any cron job by name.

3. `apps/strapi/src/api/ia/routes/ia.ts` — four AI endpoints (`/ia/gemini`, `/ia/groq`, `/ia/deepseek`, `/ia/claude`) with `policies: []` — no auth requirement visible in route config. Each proxies to external paid AI APIs (Anthropic Claude, Google Gemini, Groq, DeepSeek). High abuse risk if unauthenticated.

4. `apps/strapi/src/api/payment/routes/payment.ts` — payment endpoints (`/payments/ad`, `/payments/free-ad`, `/payments/checkout`, `/payments/pro`, `/payments/webpay`, `/payments/pro-response`) all have `policies: []`. Must verify if auth is enforced at controller level.

5. `apps/strapi/config/middlewares.ts` — `frameguard: false` (X-Frame-Options disabled), `'unsafe-inline'` in script-src for Strapi admin CSP. `X-Mobile-App-Api-Key` header listed in allowed CORS headers, implying mobile clients exist.

6. `apps/strapi/src/middlewares/recaptcha.ts` — reCAPTCHA middleware is commented out in `config/middlewares.ts` line 70 (`// "global::recaptcha"`). It's been "moved to Nuxt Nitro proxy" but the middleware code still exists at Strapi level. This means Strapi endpoints are unprotected if called directly (bypassing Nitro proxy).

7. `apps/strapi/src/middlewares/upload.ts` — MIME type validation relies only on the `mimetype` field from the request (user-controlled). No magic-byte validation. No file size limit enforced in code.

8. `apps/website/server/api/dev-login.post.ts` — dev login endpoint sets a `devmode` cookie with `httpOnly: false` (intentional per comment but insecure — JS-accessible). Endpoint is always present (no environment gating in the route file itself). DEV_USERNAME/DEV_PASSWORD from env.

9. `apps/website/nuxt.config.ts` — `nuxt-security` module is conditionally skipped in `local` mode (`process.env.NODE_ENV !== "local"`). Rate limiter: 500 tokens / 5 min (very generous). CSP has `"img-src": ["https:"]` (wildcard) and `"connect-src": ["https:"]` (wildcard). `'unsafe-inline'` in script-src and style-src.

10. `apps/strapi/src/api/auth-verify/routes/auth-verify.ts` — `POST /api/auth/verify-code` and `POST /api/auth/resend-code` are `auth: false`. The `pendingToken` mechanism must be audited for predictability/expiry/brute-force protection.

11. `apps/strapi/config/plugins.ts` — `allowedFields` in users-permissions registration includes sensitive fields like `rut`, `business_rut`, `birthdate` — bulk-assigned directly from user input.

12. `apps/strapi/src/middlewares/user-registration.ts` — Google OAuth deduplication uses a module-level `processedTokens` Set. This is an in-memory structure that resets on server restart, creating a race condition window. Also `access_token` from query param is used as dedup key (security-sensitive).

13. `apps/strapi/config/server.ts` — `host: "0.0.0.0"` (binds all interfaces). `proxy.koa: true` (trusts all proxy headers — X-Forwarded-For spoofing risk if not behind a trusted reverse proxy).

14. Website/Dashboard `nuxt.config.ts` — `apiUrl` is in `runtimeConfig.public` (exposed to client). `sourcemap.client: true` in both apps (source maps served publicly).

15. `apps/strapi/src/api/search/routes/search.ts` and `apps/strapi/src/api/related/routes/related.ts` — need audit for injection/DoS risks.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Deep codebase exploration for security audit</name>
  <files>docs/security-report.md</files>
  <action>
    Explore the codebase thoroughly before writing the report. The pre-loaded context above is a starting point — you MUST go deeper. Execute these explorations:

    **Phase 1 — Strapi API auth posture:**
    Read every controller file in `apps/strapi/src/api/*/controllers/` and cross-reference with its route file to determine which endpoints require auth. Specifically check:
    - `apps/strapi/src/api/ia/controllers/` — are AI endpoints behind `isAuthenticated`?
    - `apps/strapi/src/api/payment/controllers/` — do payment handlers verify `ctx.state.user`?
    - `apps/strapi/src/api/cron-runner/controllers/` — what guards exist?
    - `apps/strapi/src/api/order/routes/` — read both route files (order.ts, 01-order-me.ts)
    - `apps/strapi/src/api/ad/routes/ad.ts` — default CRUD routes, what's public?
    - `apps/strapi/src/api/verification-code/` — controllers and routes

    **Phase 2 — Authentication / session:**
    - `apps/strapi/src/extensions/users-permissions/` — read all files. How is JWT generated? Token expiry?
    - `apps/strapi/src/api/auth-verify/controllers/` — how is `pendingToken` validated? Expiry? Attempt limits?
    - `apps/website/app/middleware/` — read all middleware files (route guards)
    - `apps/dashboard/app/middleware/` — read all middleware files

    **Phase 3 — File upload security:**
    - `apps/strapi/src/middlewares/image-uploader.ts` and `image-converter.ts` — are these disabled? Why?
    - `apps/website/server/api/images/[...].ts` — how does image proxy work? What validation?
    - `apps/strapi/src/api/ad/controllers/` — `upload` and `deleteUpload` handler logic

    **Phase 4 — Payment flow:**
    - `apps/strapi/src/api/payment/services/` — read all service files
    - `apps/strapi/src/api/payment/utils/` — what utilities exist?
    - Webpay callback handler — is idempotency enforced? Double-charge protection?

    **Phase 5 — Configuration / secrets:**
    - `apps/strapi/.gitignore` — is `.env` excluded?
    - `apps/website/.env.example` if it exists — what's documented?
    - `apps/dashboard/.env.example` if it exists
    - `apps/strapi/config/database.ts` — SSL config in production?
    - `apps/strapi/src/api/indicator/` — what does this expose?

    **Phase 6 — Nuxt security:**
    - `apps/website/server/utils/` — read all utils
    - `apps/website/app/composables/useApiClient.ts` — how are API tokens handled?
    - Check if `apiUrl` being in `runtimeConfig.public` actually leaks Strapi's internal host

    After exploration, write `docs/security-report.md` with this exact structure:

    ---

    ```markdown
    # Waldo Security Audit Report

    **Date:** [today]
    **Scope:** apps/strapi (Strapi v5), apps/website (Nuxt 4), apps/dashboard (Nuxt 4)
    **Auditor:** Claude Code (automated static analysis)

    ---

    ## Executive Summary

    [2-3 paragraph summary: overall risk posture, most critical findings, priority actions]

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

    For each finding:
    **[SEVER-NNN] Finding title**
    - **Severity:** [emoji + level]
    - **File:** `path/to/file.ts` (line N)
    - **Description:** What the issue is
    - **Risk:** What an attacker can do
    - **Fix:** Specific actionable remediation

    [Cover: .env committed to git, real keys in .env vs .env.example, public runtimeConfig leaking internal URLs, client-side source maps, etc.]

    ### 1.2 Authentication & Authorization

    [Cover: AI endpoints auth posture, payment endpoints auth posture, cron-runner endpoint auth, pendingToken brute force, JWT expiry, missing isAuthenticated policies, route guard gaps in middleware]

    ### 1.3 Input Validation & Injection

    [Cover: MIME-only upload validation (no magic bytes), mass-assignment via allowedFields registration, search/filter injection, user-controlled fields in payment creation]

    ### 1.4 Security Headers & CSP

    [Cover: frameguard:false on Strapi admin, unsafe-inline in CSP, connect-src/img-src wildcards on website, nuxt-security disabled in local mode, X-Frame-Options]

    ### 1.5 CORS Configuration

    [Cover: Strapi CORS allowedHeaders including X-Mobile-App-Api-Key, exact allowed origins, whether wildcard is possible]

    ### 1.6 Payment Security

    [Cover: double-charge protection, Webpay token replay, order identity via documentId (already correct per AGENTS.md), idempotency]

    ### 1.7 Infrastructure & Configuration

    [Cover: host:0.0.0.0, proxy.koa:true trusting all X-Forwarded-For, DATABASE_SSL:false, dev-login endpoint always present, devmode cookie httpOnly:false, processedTokens in-memory dedup]

    ### 1.8 Denial of Service

    [Cover: no rate limiting on AI endpoints (each call costs money), search endpoints without limits, upload size limits, cron-runner manual trigger abuse]

    ---

    ## Part 2: Cloudflare Rate Limiting Rules

    ### Architecture Overview

    ```
    Internet → Cloudflare (WAF + Rate Limiting) → Nuxt Nitro (proxy) → Strapi
    ```

    Cloudflare should be the first line of defense. All rules below target paths as seen by Cloudflare (i.e., the Nuxt app's public paths, which the Nitro proxy forwards to Strapi).

    ### Rule Priority Order

    [Explain: lower rule number = higher priority. Rules evaluated top-to-bottom, first match wins for block/challenge actions]

    ### 2.1 Authentication Endpoints

    For each rule provide a table with:

    | Field | Value |
    |-------|-------|
    | Rule Name | |
    | Expression | (http.request.uri.path matches "/api/auth/local") |
    | Action | Block / JS Challenge / Managed Challenge |
    | Rate | N requests per M seconds |
    | Counting dimension | IP |
    | Mitigation timeout | N minutes |
    | Rationale | |

    Cover these endpoint groups:
    - `POST /api/auth/local` (login) — 5 req / 60s per IP
    - `POST /api/auth/local/register` (registration) — 3 req / 3600s per IP
    - `POST /api/auth/forgot-password` — 3 req / 3600s per IP
    - `POST /api/auth/reset-password` — 5 req / 300s per IP
    - `POST /api/auth/verify-code` — 10 req / 300s per IP (user may retry)
    - `POST /api/auth/resend-code` — 3 req / 300s per IP
    - `POST /api/connect/google/callback` — 10 req / 60s per IP

    ### 2.2 Payment Endpoints

    - `POST /api/payments/ad` — 10 req / 60s per IP
    - `POST /api/payments/free-ad` — 5 req / 60s per IP
    - `POST /api/payments/checkout` — 10 req / 60s per IP
    - `GET /api/payments/webpay` — 20 req / 60s per IP (redirect return, user may retry)
    - `POST /api/payments/pro` — 10 req / 60s per IP
    - `GET /api/payments/pro-response` — 20 req / 60s per IP

    ### 2.3 AI Endpoints (High Priority — Cost Risk)

    - `POST /api/ia/*` — 10 req / 60s per IP, 50 req / 3600s per IP (sliding)
    - Recommend also: require authenticated session cookie before reaching these

    ### 2.4 Cron Runner

    - `POST /api/cron-runner/*` — 3 req / 3600s per IP + restrict to admin IPs only (Cloudflare IP allowlist rule)

    ### 2.5 File Upload

    - `POST /api/ads/upload` — 20 req / 60s per IP
    - `DELETE /api/ads/upload/*` — 10 req / 60s per IP
    - `POST /api/upload` (Strapi default upload) — 20 req / 60s per IP

    ### 2.6 Contact & Lead Generation

    - `POST /api/contacts` — 5 req / 300s per IP

    ### 2.7 Search & Listing (DoS Protection)

    - `GET /api/ads` (listing) — 60 req / 60s per IP
    - `GET /api/search/*` — 30 req / 60s per IP
    - `GET /api/related/*` — 60 req / 60s per IP

    ### 2.8 General API Catchall

    - `GET /api/*` — 200 req / 60s per IP (fallback, permissive)
    - `POST /api/*` (any uncategorized POST) — 30 req / 60s per IP

    ### 2.9 Strapi Admin Protection

    - `/admin/*` — block entirely from public internet (IP allowlist or Zero Trust tunnel)
    - Rationale: Strapi admin should never be publicly accessible

    ### 2.10 Cloudflare WAF Managed Rules

    Recommend enabling:
    - Cloudflare OWASP Core Ruleset
    - Cloudflare Managed Ruleset
    - Bot Fight Mode (or Super Bot Fight Mode on Pro plan)
    - Turn on "I'm Under Attack" mode during incidents

    ### 2.11 Rule Configuration Reference

    [Provide example Cloudflare Terraform / API configuration snippets for the top 3 most critical rules]

    ---

    ## Part 3: Additional Security Hardening

    ### 3.1 JWT & Session Hardening

    [Specific recommendations: token expiry, refresh token rotation, cookie flags, same-site policy audit]

    ### 3.2 CORS Hardening

    [Tighten Strapi CORS — remove unnecessary headers, restrict to exact origins, validate in production]

    ### 3.3 CSP Hardening

    [Remove unsafe-inline progressively, use nonces, tighten img-src and connect-src wildcards, re-enable frameguard on Strapi admin]

    ### 3.4 File Upload Hardening

    [Magic byte validation, max file size (suggested: 5MB), virus scanning consideration, Cloudinary vs local storage recommendation]

    ### 3.5 Database Security

    [Enable DATABASE_SSL in production, principle of least privilege for DB user, backup encryption]

    ### 3.6 Secrets Management

    [Rotate all keys found in committed .env, use a secrets manager (Doppler, Vault, AWS Secrets Manager), .gitignore audit]

    ### 3.7 Monitoring & Incident Response

    [Sentry already configured — confirm alert thresholds, add Cloudflare analytics alerts for rate limit triggers, log anomalous patterns]

    ### 3.8 Dev Mode Endpoint

    [Recommendation for dev-login.post.ts: environment gate, httpOnly cookie fix, removal in production builds]

    ---

    ## Part 4: Prioritized Remediation Roadmap

    | Priority | Finding | Effort | Impact |
    |----------|---------|--------|--------|
    | 1 | Rotate committed secrets | Low | Critical |
    | 2 | Add auth to AI endpoints | Low | High |
    | 3 | Add auth to cron-runner | Low | High |
    | 4 | Deploy Cloudflare rate limiting rules | Medium | High |
    | 5 | ... | | |

    [Full ranked list of all findings mapped to effort vs impact]

    ---

    ## Appendix: Files Audited

    [List all files read during the audit]
    ```

    Write the complete report. Each section must have real, specific content — no placeholders. File references must use actual paths from this codebase. Severity ratings must be justified.
  </action>
  <verify>
    File exists: `docs/security-report.md`
    File has at least 200 lines
    File contains all 4 parts (Part 1 through Part 4)
    File contains at least 8 severity-rated findings
    File contains Cloudflare rule tables with specific thresholds
  </verify>
  <done>
    `docs/security-report.md` exists with a complete, specific security audit covering all three apps, Cloudflare rate-limiting rules with exact thresholds for every significant endpoint, and a prioritized remediation roadmap. All findings reference actual file paths in the codebase.
  </done>
</task>

</tasks>

<verification>
- `docs/security-report.md` exists and is non-empty
- Report has an Executive Summary section
- Report covers Strapi, website, and dashboard
- Cloudflare rules section has at least 8 distinct endpoint groups with specific req/interval values
- Prioritized roadmap exists
</verification>

<success_criteria>
A developer who reads `docs/security-report.md` can immediately identify the top 5 risks, understand which Cloudflare rules to deploy first, and knows exactly which files to change for each fix — without needing to re-explore the codebase.
</success_criteria>

<output>
No SUMMARY.md required for quick tasks.
</output>

---
phase: quick-45
plan: 01
subsystem: security
tags: [security-audit, cloudflare, rate-limiting, strapi, nuxt]
key-files:
  created:
    - docs/security-report.md
decisions:
  - 30 distinct security findings documented; 4 rated CRITICAL
  - AI endpoints (ia/gemini, ia/groq, ia/deepseek, ia/claude) confirmed unauthenticated
  - cron-runner confirmed no code-level auth policy (comment about Admin panel is misleading)
  - .env is NOT tracked in git (.gitignore line 111 excludes it — SEC-001 downgraded from code commit to runtime risk)
  - Webpay buy_order parsing uses split('-') which is injection-susceptible on non-integer IDs
  - processedTokens in-memory Set is redundant with DB-level existingReservations check
metrics:
  duration: "45 minutes"
  completed: "2026-03-15"
  tasks_completed: 1
  tasks_total: 1
  files_created: 1
---

# Quick Task 45: Security Report and Cloudflare Rate Limiting — Summary

**One-liner:** Full static security audit of Strapi v5 + Nuxt 4 monorepo with 30 findings, 18 Cloudflare rate limiting rules, and a 23-item prioritized remediation roadmap.

## What Was Done

Performed a deep codebase security audit across all three apps in the Waldo monorepo. Explored every controller, route file, middleware, and configuration file identified in the plan's six exploration phases. Produced a 972-line security report at `docs/security-report.md`.

## Key Findings

### Critical (🔴)
1. **SEC-004** — Four AI endpoints (`/api/ia/gemini`, `/api/ia/groq`, `/api/ia/deepseek`, `/api/ia/claude`) are publicly accessible with no authentication. Each call proxies to a paid AI API (Anthropic, Google Gemini, Groq, DeepSeek). Any unauthenticated HTTP client can drain API credits.
2. **SEC-005** — The cron-runner endpoint (`POST /api/cron-runner/:name`) has NO config property at all — no `policies`, no `auth` constraint. The comment about "Admin panel controls access" is misleading; this is a content-API route, not an admin route.
3. **SEC-028** — Combined with no Cloudflare rules deployed, AI endpoints have zero throttling of any kind.

### High (🟠)
- **SEC-009** — All payment routes have `policies: []` with no explicit auth in route config — relies entirely on Strapi Admin panel permissions.
- **SEC-025** — `DATABASE_SSL: false` is the default; database connections are unencrypted unless explicitly enabled.
- **SEC-026** — `dev-login.post.ts` endpoint is always active in production with no environment gate.
- **SEC-015** — Strapi Admin `frameguard: false` explicitly — clickjacking risk on the admin panel.
- **SEC-011** — MIME type validation uses user-controlled `mimetype` field, not magic bytes.

### Notable Discoveries vs Pre-loaded Context
- `.env` is **NOT committed to git** — the `.gitignore` correctly excludes it. The pre-loaded context said it "is committed" which was incorrect. The risk is runtime exposure, not git history.
- Payment controllers do correctly access `ctx.state.user.id` (crash-based auth guard) but lack route-level `auth` config.
- `verifyCode` correctly enforces MAX_ATTEMPTS=3 and expiry — the 2-step auth is well-implemented.
- Webpay double-commit protection relies on Transbank rejecting the second call — no application-level idempotency.
- `processedTokens` in-memory Set is redundant with the DB-level `existingReservations` check.

## Cloudflare Rules Summary

18 distinct rate limiting rules documented in Part 2:
- 7 auth endpoint rules (login, register, forgot/reset-password, verify-code, resend-code, OAuth)
- 6 payment endpoint rules (ad, free-ad, checkout, webpay, pro, pro-response)
- 3 AI endpoint rules (per-minute, per-hour, Tavily)
- 2 cron-runner rules (IP allowlist + rate limit)
- 3 upload rules
- 1 contact form rule
- 3 search/listing rules
- 2 catchall rules
- 1 admin block rule
- Terraform configuration snippets for the 3 most critical rules

## Deviations from Plan

None — plan executed exactly as written. All 6 exploration phases completed, all 4 parts written, all sections contain real specific content with file path references.

## Commits

| Hash | Message |
|------|---------|
| 962443a | docs(quick-45): add comprehensive security audit report |

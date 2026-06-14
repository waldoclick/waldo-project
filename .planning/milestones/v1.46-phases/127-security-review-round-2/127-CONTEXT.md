# Phase 127: Security review round 2 — Context

**Gathered:** 2026-06-12
**Status:** Ready for planning
**Source:** Round-2 security review (live-site recon + white-box). Full findings in `127-FINDINGS.md` (same directory).

<domain>
## Phase Boundary

Close the NEW vulnerabilities surfaced by the second security review that phase 126 did not cover. All fixes are server-side in `apps/strapi` plus frontend hardening in `apps/website`. No schema migrations except adding a `unique` constraint on `order.buy_order`. Every fix ships with a regression test (Jest for Strapi, Vitest for Nuxt).

**In scope (5 areas → 5 plans):**
1. Payment integrity (Webpay return)
2. Order + reservation/pack authorization
3. Auth hardening
4. Frontend SSR XSS
5. Email / upload / PII / content-API route lockdown

**Explicitly OUT of scope (deferred):**
- `httpOnly`+`Secure`+`SameSite` session-cookie migration and CSRF tokens → **deferred to phase 128** (touches the recently-fixed Google OAuth popup `setToken` + OTP login; needs manual login verification). Do NOT change cookie flags or `@nuxtjs/strapi` token handling in this phase.
- CSP migration to nonce-based `script-src` (drop `'unsafe-inline'`) → future/separate; not in 127.
- Anything depending on Strapi admin DB role config that cannot be changed from code (the review flagged several IDOR/route items as conditional on Public/Authenticated role grants). For those, the 127 fix is the CODE-LEVEL guard (ownership checks, disabling content-API routes in code), not DB role edits.
</domain>

<decisions>
## Implementation Decisions (LOCKED)

### Plan 01 — SEC2-PAYMENT: Webpay return integrity
- After Transbank `commit()` returns `AUTHORIZED`, recompute the expected amount server-side from the pack price (DB lookup) + featured price, and REJECT if `wepbayResponse.response.amount !== expectedAmount`. Files: `apps/strapi/src/api/payment/services/checkout.service.ts` (~line 164), `apps/strapi/src/api/payment/services/pack.service.ts` (~line 99).
- Add idempotency/replay protection: add `unique: true` on `buy_order` in `apps/strapi/src/api/order/content-types/order/schema.json`; before granting any benefit, look up an existing processed order by `buy_order` and short-circuit to its `order.documentId` redirect if found. Wrap grant + order creation in a DB transaction where feasible.
- Verify `adId` ownership on the paid-checkout return: load the ad and assert `ad.user.id === userId` (parsed from `buy_order`) before publish/relink/re-date. Mirror the existing `free-ad.service.ts` ownership pattern (`SEC-IDOR-FREEAD`).
- Fail-closed on missing price env: do NOT silently use the `|| 10000` fallback for `AD_FEATURED_PRICE` at commit time — if unset, error.

### Plan 02 — SEC2-AUTHZ: order + reservation/pack authorization
- `order.findOne` (`apps/strapi/src/api/order/controllers/order.ts:386`): after fetching, enforce `if (!isManager && order.user?.id !== ctx.state.user?.id) return ctx.forbidden()`. Copy the manager-check pattern already in `payment.thankyou` (`payment.ts:744`).
- `order.find` (`order.ts:26`): scope to `ctx.state.user.id` for non-managers; ignore client-supplied `filters` that widen user scope.
- Gate `order.exportCsv` and `order.salesByMonth` routes behind `global::isManager`.
- `ad-pack`, `ad-reservation`, `ad-featured-reservation`: remove public `create/update/delete`. Packs (products/prices) → `global::isManager`. Reservations (publishing credits) → owner-scoped controller that sets `user` from `ctx.state.user` and ignores client `price`/`user`. Keep the existing manager-only `gift` action.

### Plan 03 — SEC2-AUTH: auth hardening
- Google login: in `apps/strapi/src/services/google-one-tap/google-one-tap.service.ts` `findOrCreateUser`, reject when `payload.email_verified !== true` BEFORE the email-fallback link and before create. Applies to both One Tap and the OAuth popup path.
- Remove hardcoded JWT fallback in `apps/strapi/src/api/ad/controllers/ad.ts:757` (`?? "strapi-jwt-secret"`). Prefer `strapi.plugins['users-permissions'].services.jwt.verify(token)`; if `JWT_SECRET` unset → treat as unauthenticated (`userId = null`).
- Rate-limiting on auth endpoints (`/api/auth/local`, `/auth/local/register`, `/auth/forgot-password`, `/auth/verify-code`, `/auth/resend-code`, `/auth/google-one-tap`): **BOTH LAYERS** (user decision) — per-IP limit in the Nuxt Nitro proxy (where reCAPTCHA already lives) AND a Strapi-layer rate-limit middleware (koa2-ratelimit or the users-permissions ratelimit) so direct-origin access is also covered.
- Bind reCAPTCHA `action` and `hostname` in verification (`apps/strapi/src/services/google/services/google-recaptcha.service.ts:22` and `apps/website/server/utils/recaptcha.ts`): assert `response.data.action === <expected>` and `hostname` against an allowlist, in addition to `success && score>0.5`.

### Plan 04 — SEC2-XSS: frontend SSR sanitizer
- Replace the regex SSR branch in `apps/website/app/composables/useSanitize.ts:13-40` with a real sanitizer that runs identically on server and client. Use `isomorphic-dompurify` (JSDOM-backed) so SSR output is sanitized with the same allowlist as the client. Remove the regex branch entirely.
- `parseMarkdown` (`useSanitize.ts:115`): configure `marked` to NOT pass through raw inline HTML, then sanitize the output unconditionally.
- Verify the sinks render safely: `AdSingle.vue:15` (ad description), `ArticleSingle.vue:12` (article body), `MessageDefault.vue`, `CardHighlight.vue`, `CardCategory.vue`.
- Do NOT touch the session cookie or CSP in this plan (deferred).

### Plan 05 — SEC2-LOCKDOWN: email / upload / PII / route lockdown
- MJML emails: set `autoescape: true` in `apps/strapi/src/services/mjml/index.ts:4` (or apply `escapeHtml()` at every user-controlled interpolation in cron reports and transactional emails). Verify numeric IDs/server tokens still render. Re-check the cron report templates feeding `ad.name`/`username`/`email`.
- Upload validation (`apps/strapi/src/middlewares/upload.ts`): add server-side magic-byte verification (e.g. `file-type`) rejecting mismatches against the declared MIME; add an explicit `sizeLimit` to the upload plugin config (`apps/strapi/config/plugins.ts`). SVG/html already excluded — keep excluded.
- `GET /api/users` (`apps/strapi/src/extensions/users-permissions/controllers/userController.ts:197` `getUserDataWithFilters`): whitelist allowed `filters` keys; strip PII (email/phone/RUT/address/birthdate) from the list response unless caller is manager.
- Disable content-API routes for sensitive content types in CODE (not just DB toggles): override the core router to `routes: []` (or restrict to the necessary actions) for `verification-code` (stores plaintext code/pendingToken — must never be web-readable), and confirm `contact` exposes only `create`, `subscription-payment` exposes no write to non-managers.

### Claude's Discretion
- Exact test file locations follow the project rule (root-level `tests/` mirroring source). Jest for Strapi, Vitest for Nuxt.
- Choice of rate-limit library/store (in-memory vs Upstash/Redis) — pick what matches existing infra; default to in-memory per-IP if no shared store is configured, and note the limitation.
- Whether to add a shared `assertOwnerOrManager` helper vs inline checks — prefer subtractive/DRY but do not over-abstract.
- Wave assignment and plan ordering.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Findings (source of truth for this phase)
- `.planning/phases/127-security-review-round-2/127-FINDINGS.md` — full review with file:line evidence and severity per finding

### Prior security phase (patterns to follow / avoid duplicating)
- `.planning/phases/126-security-hardening/126-CONTEXT.md` — what round 1 already fixed
- `apps/strapi/src/policies/isUsersOwner.ts`, `isManager.ts` — existing ownership/role policy patterns to reuse
- `apps/strapi/src/middlewares/protect-ad-fields.ts`, `protect-user-fields.ts` — existing mass-assignment middleware patterns

### Payment
- `apps/strapi/src/api/payment/services/checkout.service.ts`, `pack.service.ts`, `free-ad.service.ts`
- `apps/strapi/src/api/payment/controllers/payment.ts` (ownership check pattern at `thankyou`)
- `apps/strapi/src/api/order/content-types/order/schema.json`

### Project rules
- `./CLAUDE.md` — Payment rules (order identity = `order.documentId`), test directory rules, naming, Strapi v5 patterns (documentId, `strapi.db.query`)
</canonical_refs>

<specifics>
## Specific Ideas
- The live API is already gated behind `proxy-auth` (`x-proxy-key`), so direct browser exploitation is blocked — but an authenticated user going through the Nuxt proxy still reaches these endpoints with a valid JWT, so the IDOR/mass-assignment fixes are genuinely reachable and required.
- Several findings are conditional on Strapi DB role config. The single highest-value operational follow-up (NOT a code task) is to export and audit the Public vs Authenticated role permissions. Note this in the phase verification as a manual action item.
</specifics>

<deferred>
## Deferred Ideas
- Phase 128: `httpOnly`+`Secure`+`SameSite` session cookie + CSRF tokens (touches OAuth/OTP login).
- CSP nonce migration to drop `script-src 'unsafe-inline'`.
- HSTS max-age increase to 1 year + preload (infra/header config).
- DB role-permission audit (operational, not code).
</deferred>

---

*Phase: 127-security-review-round-2*
*Context gathered: 2026-06-12 via round-2 security review*

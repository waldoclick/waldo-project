---
phase: 127-security-review-round-2
verified: 2026-06-12T00:00:00Z
status: passed
score: 20/20 must-haves verified
---

# Phase 127: Security Review Round 2 — Verification Report

**Phase Goal:** Close five security requirements surfaced by the security review: SEC2-PAYMENT, SEC2-AUTHZ, SEC2-AUTH, SEC2-XSS, SEC2-LOCKDOWN
**Verified:** 2026-06-12
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | A Webpay return whose amount differs from the server-computed price is rejected | VERIFIED | `checkout.service.ts:319-327` + `pack.service.ts:133-140` both have amount mismatch guard |
| 2  | Replaying the same buy_order return URL is idempotent (short-circuits to existing order, no second benefit) | VERIFIED | `checkout.service.ts:200-213` idempotency lookup before any benefit grant |
| 3  | A paid-checkout return for an ad not owned by the paying user is rejected | VERIFIED | `checkout.service.ts:330-345` ownership guard mirrors free-ad.service pattern |
| 4  | Missing AD_FEATURED_PRICE fails closed at commit time | VERIFIED | `checkout.service.ts:216-220` throws if `!featuredPrice`; no `|| 10000` in checkout or pack |
| 5  | buy_order has a unique constraint in the order schema | VERIFIED | `schema.json:20` `"unique": true` on `buy_order` attribute |
| 6  | Non-manager calling order.findOne for another user's order gets 403 | VERIFIED | `order.ts:421-434` isManager check + `ctx.forbidden()` |
| 7  | Non-manager calling order.find only sees their own orders | VERIFIED | `order.ts:37-43` non-manager branch hard-codes `{ user: { id: ctx.state.user.id } }`, ignoring client filters |
| 8  | order.exportCsv is gated behind global::isManager | VERIFIED | `01-order-me.ts:11` `policies: ["global::isManager"]` on export-csv route |
| 9  | Non-managers cannot create/update/delete ad-pack, ad-reservation, or ad-featured-reservation | VERIFIED | All three route files have `global::isManager` on POST/PUT/DELETE |
| 10 | Google login is rejected when payload.email_verified !== true | VERIFIED | `google-one-tap.service.ts:35` guard at top of `findOrCreateUser` |
| 11 | ad.ts uses users-permissions plugin JWT verify (no hardcoded fallback secret) | VERIFIED | `ad.ts:756-759` uses `strapi.plugins["users-permissions"].services.jwt.verify`; no `strapi-jwt-secret` found |
| 12 | Auth endpoints rate-limited at both Nuxt Nitro proxy layer and Strapi layer | VERIFIED | `auth-ratelimit.ts` (Strapi, koa2-ratelimit, registered in middlewares.ts:69) + `website/server/middleware/auth-rate-limit.ts` (Nitro, in-memory per-IP) |
| 13 | reCAPTCHA verifies hostname (allowlist) in both layers; action binding in Strapi layer | VERIFIED | `google-recaptcha.service.ts:37-39` + `recaptcha.ts:60-72` both check `RECAPTCHA_ALLOWED_HOSTNAMES` |
| 14 | sanitizeHTML is isomorphic (DOMPurify, no regex SSR branch) | VERIFIED | `useSanitize.ts:1` imports `isomorphic-dompurify`; no `isServer` or regex pattern found |
| 15 | An unquoted-handler payload like `<svg onload=alert(1)>` is stripped | VERIFIED | DOMPurify handles unquoted attributes; `walkTokens` in marked suppresses raw HTML before DOMPurify |
| 16 | parseMarkdown strips raw HTML before sanitizing | VERIFIED | `useSanitize.ts:8-22` `marked.use()` with `renderer.html()→""` and `walkTokens` clearing `html` tokens |
| 17 | MJML emails auto-escape user variables (autoescape: true) | VERIFIED | `mjml/index.ts:5` `autoescape: true`; 14 templates audited; no `| safe` or `escapeHtml()` needed (all vars are plain text, numeric, or server-generated URLs) |
| 18 | Uploads with magic bytes not matching declared MIME are rejected; sizeLimit enforced | VERIFIED | `upload.ts` imports `fromFile` from `file-type@16.5.4` and calls `validateMagicBytes`; `plugins.ts:79` `sizeLimit: 5 * 1024 * 1024` |
| 19 | GET /api/users whitelists filter keys and strips PII for non-managers | VERIFIED | `userController.ts:198-217` `ALLOWED_FILTER_KEYS` + `PII_FIELDS`; non-manager branch deletes PII fields |
| 20 | verification-code/contact/subscription-payment routes are locked down in code | VERIFIED | `verification-code.ts`: `only: []`; `contact.ts`: `only: ["create"]`; `subscription-payment.ts`: create/update/delete gated with `global::isManager` |

**Score:** 20/20 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/api/order/content-types/order/schema.json` | `"unique": true` on buy_order | VERIFIED | Line 20 |
| `apps/strapi/src/api/payment/services/checkout.service.ts` | Amount validation + idempotency + ad-ownership + fail-closed price | VERIFIED | Lines 200-345 |
| `apps/strapi/src/api/payment/services/pack.service.ts` | Amount validation at commit | VERIFIED | Lines 132-140 |
| `apps/strapi/tests/api/payment/services/checkout.service.test.ts` | 4 regression tests | VERIFIED | 4 test cases confirmed |
| `apps/strapi/src/api/order/controllers/order.ts` | Ownership check in findOne, user-scoping in find | VERIFIED | Lines 37-43, 421-434 |
| `apps/strapi/src/api/order/routes/01-order-me.ts` | isManager on export-csv route | VERIFIED | Line 11 |
| `apps/strapi/src/api/ad-pack/routes/ad-pack.ts` | isManager on create/update/delete (3 routes) | VERIFIED | 3 occurrences confirmed |
| `apps/strapi/tests/api/order/order.test.ts` | Regression tests for findOne + find scoping | VERIFIED | 5 test cases |
| `apps/strapi/tests/api/ad-pack/ad-pack.route.test.ts` | Route policy assertions | VERIFIED | 5 test cases |
| `apps/strapi/src/services/google-one-tap/google-one-tap.service.ts` | email_verified guard | VERIFIED | Line 35 |
| `apps/strapi/src/api/ad/controllers/ad.ts` | JWT via plugin, no fallback | VERIFIED | Lines 756-759; no `strapi-jwt-secret` |
| `apps/strapi/src/middlewares/auth-ratelimit.ts` | Strapi-layer auth rate limit | VERIFIED | koa2-ratelimit, registered in middlewares.ts |
| `apps/website/server/middleware/auth-rate-limit.ts` | Nitro proxy per-IP rate limit | VERIFIED | In-memory store, 10 req/min/IP |
| `apps/strapi/src/services/google/services/google-recaptcha.service.ts` | Hostname + action binding | VERIFIED | RECAPTCHA_ALLOWED_HOSTNAMES checked |
| `apps/website/server/utils/recaptcha.ts` | Hostname binding | VERIFIED | RECAPTCHA_ALLOWED_HOSTNAMES checked |
| `apps/website/app/composables/useSanitize.ts` | isomorphic-dompurify + marked HTML suppression | VERIFIED | No isServer/regex branch |
| `apps/website/package.json` | isomorphic-dompurify dependency | VERIFIED | `"isomorphic-dompurify": "2.35.0"` at line 52 |
| `apps/website/tests/composables/useSanitize.test.ts` | XSS regression tests | VERIFIED | 6 test cases |
| `apps/strapi/src/services/mjml/index.ts` | `autoescape: true` | VERIFIED | Line 5 |
| `apps/strapi/src/middlewares/upload.ts` | magic-byte check via file-type | VERIFIED | `fromFile` imported and called |
| `apps/strapi/config/plugins.ts` | `sizeLimit` + `ratelimit` coexist | VERIFIED | Lines 19-22 (ratelimit), line 79 (sizeLimit) |
| `apps/strapi/src/extensions/users-permissions/controllers/userController.ts` | ALLOWED_FILTER_KEYS + PII_FIELDS | VERIFIED | Lines 198-217 |
| `apps/strapi/src/api/verification-code/routes/verification-code.ts` | `only: []` | VERIFIED | Line 12 |
| `apps/strapi/src/api/contact/routes/contact.ts` | `only: ["create"]` | VERIFIED | Line 10 |
| `apps/strapi/src/api/subscription-payment/routes/subscription-payment.ts` | isManager on writes | VERIFIED | Lines 16-18 |
| `apps/strapi/tests/middlewares/upload.test.ts` | magic-byte regression tests | VERIFIED | Exists |
| `apps/strapi/tests/extensions/users-permissions/controllers/userController.test.ts` | PII/whitelist regression tests | VERIFIED | Exists |
| `apps/strapi/package.json` | `file-type@16.5.4` | VERIFIED | Line 46 |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `checkout.service.ts processWebpayReturn` | `strapi.db.query('api::order.order').findOne` | idempotency lookup before benefit grant | WIRED | Lines 200-213 |
| `checkout.service.ts processWebpayReturn` | `strapi.db.query('api::ad-pack.ad-pack').findOne` | server-side pack price for amount validation | WIRED | Lines 302-327 |
| `checkout.service.ts processWebpayReturn` | `strapi.db.query('api::ad.ad').findOne` | ad ownership check before publish | WIRED | Lines 330-345 |
| `order.findOne` | `ctx.forbidden()` | isManager + owner comparison | WIRED | Lines 421-434 |
| `order.find` | `{ user: { id: ctx.state.user.id } }` | non-manager scoping overrides client filters | WIRED | Lines 37-43 |
| `google-one-tap.service.findOrCreateUser` | throw on `email_verified !== true` | guard before email-fallback link/create | WIRED | Line 35 |
| `ad.ts JWT decode` | `strapi.plugins["users-permissions"].services.jwt.verify` | no hardcoded fallback | WIRED | Lines 756-759 |
| `upload.ts validateMagicBytes` | `file-type fileTypeFromFile(file.filepath)` | compare detected mime to declared | WIRED | Lines 2, 22 |
| `getUserDataWithFilters` | ALLOWED_FILTER_KEYS whitelist + PII_FIELDS strip | sanitize client filters + remove PII for non-managers | WIRED | Lines 228-290 |
| `useSanitize.ts sanitizeHTML` | `DOMPurify.sanitize` (isomorphic-dompurify) | single code path, no isServer branch | WIRED | Line 35 |
| `useSanitize.ts module top-level` | `marked.use({ renderer.html, walkTokens })` | suppress raw HTML tokens before parse | WIRED | Lines 8-22 |
| `auth-ratelimit.ts` | `global::auth-ratelimit` in middlewares.ts | Strapi middleware registration | WIRED | `middlewares.ts:69` |
| `google-recaptcha.service.ts verifyToken` | `RECAPTCHA_ALLOWED_HOSTNAMES` check | hostname allowlist binding | WIRED | Lines 37-39 |
| `recaptcha.ts verifyRecaptchaToken` | `RECAPTCHA_ALLOWED_HOSTNAMES` check | hostname allowlist binding | WIRED | Lines 60-72 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEC2-PAYMENT | 127-01 | Amount re-validation, replay prevention, ad ownership, fail-closed price | SATISFIED | checkout.service.ts + pack.service.ts + schema.json |
| SEC2-AUTHZ | 127-02 | Order IDOR protection, scoped listing, export-csv gate, pack/reservation lockdown | SATISFIED | order.ts + 01-order-me.ts + route files |
| SEC2-AUTH | 127-03 | email_verified guard, JWT plugin, two-layer rate limit, reCAPTCHA hostname/action | SATISFIED | google-one-tap.service.ts + ad.ts + auth-ratelimit.ts + recaptcha files |
| SEC2-XSS | 127-04 | Isomorphic DOMPurify replacing regex SSR branch, marked raw HTML suppression | SATISFIED | useSanitize.ts + package.json |
| SEC2-LOCKDOWN | 127-05 | MJML autoescape, upload magic-byte + sizeLimit, users filter whitelist + PII strip, route lockdown | SATISFIED | mjml/index.ts + upload.ts + plugins.ts + userController.ts + route files |

---

## Anti-Patterns Found

None blocking. One informational item:

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/strapi/src/api/payment/services/ad.service.ts` | 346 | `AD_FEATURED_PRICE) \|\| 10000` | INFO | This is in `ad.service.ts.processPaidWebpay`, which handles the legacy per-ad payment path (called from `payment.ts`, not from `checkout.service.ts`). Plan 01 scoped only `checkout.service.ts` and `pack.service.ts`. This path is not addressed by phase 127 — it is a follow-up item. |
| `apps/strapi/src/extensions/users-permissions/controllers/userController.ts` | 142 | `console.log("User role:", user.role)` | INFO | Debug log left in `getUserData`. Not a security issue but leaks role data to server logs. Not in scope for this phase. |

---

## Human Verification Required

### 1. MJML URL rendering with autoescape

**Test:** Send a transactional email (e.g. email confirmation) and inspect the rendered HTML for the button href attribute.
**Expected:** The `confirmationUrl` renders as a clean URL (e.g. `https://waldo.click/auth/...`) without double-escaping of `&amp;` in query strings.
**Why human:** Templates use server-generated URLs (from `authController.ts`) inside `href="{{ confirmationUrl }}"`. While Nunjucks autoescape is safe for HTML attribute values (browsers decode `&amp;`), a URL with `&` in its query string would render as `&amp;` in the attribute, which browsers will decode correctly. However, visual confirmation that no `&amp;lt;` artifacts appear requires rendering a real email.

### 2. Rate limit behavior under load

**Test:** Send 11 POST requests to `/api/auth/local` from the same IP within 60 seconds.
**Expected:** Requests 1-10 succeed (or fail with 401 for wrong credentials); request 11 returns 429 from the Nuxt proxy layer before reaching Strapi.
**Why human:** The rate limiters use in-memory stores (koa2-ratelimit in Strapi, Map in Nuxt). Verifying the 429 response requires a live HTTP client hitting the running server.

### 3. Upload magic-byte rejection in production

**Test:** Upload a file with `Content-Type: image/png` whose bytes are actually a PDF.
**Expected:** Strapi returns 400 `File content does not match declared type: image/png`.
**Why human:** The `file-type@16.5.4` magic-byte check reads the actual file bytes via `fromFile(filepath)`. Integration testing requires a running Strapi instance with multipart upload.

---

## Gaps Summary

None. All 20 must-haves across 5 security requirements are verified as present, substantive, and wired. The one residual `AD_FEATURED_PRICE || 10000` in `ad.service.ts` is in the legacy per-ad payment path (not the unified checkout or pack paths), is out of scope for phase 127's plan boundaries, and should be tracked as a follow-up.

---

_Verified: 2026-06-12_
_Verifier: Claude (gsd-verifier)_

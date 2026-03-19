# Domain Pitfalls: Google One Tap Sign-In on Nuxt 4 + Strapi

**Domain:** Adding Google One Tap to an existing SSR Nuxt 4 app with nuxt-security CSP + Strapi v5 OAuth
**Researched:** 2026-03-18
**Sources:** Google Identity Services official docs (updated 2026-02-10), live codebase analysis

---

## Critical Pitfalls

Mistakes that cause silent failures, broken auth, or security regressions.

---

### Pitfall 1: CSP Missing `connect-src` for `accounts.google.com/gsi/`

**What goes wrong:** One Tap initializes but the FedCM flow silently fails. Chrome DevTools shows:
`[GSI_LOGGER]: FedCM get() rejects with NetworkError: ... Refused to connect to 'https://accounts.google.com/gsi/fedcm.json' because it violates the document's Content Security Policy.`

**Why it happens:** `nuxt-security` enforces CSP headers on every response. The existing `connect-src` in `nuxt.config.ts` does NOT include `https://accounts.google.com/gsi/` (it only has `https://accounts.google.com` in `script-src`, not the `/gsi/` sub-path in `connect-src`). The `frame-src` already has `https://accounts.google.com` but not the `/gsi/` prefix. The `style-src` doesn't include `https://accounts.google.com/gsi/style` at all.

**Consequences:** One Tap prompt never appears on FedCM-capable browsers (Chrome 117+) — the most common browser. No visible error for users. Developers waste hours thinking the issue is in JS code.

**Prevention:** Add `https://accounts.google.com/gsi/` to ALL of these CSP directives in `nuxt.config.ts`:
```typescript
"connect-src": [..., "https://accounts.google.com/gsi/"],
"frame-src":   [..., "https://accounts.google.com/gsi/"],
"style-src":   [..., "https://accounts.google.com/gsi/style"],
// script-src already has "https://accounts.google.com" — confirm gsi/client is covered
```
Google explicitly says: use the parent path `https://accounts.google.com/gsi/` (not individual endpoint URLs) to future-proof against GIS library updates. Avoid listing individual GIS URLs.

**Detection:** `[GSI_LOGGER]` errors in Chrome DevTools console. One Tap never shows despite correct JS initialization.

**Source:** https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy (HIGH confidence — official docs)

---

### Pitfall 2: `use_fedcm_for_prompt` Is Deprecated — Silently Ignored + Notification Methods Broken

**What goes wrong:** The existing `useGoogleOneTap.ts` composable passes `use_fedcm_for_prompt: true` to `initialize()`. According to current GIS docs (updated 2026-02-10), this attribute is **deprecated and will be ignored**. FedCM for One Tap is now the default — there is no opt-in flag.

More critically, the composable's `prompt()` callback calls:
```typescript
notification.isNotDisplayed()         // NOT SUPPORTED with FedCM
notification.getNotDisplayedReason()  // NOT SUPPORTED with FedCM
notification.getSkippedReason()       // PARTIALLY SUPPORTED — doesn't return 'user_cancel'
```
These methods return `undefined` or incorrect values with FedCM enabled. The `console.log` calls log `undefined`.

**Why it happens:** The composable was written against an older API version. The deprecated field causes no error but creates false confidence that FedCM is being controlled.

**Consequences:**
- No functional breakage today, but debugging is impossible (notifications lie)
- Custom prompt positioning via `prompt_parent_id` **does not work** with FedCM (browser controls position); any CSS positioning built around a parent container will be ignored
- `isNotDisplayed()` / `getNotDisplayedReason()` cannot be used to diagnose why the prompt isn't showing

**Prevention:**
- Remove `use_fedcm_for_prompt: true` from `initialize()` call
- Replace the `prompt()` notification handler with FedCM-compatible methods only: `isDismissedMoment()` and `getDismissedReason()` are fully supported; `isSkippedMoment()` is partially supported
- Do not attempt to position or style the One Tap prompt container — browser controls it with FedCM

**Source:** https://developers.google.com/identity/gsi/web/reference/js-reference#use_fedcm_for_prompt and https://developers.google.com/identity/gsi/web/guides/fedcm-migration (HIGH confidence — official docs)

---

### Pitfall 3: Wrong Token Type Passed to `authenticateProvider()` — Silent 400/401

**What goes wrong:** The existing `useGoogleOneTap.ts` redirects to `/login/google?access_token=${token}` where `token` is the Google **ID token** (a credential JWT from One Tap's `callback`). But `/login/google.vue` calls `authenticateProvider("google", access_token)` from `@nuxtjs/strapi`, which calls Strapi's `GET /api/auth/google/callback?access_token=...`. Strapi's Google provider callback expects an **OAuth access token** to exchange with Google's userinfo endpoint — an ID token will be rejected.

**Why it happens:** One Tap returns an **ID token** (credential JWT). The existing `/connect/google` flow returns an **OAuth access token** via redirect. These are fundamentally different tokens used in different flows.

**Consequences:** Authentication silently fails or returns a 400/401 from Strapi. The user sees an error and is redirected to `/login`. The One Tap integration appears entirely broken. This is the most likely reason any initial One Tap test appears to "not work."

**Prevention:** One Tap requires a **completely separate backend endpoint** on Strapi (e.g., `POST /api/auth/google-one-tap`) that:
1. Receives the Google ID token in the request body
2. Verifies it server-side using `google-auth-library` (`OAuth2Client.verifyIdToken()`)
3. Looks up or creates a user by `sub` (not email — see Pitfall 6)
4. Returns a Strapi JWT directly (same response format as `auth/local`)

Do NOT reuse `/login/google.vue` for One Tap tokens. The existing page must remain as-is for the standard OAuth flow; One Tap needs its own callback page or flow.

**Source:** https://developers.google.com/identity/gsi/web/guides/verify-google-id-token + codebase analysis (HIGH confidence)

---

### Pitfall 4: One Tap Fires on Authenticated Pages → Dead-Loop UX on Logout

**What goes wrong:** `useGoogleOneTap` is initialized globally. A user signs out → `useLogout.ts` calls `strapiLogout()` → clears `waldo_jwt` cookie → navigates to `/`. If One Tap is active on `/` with `auto_select: false` (current config), it fires again but requires a click. However, if `auto_select: true` is ever enabled for returning users, it re-authenticates the user immediately after logout — an infinite loop.

Even with `auto_select: false`, the bigger issue is: if `google.accounts.id.disableAutoSelect()` is never called on logout, the GIS library's internal `g_state` cookie is not updated, so the library still believes the user wants automatic sign-in on future visits.

**Why it happens:** The GIS library manages its own `g_state` cookie to track sign-in state. If `disableAutoSelect()` is not called when a user explicitly logs out, the library re-triggers One Tap on the next visit.

**Consequences:** Users who sign out are immediately prompted to sign back in. With `auto_select: true`, they are signed back in without any interaction. Extremely confusing UX.

**Prevention:**
1. Call `window.google?.accounts?.id?.disableAutoSelect()` inside `useLogout.ts` **before** calling `strapiLogout()`
2. Set `state_cookie_domain: "waldo.click"` in `initialize()` so the `g_state` cookie is shared across `waldo.click` subdomains (matches existing `COOKIE_DOMAIN=.waldo.click`)
3. Suppress One Tap on pages where the user is already authenticated (`useStrapiUser().value != null`)

**Detection:** User clicks "Cerrar sesión" → immediately gets One Tap prompt or (worse) gets re-signed-in.

**Source:** https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out (HIGH confidence — official docs)

---

### Pitfall 5: `googleOneTapInitialized` Global Flag — Blocks Per-Page `prompt()`

**What goes wrong:** The current composable uses `(window as any).googleOneTapInitialized = true` as a global flag. Once set (on the first page load where One Tap is shown), the `initializeGoogleOneTap()` function exits early on every subsequent call — including calls on new pages where One Tap should appear fresh. In SPA navigation, the flag persists across route changes.

**Why it happens:** The flag guards both `initialize()` AND `prompt()` together. But `google.accounts.id.initialize()` should only be called once (per official docs), while `google.accounts.id.prompt()` should be called on each page where One Tap should appear.

**Consequences:** After One Tap is shown (and dismissed or closes) on the first page, it never appears again during the same browser session — even on pages where it should. The composable works only once per page load (F5 refresh).

**Prevention:**
- Move `initialize()` to a Nuxt **client-side plugin** that runs exactly once on app startup
- Keep `prompt()` in the composable, called from individual page `onMounted()` hooks
- Remove the `googleOneTapInitialized` global flag from the current composable
- Add `google.accounts.id.cancel()` in route leave hooks to cancel any pending prompt

**Source:** https://developers.google.com/identity/gsi/web/reference/js-reference#google.accounts.id.initialize + codebase analysis (HIGH confidence)

---

### Pitfall 6: Using Email Instead of `sub` as User Identifier in Strapi

**What goes wrong:** When the new Strapi endpoint creates or looks up a user from a One Tap credential, it queries by `email`. If a user changes their Gmail address, a duplicate account is created. If a user registered with email/password using the same address, the One Tap endpoint may silently merge them into the wrong account.

**Why it happens:** The ID token payload contains both `email` and `sub`. Email is visible and tempting to use. But Google explicitly states: **only use `sub` as the unique identifier** — email can change.

**Consequences:** Duplicate accounts, broken account linking, potential security escalation if a malicious actor registers an email address previously owned by someone else.

**Prevention:**
- In the new Strapi One Tap endpoint, look up users by a dedicated `google_sub` field first
- Fall back to email lookup ONLY for account linking (existing user without a `google_sub`)
- Store `sub` in a custom indexed field on the Strapi User content type
- Also audit `registerUserAuth` in `authController.ts` (the existing `/connect/google` flow) — if it relies on Strapi's built-in Google provider which may use email as the lookup key, it has the same vulnerability

**Source:** https://developers.google.com/identity/gsi/web/guides/verify-google-id-token (HIGH confidence — official docs)

---

### Pitfall 7: One Tap Initializes During SSR → Hydration Mismatch

**What goes wrong:** The existing composable has a `typeof window === "undefined"` guard, but if `initializeGoogleOneTap()` is called without `onMounted()` wrapping (e.g., directly in `<script setup>` at the top level), Nuxt 4 may execute it during SSR. The `window.google` check returns false on the server, but the `useRuntimeConfig()` call happens server-side too, which is fine — but any `setTimeout` callbacks will be scheduled in a Node.js context rather than browser context.

**Why it happens:** Nuxt 4 SSR executes `<script setup>` on the server. The composable's `typeof window` guard handles the immediate call but the `setTimeout(checkGoogle, 500)` creates a lingering Node.js timeout if ever triggered server-side.

**Consequences:** Memory leaks in SSR; if any component calls the composable outside `onMounted`, Node.js timers accumulate across requests.

**Prevention:**
- Always wrap `initializeGoogleOneTap()` in `onMounted()` or guard with `if (import.meta.client)`
- In the new plugin-based approach, use `defineNuxtPlugin` with `{ ssr: false }` or check `import.meta.client`

**Detection:** Console errors like `window is not defined` during SSR, or memory growth in long-running Nuxt SSR processes.

**Source:** Nuxt 4 SSR behavior + codebase analysis (HIGH confidence)

---

### Pitfall 8: `createUserReservations` Not Called for New One Tap Users

**What goes wrong:** When a new user registers via the existing Google OAuth flow, `registerUserAuth` wraps the callback and calls `createUserReservations(user)` to create 3 free ad reservations and 3 featured reservations. A new Strapi endpoint for One Tap would NOT automatically inherit this logic.

**Consequences:** Users who register via One Tap for the first time don't receive their 3 free ad slots.

**Prevention:** The new One Tap Strapi endpoint must call `createUserReservations(user)` for newly created users (same guard: check `existingReservations.length > 0` before creating to avoid duplicates on re-authentication).

**Source:** Codebase analysis of `authController.ts` (HIGH confidence)

---

## Moderate Pitfalls

### Pitfall 9: 2-Step Verification (`overrideAuthLocal`) Bypassed by One Tap

**What goes wrong:** The existing `overrideAuthLocal` in `authController.ts` intercepts `POST /api/auth/local` and replaces the JWT with a `pendingToken` for 2-step verification via email code. The existing Google OAuth flow (`/connect/google`) intentionally bypasses this — it issues a JWT directly. One Tap will similarly bypass 2-step verification by design.

**Consequences:** This may or may not be intentional. If the business requirement is that ALL sign-ins require 2-step verification, One Tap breaks the policy. If social auth is intentionally exempt (current behavior of `/connect/google`), this is correct.

**Prevention:** Document the decision explicitly in the new One Tap Strapi endpoint. If 2-step is required, the endpoint should also issue `pendingToken + email` instead of a direct JWT. If intentionally skipped (matching the behavior of existing `/connect/google`), add a comment to that effect.

**Source:** Codebase analysis of `authController.ts` (HIGH confidence)

---

### Pitfall 10: One Tap Shows on Pages with `middleware: ['auth']` — Race Condition

**What goes wrong:** One Tap is initialized globally (e.g., in `app.vue`). On protected pages (e.g., `/cuenta/*`), the `auth` middleware redirects unauthenticated users to `/login`. If One Tap fires BEFORE the middleware redirect completes, the user might see a One Tap prompt on a protected page. After completing One Tap sign-in, they are already on the page but the auth state hasn't propagated yet, potentially triggering a redirect to `/login` anyway.

**Prevention:** 
- Check `useStrapiUser().value` before calling `prompt()` — suppress One Tap if user is already authenticated
- Only call `prompt()` on pages without `middleware: ['auth']` (public pages)

**Source:** Codebase analysis (MEDIUM confidence)

---

### Pitfall 11: One Tap Cooldown — Silently Suppressed After Dismiss (Testing Trap)

**What goes wrong:** If a user clicks the X button on One Tap, Chrome enters a **cooldown period** during which One Tap is suppressed on that site. The developer has no programmatic control over this. During this period, `prompt()` is called but nothing shows — and with FedCM enabled, `isNotDisplayed()` notifications are not even delivered.

**Consequences:** QA testers think the integration is broken after dismissing the prompt once. Hours wasted debugging a "broken" integration that is working as designed.

**Prevention:**
- In development, reset the cooldown via Chrome: click the lock icon in the address bar → Reset Permission
- Add a comment in the composable documenting the cooldown behavior
- Do NOT implement retry logic — Google explicitly prohibits it

**Source:** https://developers.google.com/identity/gsi/web/guides/fedcm-migration#one_tap_cooldown_period (HIGH confidence — official docs)

---

### Pitfall 12: COOP Header Conflict with FedCM-Disabled Fallback (Safari/Firefox)

**What goes wrong:** On browsers without FedCM support (Safari, Firefox), One Tap falls back to a popup-based flow. Google's docs state that in non-FedCM mode, the `Cross-Origin-Opener-Policy` header must be `same-origin` AND include `same-origin-allow-popups`; otherwise the popup communication breaks (blank popup window). The current `nuxt-security` COOP configuration may conflict with this.

**Prevention:** Since FedCM (Chrome 117+) covers the vast majority of users, and One Tap gracefully degrades on non-FedCM browsers by simply not showing, this is low priority. However, if cross-browser One Tap is required, audit the COOP configuration in `nuxt-security` before declaring the feature complete.

**Source:** https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#cross_origin_opener_policy (HIGH confidence — official docs)

---

## Minor Pitfalls

### Pitfall 13: One Tap Does Not Work on HTTP

**What goes wrong:** One Tap requires HTTPS in production. In development on `localhost`, it works on HTTP because `localhost` is whitelisted by Google. Any staging environment on HTTP (without a valid domain) will fail silently.

**Prevention:** Staging environments must use HTTPS. The existing `NODE_ENV !== "local"` guard for `nuxt-security` is already correctly handled. No change needed if existing staging uses HTTPS.

**Source:** https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid (HIGH confidence — official docs)

---

### Pitfall 14: `google.accounts.id.initialize()` Called Multiple Times

**What goes wrong:** If called more than once, only the LAST call's configuration is retained. The current composable guards against this with `googleOneTapInitialized`, but the guard should specifically protect only `initialize()` (not `prompt()`).

**Prevention:** Move `initialize()` to a Nuxt client-side plugin that runs exactly once. The flag is no longer needed when properly architectured.

**Source:** https://developers.google.com/identity/gsi/web/reference/js-reference#google.accounts.id.initialize (HIGH confidence — official docs)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| New Strapi endpoint for One Tap | Wrong token type — ID token ≠ OAuth access token | Build `POST /api/auth/google-one-tap` with `google-auth-library` verification |
| New Strapi endpoint for One Tap | Missing `createUserReservations` call for new users | Copy guard logic from `registerUserAuth` in `authController.ts` |
| New Strapi endpoint for One Tap | `email` used as identifier instead of `sub` | Add `google_sub` field to User; query by sub first |
| New Strapi endpoint for One Tap | 2-step bypass — document explicitly | Match behavior of existing `/connect/google` (bypass), or enforce if required |
| Nuxt composable refactor | `use_fedcm_for_prompt` deprecated; notifications broken | Remove deprecated field; use only `isDismissedMoment()` / `getDismissedReason()` |
| Nuxt composable refactor | Global flag blocks per-page `prompt()` | Separate `initialize()` (plugin, once) from `prompt()` (composable, per-page) |
| Logout flow | Dead-loop after logout if One Tap fires | Add `disableAutoSelect()` call in `useLogout.ts`; set `state_cookie_domain` |
| CSP update | Missing `connect-src` and `style-src` for `gsi/` | Update `nuxt.config.ts` security block with `/gsi/` sub-paths |
| Callback page | Passing ID token to `authenticateProvider()` | Build separate page/handler that POSTs to the new Strapi endpoint |

---

## Sources

- https://developers.google.com/identity/gsi/web/reference/js-reference (updated 2026-02-10)
- https://developers.google.com/identity/gsi/web/guides/fedcm-migration (updated 2026-02-10)
- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid (updated 2025-10-31)
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token (updated 2025-12-22)
- https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out (updated 2025-05-23)
- https://developers.google.com/identity/gsi/web/guides/display-google-one-tap (updated 2025-09-29)
- Live codebase analysis: `apps/website/nuxt.config.ts`, `apps/website/app/composables/useGoogleOneTap.ts`, `apps/website/app/composables/useLogout.ts`, `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`, `apps/website/app/pages/login/google.vue`

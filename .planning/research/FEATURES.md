# Feature Research: Google One Tap Sign-In

**Domain:** Social/Federated authentication overlay for a classified ads website
**Researched:** 2026-03-18
**Confidence:** HIGH (sourced directly from official Google Identity Services documentation, last updated 2025–2026)
---

## How Google One Tap Works

### The Core Flow

One Tap is a non-blocking overlay UI rendered by Google's GIS library (`accounts.google.com/gsi/client`). It appears on top of page content without navigation, shows the user's Google account avatar + name, and issues a **signed JWT ID token** when the user taps "Continue as [Name]." The integration receives this JWT either via:

- **JS callback** (`callback:`) — preferred for SPAs like Nuxt; the credential is handled client-side
- **Redirect** (`login_uri:`/`ux_mode: "redirect"`) — the JWT is POST-ed to your backend endpoint

For waldo.click, the **JS callback** mode is the correct choice: the Nuxt frontend intercepts the JWT, then calls a new Strapi endpoint to exchange it for a Waldo session JWT (same pattern as the existing `/login/google.vue` page that calls `authenticateProvider("google", access_token)`).

### When the Prompt Appears

One Tap renders only when:
1. The user is **signed in to at least one Google Account** in the browser
2. The user is **not already signed in** to your site (for that session)
3. Browser/user hasn't suppressed it (no cooldown active, no global opt-out)
4. The page is served over HTTPS

**If no Google session exists → One Tap does not display at all.** It silently does nothing.

### Prompt Suppression Conditions

One Tap will NOT show if:
- No active Google session in the browser
- User disabled "Apps with access to your account" sign-in prompts in Google Account settings
- User disabled "Third-party sign-in" in Chrome Privacy & Security settings
- The exponential cooldown is active (see below)
- The prompt is obscured by other content (triggers fallback pop-up instead)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must exist for One Tap to feel complete and correct.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One Tap overlay on public pages only | Core feature scope — not in `/cuenta/*`, `/pagar/*`, `/anunciar/*` | LOW | Route guard needed in Nuxt plugin; check `useRoute()` path prefix |
| JWT callback handler on frontend | The GIS library returns a credential; something must receive it | LOW | `google.accounts.id.initialize({ callback: ... })` wired in a client-side Nuxt plugin |
| New Strapi endpoint to exchange Google JWT for Waldo JWT | One Tap returns a Google ID token, not an OAuth `access_token`; existing `/login/google.vue` flow uses `authenticateProvider("google", access_token)` which is OAuth redirect — **different protocol** | MEDIUM | New `POST /api/auth/google-one-tap` endpoint in Strapi; verifies ID token via `google-auth-library`, upserts user, issues Waldo JWT |
| Auto-create account for new users | "Bypasses 2-step verification" is the user-facing promise — new users must be silently registered | MEDIUM | Reuse `createUserReservations()` from `registerUserAuth`; same upsert-or-create logic as existing Google OAuth connect |
| Bypass 2-step verification | Google already confirmed identity via their signed JWT | LOW | Strapi endpoint issues JWT directly — no `pendingToken` step; same as the existing `ctx.method === "GET"` bypass in `overrideAuthLocal` |
| `disableAutoSelect()` on logout | Prevents dead-loop: user logs out → One Tap auto-signs them back in | LOW | Call `google.accounts.id.disableAutoSelect()` inside `useLogout.ts` composable |
| Coexistence with existing Google Sign-In button | Both can appear on the same page; they share the same `google.accounts.id.initialize()` call | LOW | `initialize()` must be called exactly once — the existing redirect button and One Tap share the same GIS instance |
| Server-side ID token verification | Security requirement from Google docs: "strongly recommended to verify the Google ID token on your server side" | MEDIUM | Use `google-auth-library` (already installed for Google Sheets auth) `OAuth2Client.verifyIdToken()` in the new Strapi endpoint |
| Prompt only for unauthenticated users | One Tap must not appear when user already has a Waldo session | LOW | Check `useStrapiUser()` in the plugin; skip `google.accounts.id.prompt()` if user exists |

### Differentiators (Competitive Advantage)

Features that go beyond table stakes and add polish.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Auto sign-in for returning users (`auto_select: true`) | Zero-click sign-in for returning Google users who already consented — they land and are signed in automatically | LOW | Add `auto_select: true`; requires user previously consented; FedCM has 10-min quiet period between auto sign-ins |
| Profile completeness redirect post-One-Tap | Mirrors existing `google.vue` flow: if profile incomplete → `/cuenta/perfil/editar`; ensures data quality | LOW | Copy existing `meStore.isProfileComplete()` check from `login/google.vue` into the One Tap callback handler |
| `context: "signup"` vs `context: "signin"` | Changing prompt title to "Sign up to" for pages where registration intent is clearer (e.g., landing page) | LOW | Single config option; no implementation cost |
| ITP browser support (`itp_support: true`) | Enables upgraded UX on Safari/Firefox/Chrome iOS where normal One Tap doesn't work due to ITP | LOW | Single boolean flag; provides welcome page + pop-up fallback; **auto sign-in not supported on ITP** |
| `state_cookie_domain` for subdomain consistency | If One Tap runs on both `waldo.click` and subdomains, a shared `g_state` cookie prevents duplicate prompts | LOW | Set `state_cookie_domain: "waldo.click"` in `initialize()`; mirrors the existing `COOKIE_DOMAIN` pattern for `waldo_jwt` |
| Dark mode One Tap (`color_scheme: "default"`) | Matches user system preference automatically | LOW | `color_scheme: "default"` adapts to system; explicit dark option also available |
| Referer-aware post-login redirect | After One Tap sign-in, redirect to `appStore.getReferer` then clear it — mirrors `login/google.vue` | LOW | Same logic already exists; copy to One Tap callback |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Custom positioning of the One Tap prompt | Designers want it aligned with page layout | **With FedCM enabled (Chrome 117+, the default for new apps), browser controls position — custom positioning is ignored/unsupported.** Building layout around assumed position breaks when FedCM moves it | Accept browser-default top-right positioning; don't build any CSS around One Tap's location |
| Using `isNotDisplayed()` / `getNotDisplayedReason()` to show fallback UI | Seems useful for "show a different sign-in if One Tap is suppressed" | **These methods are removed in FedCM mode** (GIS migration guide explicitly says to delete them). They return nothing meaningful | Use `isSkippedMoment()` + `isDismissedMoment()` which remain supported under FedCM |
| Showing One Tap on protected pages (`/cuenta/*`, `/pagar/*`) | Simpler to show everywhere | Creates confusing UX: user is being signed in mid-transaction. Google explicitly warns not to show One Tap when UI action is covered by other content. These pages also have `auth` middleware already | Filter by route prefix in the Nuxt plugin |
| Custom cooldown / reset logic | Wanting to re-show One Tap immediately after dismissal | Browser controls cooldown in FedCM mode. Circumventing it violates Google's UX guidelines and risks project suspension | Respect the cooldown; Chrome DevTools "Reset Permission" exists for testing only |
| Using `email` as account identifier on the backend | Email feels like a stable unique key | **Google explicitly prohibits this.** Users can have multiple emails; emails can change. Always use the `sub` field from the JWT as the unique Google Account identifier | Store `provideridentifier` (the `sub` field) in the Strapi user record — this is what the existing Google OAuth plugin already does |
| Replacing `authenticateProvider()` call with raw JWT exchange everywhere | Seems cleaner to unify all Google auth under One Tap | The existing OAuth redirect flow (`/login/google`) is a completely different protocol (OAuth `access_token` vs. GIS `id_token`). They must stay separate | Keep both flows; One Tap adds a new endpoint, doesn't replace the redirect flow |
| Auto sign-in on ITP browsers (Safari, Firefox, Chrome iOS) | More conversions from mobile Safari users | **Not supported on ITP browsers.** Google docs explicitly state: "Auto sign in isn't supported" on ITP due to pop-up flash issues. Enabling `auto_select` on ITP triggers no-op behavior | Enable `itp_support: true` for the welcome-page fallback UX; accept that auto sign-in is Chrome/desktop only |

---

## Feature Dependencies

```
[One Tap Nuxt Plugin]
    └──requires──> [GIS Library loaded] (accounts.google.com/gsi/client)
    └──requires──> [New Strapi endpoint: POST /api/auth/google-one-tap]
                       └──requires──> [google-auth-library verifyIdToken()]
                       └──requires──> [User upsert logic (reuse from registerUserAuth)]
                       └──requires──> [createUserReservations() on first sign-up]
                       └──requires──> [Waldo JWT issuance (bypass 2-step)]

[Auto sign-in (auto_select: true)]
    └──requires──> [User previously consented] (Google manages this state)
    └──conflicts──> [ITP browsers] (auto sign-in not supported on Safari/Firefox)

[disableAutoSelect() on logout]
    └──requires──> [GIS library loaded on pages with logout button]
    └──enhances──> [useLogout.ts composable] (add call there)

[Route filtering (public pages only)]
    └──requires──> [Nuxt plugin knows current route]
    └──conflicts──> [auth middleware pages] (must not overlap)

[Profile completeness redirect]
    └──requires──> [meStore.isProfileComplete()]
    └──enhances──> [One Tap callback handler]

[state_cookie_domain]
    └──enhances──> [One Tap] (prevents duplicate prompts across subdomains)
    └──mirrors──> [COOKIE_DOMAIN pattern already in nuxt.config.ts]
```

### Dependency Notes

- **New Strapi endpoint requires `google-auth-library`:** The library is already installed (`apps/strapi` uses it in `google-auth.service.ts` for Sheets auth via `JWT` class). The `OAuth2Client.verifyIdToken()` method is a different use case but same package — no new dependency needed.
- **`disableAutoSelect()` conflicts with auto sign-in if omitted after logout:** Without calling it, the user signs out and is immediately auto-signed back in. This is the "dead loop" Google warns about explicitly.
- **One Tap and redirect button share `initialize()`:** `google.accounts.id.initialize()` must be called exactly once per page. The Nuxt plugin must not re-initialize if the redirect button also triggers initialization.

---

## UX Behavior Reference (Critical for Correct Implementation)

### Exponential Cooldown (non-FedCM browsers)

When the user manually closes One Tap by clicking the X:

| Times Closed | Suppression Period |
|---|---|
| 1 | 2 hours |
| 2 | 1 day |
| 3 | 1 week |
| 4+ | 4 weeks |

Cooldown resets after a successful sign-in. **With FedCM enabled, browser vendors define their own cooldowns** — Chrome allows reset via lock icon → "Reset Permission" (for testing only).

### Auto-Dismissal on Mobile (non-FedCM)

On mobile browsers without FedCM: One Tap auto-closes after **90 seconds** of no interaction. This does **not** trigger a cooldown.

### Auto Sign-In Behavior

- **Without FedCM:** If `auto_select: true` and user previously consented + has one Google session → ID token returned after 5 seconds with no interaction. User can cancel via "Cancel" button. Cancelling disables auto sign-in for **1 day**.
- **With FedCM:** 10-minute quiet period between auto sign-in attempts. User clicks X to cancel (no 5-second timer). Cancelling does NOT block One Tap from showing (only blocks auto sign-in briefly).

### FedCM vs. Non-FedCM Mode

| Aspect | Without FedCM | With FedCM (Chrome 117+, recommended) |
|--------|--------------|--------------------------------------|
| Third-party cookies | Required | Not needed |
| Prompt position | Customizable via `prompt_parent_id` | Browser-controlled (top-right on desktop) |
| `isDisplayed()` / `getNotDisplayedReason()` | Supported | **Removed — delete from code** |
| `getSkippedReason()` | Fully supported | Partial (no `user_cancel` reason) |
| `isDismissedMoment()` / `getDismissedReason()` | Supported | Fully supported (unchanged) |
| Cooldown | Exponential table above | Browser-vendor-defined |
| Auto sign-in reconfirmation | Not required for returning users | Required once per Chrome instance (unless 3rd-party cookies restricted) |
| ITP browsers (Safari, Firefox) | Different UX (welcome page + popup) | N/A (FedCM not available) |
| `use_fedcm_for_prompt` attribute | N/A | **Deprecated** — FedCM for One Tap is now automatic in Chrome |

**Key insight for waldo.click:** `use_fedcm_for_prompt` is now deprecated and ignored. FedCM for One Tap is automatically applied by Chrome. **Do not add this attribute.** `use_fedcm_for_button` (for the redirect button flow) is separate and optional.

### New User vs. Returning User Flows

- **New user (single Google session):** Consent page shown → user taps confirm → JWT issued
- **Returning user (single Google session):** "Continue as [Name]" button → one tap → JWT issued
- **Multiple Google sessions:** Account chooser shown first → then consent or continue
- **Auto sign-in (returning user, `auto_select: true`):** JWT issued automatically after 5 seconds (non-FedCM) or via quiet-period mechanic (FedCM)

---

## MVP Definition

### Launch With (v1 — this milestone)

- [x] **One Tap Nuxt plugin** — loads GIS library, calls `initialize()` + `prompt()` on public pages only
- [x] **Route guard** — skip One Tap on `/cuenta/*`, `/pagar/*`, `/anunciar/*`
- [x] **Skip if authenticated** — check `useStrapiUser()`, suppress prompt if session exists
- [x] **JWT callback handler** — receive credential, call new Strapi endpoint, store JWT, redirect
- [x] **New Strapi endpoint `POST /api/auth/google-one-tap`** — verify Google ID token, upsert user, call `createUserReservations()` for new accounts, issue Waldo JWT (bypass 2-step)
- [x] **`disableAutoSelect()` in `useLogout.ts`** — prevents dead-loop after logout

### Add After Validation (v1.x)

- [ ] **Auto sign-in (`auto_select: true`)** — add after confirming basic One Tap works; risk of dead-loop if logout handling incomplete
- [ ] **ITP support (`itp_support: true`)** — validate on Safari/Firefox after base flow confirmed
- [ ] **`state_cookie_domain`** — only needed if One Tap will be added to other waldo.click subdomains

### Future Consideration (v2+)

- [ ] **`context: "signup"` variant on landing pages** — minor copy tuning, low priority
- [ ] **One Tap on AMP pages** — not applicable to Nuxt/Nitro stack

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| One Tap plugin + public route guard | HIGH | LOW | P1 |
| JWT callback → new Strapi endpoint | HIGH | MEDIUM | P1 |
| New user account creation (upsert) | HIGH | MEDIUM | P1 |
| Bypass 2-step verification | HIGH | LOW | P1 |
| disableAutoSelect() on logout | HIGH | LOW | P1 |
| Coexistence with redirect button | HIGH | LOW | P1 |
| Profile completeness redirect | MEDIUM | LOW | P2 |
| Auto sign-in (auto_select) | MEDIUM | LOW | P2 |
| ITP browser support | LOW | LOW | P2 |
| state_cookie_domain | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch (this milestone)
- P2: Should have, add when stable
- P3: Nice to have, future consideration

---

## Integration with Existing Infrastructure

### What Already Exists (DO NOT Re-Build)

| Existing Piece | How One Tap Connects |
|----------------|----------------------|
| `registerUserAuth` in `authController.ts` | Contains `createUserReservations()` — call this for new One Tap registrations |
| Google OAuth `ctx.method === "GET"` bypass in `overrideAuthLocal` | Established pattern for bypassing 2-step for Google; One Tap new endpoint follows same principle |
| `useLogout.ts` composable (website) | Add `google.accounts.id.disableAutoSelect()` call here |
| `meStore.isProfileComplete()` | Call after One Tap sign-in to redirect incomplete profiles |
| `appStore.getReferer` / `clearReferer()` | Use for post-login redirect (same as `login/google.vue`) |
| `google-auth-library` package | Already installed; `OAuth2Client.verifyIdToken()` is the ID token verification method needed |
| `COOKIE_DOMAIN` pattern in `nuxt.config.ts` | Reference for `state_cookie_domain` value |
| `nuxt-security` CSP in `nuxt.config.ts` | Must add Google GIS domains to CSP: `accounts.google.com`, `*.googleusercontent.com` |

### What Must Be Built New

| New Piece | Notes |
|-----------|-------|
| Nuxt plugin `google-one-tap.client.ts` | Client-only plugin; loads GIS, calls `initialize()` + conditional `prompt()` |
| `POST /api/auth/google-one-tap` Strapi endpoint | Verify ID token → upsert user → issue JWT; new API domain separate from users-permissions |
| Route filtering logic | Check `useRoute().path` against protected prefixes before calling `prompt()` |

---

## Sources

- [Google Identity Services Overview](https://developers.google.com/identity/gsi/web/guides/overview) — Updated 2026-02-10 (HIGH confidence)
- [One Tap UX Guide](https://developers.google.com/identity/gsi/web/guides/features) — Updated 2025-05-19 (HIGH confidence); cooldown tables, ITP behavior, auto-dismissal
- [Display Google One Tap](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap) — Updated 2025-09-29 (HIGH confidence); prompt status moments, callback/redirect modes
- [Automatic Sign-In and Sign-Out](https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out) — Updated 2025-05-23 (HIGH confidence); auto_select behavior, FedCM quiet period, disableAutoSelect
- [Migrate to FedCM](https://developers.google.com/identity/gsi/web/guides/fedcm-migration) — Updated 2026-02-10 (HIGH confidence); deprecated methods, removed APIs, migration steps
- [JavaScript API Reference](https://developers.google.com/identity/gsi/web/reference/js-reference) — Updated 2026-02-10 (HIGH confidence); IdConfiguration fields, CredentialResponse, select_by values
- [Verify the Google ID Token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token) — Updated 2025-12-22 (HIGH confidence); server-side verification with Node.js google-auth-library

---
*Feature research for: Google One Tap Sign-In on waldo.click (Nuxt 4 classified ads website)*
*Researched: 2026-03-18*

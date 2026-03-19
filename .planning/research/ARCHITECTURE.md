# Architecture Research

**Domain:** Google One Tap Sign-In integration — Nuxt 4 SSR website + Strapi v5 backend
**Researched:** 2026-03-18
**Confidence:** HIGH

---

## Executive Answer: The Four Key Questions

### Q1 — Can Strapi's existing `GET /api/connect/google/callback` validate a GIS credential (ID token)?

**No — and the current `useGoogleOneTap.ts` is exploiting an undocumented coincidence.**

Strapi's Google provider (`providers-registry.js` line 116–128) calls Google's `tokeninfo` endpoint:

```js
google.query('oauth').get('tokeninfo').qs({ accessToken }).request()
```

The GIS `credential` is a signed **ID token (JWT)**, not an OAuth access token. However, Google's `tokeninfo` endpoint happens to accept **both** OAuth access tokens AND ID tokens as the `access_token` query parameter — making the current redirect trick (`/login/google?access_token=<ID_TOKEN>`) function in practice.

**The problem:** This is fragile. Google's docs explicitly state the `tokeninfo` endpoint is for *debugging only* and may be throttled. The Strapi `connect()` function also gates on `query.access_token` being present and immediately throws `'No access_token.'` if absent — meaning you cannot pass an ID token via a different field name without bypassing this check.

**Conclusion:** The existing OAuth redirect approach is brittle and page-redirect-based (forces a full page reload to `/login/google`). The correct architecture for One Tap is a **new dedicated Strapi endpoint** that accepts a GIS `credential` (ID token), verifies it server-side with `google-auth-library`'s `OAuth2Client.verifyIdToken()`, then finds/creates the user and issues a Waldo JWT directly — no page redirect needed.

### Q2 — Where should One Tap be initialized in Nuxt 4?

**A client-only plugin** (`plugins/google-one-tap.client.ts`).

Rationale: One Tap must run on every page for returning users (not just `/login`), it must check auth state before prompting, and it must not block SSR. A plugin registered with `.client.ts` suffix runs once after hydration, exactly when `window.google` becomes available. The existing `useGoogleOneTap.ts` composable should handle the initialization *logic*, called from the plugin. The current architecture in `default.vue` (commented-out `onMounted`) points toward this pattern but left it incomplete.

### Q3 — How to handle the SSR constraint?

Three layers of SSR guarding are needed:

1. **Plugin suffix:** `.client.ts` — Nuxt never executes this on the server
2. **`if (typeof window === 'undefined') return`** — already in `useGoogleOneTap.ts` as defense-in-depth
3. **Auth-state check before `prompt()`:** check `useStrapiUser()` — if already authenticated, skip One Tap entirely to avoid double-prompt

The GIS SDK is already loaded via `nuxt.config.ts` `app.head.script` (async + defer), so it will be available client-side after hydration.

### Q4 — How does the credential JWT get exchanged for a Strapi JWT and cookie?

**New Strapi endpoint `POST /api/auth/google-one-tap`** handles the full exchange:

1. Frontend sends `{ credential: "<GIS_ID_TOKEN>" }` via `useApiClient` (POST → recaptcha token added automatically)
2. Strapi verifies the ID token with `OAuth2Client.verifyIdToken()` from `google-auth-library`
3. Strapi finds or creates the Strapi user (same logic as existing `connect()` in `providers.js`)
4. Strapi creates ad-reservations if new user (via `createUserReservations()` in `authController.ts`)
5. Strapi issues a Waldo JWT: `strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id })`
6. Response: `{ jwt, user }` — identical shape to existing auth responses
7. Frontend calls `useStrapi().setToken(jwt)` + `fetchUser()` — same pattern as `FormVerifyCode.vue`
8. `@nuxtjs/strapi` module stores JWT in `waldo_jwt` cookie with `COOKIE_DOMAIN` spread — no custom cookie code needed

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BROWSER (client-only)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  GIS SDK (accounts.google.com/gsi/client — already in head.script)  │
│      ↓  (window.google.accounts.id.initialize + prompt)             │
│  google-one-tap.client.ts plugin                                     │
│      ↓  (credential: string — signed ID token JWT)                  │
│  useGoogleOneTap composable  ←→  useApiClient (POST + recaptcha)    │
│      ↓                                                               │
│  POST /api/auth/google-one-tap  →  Nitro proxy  →  Strapi           │
│      ↓                                                               │
│  { jwt, user }  →  setToken(jwt) + fetchUser()                      │
│      ↓                                                               │
│  @nuxtjs/strapi writes waldo_jwt cookie (Domain=.waldo.click)       │
│      ↓                                                               │
│  navigateTo(redirectTo || '/anuncios')                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP POST (credential)
┌─────────────────────────────────────────────────────────────────────┐
│                     STRAPI v5 (apps/strapi)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  POST /api/auth/google-one-tap                                       │
│    └── GoogleOneTapController                                        │
│          ├── GoogleOneTapService.verifyCredential(credential)        │
│          │     └── OAuth2Client.verifyIdToken() [google-auth-library]│
│          │           → payload: { sub, email, given_name, ... }      │
│          ├── findOrCreateUser(payload)                               │
│          │     └── strapi.db.query('users-permissions.user')         │
│          │           find by email → return OR create + reservations │
│          └── jwt.issue({ id: user.id }) → { jwt, user }             │
│                                                                      │
│  BYPASSES: overrideAuthLocal (ctx.method === "GET" guard won't help  │
│  here — this is a new endpoint, not /api/auth/local)                 │
│  BYPASSES: 2-step verification (One Tap = already verified by Google)│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Location |
|-----------|----------------|----------|
| `google-one-tap.client.ts` | Plugin: check auth state, call `initializeGoogleOneTap()` on every page after hydration | `apps/website/app/plugins/` |
| `useGoogleOneTap.ts` | Composable: GIS SDK init, `prompt()`, credential callback, POST to Strapi, setToken + navigateTo | `apps/website/app/composables/` |
| `GoogleOneTapService` | Strapi service: `verifyCredential(credential)` using `OAuth2Client.verifyIdToken()` | `apps/strapi/src/services/google-one-tap/` |
| `POST /api/auth/google-one-tap` | Strapi endpoint: validate credential → find/create user → issue JWT | `apps/strapi/src/api/auth-one-tap/` |
| `createUserReservations()` | Existing function in `authController.ts`: creates 3 free ad + featured reservations for new users | `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` |

---

## Recommended Project Structure

### Strapi (new files)

```
apps/strapi/src/
├── api/
│   └── auth-one-tap/                    # Standard Strapi content API (not plugin route)
│       ├── controllers/
│       │   └── auth-one-tap.ts          # POST handler — validates + issues JWT
│       └── routes/
│           └── auth-one-tap.ts          # Route definition for /api/auth/google-one-tap
└── services/
    └── google-one-tap/                  # New service domain
        ├── google-one-tap.service.ts    # verifyCredential() using OAuth2Client
        ├── google-one-tap.types.ts      # IGoogleOneTapService, IGoogleOneTapPayload
        └── index.ts                     # Singleton export
```

### Website (modified files)

```
apps/website/app/
├── plugins/
│   └── google-one-tap.client.ts        # NEW: plugin that calls initializeGoogleOneTap()
├── composables/
│   └── useGoogleOneTap.ts              # REWRITE: remove redirect, add POST + setToken flow
└── types/
    └── window.d.ts                     # EXTEND: add cancel() to window.google.accounts.id
```

### Structure Rationale

- **`api/auth-one-tap/` (not plugin extension):** Same lesson learned as `auth-verify/` — plugin.routes factory is unreliable in Strapi v5. Standard content-API routes in `src/api/` work correctly every time.
- **`services/google-one-tap/`:** Follows the established service pattern (config, service, types, index). `google-auth-library` is already in the monorepo (transitive dep of `googleapis`).
- **Plugin suffix `.client.ts`:** Nuxt auto-excludes from SSR — no `import.meta.client` guard needed at the entry point.

---

## Architectural Patterns

### Pattern 1: New Strapi Endpoint for ID Token Exchange

**What:** `POST /api/auth/google-one-tap` accepts a GIS credential (ID token JWT), verifies it server-side, finds/creates the Strapi user, and returns `{ jwt, user }`.

**When to use:** Whenever the credential arrives from the browser as a GIS callback — both One Tap prompt and the "Sign in with Google" button's popup mode.

**Trade-offs:** Adds a new endpoint (minor complexity), but gives full control over user creation logic, reservation creation, and bypasses the fragile `tokeninfo` redirect hack.

**Example — Strapi controller:**
```typescript
// apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts
import { verifyGoogleCredential, findOrCreateUser } from '../../../services/google-one-tap';
import { createUserReservations } from '../../../extensions/users-permissions/controllers/authController';
import { Context } from 'koa';

export default {
  googleOneTap: async (ctx: Context) => {
    const { credential } = ctx.request.body as { credential?: string };
    if (!credential) return ctx.badRequest('credential is required');

    // 1. Verify ID token with Google
    const payload = await verifyGoogleCredential(credential);
    if (!payload) return ctx.unauthorized('Invalid Google credential');

    // 2. Find or create user
    const { user, isNew } = await findOrCreateUser(payload);

    // 3. Create reservations for new users (non-fatal)
    if (isNew) {
      createUserReservations(user).catch(() => {});
    }

    // 4. Issue Waldo JWT
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id });

    // 5. Sanitize user (same as auth.local)
    const userSchema = strapi.getModel('plugin::users-permissions.user');
    const sanitizedUser = await strapi.contentAPI.sanitize.output(
      user,
      userSchema,
      { auth: ctx.state.auth }
    );

    ctx.body = { jwt, user: sanitizedUser };
  },
};
```

**Example — GoogleOneTapService:**
```typescript
// apps/strapi/src/services/google-one-tap/google-one-tap.service.ts
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { IGoogleOneTapService } from './google-one-tap.types';

export class GoogleOneTapService implements IGoogleOneTapService {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    if (!this.clientId) throw new Error('GOOGLE_CLIENT_ID is not set');
    this.client = new OAuth2Client(this.clientId);
  }

  async verifyCredential(credential: string): Promise<TokenPayload | null> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: this.clientId,
      });
      return ticket.getPayload() ?? null;
    } catch {
      return null;
    }
  }
}
```

### Pattern 2: Client-Only Plugin Initialization

**What:** `plugins/google-one-tap.client.ts` calls `initializeGoogleOneTap()` once after hydration, guarded by auth-state check.

**When to use:** Any global behavior that must run client-side on every page (analytics, chat, SDKs).

**Trade-offs:** Runs on every page — must be fast and non-blocking. The `prompt()` call is asynchronous and Google silences it if the user is already in a session or has dismissed too many times.

**Example:**
```typescript
// apps/website/app/plugins/google-one-tap.client.ts
export default defineNuxtPlugin(() => {
  const user = useStrapiUser();
  const { initializeGoogleOneTap } = useGoogleOneTap();

  // Skip if already authenticated
  if (user.value) return;

  initializeGoogleOneTap();
});
```

### Pattern 3: setToken + fetchUser Cookie Pattern

**What:** After receiving `{ jwt, user }` from Strapi, call `useStrapi().setToken(jwt)` then `useStrapiAuth().fetchUser()` to hydrate the session — exactly matching `FormVerifyCode.vue`.

**When to use:** Any Strapi auth flow that issues a JWT outside the standard `POST /api/auth/local` path.

**Trade-offs:** `@nuxtjs/strapi` handles cookie persistence automatically with the `waldo_jwt` name and `COOKIE_DOMAIN` spread — no manual `document.cookie` manipulation needed.

**Example (inside `handleCredentialResponse` in `useGoogleOneTap.ts`):**
```typescript
const { setToken } = useStrapi();
const { fetchUser } = useStrapiAuth();
const appStore = useAppStore();
const { login } = useAdAnalytics();

const response = await apiClient<{ jwt: string; user: StrapiUser }>(
  '/auth/google-one-tap',
  { method: 'POST', body: { credential } }
);

setToken(response.jwt);
await fetchUser();
login('google');

const redirectTo = appStore.getReferer || '/anuncios';
appStore.clearReferer();
await navigateTo(redirectTo);
```

---

## Data Flow

### One Tap Credential Flow (complete)

```
[User sees One Tap prompt — client-side only]
    ↓
[User approves → GIS SDK calls handleCredentialResponse({ credential })]
    ↓
[useGoogleOneTap: POST /api/auth/google-one-tap + recaptcha token]
    ↓
[Nitro proxy forwards to Strapi — recaptcha validated by middleware]
    ↓
[Strapi GoogleOneTapService.verifyCredential(credential)]
    ↓  ← OAuth2Client.verifyIdToken() → Google JWKS endpoint
[TokenPayload: { sub, email, given_name, family_name, picture, ... }]
    ↓
[findOrCreateUser(payload)]
    ├── EXISTS: strapi.db.query find by email + provider='google'
    └── NEW: create user (confirmed:true, provider:'google') + createUserReservations()
    ↓
[jwt.issue({ id: user.id }) → { jwt, user }]
    ↓
[Frontend: setToken(jwt) → @nuxtjs/strapi writes waldo_jwt cookie]
    ↓
[fetchUser() → useStrapiUser() populated]
    ↓
[navigateTo(appStore.referer || '/anuncios')]
```

### Existing Google OAuth Flow (unchanged)

```
[User clicks "Ingresa con Google"]
    ↓
[redirectToProvider('google') → window.location.href = Strapi OAuth URL]
    ↓
[Google consent screen → GET /api/connect/google/callback?access_token=...]
    ↓
[Strapi providers.js: google.tokeninfo(accessToken) → email]
    ↓
[registerUserAuth: find/create user + createUserReservations()]
    ↓
[Strapi issues JWT → @nuxtjs/strapi writes waldo_jwt]
    ↓
[login/google.vue: authenticateProvider() → navigateTo(referer || '/anuncios')]
```

### 2-Step Verification Bypass (confirmed not needed for One Tap)

The `overrideAuthLocal` intercepts `POST /api/auth/local` only. `POST /api/auth/google-one-tap` is a separate endpoint that issues JWT directly — Google has already verified the user's identity via the signed ID token. No 2-step verification is appropriate (nor triggered).

---

## Integration Points

### Existing Components — What Changes

| Component | Status | Change |
|-----------|--------|--------|
| `useGoogleOneTap.ts` | **REWRITE** | Remove `window.location.href` redirect; add `useApiClient` POST + `setToken` + `fetchUser` + `navigateTo` |
| `default.vue` layout | **UNCOMMENT** | Re-enable `initializeGoogleOneTap()` call — now it works end-to-end |
| `window.d.ts` | **EXTEND** | Add `cancel(): void` to `window.google.accounts.id` type |
| `login/google.vue` | **UNCHANGED** | Still handles traditional OAuth callback with `access_token` query param |
| `authController.ts` | **UNCHANGED** | `createUserReservations()` is reused by new endpoint |
| `overrideAuthLocal` | **UNCHANGED** | One Tap bypasses it entirely — different endpoint |
| `nuxt.config.ts` CSP | **VERIFY** | `accounts.google.com` already in `script-src`; `connect-src` needs `https://oauth2.googleapis.com` for JWKS validation (Strapi server-side — may not need frontend CSP update) |

### New Components — What Gets Built

| Component | Type | Description |
|-----------|------|-------------|
| `apps/strapi/src/api/auth-one-tap/` | Strapi content API | Controller + route for `POST /api/auth/google-one-tap` |
| `apps/strapi/src/services/google-one-tap/` | Strapi service | `GoogleOneTapService` wrapping `OAuth2Client.verifyIdToken()` |
| `apps/website/app/plugins/google-one-tap.client.ts` | Nuxt plugin | Auth-state guard + `initializeGoogleOneTap()` call |

### CSP Audit

The existing `nuxt.config.ts` CSP already includes:
- `script-src`: `https://accounts.google.com` ✓
- `frame-src`: `https://accounts.google.com`, `https://www.google.com`, `https://www.gstatic.com` ✓ (FedCM One Tap needs these)
- `connect-src`: `https:` wildcard ✓ (covers Google JWKS endpoint on Strapi's server — no browser CSP applies to server-side calls)

**No CSP changes required.** The JWKS fetch happens Strapi-side (Node.js), not in the browser.

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Identity Services SDK | `accounts.google.com/gsi/client` loaded async in `head.script` | Already configured in `nuxt.config.ts` |
| Google JWKS endpoint | `OAuth2Client.verifyIdToken()` fetches `https://www.googleapis.com/oauth2/v3/certs` | Server-side (Strapi) — no browser CSP concern; `google-auth-library` caches keys per `Cache-Control` header |
| `google-auth-library` | `OAuth2Client` from `google-auth-library` npm package | Already available in monorepo (transitive dep of `googleapis@^148.0.0`) — `yarn add` not needed |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Plugin → Composable | Direct function call | Plugin calls `initializeGoogleOneTap()` from `useGoogleOneTap` |
| Composable → Strapi | `useApiClient` POST (recaptcha injected automatically) | Matches existing mutation pattern |
| Strapi controller → service | Direct import from `services/google-one-tap/index.ts` | Follows AGENTS.md: "Other modules import from `index.ts` only" |
| Strapi controller → `createUserReservations` | Import from `authController.ts` | Reuses existing reservation creation — must handle async errors gracefully (non-fatal) |

---

## Anti-Patterns

### Anti-Pattern 1: Reusing the OAuth Redirect for One Tap

**What people do:** Pass the GIS `credential` (ID token) as `access_token` query param → redirect to `/login/google` → Strapi's `tokeninfo` endpoint happens to accept it.

**Why it's wrong:**
- Forces a full page reload (bad UX — One Tap's value is frictionless sign-in)
- Google's `tokeninfo` endpoint is a debugging endpoint — may be throttled in production
- ID tokens expire in 1 hour; a slow redirect chain increases the risk of expiry
- The current `useGoogleOneTap.ts` already does this (line 27), and it's why the feature is commented out in `default.vue` — it doesn't complete the auth session properly

**Do this instead:** POST the credential directly to a dedicated Strapi endpoint, receive `{ jwt, user }`, call `setToken` + `fetchUser` — no page reload.

### Anti-Pattern 2: Initializing One Tap in a Component (not a plugin)

**What people do:** Call `window.google.accounts.id.initialize()` in `onMounted` of a specific page or layout component.

**Why it's wrong:** One Tap should show on *every* public page for returning users — not just on `/login`. If initialized only in a page component, the prompt never shows when users land on `/anuncios` or the homepage.

**Do this instead:** Initialize in `plugins/google-one-tap.client.ts` — runs once after hydration on all routes.

### Anti-Pattern 3: Using Plugin Extension Routes for New Auth Endpoints

**What people do:** Push new routes via `plugin.routes["content-api"].routes.push(...)` in `strapi-server.ts`.

**Why it's wrong:** Already documented in `strapi-server.ts` comment (line 56–62): `plugin.routes["content-api"]` is a factory function in Strapi v5 — pushed routes are set as properties on the function object and are *ignored* when the factory is invoked during bootstrap.

**Do this instead:** Create a standard Strapi content API in `src/api/auth-one-tap/` — same pattern as `auth-verify/`.

### Anti-Pattern 4: Calling `prompt()` Without Auth-State Guard

**What people do:** Call `window.google.accounts.id.prompt()` unconditionally on every page.

**Why it's wrong:** Authenticated users see the One Tap prompt, which is confusing and can interfere with existing sessions.

**Do this instead:** Check `useStrapiUser().value` in the plugin before calling `initializeGoogleOneTap()`. If user is logged in, skip entirely.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (< 10K users) | Single Strapi instance handles JWKS fetch + JWT issuance — no scaling concern |
| 10K–100K users | `google-auth-library` caches JWKS keys per `Cache-Control` — typically 6 hours; no per-request Google API call |
| 100K+ users | Consider caching JWKS keys in Redis; the `OAuth2Client` instance should be a singleton (already the case with service module pattern) |

---

## Build Order Suggestion

Based on dependencies between components:

1. **Strapi: `GoogleOneTapService`** (`services/google-one-tap/`) — foundation; no deps on other new code
2. **Strapi: `POST /api/auth/google-one-tap`** (`api/auth-one-tap/`) — depends on service from step 1
3. **Website: `useGoogleOneTap.ts` rewrite** — depends on Strapi endpoint being live (or mockable)
4. **Website: `plugins/google-one-tap.client.ts`** — depends on composable from step 3
5. **Website: `default.vue` uncomment** — depends on plugin from step 4
6. **Verify: `window.d.ts` types** — extend `window.google.accounts.id` with `cancel()` for typeCheck

Steps 1–2 are pure Strapi and can be developed/tested independently. Steps 3–5 are pure frontend and require only the endpoint URL to be known. Step 6 is a minor type fixup at the end.

---

## Sources

- Google Identity Services — "Verify the Google ID token on your server side": https://developers.google.com/identity/gsi/web/guides/verify-google-id-token (HIGH confidence — official docs, verified 2026-03-18)
- Google OpenID Connect — tokeninfo debugging endpoint: https://developers.google.com/identity/openid-connect/openid-connect#validatinganidtoken (HIGH confidence — official docs)
- Strapi users-permissions `providers.js` source: `/node_modules/@strapi/plugin-users-permissions/server/services/providers.js` (HIGH confidence — local source)
- Strapi users-permissions `providers-registry.js` Google handler: local source lines 107–129 (HIGH confidence — local source)
- `google-auth-library` availability: confirmed in monorepo as transitive dependency of `googleapis@^148.0.0` (HIGH confidence — verified locally)
- Existing `strapi-server.ts` comment on plugin route limitation: local source lines 56–62 (HIGH confidence — code comment documenting lived experience)
- Existing `authController.ts` `createUserReservations()`: local source (HIGH confidence — implementation detail confirmed)
- Existing `auth-verify/` pattern for standard content API routes: local source (HIGH confidence — proven pattern in codebase)

---
*Architecture research for: Google One Tap Sign-In — Waldo classified ads platform*
*Researched: 2026-03-18*

# Phase 097: Strapi One Tap Endpoint — Research

**Researched:** 2026-03-19
**Domain:** Strapi v5 custom auth endpoint — Google ID token verification + user upsert
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GTAP-03 | `POST /api/auth/google-one-tap` accepts a credential JWT, verifies with `OAuth2Client.verifyIdToken()`, returns `{ jwt, user }` | Standard `auth-verify/` content API pattern; `google-auth-library` available as transitive dep; `verifyCode` controller as structural template |
| GTAP-04 | Existing user (by `sub` or email) is authenticated without creating a duplicate account | User schema has no `google_sub` field yet — must add to schema.json; lookup by email+provider as fallback matching existing `providers.js` logic |
| GTAP-05 | New account is auto-created and `createUserReservations()` is called for 3 free ad slots | `createUserReservations()` confirmed in `authController.ts` lines 11–65; already guards against duplicate reservations (price=0 check) |
| GTAP-06 | Endpoint bypasses 2-step verification (same behavior as `/connect/google`) | New endpoint in `src/api/` is orthogonal to `overrideAuthLocal` — no interception happens; bypass is by architectural design, not by explicit override |
</phase_requirements>

---

## Summary

Phase 097 builds a single new Strapi endpoint — `POST /api/auth/google-one-tap` — that verifies a Google Identity Services credential (ID token JWT) server-side and returns a valid Waldo session as `{ jwt, user }`. Everything this phase needs is already in the codebase or trivially accessible: the `auth-verify/` content API pattern is the exact structural template, `google-auth-library` is already available as a hoisted transitive dep of `googleapis@148.0.0` (version 9.15.1 — confirmed with `yarn why`), and `createUserReservations()` in `authController.ts` already guards against duplicate free slots.

The critical design decision for GTAP-04 is user lookup order: **find by `google_sub` field first** (to be added to `schema.json`), then fall back to finding by email + `provider: 'local'` (account linking for users who previously registered with email/password and are now using One Tap with the same address). The existing OAuth flow in Strapi's `providers.js` queries by `email` only — this phase must be more precise. The `google_sub` field does **not** exist in the current `schema.json` (confirmed by inspection); it must be added as a new custom field.

The 2-step bypass (GTAP-06) is automatic: `overrideAuthLocal` in `strapi-server.ts` intercepts only `POST /api/auth/local`. A new endpoint in `src/api/auth-one-tap/` is entirely independent — the intercept never fires, and the new controller issues a JWT directly via `strapi.plugins['users-permissions'].services.jwt.issue()`, matching the exact pattern already used in `verifyCode` (line 314 of `authController.ts`).

**Primary recommendation:** Follow the `auth-verify/` pattern exactly (controller + routes file, imported function from `authController.ts`-equivalent service layer). The Google service logic lives in a new `services/google-one-tap/` subdomain under `src/services/`. The controller stays thin and delegates to the service.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `google-auth-library` | 9.15.1 (hoisted) | `OAuth2Client.verifyIdToken()` for RS256 JWT validation | Google's official Node.js client; handles JWKS fetch + caching + `aud`/`iss`/`exp` checks automatically |
| Strapi v5 `strapi.db.query()` | 5.39.0 | User create/find in `plugin::users-permissions.user` | Project standard — same API used in `verifyCode`, `overrideForgotPassword`, `createUserReservations` |
| Strapi JWT service | 5.39.0 | `strapi.plugins['users-permissions'].services.jwt.issue()` | Exact pattern used in `verifyCode` (line 314) — proven, already in codebase |
| Strapi content API sanitizer | 5.39.0 | `strapi.contentAPI.sanitize.output()` | Exact pattern used in `verifyCode` (lines 318–323) — strips private fields before response |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `OAuth2Client` (from `google-auth-library`) | 9.15.1 | Singleton client instantiated with `GOOGLE_CLIENT_ID` | Instantiated once in `GoogleOneTapService` constructor; JWKS keys cached per `Cache-Control` |
| `TokenPayload` (from `google-auth-library`) | 9.15.1 | TypeScript type for decoded ID token fields (`sub`, `email`, `given_name`, etc.) | Used as return type for `verifyCredential()` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `google-auth-library` | Manual JWT decode + JWKS fetch | Never hand-roll: JWKS rotation, RS256 validation, `aud`/`iss` checks are subtle and security-critical |
| Standard content API (`src/api/`) | Plugin extension routes | Plugin routes broken in Strapi v5 (documented in `strapi-server.ts` lines 56–62) — content API works every time |
| Dedicated `google_sub` field | Email as lookup key | Google explicitly prohibits email as primary key; `sub` is the correct stable identifier |

**Installation:**
```bash
# No new packages needed — google-auth-library is already hoisted from googleapis
# yarn why google-auth-library confirms: version 9.15.1, hoisted from googleapis#google-auth-library
# If yarn.lock changes require explicit dep, run:
# yarn workspace waldo-strapi add google-auth-library
```

> **Verified:** `node -e "const { OAuth2Client } = require('google-auth-library'); const c = new OAuth2Client('test'); console.log(typeof c.verifyIdToken);"` returns `function` — the module is importable without any install step.

---

## Architecture Patterns

### Recommended Project Structure

```
apps/strapi/src/
├── api/
│   └── auth-one-tap/                      # NEW — mirrors auth-verify/ exactly
│       ├── controllers/
│       │   └── auth-one-tap.ts            # POST handler — thin controller, delegates to service
│       └── routes/
│           └── auth-one-tap.ts            # Route: POST /auth/google-one-tap, auth:false
└── services/
    └── google-one-tap/                    # NEW — service domain
        ├── google-one-tap.service.ts      # GoogleOneTapService class + findOrCreateUser
        ├── google-one-tap.types.ts        # IGoogleOneTapService, IGoogleOneTapPayload
        └── index.ts                       # Re-exports everything + singleton export
```

And one schema change:
```
apps/strapi/src/extensions/users-permissions/content-types/user/
└── schema.json                            # ADD: google_sub (string, unique, private, indexed)
```

### Pattern 1: Standard Content API Route Registration (from `auth-verify/`)

**What:** New auth endpoints go in `src/api/<name>/`, not in plugin extension routes.

**When to use:** Any new Strapi endpoint that doesn't map to an existing content type CRUD.

**Example — routes file (exact mirror of `auth-verify/routes/auth-verify.ts`):**
```typescript
// apps/strapi/src/api/auth-one-tap/routes/auth-one-tap.ts
export default {
  routes: [
    {
      method: "POST",
      path: "/auth/google-one-tap",
      handler: "auth-one-tap.googleOneTap",
      config: {
        auth: false,       // User has no JWT yet — this is how they get one
        policies: [],
        middlewares: [],
      },
    },
  ],
};
```

### Pattern 2: Thin Controller Delegating to Service (from `auth-verify/controllers/auth-verify.ts`)

**What:** Controller stays thin — validates input, calls service, issues JWT, sanitizes output.

**When to use:** Any Strapi controller that orchestrates multiple service calls.

**Example — controller:**
```typescript
// apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts
import { googleOneTapService } from "../../../services/google-one-tap";
import { Context } from "koa";

export default {
  googleOneTap: async (ctx: Context) => {
    const { credential } = ctx.request.body as { credential?: string };
    if (!credential) return ctx.badRequest("credential is required");

    // 1. Verify Google ID token
    const payload = await googleOneTapService.verifyCredential(credential);
    if (!payload) return ctx.unauthorized("Invalid or expired Google credential");

    // 2. Find or create user
    const { user, isNew } = await googleOneTapService.findOrCreateUser(payload);

    // 3. Create reservations for new users (non-fatal, mirrors registerUserAuth pattern)
    if (isNew) {
      const { createUserReservations } = await import(
        "../../../extensions/users-permissions/controllers/authController"
      );
      createUserReservations(user).catch((err) =>
        strapi.log.error(`[googleOneTap] createUserReservations failed: ${err?.message}`)
      );
    }

    // 4. Issue Waldo JWT — same call as verifyCode (authController.ts line 314)
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    // 5. Sanitize user — same call as verifyCode (authController.ts lines 318-323)
    const userSchema = strapi.getModel("plugin::users-permissions.user");
    const sanitizedUser = await strapi.contentAPI.sanitize.output(
      user,
      userSchema,
      { auth: ctx.state.auth }
    );

    ctx.body = { jwt, user: sanitizedUser };
  },
};
```

### Pattern 3: GoogleOneTapService Singleton (mirrors `google/` service structure)

**What:** Class-based service with `OAuth2Client` singleton, exported as module-level instance.

**When to use:** Any Strapi service wrapping an external client that should be reused across requests.

**Example — service:**
```typescript
// apps/strapi/src/services/google-one-tap/google-one-tap.service.ts
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { IGoogleOneTapService, IGoogleOneTapPayload } from "./google-one-tap.types";

export class GoogleOneTapService implements IGoogleOneTapService {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID ?? "";
    if (!this.clientId) throw new Error("GOOGLE_CLIENT_ID is not set");
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
      return null; // Invalid or expired credential — caller maps to 401
    }
  }

  async findOrCreateUser(
    payload: TokenPayload
  ): Promise<{ user: Record<string, unknown>; isNew: boolean }> {
    const { sub, email, given_name, family_name } = payload;

    // Step 1: Look up by google_sub — the stable Google identifier
    // Google prohibits email as primary key (sub is immutable, email can change)
    const byGoogleSub = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { google_sub: sub } });

    if (byGoogleSub) return { user: byGoogleSub, isNew: false };

    // Step 2: Email fallback — link existing local account (same email, provider='local')
    // This handles: user registered with email+password, now uses One Tap with same email
    const byEmail = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: (email ?? "").toLowerCase() } });

    if (byEmail) {
      // Store sub for future direct lookups
      const updated = await strapi.db
        .query("plugin::users-permissions.user")
        .update({ where: { id: byEmail.id }, data: { google_sub: sub } });
      return { user: updated, isNew: false };
    }

    // Step 3: Create new user
    // Waldo requires: firstname, lastname, rut, username — set sensible defaults for Google users
    const defaultRole = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "authenticated" } });

    const newUser = await strapi.db
      .query("plugin::users-permissions.user")
      .create({
        data: {
          google_sub: sub,
          email: (email ?? "").toLowerCase(),
          username: (email ?? sub).split("@")[0],
          firstname: given_name ?? "",
          lastname: family_name ?? "",
          rut: "",          // Required field — empty for Google users (profile incomplete)
          provider: "google",
          confirmed: true,  // Google has already verified the email
          blocked: false,
          role: defaultRole?.id,
        },
      });

    return { user: newUser, isNew: true };
  }
}
```

**Example — index.ts singleton export (mirrors `indicador/index.ts` pattern):**
```typescript
// apps/strapi/src/services/google-one-tap/index.ts
export * from "./google-one-tap.types";
export * from "./google-one-tap.service";

import { GoogleOneTapService } from "./google-one-tap.service";
export const googleOneTapService = new GoogleOneTapService();
```

### Pattern 4: User Schema Extension (adding `google_sub`)

**What:** Add a new private, indexed string field to the User content type for stable Google identification.

**When to use:** Any time a new auth provider needs its own stable identifier stored on the user.

**Example — schema.json addition:**
```json
"google_sub": {
  "type": "string",
  "configurable": false,
  "private": true,
  "searchable": false,
  "unique": true
}
```

> **Note:** The `unique: true` constraint requires the field to allow `null` (only set for Google users). Strapi handles this correctly — `unique` on a nullable field means "unique among non-null values" in most DBs. Verify with local Strapi restart.

### Pattern 5: 2-Step Bypass Documentation (GTAP-06)

**What:** The One Tap endpoint bypasses 2-step verification by being a separate endpoint outside `overrideAuthLocal`'s interception scope.

**How it works:**
- `overrideAuthLocal` in `strapi-server.ts` wraps only `instance.callback` — which handles `POST /api/auth/local`
- `POST /api/auth/google-one-tap` is a new content API route — `overrideAuthLocal` never sees these requests
- The controller issues JWT directly via `jwt.issue()`, same as how `verifyCode` finishes the 2-step flow
- This matches the behavior of `/connect/google` (OAuth callback also bypasses 2-step)

**Document in controller code:**
```typescript
// NOTE: This endpoint intentionally bypasses 2-step verification (GTAP-06).
// Rationale: Google has already verified the user's identity via signed ID token.
// This matches existing behavior of /connect/google (OAuth callback) and is consistent
// with the design decision documented in STATE.md key decisions (2026-03-19).
```

### Anti-Patterns to Avoid

- **`createUserReservations()` as fire-and-forget without error logging** — the function is async and can silently fail. Pattern from `registerUserLocal` (line 114): call without await. But unlike `registerUserLocal`, catch and log the error (`strapi.log.error`), not silently swallow.
- **Throwing from `GoogleOneTapService` constructor when `GOOGLE_CLIENT_ID` is missing** — GTAP-02 (Phase 096) ensures it's set, but a constructor throw kills Strapi startup. Consider a lazy-init pattern or wrap in try/catch in the controller.
- **Creating users with `rut: ""` without understanding schema constraints** — `rut` is marked `required: true` in the schema. Verify whether `strapi.db.query().create()` enforces application-level required constraints or only DB-level NOT NULL. If it does enforce, the controller needs a `rut` placeholder strategy.
- **Using `auth: true` on the route** — the user has no JWT yet; the endpoint must be `auth: false`, same as `auth-verify/routes/auth-verify.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Google JWT RS256 verification | Custom JWKS fetch + `jsonwebtoken` verify | `OAuth2Client.verifyIdToken()` from `google-auth-library` | JWKS key rotation, clock skew tolerance, `aud`/`iss` validation — all built in |
| JWT issuance for Strapi session | Custom token generation | `strapi.plugins['users-permissions'].services.jwt.issue({ id })` | Strapi token format, expiry, and secret already configured; deviating breaks `fetchUser()` |
| User field sanitization | Manual field filtering | `strapi.contentAPI.sanitize.output()` | Removes private fields (`password`, `resetPasswordToken`, `google_sub`, etc.) correctly |
| Cookie persistence | `document.cookie` | `setToken(jwt)` from `@nuxtjs/strapi` (frontend) | Module writes `waldo_jwt` with correct domain and flags |

**Key insight:** `verifyIdToken()` makes one JWKS fetch then caches keys for hours — it is not a per-request Google API call. The singleton `OAuth2Client` preserves this cache across requests.

---

## Common Pitfalls

### Pitfall 1: `rut` Required Field Blocks New Google User Creation
**What goes wrong:** `schema.json` marks `rut: { required: true }`. Strapi's DB query layer may enforce this at the application level, causing `create()` to throw when `rut: ""` is passed for a new Google user.
**Why it happens:** Waldo's user model was designed for Chilean ID (RUT), mandatory for local registration. Google users don't have one at registration time.
**How to avoid:** Test `create()` with `rut: ""` in development. If it throws, use `rut: "google"` as a placeholder (or any non-empty string). Check whether downstream code ever validates `rut` format — if not, a placeholder is safe. Alternatively, remove the application-level `required` check from schema for `rut` (keep DB column nullable) and rely on profile-completion redirect (Phase 098 concern).
**Warning signs:** Strapi startup or first One Tap attempt logs `"rut" is required` error.

### Pitfall 2: `unique: true` on `google_sub` Prevents Multiple Null Values
**What goes wrong:** Adding `"unique": true` to `google_sub` in `schema.json` causes a database UNIQUE constraint on the column. If the database is SQLite or PostgreSQL and doesn't treat NULLs as non-unique, `create()` for any user without `google_sub` will fail.
**Why it happens:** Different databases handle NULL in UNIQUE columns differently (PostgreSQL: NULLs are distinct — multiple allowed; SQLite: same; MySQL: multiple NULLs allowed). This is generally safe, but verify in development before deploying.
**How to avoid:** Test creating two local users (no `google_sub`) after adding the field. If constraint errors appear, use a partial index or remove `unique: true` and rely on application-level lookup.
**Warning signs:** Strapi DB error `UNIQUE constraint failed: up_users.google_sub` on local user creation.

### Pitfall 3: `GoogleOneTapService` Constructor Throws — Kills Strapi Startup
**What goes wrong:** `constructor() { if (!this.clientId) throw new Error(...) }` and the singleton `export const googleOneTapService = new GoogleOneTapService()` executes at module load time. If `GOOGLE_CLIENT_ID` is missing (e.g., on a developer's local machine without the Phase 096 env var), Strapi fails to start.
**Why it happens:** ES module top-level singleton instantiation runs during server bootstrap.
**How to avoid:** Either (a) make the check non-throwing: `strapi.log.warn(...)` instead of `throw`, letting the controller return a 500 for missing config; or (b) add `GOOGLE_CLIENT_ID` to `.env` (the GTAP-02 prerequisite should have done this — verify).
**Warning signs:** `Error: GOOGLE_CLIENT_ID is not set` in Strapi startup log.

### Pitfall 4: `findOrCreateUser` Without `provider: 'google'` Causes Auth Loop
**What goes wrong:** When creating a new user with One Tap, if `provider` is not set to `'google'`, subsequent OAuth redirect logins (using `/connect/google`) will find this user via `providers.js` email lookup — but the existing code filters by `{ provider }` to match. Mismatched provider values cause confusing dual-account scenarios.
**Why it happens:** Strapi's `providers.js` `connect()` function queries `findMany({ where: { email } })` then uses `_.find(users, { provider })` to match. If your One Tap user has `provider: 'local'` or `null`, the OAuth flow creates a duplicate.
**How to avoid:** Always set `provider: 'google'` when creating One Tap users. This matches what the OAuth flow sets for Google-connected users.
**Warning signs:** User can authenticate via both OAuth button AND One Tap, but they result in different accounts.

### Pitfall 5: `createUserReservations` is Not Awaited — Errors Silently Drop
**What goes wrong:** Following the pattern in `registerUserLocal` (line 114: `createUserReservations(user)` without `await`), errors are completely swallowed — no log entry, no visibility.
**Why it happens:** `registerUserLocal` intentionally fire-and-forgets to avoid blocking the registration response. The trade-off is silent failure.
**How to avoid:** In the One Tap controller, add `.catch()` after the call: `createUserReservations(user).catch((err) => strapi.log.error(...))`. This maintains non-blocking behavior while surfacing errors in Strapi logs.
**Warning signs:** New One Tap users consistently have no free ad slots, but no error in response — only visible in logs if catch is in place.

---

## Code Examples

Verified patterns from live codebase:

### JWT Issuance (from `authController.ts` line 314)
```typescript
// Source: apps/strapi/src/extensions/users-permissions/controllers/authController.ts:314
const jwtToken = strapi.plugins["users-permissions"].services.jwt.issue({
  id: user.id,
});
```

### User Sanitization (from `authController.ts` lines 318–323)
```typescript
// Source: apps/strapi/src/extensions/users-permissions/controllers/authController.ts:318-323
const userSchema = strapi.getModel("plugin::users-permissions.user");
const sanitizedUser = await strapi.contentAPI.sanitize.output(
  user,
  userSchema,
  { auth: ctx.state.auth }
);
ctx.body = { jwt: jwtToken, user: sanitizedUser };
```

### Route Registration with `auth: false` (from `auth-verify/routes/auth-verify.ts`)
```typescript
// Source: apps/strapi/src/api/auth-verify/routes/auth-verify.ts
export default {
  routes: [
    {
      method: "POST",
      path: "/auth/verify-code",
      handler: "auth-verify.verifyCode",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
```

### Controller → Function Import Pattern (from `auth-verify/controllers/auth-verify.ts`)
```typescript
// Source: apps/strapi/src/api/auth-verify/controllers/auth-verify.ts
import { verifyCode, resendCode } from "../../../extensions/users-permissions/controllers/authController";
import { Context } from "koa";
export default {
  verifyCode: async (ctx: Context) => verifyCode(ctx),
  resendCode: async (ctx: Context) => resendCode(ctx),
};
```

### `google-auth-library` OAuth2Client Usage (verified importable in this project)
```typescript
// Source: google-auth-library@9.15.1 (hoisted, confirmed with yarn why + node -e test)
import { OAuth2Client, TokenPayload } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ticket = await client.verifyIdToken({
  idToken: credential,
  audience: process.env.GOOGLE_CLIENT_ID,
});
const payload: TokenPayload | undefined = ticket.getPayload();
// payload.sub — stable Google user ID (never changes)
// payload.email — user's email (can change — do NOT use as primary key)
// payload.given_name, payload.family_name — display name parts
// payload.picture — avatar URL
```

### Existing User Lookup Pattern (for reference — how `providers.js` does it for OAuth)
```javascript
// Source: @strapi/plugin-users-permissions/server/services/providers.js
// Finds by email, then filters by provider — this is why we need google_sub
const users = await strapi.db.query('plugin::users-permissions.user').findMany({
  where: { email },  // finds ALL users with this email
});
const user = _.find(users, { provider });  // then picks the one with matching provider
```

### `createUserReservations` Guard Logic (from `authController.ts` lines 15–28)
```typescript
// Source: apps/strapi/src/extensions/users-permissions/controllers/authController.ts:15-28
// Already guards against duplicates — safe to call for all new users
const existingReservations = await strapi.db
  .query("api::ad-reservation.ad-reservation")
  .findMany({ where: { user: user.id, price: 0 } });
if (existingReservations.length > 0) {
  return { message: "User already has free reservations" };
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plugin extension routes (`plugin.routes["content-api"].routes.push()`) | Standard content API in `src/api/` | Documented in Strapi v5 | Plugin routes are silently ignored — always use `src/api/` |
| OAuth access token exchange via `tokeninfo` endpoint | Direct ID token verification with `OAuth2Client.verifyIdToken()` | GIS redesign → FedCM default | `tokeninfo` is debugging-only, may be throttled; `verifyIdToken` is the correct production path |
| `auth.callback` factory override for new endpoints | Separate `src/api/` controller | Strapi v5 plugin controller factory pattern | Overriding via factory (strapi-server.ts) only works for *existing* plugin endpoints |

**Deprecated/outdated patterns in this codebase:**
- `plugin.controllers.auth.callback = ...` (setting properties directly on factory function): Confirmed broken in Strapi v5 — the factory wrapper pattern in `strapi-server.ts` is the fix
- Using `tokeninfo` endpoint for One Tap credentials: The existing `useGoogleOneTap.ts` does this — this phase replaces it with a proper server-side verification

---

## Open Questions

1. **`rut` required field for Google users**
   - What we know: `schema.json` marks `rut: { required: true }`; Google ID tokens don't include a Chilean RUT
   - What's unclear: Whether Strapi's DB query layer enforces `required` at the application level (would throw on create) or only at the content-type API level (would pass through on `strapi.db.query()`)
   - Recommendation: Test `strapi.db.query('plugin::users-permissions.user').create({ data: { ..., rut: '' } })` in a local Strapi dev session before implementing. If it throws, use `rut: 'N/A'` as placeholder. A proper solution (profile-completion redirect) is Phase 098 scope.

2. **`google_sub` unique constraint behavior with nulls**
   - What we know: PostgreSQL and SQLite allow multiple NULL values in a UNIQUE column; MySQL does too
   - What's unclear: Whether the production database (likely PostgreSQL/MySQL based on `package.json` having both `pg` and `mysql2`) handles this correctly
   - Recommendation: Add `google_sub` with `unique: true`; test by creating two local users after the schema change. If null uniqueness is an issue, remove `unique` and enforce at application level.

3. **`strapi.log` availability in service layer**
   - What we know: `strapi` is a global in controllers; in services, it's also available globally in Strapi v5
   - What's unclear: Whether the `GoogleOneTapService` (instantiated at module load before Strapi fully boots) can safely use `strapi.log`
   - Recommendation: Use `console.error` as fallback in the service constructor; use `strapi.log.error` only in methods called at request time (after Strapi is fully bootstrapped).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 with ts-jest |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `yarn workspace waldo-strapi test --testPathPattern="google-one-tap"` |
| Full suite command | `yarn workspace waldo-strapi test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GTAP-03 | `verifyCredential()` returns `TokenPayload` for valid credential | Unit | `yarn workspace waldo-strapi test --testPathPattern="google-one-tap.service"` | ❌ Wave 0 |
| GTAP-03 | `verifyCredential()` returns `null` for invalid/expired credential | Unit | same | ❌ Wave 0 |
| GTAP-04 | `findOrCreateUser()` returns existing user when `google_sub` matches | Unit | same | ❌ Wave 0 |
| GTAP-04 | `findOrCreateUser()` links via email fallback and stores `google_sub` | Unit | same | ❌ Wave 0 |
| GTAP-04 | No duplicate user created on second One Tap login | Unit | same | ❌ Wave 0 |
| GTAP-05 | `findOrCreateUser()` returns `isNew: true` for unknown email | Unit | same | ❌ Wave 0 |
| GTAP-05 | `createUserReservations()` is called (mocked) when `isNew: true` | Unit | same | ❌ Wave 0 |
| GTAP-06 | Controller issues JWT directly — no `pendingToken` in response | Unit | `yarn workspace waldo-strapi test --testPathPattern="auth-one-tap"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn workspace waldo-strapi test --testPathPattern="google-one-tap"`
- **Per wave merge:** `yarn workspace waldo-strapi test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/services/google-one-tap/google-one-tap.service.test.ts` — covers GTAP-03, GTAP-04, GTAP-05 (mock `OAuth2Client.verifyIdToken` and `strapi.db.query`)
- [ ] `src/api/auth-one-tap/controllers/auth-one-tap.test.ts` — covers GTAP-06 (mock service + assert response shape is `{ jwt, user }`, not `{ pendingToken, email }`)

**Jest mock pattern for this codebase (from existing tests — AAA pattern required):**
```typescript
// Mock google-auth-library
jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

// Mock strapi global (set in jest.setup.js already for strapi)
```

---

## Sources

### Primary (HIGH confidence)
- Live codebase — `apps/strapi/src/api/auth-verify/` — exact structural template for new endpoint
- Live codebase — `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — JWT issuance (line 314), user sanitization (lines 318–323), `createUserReservations` (lines 11–65)
- Live codebase — `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — plugin route factory limitation (lines 56–62), `overrideAuthLocal` scope (line 48)
- Live codebase — `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — confirmed: NO `google_sub` field exists; `provider` field exists but stores `'google'`/`'local'`
- Live codebase — `apps/strapi/src/services/google/` — existing Google service structure; `google-auth-library` `JWT` already imported in `google-auth.service.ts`
- `yarn why google-auth-library` — confirmed version 9.15.1 hoisted from `googleapis@148.0.0`; no install needed
- `node -e "require('google-auth-library').OAuth2Client"` — confirmed importable in Strapi environment
- `@strapi/plugin-users-permissions/server/services/providers.js` — Google OAuth flow uses email lookup (not `sub`) — confirms new endpoint needs its own `google_sub` lookup

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` — detailed component breakdown with code examples
- `.planning/research/PITFALLS.md` — 14 pitfalls catalogued with mitigations
- `.planning/research/SUMMARY.md` — milestone-level research summary

### Primary External (HIGH confidence)
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token (2025-12-22) — `OAuth2Client.verifyIdToken()` usage, `sub` as required identifier
- https://npmjs.com/package/google-auth-library — version 9.15.1 confirmed

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `google-auth-library` confirmed importable; version verified; no new packages needed
- Architecture: HIGH — `auth-verify/` template is exact structural match; JWT issuance and sanitization patterns confirmed from live code
- User lookup logic: HIGH — confirmed `google_sub` field does NOT exist in schema; `providers.js` email-only lookup confirmed as the gap this phase must close
- Pitfalls: HIGH — `rut` required field is a real constraint observed in schema; `unique` null behavior is a known DB nuance; constructor throw timing is a real Strapi lifecycle concern

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable Strapi v5 APIs; `google-auth-library` API is stable)

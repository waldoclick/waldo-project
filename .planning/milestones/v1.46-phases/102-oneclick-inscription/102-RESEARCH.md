# Phase 102: Oneclick Service + Inscription Flow - Research

**Researched:** 2026-03-20
**Domain:** Transbank SDK v5 Oneclick Mall — inscription flow, Strapi v5 user schema extension, Nuxt 4 frontend pages
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INSC-01 | "Hazte PRO" button redirects user to Transbank Oneclick inscription page | `MallInscription.start()` returns `{ token, urlWebpay }` — frontend posts to `/payments/pro-inscription/start`, receives redirect URL |
| INSC-02 | After card enrollment, `tbk_user` stored on user record and `pro_status` set to `active` | `MallInscription.finish(token)` returns `tbkUser` — controller updates user via `strapi.entityService.update()` on `plugin::users-permissions.user` |
| INSC-03 | User's card type and masked card number are stored for display | `finish()` response includes `cardType` and `last4CardDigits` — stored as `pro_card_type` and `pro_card_last4` on user schema |
| FRNT-01 | `MemoPro.vue` redirects to Oneclick inscription (replaces Flow redirect) | Component rewired from `POST payments/pro` (Flow) to `POST payments/pro-inscription/start` (Oneclick) — redirect to `urlWebpay?TBK_TOKEN=token` |
| FRNT-02 | Return page after successful inscription shows confirmation with card info | New page `/pro/gracias` with `?username=user-{documentId}` query param — calls `/payments/pro-inscription/finish?token=TBK_TOKEN` on load |
| INSC-04 | Failed or cancelled inscription redirects to an error page with a retry option | Transbank redirects to `responseUrl` with `TBK_TOKEN` absent (cancelled) or error param — controller redirects to `/pagar/error?reason=cancelled` or `reason=rejected` |
</phase_requirements>

---

## Summary

Transbank Oneclick Mall inscription is a two-step redirect flow. Step 1: the server calls `MallInscription.start(username, email, responseUrl)` and receives a `{ token, urlWebpay }` pair. The frontend redirects the user to `urlWebpay?TBK_TOKEN=token`. Step 2: after the user enrolls their card on Transbank's hosted page, Transbank redirects back to `responseUrl` with `TBK_TOKEN` as a query parameter. The server calls `MallInscription.finish(token)` to confirm and receives `{ tbkUser, cardType, last4CardDigits }`.

The project's `transbank-sdk@5.0.0` is already installed at root workspace level (`/home/gabriel/Code/waldo-project/node_modules/transbank-sdk`). Integration sandbox credentials are built into the SDK: parent commerce code `597055555541`, child commerce code `597055555542`, API key `579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C`. The existing `TransbankService` class in `src/services/transbank/` only wraps `WebpayPlus` — a new parallel service `OneclickService` must be created following the same service folder convention used by `FlowService` and `TransbankService`.

Three Strapi user schema fields must be added: `pro_status` (enum: `active`, `inactive`, `cancelled`), `tbk_user` (string, private), `pro_expires_at` (datetime), `pro_card_type` (string), `pro_card_last4` (string). These complement the existing `pro` boolean. Two new API routes under `/payments/pro-inscription/` (POST `start`, GET `finish`) replace the current `POST /payments/pro` and `GET /payments/pro-response` Flow endpoints. Two new frontend pages are needed: `/pro/gracias` (confirmation) and the existing `/pagar/error` page already supports `?reason=cancelled|rejected`.

**Primary recommendation:** Build `OneclickService` in `src/services/oneclick/` mirroring the `FlowService` folder structure, register new routes alongside the existing payment routes, extend the user schema JSON, and create two new website pages (`/pro/gracias`, `/pro/error` or reuse `/pagar/error`).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `transbank-sdk` | `^5.0.0` | `Oneclick.MallInscription` — start/finish/delete | Already installed at workspace root, confirmed in package.json |
| Strapi v5 `entityService` | v5 | User record updates (`plugin::users-permissions.user`) | Project standard — all user updates use `strapi.entityService.update()` |
| Koa Context | - | Strapi controller request/response context | All payment controllers use `ctx: Context` from `koa` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nuxtjs/strapi` v2 | existing | `useStrapiUser<User>()`, `useStrapiClient()` | Frontend user state and API calls |
| `useApiClient` composable | project | Authenticated API calls with reCAPTCHA injection | All frontend POST calls to Strapi — replaces bare `useStrapiClient()` |
| SweetAlert2 (`useSweetAlert2`) | existing | Confirmation dialog before inscription | Already used in `MemoPro.vue` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New `/payments/pro-inscription/*` routes | Reusing `/payments/pro` and `/payments/pro-response` | Existing routes are Flow-specific, named confusingly; new routes are clearer and leave Flow endpoints intact |
| `/pro/gracias` new page | Reusing `/pagar/gracias` | `/pagar/gracias` is tightly coupled to order data; PRO inscription confirmation needs card info, not order data |

---

## Architecture Patterns

### Recommended Project Structure

New files to create:

```
apps/strapi/src/services/oneclick/
├── config/
│   └── oneclick.config.ts       # MallInscription instance with env-based options
├── services/
│   └── oneclick.service.ts      # OneclickService class: startInscription, finishInscription
├── types/
│   └── oneclick.types.ts        # IOneclickStartResponse, IOneclickFinishResponse
├── factories/
│   └── oneclick.factory.ts      # oneclickServiceFactory(strapi)
└── index.ts                     # re-exports all four modules

apps/strapi/src/extensions/users-permissions/content-types/user/
└── schema.json                  # ADD: pro_status, tbk_user (private), pro_expires_at,
                                 #      pro_card_type, pro_card_last4

apps/website/app/pages/pro/
└── gracias.vue                  # PRO inscription confirmation page

apps/website/app/types/
└── user.d.ts                    # ADD: pro_status, pro_card_type, pro_card_last4 fields
```

Routes to add in `apps/strapi/src/api/payment/routes/payment.ts`:

```typescript
{ method: "POST", path: "/payments/pro-inscription/start",  handler: "payment.proInscriptionStart" }
{ method: "GET",  path: "/payments/pro-inscription/finish", handler: "payment.proInscriptionFinish" }
```

### Pattern 1: Oneclick Config (mirrors existing TransbankService config)

```typescript
// src/services/oneclick/config/oneclick.config.ts
// Source: transbank-sdk dist/es6/transbank/webpay/oneclick/index.d.ts
import { Oneclick, Options, Environment } from "transbank-sdk";

const getEnvironment = (): Environment =>
  process.env.WEBPAY_ENVIRONMENT === "production"
    ? Environment.Production
    : Environment.Integration;

const inscription = new Oneclick.MallInscription(
  new Options(
    process.env.ONECLICK_COMMERCE_CODE,
    process.env.ONECLICK_API_KEY,
    getEnvironment()
  )
);

export default inscription;
```

**Why this shape:** The existing `transbank.config.ts` uses the same `new Options(code, key, env)` pattern for `WebpayPlus.Transaction`. Reusing the same shape makes the Oneclick config immediately readable by the team.

### Pattern 2: Start Inscription (controller handler)

```typescript
// In payment controller — proInscriptionStart
proInscriptionStart = this.controllerWrapper(async (ctx: Context) => {
  const user = await getCurrentUser(ctx);
  const username = `user-${user.documentId}`;   // CRITICAL: must be stable and ≤40 chars
  const email = user.email;
  const responseUrl = `${process.env.FRONTEND_URL}/pro/gracias`;

  const result = await oneclickService.startInscription(username, email, responseUrl);
  // result: { token: string, urlWebpay: string }
  ctx.body = { data: result };
});
```

Frontend redirects with `window.location.href = \`\${urlWebpay}?TBK_TOKEN=\${token}\``.

### Pattern 3: Finish Inscription (controller handler — Transbank redirects here via GET)

```typescript
// In payment controller — proInscriptionFinish (GET handler)
proInscriptionFinish = this.controllerWrapper(async (ctx: Context) => {
  const { TBK_TOKEN, username } = ctx.query;

  // Cancelled case: Transbank omits TBK_TOKEN
  if (!TBK_TOKEN) {
    ctx.redirect(`${process.env.FRONTEND_URL}/pagar/error?reason=cancelled`);
    return;
  }

  const result = await oneclickService.finishInscription(String(TBK_TOKEN));
  // result: { tbkUser, cardType, last4CardDigits, ... }

  if (!result.success || !result.tbkUser) {
    ctx.redirect(`${process.env.FRONTEND_URL}/pagar/error?reason=rejected`);
    return;
  }

  // Extract user by documentId from username = "user-{documentId}"
  const documentId = String(username).replace("user-", "");
  // Update user record
  await strapi.entityService.update("plugin::users-permissions.user", userId, {
    data: {
      pro: true,
      pro_status: "active",
      tbk_user: result.tbkUser,
      pro_card_type: result.cardType,
      pro_card_last4: result.last4CardDigits,
      pro_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    } as unknown as Parameters<typeof strapi.entityService.update>[2]["data"],
  });

  ctx.redirect(`${process.env.FRONTEND_URL}/pro/gracias?inscribed=true`);
});
```

### Pattern 4: `OneclickService` class

```typescript
// src/services/oneclick/services/oneclick.service.ts
import inscription from "../config/oneclick.config";
import { IOneclickStartResponse, IOneclickFinishResponse } from "../types/oneclick.types";
import logger from "../../../utils/logtail";

export class OneclickService {
  async startInscription(
    username: string,
    email: string,
    responseUrl: string
  ): Promise<IOneclickStartResponse> {
    try {
      const response = await inscription.start(username, email, responseUrl);
      return { success: true, token: response.token, urlWebpay: response.urlWebpay };
    } catch (error) {
      logger.error("Oneclick startInscription failed", { error });
      return { success: false, error };
    }
  }

  async finishInscription(token: string): Promise<IOneclickFinishResponse> {
    try {
      const response = await inscription.finish(token);
      return {
        success: true,
        tbkUser: response.tbkUser,
        cardType: response.cardType,
        last4CardDigits: response.last4CardDigits,
      };
    } catch (error) {
      logger.error("Oneclick finishInscription failed", { error });
      return { success: false, error };
    }
  }
}
```

### Pattern 5: `username` field constraint — CRITICAL

The SDK validates `username` with `USER_NAME_LENGTH = 40` chars max. The pattern `user-{documentId}` must never exceed 40 characters. Strapi v5 `documentId` is a 24-character nanoid string, so `user-` (5 chars) + 24 = 29 chars — safe. This same `username` MUST be passed unchanged to `finish()` resolution and future `delete()` calls (Phase 104).

### Pattern 6: Frontend return page (`/pro/gracias`)

Transbank redirects GET to `responseUrl` with `TBK_TOKEN` query param. The Strapi `proInscriptionFinish` handler processes it server-side and redirects the browser to `/pro/gracias?inscribed=true` (or `/pagar/error` on failure). The Vue page at `/pro/gracias` reads `inscribed=true` from the query and shows a static confirmation message — no additional API call needed (user data already updated in Strapi before redirect). To show card info, the page calls `useStrapiUser()` after a `useStrapi().fetchUser()` refresh.

### Anti-Patterns to Avoid

- **Using `documentId` as Transbank `buy_order` or `username` interchangeably:** `username` is sent to Transbank and must be stable across `start`, future `authorize`, and `delete`. Format: `user-{documentId}`.
- **Storing `TBK_TOKEN` as a redirect parameter to the frontend:** The token is resolved server-side in the GET handler. The frontend never sees the raw `TBK_TOKEN`. The CLAUDE.md payment rules reinforce this — order/enrollment identity is always the Strapi record.
- **Hardcoding `ONECLICK_COMMERCE_CODE`:** Must be in `.env` to support sandbox vs. production swap. The integration sandbox code `597055555541` should only appear in Jest mocks and `.env.example` comments.
- **Re-using the existing `pro_response` GET handler for Oneclick:** That handler is a stub (Flow leftover). Replace it — don't extend it.
- **Calling `inscription.finish()` inside the frontend proxy:** `finish()` must run server-side in the Strapi controller; it contains the `tbkUser` secret that must never reach the browser.
- **Using `strapi.db.query()` for user updates:** Payment services in this project use `strapi.entityService` for write operations. Keep consistent.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Oneclick enrollment redirect | Custom HTTP redirect to Transbank | `Oneclick.MallInscription.start()` from `transbank-sdk` | SDK handles URL construction, field validation (length limits), API versioning |
| Token confirmation and `tbkUser` extraction | Manual HTTP call to Transbank API | `Oneclick.MallInscription.finish()` | SDK manages auth headers, error parsing, environment routing |
| `username` length validation | Manual string length check | SDK's `ValidationUtil` inside `start()` — throws if > 40 chars | Already enforced at SDK boundary |
| User `documentId` lookup from `username` | Custom DB query with string parsing | `strapi.db.query("plugin::users-permissions.user").findOne({ where: { documentId } })` | Standard Strapi v5 documentId lookup |

**Key insight:** The Transbank SDK encapsulates all environment-specific URL routing, API key header injection, and field length enforcement. Bypass it at any point and you own those edge cases.

---

## Common Pitfalls

### Pitfall 1: GET vs POST for `finish` — Transbank always uses GET redirect
**What goes wrong:** Developer implements `finish` endpoint as POST (logical for "action") but Transbank's hosted page redirects back via GET with `TBK_TOKEN` in the query string.
**Why it happens:** The existing `webpayResponse` handler is GET — but it's easy to forget when designing new routes.
**How to avoid:** Register `proInscriptionFinish` as `method: "GET"`. Read `ctx.query.TBK_TOKEN`, not `ctx.request.body`.
**Warning signs:** Route returns 404 or 405 after Transbank redirect.

### Pitfall 2: Cancelled inscription — `TBK_TOKEN` is absent, not null
**What goes wrong:** Controller checks `if (TBK_TOKEN === null)` — misses the absent-key case.
**Why it happens:** Transbank omits the parameter entirely on user cancellation rather than sending an explicit cancel signal.
**How to avoid:** Check `if (!TBK_TOKEN)` (falsy) in the GET handler. Route to `/pagar/error?reason=cancelled`.
**Warning signs:** Cancelled inscription hangs or throws a 500 instead of showing the error page.

### Pitfall 3: `username` mismatch between start and future delete
**What goes wrong:** Phase 104 (cancellation) calls `inscription.delete(tbkUser, username)` — if `username` is regenerated differently it will fail with a Transbank error.
**Why it happens:** Developer regenerates `user-{documentId}` in Phase 104 without realising it must be identical to the value used in `start()`.
**How to avoid:** Extract `buildOneclickUsername(documentId: string): string` as a shared pure function exported from `src/services/oneclick/` so both phases import the same logic.
**Warning signs:** `delete()` returns a Transbank `username mismatch` or `enrollment not found` error in Phase 104.

### Pitfall 4: Strapi `entityService` double-cast for user update
**What goes wrong:** TypeScript compiler rejects direct `data:` assignment to `plugin::users-permissions.user` because generated types don't include the new custom fields yet.
**Why it happens:** Strapi v5 generated types in `types/generated/contentTypes.d.ts` are regenerated by `yarn strapi ts:generate-types` — new schema fields won't be reflected until regenerated.
**How to avoid:** Use the established project cast pattern: `data: { ... } as unknown as Parameters<typeof strapi.entityService.update>[2]["data"]`. After adding schema fields, run `yarn strapi ts:generate-types` to update generated types.
**Warning signs:** TypeScript error on `strapi.entityService.update(..., { data: { pro_status: ... } })`.

### Pitfall 5: Strapi auth middleware on `proInscriptionFinish` GET
**What goes wrong:** If the finish route requires JWT auth, Transbank's GET redirect won't include the Authorization header and returns 401.
**Why it happens:** All existing payment routes have `policies: []` but the JWT middleware runs globally if `authenticated` role is required.
**How to avoid:** The route must be publicly accessible (no auth policy). The controller resolves the user from the `username` query param (which encodes `documentId`). Validate that the resolved user exists before updating.
**Warning signs:** Transbank redirect lands on a 401 page instead of the confirmation page.

---

## Code Examples

Verified patterns from official SDK source (`/home/gabriel/Code/waldo-project/node_modules/transbank-sdk`):

### Start Inscription
```typescript
// Source: node_modules/transbank-sdk/dist/es6/transbank/webpay/oneclick/mall_inscription.js
const response = await inscription.start(username, email, responseUrl);
// response: { token: string, urlWebpay: string }
// Redirect user to: `${response.urlWebpay}?TBK_TOKEN=${response.token}`
```

### Finish Inscription
```typescript
// Source: node_modules/transbank-sdk/dist/es6/transbank/webpay/oneclick/mall_inscription.js
const response = await inscription.finish(token);
// response: { tbkUser: string, cardType: string, last4CardDigits: string, ... }
```

### Delete Inscription (Phase 104 reference — do not implement now)
```typescript
// Source: mall_inscription.d.ts — delete(tbkUser: string, username: string): Promise<any>
await inscription.delete(tbkUser, username);
// username MUST equal the value used in start()
```

### Sandbox Credentials (integration environment)
```
ONECLICK_COMMERCE_CODE=597055555541   (parent)
ONECLICK_CHILD_COMMERCE_CODE=597055555542
ONECLICK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
WEBPAY_ENVIRONMENT=integration
```

### SDK `configureOneclickMallForTesting()` shortcut
```typescript
// Source: node_modules/transbank-sdk/dist/es6/transbank/webpay/oneclick/index.d.ts
Oneclick.configureOneclickMallForTesting();
// Equivalent to setting parent=597055555541, key=579B..., Environment.Integration
// Useful for Jest unit tests — avoids env var dependency
```

### User schema fields to add (schema.json)
```json
"pro_status": {
  "type": "enumeration",
  "enum": ["active", "inactive", "cancelled"],
  "default": "inactive"
},
"tbk_user": {
  "type": "string",
  "private": true
},
"pro_expires_at": {
  "type": "datetime"
},
"pro_card_type": {
  "type": "string"
},
"pro_card_last4": {
  "type": "string"
}
```

### `MemoPro.vue` rewire
```typescript
// Replace Flow redirect with Oneclick start
const response = await apiClient("payments/pro-inscription/start", {
  method: "POST",
  body: { data: {} },
});
if (response?.data?.urlWebpay && response?.data?.token) {
  window.location.href = `${response.data.urlWebpay}?TBK_TOKEN=${response.data.token}`;
}
```

### Existing user.utils.ts `getCurrentUser` pattern
```typescript
// Source: apps/strapi/src/api/payment/utils/user.utils.ts
// This function already handles authenticated user resolution.
// The finish handler resolves user by documentId from username query param
// because Transbank GET redirect has no Authorization header.
const user = await strapi.db.query("plugin::users-permissions.user").findOne({
  where: { documentId },
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flow subscription (`pro.service.ts`) | Transbank Oneclick Mall | v1.46 milestone | Replace entire `createSubscription` flow; Flow service remains installed but unused for PRO |
| `pro` boolean only on User | `pro` + `pro_status` enum + `pro_expires_at` + `tbk_user` + card fields | Phase 102 | Enables subscription lifecycle management in Phases 103-104 |
| `POST /payments/pro` → Flow | `POST /payments/pro-inscription/start` → Oneclick | Phase 102 | Routes stay additive; old routes left intact (not deleted) |

**Deprecated/outdated in this context:**
- `ProService.createSubscription()` (Flow-based): replaced by Oneclick controller methods directly in `payment.ts` controller. Do not delete `ProService` — just stop calling it from routes.
- `GET /payments/pro-response`: stub handler — replace with `GET /payments/pro-inscription/finish`.

---

## Open Questions

1. **`finish` response field names**
   - What we know: SDK type declaration says `Promise<any>`. JS implementation calls `RequestService.perform(new FinishRequest(token))` which hits the Transbank REST API.
   - What's unclear: Exact JSON field names (`tbkUser` vs `tbk_user`, `last4CardDigits` vs `card_number`) — the SDK's TypeScript declaration returns `any`.
   - Recommendation: In the `OneclickService.finishInscription()` method, log the full raw response in integration environment. Transbank's official docs and the SDK README confirm `tbkUser`, `cardType`, `last4CardDigits`. Treat as MEDIUM confidence until verified with a live sandbox call.

2. **User lookup in `proInscriptionFinish` GET — no JWT available**
   - What we know: Transbank GET redirect cannot carry Authorization header. The `username` param encodes `documentId` as `user-{documentId}`.
   - What's unclear: Whether `strapi.db.query` findOne by `documentId` works without authentication context (it does — server-side Strapi queries bypass JWT).
   - Recommendation: Use `strapi.db.query("plugin::users-permissions.user").findOne({ where: { documentId } })` — confirmed pattern from existing `payment.ts` controller (line 430 uses this for orders).

3. **`ONECLICK_API_KEY` env var naming**
   - What we know: The existing Webpay Plus config uses `WEBPAY_API_KEY`. Oneclick Mall may share the same API key or use a different one.
   - What's unclear: Whether Transbank issues one API key per product or one per commerce.
   - Recommendation: Define `ONECLICK_API_KEY` as a separate env var in `.env.example` and default to `WEBPAY_API_KEY` if unset. For sandbox, both point to the same integration key `579B...`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && yarn test --testPathPattern="oneclick"` |
| Full suite command | `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INSC-01 | `startInscription()` calls SDK `inscription.start()` with correct username/email/responseUrl | unit | `yarn test --testPathPattern="oneclick.service.test"` | Wave 0 |
| INSC-02 | `finishInscription()` success path calls `strapi.entityService.update` with `pro_status: "active"` and `tbk_user` | unit | `yarn test --testPathPattern="oneclick.service.test"` | Wave 0 |
| INSC-03 | `finishInscription()` success path stores `pro_card_type` and `pro_card_last4` on user | unit | `yarn test --testPathPattern="oneclick.service.test"` | Wave 0 |
| INSC-04 | GET handler with absent `TBK_TOKEN` redirects to `/pagar/error?reason=cancelled` | unit | `yarn test --testPathPattern="oneclick.service.test"` | Wave 0 |
| FRNT-01 | `MemoPro.vue` calls `payments/pro-inscription/start` and redirects to `urlWebpay?TBK_TOKEN=token` | manual | — | manual-only (browser redirect) |
| FRNT-02 | `/pro/gracias` shows card type and last4 from refreshed user data | manual | — | manual-only (browser page) |

### Sampling Rate
- **Per task commit:** `cd apps/strapi && yarn test --testPathPattern="oneclick" --passWithNoTests`
- **Per wave merge:** `cd apps/strapi && yarn test`
- **Phase gate:** Full Jest suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/strapi/src/services/oneclick/services/oneclick.service.test.ts` — covers INSC-01, INSC-02, INSC-03, INSC-04
- [ ] `apps/strapi/src/services/oneclick/` directory structure — service not yet created

*(Existing `jest.config.js`, `jest.setup.js`, and ts-jest infrastructure are in place — no framework install needed)*

---

## Sources

### Primary (HIGH confidence)
- `/home/gabriel/Code/waldo-project/node_modules/transbank-sdk/dist/es6/transbank/webpay/oneclick/mall_inscription.js` — `start()`, `finish()`, `delete()` implementations
- `/home/gabriel/Code/waldo-project/node_modules/transbank-sdk/dist/es5/transbank/common/api_constants.d.ts` — field length limits (`USER_NAME_LENGTH=40`, `TBK_USER_LENGTH=40`, `EMAIL_LENGTH=100`)
- `/home/gabriel/Code/waldo-project/node_modules/transbank-sdk/dist/es6/transbank/common/integration_commerce_codes.js` — sandbox commerce codes
- `/home/gabriel/Code/waldo-project/apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — existing User schema (confirmed `pro` boolean, `flow_customer_data` JSON private field)
- `/home/gabriel/Code/waldo-project/apps/strapi/src/api/payment/controllers/payment.ts` — existing controller patterns, `proCreate`/`proResponse` stubs
- `/home/gabriel/Code/waldo-project/apps/strapi/src/api/payment/routes/payment.ts` — existing route registration pattern
- `/home/gabriel/Code/waldo-project/apps/strapi/config/cron-tasks.ts` — cron registration pattern (relevant to Phase 103, not 102)
- `/home/gabriel/Code/waldo-project/apps/website/app/components/MemoPro.vue` — component to rewire (FRNT-01)
- `/home/gabriel/Code/waldo-project/apps/website/app/pages/pagar/error.vue` — existing error page with `?reason=cancelled|rejected` support (INSC-04)
- `/home/gabriel/Code/waldo-project/apps/strapi/jest.config.js` — Jest configuration confirmed

### Secondary (MEDIUM confidence)
- Transbank REST API response fields (`tbkUser`, `cardType`, `last4CardDigits`) — inferred from SDK parameter names and Transbank developer docs naming convention; confirm with sandbox call.

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — SDK confirmed installed, all imports verified in source
- Architecture: HIGH — existing patterns in payment controller, flow service, and cron files are directly mirrored
- Pitfalls: HIGH — derived from existing code patterns and SDK constraints (GET redirect, absent TBK_TOKEN, username length)
- `finish()` response field names: MEDIUM — SDK returns `any`, field names inferred from SDK param names

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (SDK is stable; Transbank API v1.2 does not change frequently)

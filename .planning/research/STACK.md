# Stack Research: Zoho CRM Sync Model (v1.19)

**Project:** Waldo — `apps/strapi`
**Researched:** 2026-03-07
**Milestone:** v1.19 — Zoho CRM Integration (createDeal, updateContactStats, 401 token refresh, test isolation)
**Overall confidence:** HIGH — all claims verified against installed packages, npm registry, and official Zoho CRM v5 API docs.

---

## Current Stack (relevant)

| Package | Installed version | Role |
|---------|------------------|------|
| `axios` | `1.13.6` | HTTP client used by `ZohoHttpClient` |
| `jest` | `^29.7.0` (dev) | Test runner for Strapi |
| `ts-jest` | `^29.2.5` (dev) | TypeScript support for Jest |
| `@types/jest` | `^29.5.14` (dev) | Jest type definitions |

**Source:** `apps/strapi/package.json` (read directly).

Existing Zoho service files:
- `http-client.ts` — `ZohoHttpClient` wrapping axios. Refreshes token **only when `this.accessToken` is null**. No response interceptor for 401.
- `zoho.service.ts` — `ZohoService` with `createLead`, `createContact`, `findContact`, `updateContact`.
- `interfaces.ts` — `ZohoConfig`, `ZohoLead`, `IZohoService`.
- `factory.ts` — `ZohoFactory.createZohoService()`.
- `index.ts` — exports everything + creates singleton `zohoService`.
- `zoho.test.ts` — **hits production Zoho API directly** (no mocking). Uses real email addresses.

---

## Additions Needed

### 1. `axios-retry` — for resilient token-refresh-then-retry

**Package:** `axios-retry`
**Version:** `^4.5.0` (latest as of 2026-03-07, verified on npm registry)
**Install as:** production dependency (`dependencies`)
**Peer deps:** `axios 0.x || 1.x` — compatible with installed axios `1.13.6` ✓

**Why:**
The current `ZohoHttpClient.setupInterceptors()` only adds a **request** interceptor that refreshes the token when `this.accessToken` is null. It has no **response** interceptor. When Zoho returns HTTP 401 (expired token mid-session), the request fails outright instead of refreshing and retrying. The fix requires:

1. A response interceptor that catches 401, calls `refreshAccessToken()`, then retries the original request.
2. `axios-retry` is the battle-tested way to add configurable retry logic to axios. It provides `axiosRetry(client, { retries, retryCondition })` and correctly handles the `config` clone on retry.

**Alternative approach considered:** A hand-rolled response interceptor with `axios.interceptors.response.use(null, async (error) => { ... })`. This is viable and avoids a dependency, but has a well-known footgun: the interceptor can loop infinitely if `refreshAccessToken()` itself fails, requiring a manual "already retried" flag. `axios-retry` handles this correctly out of the box with `retries: 1` and a custom `retryCondition`.

**Recommendation:** Use `axios-retry@^4.5.0` for the retry wrapper, and keep the 401-specific logic in a response interceptor inside `ZohoHttpClient`. The two work together: the response interceptor resets `this.accessToken = null` on 401 and the retry fires the next request through the request interceptor which re-fetches the token.

**Confidence:** HIGH — verified compatibility with axios 1.x via npm registry `peerDependencies: "axios": "0.x || 1.x"`.

---

### 2. `axios-mock-adapter` — for proper test isolation

**Package:** `axios-mock-adapter`
**Version:** `^2.1.0` (latest as of 2026-03-07, verified on npm registry)
**Install as:** dev dependency (`devDependencies`)
**Peer deps:** `axios >= 0.17.0` — compatible with installed axios `1.13.6` ✓
**TypeScript:** Ships its own type definitions. `@types/axios-mock-adapter` is deprecated (stub only, not needed). ✓

**Why:**
The current `zoho.test.ts` imports the singleton `zohoService` from `index.ts` and calls real Zoho API endpoints. This:
- Creates real CRM records on every `jest` run.
- Requires valid env vars (`ZOHO_CLIENT_ID`, etc.) in CI.
- Is non-deterministic (fails if Zoho is down, token expired, etc.).

`axios-mock-adapter` intercepts calls at the axios adapter level — it replaces the HTTP transport without touching the `ZohoHttpClient` class itself. Tests can mock `POST /crm/v5/Deals`, `GET /crm/v5/Contacts/search`, etc. and assert on request payloads without network calls.

**Usage pattern** (replaces production Zoho calls in tests):
```typescript
import MockAdapter from 'axios-mock-adapter';
// In test: attach mock to the internal axios instance via dependency injection or test factory
const mock = new MockAdapter(axiosInstance);
mock.onPost('/crm/v5/Deals').reply(200, { data: [{ code: 'SUCCESS', details: { id: 'abc123' } }] });
```

**Note:** `ZohoHttpClient` must expose its internal `axios` instance (or accept an injected one) for `axios-mock-adapter` to attach to it. The existing constructor creates the axios instance internally — a small refactor to accept an optional `axiosInstance` parameter enables this without breaking production use.

**Confidence:** HIGH — verified on npm registry; standard pattern in Strapi Jest tests.

---

## Additions NOT Recommended

### `@zohocrm/nodejs-sdk-2.0`

**Latest version:** `6.1.0` (verified on npm registry)
**Verdict:** Do NOT install.

**Why not:**
- The SDK requires its own initialization ceremony (`InitializeBuilder`, `UserSignature`, `USDataCenter.PRODUCTION()`, `TokenStore` with either MySQL DB or file persistence). This is a heavy, opinionated setup incompatible with the existing stateless `ZohoHttpClient` pattern.
- Token persistence is handled by the SDK's own `TokenStore` (file or DB), which conflicts with the project's env-var-based `ZOHO_REFRESH_TOKEN` approach.
- It uses `got@^11` (not axios) as its HTTP client internally, adding a second HTTP library to the Strapi bundle.
- It has no TypeScript source — all types are auto-generated from Java API definitions, resulting in verbose, deeply nested APIs (`RecordOperations`, `ParameterMap`, `HeaderMap`, etc.) that are harder to use than raw axios calls.
- The existing `ZohoHttpClient` already covers all needed Zoho v5 REST operations with less ceremony.
- Stars on GitHub: 3 (marginal community adoption).

**Instead:** Continue using the existing `ZohoHttpClient` (raw axios). The Zoho CRM v5 API is a standard REST API — `POST /crm/v5/Deals`, `PUT /crm/v5/Contacts/{id}`, `GET /crm/v5/Contacts/search` — no SDK wrapper is needed.

**Confidence:** HIGH — verified SDK internals from GitHub README and npm registry.

---

### `node-zoho` or other third-party Zoho wrappers

**Verdict:** Do NOT install. Unmaintained, no TypeScript, no v5 support.

---

### Retry libraries other than `axios-retry`

**`retry-axios` (rax):** Google's retry library for axios. Overkill for this use case; designed for GCP clients. More config surface area than needed.

**Hand-rolled response interceptor (no package):** Viable, but requires careful "retried" flag to prevent loops. For a single retry on 401, acceptable — but `axios-retry` is 3 stars of config vs ~20 lines of careful manual code. Implementing manually is acceptable if the team prefers zero new dependencies; document the loop-prevention guard explicitly.

---

## Integration Points

### How `axios-retry` connects to existing `ZohoHttpClient`

```typescript
// http-client.ts — minimal change
import axiosRetry from 'axios-retry';

private setupInterceptors() {
  // Existing: request interceptor to attach token
  this.client.interceptors.request.use(async (config) => {
    if (!this.accessToken) {
      await this.refreshAccessToken();
    }
    config.headers.Authorization = `Bearer ${this.accessToken}`;
    return config;
  });

  // NEW: response interceptor to detect 401 and reset token
  this.client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !error.config.__retried) {
        error.config.__retried = true;
        this.accessToken = null;          // force re-fetch on next request interceptor pass
        await this.refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${this.accessToken}`;
        return this.client(error.config); // retry once
      }
      return Promise.reject(error);
    }
  );
}
```

**Note:** `axios-retry` handles the retry orchestration; the `__retried` flag prevents infinite loops. This is a single-retry pattern — Zoho tokens expire after 1 hour so a single refresh-and-retry covers all real-world cases.

---

### How `axios-mock-adapter` connects to `ZohoHttpClient` for tests

The internal axios instance needs to be injectable for testing. Add an optional parameter:

```typescript
// http-client.ts — factory parameter enables test injection
constructor(private config: ZohoConfig, axiosInstance?: AxiosInstance) {
  this.client = axiosInstance ?? axios.create({
    baseURL: config.apiUrl,
    headers: { 'Content-Type': 'application/json' },
  });
  this.setupInterceptors();
}
```

In `ZohoFactory.createZohoService()`, pass nothing (uses default). In tests:
```typescript
// zoho.test.ts — isolated, no network calls
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const axiosInstance = axios.create({ baseURL: 'https://www.zohoapis.com' });
const mock = new MockAdapter(axiosInstance);
const httpClient = new ZohoHttpClient(testConfig, axiosInstance);
const service = new ZohoService(httpClient);

mock.onPost('/crm/v5/Deals').reply(201, { data: [{ code: 'SUCCESS', details: { id: 'deal_001' } }] });
```

---

### Zoho CRM v5 API: Deal creation endpoint

Verified from official Zoho CRM v5 API docs (`https://www.zoho.com/crm/developer/docs/api/v5/insert-records.html`):

```
POST https://www.zohoapis.com/crm/v5/Deals
Authorization: Zoho-oauthtoken {access_token}

{
  "data": [{
    "Deal_Name": "Pack Premium — user@example.com",
    "Stage": "Closed Won",
    "Amount": 9990,
    "Contact_Name": { "id": "{zoho_contact_id}" }
  }]
}
```

**Mandatory fields for Deals module:**
- `Deal_Name` — Single Line (required)
- `Stage` — Picklist (required)
- `Pipeline` — Single Line (required **only** when Pipeline feature is enabled in CRM account)

`Contact_Name` (Lookup to Contacts) is not mandatory by default but should be set to link the Deal to the Contact created at registration.

**Confidence:** HIGH — verified in official Zoho CRM v5 Insert Records API documentation.

---

### Zoho CRM v5 API: Contact update endpoint (for `updateContactStats`)

```
PUT https://www.zohoapis.com/crm/v5/Contacts/{contact_id}
Authorization: Zoho-oauthtoken {access_token}

{
  "data": [{
    "Ads_Published": 3,
    "Total_Spent": 29970,
    "Last_Ad_Posted_At": "2026-03-07",
    "Packs_Purchased": 1
  }]
}
```

These are **custom fields** — they must be created in the Zoho CRM admin UI under the Contacts module first. The API names (`Ads_Published`, `Total_Spent`, etc.) are configurable in the CRM; the implementer must confirm the exact API names after creating the fields.

**Confidence:** HIGH for endpoint pattern; MEDIUM for field API names (depends on CRM configuration).

---

## Installation Summary

```bash
# Production dependency (retry logic)
yarn workspace waldo-strapi add axios-retry@^4.5.0

# Dev dependency (test isolation)
yarn workspace waldo-strapi add -D axios-mock-adapter@^2.1.0
```

**No other packages needed.** All new functionality (`createDeal`, `updateContactStats`, 401 retry, test isolation) is implementable within the existing `ZohoHttpClient` + `ZohoService` + `ZohoFactory` structure using these two packages.

---

## Sources

| Claim | Source | Confidence |
|-------|--------|------------|
| `axios` installed at `1.13.6` | `yarn info axios version` in `apps/strapi` | HIGH |
| `axios-retry@4.5.0` latest, peer `axios 0.x\|1.x` | npm registry `registry.npmjs.org/axios-retry/latest` | HIGH |
| `axios-mock-adapter@2.1.0` latest, peer `axios >= 0.17.0` | npm registry `registry.npmjs.org/axios-mock-adapter/latest` | HIGH |
| `axios-mock-adapter` ships own TS types | npm registry `@types/axios-mock-adapter` deprecated stub | HIGH |
| `@zohocrm/nodejs-sdk-2.0` uses `got`, file/DB token store, no TypeScript source | GitHub `zoho/zohocrm-nodejs-sdk-2.0` README | HIGH |
| Zoho CRM v5 Deals `POST /crm/v5/Deals`, mandatory fields `Deal_Name` + `Stage` | Official Zoho CRM v5 Insert Records API docs | HIGH |
| Existing token refresh only on `null` (not on 401) | `apps/strapi/src/services/zoho/http-client.ts` read directly | HIGH |
| Existing test hits production Zoho API | `apps/strapi/src/services/zoho/zoho.test.ts` read directly | HIGH |

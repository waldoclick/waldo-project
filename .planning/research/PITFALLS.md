# Pitfalls Research

**Domain:** Zoho CRM Sync — Classified Ads / E-commerce Platform (Strapi v5 Backend)
**Milestone:** Zoho CRM Sync Model Integration
**Researched:** 2026-03-07
**Confidence:** HIGH (official Zoho API docs + direct codebase inspection + confirmed bugs in existing code)

---

## Critical Pitfalls

### Pitfall 1: No 401 Retry → Silent Token Expiry Kills All Subsequent CRM Calls

**What goes wrong:**
Zoho access tokens expire after exactly **3600 seconds (1 hour)** (confirmed: official docs `expires_in: 3600`). The current `ZohoHttpClient` (`http-client.ts`) fetches a fresh token only when `this.accessToken` is `null`. After the first token fetch, `accessToken` is set and never cleared — so once it expires, every subsequent API call returns an HTTP 401, which the client neither catches nor retries. The service throws a generic `"Failed to create contact"` error with no token-renewal attempt.

**Root cause in existing code:**
```ts
// http-client.ts — setupInterceptors()
if (!this.accessToken) {
  await this.refreshAccessToken();  // Only refreshes when null
}
// No response interceptor to catch 401 and retry
```

**Consequences:**
- Any operation attempted more than 1 hour after server start (or last successful token refresh) silently fails
- `createDeal()`, `updateContactStats()`, and all new event-wired calls will fail with opaque errors on long-running servers
- Because the Zoho calls are wrapped in `try/catch` that don't re-throw (by design), the failure is invisible to the user — the Strapi operation succeeds but no CRM record is created/updated. Data goes out of sync with zero alert.

**Prevention:**
Add an Axios **response interceptor** that:
1. Catches `error.response?.status === 401`
2. Clears `this.accessToken = null`
3. Retries the original request exactly once
4. Throws if the retry also fails

```ts
this.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      this.accessToken = null;
      await this.refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
      return this.client(originalRequest);
    }
    throw error;
  }
);
```

**Detection:**
- Zoho calls succeed on fresh server start, fail ~1 hour later
- Errors logged as `"Failed to create lead/contact"` without any 401 reference
- CRM records stop appearing in Zoho after sustained server uptime

**Phase to address:** Fix before any new Zoho methods are added. Every new method (`createDeal`, `updateContactStats`) inherits this bug.

---

### Pitfall 2: `createDeal()` Requires Contact Association — Missing Link Causes Orphaned Deals

**What goes wrong:**
Zoho Deals must have a `Deal_Name` (mandatory), `Stage` (mandatory), and ideally a `Contact_Name` lookup to be useful. If `createDeal()` is implemented without linking the deal to an existing Zoho Contact, the deal appears in CRM with no related contact — sales staff cannot trace it back to the user who purchased. On `pack_purchased` or `ad_paid` events, the trigger has the Strapi `userId` but the Zoho `contactId` must be resolved via `findContact(email)` first.

**Root cause pattern:**
```ts
// Wrong: creates an unlinked deal
await zohoService.createDeal({ Deal_Name: "Pack Purchase", Amount: 9900, Stage: "Closed Won" });

// Correct: look up contact first, link the deal
const contact = await zohoService.findContact(user.email);
if (contact) {
  await zohoService.createDeal({
    Deal_Name: "Pack Purchase",
    Amount: 9900,
    Stage: "Closed Won",
    Contact_Name: { id: contact.id }  // Lookup field — must be JSON object with id
  });
}
```

**Consequences:**
- Orphaned deals cluttering CRM with no owner
- `updateContactStats()` increment won't correlate with the deal if contacts aren't linked
- Reporting and segmentation in Zoho CRM becomes unusable

**Prevention:**
- `createDeal()` signature must require a `contactId: string` parameter — never allow creation without it
- The event handler for `pack_purchased`/`ad_paid` must: (1) fetch user email, (2) `findContact(email)`, (3) only then `createDeal()` with the contact lookup
- If `findContact()` returns null (contact doesn't exist in Zoho yet), create the contact first or skip the deal creation and log a warning — never create an orphaned deal

**Detection:**
- Deals visible in Zoho Deals module with no Contact Name populated
- "Unassigned" deals in CRM pipeline

---

### Pitfall 3: `updateContact()` Uses Zoho's Internal Numeric `id` — Must Use `id` from Search Response

**What goes wrong:**
`userUpdateController.ts` calls `zohoService.updateContact(contact.id, data)` where `contact.id` comes from `findContact()`. The Zoho CRM v5 search API (`/Contacts/search`) returns records with a string-format numeric `id` like `"5725767000000524157"`. The `updateContact()` method then hits `PUT /crm/v5/Contacts/{id}` with this ID embedded in the URL path. This is correct **as long as** `findContact()` always returns the raw Zoho record. However:

1. The `findContact()` response uses `response.data` (the raw array), so `contact.id` is Zoho's internal `id` field — this is valid for v5
2. **The real risk**: if `findContact()` is ever refactored to return a mapped/normalized object and the `id` field is renamed or dropped, all updates break silently (no TypeScript error because the return type is `Promise<any>`)

**Secondary risk — `updateContact` patches ALL fields:**
The current implementation sends every field in the update payload, including `undefined` values:
```ts
data: [{
  First_Name: contact.First_Name,  // could be undefined if not in payload
  ...
}]
```
Zoho ignores `undefined` JSON values in the body, but if `contact.First_Name` is explicitly `undefined`, it may arrive as a JSON key with no value depending on the serializer. Safe in practice with `axios` (omits `undefined`), but fragile.

**Prevention:**
- Type the return value of `findContact()` strictly: `Promise<{ id: string; Email: string; [key: string]: any } | null>`
- Never pass `undefined`-valued keys to Zoho update — filter them out: `Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined))`
- Add a unit test asserting that `findContact()` always returns an object with a non-empty `id` string

---

### Pitfall 4: `updateContactStats()` Read-Modify-Write Race Condition

**What goes wrong:**
"Increment a custom field" in Zoho CRM has no native atomic increment API for Contact fields. The only way is:
1. `GET /crm/v5/Contacts/{id}` — read current value of custom counter field
2. `PUT /crm/v5/Contacts/{id}` — write `current + 1`

If two events fire concurrently (e.g., `ad_published` and `ad_paid` for the same user within milliseconds), both reads see `current = 5`, both write `6` — the final value is `6` instead of `7`. Lost increment.

**Why it's likely:**
Strapi lifecycle hooks and payment webhooks can fire nearly simultaneously. The `pack_purchased` → Webpay callback and the `ad_published` event are separate async flows with no coordination.

**Consequences:**
- Contact stats counters (`total_ads_published`, `total_packs_purchased`) undercount, slowly drifting from reality
- Silent — no error, no log entry, just a wrong number in CRM

**Prevention options (ordered by preference):**
1. **Queue all CRM stat updates through a Strapi service with in-memory locking per-user** — simple, effective for a single-instance server
2. **Accept eventual inconsistency and use periodic reconciliation** — a cron job compares Strapi counts vs. Zoho fields nightly and corrects drift
3. **If Zoho introduces atomic increments via PATCH or scripting** — check Zoho Functions/Webhooks for server-side increment support (not available in REST API v5 as of research date)

**Detection:**
- CRM stats lower than Strapi actual counts
- Discrepancy grows over time proportional to user activity

---

### Pitfall 5: Test File Hits Production Zoho CRM

**What goes wrong:**
`zoho.test.ts` imports `zohoService` directly from `./index`, which reads real env vars (`ZOHO_CLIENT_ID`, etc.) and makes live HTTP calls to `https://www.zohoapis.com`. Running `yarn test` or CI creates real leads in production Zoho CRM and searches for personal email `geo2019ab@gmail.com`.

**Confirmed in existing code:**
```ts
// zoho.test.ts — runs against production
import { zohoService } from "./index";
it("should create a real lead in Zoho CRM", async () => { ... });
it("should find a contact by email", async () => {
  const contact = await zohoService.findContact("geo2019ab@gmail.com"); // personal email hardcoded
```

**Consequences:**
- Production CRM polluted with test leads on every CI run
- Personal email hardcoded — any contributor running tests queries a private account
- New methods (`createDeal`, `updateContactStats`) added without mocking will also hit production on CI
- Tests fail if Zoho is down or token is expired in CI environment

**Prevention:**
- Replace test file entirely with Jest mocks:
  ```ts
  jest.mock("./http-client");
  const mockPost = jest.fn().mockResolvedValue({ data: [{ code: "SUCCESS", details: { id: "123" } }] });
  ```
- Use `jest.spyOn(zohoService, 'createLead')` pattern for integration-level tests
- Add a `.env.test` file (gitignored) with `ZOHO_CLIENT_ID=""` to prevent accidental live calls
- If real integration tests are needed, use Zoho's Sandbox environment (`sandbox.zohoapis.com`) and a dedicated test account

**Detection:**
- `grep -r "real" apps/strapi/src/services/zoho/` finds "Real Integration" test description
- `grep -r "geo2019ab"` finds hardcoded personal email

---

### Pitfall 6: `userUpdateController` Is Imported But Never Routed

**What goes wrong:**
`userUpdateController.ts` exports `updateUser` and it imports `zohoService`, but `strapi-server.ts` only registers `getUserDataWithFilters` for the `plugin.controllers.user.find` slot. The `updateUser` function is never wired to any route. Any call to update user profile (which should sync Zoho) never invokes this controller.

**Confirmed:**
```ts
// strapi-server.ts — only one controller registered
plugin.controllers.user.find = getUserDataWithFilters;
// updateUser is imported nowhere in strapi-server.ts
return plugin;
```

**Per AGENTS.md**: Custom controllers in plugin extensions are **not supported** in Strapi v5. The correct pattern is middlewares, which is already what `user-registration.ts` uses for the registration flow.

**Consequences:**
- The Zoho contact sync on user profile update (address, phone, etc.) never fires
- Contact data in Zoho stays stale after user fills their profile
- Dead code and dead imports that mislead developers about what's active

**Prevention:**
- Move the Zoho sync logic from `userUpdateController.ts` into the existing `user-registration.ts` middleware (which already handles multiple `path` conditions)
- Add a new condition for `PUT /api/users/{id}` path in the middleware
- Delete `userUpdateController.ts` or rename it clearly as non-functional pending refactor
- Never add new routes to `strapi-server.ts` controllers for users-permissions plugin (Strapi v5 restriction)

---

## Moderate Pitfalls

### Pitfall 7: Hardcoded `"Waldo API"` Company Fallback in Leads

**What goes wrong:**
`zoho.service.ts` line 29: `Company: lead.company || "Waldo API"`. Company is mandatory for a Zoho Lead (`Company` field is required). When contact form submissions have no company (individual users), the CRM shows "Waldo API" as company for all of them — internal-looking placeholder visible to any sales person reviewing leads.

**Prevention:**
- For contact form leads with no company, use `"Particular"` or `"No especificado"` (matching the Chilean market context)
- Or configure the Zoho Lead layout to make Company optional (requires Zoho Admin access, not code change)
- At minimum, change the fallback to a non-internal-sounding value: `lead.company || "Particular"`

---

### Pitfall 8: `ZohoFollowUp` Interface Is Dead Code — Don't Implement Against It

**What goes wrong:**
`interfaces.ts` defines `ZohoFollowUp` and `IZohoService` omits any `createFollowUp()` method. The README shows a usage example for `createFollowUp()` that doesn't exist. If a developer reads the README and tries to implement `createFollowUp()`, they'll implement against phantom requirements.

**Prevention:**
- Delete `ZohoFollowUp` from `interfaces.ts` entirely if not being implemented in this milestone
- Do not add `createFollowUp()` to the scope of the new milestone without explicit product requirement
- README should be updated to remove the dead code example before new code is written

---

### Pitfall 9: `ZOHO_*` Env Vars Missing from `.env.example`

**What goes wrong:**
The `.env.example` (confirmed by inspection) has no `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, or `ZOHO_API_URL` entries. New developers cloning the repo won't know these vars exist. The `index.ts` silently falls back to empty strings:
```ts
clientId: process.env.ZOHO_CLIENT_ID || "",
```
Empty string client ID causes the token refresh to fail with `invalid_client` — but since `ZohoHttpClient` only fetches the token on first API call, the server starts fine and the error only appears at runtime when a Zoho call is triggered.

**Prevention:**
- Add to `.env.example`:
  ```env
  # Zoho CRM configuration
  ZOHO_CLIENT_ID=your_zoho_client_id
  ZOHO_CLIENT_SECRET=your_zoho_client_secret
  ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
  ZOHO_API_URL=https://www.zohoapis.com
  ```
- Add a startup validation in `index.ts` (or Strapi's `register()` hook) that warns if any `ZOHO_*` var is missing

---

### Pitfall 10: `console.error` Mixed With Structured Logger

**What goes wrong:**
Three files use `console.error` alongside the structured `logtail` logger:
- `zoho.service.ts`: `console.error("Zoho API Error:", ...)` in `createContact`, `findContact`, `updateContact`
- `contact.service.ts`: `console.error("Error saving to Zoho CRM:", ...)` after `logger.error(...)`
- `userUpdateController.ts`: no `console.error` (already uses only `logger`)

`console.error` writes to raw stdout/stderr, bypassing Logtail's structured format. On production (Heroku/PM2/Docker), these messages land in the process log without metadata (`userId`, `stacktrace`, `service`) — making them hard to correlate with user activity or trace in log management tools.

**Prevention:**
- Replace all `console.error` in Zoho-related code with `logger.error("...", { context })`
- New methods (`createDeal`, `updateContactStats`) must use only `logger` — no `console.*`
- The `console.log` statements in `userUpdateController.ts` (lines 14-25) are debug-only — remove before shipping

---

### Pitfall 11: Zoho API Domain Is Region-Specific — Hardcoded `zohoapis.com` May Wrong Region

**What goes wrong:**
Zoho CRM has different API domains per data center region:
- US: `https://www.zohoapis.com`
- EU: `https://www.zohoapis.eu`
- IN: `https://www.zohoapis.in`
- AU: `https://www.zohoapis.com.au`

The `ZOHO_API_URL` env var defaults to `"https://www.zohoapis.com"` (US). If the Waldo Zoho account was created in the EU or a non-US region (common for Chilean businesses which may use EU data centers), all API calls return `INVALID_URL_PATTERN` or auth errors because the token was issued for a different domain.

**Prevention:**
- Confirm the exact API domain from Zoho Admin → Setup → Developer Hub → API Domain
- The `access-refresh.html` doc confirms: "Use the value in the 'api_domain' key" returned by the token exchange response — store this dynamically rather than hardcoding a default
- For safety, log the effective `ZOHO_API_URL` at startup

---

### Pitfall 12: `findContact()` Returns First Match — Duplicate Contacts Cause Wrong Updates

**What goes wrong:**
`findContact(email)` uses `criteria: (Email:equals:${email})` and returns `response.data[0]` — always the first result. If a Zoho contact was duplicated (common when both the registration middleware and the contact form create contacts for the same email), `updateContact()` and stats increments always target only one of the duplicates, leaving the other stale.

**Consequences:**
- User updates their profile → one duplicate updated, one unchanged
- Deal created → linked to the "wrong" duplicate contact
- CRM data appears inconsistent to sales staff

**Prevention:**
- After `createContact()`, check for `DUPLICATE_DATA` in the Zoho API response (the v5 API returns `"code": "DUPLICATE_DATA"` with the existing record's ID in `details`)
- In `createContact()`, handle the duplicate response by returning the existing record's ID rather than throwing
- Consider using Zoho's **upsert** endpoint (`/crm/v5/Contacts/upsert`) which handles create-or-update atomically based on duplicate-check fields

---

## Minor Pitfalls

### Pitfall 13: Zoho Response Shape Not Validated — `data[0]` Assumption

**What goes wrong:**
`createContact()` returns `response.data[0]` and `updateContact()` returns `response.data[0]` without checking if `data` is a non-empty array. If Zoho returns `{ data: [] }` (which can happen if the record was rejected by a workflow), `data[0]` is `undefined` and callers receive `undefined` as a "created contact" — then `contact.id` throws `TypeError: Cannot read property 'id' of undefined`.

**Prevention:**
```ts
const record = response.data?.[0];
if (!record || record.code !== "SUCCESS") {
  throw new Error(`Zoho rejected record: ${record?.message || "unknown"}`);
}
return record.details;
```

---

### Pitfall 14: `Deal_Name` Must Be Unique-Enough to Be Searchable

**What goes wrong:**
Creating all deals with generic names like `"Pack Purchase"` or `"Ad Payment"` makes Zoho's internal search and de-duplication useless. When troubleshooting a specific transaction, there's no way to find it without the Zoho record ID.

**Prevention:**
Include the Strapi entity ID and date in `Deal_Name`: `"Pack #${packId} — User ${userId} — ${new Date().toISOString().slice(0,10)}"`. This is searchable and unique without being cryptic.

---

### Pitfall 15: Event Wiring Has No Idempotency Guard

**What goes wrong:**
Strapi lifecycle hooks or payment webhooks can fire more than once (Webpay retries, double-click form submissions, server retry on timeout). Without an idempotency check, `createDeal()` creates duplicate deals and `updateContactStats()` increments twice.

**Prevention:**
- For `createDeal()`: before creating, search for an existing deal with the same `buyOrder` reference in the `Description` or a custom external ID field — skip creation if found
- For `updateContactStats()`: accept that minor over-counting is tolerable OR track the last event processed (store `lastZohoSync` timestamp per user in Strapi and skip if event is older than the last sync)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Fix 401 token refresh | Pitfall 1 | Add response interceptor with single retry before any new methods |
| Implement `createDeal()` | Pitfall 2, 13, 14, 15 | Require contactId param; validate response; use meaningful Deal_Name; add idempotency |
| Implement `updateContactStats()` | Pitfall 4, 13 | Accept race risk + add nightly reconciliation cron; validate response |
| Wire `pack_purchased` event | Pitfall 2, 15 | `findContact()` → `createDeal()` chain; idempotency guard via buyOrder |
| Wire `ad_paid` event | Pitfall 2, 15 | Same chain; different amount field |
| Wire `ad_published` event | Pitfall 4, 15 | Increment counter; accept eventual consistency |
| Mock tests for new methods | Pitfall 5 | New test file must mock `ZohoHttpClient`; no live calls |
| Route `userUpdateController` sync | Pitfall 6 | Move logic to `user-registration.ts` middleware; delete dead controller |
| Clean up console.error | Pitfall 10 | Replace with logger before each feature is marked done |
| Add env vars to `.env.example` | Pitfall 9 | Do it in first commit, not as a cleanup task at the end |

---

## "Looks Done But Isn't" Checklist

- [ ] **Token refresh on 401**: Response interceptor with `_retry` flag added to `ZohoHttpClient`
- [ ] **`createDeal()` has contactId param**: No deal created without a linked Contact
- [ ] **No orphaned deals**: `findContact()` called before every `createDeal()`; null case handled
- [ ] **Tests are mocked**: `zoho.test.ts` uses `jest.mock('./http-client')`, no live calls
- [ ] **No hardcoded personal emails**: `grep -r "geo2019ab" apps/strapi/src/` returns nothing
- [ ] **No `console.error` in Zoho code**: All logging uses `logger.error()`
- [ ] **No debug `console.log`**: `userUpdateController.ts` debug block removed
- [ ] **`ZohoFollowUp` dead code removed**: Interface deleted or clearly marked as unimplemented
- [ ] **`.env.example` updated**: All four `ZOHO_*` vars present
- [ ] **`"Waldo API"` fallback replaced**: `lead.company || "Particular"` or similar
- [ ] **`createContact()` handles DUPLICATE_DATA**: Returns existing ID rather than throwing
- [ ] **`data[0]` calls guarded**: `response.data?.[0]` with `code === "SUCCESS"` check
- [ ] **`userUpdateController` routing confirmed**: Either properly wired via middleware or deleted

---

## Sources

- Zoho CRM API v5 — OAuth Overview: https://www.zoho.com/crm/developer/docs/api/v5/oauth-overview.html (HIGH confidence — official, confirms 1h token expiry)
- Zoho CRM API v5 — Access & Refresh Tokens: https://www.zoho.com/crm/developer/docs/api/v5/access-refresh.html (HIGH confidence — official, confirms `expires_in: 3600`)
- Zoho CRM API v5 — Insert Records (Deals mandatory fields): https://www.zoho.com/crm/developer/docs/api/v5/insert-records.html (HIGH confidence — official, confirms `Deal_Name` + `Stage` mandatory, DUPLICATE_DATA error format)
- Zoho CRM API v5 — Update Records: https://www.zoho.com/crm/developer/docs/api/v5/update-records.html (HIGH confidence — official, confirms `id` required in body for bulk update)
- Direct codebase inspection: `apps/strapi/src/services/zoho/` (all files), `apps/strapi/src/extensions/users-permissions/`, `apps/strapi/src/middlewares/user-registration.ts`, `apps/strapi/src/api/payment/services/` (HIGH confidence — confirmed bugs)
- AGENTS.md: Strapi v5 — "Custom controllers in plugin extensions are not supported" (HIGH confidence)

---
*Pitfalls research for: Zoho CRM Sync Model — Strapi v5 Backend (waldo.click, Chile)*
*Researched: 2026-03-07*

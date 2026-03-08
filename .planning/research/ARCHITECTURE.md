# Architecture Research: Zoho CRM Sync Model

**Project:** Waldo — v1.19 Zoho CRM Integration  
**Researched:** 2026-03-07  
**Confidence:** HIGH — All findings sourced from reading actual codebase + Strapi v5 official docs

---

## Existing Architecture (relevant)

### 1. User Registration → Zoho Contact

**Trigger:** Koa middleware `src/middlewares/user-registration.ts`  
**Pattern:** Post-response (`await next()` first, then inspect `response.body`)  
**Covered paths:**
- `POST /api/auth/local/register` (local)
- `GET /api/auth/:provider/callback` (Google; deduped via `processedTokens` Set)

**Current call:** `zohoService.createContact({ First_Name, Last_Name, Email, User_ID, Lead_Source })`  
**Fire-and-forget:** ✅ try/catch around Zoho call, never throws to caller

**Gap identified:** Google registration uses `email.split('@')[0]` for both First and Last name — low data quality. Local registration correctly uses `firstname`/`lastname`.

---

### 2. User Profile Update → Zoho Contact upsert

**Trigger:** Custom controller `src/extensions/users-permissions/controllers/userUpdateController.ts`  
**Pattern:** Called directly after `strapi.entityService.update()`  
**Current call:** `findContact(email)` → if found: `updateContact(id, data)`, if not: `createContact(data)` — rich address/phone fields  
**Fire-and-forget:** ✅ try/catch, never throws  
**Route status:** Exists and is routed — used for profile completion endpoint in the website wizard.

---

### 3. Contact Form → Zoho Lead

**Trigger:** `src/api/contact/services/contact.service.ts` — `createContact()` method  
**Pattern:** Called directly inline after DB write  
**Current call:** `zohoService.createLead({ firstName, lastName, email, phone, company, description, source })`  
**Fire-and-forget:** ✅ try/catch, never throws  
**Gap identified:** `status` field not set on lead creation; lead not linked to existing Contact if user is already registered.

---

### 4. Pack Purchase → (nothing today)

**Trigger:** `src/api/payment/controllers/payment.ts` → `packResponse` handler  
**Flow:** `packService.processPaidWebpay(token)` → on AUTHORIZED → create ad/featured reservations → `generalUtils.generateFactoDocument()` → `OrderUtils.createAdOrder()` → `ctx.redirect(...)`  
**No Zoho call today.** The `processPaidWebpay` method in `pack.service.ts` returns `{ success, userId, pack, webpay, isInvoice }` — `userId` is a plain string extracted from `buy_order` meta.

---

### 5. Paid Ad Activation → (nothing today)

**Trigger:** `src/api/payment/controllers/payment.ts` → `adResponse` handler  
**Flow:** `adService.processPaidWebpay(token)` → on AUTHORIZED → create/assign reservations → `generateFactoDocument()` → `OrderUtils.createAdOrder()` → `ctx.redirect(...)`  
**No Zoho call today.** `result.ad.user.id`, `result.ad.user.email`, `result.ad.user.firstname/lastname`, `result.webpay.amount` are all available at this point.

---

### 6. Ad Approved → "ad_published"

**Trigger:** `src/api/ad/services/ad.ts` → `approveAd()` method  
**Pattern:** Called by admin dashboard action; sets `active: true`, sends approval email via `sendMjmlEmail`  
**No Zoho call today.** `ad.user` is populated via `strapi.query("api::ad.ad").findOne({ where: { id: adId }, populate: ["user"] })` — email is available.

---

### 7. Existing Ad Lifecycle Hook

`src/api/ad/content-types/ad/lifecycles.ts` — only has `afterCreate`, sends Slack notification.  
**No update or approve hooks exist.** This is relevant: the `approveAd()` method does NOT go through a lifecycle hook — it is a direct service call.

---

## New Components

### 1. `ZohoDeal` interface — `interfaces.ts`

```typescript
export interface ZohoDeal {
  contactId: string;        // Zoho Contact ID (looked up by email via findContact)
  dealName: string;         // e.g. "Pack Starter — Juan Pérez" or "Anuncio Pagado — slug"
  stage: string;            // e.g. "Closed Won"
  amount: number;           // purchase amount in CLP
  closeDate: string;        // ISO date string YYYY-MM-DD
  description?: string;     // pack name or ad slug
  type: 'pack_purchase' | 'ad_paid';
}
```

### 2. `ZohoContactStats` interface — `interfaces.ts`

```typescript
export interface ZohoContactStats {
  ads_published?: number;       // new total (fetch current + 1, then set)
  total_spent?: number;         // new total (fetch current + amount, then set)
  last_ad_posted_at?: string;   // ISO date string
  packs_purchased?: number;     // new total (fetch current + 1, then set)
}
```

> **Note on increments:** Field values in `ZohoContactStats` are **totals**, not deltas. Callers must fetch the current contact values (already done via `findContact()`) and compute the new total before passing it here.

### 3. `IZohoService` extension — `interfaces.ts`

Add to the existing `IZohoService` interface:

```typescript
createDeal(deal: ZohoDeal): Promise<any>;
updateContactStats(contactId: string, stats: ZohoContactStats): Promise<any>;
```

---

## Modified Components

### 1. `zoho.service.ts` — add `createDeal()` and `updateContactStats()`

**`createDeal(deal: ZohoDeal)`**

Mirrors `createContact` pattern exactly: POST to `/crm/v5/Deals`, return `response.data[0]`, rethrow on failure (caller wraps in fire-and-forget try/catch).

```typescript
async createDeal(deal: ZohoDeal): Promise<any> {
  try {
    const response = await this.httpClient.post<{ data: any[] }>(
      '/crm/v5/Deals',
      {
        data: [{
          Deal_Name: deal.dealName,
          Stage: deal.stage,
          Amount: deal.amount,
          Closing_Date: deal.closeDate,
          Contact_Name: { id: deal.contactId },
          Description: deal.description ?? '',
          Deal_Type: deal.type,
        }],
      }
    );
    return response.data[0];
  } catch (error) {
    console.error('Zoho API Error (createDeal):', error.response?.data || error.message);
    throw new Error(`Failed to create deal: ${error.message}`);
  }
}
```

**`updateContactStats(contactId, stats)`**

Maps to `PUT /crm/v5/Contacts/:id` with only the non-undefined stat fields. Uses same endpoint as `updateContact` but accepts only stats fields.

```typescript
async updateContactStats(contactId: string, stats: ZohoContactStats): Promise<any> {
  try {
    const fields: Record<string, any> = {};
    if (stats.ads_published !== undefined) fields.Ads_Published = stats.ads_published;
    if (stats.total_spent !== undefined) fields.Total_Spent = stats.total_spent;
    if (stats.last_ad_posted_at !== undefined) fields.Last_Ad_Posted_At = stats.last_ad_posted_at;
    if (stats.packs_purchased !== undefined) fields.Packs_Purchased = stats.packs_purchased;

    const response = await this.httpClient.put<{ data: any[] }>(
      `/crm/v5/Contacts/${contactId}`,
      { data: [fields] }
    );
    return response.data[0];
  } catch (error) {
    console.error('Zoho API Error (updateContactStats):', error.response?.data || error.message);
    throw new Error(`Failed to update contact stats: ${error.message}`);
  }
}
```

> **⚠️ External dependency:** The Zoho field API names (`Ads_Published`, `Total_Spent`, etc.) are set when custom fields are created in the Zoho CRM admin panel. The placeholders above are illustrative. The actual API names must be confirmed from the Zoho CRM schema before this method can work end-to-end. Add a `// TODO: confirm Zoho field API names` comment until resolved.

---

### 2. `http-client.ts` — add 401 response interceptor

See [Token Refresh Enhancement](#token-refresh-enhancement) section below.

---

### 3. `interfaces.ts` — add new interfaces and extend `IZohoService`

Add `ZohoDeal`, `ZohoContactStats`, and extend `IZohoService` as described in New Components above. All additions go at the bottom of the file to minimize diff.

---

### 4. `pack.service.ts` — wire `pack_purchased` event

In `PackService.processPaidWebpay()`, after reservations are created and before `return { success: true, ... }`.

**Data available at that point:**
- `userId` (string) — extracted from `buyOrder` via `extractIdsFromMeta`
- `packData.data` — `{ price, total_ads, total_days, total_features, name }`
- `wepbayResponse.response.amount` — actual charged amount

**Pattern (fire-and-forget):**
```typescript
// Sync to Zoho CRM (fire-and-forget)
try {
  const userRecord = await strapi.entityService.findOne(
    'plugin::users-permissions.user',
    Number(userId),
    { fields: ['email', 'firstname', 'lastname'] }
  );
  if (userRecord?.email) {
    const zohoContact = await zohoService.findContact(userRecord.email);
    if (zohoContact) {
      const currentPacks = zohoContact.Packs_Purchased ?? 0;
      const currentSpent = zohoContact.Total_Spent ?? 0;
      await Promise.all([
        zohoService.createDeal({
          contactId: zohoContact.id,
          dealName: `Pack ${packData.data.name} — ${userRecord.firstname} ${userRecord.lastname}`,
          stage: 'Closed Won',
          amount: wepbayResponse.response.amount,
          closeDate: new Date().toISOString().split('T')[0],
          description: packData.data.name,
          type: 'pack_purchase',
        }),
        zohoService.updateContactStats(zohoContact.id, {
          total_spent: currentSpent + wepbayResponse.response.amount,
          packs_purchased: currentPacks + 1,
        }),
      ]);
    }
  }
} catch (error) {
  logger.error('Error syncing pack purchase to Zoho CRM:', {
    userId,
    error: error.message,
  });
}
```

**Import needed:** `import { zohoService } from '../../../services/zoho';` at the top of `pack.service.ts`.

---

### 5. `payment.ts` controller — wire `ad_paid` event in `adResponse`

After `OrderUtils.createAdOrder()` and before `ctx.redirect(...)`.

**Data available:**
- `result.ad.user.email`, `result.ad.user.firstname`, `result.ad.user.lastname`
- `result.ad.id`, `result.ad.slug`
- `result.webpay.amount`

**Pattern (truly non-blocking — do not await before redirect):**
```typescript
// Sync to Zoho CRM (truly non-blocking: .then/.catch, not await)
zohoService.findContact(result.ad.user.email).then(async (zohoContact) => {
  if (!zohoContact) return;
  const currentSpent = zohoContact.Total_Spent ?? 0;
  await Promise.all([
    zohoService.createDeal({
      contactId: zohoContact.id,
      dealName: `Anuncio Pagado — ${result.ad.slug}`,
      stage: 'Closed Won',
      amount: result.webpay.amount,
      closeDate: new Date().toISOString().split('T')[0],
      description: result.ad.slug,
      type: 'ad_paid',
    }),
    zohoService.updateContactStats(zohoContact.id, {
      total_spent: currentSpent + result.webpay.amount,
    }),
  ]);
}).catch((error) => {
  logger.error('Error syncing ad payment to Zoho CRM:', {
    adId: result.ad.id,
    error: error.message,
  });
});
// (no await — redirect proceeds immediately)
```

**Why `.then().catch()` not `try/await`:** `adResponse` is a browser redirect endpoint. The `ctx.redirect(...)` must execute without any delay introduced by async Zoho calls. Using a floating promise (`.then().catch()` with no `await`) means Zoho sync happens concurrently with the redirect.

**Import needed:** `import { zohoService } from '../../../services/zoho';` at the top of `payment.ts` controller.

---

### 6. `ad/services/ad.ts` — wire `ad_published` event in `approveAd()`

After `strapi.query().update()` (the `active: true` write) and after the approval email, before `return { success: true, ... }`.

**Data available:**
- `ad.user.email` — from `findOne({ populate: ['user'] })` already called at the start of `approveAd`
- `ad.id`, `ad.name`, `ad.slug`

**Pattern (fire-and-forget):**
```typescript
// Sync to Zoho CRM (fire-and-forget)
try {
  const zohoContact = await zohoService.findContact(ad.user.email);
  if (zohoContact) {
    const currentPublished = zohoContact.Ads_Published ?? 0;
    await zohoService.updateContactStats(zohoContact.id, {
      ads_published: currentPublished + 1,
      last_ad_posted_at: new Date().toISOString(),
    });
  }
} catch (error) {
  console.error('Error syncing ad approval to Zoho CRM:', error.message);
}
```

**Import needed:** `import { zohoService } from '../../../services/zoho';` at the top of `ad.ts`. This file uses `factories.createCoreService` and currently imports `sendMjmlEmail` — add `zohoService` to the same import block.

---

## Event Wiring Strategy

### Decision: Direct service calls (not lifecycle hooks, not Strapi event hub)

**Verdict:** Call `zohoService` directly from payment services and the `approveAd` service method.

| Approach | Verdict | Reason |
|---|---|---|
| **`afterUpdate` lifecycle hook on Ad** | ❌ Avoid | Fires on every ad update: name change, cron decrementing `remaining_days`, ban, reject. Filtering "is this an approval?" requires `beforeUpdate` state passing — fragile and non-obvious. |
| **`afterCreate` lifecycle hook on Order** | ❌ Avoid | Fires for pack orders, ad orders, and potentially future order types. Would require inspecting order `items` to determine which Zoho call to make. Creates hidden coupling. |
| **`strapi.eventHub.emit()` + subscriber** | ⚠️ Possible but unnecessary | Adds indirection without benefit. The callers already have all needed context. Pub/sub is appropriate when decoupling is required (e.g., multiple consumers). Here there's one consumer. |
| **Direct call at payment commit point** | ✅ Recommended | Context is fully populated (user email, amount, pack/ad data). Explicit causality. Consistent with existing fire-and-forget pattern in `contact.service.ts` and `userUpdateController.ts`. |
| **Direct call in `approveAd()`** | ✅ Recommended | Service already populates user. Same location as email send. Same reasoning. Consistent with pattern. |

### Confirmed by official Strapi v5 docs

Lifecycle hooks via `lifecycles.ts` are triggered declaratively on DB-layer operations. For `approveAd()`, the operation is `strapi.query().update()` — this WOULD trigger `afterUpdate` on the `ad` model. However, the `event.params.data` in that context only contains `{ active: true, actived_at, actived_by }` — not the user email. A second query would be needed inside the lifecycle, duplicating the work already done in `approveAd()`. Direct call is strictly better.

### Event → Call Mapping

| Event | Trigger Location | Zoho Calls Made |
|---|---|---|
| `pack_purchased` | `PackService.processPaidWebpay()` — after reservations created | `findContact()` → `createDeal()` + `updateContactStats({ total_spent, packs_purchased })` |
| `ad_paid` | `PaymentController.adResponse` — after order created, before redirect | `findContact()` → `createDeal()` + `updateContactStats({ total_spent })` |
| `ad_published` | `AdService.approveAd()` — after `active: true` written | `findContact()` → `updateContactStats({ ads_published, last_ad_posted_at })` |

### Increment strategy for stats

Zoho CRM REST API v5 does NOT support atomic numeric increments. The approach:

1. `findContact(email)` is already called to get the Zoho Contact ID — also read current stat values from the same response object (e.g., `zohoContact.Ads_Published`)
2. Compute new total locally: `current + delta`
3. PUT new total via `updateContactStats()`

No extra HTTP round-trip needed. Concurrency risk is accepted as LOW for this platform.

---

## Token Refresh Enhancement

### Current behavior (gap)

`setupInterceptors()` adds a **request interceptor** that fetches a token if `this.accessToken` is null. This means:
- Token fetched lazily on first request ✅
- Token **never refreshed after expiry** — Zoho access tokens expire in 1 hour ❌
- Any request after expiry returns 401 and the stale token stays cached ❌

### Enhancement: Response interceptor with one-retry-on-401

Add a response interceptor to `setupInterceptors()`:

```typescript
private setupInterceptors() {
  // Existing request interceptor — UNCHANGED
  this.client.interceptors.request.use(async (config) => {
    if (!this.accessToken) {
      await this.refreshAccessToken();
    }
    config.headers.Authorization = `Bearer ${this.accessToken}`;
    return config;
  });

  // NEW: response interceptor — retry once on 401 (expired token)
  this.client.interceptors.response.use(
    (response) => response,                        // pass-through on success
    async (error) => {
      const originalRequest = error.config as any; // 'as any' — minimal, justified cast

      if (error.response?.status === 401 && !originalRequest._zohoRetried) {
        originalRequest._zohoRetried = true;       // prevent infinite loop
        this.accessToken = null;                   // invalidate stale token
        await this.refreshAccessToken();           // fetch fresh token
        originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
        return this.client(originalRequest);       // replay original request
      }

      return Promise.reject(error);               // any other error — propagate
    }
  );
}
```

**Implementation details:**
- `_zohoRetried` flag on the config object: prevents the retry from itself triggering a second retry (one-shot pattern)
- `this.accessToken = null` before `refreshAccessToken()`: forces a fresh fetch (the existing `refreshAccessToken()` implementation doesn't check for an existing token — it always fetches)
- `this.client(originalRequest)`: replays using the same axios instance (preserves `baseURL`, default headers)
- `error.config as any`: minimal cast to add `_zohoRetried` — consistent with project cast patterns ("cast is strictly necessary and documented")
- If `refreshAccessToken()` itself fails (e.g., bad credentials), the error propagates to the caller's try/catch — no silent swallowing
- Existing `get`, `post`, `put` method signatures are unchanged — no callers need updating

**No changes needed in:**
- `refreshAccessToken()` method (works as-is)
- `get()`, `post()`, `put()` methods
- `ZohoFactory` or `index.ts`

---

## Build Order

### Phase 1 — Foundation: Interfaces + 401 retry

**Files:** `interfaces.ts`, `http-client.ts`

1. Add `ZohoDeal` interface
2. Add `ZohoContactStats` interface
3. Extend `IZohoService` with `createDeal()` and `updateContactStats()` signatures
4. Add response interceptor to `ZohoHttpClient.setupInterceptors()`

**Why first:** Everything else depends on these interfaces. Token reliability must be solid before new methods add more API calls.

**External prerequisite to resolve in this phase:** Confirm Zoho CRM custom field API names for stats fields. Without these, `updateContactStats()` cannot be correctly implemented.

---

### Phase 2 — Service Methods: `createDeal()` + `updateContactStats()`

**Files:** `zoho.service.ts`

1. Implement `createDeal()` — mirrors `createContact` pattern
2. Implement `updateContactStats()` — uses `PUT /crm/v5/Contacts/:id` with confirmed field names

**Why second:** All three event wirings depend on these methods existing.

**Gate:** Zoho custom field names from Phase 1 prerequisite must be resolved.

---

### Phase 3 — `pack_purchased` wiring

**Files:** `pack.service.ts`

1. Add `zohoService` import
2. Add `strapi.entityService.findOne` to resolve user email from `userId` string
3. Add `findContact` → `createDeal` + `updateContactStats` fire-and-forget block

**Why third:** Pack service has simpler wiring (not a redirect endpoint; full `await` is fine). Good first real-world validation of the new methods against live Zoho API.

---

### Phase 4 — `ad_paid` wiring

**Files:** `src/api/payment/controllers/payment.ts`

1. Add `zohoService` import
2. Add `.then().catch()` truly-non-blocking block after `OrderUtils.createAdOrder()`, before `ctx.redirect(...)`

**Why fourth:** Uses same methods as Phase 3 but with a different async pattern (no `await`). Validate separately.

---

### Phase 5 — `ad_published` wiring

**Files:** `src/api/ad/services/ad.ts`

1. Add `zohoService` import
2. In `approveAd()`, after approval write and email, add `findContact` → `updateContactStats` block

**Why fifth:** Only uses `updateContactStats` (no deal). Cleanest addition — user email already populated.

---

### Summary Table

| Phase | Scope | Files Modified | Depends On |
|---|---|---|---|
| 1 | Interfaces + 401 retry | `interfaces.ts`, `http-client.ts` | Nothing (external: confirm Zoho field names) |
| 2 | New service methods | `zoho.service.ts` | Phase 1 + Zoho field names confirmed |
| 3 | `pack_purchased` event | `pack.service.ts` | Phase 2 |
| 4 | `ad_paid` event | `controllers/payment.ts` | Phase 2 |
| 5 | `ad_published` event | `api/ad/services/ad.ts` | Phase 2 |

Phases 3, 4, 5 are independent of each other and can be completed in any order once Phase 2 is done.

---

## Cross-Cutting Concerns

### Fire-and-forget discipline — preserved

All new Zoho calls maintain the existing pattern established in `contact.service.ts` and `user-registration.ts`:

```
try {
  // Zoho calls (awaited internally)
} catch (error) {
  logger.error('...', { error: error.message });
  // NO rethrow — main request never fails due to CRM sync
}
```

Exception: `adResponse` uses `.then().catch()` (floating promise) to avoid any `await` before the redirect.

### Contact lookup overhead

Every new event requires one `findContact(email)` call (~200–500ms) to resolve the Zoho Contact ID. Since all calls are fire-and-forget, this does not affect user-facing response time. If `findContact` returns `null` (user not yet in Zoho), the sync is silently skipped — correct behavior to avoid orphaned records.

### Zoho custom fields are an external dependency

`updateContactStats()` cannot be tested end-to-end until the custom fields exist in Zoho CRM and their exact API names are confirmed. This is the only external dependency in the entire milestone. Resolving it is prerequisite to Phase 2.

### No lifecycle hooks added

Confirmed against Strapi v5 docs: lifecycle hooks (`lifecycles.ts`) fire on DB-layer operations but lack the business context (user email, amount, pack name) available at the service/controller level. Direct calls are unambiguously superior here.

---

## Sources

- Direct code inspection: `zoho.service.ts`, `http-client.ts`, `interfaces.ts`, `factory.ts`, `index.ts`
- Direct code inspection: `user-registration.ts`, `userUpdateController.ts`, `contact.service.ts`
- Direct code inspection: `pack.service.ts`, `ad.service.ts`, `payment.ts` controller
- Direct code inspection: `ad/services/ad.ts`, `ad/content-types/ad/lifecycles.ts`
- Strapi v5 official docs: https://docs.strapi.io/dev-docs/backend-customization/models#lifecycle-hooks (verified: lifecycle hooks fire on DB operations; `afterUpdate` event params do not include pre-update values)
- Axios interceptor pattern: HIGH confidence from training data (standard pattern, unchanged for years)

---
*Architecture research for: Zoho CRM Sync Model — Strapi v5 backend (v1.19)*  
*Researched: 2026-03-07*

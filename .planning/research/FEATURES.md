# Features Research: Zoho CRM Sync Model

**Domain:** CRM sync — Zoho CRM v5 API integration from Strapi v5 backend  
**Researched:** 2026-03-07  
**Overall confidence:** HIGH (primary sources: official Zoho CRM v5 API documentation)

---

## Zoho Objects: Contact vs Lead vs Deal

### Contact

- **When to use:** A known, registered user of the platform. In Waldo's model, every user who creates an account is a Contact from the moment of registration.
- **Relationship:** Contacts belong to an Account. In B2C setups (no Account required), Contact is used standalone — Account can be omitted entirely.
- **Deduplication:** The system-defined duplicate-check field for Contacts is `Email`. Upsert by email using `POST /crm/v5/Contacts/upsert` is idempotent. The existing `findContact(email)` + conditional create/update pattern is also correct.
- **Existing service support:** `createContact()`, `findContact(email)`, `updateContact(id, data)` — all implemented and correct for the Contact lifecycle.
- **Key API name:** `Contacts`
- **Mandatory fields for creation:** `Last_Name` only (system-defined). Email is not technically mandatory but essential for deduplication.

### Lead

- **When to use:** An unqualified prospect whose identity is unknown or who has not yet registered. In Waldo's model, a **contact form submission** from a visitor maps to a Lead — it represents marketing interest, not a transacting user.
- **Critical distinction vs Contact:** Leads do NOT have financial history, Deals, or pack associations. They exist in a separate CRM pipeline and can be "converted" into Contact + Account + Deal via the Zoho UI.
- **Separation of concerns:** A Contact is someone who *has an account* (identity confirmed). A Lead is someone who *filled a form* (intent only, identity unconfirmed). Never create a Contact for a contact form submission — that would pollute the Contact database with unverified people.
- **Lead_Status field:** Required for meaningful CRM segmentation. **Currently missing** in the existing `createLead()` implementation — this is a v1.19 bug to fix.
- **Contact linkage:** When the contact-form submitter already exists as a Zoho Contact (found via `findContact(email)`), the Lead creation can be skipped; instead create a Note or Task against the existing Contact. Leads themselves have no direct `Contact_Name` lookup field.
- **Key API name:** `Leads`
- **Mandatory fields for creation:** `Last_Name` only (system-defined). `Company` is conventionally set to avoid empty state.

### Deal

- **When to use:** A revenue transaction. In Waldo's model: a **pack purchase** (user buys a bundle of ad credits) or a **single ad payment** (user pays for one ad). One financial event = one Deal.
- **Relationship to Contact:** Deals are linked to a Contact via the `Contact_Name` field — a standard Lookup field in the Deals module. Pass it as `{ "id": "<zoho_contact_id>" }`.
- **Relationship to Account:** Optional in B2C flows. If the Waldo org has no Accounts, omit `Account_Name` entirely.
- **Key API name:** `Deals`
- **Mandatory fields for creation:** `Deal_Name` (string) + `Stage` (picklist) — both system-defined mandatory.

---

## Deal API v5

### Endpoint

```
POST https://www.zohoapis.com/crm/v5/Deals
```

Authorization header must be: `Zoho-oauthtoken <access_token>` (not `Bearer`).

### Mandatory Fields (system-defined)

| Field API Name | Type | Notes |
|---|---|---|
| `Deal_Name` | String (≤255 chars) | Human-readable name. Use pattern: `"Pack Purchase — {username} — {date}"` or `"Ad Payment — {adTitle} — {date}"`. Truncate `adTitle` to stay within 255 chars. |
| `Stage` | Picklist | Must be a valid stage from the configured pipeline. For payment-confirmed deals, use `"Closed Won"` directly — payment already succeeded before the Deal is created. |

**Source:** Official Zoho CRM v5 Insert Records API — "System-defined mandatory fields" section. HIGH confidence.

### Important: Pipeline field

When the Zoho org has multiple pipelines enabled for the Deals module, `Pipeline` also becomes mandatory. If only the default "Standard" pipeline exists, it can be omitted. **Safe practice:** always include `"Pipeline": "Standard"` to future-proof against a sales team adding more pipelines.

### Strongly Recommended Fields

| Field API Name | Type | Notes |
|---|---|---|
| `Amount` | Currency (double) | The transaction amount in CLP. Pass as a JavaScript `number` (e.g., `15000`). Accepts up to 16 digits before decimal. |
| `Contact_Name` | Lookup JSON object | Links the Deal to a Contact. Pass `{ "id": "<zoho_contact_id>" }`. This is the primary association mechanism. |
| `Type` | Picklist | Categorises the deal type. Recommended: `"New Business"` for first-time purchases, `"Existing Business"` for repeat purchases. |
| `Description` | Multi-line string (≤2000 chars) | Embed Strapi Order ID and context for cross-referencing. |
| `Lead_Source` | Picklist | Where the deal originated. Use `"Web Site"` for all Waldo-originated deals. |
| `Closing_Date` | Date (`yyyy-MM-dd`) | The date payment was confirmed. Some pipeline views require it. Safe to always include as today's date. |

### Standard Deal Stages (Default "Standard" Pipeline)

From the official Get Pipelines API response (HIGH confidence):

| Stage (actual_value) | Forecast Type | When to Use in Waldo |
|---|---|---|
| `Qualification` | Open | Not applicable (pre-sale) |
| `Needs Analysis` | Open | Not applicable |
| `Value Proposition` | Open | Not applicable |
| `Id. Decision Makers` | Open | Not applicable |
| `Proposal/Price Quote` | Open | Not applicable |
| `Negotiation/Review` | Open | Not applicable |
| **`Closed Won`** | Closed Won | ✅ **Use this for all payment-confirmed deals** |
| `Closed Lost` | Closed Lost | For failed payments (optional future use) |
| `Closed Lost to Competition` | Closed Lost | Not applicable |

**For Waldo's model:** All Deals should be created directly at `"Closed Won"` because they are only created *after* Transbank confirms payment success. There is no pre-payment pipeline to manage.

### Associating a Deal to a Contact

The `Contact_Name` field is a **Lookup** type. Pass it as a JSON object containing the Contact's Zoho ID:

```json
{
  "data": [
    {
      "Deal_Name": "Pack Purchase — johndoe — 2026-03-07",
      "Stage": "Closed Won",
      "Amount": 15000,
      "Contact_Name": {
        "id": "4150868000000376008"
      },
      "Type": "New Business",
      "Closing_Date": "2026-03-07",
      "Description": "Strapi Order #1234 — Pack: 5 ads"
    }
  ]
}
```

**Source:** Zoho CRM v5 Insert Records API, "Lookup" field type definition: *"Accepts unique ID of the record"*. HIGH confidence.

**Important nuances:**
- `Contact_Name` is a **standard field** in Zoho CRM Deals — it does NOT need a `__c` suffix.
- The value is the Contact's numeric Zoho record ID (the `id` field returned by `createContact()` or `findContact()`), not the Contact's name string.
- `Contact_Name` accepts `{ "id": "..." }` only — no `"name"` key is required at write time.

### Response Pattern

```json
{
  "data": [
    {
      "code": "SUCCESS",
      "details": {
        "id": "4150868000003194003",
        "Modified_Time": "2026-03-07T10:00:00+00:00",
        "Created_Time": "2026-03-07T10:00:00+00:00"
      },
      "message": "record added",
      "status": "success"
    }
  ]
}
```

The Deal's Zoho ID is at `response.data[0].details.id`. The `createDeal()` method should return this ID as a `string`.

---

## Custom Fields on Contact

### How Zoho Names Custom Fields

Zoho CRM appends `__c` to all **custom field API names** automatically when created via the UI or API.

| Display Label | API Name (auto-generated) |
|---|---|
| Ads Published | `Ads_Published__c` |
| Total Spent | `Total_Spent__c` |
| Last Ad Posted At | `Last_Ad_Posted_At__c` |
| Packs Purchased | `Packs_Purchased__c` |

**Source:** Zoho CRM Module API docs: *"The Zoho CRM generates an API name internally while creating a custom module, custom field, or related list label."* The `__c` suffix is the universally documented convention. HIGH confidence.

**Naming rules enforced by Zoho:**
- API name must start with a letter
- Only alphanumerics and underscores allowed
- Cannot have two consecutive underscores (except the `__c` suffix itself)
- Cannot end with an underscore (the `__c` suffix satisfies this)

**Pre-creation requirement:** These custom fields must be created in the **Contacts** module in the Zoho CRM UI (Setup → Modules → Contacts → Fields → Add Field) **before** the sync code runs. The API cannot write to fields that do not exist.

### Required Custom Fields to Create in Zoho CRM UI

| Display Label | API Name | Type | Notes |
|---|---|---|---|
| Ads Published | `Ads_Published__c` | Number (Integer) | Count of all published ads by the user |
| Total Spent | `Total_Spent__c` | Currency | Sum of all payments by the user in CLP |
| Last Ad Posted At | `Last_Ad_Posted_At__c` | Date/Time | ISO8601: `yyyy-MM-ddTHH:mm:ss+HH:mm` |
| Packs Purchased | `Packs_Purchased__c` | Number (Integer) | Count of pack purchases |

### How to SET Custom Fields via API

Custom fields are set and updated exactly like standard fields — include them in the `data` array with their API name:

**On Contact update (`PUT /crm/v5/Contacts/{id}`):**

```json
{
  "data": [
    {
      "id": "4150868000000376008",
      "Ads_Published__c": 6,
      "Total_Spent__c": 60000,
      "Last_Ad_Posted_At__c": "2026-03-07T10:30:00+00:00"
    }
  ]
}
```

**On Contact creation (`POST /crm/v5/Contacts`) — initialise to zero:**

```json
{
  "data": [
    {
      "First_Name": "Juan",
      "Last_Name": "Pérez",
      "Email": "juan@example.com",
      "Lead_Source": "Web Site",
      "Ads_Published__c": 0,
      "Total_Spent__c": 0,
      "Packs_Purchased__c": 0
    }
  ]
}
```

### Date/Time Format for Custom DateTime Fields

```
"2026-03-07T10:30:00+00:00"
```

ISO8601 format. Use `new Date().toISOString().replace('Z', '+00:00')` to produce the correct format. The CRM stores it in the org's configured timezone.

### Incrementing Counters — No Atomic Increment in Zoho API

Zoho CRM has no atomic increment operation. The `updateContactStats` flow must use read-modify-write:

1. `findContact(email)` — read current values of `Ads_Published__c`, `Total_Spent__c`, etc. from the response
2. Compute new values in Strapi
3. `updateContact(id, { Ads_Published__c: currentValue + 1, ... })` — write back

**Race condition:** If two events fire simultaneously (e.g., two concurrent ad publications), the counter increment may be lost. At Waldo's expected traffic volume, this is an acceptable known limitation. Document it; address in a future reliability milestone.

---

## Event-to-Action Mapping

### Event 1: `user_created` → Contact

**Trigger:** Strapi lifecycle hook `afterCreate` on `plugin::users-permissions.user`  
**API calls:** 1–2  
**Sequence:**

```
1. findContact(email)           → check for existing Contact (deduplication guard)
2a. if no Contact found:
     POST /crm/v5/Contacts      → create Contact with stats initialised to 0
2b. if Contact found:
     PUT /crm/v5/Contacts/{id}  → update fields if needed (name, phone)
```

**Payload for step 2a:**

```typescript
{
  First_Name: user.firstName || "",
  Last_Name: user.lastName || "Unknown",  // Last_Name is mandatory
  Email: user.email,
  Phone: user.phone ?? undefined,
  Lead_Source: "Web Site",
  Ads_Published__c: 0,
  Total_Spent__c: 0,
  Packs_Purchased__c: 0,
  // Last_Ad_Posted_At__c omitted — null by default in Zoho
}
```

**Complexity:** LOW — 1–2 API calls, no dependencies on other services.  
**Failure mode:** If the Zoho call fails, log the error. Do NOT block user registration — Zoho sync is a side effect.

---

### Event 2: `pack_purchased` → Deal + updateContactStats

**Trigger:** Strapi payment confirmation handler (after Transbank confirms pack payment success)  
**API calls:** 3 sequential

```
1. findContact(email)               → get Zoho Contact ID + current stats
2. POST /crm/v5/Deals               → create Deal linked to Contact
3. PUT /crm/v5/Contacts/{contactId} → increment Total_Spent__c and Packs_Purchased__c
```

**Deal payload (step 2):**

```typescript
{
  Deal_Name: `Pack Purchase — ${username} — ${isoDate}`,  // ≤255 chars
  Stage: "Closed Won",
  Amount: order.totalAmount,          // number, CLP
  Contact_Name: { id: zohoContactId },
  Type: packsCount === 0 ? "New Business" : "Existing Business",
  Closing_Date: new Date().toISOString().split("T")[0],  // "yyyy-MM-dd"
  Description: `Strapi Order #${order.id} — Pack: ${packName}`,
  Lead_Source: "Web Site",
}
```

**Contact update payload (step 3):**

```typescript
{
  id: zohoContactId,
  Total_Spent__c: currentTotalSpent + order.totalAmount,
  Packs_Purchased__c: currentPacksPurchased + 1,
}
```

**Complexity:** MEDIUM — 3 sequential API calls, read-modify-write for stats, requires Contact ID lookup first.  
**Failure handling:** Deal creation is the primary value. If step 3 (contact stats update) fails, log the error but do not roll back the Deal. Contact stats inconsistency is recoverable; a missing Deal record is not.

---

### Event 3: `ad_paid` → Deal + updateContactStats

**Trigger:** Strapi payment confirmation handler (after Transbank confirms ad payment success)  
**API calls:** 3 sequential (same pattern as `pack_purchased`)

```
1. findContact(email)               → get Zoho Contact ID + current Total_Spent__c
2. POST /crm/v5/Deals               → create Deal for ad payment
3. PUT /crm/v5/Contacts/{contactId} → increment Total_Spent__c only
```

**Deal payload (step 2):**

```typescript
{
  Deal_Name: `Ad Payment — ${adTitle.slice(0, 40)} — ${isoDate}`,  // truncate adTitle
  Stage: "Closed Won",
  Amount: order.totalAmount,
  Contact_Name: { id: zohoContactId },
  Type: "Existing Business",   // paying for an ad implies existing account
  Closing_Date: new Date().toISOString().split("T")[0],
  Description: `Strapi Order #${order.id} — Ad ID: ${adId} — "${adTitle}"`,
  Lead_Source: "Web Site",
}
```

**Contact update payload (step 3):** Only `Total_Spent__c` is incremented (no pack counter change).

**Complexity:** MEDIUM — identical pattern to `pack_purchased`.

---

### Event 4: `ad_published` → updateContactStats (no Deal)

**Trigger:** Strapi lifecycle hook `afterUpdate` on Ad, when `status` transitions to `"active"` or `"published"`  
**API calls:** 2 sequential

```
1. findContact(email)               → get Zoho Contact ID + current Ads_Published__c
2. PUT /crm/v5/Contacts/{contactId} → increment Ads_Published__c + set Last_Ad_Posted_At__c
```

**Contact update payload (step 2):**

```typescript
{
  id: zohoContactId,
  Ads_Published__c: currentAdsPublished + 1,
  Last_Ad_Posted_At__c: new Date().toISOString().replace("Z", "+00:00"),
}
```

**Complexity:** LOW — 2 API calls. No Deal involved.  
**Edge case:** If `findContact` returns null (user not yet synced to Zoho), log a warning and skip silently. Do NOT create a Contact here — Contact creation belongs exclusively in `user_created`.  
**Idempotency risk:** If the lifecycle hook fires twice for the same status transition (e.g., due to a re-publish after an admin action), the counter will be incremented twice. Guard with a status diff check in the hook: only trigger if `previousData.status !== "published"` and `currentData.status === "published"`.

---

### Event 5: `contact_form_submitted` → Lead (+ Contact linkage check)

**Trigger:** Contact form submission handler in Strapi  
**API calls:** 1–2

```
1. findContact(email)             → check if submitter is a known registered user
2a. If Contact found:
     skip Lead creation; optionally create a Note/Task against the Contact
2b. If no Contact found:
     POST /crm/v5/Leads           → create Lead
```

**Lead payload (step 2b):**

```typescript
{
  First_Name: form.firstName || "",
  Last_Name: form.lastName,       // mandatory
  Email: form.email,
  Phone: form.phone ?? undefined,
  Company: form.company || "Waldo API",
  Description: form.message,
  Lead_Source: "Web Form",
  Lead_Status: "New",             // ← CURRENTLY MISSING — must add in v1.19
}
```

**Complexity:** LOW-MEDIUM — the Contact-check-first logic adds one API call but prevents duplicate person records in CRM.

---

## Table Stakes vs Differentiators

### Table Stakes (Essential — missing any = incomplete integration)

| Feature | Why Essential | Complexity |
|---|---|---|
| `createContact()` on user registration | Every registered user must exist in CRM from day one | LOW |
| Deduplication guard (`findContact` before `createContact`) | Without it, re-registration or race conditions create duplicate Contacts | LOW |
| `createDeal()` on payment confirmation | Core CRM value — revenue visibility per Contact | MEDIUM |
| `Contact_Name` lookup in Deal | Without it, Deals are orphaned with no Contact linkage in Zoho UI | LOW |
| `Amount` field in Deal | Without it, revenue reporting in Zoho is impossible | LOW |
| `Stage: "Closed Won"` on Deal creation | Required field — `POST /crm/v5/Deals` returns `MANDATORY_NOT_FOUND` without it | LOW |
| `Ads_Published__c` counter on Contact | Core user activity metric | LOW |
| `Total_Spent__c` counter on Contact | Core revenue metric per user | LOW |
| Fix `Lead_Status` missing from `createLead()` | Current bug — leads created without status break CRM workflows | LOW |
| Fix `Authorization: Bearer` → `Zoho-oauthtoken` in `ZohoHttpClient` | Current bug — all API calls use wrong auth header; may work on some requests by accident | HIGH |
| Fix token-expiry handling in `ZohoHttpClient` | Current bug — token only refreshes on startup; all calls fail silently after 1 hour | HIGH |

### Differentiators (Valuable but deferrable)

| Feature | Value | Complexity | Recommendation |
|---|---|---|---|
| `Type: "New Business"` vs `"Existing Business"` on Deal | Better CRM segmentation, identifies repeat buyers | LOW | Include in v1.19 (trivial) |
| `Packs_Purchased__c` counter on Contact | Identifies power users; enables targeted offers | LOW | Include in v1.19 |
| `Last_Ad_Posted_At__c` field | Recency segmentation in CRM | LOW | Include in v1.19 |
| `Description` field in Deal with Strapi Order ID | Cross-reference Zoho Deal → Strapi Order | LOW | Include in v1.19 |
| `Closing_Date` on Deal | Required by some pipeline views; best practice | LOW | Include in v1.19 |
| Contact-first check before Lead creation | Prevents duplicate person records | LOW | Include in v1.19 |

### Anti-Features (Explicitly Do NOT Build in v1.19)

| Anti-Feature | Why Avoid | What to Do Instead |
|---|---|---|
| Inbound Zoho webhooks (Zoho → Strapi) | Bidirectional sync requires a public endpoint, authentication, and conflict resolution — out of scope | One-way push from Strapi only |
| Storing Zoho Contact/Deal IDs in Strapi DB | Requires schema changes on `User` model — out of scope for this milestone | Pass Zoho IDs only in-memory during event handler |
| Retry queue for failed Zoho calls | Valid for production hardening, but adds significant complexity (job queue, idempotency keys) | Log failures to Strapi error log; address in a dedicated reliability milestone |
| Bulk backfill of existing users | Potentially thousands of API calls; rate-limit risk; risky on live data | One-time migration script in a separate milestone |
| `Account_Name` association on Deals | Zoho Accounts are for B2B (company records); Waldo is B2C — no Account model needed | Omit entirely |

---

## Critical Existing Bugs to Fix in v1.19

### Bug 1: Wrong Authorization Header Format

**File:** `apps/strapi/src/services/zoho/http-client.ts`, line 28  
**Current code:** `config.headers.Authorization = \`Bearer ${this.accessToken}\``  
**Correct code:** `config.headers.Authorization = \`Zoho-oauthtoken ${this.accessToken}\``  
**Source:** All Zoho CRM v5 API documentation uses `Zoho-oauthtoken` as the auth header prefix. HIGH confidence.  
**Impact:** All API calls may fail with 401 in production depending on how Zoho validates the scheme prefix.

### Bug 2: Token Not Refreshed on Expiry

**File:** `apps/strapi/src/services/zoho/http-client.ts`  
**Problem:** `this.accessToken` is only null on startup. Zoho OAuth tokens expire in 1 hour. After expiry, all calls fail with 401, but the client will NOT attempt a refresh because `this.accessToken !== null`.  
**Fix:** Add a response interceptor that detects 401 status, clears `this.accessToken`, refreshes, and retries the original request with `_retry` flag to prevent infinite loops:

```typescript
this.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      this.accessToken = null;
      await this.refreshAccessToken();
      error.config.headers.Authorization = `Zoho-oauthtoken ${this.accessToken}`;
      return this.client(error.config);
    }
    throw error;
  }
);
```

### Bug 3: `createLead()` Missing `Lead_Status` Field

**File:** `apps/strapi/src/services/zoho/zoho.service.ts`  
**Fix:** Add `Lead_Status: lead.status || "New"` to the lead creation payload.

### Bug 4: Test File Hits Live Production Zoho API

**File:** `apps/strapi/src/services/zoho/zoho.test.ts`  
**Problem:** Tests use the live `zohoService` singleton, creating real records in the production Zoho CRM org.  
**Fix:** Mock `ZohoHttpClient` in all tests. The factory pattern already supports this — `new ZohoService(mockHttpClient)`.

---

## Interface Additions Required

The current `interfaces.ts` requires the following additions for v1.19:

```typescript
// New: Deal creation DTO
export interface ZohoDeal {
  Deal_Name: string;
  Stage: "Closed Won" | "Closed Lost" | "Qualification" | string;
  Amount?: number;
  Contact_Name?: { id: string };
  Type?: "New Business" | "Existing Business";
  Closing_Date?: string;      // "yyyy-MM-dd"
  Description?: string;
  Lead_Source?: string;
  Pipeline?: string;
}

// New: Contact stats update DTO
export interface ZohoContactStats {
  Ads_Published__c?: number;
  Total_Spent__c?: number;
  Last_Ad_Posted_At__c?: string;   // ISO8601 datetime
  Packs_Purchased__c?: number;
}
```

`IZohoService` requires two new method signatures:
- `createDeal(deal: ZohoDeal): Promise<string>` — returns the created Deal's Zoho record ID
- `updateContactStats(contactId: string, stats: ZohoContactStats): Promise<void>`

---

## Sources

| Source | Confidence | URL |
|---|---|---|
| Zoho CRM v5 Insert Records API | HIGH | https://www.zoho.com/crm/developer/docs/api/v5/insert-records.html |
| Zoho CRM v5 Update Records API | HIGH | https://www.zoho.com/crm/developer/docs/api/v5/update-records.html |
| Zoho CRM v5 Upsert Records API | HIGH | https://www.zoho.com/crm/developer/docs/api/v5/upsert-records.html |
| Zoho CRM v5 Get Pipelines API (incl. standard stages) | HIGH | https://www.zoho.com/crm/developer/docs/api/v5/get-pipelines.html |
| Zoho CRM v5 Fields Metadata API | HIGH | https://www.zoho.com/crm/developer/docs/api/v5/field-meta.html |
| Zoho CRM v5 Module Metadata API | HIGH | https://www.zoho.com/crm/developer/docs/api/v5/module-meta.html |
| Zoho CRM v5 Get Related Records API | HIGH | https://www.zoho.com/crm/developer/docs/api/v5/get-related-records.html |
| Existing Zoho service implementation | — | `apps/strapi/src/services/zoho/` |

---
*Research for: v1.19 Zoho CRM Integration milestone*  
*Researched: 2026-03-07*  
*Confidence: HIGH — all Zoho API mechanics verified against official v5 docs*

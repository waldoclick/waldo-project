# Phase 103: Monthly Charging Cron - Research

**Researched:** 2026-03-20
**Domain:** Strapi cron jobs, Transbank Oneclick Mall MallTransaction.authorize(), subscription payment records, idempotency, retry logic
**Confidence:** HIGH (all findings from direct codebase and SDK source inspection)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHRG-01 | Daily cron job charges users with `pro_status: active` whose `pro_expires_at` has passed | Existing cron pattern in `ad-expiry.cron.ts`; `cron-tasks.ts` registers at 5 AM slot; `MallTransaction.authorize()` SDK call verified |
| CHRG-02 | Each successful charge creates a `subscription-payment` record and extends `pro_expires_at` by 30 days | `subscription-payment` content type must be created; user update pattern from `proResponse` in `payment.ts` |
| CHRG-03 | Failed charges are retried on day 1 and day 3 before deactivating the subscription on day 4 | `charge_attempts` + `next_charge_attempt` fields on `subscription-payment` enable daily cron to detect retry state |
| CHRG-04 | Charge amount is read from `PRO_MONTHLY_PRICE` env var (not hardcoded) | `PRO_MONTHLY_PRICE` does not yet exist in `.env.example`; must be added; `parseInt(process.env.PRO_MONTHLY_PRICE)` pattern |
| CHRG-05 | Idempotency guard prevents double-charging for the same billing period | Same pattern as `ad-expiry.cron.ts` — check for existing `subscription-payment` record with `period_start` = today's billing period before calling `authorize()` |
</phase_requirements>

---

## Summary

Phase 103 adds the automated billing loop that charges active PRO subscribers each month. The mechanism is a Strapi cron job (`subscription-charge.cron.ts`) that runs daily at 5 AM, after the four existing crons (1–4 AM). It queries all users where `pro_status = 'active'` AND `pro_expires_at <= now`, then calls `Oneclick.MallTransaction.authorize()` against each user's stored `tbk_user` token.

The project already has every dependency in place: `transbank-sdk@5.0.0` is installed, `OneclickService` exists in `apps/strapi/src/services/oneclick/`, and `buildOneclickUsername()` is exported for reuse. The only new Strapi artifact needed is a `subscription-payment` content type (not to be confused with the existing generic `suscription` content type, which maps Flow subscriptions and is not used here).

The retry strategy is implemented within the cron itself: if a `subscription-payment` record exists for a user's current period with `status: 'failed'`, the cron checks `charge_attempts` and `next_charge_attempt` to decide whether to retry or deactivate.

**Primary recommendation:** Model all new code directly on the existing `ad-expiry.cron.ts` and `cron-tasks.ts` patterns. Follow `OneclickService` conventions. The `subscription-payment` content type is the single piece of new Strapi infrastructure needed.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `transbank-sdk` | 5.0.0 (installed) | `Oneclick.MallTransaction.authorize()` call | Already in project; SDK source verified |
| Strapi entityService | v5 (installed) | Create/query `subscription-payment` records, update user | Project standard for all DB operations |
| `node-cron` (via Strapi) | Strapi built-in | Cron scheduling | All existing crons use Strapi's built-in cron |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `logtail` logger | (project util) | Structured logging inside cron | All existing crons use `../utils/logtail` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Strapi built-in cron | Separate worker process | Strapi cron is simpler and consistent with existing jobs; no justification to diverge |
| `subscription-payment` content type | Reuse generic `suscription` content type | `suscription` has Flow-specific fields and is not the right shape; a dedicated content type is cleaner |

**Installation:** No new packages needed. All dependencies already installed.

---

## Architecture Patterns

### Recommended Project Structure

```
apps/strapi/
├── src/
│   ├── cron/
│   │   └── subscription-charge.cron.ts    # NEW — charging service class
│   ├── services/
│   │   └── oneclick/
│   │       ├── services/
│   │       │   └── oneclick.service.ts    # EXTEND — add authorizeCharge() method
│   │       └── types/
│   │           └── oneclick.types.ts      # EXTEND — add IOneclickAuthorizeResponse
│   └── api/
│       └── subscription-payment/          # NEW content type
│           └── content-types/
│               └── subscription-payment/
│                   └── schema.json
└── config/
    └── cron-tasks.ts                      # EXTEND — register subscriptionChargeCron
```

And in `src/api/cron-runner/controllers/cron-runner.ts`:
- Add `"subscription-charge": "subscriptionChargeCron"` to `CRON_NAME_MAP`.

### Pattern 1: Cron Service Class

**What:** A TypeScript class that encapsulates all cron logic, instantiated inside the cron task wrapper.
**When to use:** All Strapi crons in this project. Never inline logic directly in the `task` function.

```typescript
// Source: apps/strapi/src/cron/ad-expiry.cron.ts (existing pattern)
export class SubscriptionChargeService {
  async chargeExpiredSubscriptions(): Promise<ICronjobResult> {
    try {
      // 1. Query users due for charge
      // 2. For each: idempotency check, then authorize or retry
      // 3. Return summary
      return { success: true, results: "..." };
    } catch (error) {
      logger.error("SubscriptionChargeService failed", { error });
      return { success: false, error: "Failed to charge subscriptions" };
    }
  }
}
```

### Pattern 2: Idempotency Guard via subscription-payment Record

**What:** Before calling `authorize()`, query for an existing `subscription-payment` record where `period_start` equals the current billing period start date (derived from `pro_expires_at - 30 days`). If an `approved` record exists, skip the user. This is the same technique used by `ad-expiry.cron.ts` with the `remainings` collection.

**When to use:** Every charge attempt in the cron, always.

```typescript
// Source: apps/strapi/src/cron/ad-expiry.cron.ts (idempotency pattern)
const existingApproved = await strapi.entityService.findMany(
  "api::subscription-payment.subscription-payment",
  {
    filters: {
      user: { id: { $eq: user.id } },
      period_start: { $eq: periodStart },
      status: { $eq: "approved" },
    },
    pagination: { pageSize: 1 },
  }
);
if (existingApproved.length > 0) {
  // Already charged for this period — skip
  continue;
}
```

### Pattern 3: Retry State via charge_attempts

**What:** The `subscription-payment` content type includes `charge_attempts` (integer) and `next_charge_attempt` (date). On first failure, create a record with `status: 'failed'`, `charge_attempts: 1`, `next_charge_attempt: tomorrow`. On subsequent daily runs, find failed records whose `next_charge_attempt <= today` and retry.

**Retry schedule:**
- Attempt 1: day of expiry (`pro_expires_at` date)
- Attempt 2: day 1 after expiry
- Attempt 3: day 3 after expiry
- Day 4: if still failed, set `pro_status: 'inactive'` on user, clear `tbk_user`, clear `pro_expires_at`

```typescript
// On retry detection
const pendingRetries = await strapi.entityService.findMany(
  "api::subscription-payment.subscription-payment",
  {
    filters: {
      status: { $eq: "failed" },
      charge_attempts: { $lt: 3 },
      next_charge_attempt: { $lte: today },
    },
    populate: ["user"],
    pagination: { pageSize: -1 },
  }
);
```

### Pattern 4: MallTransaction.authorize() Call

**What:** Calls `Oneclick.MallTransaction.authorize()` using the user's stored `tbk_user` and the username derived from `buildOneclickUsername(user.documentId)`.

**Key constraints from SDK source (verified):**
- `username`: max 40 chars — `user-{documentId}` is 5 + 24 = 29 chars, safe
- `parentBuyOrder`: max 26 chars — use `pro-{userId}-{YYYYMMDD}` (safe if userId < 12 digits)
- `childBuyOrder`: max 26 chars — use `c-{userId}-{YYYYMMDD}-{attempt}` pattern
- `commerceCode` for child: `ONECLICK_CHILD_COMMERCE_CODE` env var (12 chars)
- Amount: integer CLP, read from `PRO_MONTHLY_PRICE` env var
- `response_code: 0` in the detail = approved; any other value = rejected

```typescript
// Source: transbank-sdk mall_transaction.d.ts + ad-expiry.cron.ts pattern
import { Oneclick, Options, Environment, TransactionDetail } from "transbank-sdk";

const transaction = new Oneclick.MallTransaction(
  new Options(
    process.env.ONECLICK_COMMERCE_CODE,
    process.env.ONECLICK_API_KEY,
    process.env.ONECLICK_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Integration
  )
);

const amount = parseInt(process.env.PRO_MONTHLY_PRICE || "0", 10);
const today = new Date().toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
const parentBuyOrder = `pro-${user.id}-${today}`;
const childBuyOrder = `c-${user.id}-${today}-${attempt}`;

const detail = new TransactionDetail(
  amount,
  process.env.ONECLICK_CHILD_COMMERCE_CODE!,
  childBuyOrder
);

const result = await transaction.authorize(
  buildOneclickUsername(user.documentId),
  user.tbk_user,
  parentBuyOrder,
  [detail]
);

// Check approval: result.details[0].response_code === 0
const approved = result?.details?.[0]?.response_code === 0;
```

### Pattern 5: Cron Registration in cron-tasks.ts

**What:** Follows the exact same structure as existing crons. Named `subscriptionChargeCron`. Runs at `0 5 * * *` (5 AM America/Santiago).

```typescript
// Source: apps/strapi/config/cron-tasks.ts (existing pattern)
subscriptionChargeCron: {
  task: async ({ strapi }) => {
    strapi.log.info("=== INICIANDO CRON SUBSCRIPTION CHARGE ===");
    const service = new SubscriptionChargeService();
    await service.chargeExpiredSubscriptions();
    strapi.log.info("=== CRON SUBSCRIPTION CHARGE FINALIZADO ===");
  },
  options: {
    rule: "0 5 * * *", // Every day at 5:00 AM (America/Santiago)
    tz: "America/Santiago",
  },
},
```

### Anti-Patterns to Avoid

- **Using the generic `suscription` content type:** It was designed for Flow and has Flow-specific fields. Create a new `subscription-payment` content type instead.
- **Hardcoding the charge amount:** Always use `parseInt(process.env.PRO_MONTHLY_PRICE, 10)`. Never put `9990` or any number in code.
- **Reusing `parentBuyOrder` or `childBuyOrder` across attempts:** Each Transbank authorize call requires a globally unique `buy_order`. Generate a new one per attempt (include attempt number in the string).
- **Using numeric `user.id` as Strapi identifier for writes:** Use `documentId` per project rules, but `id` is acceptable for filtering queries (as done in `ad-expiry.cron.ts`).
- **Inlining transaction.authorize() in the cron task function:** Encapsulate in the service class, following the existing pattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron scheduling | Custom timer/interval | Strapi built-in cron (`cron-tasks.ts`) | Project standard; handles timezone, persistence |
| Transaction signing / HTTP to Transbank | Raw fetch calls | `Oneclick.MallTransaction.authorize()` from `transbank-sdk` | SDK handles auth headers, retries, endpoint routing |
| Username derivation | Custom logic | `buildOneclickUsername(documentId)` (already exported) | Consistent across phases; max-length validated |
| Idempotency | Custom flags on user record | `subscription-payment` record with `period_start` field | Audit trail, queryable, consistent with `remainings` pattern |

**Key insight:** The cron infrastructure, service class pattern, and Oneclick SDK wrappers are all already established. Phase 103 is primarily about wiring them together with the right content type and retry logic.

---

## Common Pitfalls

### Pitfall 1: MallTransaction Uses a Different Commerce Code Than MallInscription

**What goes wrong:** `OneclickService` config (`oneclick.config.ts`) instantiates `MallInscription` with `ONECLICK_COMMERCE_CODE` (the parent code). `MallTransaction.authorize()` requires a `TransactionDetail` that contains `ONECLICK_CHILD_COMMERCE_CODE` (a different env var). If you pass the parent code as the child `commerceCode`, Transbank rejects the authorization.

**Why it happens:** The config was set up for inscription only. Authorization requires the child commerce code in the `TransactionDetail` object.

**How to avoid:** Add `ONECLICK_CHILD_COMMERCE_CODE` to `.env.example`. Read it from `process.env.ONECLICK_CHILD_COMMERCE_CODE` in the cron service. Sandbox value: `597055555542`.

**Warning signs:** Transbank returns a non-zero `response_code` on the first ever test run; or SDK validation throws on commerce code format.

### Pitfall 2: buy_order Length Exceeds 26 Characters

**What goes wrong:** SDK throws a validation error before even calling Transbank if `parentBuyOrder` or `childBuyOrder` exceeds 26 characters.

**Why it happens:** `user.id` is a numeric integer but Strapi v5 document IDs are 24-char strings. Including full `documentId` in a buy_order would exceed 26 chars.

**How to avoid:** Use numeric `user.id` (not `documentId`) for buy_orders. Pattern: `pro-{userId}-{YYYYMMDD}` = `pro-` (4) + up to 9 digits + `-` + 8 = 22 max, safe. Child: `c-{userId}-{YYYYMMDD}-{n}` = `c-` (2) + 9 + `-` + 8 + `-1` = 21, safe.

**Warning signs:** SDK throws `TransbankError: buy_order field is too long` before any HTTP call is made.

### Pitfall 3: Double-Charging If pro_expires_at Is Not Extended Before Next Cron Run

**What goes wrong:** If `pro_expires_at` is not updated to `+30 days` immediately after a successful charge, the next day's cron run will find the same user still "due" and charge them again.

**Why it happens:** The idempotency guard checks for an approved `subscription-payment` record with the current `period_start`. If the record was created but the user update failed, the guard will catch it on the next run. But if neither record was created nor user updated, double-charge occurs.

**How to avoid:** In the success path, always: (1) create the `subscription-payment` record first, (2) then update `pro_expires_at`. The idempotency guard checks for the record, not the date, so even a partial success is recoverable.

**Warning signs:** Users appear twice in a single day's cron run results.

### Pitfall 4: PRO_MONTHLY_PRICE Env Var Not Yet Defined

**What goes wrong:** `parseInt(process.env.PRO_MONTHLY_PRICE, 10)` returns `NaN` if the var is missing, and Transbank receives `NaN` as the amount — likely a validation error or a zero-amount charge.

**Why it happens:** `PRO_MONTHLY_PRICE` is not yet in `.env.example`. The var does not exist in any file in the codebase as of Phase 103.

**How to avoid:** Add to `.env.example` with a guard: `const amount = parseInt(process.env.PRO_MONTHLY_PRICE || "0", 10); if (!amount) throw new Error("PRO_MONTHLY_PRICE is not configured");`.

**Warning signs:** `amount` is `NaN` or `0` in logs.

### Pitfall 5: Deactivation Must Clear tbk_user

**What goes wrong:** After 3 failed charge attempts, `pro_status` is set to `inactive` but `tbk_user` is left set. Phase 104 (cancellation) calls `inscription.delete(tbkUser, username)` — if a user later re-subscribes, a stale `tbk_user` could be passed to a delete call or cause confusion.

**Why it happens:** The deactivation path only updates `pro_status`.

**How to avoid:** On day-4 deactivation, set `pro_status: 'inactive'`, `pro: false`, `pro_expires_at: null`, and clear `tbk_user` (set to `null`). This is consistent with what a cancellation will also do in Phase 104.

**Warning signs:** Deactivated users have non-null `tbk_user` in the database.

---

## Code Examples

### subscription-payment Schema (New Content Type)

```json
// Source: existing schema.json pattern from apps/strapi/src/api/remaining/content-types/remaining/schema.json
{
  "kind": "collectionType",
  "collectionName": "subscription_payments",
  "info": {
    "singularName": "subscription-payment",
    "pluralName": "subscription-payments",
    "displayName": "Subscription Payment"
  },
  "options": { "draftAndPublish": false, "timestamps": true },
  "attributes": {
    "user": {
      "type": "relation", "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "amount": { "type": "integer", "required": true },
    "status": {
      "type": "enumeration",
      "enum": ["approved", "failed", "deactivated"],
      "default": "failed",
      "required": true
    },
    "parent_buy_order": { "type": "string" },
    "child_buy_order": { "type": "string" },
    "authorization_code": { "type": "string" },
    "response_code": { "type": "integer" },
    "payment_response": { "type": "json" },
    "period_start": { "type": "date", "required": true },
    "charged_at": { "type": "datetime" },
    "charge_attempts": { "type": "integer", "default": 1 },
    "next_charge_attempt": { "type": "date" }
  }
}
```

### OneclickService Extension (authorizeCharge)

```typescript
// Source: apps/strapi/src/services/oneclick/services/oneclick.service.ts (extension)
import { Oneclick, Options, Environment, TransactionDetail } from "transbank-sdk";
import { buildOneclickUsername } from "../types/oneclick.types";

async authorizeCharge(
  userDocumentId: string,
  userId: number,
  tbkUser: string,
  amount: number,
  parentBuyOrder: string,
  childBuyOrder: string
): Promise<IOneclickAuthorizeResponse> {
  try {
    const transaction = new Oneclick.MallTransaction(
      new Options(
        process.env.ONECLICK_COMMERCE_CODE,
        process.env.ONECLICK_API_KEY,
        process.env.ONECLICK_ENVIRONMENT === "production"
          ? Environment.Production
          : Environment.Integration
      )
    );
    const detail = new TransactionDetail(
      amount,
      process.env.ONECLICK_CHILD_COMMERCE_CODE!,
      childBuyOrder
    );
    const response = await transaction.authorize(
      buildOneclickUsername(userDocumentId),
      tbkUser,
      parentBuyOrder,
      [detail]
    );
    const approved = response?.details?.[0]?.response_code === 0;
    return {
      success: approved,
      authorizationCode: response?.details?.[0]?.authorization_code,
      responseCode: response?.details?.[0]?.response_code,
      rawResponse: response,
    };
  } catch (error) {
    logger.error("OneclickService.authorizeCharge failed", { error });
    return { success: false, error };
  }
}
```

### Cron Main Loop Skeleton

```typescript
// Source: apps/strapi/src/cron/ad-expiry.cron.ts (pattern)
async chargeExpiredSubscriptions(): Promise<ICronjobResult> {
  const today = new Date().toISOString().split("T")[0];

  // 1. Users whose subscription period expired and have not been charged yet today
  const dueUsers = await strapi.entityService.findMany(
    "plugin::users-permissions.user",
    {
      filters: {
        pro_status: { $eq: "active" },
        pro_expires_at: { $lte: `${today}T23:59:59.999Z` },
      },
      fields: ["id", "documentId", "tbk_user", "pro_expires_at"],
      pagination: { pageSize: -1 },
    }
  ) as ProUser[];

  for (const user of dueUsers) {
    const periodStart = deriveCurrentPeriodStart(user.pro_expires_at);

    // Idempotency: skip if already approved this period
    const existing = await findApprovedPayment(user.id, periodStart);
    if (existing) continue;

    await chargeUser(user, periodStart, today, 1);
  }

  // 2. Failed users eligible for retry
  const retries = await strapi.entityService.findMany(
    "api::subscription-payment.subscription-payment",
    {
      filters: {
        status: { $eq: "failed" },
        charge_attempts: { $lt: 3 },
        next_charge_attempt: { $lte: today },
      },
      populate: ["user"],
      pagination: { pageSize: -1 },
    }
  ) as SubscriptionPaymentWithUser[];

  for (const record of retries) {
    const attempt = (record.charge_attempts ?? 1) + 1;
    await chargeUser(record.user, record.period_start, today, attempt, record.id);
  }

  // 3. Deactivate users with 3+ failed attempts past day 3
  await deactivateExhaustedUsers(today);
}
```

### User Update on Successful Charge

```typescript
// Source: apps/strapi/src/api/payment/controllers/payment.ts (proResponse pattern)
const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
await strapi.entityService.update(
  "plugin::users-permissions.user",
  user.id,
  {
    data: {
      pro_expires_at: newExpiresAt,
    } as unknown as Parameters<typeof strapi.entityService.update>[2]["data"],
  }
);
```

---

## New Environment Variables Required

The following env vars must be added to `.env.example` (and documented for deployment):

| Variable | Purpose | Integration Value |
|----------|---------|------------------|
| `ONECLICK_CHILD_COMMERCE_CODE` | Child commerce code for `TransactionDetail` in `authorize()` | `597055555542` |
| `PRO_MONTHLY_PRICE` | Charge amount in CLP (integer) | `9990` (example) |

`ONECLICK_COMMERCE_CODE`, `ONECLICK_API_KEY`, and `ONECLICK_ENVIRONMENT` already exist in `.env.example` from Phase 102.

---

## Existing Infrastructure Confirmed Available

| Artifact | Location | Status | Phase 103 Usage |
|----------|----------|--------|-----------------|
| `OneclickService` | `apps/strapi/src/services/oneclick/services/oneclick.service.ts` | Exists | Add `authorizeCharge()` method |
| `buildOneclickUsername` | `apps/strapi/src/services/oneclick/types/oneclick.types.ts` | Exists (exported) | Import in cron service |
| `Oneclick.MallTransaction` | `transbank-sdk` v5.0.0 | Installed | Call `authorize()` |
| `TransactionDetail` | `transbank-sdk` v5.0.0 | Installed | Build charge details |
| Cron registration | `apps/strapi/config/cron-tasks.ts` | Exists | Add `subscriptionChargeCron` |
| Cron runner API | `apps/strapi/src/api/cron-runner/` | Exists | Add `subscription-charge` to name map |
| Logger | `apps/strapi/src/utils/logtail.ts` | Exists | Import in cron |
| User `pro_status`, `pro_expires_at`, `tbk_user` | User schema | Exists (added in Phase 102) | Query and update |

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Flow-managed subscription billing (auto-charged by Flow) | Self-managed cron + Oneclick Mall authorize() | More code, full control, no Flow dependency |
| Generic `suscription` content type (Flow-era) | New `subscription-payment` content type | Clean separation; Flow-era type left untouched |

**Not deprecated:** The existing `suscription` content type is left as-is (not used by Phase 103).

---

## Open Questions

1. **MallTransaction instance: singleton vs per-call**
   - What we know: `OneclickService` currently creates a new `inscription` instance at module load via `oneclick.config.ts`. `MallTransaction` has the same constructor pattern.
   - What's unclear: Whether to create a singleton `transaction` instance in `oneclick.config.ts` or instantiate per call in `authorizeCharge()`.
   - Recommendation: Instantiate per call in `authorizeCharge()` for now (same as how the existing test mocks work). Avoid module-level singletons for transaction objects until the pattern is validated.

2. **Retry schedule: days 1 and 3 — absolute or relative?**
   - What we know: The requirement says "retry on day 1 and day 3 before deactivating on day 4".
   - What's unclear: Whether "day 1" means 1 day after `pro_expires_at` or 1 day after the first attempt (which runs on the expiry date itself).
   - Recommendation: Interpret as days after expiry. Set `next_charge_attempt = pro_expires_at + 1 day` after first failure, `+3 days` after second failure, deactivate if still failed on day 4.

3. **PRO_MONTHLY_PRICE value for staging/production**
   - What we know: The var does not yet exist in the codebase.
   - What's unclear: The actual production price.
   - Recommendation: Use `9990` as an example in `.env.example` with a comment. The planner should add a task to document this for deployment.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + ts-jest |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` |
| Full suite command | `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHRG-01 | Cron queries users with `pro_status: active` and expired `pro_expires_at` | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ Wave 0 |
| CHRG-02 | Successful charge creates `subscription-payment` and extends `pro_expires_at` +30 days | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ Wave 0 |
| CHRG-03 | Failed charge sets retry fields; 3rd failure triggers deactivation | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ Wave 0 |
| CHRG-04 | `PRO_MONTHLY_PRICE` env var determines charge amount; changing var changes amount | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ Wave 0 |
| CHRG-05 | Existing `approved` record for same `period_start` prevents second charge | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `cd apps/strapi && yarn test --testPathPattern=subscription-charge`
- **Per wave merge:** `cd apps/strapi && yarn test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/strapi/src/cron/subscription-charge.cron.test.ts` — covers CHRG-01 through CHRG-05
- [ ] `apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts` — extend with `authorizeCharge` tests (file exists for inscription tests; add authorization tests)

---

## Sources

### Primary (HIGH confidence)

- `transbank-sdk@5.0.0` SDK source code at `node_modules/transbank-sdk/dist/es5/transbank/webpay/oneclick/mall_transaction.d.ts` — `authorize()` signature and params
- `transbank-sdk@5.0.0` SDK source code at `node_modules/transbank-sdk/dist/es5/transbank/common/api_constants.d.ts` — field length limits
- `transbank-sdk@5.0.0` SDK source code at `node_modules/transbank-sdk/dist/es5/transbank/common/integration_commerce_codes.d.ts` — sandbox commerce codes
- `transbank-sdk@5.0.0` SDK source code at `node_modules/transbank-sdk/dist/es5/transbank/webpay/common/transaction_detail.d.ts` — TransactionDetail constructor
- `apps/strapi/src/cron/ad-expiry.cron.ts` — idempotency pattern, service class shape, ICronjobResult
- `apps/strapi/config/cron-tasks.ts` — cron registration, schedule slots, naming
- `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts` — CRON_NAME_MAP pattern
- `apps/strapi/src/services/oneclick/` — existing OneclickService, buildOneclickUsername, config pattern
- `apps/strapi/src/api/payment/controllers/payment.ts` — proResponse handler: exact user update shape with `pro_expires_at`, `pro_status`, `pro`
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — confirmed `pro_status`, `pro_expires_at`, `tbk_user` fields exist
- `apps/strapi/.env.example` — confirms `ONECLICK_COMMERCE_CODE` and `ONECLICK_API_KEY` exist; confirms `PRO_MONTHLY_PRICE` and `ONECLICK_CHILD_COMMERCE_CODE` do NOT yet exist
- `.planning/research/webpay-oneclick-research.md` — prior Oneclick research (HIGH confidence; same codebase)
- `apps/strapi/jest.config.js` — test framework config

### Secondary (MEDIUM confidence)

- `apps/strapi/src/api/suscription/content-types/suscription/schema.json` — shape reference for new content type (Flow-era, not directly reused)
- `apps/strapi/src/api/payment/utils/suscription.utils.ts` — confirms the generic subscription table is Flow-specific and unsuitable for Phase 103

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified in node_modules and existing service files
- Architecture: HIGH — all patterns verified from existing cron jobs and controllers
- Pitfalls: HIGH — derived directly from SDK source constraints and existing code patterns
- Validation: HIGH — Jest config and test file locations verified

**Research date:** 2026-03-20
**Valid until:** 2026-06-20 (stable SDK; 90-day estimate)

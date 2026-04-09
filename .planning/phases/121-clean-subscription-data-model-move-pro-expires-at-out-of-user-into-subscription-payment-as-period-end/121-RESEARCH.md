# Phase 121: Clean Subscription Data Model — Research

**Researched:** 2026-04-08
**Domain:** Strapi v5 schema migration, subscription billing data model
**Confidence:** HIGH — all findings based on direct codebase inspection

## Summary

Phase 120 moved card enrollment data out of `up_users` into `subscription_pros`. Phase 121 completes the model cleanup by removing the last billing-state field (`pro_expires_at`) from `up_users` and moving the concept of "period end" into `subscription_payments` as a new `period_end` column. After this phase, the user entity carries only `pro_status`; all period-tracking lives in `subscription_payments`.

The cron currently drives Step 1 by querying `up_users WHERE pro_status=active AND pro_expires_at <= today`. That query must be replaced with one on `subscription_payments WHERE status=approved AND period_end <= today AND user.pro_status=active`. Step 4 (cancelled-expiry sweep) currently queries `up_users WHERE pro_status=cancelled AND pro_expires_at <= today`; it must be replaced by a join-style query on `subscription_payments` for the latest approved record per cancelled user.

The test suite for the cron currently asserts `pro_expires_at` on both the user struct (`makeUser`) and in `mockUpdate` assertions. Every such assertion must be updated.

**Primary recommendation:** Add `period_end` (date, required) to `subscription-payment` schema, remove `pro_expires_at` from the user schema, rewrite Step 1 and Step 4 of the cron to query `subscription_payments`, add `period_end` to every `subscription-payment` create/update call in `proResponse` and `chargeUser`, and remove `pro_expires_at` from `protect-user-fields.ts` and all tests that reference it.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUB-MODEL-121-01 | Remove `pro_expires_at` from user schema (`schema.json` + DB migration `DROP COLUMN`) | User schema confirmed at line 171–173; DB migration pattern established in `2026.04.09T00.00.00.drop-user-pro-card-fields.ts` |
| SUB-MODEL-121-02 | Add `period_end` (date, required) to `subscription-payment` schema | `subscription-payment` schema confirmed — currently has `period_start` but no `period_end`; same pattern, same file |
| SUB-MODEL-121-03 | Refactor cron Step 1 to query `subscription_payments` by `period_end <= today` instead of querying users by `pro_expires_at` | Full cron source read; Step 1 is lines 66–128, Step 4 is lines 294–358; both must change |
| SUB-MODEL-121-04 | `proResponse` creates first `subscription-payment` row with `period_end` set; remove all `pro_expires_at` writes from `proResponse` and `chargeUser` | `proResponse` currently writes `pro_expires_at` at line 580–592 and does NOT create a subscription-payment row; `chargeUser` writes `pro_expires_at` at lines 460–476 |
</phase_requirements>

---

## Standard Stack

No new libraries required. All changes are schema edits, service rewrites, and Knex migration SQL — all within the existing stack.

| Tool | Version | Purpose |
|------|---------|---------|
| Knex | bundled with Strapi | DB migration — `alterTable`, `addColumn`, `dropColumn` |
| Strapi `entityService` | v5 (current) | `findMany`, `create`, `update` for content-type queries |
| Strapi `db.query` | v5 (current) | Raw relation-aware queries with `populate` and `where` |

---

## Architecture Patterns

### Existing Migration Pattern (HIGH confidence)

The existing migration at `apps/strapi/database/migrations/2026.04.09T00.00.00.drop-user-pro-card-fields.ts` is the canonical template:

```typescript
// Source: apps/strapi/database/migrations/2026.04.09T00.00.00.drop-user-pro-card-fields.ts
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("up_users", (table) => {
    table.dropColumn("pro_expires_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("up_users", (table) => {
    table.datetime("pro_expires_at").nullable();
  });
}
```

The new migration file must also add `period_end` to `subscription_payments`:

```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("up_users", (table) => {
    table.dropColumn("pro_expires_at");
  });
  await knex.schema.alterTable("subscription_payments", (table) => {
    table.date("period_end").notNullable().defaultTo(knex.fn.now());
  });
}
```

Note: `period_end` is `date` type (matches `period_start` which is also `date`). The schema will mark it `required: true` which means the DB column must be `NOT NULL`. Using `defaultTo(knex.fn.now())` satisfies the NOT NULL constraint for the migration on existing rows; application code always provides the value explicitly.

### Schema Edit Pattern (HIGH confidence)

Add to `apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json`:

```json
"period_end": {
  "type": "date",
  "required": true
}
```

Remove from `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json`:

```json
"pro_expires_at": {
  "type": "datetime"
}
```

### Cron Step 1 Rewrite — New Query (HIGH confidence)

Current approach: query users where `pro_expires_at <= today`.

New approach: query `subscription-payment` records where `status=approved AND period_end <= today`, then join/populate the user to get `pro_status=active` and `subscription_pro`.

```typescript
// New Step 1 query — replaces the users findMany
const duePaymentPeriods = await strapi.entityService.findMany(
  "api::subscription-payment.subscription-payment" as Parameters<
    typeof strapi.entityService.findMany
  >[0],
  {
    filters: {
      status: { $eq: "approved" },
      period_end: { $lte: today },
      user: { pro_status: { $eq: "active" } },
    } as unknown as Record<string, unknown>,
    populate: {
      user: {
        populate: ["subscription_pro"],
      },
    } as unknown as Parameters<
      typeof strapi.entityService.findMany
    >[1]["populate"],
    pagination: { pageSize: -1 },
  }
);
```

Each result gives a `subscription-payment` row with its populated `user` (including `subscription_pro`). The `period_end` of the row becomes the new `periodStart` value for the next charge cycle — or more precisely, the new `period_end` for the renewal is `first day of the month after period_end`.

### Idempotency — Redesign (HIGH confidence)

Current idempotency check: for each expired user, look for an approved subscription-payment where `period_start = user.pro_expires_at`.

New idempotency check: the query itself is the guard. Because Step 1 queries approved payments with `period_end <= today`, a record that has already been renewed will have a future `period_end` and will NOT appear in the query. No separate idempotency check is needed at the per-row level.

However, if a charge fails and then succeeds on retry, the approved record is updated in-place (via `existingRecordId` path in `chargeUser`). That record's `period_end` should be updated to the next cycle's end when the retry succeeds. This is safe because the retry path reads from `subscription_payments` (failed records with `next_charge_attempt <= today`), not from users.

**Safe pattern:** After a successful renewal charge, the approved subscription-payment row gets a new `period_end` set to the first day of the following month. That row then has `period_end` in the future and will not appear in Step 1 until the next billing cycle.

### Period Calculation — proResponse (HIGH confidence)

Currently `proResponse` sets `pro_expires_at = first day of next month` on the user. After this phase, it must instead create the first `subscription-payment` row with:
- `period_end = first day of next month` (same date, moved to subscription-payment)
- `status = "approved"`
- `period_start = today (ISO date, YYYY-MM-DD)`
- `amount = proratedPrice`
- `user = user.id`
- `parent_buy_order`, `child_buy_order`, `authorization_code`, `response_code`, `payment_response`, `charged_at`, `charge_attempts = 1`

The user update must remove `pro_expires_at` and keep only `pro_status: "active"`.

### Period Calculation — chargeUser on Success (HIGH confidence)

Currently `chargeUser` reads `user.pro_expires_at` to compute the new expiry:

```typescript
const currentExpiry = new Date(user.pro_expires_at);
const newExpiresAt = new Date(
  currentExpiry.getFullYear(),
  currentExpiry.getMonth() + 1,
  1
);
```

After this phase, `chargeUser` receives the `period_end` from the subscription-payment record being renewed (passed through from Step 1). The new `period_end` is computed from the old `period_end`:

```typescript
const currentPeriodEnd = new Date(periodEnd); // from the subscription-payment row
const newPeriodEnd = new Date(
  currentPeriodEnd.getFullYear(),
  currentPeriodEnd.getMonth() + 1,
  1
);
```

The approved subscription-payment record is then updated (or created) with this new `period_end`. No user field is touched beyond `pro_status` (which is already active).

### Step 4 — Cancelled-Expiry Sweep Rewrite (HIGH confidence)

Current approach: query users where `pro_status=cancelled AND pro_expires_at <= today`.

After this phase, `pro_expires_at` no longer exists on user. The "when does a cancelled subscription expire?" answer comes from the last approved subscription-payment row for that user.

New approach — two options:

**Option A (recommended):** Query `subscription_payments` with `status=approved AND period_end <= today AND user.pro_status=cancelled`. This is a single query analogous to the new Step 1 query, with the user filter changed to `cancelled`.

```typescript
const expiredCancelledPeriods = await strapi.entityService.findMany(
  "api::subscription-payment.subscription-payment" as Parameters<
    typeof strapi.entityService.findMany
  >[0],
  {
    filters: {
      status: { $eq: "approved" },
      period_end: { $lte: today },
      user: { pro_status: { $eq: "cancelled" } },
    } as unknown as Record<string, unknown>,
    populate: ["user"] as unknown as Parameters<
      typeof strapi.entityService.findMany
    >[1]["populate"],
    pagination: { pageSize: -1 },
  }
);
```

**Option B:** Query cancelled users, then for each fetch their latest approved subscription-payment to check `period_end`. This causes N+1 and is not recommended.

With Option A, the user update only sets `pro_status: "inactive"` (no `pro_expires_at: null` because the field no longer exists).

### Retry Records — period_end Propagation (HIGH confidence)

Failed subscription-payment records created in `chargeUser` currently store `period_start` to identify the billing period being retried. They do NOT currently store `period_end`. After this phase, failed records must also store `period_end` (the target end date for the period being charged). This is needed so that when a retry succeeds, the approved record carries the correct `period_end`.

The `period_end` for a failed record is the same date that would have been assigned had the charge succeeded — the first day of the month after `period_start`. Since `period_start` is always the first day of a month (or the inscription date for prorated first month), and `period_end` is always the first day of the following month, the relationship is deterministic:

```typescript
const periodEndDate = new Date(
  new Date(periodStart).getFullYear(),
  new Date(periodStart).getMonth() + 1,
  1
);
const periodEnd = periodEndDate.toISOString().split("T")[0];
```

This `period_end` must be included in both the failed record create and the successful update/create paths in `chargeUser`.

### protect-user-fields.ts Change (HIGH confidence)

`pro_expires_at` is in `PROTECTED_USER_FIELDS` at line 24 of `protect-user-fields.ts`. It must be removed from that array because the field will no longer exist on the user entity.

The test at line 42 of `protect-user-fields.test.ts` asserts that `pro_expires_at` is stripped. After removing it from the middleware, this test assertion must be updated — the test should no longer assert that `pro_expires_at` is stripped (it can simply be dropped from that test case, or the test refactored to not include it in the input).

The test at line 178 asserts "all 13 protected fields" — the count drops to 12 and the list no longer includes `pro_expires_at`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| DB schema change | Raw SQL ALTER TABLE | Knex migration with `alterTable` (same pattern as existing migration) |
| Filtering by related field | N+1 loop over users | Strapi `entityService.findMany` with nested `filters: { user: { pro_status: ... } }` |
| Period-end date arithmetic | Custom calendar lib | Vanilla `new Date(year, month + 1, 1)` — established pattern already in `chargeUser` |

---

## Common Pitfalls

### Pitfall 1: Strapi v5 Filter Nesting on Relations

**What goes wrong:** Writing `filters: { "user.pro_status": "active" }` (dot notation) instead of `filters: { user: { pro_status: "active" } }` (nested object). Strapi v5 `entityService.findMany` requires the nested object form.

**How to avoid:** Match the pattern used in existing filters in the cron — e.g., `filters: { status: "failed", charge_attempts: { $lt: 3 } }`. For relations, nest one level deeper: `{ user: { pro_status: { $eq: "active" } } }`.

**Warning signs:** Query returns all records regardless of user's pro_status.

### Pitfall 2: Missing period_end on Failed Records

**What goes wrong:** Adding `period_end` only to the success path in `chargeUser` but forgetting the failed-record create path. When a failed charge is retried successfully, the approved record (updated from failed) would have no `period_end`, causing the next cron run to skip it (or crash).

**How to avoid:** `period_end` must appear in ALL four data payloads in `chargeUser`:
1. New approved record (create)
2. Updated existing record to approved (update)
3. New failed record (create)
4. Updated existing failed record (update — to refresh attempt count)

### Pitfall 3: Test Mock Call Count Mismatch

**What goes wrong:** The cron test (`subscription-charge.cron.test.ts`) uses positional `mockResolvedValueOnce` chains. Currently it has 5 calls in most test cases (4 findMany + 1 for Step 4 cancelled users). After the rewrite, Step 1 moves from `findMany` on users to `findMany` on subscription-payments. The positional chain order changes. Tests that rely on exact call count will break if not updated.

**How to avoid:** After rewriting the cron, recount the `findMany` calls and update every `mockFindMany` chain in the test file to match the new order.

### Pitfall 4: pro_expires_at Writes Left Behind

**What goes wrong:** Removing `pro_expires_at` from the schema but leaving a write to it in `chargeUser` (currently line 460–476: `strapi.entityService.update("plugin::users-permissions.user", user.id, { data: { pro_expires_at: newExpiresAt } })`). Strapi v5 may silently ignore unknown fields or may throw.

**How to avoid:** After the schema change, grep for `pro_expires_at` across the entire `apps/strapi/src` tree and confirm zero occurrences remain in TypeScript source.

### Pitfall 5: Test Assertions on pro_expires_at

**What goes wrong:** Tests that assert `expect(mockUpdate).toHaveBeenCalledWith(..., expect.objectContaining({ data: expect.objectContaining({ pro_expires_at: expect.any(Date) }) }))` will pass even after the production code stops writing `pro_expires_at` — if the mock records a different call. The assertion would fail only if the `update` call stops entirely. Be explicit: after the rewrite, assert that `pro_expires_at` is NOT in any update data.

**How to avoid:** In the updated cron test, assert `expect(updateData).not.toHaveProperty("pro_expires_at")` on every user update call.

### Pitfall 6: cancelled users with multiple approved subscription-payment rows

**What goes wrong:** A cancelled user may have multiple approved `subscription-payment` rows (one per past billing period). The new Step 4 query `period_end <= today AND user.pro_status=cancelled` will return ALL of them — past periods. This would trigger multiple deactivation calls for the same user.

**How to avoid:** Add a deduplication step after the query: collect unique user IDs from the result set and process each user only once. Or, use a Set to track processed user IDs within the loop.

---

## Code Examples

### subscription-payment schema addition

```json
// Source: apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json
"period_end": {
  "type": "date",
  "required": true
}
```

### New Step 1 query structure (replaces expired-users findMany on up_users)

```typescript
// Source: cron pattern, adapted to query subscription-payment instead of user
const duePaymentPeriods = (await strapi.entityService.findMany(
  "api::subscription-payment.subscription-payment" as Parameters<
    typeof strapi.entityService.findMany
  >[0],
  {
    filters: {
      status: { $eq: "approved" },
      period_end: { $lte: today },
      user: { pro_status: { $eq: "active" } },
    } as unknown as Record<string, unknown>,
    populate: {
      user: {
        populate: ["subscription_pro"],
      },
    } as unknown as Parameters<
      typeof strapi.entityService.findMany
    >[1]["populate"],
    pagination: { pageSize: -1 },
  }
)) as DuePaymentRecord[];
```

### period_end computation (calendar billing)

```typescript
// Source: existing chargeUser pattern, adapted for period_end instead of pro_expires_at
const currentPeriodEnd = new Date(record.period_end); // YYYY-MM-DD from subscription-payment
const newPeriodEnd = new Date(
  currentPeriodEnd.getFullYear(),
  currentPeriodEnd.getMonth() + 1,
  1
);
const newPeriodEndStr = newPeriodEnd.toISOString().split("T")[0];
```

### proResponse — first subscription-payment creation (replacing user pro_expires_at write)

```typescript
// Replaces: strapi.entityService.update("plugin::users-permissions.user", user.id, { data: { pro_status: "active", pro_expires_at: proExpiresAt } })
// New:
const proExpiresAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const proExpiresAtStr = proExpiresAt.toISOString().split("T")[0];

await subPaymentCreate("api::subscription-payment.subscription-payment", {
  data: {
    user: user.id,
    amount: proratedPrice,
    status: "approved",
    parent_buy_order: `pro-inscription-${user.id}-${todayCompact}`,
    child_buy_order: `c-${user.id}-${todayCompact}-1`,
    authorization_code: chargeResult.authorizationCode,
    response_code: chargeResult.responseCode,
    payment_response: chargeResult.rawResponse,
    period_start: now.toISOString().split("T")[0],
    period_end: proExpiresAtStr,
    charged_at: new Date(),
    charge_attempts: 1,
    publishedAt: new Date(),
  },
});

// User update — only pro_status, no pro_expires_at
await strapi.entityService.update("plugin::users-permissions.user", user.id, {
  data: {
    pro_status: "active",
  } as unknown as Parameters<typeof strapi.entityService.update>[2]["data"],
});
```

### protect-user-fields.ts — updated PROTECTED_USER_FIELDS

```typescript
// Remove "pro_expires_at" from this array
const PROTECTED_USER_FIELDS = [
  "pro_status",
  // "pro_expires_at" — removed: field no longer exists on user entity
  "username",
  "avatar",
  "cover",
  "role",
  "provider",
  "confirmed",
  "blocked",
] as const;
```

---

## Files to Change

This is the complete change surface for Phase 121:

| File | Change |
|------|--------|
| `apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json` | Add `period_end: { type: "date", required: true }` |
| `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` | Remove `pro_expires_at` attribute |
| `apps/strapi/database/migrations/YYYY.MM.DDT00.00.00.add-period-end-drop-pro-expires-at.ts` | New Knex migration: `up_users.dropColumn("pro_expires_at")`, `subscription_payments.addColumn("period_end" date NOT NULL)` |
| `apps/strapi/src/cron/subscription-charge.cron.ts` | Rewrite Step 1 (query subscription-payment by period_end), Step 4 (query subscription-payment for cancelled users). Remove `pro_expires_at` from `ProUser` interface. Remove `pro_expires_at` write in `chargeUser` success path. Add `period_end` to all subscription-payment create/update data payloads. |
| `apps/strapi/src/api/payment/controllers/payment.ts` (`proResponse`) | Remove `pro_expires_at` write on user. Add first subscription-payment creation with `period_end`. |
| `apps/strapi/src/middlewares/protect-user-fields.ts` | Remove `"pro_expires_at"` from `PROTECTED_USER_FIELDS` array. |
| `apps/strapi/tests/cron/subscription-charge.cron.test.ts` | Rewrite tests: remove `pro_expires_at` from `makeUser`, update `mockFindMany` call chains (new Step 1 reads subscription-payments not users), update `mockUpdate` assertions (no `pro_expires_at`). Add assertions for `period_end` in create/update calls. |
| `apps/strapi/tests/middlewares/protect-user-fields.test.ts` | Remove `pro_expires_at` from test inputs and assertions. Update "13 protected fields" test to 12 fields. |
| `apps/strapi/tests/api/payment/payment-pro-response.test.ts` | Implement the `.todo` tests — assert first subscription-payment row is created with `period_end`, assert user update does NOT include `pro_expires_at`. |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (Strapi app) |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `yarn workspace @waldo/strapi jest tests/cron/subscription-charge.cron.test.ts --no-coverage` |
| Full suite command | `yarn workspace @waldo/strapi jest --no-coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUB-MODEL-121-01 | `pro_expires_at` removed from user schema and DB | Manual verification (migration runs on server start) | `yarn workspace @waldo/strapi jest tests/middlewares/protect-user-fields.test.ts` | ✅ |
| SUB-MODEL-121-02 | `period_end` added to subscription-payment; all create/update calls include it | unit | `yarn workspace @waldo/strapi jest tests/cron/subscription-charge.cron.test.ts` | ✅ |
| SUB-MODEL-121-03 | Cron Step 1 queries subscription-payment by period_end; Step 4 same for cancelled | unit | `yarn workspace @waldo/strapi jest tests/cron/subscription-charge.cron.test.ts` | ✅ |
| SUB-MODEL-121-04 | proResponse creates first subscription-payment with period_end; no pro_expires_at write | unit | `yarn workspace @waldo/strapi jest tests/api/payment/payment-pro-response.test.ts` | ✅ (stubs only — needs implementation) |

### Sampling Rate

- **Per task commit:** `yarn workspace @waldo/strapi jest tests/cron/subscription-charge.cron.test.ts --no-coverage`
- **Per wave merge:** `yarn workspace @waldo/strapi jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/api/payment/payment-pro-response.test.ts` — file exists but all tests are `.todo`; must be implemented as part of this phase (covers SUB-MODEL-121-04)

---

## Open Questions

1. **publishedAt on subscription-payment records created in proResponse**
   - What we know: existing `chargeUser` creates subscription-payment records without `publishedAt`. The `subscription-payment` schema has `draftAndPublish: false`.
   - What's unclear: whether Strapi v5 auto-sets `publishedAt` when `draftAndPublish: false`, or whether it must be explicit.
   - Recommendation: match the pattern of existing `chargeUser` creates (which do not set `publishedAt`). If Strapi auto-sets it, no change needed.

2. **Multiple approved rows for cancelled users in Step 4**
   - What we know: the new Step 4 query returns all approved subscription-payment rows with `period_end <= today AND user.pro_status=cancelled`. A user with 6 months of billing history will have 5 expired approved rows.
   - What's unclear: how the planner wants to handle deduplication.
   - Recommendation: collect unique user IDs from the result set using a `Set<number>` and process each user once (set `pro_status=inactive`, clear `subscription_pro.tbk_user`, recalculate sort_priority).

---

## Sources

### Primary (HIGH confidence)
- `apps/strapi/src/cron/subscription-charge.cron.ts` — complete cron source, all 564 lines read
- `apps/strapi/src/api/payment/controllers/payment.ts` — proResponse full implementation, lines 483–673
- `apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json` — current schema confirmed: has period_start, no period_end
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — pro_expires_at at lines 171–173
- `apps/strapi/src/middlewares/protect-user-fields.ts` — PROTECTED_USER_FIELDS confirmed includes pro_expires_at
- `apps/strapi/database/migrations/2026.04.09T00.00.00.drop-user-pro-card-fields.ts` — established migration template
- `apps/strapi/tests/cron/subscription-charge.cron.test.ts` — full test suite read (676 lines) — all mockFindMany chains documented
- `apps/strapi/tests/middlewares/protect-user-fields.test.ts` — full test suite read — pro_expires_at appears in tests 2, 9

## Metadata

**Confidence breakdown:**
- Schema changes: HIGH — files read directly
- Migration SQL: HIGH — existing migration is the template
- Cron query rewrite: HIGH — full cron source and tests read
- Pitfall: cancelled multi-row dedup: HIGH — structural analysis of data model
- Test update surface: HIGH — all test files read, exact line counts known

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (stable Strapi v5 patterns)

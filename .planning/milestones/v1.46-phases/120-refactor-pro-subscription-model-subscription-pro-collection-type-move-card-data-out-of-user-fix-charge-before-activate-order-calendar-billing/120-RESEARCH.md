# Phase 120: Refactor PRO Subscription Model - Research

**Researched:** 2026-04-08
**Domain:** Strapi v5 content types, subscription billing, card data architecture
**Confidence:** HIGH

## Summary

The PRO subscription model was built iteratively across Phases 102–104. Card data (`tbk_user`, `pro_card_type`, `pro_card_last4`), billing metadata (`pro_expires_at`, `pro_status`, `pro_inscription_token`, `pro_pending_invoice`), and the orphaned `pro` boolean all live directly on the `plugin::users-permissions.user` entity. This pollutes the user record with payment domain concerns, creates a large protected-fields list in the security middleware, and makes it impossible to track subscription history per user.

The phase has four distinct goals: (1) introduce a `subscription-pro` collection type to own card + billing data, (2) move card fields out of the user record, (3) fix the charge-before-activate ordering bug in `proResponse` (currently the user is activated and then charged — if the charge fails the user is wrongly activated), and (4) align the cron's renewal logic to calendar billing (1st of next month, not +30 days).

The `subscription-payment` content type already exists and handles per-period charge records. The new `subscription-pro` type is a singleton-per-user record for the ongoing subscription state (card enrollment data + current period), while `subscription-payment` remains the per-charge audit log.

**Primary recommendation:** Introduce `subscription-pro` as the authoritative record for card and billing state. Keep `pro_status` and `pro_expires_at` on the user for read-path convenience (middleware, ad sort-priority). Migrate all write paths (payment controller, cron, cancellation service) to use the new collection. Remove the orphaned `pro` boolean from the user schema.

## Standard Stack

### Core (already in use — no new installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Strapi v5 entityService | v5 | Content type CRUD | Project standard |
| transbank-sdk | existing | Oneclick charge/inscription | Already wired |
| Jest + ts-jest | existing | Unit tests | Project standard |

### No new npm packages required.

**Version verification:** All libraries are already installed. No new dependencies needed for this phase.

## Architecture Patterns

### Recommended Project Structure (new files)

```
apps/strapi/src/api/subscription-pro/
├── content-types/
│   └── subscription-pro/
│       └── schema.json            # new collection type
apps/strapi/src/api/payment/services/
│   └── pro-subscription.service.ts  # replaces inline controller logic
apps/strapi/tests/api/payment/services/
│   └── pro-subscription.service.test.ts
```

### Pattern 1: subscription-pro Schema Design

**What:** A new `api::subscription-pro.subscription-pro` collection type (one record per user) that owns all card enrollment and billing state.

**Schema fields:**
```json
{
  "kind": "collectionType",
  "collectionName": "subscription_pros",
  "info": {
    "singularName": "subscription-pro",
    "pluralName": "subscription-pros",
    "displayName": "Subscription PRO"
  },
  "options": { "draftAndPublish": false, "timestamps": true },
  "attributes": {
    "user": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "plugin::users-permissions.user",
      "inversedBy": "subscription_pro"
    },
    "tbk_user": { "type": "string", "private": true },
    "card_type": { "type": "string" },
    "card_last4": { "type": "string" },
    "inscription_token": { "type": "string", "private": true },
    "pending_invoice": { "type": "boolean", "default": false }
  }
}
```

**Fields intentionally EXCLUDED from subscription-pro** (remain on user for read-path convenience):
- `pro_status` — queried by middleware, ad sort-priority, frontend; keep on user
- `pro_expires_at` — queried by cron (`$lte` filter on user entity); keep on user

**When to use:** This is the canonical write target for all card enrollment data. Read `pro_status` and `pro_expires_at` directly from the user for gate checks.

### Pattern 2: Charge-Before-Activate Order in proResponse

**Current bug:** In `payment.ts` `proResponse`, the controller:
1. Updates user: `pro_status: "active"`, stores `tbk_user`, `pro_card_type`, `pro_card_last4`, `pro_expires_at`
2. Then creates an order + Facto document (non-fatal)

**Problem:** There is no actual charge at inscription time — Oneclick Mall inscription just registers the card. The prorated first-month charge should happen at inscription via `authorizeCharge()` BEFORE marking the user as active. If the charge fails, the user should NOT be activated.

**Correct order in proResponse:**
1. `finishInscription(TBK_TOKEN)` → get `tbkUser`, `cardType`, `last4`
2. Calculate prorated amount
3. `authorizeCharge(userDocumentId, tbkUser, proratedAmount, buyOrder, childBuyOrder)` — if this fails → redirect to error
4. Only on successful charge: create `subscription-pro` record (card data), update user `pro_status: "active"` + `pro_expires_at`, create order + Facto doc

**This is the critical correctness fix** — currently the charge is non-fatal and runs after activation.

### Pattern 3: Calendar Billing in the Cron

**Current behavior:** `newExpiresAt = new Date(currentExpiry.getFullYear(), currentExpiry.getMonth() + 1, 1)` — this IS already calendar billing (1st of next month). This is correct.

**Verify:** The cron reads `pro_expires_at` from the user and extends it. After migration to `subscription-pro`, the `tbk_user` must be read from `subscription-pro` (not user) for the `chargeUser()` call. The `ProUser` interface in the cron will need updating.

### Pattern 4: Strapi oneToOne Inverse Relation

When adding `subscription_pro` to the user schema (inverse side of oneToOne), the user schema extension file at `src/extensions/users-permissions/content-types/user/schema.json` must declare:
```json
"subscription_pro": {
  "type": "relation",
  "relation": "oneToOne",
  "target": "api::subscription-pro.subscription-pro",
  "mappedBy": "user"
}
```

The `mappedBy` side does not own the foreign key. The `subscription-pro` schema is the owning side (it has `inversedBy`).

### Pattern 5: Removing the orphaned `pro` boolean

The `pro` boolean field still exists in `src/extensions/users-permissions/content-types/user/schema.json` (line 131–134). Phase 103.1 removed all code reads/writes but did NOT remove the schema field. This phase should remove it from the schema JSON. No data migration needed — the column can be dropped (it is never written anymore).

### Anti-Patterns to Avoid

- **Storing pro_status/pro_expires_at in subscription-pro:** The cron uses `$lte` filter on `pro_expires_at` at the user level — moving it would require a join query; keep it on user.
- **Joining subscription-pro in every user query:** Only join when the write path needs card data. The read path (middleware, sort-priority) uses user fields only.
- **Making the first-month charge fatal then retrying in the cron:** The charge is synchronous at inscription. If it fails, redirect to error and do NOT create the subscription-pro record. The cron only handles renewals.
- **Deleting tbk_user from user before migration is complete:** Remove from user schema only after all read/write sites use subscription-pro.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finding subscription-pro by user | Custom SQL join | `strapi.db.query('api::subscription-pro.subscription-pro').findOne({ where: { user: { id: userId } } })` | Strapi handles join |
| Validating inscription before charge | Custom polling loop | authorizeCharge() return value — `result.success === false` → redirect to error | Transbank SDK handles response |
| Prorated first-month price | Custom formula | Already implemented: `Math.ceil((daysRemaining / daysInMonth) * proMonthlyPrice)` — reuse it | Already correct |

**Key insight:** The existing `OneclickService.authorizeCharge()` is the correct gate for the charge-before-activate pattern. No new Transbank integration work is needed — just move the charge call before the user update.

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `up_users` table: `pro`, `tbk_user`, `pro_card_type`, `pro_card_last4`, `pro_inscription_token`, `pro_pending_invoice` columns | Schema migration removes `pro` column; new `subscription_pros` table created; existing active users need a data migration to populate `subscription_pros` from user columns |
| Live service config | None — no external service stores PRO subscription state | None |
| OS-registered state | None | None |
| Secrets/env vars | `PRO_MONTHLY_PRICE`, `ONECLICK_COMMERCE_CODE`, `ONECLICK_API_KEY`, `ONECLICK_CHILD_COMMERCE_CODE`, `ONECLICK_ENVIRONMENT` — names unchanged | None — code rename only if field references change |
| Build artifacts | None | None |

**Data migration note:** Active PRO users (`pro_status = 'active'` or `'cancelled'`) currently have `tbk_user`, `pro_card_type`, `pro_card_last4` stored directly on `up_users`. A bootstrap migration or seeder must copy these to the new `subscription_pros` table before the write paths are switched. The `pro` boolean column can be dropped via Strapi schema change (Strapi auto-runs migrations on restart).

## Common Pitfalls

### Pitfall 1: Strapi oneToOne relation direction
**What goes wrong:** Declaring `mappedBy` on both sides, or `inversedBy` on both sides — Strapi throws "relation must have one owning side" error.
**Why it happens:** Confusion about which entity owns the foreign key (the owning side has `inversedBy`, the inverse side has `mappedBy`).
**How to avoid:** `subscription-pro.user` is the owning side (`inversedBy: "subscription_pro"`). User schema extension uses `mappedBy: "user"`.
**Warning signs:** Strapi fails to start with relation configuration error in console.

### Pitfall 2: Cron reads tbk_user from user after migration
**What goes wrong:** After removing `tbk_user` from user, the cron's `ProUser` interface still references `user.tbk_user` — charge calls fail with empty tbkUser.
**Why it happens:** The cron fetches `plugin::users-permissions.user` with `fields: ["id", "tbk_user", "pro_expires_at"]` — tbk_user won't be present after removal.
**How to avoid:** Update `chargeUser()` to accept `tbkUser` as a separate parameter sourced from the `subscription-pro` record. The cron must populate and join `subscription-pro` when fetching expired users.
**Warning signs:** `authorizeCharge` called with empty string tbkUser, Transbank returns error.

### Pitfall 3: Cancellation service reads tbk_user from user
**What goes wrong:** `ProCancellationService.cancelSubscription()` queries `plugin::users-permissions.user` for `tbk_user`. After migration it will be null/missing.
**Why it happens:** The service was written when tbk_user lived on user.
**How to avoid:** Update cancellation service to query `subscription-pro` for `tbk_user`, then delete the `subscription-pro` record on successful cancellation.
**Warning signs:** Cancellation always returns "User has no active inscription" error.

### Pitfall 4: protect-user-fields middleware still guards tbk_user on user
**What goes wrong:** After moving tbk_user to subscription-pro, the middleware still lists it in `PROTECTED_USER_FIELDS` — harmless but misleading.
**Why it happens:** Middleware was written alongside the original schema.
**How to avoid:** Remove `tbk_user`, `pro_card_type`, `pro_card_last4`, `pro_inscription_token` from `PROTECTED_USER_FIELDS` after migration. Keep `pro_status`, `pro_expires_at`.

### Pitfall 5: First-month charge failure leaves orphaned subscription-pro record
**What goes wrong:** If subscription-pro is written before the charge attempt, a failed charge leaves an orphaned record with valid card data but no active user.
**Why it happens:** Write-before-charge ordering.
**How to avoid:** Create the `subscription-pro` record ONLY after `authorizeCharge()` returns `success: true`. This is the charge-before-activate fix.

### Pitfall 6: Strapi entityService doesn't recognize new content type
**What goes wrong:** `strapi.entityService.findMany("api::subscription-pro.subscription-pro", ...)` throws "Trying to use a query on an unknown content type" (same issue as with `subscription-payment` in the cron).
**Why it happens:** Content type UID must exactly match the schema's `singularName` and directory name.
**How to avoid:** Use the same alias pattern already used in `subscription-charge.cron.ts` — cast the create/update methods as needed. Verify the UID resolves by checking in `strapi.contentTypes` after boot.

## Code Examples

### Reading subscription-pro for a user (Strapi db.query)
```typescript
// Source: existing pattern in pro-cancellation.service.ts (adapted)
const subPro = await strapi.db
  .query("api::subscription-pro.subscription-pro")
  .findOne({ where: { user: { id: userId } }, select: ["tbk_user"] });
```

### Creating subscription-pro after successful charge
```typescript
// Source: derived from subscription-charge.cron.ts chargeUser() pattern
const subProCreate = strapi.entityService.create as (
  _uid: string,
  _params: { data: Record<string, unknown> }
) => Promise<unknown>;

await subProCreate("api::subscription-pro.subscription-pro", {
  data: {
    user: userId,
    tbk_user: tbkUser,
    card_type: cardType,
    card_last4: cardLast4,
    pending_invoice: isInvoice,
    publishedAt: new Date(),
  },
});
```

### Charge-before-activate sequence in proResponse
```typescript
// 1. Finish inscription
const result = await oneclickService.finishInscription(TBK_TOKEN);
if (!result.success || !result.tbkUser) {
  ctx.redirect(`${process.env.FRONTEND_URL}/pro/error?reason=rejected`);
  return;
}

// 2. Calculate prorated amount
const proMonthlyPrice = parseInt(process.env.PRO_MONTHLY_PRICE ?? "0", 10);
const now = new Date();
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const daysRemaining = daysInMonth - now.getDate() + 1;
const proratedPrice = Math.ceil((daysRemaining / daysInMonth) * proMonthlyPrice);

// 3. Charge first (BEFORE activating)
const todayCompact = new Date().toISOString().split("T")[0].replace(/-/g, "");
const chargeResult = await oneclickService.authorizeCharge(
  user.documentId,
  result.tbkUser,
  proratedPrice,
  `pro-inscription-${user.id}-${todayCompact}`,
  `c-${user.id}-${todayCompact}-1`
);
if (!chargeResult.success) {
  ctx.redirect(`${process.env.FRONTEND_URL}/pro/error?reason=charge-failed`);
  return;
}

// 4. Only now create subscription-pro + activate user
// ...create subscription-pro record...
// ...update user pro_status: "active", pro_expires_at...
// ...create order + Facto doc...
```

### Updated cron ProUser interface
```typescript
// After migration tbk_user comes from subscription-pro, not user
interface ProUser {
  id: number;
  documentId: string;
  pro_expires_at: string;
  pro_pending_invoice?: boolean;
  subscription_pro?: { tbk_user?: string } | null;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pro` boolean as PRO gate | `pro_status` enum ("active"/"inactive"/"cancelled") | Phase 103.1 | Boolean removed from all reads/writes but NOT from schema |
| Card data on user record | Card data on user record (current) | — | This phase moves it to subscription-pro |
| Charge after activation | Charge after activation (current bug) | — | This phase fixes the order |
| +30-day renewal | Calendar renewal (1st of next month) | Phase 103 | Already implemented correctly in cron |

**Deprecated/outdated:**
- `pro` boolean field in user schema: exists in `schema.json` but no code reads/writes it since Phase 103.1. Remove in this phase.
- `tbk_user`, `pro_card_type`, `pro_card_last4`, `pro_inscription_token`, `pro_pending_invoice` on user: move to `subscription-pro` in this phase.

## Open Questions

1. **Data migration for existing active PRO users**
   - What we know: Active users have `tbk_user`, `pro_card_type`, `pro_card_last4` on their user records right now.
   - What's unclear: Whether there are any active PRO users in production whose data must be migrated, or whether this is a greenfield deploy (no existing subscribers).
   - Recommendation: Write a Strapi bootstrap migration that creates `subscription-pro` records for all users where `pro_status IN ('active', 'cancelled')` and `tbk_user IS NOT NULL`. Run it atomically before removing the user columns.

2. **proResponse charge error page**
   - What we know: There's `/pro/error?reason=rejected` and `/pro/error?reason=cancelled` already. A new `reason=charge-failed` reason may be needed for UX clarity.
   - What's unclear: Whether the existing error page reads the `reason` param and shows different messages.
   - Recommendation: Check `pro/error.vue` and add `charge-failed` messaging if needed; otherwise `rejected` is an acceptable fallback.

3. **subscription-pro findMany in cron performance**
   - What we know: The cron currently finds expired users via a single query on user fields. After migration, it needs to join `subscription-pro` to get `tbk_user`.
   - What's unclear: Whether Strapi's `populate` on `findMany` with a user-level filter + subscription-pro join performs acceptably at scale.
   - Recommendation: Use `populate: ["subscription_pro"]` in the cron's expired-user query. Document the N+1 risk if subscription count grows.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && yarn test --testPathPattern=subscription` |
| Full suite command | `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUB-PRO-01 | subscription-pro schema creates correctly | unit | `yarn test --testPathPattern=pro-subscription` | ❌ Wave 0 |
| SUB-PRO-02 | proResponse charges before activating; charge failure redirects to error | unit | `yarn test --testPathPattern=payment` | ❌ Wave 0 |
| SUB-PRO-03 | cron reads tbk_user from subscription-pro, not user | unit | `yarn test --testPathPattern=subscription-charge` | ✅ (needs update) |
| SUB-PRO-04 | cancellation service reads tbk_user from subscription-pro | unit | `yarn test --testPathPattern=pro-cancellation` | ✅ (needs update) |
| SUB-PRO-05 | protect-user-fields no longer guards moved card fields | unit | `yarn test --testPathPattern=protect-user-fields` | ✅ (needs update) |

### Sampling Rate
- **Per task commit:** `cd apps/strapi && yarn test --testPathPattern=subscription`
- **Per wave merge:** `cd apps/strapi && yarn test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/api/payment/services/pro-subscription.service.test.ts` — covers SUB-PRO-01, SUB-PRO-02
- [ ] Update `tests/cron/subscription-charge.cron.test.ts` — ProUser interface + tbk_user source (SUB-PRO-03)
- [ ] Update `tests/api/payment/services/pro-cancellation.service.test.ts` — subscription-pro query (SUB-PRO-04)
- [ ] Update `tests/middlewares/protect-user-fields.test.ts` — removed fields from protected list (SUB-PRO-05)

## Sources

### Primary (HIGH confidence)
- Direct code reading: `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — full user schema with all PRO fields
- Direct code reading: `apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json` — existing subscription-payment schema pattern
- Direct code reading: `apps/strapi/src/api/payment/controllers/payment.ts` — current proResponse flow
- Direct code reading: `apps/strapi/src/cron/subscription-charge.cron.ts` — cron billing logic
- Direct code reading: `apps/strapi/src/api/payment/services/pro-cancellation.service.ts` — cancellation flow
- Direct code reading: `apps/strapi/src/middlewares/protect-user-fields.ts` — protected field list

### Secondary (MEDIUM confidence)
- `.planning/milestones/v1.46-ROADMAP.md` — original design intent for PRO subscription phases
- `.planning/STATE.md` — accumulated project decisions

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Current state audit: HIGH — all code read directly from source
- Standard stack: HIGH — no new libraries; all existing patterns
- Architecture: HIGH — derived directly from existing working patterns in the codebase
- Pitfalls: HIGH — identified from direct code inspection of all affected files

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (stable domain — Strapi schema patterns don't change frequently)

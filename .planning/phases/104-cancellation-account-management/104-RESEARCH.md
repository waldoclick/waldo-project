# Phase 104: Cancellation + Account Management - Research

**Researched:** 2026-03-20
**Domain:** Transbank Oneclick Mall inscription deletion, Strapi user field updates, Nuxt account UI
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CANC-01 | User can cancel their PRO subscription from their account page | New `POST /payments/pro-cancel` endpoint in Strapi; cancel button in `AccountMain.vue` calls it via `useApiClient()` |
| CANC-02 | Cancelled subscription remains active until `pro_expires_at` (period-end expiry) | Set `pro_status: 'cancelled'` without clearing `pro: true` or `pro_expires_at`; existing cron already reads `pro_status: active` so cancelled users are naturally skipped |
| CANC-03 | Card inscription is deleted from Transbank on cancellation | `inscription.delete(tbkUser, username)` — SDK method confirmed in `mall_inscription.d.ts`; `buildOneclickUsername(documentId)` exported from existing types module |
| CANC-04 | After period expires, `pro_status` is set to `inactive` and PRO features are disabled | `SubscriptionChargeService` deactivation path already sets `pro_status: inactive`, `pro: false`; that path must also handle `cancelled` users whose `pro_expires_at` has passed |
| FRNT-03 | Account page shows subscription status (active/cancelled), card info, and next charge date | New `AccountSubscription.vue` component added to `AccountMain.vue` when `user.pro_status` is `active` or `cancelled`; reads `pro_status`, `pro_card_type`, `pro_card_last4`, `pro_expires_at` from Strapi user |
| FRNT-04 | Cancel button with Swal confirmation available on account page for active subscribers | Button shown only when `user.pro_status === 'active'`; same Swal pattern as `MemoPro.vue` |
</phase_requirements>

---

## Summary

Phase 104 adds two capabilities: a cancellation endpoint in Strapi and a subscription status section on the frontend account page.

The Strapi side is straightforward. The Transbank SDK's `MallInscription.delete(tbkUser, username)` is already available — `inscription` is the module-level singleton in `oneclick.config.ts`, and `buildOneclickUsername(documentId)` is already exported from the types module. The cancellation endpoint needs to: (1) call `inscription.delete()`, (2) update the user's `pro_status` to `'cancelled'` while leaving `pro: true` and `pro_expires_at` intact so features remain active until period end, and (3) clear `tbk_user` (Transbank no longer holds the card; further charge attempts would fail anyway).

The existing `SubscriptionChargeService` must also be extended: its deactivation step currently only runs on `failed` payment records with `charge_attempts >= 3`, not on `cancelled` users whose `pro_expires_at` has passed naturally. A new step is needed: query `pro_status: 'cancelled'` users whose `pro_expires_at <= today`, then set `pro_status: 'inactive'` and `pro: false`. This satisfies CANC-04.

The frontend work is a new `AccountSubscription.vue` component that is conditionally rendered inside `AccountMain.vue` when `user.pro_status` is `'active'` or `'cancelled'`. It displays card info, status badge, next charge date (only for `active`), and a cancel button (only for `active`) that uses the existing Swal confirmation pattern from `MemoPro.vue`.

**Primary recommendation:** Add `deleteInscription()` to `OneclickService`, create `ProCancellationService`, wire a `POST /payments/pro-cancel` route, extend `SubscriptionChargeService` with a cancelled-expiry sweep, and build `AccountSubscription.vue` following the `ResumePro.vue` pattern.

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `transbank-sdk` | 5.0.0 | `inscription.delete()` for card removal | Already installed; `MallInscription.delete()` confirmed in SDK types |
| `sweetalert2` | existing | Confirmation dialog for cancel action | Project standard — used identically in `MemoPro.vue` |
| `@nuxtjs/strapi` | v2 | `useStrapiUser()`, `useStrapiAuth()` | Project standard for all Strapi calls |

### No New Packages Required
All libraries needed for this phase are already present in the monorepo.

---

## Architecture Patterns

### Recommended New Files

```
apps/strapi/src/
├── services/oneclick/services/oneclick.service.ts  # Add deleteInscription() method
├── api/payment/services/pro-cancellation.service.ts  # NEW
├── api/payment/services/__tests__/pro-cancellation.service.test.ts  # NEW
└── cron/subscription-charge.cron.ts  # Extend: add cancelled-expiry sweep

apps/website/app/
└── components/AccountSubscription.vue  # NEW — subscription status block
```

`AccountMain.vue` is modified (not replaced) to include `<AccountSubscription />` when `user.pro_status` is truthy.

### Pattern 1: `deleteInscription()` on `OneclickService`

Follow the same structure as `authorizeCharge()` — uses the `inscription` singleton from config, catches and returns `{ success: false, error }` on failure. Accepts `tbkUser` and `userDocumentId`; builds username internally via `buildOneclickUsername(userDocumentId)`.

**What the SDK expects (HIGH confidence — verified in `mall_inscription.d.ts`):**
```typescript
// Source: node_modules/transbank-sdk/dist/es5/transbank/webpay/oneclick/mall_inscription.d.ts
inscription.delete(tbkUser: string, username: string): Promise<any>
// username must match what was used in inscription.start() — always buildOneclickUsername(documentId)
```

### Pattern 2: `ProCancellationService`

Follow the per-file-prefixed naming convention (`pro-cancellation.service.ts`). Service has a single public method `cancelSubscription(userId: number, userDocumentId: string)`:

1. Fetch user's `tbk_user` from Strapi
2. Call `oneclickService.deleteInscription(tbkUser, userDocumentId)`
3. Update user: `pro_status: 'cancelled'`, `tbk_user: null` (card removed from Transbank)
4. Leave `pro: true` and `pro_expires_at` unchanged (CANC-02)
5. Return `{ success: boolean, error? }`

### Pattern 3: Cancel Endpoint

Add to `payment.ts` routes and `PaymentController`:

```typescript
// Route: POST /payments/pro-cancel
// Auth: JWT required (ctx.state.user populated)
// Handler: payment.proCancel
proCancel = this.controllerWrapper(async (ctx: Context) => {
  const user = await getCurrentUser(ctx);
  // ... call ProCancellationService
  ctx.body = { data: { success: true } };
});
```

Route config follows the same pattern as existing protected routes (empty `policies` array; JWT checked by Strapi middleware already).

### Pattern 4: `SubscriptionChargeService` — Cancelled Expiry Sweep (CANC-04)

Add Step 4 after the existing Step 3 (exhausted deactivation):

```typescript
// Step 4: Deactivate cancelled subscriptions whose pro_expires_at has passed
const expiredCancelledUsers = await strapi.entityService.findMany(
  "plugin::users-permissions.user",
  {
    filters: {
      pro_status: { $eq: "cancelled" },
      pro_expires_at: { $lte: `${today}T23:59:59.999Z` },
    } as unknown as Record<string, unknown>,
    fields: ["id"] as Parameters<typeof strapi.entityService.findMany>[1]["fields"],
    pagination: { pageSize: -1 },
  }
);
// For each: set pro_status: 'inactive', pro: false, pro_expires_at: null
```

### Pattern 5: `AccountSubscription.vue`

Model after `ResumePro.vue` (BEM block `account--subscription`). Conditionally rendered inside `AccountMain.vue` when `user?.pro_status === 'active' || user?.pro_status === 'cancelled'`.

The component reads directly from `useStrapiUser<User>()` — no additional API call needed. Fields needed are already on the user object: `pro_status`, `pro_card_type`, `pro_card_last4`, `pro_expires_at`.

```vue
<!-- AccountMain.vue addition (inside the existing template) -->
<div v-if="user?.pro_status === 'active' || user?.pro_status === 'cancelled'"
     class="account--main__subscription">
  <AccountSubscription />
</div>
```

The cancel button must only appear when `pro_status === 'active'`. Swal confirmation follows `MemoPro.vue` pattern exactly:

```javascript
// Source: apps/website/app/components/MemoPro.vue
const { Swal } = useSweetAlert2();
const result = await Swal.fire({
  title: "Cancelar suscripción PRO",
  text: "¿Está seguro de cancelar su suscripción PRO? Seguirá activo hasta el fin del período.",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Sí, cancelar",
  cancelButtonText: "No, mantener",
});
if (!result.isConfirmed) return;
// call apiClient("payments/pro-cancel", { method: "POST", body: { data: {} } })
// on success: call fetchUser() from useStrapiAuth() to refresh user state
```

After a successful cancel, call `fetchUser()` (from `useStrapiAuth()`) to update the reactive user object — same pattern as `pro/gracias.vue`.

### `pro_expires_at` Display — Next Charge Date

For `active` subscribers: `pro_expires_at` is the next charge date. Format it for display using a computed property. The `User` type already has `pro_expires_at: string | null`.

### Anti-Patterns to Avoid

- **Do not clear `pro_expires_at` on cancellation.** The frontend reads this field as "next charge date" for active users, and the cron uses it to know when the cancelled subscription expires. Clear it only in the deactivation step.
- **Do not set `pro: false` on cancellation.** `pro` must remain `true` until `pro_expires_at` passes — PRO features stay active during the grace period (CANC-02). The cron's deactivation step is the only place that sets `pro: false`.
- **Do not re-use the existing ProService.** `pro.service.ts` is Flow-based legacy code (not used). Create a new `ProCancellationService` instead.
- **Do not call `inscription.delete()` from within `SubscriptionChargeService`.** The delete already happened at cancellation time; the cron only needs to flip `pro_status` to `inactive` for expired cancelled users.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card deletion from Transbank | Custom HTTP DELETE call | `inscription.delete(tbkUser, username)` from existing `oneclick.config.ts` singleton | SDK handles auth headers, environment routing, and error mapping |
| Username for deletion | New format | `buildOneclickUsername(documentId)` from `services/oneclick/types` | Must be identical to what was used in `inscription.start()` — already exported for this exact use case |
| Swal confirmation UI | Custom modal | `useSweetAlert2()` composable | Project standard; already used in `MemoPro.vue` for identical pattern |
| User refresh after cancel | Manual store update | `fetchUser()` from `useStrapiAuth()` | Project standard — used in `pro/gracias.vue` for the same post-action refresh |

---

## Common Pitfalls

### Pitfall 1: Wrong `pro_status` Enum Value
**What goes wrong:** Using `"canceled"` (American spelling) instead of `"cancelled"` (British spelling).
**Why it happens:** Developers default to American spelling.
**How to avoid:** The schema in `schema.json` line 172 defines exactly: `"enum": ["active", "inactive", "cancelled"]`. Always check schema before writing string literals.
**Warning signs:** TypeScript will catch this if the User type is respected (`pro_status: "active" | "inactive" | "cancelled" | null`).

### Pitfall 2: Missing `username` Match in `inscription.delete()`
**What goes wrong:** Transbank rejects the delete call with an auth error.
**Why it happens:** `inscription.delete(tbkUser, username)` requires `username` to match exactly what was used in `inscription.start()`.
**How to avoid:** Always use `buildOneclickUsername(user.documentId)` — never construct the string inline.
**Warning signs:** Non-zero response code from Transbank, error logged in `deleteInscription()`.

### Pitfall 3: Charging Cancelled Users Whose `tbk_user` Is Null
**What goes wrong:** `SubscriptionChargeService` queries `pro_status: active` only. After adding cancelled users, if the Transbank card was deleted but `tbk_user` not cleared, `authorizeCharge()` will be called with a null/invalid token.
**Why it happens:** The cancel endpoint sets `tbk_user: null` but the cron query for new charges only filters on `pro_status: active` — so cancelled users are naturally excluded. This is safe by design, but clearing `tbk_user` at cancellation time is still correct hygiene.
**How to avoid:** The cron's new "cancelled expiry sweep" (Step 4) only updates status fields — it never calls `authorizeCharge()`.

### Pitfall 4: Not Refreshing User State After Cancellation
**What goes wrong:** The cancel button appears to do nothing — user still sees `pro_status: active` because the Pinia-persisted user store is stale.
**Why it happens:** `@nuxtjs/strapi` persists the user object in Pinia. The reactive ref does not update on its own after a POST.
**How to avoid:** Call `fetchUser()` from `useStrapiAuth()` after a successful cancel — same pattern as `pro/gracias.vue` line 43.

### Pitfall 5: Showing Cancel Button to Non-Active Subscribers
**What goes wrong:** A user in `cancelled` or `inactive` state sees and can click the cancel button, causing a 400 error from the endpoint.
**Why it happens:** Forgetting to condition on `pro_status === 'active'` specifically.
**How to avoid:** The cancel button's `v-if` must check `user?.pro_status === 'active'` (not just `user?.pro`).

---

## Code Examples

### `deleteInscription()` in `OneclickService`
```typescript
// Source: oneclick.service.ts — follows same pattern as startInscription/finishInscription
import inscription from "../config/oneclick.config";

async deleteInscription(
  tbkUser: string,
  userDocumentId: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    await inscription.delete(tbkUser, buildOneclickUsername(userDocumentId));
    return { success: true };
  } catch (error) {
    logger.error("OneclickService.deleteInscription failed", { error });
    return { success: false, error };
  }
}
```

### `ProCancellationService.cancelSubscription()`
```typescript
// apps/strapi/src/api/payment/services/pro-cancellation.service.ts
async cancelSubscription(
  userId: number,
  userDocumentId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Fetch tbk_user
  const user = await strapi.entityService.findOne(
    "plugin::users-permissions.user",
    userId,
    { fields: ["tbk_user"] as unknown as string[] }
  );
  if (!user?.tbk_user) {
    return { success: false, error: "User has no active inscription" };
  }
  // 2. Delete from Transbank
  const oneclickService = new OneclickService();
  await oneclickService.deleteInscription(user.tbk_user, userDocumentId);
  // (proceed even if Transbank delete fails — user intent is cancellation)
  // 3. Update Strapi user
  await strapi.entityService.update(
    "plugin::users-permissions.user",
    userId,
    {
      data: {
        pro_status: "cancelled",
        tbk_user: null,
      } as unknown as Parameters<typeof strapi.entityService.update>[2]["data"],
    }
  );
  return { success: true };
}
```

### `proCancel` controller handler
```typescript
// In PaymentController (payment.ts)
proCancel = this.controllerWrapper(async (ctx: Context) => {
  const user = await getCurrentUser(ctx);
  if (!user.documentId) ctx.throw(500, "User documentId is missing");
  const cancellationService = new ProCancellationService();
  const result = await cancellationService.cancelSubscription(user.id, user.documentId);
  if (!result.success) {
    ctx.status = 400;
    ctx.body = { success: false, message: result.error };
    return;
  }
  ctx.body = { data: { success: true } };
});
```

### Route entry
```typescript
// In payment.ts routes array
{
  method: "POST",
  path: "/payments/pro-cancel",
  handler: "payment.proCancel",
  config: { policies: [] },
}
```

### `AccountSubscription.vue` cancel handler
```javascript
// useStrapiAuth().fetchUser() refreshes the reactive user ref after cancel
const { fetchUser } = useStrapiAuth();
const handleCancelSubscription = async () => {
  const result = await Swal.fire({ /* confirmation */ });
  if (!result.isConfirmed) return;
  try {
    await apiClient("payments/pro-cancel", { method: "POST", body: { data: {} } });
    await fetchUser();
  } catch (error) {
    Swal.fire("Error", "No se pudo cancelar la suscripción.", "error");
  }
};
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (Strapi) + Vitest (website) |
| Config file | `apps/strapi/jest.config.ts` |
| Quick run command (Strapi) | `yarn workspace apps/strapi test --testPathPattern="pro-cancellation"` |
| Full suite command | `yarn workspace apps/strapi test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CANC-01 | `ProCancellationService.cancelSubscription()` calls `deleteInscription` and updates user | unit | `yarn workspace apps/strapi test --testPathPattern="pro-cancellation"` | No — Wave 0 |
| CANC-02 | After cancel, `pro: true` and `pro_expires_at` remain unchanged | unit | same | No — Wave 0 |
| CANC-03 | `OneclickService.deleteInscription()` calls `inscription.delete(tbkUser, username)` | unit | `yarn workspace apps/strapi test --testPathPattern="oneclick.service"` | Partial — file exists, `deleteInscription` test missing |
| CANC-04 | `SubscriptionChargeService` deactivates expired `cancelled` users | unit | `yarn workspace apps/strapi test --testPathPattern="subscription-charge"` | Partial — file exists, new step needs new test case |
| FRNT-03 | `AccountSubscription.vue` renders status, card info, next charge date | manual | N/A | No — Wave 0 |
| FRNT-04 | Cancel button visible only when `pro_status === 'active'` | manual | N/A | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn workspace apps/strapi test --testPathPattern="pro-cancellation|oneclick.service|subscription-charge"`
- **Per wave merge:** `yarn workspace apps/strapi test`
- **Phase gate:** Full Strapi test suite green before `/gsd:verify-work`

### Wave 0 Gaps
- `apps/strapi/src/api/payment/services/__tests__/pro-cancellation.service.test.ts` — covers CANC-01, CANC-02
- Additional test cases in `apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts` — covers CANC-03 (`deleteInscription` method)
- Additional test cases in `apps/strapi/src/cron/subscription-charge.cron.test.ts` — covers CANC-04 (expired cancelled sweep)

---

## Sources

### Primary (HIGH confidence)
- `node_modules/transbank-sdk/dist/es5/transbank/webpay/oneclick/mall_inscription.d.ts` — `delete(tbkUser, username)` signature verified
- `node_modules/transbank-sdk/dist/es5/transbank/webpay/oneclick/mall_inscription.js` — delete implementation confirmed (calls `DeleteRequest`)
- `apps/strapi/src/services/oneclick/types/oneclick.types.ts` — `buildOneclickUsername` exported for Phase 104 reuse (comment on line 26)
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — `pro_status` enum values: `["active", "inactive", "cancelled"]`; `tbk_user` is `private: true`
- `apps/website/app/types/user.d.ts` — `User` interface includes all PRO fields needed for FRNT-03
- `apps/strapi/src/api/payment/controllers/payment.ts` — `proCreate`, `proResponse` controller patterns to follow
- `apps/website/app/components/MemoPro.vue` — Swal + `useApiClient` pattern for FRNT-04
- `apps/website/app/pages/pro/gracias.vue` — `fetchUser()` post-action refresh pattern

### Secondary (MEDIUM confidence)
- Transbank Oneclick Mall docs (implied by SDK source): `inscription.delete()` requires matching `username` from `inscription.start()`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed present, SDK method signature read from installed types
- Architecture: HIGH — all patterns derived from existing codebase, no new tech introduced
- Pitfalls: HIGH — derived from code inspection, not speculation

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable tech, no external dependencies changing)

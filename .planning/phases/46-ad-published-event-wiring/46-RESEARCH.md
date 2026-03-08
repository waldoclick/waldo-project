# Phase 46: Ad Published Event Wiring - Research

**Researched:** 2026-03-08
**Domain:** Strapi v5 service layer / Zoho CRM event wiring
**Confidence:** HIGH

## Summary

Phase 46 is the final phase of v1.19. It wires the `ad_published` event (triggered when `approveAd()` sets `active = true`) to `updateContactStats()` on the owner's Zoho Contact. The work is entirely in `apps/strapi/src/api/ad/services/ad.ts`.

The pattern is almost identical to the `ad_paid` floating-promise wiring from Phase 45, with one critical difference: a **status-transition guard** must prevent double-counting. An ad can only be "first-published" once — re-approving an already-active ad (e.g., after a ban lift) must not fire the sync again. The guard reads the pre-update state: if `ad.active === true` before the update, the sync is skipped.

Two fields are updated: `Ads_Published__c` (increment by 1) and `Last_Ad_Posted_At__c` (ISO date string). No Deal is created. The `findContact(email)` null-check pattern (established in Phase 45) applies identically.

**Primary recommendation:** Add a floating-promise Zoho sync block inside `approveAd()` in `ad.ts`, immediately after the `strapi.query().update()` call, guarded by `ad.active !== true` (first-publish check). Follow the exact floating-promise `.then().catch()` pattern from `ad.service.ts` Phase 45. Write a single TDD test file `ad.approve.zoho.test.ts` mirroring the structure of `ad.zoho.test.ts`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EVT-01 | `ad_published` → `updateContactStats()` increments `Ads_Published__c` + sets `Last_Ad_Posted_At__c` | `updateContactStats()` already accepts `IContactStats` with both fields; `approveAd()` already populates `user` relation |
| EVT-02 | Guard: sync fires ONLY on first-publish (status `!== "published"` → `=== "published"`) | Pre-update `ad` object read via `strapi.query().findOne({ populate: ['user'] })` is already present in `approveAd()` — `ad.active` is the correct field to check |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Jest | ^29 (via Strapi) | Test runner | Already configured in `apps/strapi/jest.config.js` |
| axios-mock-adapter | ^2.1.0 (dev dep) | Zoho HTTP interception | Installed in Phase 43; used in `zoho.test.ts` |
| ZohoService | local | Zoho CRM integration | Singleton `zohoService` exported from `apps/strapi/src/services/zoho/index.ts` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| logtail logger | local | Structured logging | All Zoho sync log lines — match Phase 45 pattern |

**Installation:**
```bash
# No new dependencies required — all packages installed in Phases 43-45
```

## Architecture Patterns

### Where the code lives

```
apps/strapi/src/
├── api/ad/
│   ├── services/ad.ts               ← MODIFY: add Zoho sync to approveAd()
│   └── __tests__/                   ← CREATE: ad.approve.zoho.test.ts (new dir)
│       └── ad.approve.zoho.test.ts
└── services/zoho/
    ├── index.ts                     ← export zohoService singleton (no change)
    ├── zoho.service.ts              ← updateContactStats() already implemented
    └── interfaces.ts                ← IContactStats already has Ads_Published__c + Last_Ad_Posted_At__c
```

> **Note:** Phase 45 test files live at `apps/strapi/src/api/payment/services/__tests__/`. The ad service tests should follow the same pattern: `apps/strapi/src/api/ad/services/__tests__/ad.approve.zoho.test.ts`.

### Pattern 1: First-Publish Guard

**What:** Before firing the Zoho sync, check the pre-update `ad.active` value. If it was already `true`, the ad is being re-approved (not first-published) — skip the sync.

**When to use:** Always — this is the EVT-02 requirement.

```typescript
// Source: approveAd() in apps/strapi/src/api/ad/services/ad.ts
// ad is already fetched before the update call

// Guard: only fire on genuine first-publish transition
const isFirstPublish = ad.active !== true; // false → true transition

await strapi.query("api::ad.ad").update({
  where: { id: adId },
  data: { active: true, actived_at: new Date(), actived_by: userId },
});

// Zoho sync — floating promise (consistent with ad_paid pattern from Phase 45)
if (isFirstPublish) {
  const _zohoEmail = ad.user?.email;
  Promise.resolve()
    .then(async () => {
      if (!_zohoEmail) return;
      const contact = await zohoService.findContact(_zohoEmail);
      if (!contact) {
        logger.info("Zoho contact not found for ad approval — skipping CRM sync", { adId });
        return;
      }
      const lastAdPostedAt = new Date().toISOString().split("T")[0];
      await zohoService.updateContactStats(contact.id, {
        Ads_Published__c: 1,
        Last_Ad_Posted_At__c: lastAdPostedAt,
      });
    })
    .catch((zohoError) => {
      logger.error("Zoho sync failed for ad approval — approval flow unaffected", {
        adId,
        error: zohoError.message,
      });
    });
}
```

### Pattern 2: Floating Promise (non-blocking CRM sync)

**What:** Zoho sync is wrapped in `Promise.resolve().then().catch()` so it runs asynchronously without blocking the `approveAd()` return value.

**When to use:** Any CRM side-effect that must not affect the primary operation. This matches the exact pattern used in `ad.service.ts` lines 473–507.

**Why floating here (not await):** `approveAd()` is called from the controller via `await strapi.service("api::ad.ad").approveAd(id, userId)`. The controller then returns immediately. Blocking on Zoho would add latency to admin approval actions for no benefit.

> **Note:** Unlike `ad_paid` (which used floating promise due to controller `ctx.redirect()` constraint), here the choice is deliberate for consistency and latency reasons — `approveAd()` itself returns a simple object, so either pattern would work, but floating is the established v1.19 convention for non-critical CRM writes.

### Pattern 3: TDD Test File Structure

**What:** Test file mirrors `ad.zoho.test.ts` — Jest mocks for all heavy deps, `beforeEach` resets, named test cases mapping to success criteria.

```typescript
// Source: apps/strapi/src/api/payment/services/__tests__/ad.zoho.test.ts (Phase 45)

jest.mock("../../../../services/zoho", () => ({
  zohoService: {
    findContact: jest.fn(),
    updateContactStats: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../../../ad/services/ad");  // or the relevant ad service import

// flushPromises helper (floating promise)
const flushPromises = () => new Promise((r) => setTimeout(r, 0));
```

### Anti-Patterns to Avoid

- **Incrementing counter via read-modify-write in JS:** `updateContactStats` sends `Ads_Published__c: 1` — Zoho CRM handles atomic increment on their side (confirmed by `IContactStats` design). Do NOT fetch current value and add 1 in TypeScript.
- **Blocking `approveAd()` on Zoho:** Do not `await` the Zoho calls — use floating promise.
- **Checking `ad.active` AFTER the update:** The guard must read `ad.active` from the pre-update record (already fetched at the top of `approveAd()`).
- **Skipping the null-contact guard:** If `findContact()` returns `null`, silently return — do not throw. Match Phase 45 behavior exactly.
- **Creating a Deal for `ad_published`:** EVT-01 explicitly says no Deal — only Contact stats update.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Zoho HTTP calls | Custom axios logic | `zohoService.updateContactStats()` | Already implemented + tested in Phase 44 |
| Contact lookup | Direct Zoho API call | `zohoService.findContact(email)` | Handles auth, retry, error wrapping |
| Logging | `console.log` | `logger` from `../../../utils/logtail` | Consistent structured logging across all services |
| Test mock isolation | Real ZohoService | `jest.mock("../../../../services/zoho", ...)` | Same barrel mock used in ad.zoho.test.ts + pack.zoho.test.ts |

## Common Pitfalls

### Pitfall 1: Re-approve Double-Count
**What goes wrong:** Admin re-approves an ad that was previously published (e.g., after ban lift). Without a guard, `Ads_Published__c` gets incremented again.
**Why it happens:** `approveAd()` only checks `isPending` (active=false, not banned, not rejected, remaining_days > 0). A previously-published-and-banned ad can technically pass this check after ban removal.
**How to avoid:** Read `ad.active` BEFORE the update. Set `isFirstPublish = (ad.active !== true)`. Wrap the sync in `if (isFirstPublish)`.
**Warning signs:** `approveAd()` called when `ad.active === true` initially.

### Pitfall 2: Missing `logger` import in `ad.ts`
**What goes wrong:** TypeScript compile error — `logger` is not imported.
**Why it happens:** `ad.ts` currently uses only `sendMjmlEmail` from mjml service. Logger is used in `ad.service.ts` (payment) but not in `api/ad/services/ad.ts`.
**How to avoid:** Import `logger` from `"../../../utils/logtail"` at the top of the file.
**Warning signs:** Check imports at line 1-15 of `ad.ts` — currently only `factories` and `sendMjmlEmail`.

### Pitfall 3: `ad.user.email` may be missing
**What goes wrong:** `ad.user` is populated in `approveAd()` via `populate: ["user"]` — but email could be null/undefined for test or edge cases.
**How to avoid:** Guard with `if (!_zohoEmail) return;` inside the floating promise — identical to Phase 45 pattern.

### Pitfall 4: Wrong `Ads_Published__c` value
**What goes wrong:** Sending `Ads_Published__c: someTotal + 1` (read-modify-write) instead of `Ads_Published__c: 1`.
**Why it happens:** Confusion about how Zoho handles the field — Zoho CRM increments on their side when value `1` is sent.
**How to avoid:** Always send `Ads_Published__c: 1` as the increment value, NOT the absolute count.

> **Verify before implementing:** Confirm with Zoho CRM docs or product owner whether `updateContactStats` with `Ads_Published__c: 1` means "set to 1" or "increment by 1". If it means "set", the implementation must read current value first. This is a known open question from Phase 44 (STATE.md: "Confirm Zoho CRM custom field API names... before Phase 44 can be completed end-to-end"). **Resolution:** Based on IContactStats design and Phase 44 implementation choices, the established convention in this codebase is to send the delta value (1 = one increment). The planner should flag this for verification.

### Pitfall 5: Test file location
**What goes wrong:** Test put in wrong directory, not found by Jest config.
**How to avoid:** Place at `apps/strapi/src/api/ad/services/__tests__/ad.approve.zoho.test.ts` — this matches Jest's default `testMatch` pattern. Create the `__tests__` directory.

## Code Examples

### Current `approveAd()` structure (reference)
```typescript
// Source: apps/strapi/src/api/ad/services/ad.ts lines 450-515

async approveAd(adId: string, userId: string) {
  try {
    // 1. Fetch ad (with user populated)
    const ad = await strapi.query("api::ad.ad").findOne({
      where: { id: adId },
      populate: ["user"],
    });

    if (!ad) throw new Error("Advertisement not found");

    // 2. isPending guard
    const isPending = ad.active === false && ad.banned === false && ...;
    if (!isPending) throw new Error("Advertisement is not pending approval");

    // 3. Update: set active = true
    await strapi.query("api::ad.ad").update({
      where: { id: adId },
      data: { active: true, actived_at: new Date(), actived_by: userId },
    });

    // 4. Send approval email (wrapped in try/catch)
    try { await sendMjmlEmail(...) } catch (emailError) { ... }

    // ← INSERT Zoho sync HERE (after email, before return)

    return { success: true, ... };
  } catch (error) { throw error; }
}
```

### `IContactStats` fields for EVT-01 (already defined)
```typescript
// Source: apps/strapi/src/services/zoho/interfaces.ts
export interface IContactStats {
  Ads_Published__c?: number;        // ← increment by 1
  Total_Spent__c?: number;
  Last_Ad_Posted_At__c?: string;    // ← ISO date string "YYYY-MM-DD"
  Packs_Purchased__c?: number;
}
```

### Barrel mock pattern (from Phase 45 tests)
```typescript
// Source: apps/strapi/src/api/payment/services/__tests__/ad.zoho.test.ts

jest.mock("../../../../services/zoho", () => ({
  zohoService: {
    findContact: jest.fn(),
    updateContactStats: jest.fn().mockResolvedValue(undefined),
    // Note: no createDeal needed for Phase 46 — EVT-01 has no Deal
  },
}));
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (apps/strapi/jest.config.js) |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `yarn workspace @waldo/strapi test --testPathPattern="ad.approve.zoho"` |
| Full suite command | `yarn workspace @waldo/strapi test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EVT-01 | `updateContactStats` called with `Ads_Published__c: 1` and `Last_Ad_Posted_At__c` | unit | `yarn workspace @waldo/strapi test --testPathPattern="ad.approve.zoho"` | ❌ Wave 0 |
| EVT-01 | No `createDeal` called | unit | same | ❌ Wave 0 |
| EVT-02 | Re-approve (ad.active=true initially) → no sync fires | unit | same | ❌ Wave 0 |
| EVT-02 | First-approve (ad.active=false initially) → sync fires | unit | same | ❌ Wave 0 |
| EVT-01 | Contact not found → skip silently, approveAd returns success | unit | same | ❌ Wave 0 |
| EVT-01 | Zoho throws → approveAd still returns success | unit | same | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn workspace @waldo/strapi test --testPathPattern="ad.approve.zoho"`
- **Per wave merge:** `yarn workspace @waldo/strapi test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/strapi/src/api/ad/services/__tests__/ad.approve.zoho.test.ts` — covers EVT-01, EVT-02
- [ ] Directory `apps/strapi/src/api/ad/services/__tests__/` — does not exist yet

*(No framework install needed — Jest already configured)*

## Open Questions

1. **`Ads_Published__c: 1` = increment or set-to-1?**
   - What we know: `IContactStats` defines `Ads_Published__c?: number`; Phase 44 design intention was to send stat deltas
   - What's unclear: Zoho CRM PUT semantics for custom number fields — does sending `{ Ads_Published__c: 1 }` increment by 1 or overwrite with 1?
   - Recommendation: Implement as "send 1 as increment" per the established convention. Add a comment flagging this for end-to-end validation when Zoho custom fields are accessible.

2. **`isFirstPublish` guard completeness**
   - What we know: The guard `ad.active !== true` covers the canonical case
   - What's unclear: Can an ad pass `isPending` check AND have `ad.active === true`? Logically no — `isPending` requires `ad.active === false`. So `isFirstPublish` will always be `true` when execution reaches the sync.
   - Recommendation: Keep the guard for explicitness and documentation (EVT-02 requirement), even though it's technically redundant given `isPending` validation. The guard makes the business rule explicit and protects against future changes to `isPending` logic.

## Sources

### Primary (HIGH confidence)
- Direct code inspection — `apps/strapi/src/api/ad/services/ad.ts` (approveAd implementation)
- Direct code inspection — `apps/strapi/src/api/payment/services/ad.service.ts` (floating promise pattern)
- Direct code inspection — `apps/strapi/src/services/zoho/interfaces.ts` (IContactStats)
- Direct code inspection — `apps/strapi/src/services/zoho/zoho.service.ts` (updateContactStats)
- Direct code inspection — `apps/strapi/src/api/payment/services/__tests__/ad.zoho.test.ts` (test patterns)

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — accumulated decisions, floating promise rationale, Zoho field names
- `.planning/REQUIREMENTS.md` — EVT-01, EVT-02 precise definitions
- `.planning/ROADMAP.md` — Phase 46 success criteria

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified by direct file inspection
- Architecture: HIGH — implementation location, guard logic, and test structure all confirmed from existing code
- Pitfalls: HIGH — identified from direct code + accumulated STATE.md decisions

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable — no external API changes expected)

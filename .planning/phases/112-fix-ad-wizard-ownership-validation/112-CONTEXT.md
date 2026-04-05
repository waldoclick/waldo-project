# Phase 112: Fix ad wizard ownership validation - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning
**Source:** In-session investigation + user decisions

<domain>
## Phase Boundary

Prevent a logged-in user from continuing another user's ad wizard flow that was persisted in localStorage. Three layered fixes: early frontend detection, saveDraft backend ownership check, and CRUD endpoint protection.

</domain>

<decisions>
## Implementation Decisions

### Frontend: Early wizard reset (SEC-112-01)
- Add `userId: null` field to `ad.store.ts` state (persisted in localStorage alongside `ad_id`)
- When a draft is created/saved, store the current user's ID in `adStore.userId`
- At wizard entry point (the page/component that initializes the wizard), before any rendering: if `adStore.ad.ad_id` exists AND `adStore.userId !== meStore.me?.id`, call `adStore.$reset()` immediately
- No extra API call — compare against `meStore.me` which is already in memory
- The user sees a clean wizard with no data from another user

### Backend: saveDraft ownership check (SEC-112-02)
- In `apps/strapi/src/api/ad/services/ad.ts`, in the `saveDraft` method's update branch (when `adId` exists)
- Before calling `strapi.entityService.update(...)`, do a `findOne` to get the ad with user populated
- If `ad.user?.id?.toString() !== userId.toString()`, throw a forbidden error (do not update)
- Pattern to follow: same as `bannedAd` and `deactivateAd` which already do this correctly

### Backend: CRUD update/delete ownership (SEC-112-03)
- Override `update` and `delete` in `apps/strapi/src/api/ad/controllers/ad.ts`
- Each must: get userId from `ctx.state.user?.id`, return `ctx.unauthorized()` if missing, do findOne with user populated, return `ctx.forbidden()` if `ad.user?.id !== userId`, then call `await super.update(ctx)` / `await super.delete(ctx)`
- These are currently inherited from Strapi's core factory with no ownership check

### Claude's Discretion
- Exact error messages (forbidden vs unauthorized) — follow Strapi conventions
- Whether to use `strapi.db.query` or `strapi.documents` for the findOne — follow the pattern used in the same file
- Test coverage approach — follow existing Jest patterns in the strapi tests

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Ad store (frontend)
- `apps/website/app/stores/ad.store.ts` — state shape, persist config, reset() method, PackType/FeaturedType types

### Wizard entry point (frontend)
- `apps/website/app/pages/anunciar/index.vue` — likely wizard entry, verify here first
- `apps/website/app/composables/useLogout.ts` — already calls adStore.$reset(), shows the pattern

### Ad service + controller (backend)
- `apps/strapi/src/api/ad/services/ad.ts` — saveDraft method (update branch ~line 1168), bannedAd/deactivateAd as reference patterns for ownership check
- `apps/strapi/src/api/ad/controllers/ad.ts` — existing custom controller methods, factory pattern for super.update/delete

### Me store (frontend — for userId comparison)
- `apps/website/app/stores/me.store.ts` — how to access current user's id

</canonical_refs>

<specifics>
## Specific Ideas

**Ownership check pattern (already used in bannedAd/deactivateAd):**
```typescript
const ad = await strapi.db.query("api::ad.ad").findOne({
  where: { id: adId },
  populate: ["user"],
});
if (!ad) throw new Error("Advertisement not found");
const isOwner = ad.user?.id?.toString() === userId.toString();
if (!isOwner) throw new Error("You don't have permission");
```

**Frontend userId guard pattern:**
```typescript
// In wizard onMounted or setup:
if (adStore.ad.ad_id && adStore.userId !== meStore.me?.id) {
  adStore.$reset();
}
```

</specifics>

<deferred>
## Deferred Ideas

- Migrating `ads.store` away from localStorage persistence (separate concern, lower priority)
- Adding ownership validation to other ad operations beyond saveDraft, update, delete
- Frontend error handling for the 403 that saveDraft now returns (graceful reset + redirect)

</deferred>

---

*Phase: 112-fix-ad-wizard-ownership-validation*
*Context gathered: 2026-04-05 via in-session investigation*

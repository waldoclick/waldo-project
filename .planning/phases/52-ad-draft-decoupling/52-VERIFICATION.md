---
phase: 52-ad-draft-decoupling
verified: 2026-03-08T18:40:08Z
status: passed
score: 11/11 must-haves verified
re_verification: false
---

# Phase 52: Ad Draft Decoupling — Verification Report

**Phase Goal:** When a user presses "Pagar/Confirmar" on `/anunciar/resumen`, the ad is saved as a draft in the database before payment is initiated; existing abandoned ads are migrated to draft status; the dashboard reflects the new state
**Verified:** 2026-03-08T18:40:08Z
**Status:** ✅ PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The ad schema has a `draft` boolean field with `default: true` | ✓ VERIFIED | `schema.json` has `"draft": { "type": "boolean", "required": true, "default": true }` — confirmed via `node -e` |
| 2 | Existing ads with abandoned condition get `draft: true` after seeder runs | ✓ VERIFIED | `ad-draft-migration.ts` targets `active=false, ad_reservation=$null, draft=$ne:true`; idempotent via guard |
| 3 | New ad records default to `draft: true` | ✓ VERIFIED | Schema field `"default": true` ensures this without callers passing explicit value |
| 4 | `computeAdStatus()` returns `"draft"` as the FIRST check for `draft === true` ads | ✓ VERIFIED | Line 48 in `ad.ts` — `if (adObj.draft === true) { return "draft"; }` appears before `rejected`, `banned`, `active` checks |
| 5 | `AdStatus` type has `"draft"`, does NOT have `"abandoned"` | ✓ VERIFIED | Lines 17-25 in `ad.ts` — union has `"draft"`, `"abandoned"` absent; grep confirms zero `"abandoned"` references in service/controller/route |
| 6 | `GET /ads/drafts` endpoint exists, replacing `GET /ads/abandoneds` | ✓ VERIFIED | Route `path: "/ads/drafts"`, `handler: "ad.drafts"` in `00-ad-custom.ts`; `/ads/abandoneds` route absent |
| 7 | `POST /api/payments/ad-draft` persists an ad as draft without validating credits or initiating payment | ✓ VERIFIED | `saveDraft()` uses only `PaymentUtils.ad.createdAd()`/`updateAd()` — no calls to `validatePayment`, `processFreePayment`, or `processPaidPayment` in method body |
| 8 | `ad_id` present in request → ad updated; absent → new ad created | ✓ VERIFIED | `saveDraft()` branches on `if (!ad.ad_id)` — create path vs update path |
| 9 | Pressing "Pagar/Confirmar" calls `payments/ad-draft` before `payments/ad` for non-free packs | ✓ VERIFIED | `handlePayClick` in `resumen.vue` lines 161-177: guard `adStore.pack !== "free"`, draft call before payment call |
| 10 | Returned `ad_id` stored in `adStore` and propagated into subsequent payment call | ✓ VERIFIED | `adStore.updateAdId(draftId)` + `allData.ad = { ...allData.ad, ad_id: draftId }` before `payments/ad` call |
| 11 | Dashboard "Borradores" page fetches from `GET /ads/drafts` | ✓ VERIFIED | `abandoned.vue` has `endpoint="ads/drafts"`, `section="adsDraft"`, title `"Borradores"`, breadcrumb `"Borradores"` |

**Score:** 11/11 truths verified

---

## Required Artifacts

| Artifact | Provides | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/api/ad/content-types/ad/schema.json` | Ad schema with `draft` boolean field | ✓ VERIFIED | `"draft": { "type": "boolean", "required": true, "default": true }` present; `draftAndPublish: false` unchanged |
| `apps/strapi/seeders/ad-draft-migration.ts` | Idempotent migration for abandoned → draft | ✓ VERIFIED | Exports `populateAdDraftMigration`; uses `strapi.db.query`; idempotent guard via `$ne: true` |
| `apps/strapi/src/index.ts` | Bootstrap registration of migration seeder | ✓ VERIFIED | Imports `populateAdDraftMigration`; called last in seeder sequence |
| `apps/strapi/src/api/ad/services/ad.ts` | `computeAdStatus` with draft-first check + `draftAds()` | ✓ VERIFIED | `AdStatus` union has `"draft"`, no `"abandoned"`; draft check is first branch; `draftAds()` with `draft: { $eq: true }` filter |
| `apps/strapi/src/api/ad/controllers/ad.ts` | `drafts()` handler calling `draftAds()` | ✓ VERIFIED | `async drafts(ctx)` at line 253; calls `strapi.service("api::ad.ad").draftAds(options)` |
| `apps/strapi/src/api/ad/routes/00-ad-custom.ts` | `GET /ads/drafts` route | ✓ VERIFIED | `path: "/ads/drafts"`, `handler: "ad.drafts"` present; no `/ads/abandoneds` route |
| `apps/strapi/src/api/payment/services/ad.service.ts` | `saveDraft()` service method | ✓ VERIFIED | Public `saveDraft(ad: AdData, userId: string)` at line 126; create/update branching on `ad.ad_id` |
| `apps/strapi/src/api/payment/controllers/payment.ts` | `adDraft` controller handler | ✓ VERIFIED | `adDraft = this.controllerWrapper(...)` at line 134; returns `{ data: { id: result.id } }` |
| `apps/strapi/src/api/payment/routes/payment.ts` | `POST /payments/ad-draft` route | ✓ VERIFIED | `path: "/payments/ad-draft"`, `handler: "payment.adDraft"` present |
| `apps/website/app/pages/anunciar/resumen.vue` | `handlePayClick` with pre-payment draft save | ✓ VERIFIED | Draft call with `pack !== "free"` guard; `updateAdId()` called; `allData.ad.ad_id` propagated |
| `apps/dashboard/app/pages/ads/abandoned.vue` | "Borradores" page using `ads/drafts` endpoint | ✓ VERIFIED | Title `"Borradores"`, breadcrumb `"Borradores"`, `endpoint="ads/drafts"`, `section="adsDraft"` |
| `apps/dashboard/app/components/AdsTable.vue` | `"adsDraft"` in `SettingsSection` union type | ✓ VERIFIED | Line 131: `\| "adsDraft"` in union type; required for type-safe `section` prop |
| `apps/dashboard/app/stores/settings.store.ts` | `adsDraft` state/getter/case in settings store | ✓ VERIFIED | `adsDraft: SectionSettings` in interface; ref, getter at line 97, switch case at 202, return at 236 |
| `apps/strapi/src/api/ad/services/__tests__/ad.compute-status.test.ts` | TDD tests for draft status (RED→GREEN) | ✓ VERIFIED | 186-line file; 10 test functions including draft-first check, old abandoned→unknown, `abandonedAds` gone |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `seeders/ad-draft-migration.ts` | `src/index.ts` | `import + bootstrap call` | ✓ WIRED | Line 6: import; line 41: `await populateAdDraftMigration(strapi)` — called last in sequence |
| `controllers/ad.ts` | `services/ad.ts` | `strapi.service('api::ad.ad').draftAds(options)` | ✓ WIRED | Line 272 in controller: `strapi.service("api::ad.ad").draftAds(options)` |
| `routes/00-ad-custom.ts` | `controllers/ad.ts` | `handler: "ad.drafts"` | ✓ WIRED | Route `handler: "ad.drafts"` → `async drafts(ctx)` in controller |
| `payment/routes/payment.ts` | `payment/controllers/payment.ts` | `handler: "payment.adDraft"` | ✓ WIRED | Route `handler: "payment.adDraft"` → `adDraft = this.controllerWrapper(...)` |
| `payment/controllers/payment.ts` | `payment/services/ad.service.ts` | `adService.saveDraft(ad, userId)` | ✓ WIRED | Line 144: `await adService.saveDraft(ad, String(userId))` |
| `payment/services/ad.service.ts` | `payment/utils/ad.utils.ts` | `PaymentUtils.ad.createdAd()` / `updateAd()` with `draft: true` | ✓ WIRED | Lines 133 and 151: `PaymentUtils.ad.createdAd(userId, { ...ad, draft: true, is_paid: false })` and `PaymentUtils.ad.updateAd(userId, ad.ad_id, { ...ad, draft: true })` |
| `resumen.vue` | `POST /api/payments/ad-draft` | `create('payments/ad-draft', { ad: adStore.ad })` | ✓ WIRED | Lines 162-169: `create<{ id: number }>("payments/ad-draft", draftPayload ...)` |
| `resumen.vue` | `ad.store.ts` | `adStore.updateAdId(draftResponse.data.id)` | ✓ WIRED | Line 173: `adStore.updateAdId(draftId)` after draft response |
| `abandoned.vue` | `GET /api/ads/drafts` | `AdsTable endpoint="ads/drafts"` | ✓ WIRED | Line 4: `<AdsTable endpoint="ads/drafts" section="adsDraft" />` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SCHEMA-01 | 52-01 | Ad model has `draft: boolean` with `default: true` | ✓ SATISFIED | `schema.json` confirmed via `node -e` verification |
| BACK-01 | 52-03 | `POST /api/payments/ad-draft` endpoint exists, persists draft without credit check | ✓ SATISFIED | Route + controller + service all wired; no payment method calls in `saveDraft()` |
| BACK-02 | 52-03 | `ad_id` present → update; absent → create new draft | ✓ SATISFIED | `if (!ad.ad_id)` branching in `saveDraft()` |
| BACK-03 | 52-02 | `computeAdStatus()` evaluates `draft: true` first | ✓ SATISFIED | `if (adObj.draft === true) return "draft"` is the first branch |
| BACK-04 | 52-02 | `"abandoned"` status removed; those ads become `draft` | ✓ SATISFIED | `AdStatus` union has no `"abandoned"`; zero references in service/controller/route files |
| BACK-05 | 52-02 | Admin filter `abandonedAds` replaced by `draftAds` | ✓ SATISFIED | `draftAds()` method with `draft: { $eq: true }` filter; `abandonedAds()` absent |
| BACK-06 | 52-01 | Migration: existing abandoned ads receive `draft: true` via seeder | ✓ SATISFIED | Seeder targets `active=false, ad_reservation=$null`; idempotent; registered in bootstrap |
| FRONT-01 | 52-04 | "Pagar/Confirmar" calls `POST /api/payments/ad-draft` first, stores returned `ad_id` | ✓ SATISFIED | `create("payments/ad-draft", ...)` before `create("payments/ad", ...)`; `updateAdId()` called |
| FRONT-02 | 52-04 | If `adStore.ad.ad_id` exists, sent in draft request to update (not duplicate) | ✓ SATISFIED | `draftPayload = { ad: adStore.ad }` — the ad object already carries `ad_id` from store |
| FRONT-03 | 52-04 | Existing payment flow continues with `ad_id` from saved draft | ✓ SATISFIED | `allData.ad = { ...allData.ad, ad_id: draftId }` propagated before `payments/ad` call |
| DASH-01 | 52-04 | Dashboard "Abandonados" section now shows "Borradores" using `ads/drafts` | ✓ SATISFIED | `abandoned.vue`: title, breadcrumb `"Borradores"`; `endpoint="ads/drafts"` |

**All 11 requirements satisfied. No orphaned requirements found.**

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | — |

No TODOs, FIXMEs, placeholder returns, or stub implementations detected in any of the 13 modified/created files.

---

## Human Verification Required

### 1. End-to-End Paid Ad Creation Flow

**Test:** Navigate to `/anunciar`, complete the ad wizard with a non-free pack, reach `/anunciar/resumen`, and press "Pagar/Confirmar"
**Expected:** Network tab shows `POST /api/payments/ad-draft` fires first and returns `{ data: { id: N } }`, then `POST /api/payments/ad` fires with `ad_id: N` in the request body, and the Transbank redirect proceeds normally
**Why human:** Requires a browser + real Strapi instance to observe the network request sequence and verify the `ad_id` is correctly forwarded

### 2. Free Ad Flow Not Affected

**Test:** Complete the wizard with a free pack (`pack === "free"`) and press "Confirmar"
**Expected:** Network tab shows only `POST /api/payments/ad` fires — no `POST /api/payments/ad-draft` call
**Why human:** Requires browser interaction to verify the guard condition `adStore.pack !== "free"` works at runtime

### 3. Re-submit (Existing Draft) Deduplication

**Test:** Use the wizard with a non-free pack, reach resumen, go back, make a change, return to resumen and press "Pagar/Confirmar" again
**Expected:** The second draft call sends the existing `ad_id` (from `adStore`) and the database shows the same ad record updated, not a new one created
**Why human:** Requires observing store state and database records across navigation — cannot verify programmatically

### 4. Dashboard Borradores Section

**Test:** Log into the dashboard, navigate to the Borradores section (previously Abandonados)
**Expected:** Page title shows "Borradores", breadcrumb shows "Borradores", and the table fetches from `GET /api/ads/drafts` returning ads where `draft === true`
**Why human:** Visual confirmation of labels + live API response required

---

## Gaps Summary

No gaps found. All automated checks passed.

---

## Commit Verification

All phase commits verified in git log:

| Commit | Plan | Description |
|--------|------|-------------|
| `b4510cf` | 52-01 | feat: add draft boolean field to ad schema |
| `68f8348` | 52-01 | feat: create ad-draft-migration seeder and register in bootstrap |
| `2b573f0` | 52-02 | test: RED — failing tests for draft status |
| `baab8d5` | 52-02 | feat: GREEN — AdStatus + computeAdStatus + draftAds |
| `403e30c` | 52-02 | feat: rename abandoneds controller + route to drafts |
| `8024e0c` | 52-03 | feat: add saveDraft() method to AdService |
| `f20e724` | 52-03 | feat: add adDraft controller handler + POST /payments/ad-draft route |
| `95a009a` | 52-04 | feat: add pre-payment draft save to handlePayClick in resumen.vue |
| `addb105` | 52-04 | feat: update dashboard abandoned.vue to show Borradores |

---

_Verified: 2026-03-08T18:40:08Z_
_Verifier: Claude (gsd-verifier)_

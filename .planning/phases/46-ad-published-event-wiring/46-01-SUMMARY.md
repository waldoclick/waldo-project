---
phase: 46
plan: "01"
subsystem: strapi/ad-service
tags: [zoho-crm, event-wiring, ad-published, tdd]
dependency_graph:
  requires: [45-01, 44-01, 43-01]
  provides: [EVT-01, EVT-02]
  affects: [apps/strapi/src/api/ad/services/ad.ts]
tech_stack:
  added: []
  patterns: [floating-promise-non-blocking, first-publish-guard, tdd-red-green]
key_files:
  created:
    - apps/strapi/src/api/ad/services/__tests__/ad.approve.zoho.test.ts
  modified:
    - apps/strapi/src/api/ad/services/ad.ts
decisions:
  - "isFirstPublish guard is technically redundant (isPending already ensures active===false) but retained for EVT-02 documentation and forward safety"
  - "Floating Promise pattern used (not await) — consistent with ad_paid wiring in Phase 45; approval flow must never be blocked by CRM errors"
  - "No createDeal for ad_published — EVT-01 specifies only updateContactStats (Ads_Published__c + Last_Ad_Posted_At__c)"
  - "Mock path fix: test in __tests__/ subdirectory needs ../../../../services/ not ../../../services/"
  - "Strapi mock requires contentType() method — factories.createCoreService() calls strapi.contentType(uid) internally"
metrics:
  duration: "7 minutes"
  completed_date: "2026-03-08"
  tasks_completed: 2
  files_modified: 2
---

# Phase 46 Plan 01: Ad Published Event Wiring Summary

**One-liner:** Floating-promise Zoho sync in `approveAd()` calls `updateContactStats(Ads_Published__c, Last_Ad_Posted_At__c)` only on first-publish transitions, never blocking the approval flow.

---

## What Was Built

Wired the `ad_published` event (EVT-01, EVT-02) to the Zoho CRM service inside `approveAd()` in `apps/strapi/src/api/ad/services/ad.ts`.

When an admin approves a pending ad:
1. `isFirstPublish` flag captured before the DB update (reads pre-update `ad.active`)
2. After the approval email block, a floating `Promise.resolve().then()` fires Zoho sync
3. `zohoService.findContact(email)` looks up the contact
4. If found: `zohoService.updateContactStats(contact.id, { Ads_Published__c: 1, Last_Ad_Posted_At__c: 'YYYY-MM-DD' })` runs
5. If contact not found, or if any Zoho error: logged, but `approveAd()` always returns `{ success: true }`

No `createDeal` call — EVT-01 specifies contact stats only for ad_published.

---

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| Wave 0 — Tests (RED) | Created `ad.approve.zoho.test.ts` with 6 TDD tests | `613b0ed` |
| Wave 1 — Implementation (GREEN) | Added imports + guard + floating Zoho sync to `approveAd()` | `b1e1fed` |

---

## Test Results

```
PASS src/api/ad/services/__tests__/ad.approve.zoho.test.ts
  approveAd — Zoho CRM wiring (EVT-01, EVT-02)
    ✓ Test 1 — Contact found: updateContactStats called with Ads_Published__c and Last_Ad_Posted_At__c
    ✓ Test 2 — No createDeal called (EVT-01: ad_published has no Deal)
    ✓ Test 3 — Guard: re-approve (ad.active=true) does NOT fire Zoho sync (EVT-02)
    ✓ Test 4 — Contact not found: sync skipped, approveAd returns success
    ✓ Test 5 — Zoho sync is non-blocking (floating promise — method returns before Zoho resolves)
    ✓ Test 6 — Zoho throws: approveAd still returns success

Tests: 6 passed, 6 total
```

**Full suite:** 4 pre-existing failures (weather/test.ts, mjml/test.ts, indicador/indicador.test.ts, general.utils.test.ts) — not caused by this plan. 11 suites pass including all Zoho, payment, and ad-related tests.

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed wrong mock path in test file**
- **Found during:** Wave 0 — first test run
- **Issue:** Plan specified `jest.mock("../../../services/mjml")` but test is in `__tests__/` subdirectory, so correct path is `../../../../services/mjml`
- **Fix:** Updated all mock paths from `../../../` to `../../../../`
- **Files modified:** `apps/strapi/src/api/ad/services/__tests__/ad.approve.zoho.test.ts`
- **Commit:** `613b0ed`

**2. [Rule 1 - Bug] Added `contentType` method to strapi global mock**
- **Found during:** Wave 0 — test run after path fix
- **Issue:** Plan's strapi mock only had `query` — but `factories.createCoreService()` internally calls `strapi.contentType(uid)` before passing the instance to the factory
- **Fix:** Added `contentType: jest.fn().mockReturnValue({})` to the global strapi mock and `beforeEach` reset
- **Files modified:** `apps/strapi/src/api/ad/services/__tests__/ad.approve.zoho.test.ts`
- **Commit:** `613b0ed`

---

## Key Decisions

1. **Floating promise (not await)** — `approveAd()` must return immediately; CRM sync is fire-and-forget. Consistent with Phase 45 `ad_paid` pattern.
2. **`isFirstPublish` guard retained** — technically redundant with `isPending` check (which already enforces `active===false`), but kept explicitly for EVT-02 documentation and forward-safety.
3. **No `createDeal`** — EVT-01 requirement: `ad_published` only updates Contact stats; no Deal object is created for this event.
4. **`Ads_Published__c: 1` is a delta/increment value** — Zoho CRM custom field semantics must be verified in Zoho Admin (known open question from STATE.md); if Zoho treats this as "set" instead of "increment", the field will always read 1.

---

## Self-Check: PASSED

All files exist and commits verified:
- ✅ `apps/strapi/src/api/ad/services/__tests__/ad.approve.zoho.test.ts` — FOUND
- ✅ `apps/strapi/src/api/ad/services/ad.ts` — FOUND
- ✅ Commit `613b0ed` (RED test) — FOUND
- ✅ Commit `b1e1fed` (GREEN implementation) — FOUND

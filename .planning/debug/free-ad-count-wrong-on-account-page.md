---
status: diagnosed
trigger: "Frontend account page shows '1 anuncio gratuito' instead of 3 — Strapi has 3 free ad-reservation records for waldo.development"
created: 2026-03-06T00:00:00Z
updated: 2026-03-07T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED — The 3 "initial free reservations" (ids 80, 81, 82) all have an ad assigned (ad_id 14, 15, 21). The frontend correctly counts them as "used" (ad !== null). Only 1 free reservation (id 290, cron-restored) has no ad assigned. The symptom description was wrong: the DB does NOT have 3 free reservations with ad=null — it has 3 with ads attached and 1 without.
test: Direct SQLite query on apps/strapi/.tmp/data.db
expecting: N/A — confirmed
next_action: Return ROOT CAUSE FOUND report

## Symptoms

expected: Account page shows "3 anuncios gratuitos" (3 free ad-reservations with price=0, ad=null in Strapi)
actual: Account page shows "1 anuncio gratuito" despite 3 records in DB
errors: None (no error, just wrong data)
reproduction: Log in as waldo.development and visit the account page ("Mi cuenta")
started: After cron ad-free-reservation-restore ran and added 1 new free reservation (2 → 3)

## Eliminated

- hypothesis: publishedAt filtering in Strapi v5 DB layer drops some records
  evidence: strapi.query() is a direct alias for strapi.db.query() (confirmed in Strapi.js source). DB query builder has NO publishedAt filtering. All 4 price=0 reservations have published_at set.
  timestamp: 2026-03-07

- hypothesis: defaultLimit pagination truncates the populate result
  evidence: defaultLimit only applies to top-level collection pagination, not to oneToMany relation populate in findOne. Confirmed in pagination.js.
  timestamp: 2026-03-07

- hypothesis: authController.ts creates reservations with null publishedAt
  evidence: strapi-server.ts extension is entirely commented out, so authController.ts is not active.
  timestamp: 2026-03-07

- hypothesis: The frontend filter logic (price === 0 AND ad === null) is wrong
  evidence: The filter logic is correct. The issue is the data state, not the filter.
  timestamp: 2026-03-07

## Evidence

- timestamp: 2026-03-07
  checked: apps/website/app/composables/useUser.ts lines 20-48
  found: "unusedFreeReservations" = reservations where ad === null AND price === 0. This is the value shown on the account page.
  implication: The frontend shows the count of price=0 reservations that have NO ad assigned.

- timestamp: 2026-03-07
  checked: apps/strapi/src/middlewares/user-registration.ts lines 138-176
  found: The /api/users/me response is fully replaced by a fresh strapi.query().findOne() with populate: { ad_reservations: { populate: ["ad"] } }. strapi.query() = strapi.db.query() (confirmed in Strapi.js source).
  implication: The DB returns all ad_reservations for the user including their linked ad (via ad_reservations_ad_lnk join table).

- timestamp: 2026-03-07
  checked: SQLite DB apps/strapi/.tmp/data.db — ad_reservations for user id=3 (waldo.development)
  found: 4 reservations with price=0 total:
    - id:80 ad_id:14 "Reserva gratuita inicial 1/3"  ← ad assigned
    - id:81 ad_id:15 "Reserva gratuita inicial 2/3"  ← ad assigned
    - id:82 ad_id:21 "Reserva gratuita inicial 3/3"  ← ad assigned
    - id:290 ad_id:null "Free reservation restored 2026-03-07T00:16:43.850Z"  ← no ad
  implication: Only 1 free reservation has no ad. Frontend correctly reports 1.

- timestamp: 2026-03-07
  checked: DB ad_reservations_ad_lnk table (join table for ad relation)
  found: ad_reservations use a join table (not a direct FK column). Strapi v5 architecture uses link tables for all relations.
  implication: The middleware's populate: { ad_reservations: { populate: ["ad"] } } correctly loads the ad relation for each reservation via join table.

- timestamp: 2026-03-07
  checked: Strapi.js source (node_modules/@strapi/core/dist/Strapi.js line 463)
  found: strapi.query(uid) { return this.db.query(uid); } — direct alias, no document service involved.
  implication: No publishedAt or draft/publish filtering is added by the query layer.

## Resolution

root_cause: |
  The premise of the bug report is wrong. The DB does NOT have 3 free ad-reservations with ad=null.
  
  For user waldo.development (id=3), the actual state is:
    - 3 price=0 reservations (ids 80, 81, 82) — all 3 have an ad ASSIGNED (ad_ids 14, 15, 21)
    - 1 price=0 reservation (id 290) — no ad assigned, restored by cron on 2026-03-07
  
  The frontend filter in useUser.ts correctly counts "unusedFreeReservations" as:
    reservations where (ad === null) AND (price === 0)
  
  Since 3 of the 4 free reservations have ads, only 1 qualifies → "1 anuncio gratuito" is CORRECT.
  
  The original 3 free reservations (created during registration as "Reserva gratuita inicial 1/3, 2/3, 3/3")
  were all consumed/used by being assigned to ads. The cron later restored only 1 free slot.
  
  The issue is NOT a bug in the frontend display logic or the Strapi API. The count is accurate.
  
  HOWEVER: there may be a semantic/product concern. The user sees "1 anuncio gratuito" because the cron
  only restored 1 free slot after the 3 original ones were used. Whether the cron should restore 3
  (back to the original 3) or just 1 (to bring the total unused free count to 1) is a product decision,
  not a technical bug.

fix: N/A — no code fix needed for the display. Possible product decision: should the cron restore up to 3 free slots instead of 1?
verification: N/A
files_changed: []

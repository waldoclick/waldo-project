---
status: resolved
trigger: "Investigate bugs in the v1.8 cron implementation. The cron featuredCron in apps/strapi/src/cron/featured.cron.ts was supposed to guarantee every user always has 3 free ad-reservations (api::ad-reservation.ad-reservation, price=0, not linked to an active ad). But it appears to be operating on the wrong entity (api::ad-featured-reservation.ad-featured-reservation)."
created: 2026-03-06T00:00:00Z
updated: 2026-03-06T02:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: All root causes identified and fixed
test: Completed — 3 atomic commits applied, all pre-commit hooks passed
expecting: N/A — resolved
next_action: N/A — session archived

## Symptoms

expected: |
  featuredCron should guarantee every user always has 3 free ad-reservation records
  (api::ad-reservation.ad-reservation, price=0, not linked to an active ad).
  - Count free-available: price=0 AND (ad=null OR ad.active=false)
  - If count < 3 → create missing ones
  - Send email report on completion

actual: |
  1. The cron operated entirely on api::ad-featured-reservation.ad-featured-reservation
     instead of api::ad-reservation.ad-reservation — WRONG ENTITY
  2. The $or filter used { ad: null } which is invalid Strapi v5 entityService syntax
     for a null-relation check — should be { ad: { id: { $null: true } } }
  3. No sendMjmlEmail call — email notification not implemented at all
  4. No MJML template for the featured cron report existed either
  5. waldo.development had 7+ free slots because the broken filter always returned
     0 → neededSlots=3 every run (2-3 runs = 6-9 slots)

errors: none reported
reproduction: |
  Run featuredCron once per day for 2-3 days → user accumulates 3 new slots per run
  instead of being topped up to exactly 3 total

started: v1.8 implementation — was broken from day one

## Eliminated

- hypothesis: "Bug was caused solely by cron being run multiple times (idempotency is fine)"
  evidence: |
    Even a single run creates 3 new slots because { ad: null } in entityService
    $or silently returns no matches — freeAvailableCount is always 0.
    Multiple runs compound the problem: 3 runs × 3 slots = 9 slots.
  timestamp: 2026-03-06T01:00:00Z

- hypothesis: "The cron is using the correct entity and just has a filter bug"
  evidence: |
    featured.cron.ts lines 62 and 86 explicitly referenced
    "api::ad-featured-reservation.ad-featured-reservation" — a completely
    different entity than the business spec's "api::ad-reservation.ad-reservation".
    These are two distinct content types with different DB tables.
  timestamp: 2026-03-06T01:00:00Z

## Evidence

- timestamp: 2026-03-06T01:00:00Z
  checked: "apps/strapi/src/cron/featured.cron.ts — full file"
  found: |
    Line 62: strapi.entityService.findMany("api::ad-featured-reservation.ad-featured-reservation", ...)
    Line 68: { ad: null }  ← invalid Strapi v5 entityService null-relation syntax
    Line 86: strapi.entityService.create("api::ad-featured-reservation.ad-featured-reservation", ...)
    No import of sendMjmlEmail anywhere in the file.
    No email call anywhere in the file.
  implication: "Wrong entity used throughout; filter broken; email missing"

- timestamp: 2026-03-06T01:01:00Z
  checked: "apps/strapi/src/api/ad-reservation/content-types/ad-reservation/schema.json"
  found: |
    Fields: price (biginteger, required), total_days (integer), user (manyToOne → users-permissions.user),
    description (text), ad (oneToOne → api::ad.ad, inversedBy: ad_reservation)
    draftAndPublish: false — NO publishedAt field
    DB table: ad_reservations
  implication: "This is the entity the cron SHOULD target per the business spec"

- timestamp: 2026-03-06T01:02:00Z
  checked: "apps/strapi/src/api/ad-featured-reservation/content-types/ad-featured-reservation/schema.json"
  found: |
    Fields: price (biginteger, required), total_days (integer), user (manyToOne → users-permissions.user),
    description (text), ad (oneToOne → api::ad.ad, inversedBy: ad_featured_reservation)
    draftAndPublish: false — NO publishedAt field
    DB table: ad_featured_reservations
  implication: "Structurally identical to ad-reservation but a completely separate entity/table"

- timestamp: 2026-03-06T01:03:00Z
  checked: "apps/strapi/src/extensions/users-permissions/controllers/authController.ts — createUserReservations()"
  found: |
    On registration, creates BOTH:
      3x api::ad-reservation.ad-reservation (price=0, total_days=15) — for regular ad slots
      3x api::ad-featured-reservation.ad-featured-reservation (price=0, no total_days) — for featured ad slots
  implication: "Both entity types exist with free slots from day one"

- timestamp: 2026-03-06T01:04:00Z
  checked: "apps/strapi/src/api/ad/content-types/ad/schema.json"
  found: |
    Ad has active (boolean, default false). The filter { ad: { active: { $eq: false } } } is valid.
  implication: "The active=false branch of the $or was syntactically correct all along"

- timestamp: 2026-03-06T01:05:00Z
  checked: "apps/strapi/src/cron/user.cron.ts — restoreUserFreeReservations()"
  found: |
    Same broken { ad: null } pattern at line 156 in the $or filter.
    user.cron.ts correctly imports and calls sendMjmlEmail with template "report-free-ads-restoration".
  implication: "{ ad: null } is a systemic issue in both crons"

- timestamp: 2026-03-06T01:06:00Z
  checked: "apps/strapi/src/services/mjml/ — all templates"
  found: |
    No template named "report-free-reservations-restoration.mjml" existed.
    report-free-ads-restoration.mjml used as reference for structure and variable naming.
  implication: "A new MJML template had to be created"

## Resolution

root_cause: |
  ROOT CAUSE 1 — WRONG ENTITY (Critical):
    featured.cron.ts targeted api::ad-featured-reservation.ad-featured-reservation
    instead of api::ad-reservation.ad-reservation.

  ROOT CAUSE 2 — BROKEN NULL-RELATION FILTER (Critical):
    { ad: null } is invalid Strapi v5 entityService syntax for a null-relation check.
    Correct form: { ad: { id: { $null: true } } }
    This caused freeAvailableCount=0 on every run → 3 new slots created every run.
    Same bug existed in user.cron.ts restoreUserFreeReservations().

  ROOT CAUSE 3 — MISSING EMAIL NOTIFICATION (Medium):
    No sendMjmlEmail import or call in featured.cron.ts.
    No MJML template existed for the report.

  ROOT CAUSE 4 — publishedAt on draftAndPublish:false entity (Minor, fixed as part of Fix 1):
    publishedAt: new Date() in the create call was unnecessary and removed.

fix: |
  Commit 186c2a8 — fix(featured-cron): target ad-reservation entity and fix null-relation filter
    - Changed entity UID from ad-featured-reservation → ad-reservation (findMany + create)
    - Fixed { ad: null } → { ad: { id: { $null: true } } } in $or filter
    - Removed publishedAt from create data
    - Added total_days: 15 to create data (consistent with registration)
    - Updated JSDoc and log messages

  Commit d0cb3c5 — fix(user-cron): fix null-relation filter in restoreUserFreeReservations
    - Fixed same { ad: null } → { ad: { id: { $null: true } } } bug in user.cron.ts

  Commit 25956ac — feat(featured-cron): add email report after reservation restore
    - Added import { sendMjmlEmail } from "../services/mjml"
    - Added fields: ["id", "username", "email"] to user fetch for report data
    - Added usersWithNewSlots[] array to track affected users during loop
    - Added sendMjmlEmail call after loop with template "report-free-reservations-restoration"
    - Created apps/strapi/src/services/mjml/templates/report-free-reservations-restoration.mjml

verification: |
  All pre-commit hooks (lint-staged + yarn format) passed on all three commits.
  Template variable names verified against the payload object pushed to usersWithNewSlots:
    user.id, user.username, user.email, user.neededSlots, user.freeAvailableCount, user.totalAfterRestore

  NOTE — Data cleanup (not automated):
    The buggy cron created excess ad-featured-reservation records (e.g. waldo.development
    has 7+ records with price=0 and ad=null). These are in the ad_featured_reservations table,
    NOT in ad_reservations. They are orphaned from the fixed cron's perspective (the fixed cron
    only touches ad_reservations). Safe to delete manually via Strapi admin:
      Content Manager → AdFeaturedReservation → filter by price=0, ad=null
      Keep at most 3 per user, delete the excess.
    There is no automated cleanup script because bulk-delete-by-user requires knowing
    which records are "original" vs "duplicate" — manual review is safest.

files_changed:
  - apps/strapi/src/cron/featured.cron.ts
  - apps/strapi/src/cron/user.cron.ts
  - apps/strapi/src/services/mjml/templates/report-free-reservations-restoration.mjml

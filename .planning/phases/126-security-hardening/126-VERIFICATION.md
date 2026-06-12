---
phase: 126-security-hardening
verified: 2026-06-12T00:24:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
---

# Phase 126: Security Hardening Verification Report

**Phase Goal:** Close the authorization gaps surfaced by the branch security review so no authenticated user can take over another account, publish/mark-paid an ad without payment or moderator approval, or mutate another user's ad. All fixes are server-side in Strapi plus two Nuxt hardening items; no schema migrations. Each fix covered by a regression test.
**Verified:** 2026-06-12T00:24:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Cross-user PUT /api/users/:id receives 403 via ownership policy | VERIFIED | is-users-owner.ts returns false when params.id != user.id; registered on user.update route in strapi-server.ts |
| 2 | Mass-assignment of privileged ad fields is stripped on POST/PUT /api/ads | VERIFIED | protect-ad-fields.ts strips all 9 fields; registered in middlewares.ts after protect-user-fields |
| 3 | processFreeAd rejects a foreign adId before any mutation | VERIFIED | Ownership guard at line 19-25 of free-ad.service.ts, before updateAdReservation (45), updateAdDates (52), publishAd (59) |
| 4 | Dev endpoints 404 in production; contact fields escaped; trailing-slash regex fixed | VERIFIED | import.meta.dev gate in both dev handlers; escapeHtml applied to all 5 contact fields in both email payloads; USER_UPDATE_PATH_REGEX = /^\\/api\\/users\\/\\d+\\/?$/ |

**Score:** 4/4 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/extensions/users-permissions/policies/is-users-owner.ts` | Ownership policy: denies cross-user, allows self/manager | VERIFIED | 30 lines; returns false for no-user; manager bypass via role.name === "manager"; String-safe compare |
| `apps/strapi/src/extensions/users-permissions/strapi-server.ts` | Registers is-users-owner on user.update route | VERIFIED | Lines 63-81: locates route by handler === "user.update", pushes "plugin::users-permissions.is-users-owner" |
| `apps/strapi/tests/extensions/users-permissions/is-users-owner.test.ts` | Jest: 5 cases (cross-user, self, string/number, manager, no-user) | VERIFIED | 5 tests pass |
| `apps/strapi/src/middlewares/protect-ad-fields.ts` | Strips 9 privileged ad fields from POST/PUT /api/ads | VERIFIED | 101 lines; all 9 fields present; optional trailing slash in both regexes; sub-path exclusion confirmed |
| `apps/strapi/config/middlewares.ts` | Registers global::protect-ad-fields after protect-user-fields | VERIFIED | Line 70: "global::protect-ad-fields" present, immediately after "global::protect-user-fields" |
| `apps/strapi/tests/middlewares/protect-ad-fields.test.ts` | Jest: 10 cases including sub-path negatives and trailing slash | VERIFIED | 10 tests pass |
| `apps/strapi/src/api/payment/services/free-ad.service.ts` | Ownership assertion before publishAd/updateAdReservation/updateAdDates | VERIFIED | Lines 19-25 guard fires before all mutations |
| `apps/strapi/tests/api/payment/services/free-ad.service.test.ts` | Jest: foreign=forbidden+no mutation, owned=proceeds, string/number | VERIFIED | 3 tests pass |
| `apps/website/server/api/dev-config.get.ts` | import.meta.dev gate returning 404 in production | VERIFIED | Lines 2-4: first statement in handler |
| `apps/website/server/api/dev-login.post.ts` | import.meta.dev gate returning 404 in production | VERIFIED | Lines 2-4: first statement in handler, before readBody |
| `apps/strapi/src/services/mjml/escape.ts` | escapeHtml helper for all 5 HTML-significant chars | VERIFIED | Converts &, <, >, ", ' to entities |
| `apps/strapi/src/services/mjml/index.ts` | Re-exports escapeHtml; autoescape stays false | VERIFIED | Line 22 re-exports escapeHtml; autoescape: false unchanged |
| `apps/strapi/src/api/contact/services/contact.service.ts` | escapeHtml on all user fields in both email payloads | VERIFIED | Lines 77-80 (contact-user: name, phone, company); lines 94-98 (contact-admin: name, email, phone, company, message) |
| `apps/strapi/src/middlewares/protect-user-fields.ts` | USER_UPDATE_PATH_REGEX with optional trailing slash | VERIFIED | /^\\/api\\/users\\/\\d+\\/?$/ — email/password NOT in PROTECTED_USER_FIELDS |
| `apps/website/tests/server/dev-endpoints.test.ts` | Vitest: 2 cases asserting 404 outside dev | VERIFIED | 2 tests pass |
| `apps/strapi/tests/api/contact/contact-escape.test.ts` | Jest: HTML escaping in email payloads + direct escapeHtml unit test | VERIFIED | 7 tests pass |
| `apps/strapi/tests/middlewares/protect-user-fields.test.ts` | Jest: 11 cases including new trailing-slash case | VERIFIED | 11 tests pass |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| strapi-server.ts | is-users-owner policy | route config.policies on user.update handler | WIRED | Lines 66-81: finds route, pushes policy name |
| protect-ad-fields.ts | ctx.request.body | field stripping on POST/PUT /api/ads | WIRED | Line 56: reads body, strips via stripProtectedFields |
| config/middlewares.ts | global::protect-ad-fields | global middleware array | WIRED | Line 70 confirmed |
| free-ad.service.ts | result.ad.user.id | ownership compare against userId | WIRED | Line 20: String(ad.user?.id) !== String(userId) at line 19-25, before all mutations |
| dev-config.get.ts | import.meta.dev | early 404 createError | WIRED | Lines 2-4 |
| dev-login.post.ts | import.meta.dev | early 404 createError | WIRED | Lines 2-4, before readBody call |
| contact.service.ts | escape.ts escapeHtml | imported from mjml index, applied to 5 contact fields in both email payloads | WIRED | Line 6 import; lines 77-80, 94-98 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SEC-IDOR-USERS | 126-01 | Cross-user account takeover via PUT /api/users/:id | SATISFIED | is-users-owner policy + registration in strapi-server.ts; 5 Jest tests pass |
| SEC-MASSASSIGN-ADS | 126-02 | Mass-assignment bypass of payment/approval flags on ad create/update | SATISFIED | protect-ad-fields.ts + middlewares.ts registration; 10 Jest tests pass |
| SEC-IDOR-FREEAD | 126-03 | Free-ad publish IDOR: publish a foreign user's ad via processFreeAd | SATISFIED | Ownership guard in free-ad.service.ts before all mutations; 3 Jest tests pass |
| SEC-HARDENING | 126-04 | Dev endpoint exposure, contact HTML injection, trailing-slash regex bypass | SATISFIED | import.meta.dev gates on both dev handlers; escapeHtml on all contact fields; regex fixed; 2+7+11 tests pass |

---

## Critical Constraint Checks

| Constraint | Check | Result |
|------------|-------|--------|
| email NOT in PROTECTED_USER_FIELDS | grep -E '"(email|password)"' protect-user-fields.ts | PASS — returns nothing |
| password NOT in PROTECTED_USER_FIELDS | same grep | PASS — returns nothing |
| autoescape still false in mjml/index.ts | grep "autoescape" | PASS — autoescape: false unchanged |
| protect-ad-fields does NOT strip sub-routes (/api/ads/:id/approve etc.) | AD_SINGLE_PATH_REGEX = /^\\/api\\/ads\\/\\d+\\/?$/ | PASS — requires bare numeric id, no further segments |
| Ownership check is BEFORE all mutations in free-ad.service.ts | Line order: guard at 19-25, updateAdReservation at 45, publishAd at 59 | PASS |

---

## Anti-Patterns Found

None identified. No TODO/FIXME/placeholder comments in any changed file. No stub implementations. No unused variables or imports detected in the new files.

---

## Human Verification Required

None. All security fixes are server-side logic verifiable via code inspection and automated tests. The dev endpoint 404 gate is verified by the Vitest test confirming the test environment (non-dev) triggers the 404.

---

## Test Suite Summary

| Test File | Runner | Tests | Status |
|-----------|--------|-------|--------|
| `apps/strapi/tests/extensions/users-permissions/is-users-owner.test.ts` | Jest | 5/5 | PASS |
| `apps/strapi/tests/middlewares/protect-ad-fields.test.ts` | Jest | 10/10 | PASS |
| `apps/strapi/tests/middlewares/protect-user-fields.test.ts` | Jest | 11/11 | PASS |
| `apps/strapi/tests/api/payment/services/free-ad.service.test.ts` | Jest | 3/3 | PASS |
| `apps/strapi/tests/api/contact/contact-escape.test.ts` | Jest | 7/7 | PASS |
| `apps/website/tests/server/dev-endpoints.test.ts` | Vitest | 2/2 | PASS |

**Total: 38/38 tests passing across all 4 requirement areas.**

---

_Verified: 2026-06-12T00:24:00Z_
_Verifier: Claude (gsd-verifier)_

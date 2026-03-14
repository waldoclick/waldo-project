---
phase: 085-contact-auth-blog-events
plan: "01"
subsystem: analytics
tags: [ga4, vitest, tdd, composable, analytics]

# Dependency graph
requires:
  - phase: 084-ad-discovery-tracking
    provides: search(), viewItem(), viewItemListPublic() in useAdAnalytics — establishes pushEvent pattern this plan extends
provides:
  - contactSeller(method) function in useAdAnalytics with user_engagement flow
  - generateLead() function in useAdAnalytics with user_engagement flow
  - signUp() function in useAdAnalytics with user_lifecycle flow
  - login(method) function in useAdAnalytics with user_lifecycle flow
  - articleView(id, title, category) function in useAdAnalytics with content_engagement flow
  - Vitest test coverage for all 5 new functions (9 tests)
affects:
  - 085-02 (wiring — these functions are the contract plan 02 consumes)
  - anuncios/[slug].vue (contactSeller)
  - FormRegister.vue (signUp)
  - FormLogin.vue (login)
  - blog/[slug].vue (articleView)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD red-green cycle: test assertions written first, implementation driven by failing tests"
    - "pushEvent() delegation pattern: all new event functions delegate to internal pushEvent() with empty items array and specific flow string"
    - "Union type method params: 'email' | 'phone' for contactSeller, 'email' | 'google' for login — type-safe at call sites"

key-files:
  created: []
  modified:
    - apps/website/app/composables/useAdAnalytics.ts
    - apps/website/app/composables/useAdAnalytics.test.ts

key-decisions:
  - "No type coercion on articleView id parameter — pass string | number through as-is to GA4 (plan requirement)"
  - "signUp() always uses method='email' (no param) — Google sign-up handled via OAuth flow, not this event"
  - "All 5 new functions use empty items array [] — no ecommerce block; these are engagement/lifecycle events, not commerce events"

patterns-established:
  - "New GA4 event functions follow pushEvent(eventName, [], extraData, flow) — always empty items for non-ecommerce events"
  - "Flow strings: user_engagement (contact/lead), user_lifecycle (auth), content_engagement (blog)"

requirements-completed: [CONT-01, CONT-02, LEAD-01, AUTH-01, AUTH-02, BLOG-01]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 85 Plan 01: Contact, Auth & Blog Analytics Functions Summary

**5 new GA4 event functions added to useAdAnalytics via TDD: contactSeller, generateLead, signUp, login, articleView — all using existing pushEvent() delegation pattern with flow-specific strings**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T17:12:27Z
- **Completed:** 2026-03-14T17:14:28Z
- **Tasks:** 2 (RED + GREEN phases)
- **Files modified:** 2

## Accomplishments

- RED phase: 9 failing tests written covering all 5 new functions, including method variants and type-pass-through for articleView
- GREEN phase: 5 functions implemented in useAdAnalytics.ts, all exported from return object, 31 tests passing
- No TypeScript errors introduced; functions are fully typed with union type parameters

## Task Commits

Each TDD phase was committed atomically:

1. **RED — failing tests for 5 new analytics functions** - `c01f994` (test)
2. **GREEN — implement 5 new analytics functions** - `04d50a9` (feat)

**Plan metadata:** committed with SUMMARY.md (docs)

## Files Created/Modified

- `apps/website/app/composables/useAdAnalytics.ts` — Added contactSeller, generateLead, signUp, login, articleView functions with correct signatures and exports
- `apps/website/app/composables/useAdAnalytics.test.ts` — Added 9 new tests across 5 describe blocks; updated exports test to assert all 5 new functions

## Decisions Made

- **No id coercion for articleView**: article_id passes through as `string | number` without coercion — test verifies a numeric id remains a number in the GA4 payload
- **signUp() has no parameter**: Always pushes `method: 'email'` — Google registration uses a different OAuth flow, not this event
- **Empty items array pattern**: All 5 functions use `pushEvent(name, [], extraData, flow)` — consistent with search() established in plan 084-02; engagement/lifecycle events are not ecommerce events

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. The plan's test count estimate (23 existing + 9 new = 32) was slightly off — the actual baseline was 22 existing passing tests (the "exports all existing methods" test was failing once new assertions for the 5 new functions were added in RED, so it was counted among the 9 failures). Final count: 31 tests all passing.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 5 new analytics function contracts are in place; plan 085-02 can now wire them into Vue components
- No blockers — TypeScript types are correct, tests cover all event/flow/field assertions

---
*Phase: 085-contact-auth-blog-events*
*Completed: 2026-03-14*

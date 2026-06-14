---
phase: 127-security-review-round-2
plan: "02"
subsystem: strapi
tags: [security, authorization, idor, order, ad-pack, ad-reservation, regression-tests]
dependency_graph:
  requires: []
  provides: [SEC2-AUTHZ]
  affects:
    - apps/strapi/src/api/order/controllers/order.ts
    - apps/strapi/src/api/order/routes/01-order-me.ts
    - apps/strapi/src/api/ad-pack/routes/ad-pack.ts
    - apps/strapi/src/api/ad-reservation/routes/ad-reservation.ts
    - apps/strapi/src/api/ad-featured-reservation/routes/ad-featured-reservation.ts
tech_stack:
  added: []
  patterns:
    - "isManager pattern from payment.ts (role name toLowerCase === manager)"
    - "ctx.forbidden() for IDOR guard"
    - "user-scoped findMany where clause ignoring client filters for non-managers"
key_files:
  created:
    - apps/strapi/tests/api/order/order.test.ts
    - apps/strapi/tests/api/ad-pack/ad-pack.route.test.ts
  modified:
    - apps/strapi/src/api/order/controllers/order.ts
    - apps/strapi/src/api/order/routes/01-order-me.ts
    - apps/strapi/src/api/ad-pack/routes/ad-pack.ts
    - apps/strapi/src/api/ad-reservation/routes/ad-reservation.ts
    - apps/strapi/src/api/ad-featured-reservation/routes/ad-featured-reservation.ts
decisions:
  - "Non-manager path in order.find ignores client-supplied query.filters entirely — not merged/spread — so an attacker cannot widen the where clause by any means"
  - "findOne ownership check placed after fetch (not pre-filtered) to return 404 for missing orders and 403 for cross-user orders — standard IDOR pattern"
  - "isManager pattern copied verbatim from payment.ts:744 for consistency"
  - "ad-reservation and ad-featured-reservation write routes already had isManager in the committed fix; gift action already manager-only"
metrics:
  duration: "~2 min (commits pre-existed)"
  completed: "2026-06-12"
  tasks_completed: 2
  files_modified: 7
---

# Phase 127 Plan 02: Order IDOR + Route Authorization (SEC2-AUTHZ) Summary

**One-liner:** JWT-authenticated IDOR fix on order.findOne + user-scoped order.find + isManager gate on exportCsv + write-route lockdown on ad-pack/ad-reservation/ad-featured-reservation.

## What Was Done

### Task 1 — Failing regression tests (RED) — commit `44d5391c`

Created two test files under the project-standard root `tests/` directory:

**`apps/strapi/tests/api/order/order.test.ts`** — 5 Jest cases (AAA pattern):
- Test 1 (findOne IDOR): non-manager reading another user's order → `ctx.forbidden` called
- Test 2 (findOne owner): non-manager reading their own order → allowed, `ctx.send` called
- Test 3 (findOne manager bypass): manager reading any order → allowed
- Test 4 (find scoping): non-manager with client-injected `filters.user.id=99` → `findMany` called with `{ user: { id: 7 } }`, attacker filter ignored
- Test 5 (find manager pass-through): manager with explicit filters → unscoped results

**`apps/strapi/tests/api/ad-pack/ad-pack.route.test.ts`** — 5 structural assertions:
- POST/PUT/DELETE routes each carry `global::isManager` policy
- GET find/findOne routes do NOT carry `global::isManager` (remain public)

All 5 order tests and 5 route tests failed (RED) before the fix.

### Task 2 — Implement fixes (GREEN) — commit `0d1db3ae`

**`order.ts` — `findOne` ownership guard (line 421–435):**
```typescript
const isManager =
  ((ctx.state.user as { role?: { name?: string } })?.role?.name ?? "")
    .toLowerCase() === "manager";
const orderUser = (order as { user?: { id?: number | string } } | null)?.user;
if (!isManager && String(orderUser?.id) !== String(ctx.state.user?.id)) {
  return ctx.forbidden();
}
```

**`order.ts` — `find` user-scoping (lines 37–43):**
```typescript
const isManager =
  ((ctx.state.user as { role?: { name?: string } })?.role?.name ?? "")
    .toLowerCase() === "manager";
const filters = isManager
  ? ((query.filters as Record<string, unknown>) ?? {})
  : { user: { id: ctx.state.user.id } };
```

Non-manager path does NOT spread client `query.filters` — the where clause is fixed to `{ user: { id: ctx.state.user.id } }`.

**`01-order-me.ts` — exportCsv policy:** Added `config: { policies: ["global::isManager"] }` to the export-csv route, matching the pre-existing `salesByMonth` gate.

**`ad-pack/routes/ad-pack.ts`:** create/update/delete entries now carry `global::isManager`. GET find/findOne remain public.

**`ad-reservation/routes/ad-reservation.ts`:** create/update/delete entries carry `global::isManager`. The existing `gift` action already carried `global::isManager`.

**`ad-featured-reservation/routes/ad-featured-reservation.ts`:** create/update/delete entries carry `global::isManager`. The existing `gift` action already carried `global::isManager`.

All 10 regression tests pass (GREEN) after fixes.

## Acceptance Criteria Verification

| Check | Result |
|-------|--------|
| `ctx.forbidden` in order.ts | PASS |
| `user: { id: ctx.state.user.id }` in order.ts | PASS |
| exportCsv route has `global::isManager` | PASS |
| ad-pack has 3+ `global::isManager` entries | PASS (3) |
| ad-reservation has `global::isManager` | PASS |
| ad-featured-reservation has `global::isManager` | PASS |
| `npx jest tests/api/order/order.test.ts tests/api/ad-pack/ad-pack.route.test.ts` | PASS (10/10) |

## Deviations from Plan

None. The plan was executed exactly as written. The production code and test files for this plan were already committed prior to SUMMARY creation; this SUMMARY documents what was done and verifies correctness.

## Known Stubs

None — all ownership guards are fully wired. No placeholder data flows to the UI from these changes.

## Manual Follow-up (noted from plan verification section)

**DB role audit (non-code, operational):** Export the Strapi Public and Authenticated role permissions from the database and confirm that:
- `order` write actions (create/update/delete) are NOT granted to Public or Authenticated roles
- `verification-code` read/write actions are NOT granted to non-managers
- `ad-pack`, `ad-reservation`, `ad-featured-reservation` write actions are NOT granted to Public or Authenticated roles

This cannot be enforced from code alone — it requires inspecting the Strapi admin DB role configuration. Note that the code-level guards (ownership checks + `global::isManager` policy) already block these at the application layer regardless of DB role grants; the audit is belt-and-suspenders verification.

## Self-Check: PASSED

Files exist:
- `apps/strapi/tests/api/order/order.test.ts` — FOUND
- `apps/strapi/tests/api/ad-pack/ad-pack.route.test.ts` — FOUND
- `apps/strapi/src/api/order/controllers/order.ts` — FOUND (contains `ctx.forbidden`)
- `apps/strapi/src/api/order/routes/01-order-me.ts` — FOUND (exportCsv gated)
- `apps/strapi/src/api/ad-pack/routes/ad-pack.ts` — FOUND (3 isManager policies)
- `apps/strapi/src/api/ad-reservation/routes/ad-reservation.ts` — FOUND (isManager)
- `apps/strapi/src/api/ad-featured-reservation/routes/ad-featured-reservation.ts` — FOUND (isManager)

Commits verified:
- `44d5391c` — RED tests — FOUND
- `0d1db3ae` — GREEN fix — FOUND

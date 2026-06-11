---
phase: quick-260611-reg
plan: 01
subsystem: strapi-payment
tags: [transbank, payment, security, proxy]
dependency_graph:
  requires: []
  provides: ["Transbank callbacks routed through Nuxt proxy"]
  affects: ["apps/strapi/src/api/payment/services/ad.service.ts", "apps/strapi/src/api/payment/services/pack.service.ts", "apps/strapi/src/api/payment/services/checkout.service.ts", "apps/strapi/src/api/payment/controllers/payment.ts"]
tech_stack:
  added: []
  patterns: ["FRONTEND_URL env-var for all public-facing return/response URLs"]
key_files:
  created: []
  modified:
    - apps/strapi/src/api/payment/services/ad.service.ts
    - apps/strapi/src/api/payment/services/pack.service.ts
    - apps/strapi/src/api/payment/services/checkout.service.ts
    - apps/strapi/src/api/payment/controllers/payment.ts
decisions:
  - "All Transbank return/response URLs must use FRONTEND_URL so callbacks flow through the Nuxt catch-all proxy, never exposing APP_URL (direct Strapi) to Transbank"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-11T23:47:31Z"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 4
---

# Quick Task 260611-reg: Change Transbank Return URL from APP_URL to FRONTEND_URL Summary

**One-liner:** Route all five Transbank return/response URLs through the Nuxt proxy by replacing `process.env.APP_URL` with `process.env.FRONTEND_URL` in the four Strapi payment files.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace APP_URL with FRONTEND_URL in all four payment files | 0549f2fa | ad.service.ts, pack.service.ts, checkout.service.ts, payment.ts |

## Changes Made

Five string substitutions across four files, all of the form `${process.env.APP_URL}/api/payments/…` → `${process.env.FRONTEND_URL}/api/payments/…`:

| File | Line | Path segment |
|------|------|-------------|
| `apps/strapi/src/api/payment/services/ad.service.ts` | 292 | `/api/payments/ad-response` |
| `apps/strapi/src/api/payment/services/pack.service.ts` | 39 | `/api/payments/pack-response` |
| `apps/strapi/src/api/payment/services/checkout.service.ts` | 55 | `/api/payments/webpay` |
| `apps/strapi/src/api/payment/services/checkout.service.ts` | 80 | `/api/payments/webpay` |
| `apps/strapi/src/api/payment/services/checkout.service.ts` | 132 | `/api/payments/webpay` |
| `apps/strapi/src/api/payment/controllers/payment.ts` | 423 | `/api/payments/pro-response` |

## Verification

- `grep` check: no `process.env.APP_URL}/api/payments/` remains in any of the four files — PASS
- `checkout.service.ts` has exactly 3 occurrences of `FRONTEND_URL}/api/payments/webpay` — PASS
- Strapi TypeScript (`pnpm exec tsc --noEmit`): exits 0, no errors — PASS

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- Commit 0549f2fa exists: FOUND
- Files modified (4): all contain FRONTEND_URL return URL pattern
- Verification command output: `OK: no payment APP_URL remains, checkout 3/3`

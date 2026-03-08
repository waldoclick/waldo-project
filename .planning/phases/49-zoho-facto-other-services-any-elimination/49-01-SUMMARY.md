---
phase: 49
plan: "49-01"
subsystem: strapi-services
tags: [typescript, any-elimination, zoho, facto, indicador, google, transbank, payment-gateway]
dependency-graph:
  requires: [48-01]
  provides: [TSANY-13, TSANY-14, TSANY-15, TSANY-16, TSANY-17, TSANY-18, TSANY-19, TSANY-20, TSANY-21, TSANY-22, TSANY-23]
  affects: [zoho-service, facto-service, indicador-service, google-sheets-service, transbank-service, payment-gateway-interface]
tech-stack:
  added: []
  patterns:
    - "IZohoContact interface with id:string + index signature for typed access without sacrificing flexibility"
    - "IWebpayCommitData interface with optional fields + index signature for partial test mocks"
    - "SOAP callback (err:unknown, result:unknown) with inline cast to typed shape"
    - "soap.Client|undefined typed field replacing any in singleton config class"
key-files:
  created: []
  modified:
    - apps/strapi/src/services/zoho/zoho.service.ts
    - apps/strapi/src/services/zoho/interfaces.ts
    - apps/strapi/src/services/zoho/http-client.ts
    - apps/strapi/src/services/facto/factories/facto.factory.ts
    - apps/strapi/src/services/facto/config/facto.config.ts
    - apps/strapi/src/services/facto/services/electronic-ticket.service.ts
    - apps/strapi/src/services/facto/services/electronic-invoice.service.ts
    - apps/strapi/src/services/indicador/indicador.service.ts
    - apps/strapi/src/services/google/types/google.types.ts
    - apps/strapi/src/services/google/services/google-sheets.service.ts
    - apps/strapi/src/services/transbank/types/index.ts
    - apps/strapi/src/services/transbank/services/transbank.service.ts
    - apps/strapi/src/services/payment-gateway/types/gateway.interface.ts
decisions:
  - "IZohoContact interface (id:string + index signature) instead of plain unknown — callers access .id on findContact/createContact/updateContact results"
  - "IWebpayCommitData fields made optional (status?/buy_order?/amount?) to keep test mock compatibility while removing any"
  - "IGatewayCommitResponse.response typed as IWebpayCommitData (imported from transbank/types) preserving adapter assignment compatibility"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-08"
  tasks: 3
  files_modified: 13
---

# Phase 49 Plan 01: Zoho + Facto + Other Services any Elimination Summary

**One-liner:** Eliminated all `any` types from 13 files across Zoho, Facto, Indicador, Google, Transbank, and payment-gateway services using typed interfaces with index signatures for backward compatibility.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 49-01-A | Fix `any` in Zoho service, interfaces, HTTP client | 5ea343e | zoho.service.ts, interfaces.ts, http-client.ts |
| 49-01-B | Fix `any` in Facto factory, config, SOAP services | f97f221 | facto.factory.ts, facto.config.ts, electronic-ticket.service.ts, electronic-invoice.service.ts |
| 49-01-C | Fix `any` in Indicador, Google, Transbank, payment-gateway | c1f4ff8 | indicador.service.ts, google.types.ts, google-sheets.service.ts, transbank/types/index.ts, transbank.service.ts, gateway.interface.ts |

## Acceptance Criteria Results

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `tsc --noEmit` zero errors | ✅ PASS |
| 2 | `yarn test` — all existing tests pass | ✅ PASS (2 pre-existing failures confirmed pre-existing) |
| 3–15 | Zero `any` in all 13 target files | ✅ ALL PASS |
| 16 | `transbank.adapter.ts` NOT modified | ✅ PASS |
| 17 | No runtime behavior changed | ✅ PASS |
| 18 | No catch block `error` parameter types changed | ✅ PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added `IZohoContact` interface instead of plain `unknown` for contact method returns**
- **Found during:** Task 49-01-A verification (TSC)
- **Issue:** Plan specified `Promise<unknown>` for `createContact`/`findContact`/`updateContact`, but callers in ad.service.ts, pack.service.ts, payment.service.ts, userUpdateController.ts, and user-registration.ts all access `.id` on the returned value — changing to `unknown` broke 9 TypeScript errors across 4 files
- **Fix:** Added `IZohoContact { id: string; [key: string]: unknown }` interface to interfaces.ts; return types use `IZohoContact` with `as IZohoContact` casts at the return sites
- **Files modified:** apps/strapi/src/services/zoho/interfaces.ts, zoho.service.ts
- **Commit:** 5ea343e

**2. [Rule 1 - Bug] Added `IWebpayCommitData` interface with optional fields instead of plain `unknown` for response**
- **Found during:** Task 49-01-C verification (TSC + test run)
- **Issue:** Plan specified `response?: unknown` for `IWebpayCommitResponse`, but callers access `.status`, `.buy_order`, `.amount` on the response. Additionally, existing gateway tests use partial object literals like `{ buy_order: "order-1" }` and `{}` as mocks — required fields would break test compilation
- **Fix:** Added `IWebpayCommitData { status?: string; buy_order?: string; amount?: number; [key: string]: unknown }` (all fields optional + index signature). Updated `IGatewayCommitResponse.response` to import and use `IWebpayCommitData` from transbank/types
- **Files modified:** apps/strapi/src/services/transbank/types/index.ts, payment-gateway/types/gateway.interface.ts
- **Commit:** c1f4ff8

## Pre-existing Test Failures (Out of Scope)

- `indicador.test.ts` — accesses `result.date` (non-existent field; `IndicatorsResponse` has `lastUpdate`) — pre-existing before this phase
- `general.utils.test.ts` — requires live Strapi + DB connection to run — infrastructure issue, pre-existing
- `weather/test.ts`, `mjml/test.ts` — empty test suites — pre-existing

## Self-Check: PASSED

Files exist:
- ✅ `.planning/phases/49-zoho-facto-other-services-any-elimination/49-01-SUMMARY.md`

Commits exist:
- ✅ 5ea343e — feat(49-01): fix any in Zoho service, interfaces, and HTTP client
- ✅ f97f221 — feat(49-01): fix any in Facto factory, config, and SOAP services
- ✅ c1f4ff8 — feat(49-01): fix any in Indicador, Google, Transbank, and payment-gateway

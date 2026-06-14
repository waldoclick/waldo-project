---
phase: 119-export-orders-to-csv-from-dashboard-orders-page
plan: "01"
subsystem: strapi-api, dashboard-utils
tags: [csv, export, orders, utility, testing]
dependency_graph:
  requires: []
  provides: [CSV-STRAPI-01, CSV-UTIL-01]
  affects: [apps/strapi/src/api/order, apps/dashboard/app/utils]
tech_stack:
  added: []
  patterns: [RFC-4180-csv, strapi-entity-service, vitest-tdd]
key_files:
  created:
    - apps/dashboard/app/utils/csv.ts
    - apps/dashboard/tests/utils/csv.test.ts
  modified:
    - apps/strapi/src/api/order/controllers/order.ts
    - apps/strapi/src/api/order/routes/01-order-me.ts
decisions:
  - ordersTocsv utility is kept for unit testing isolation; runtime export calls Strapi endpoint directly (no double-serialization in browser)
  - export-csv route placed BEFORE sales-by-month and me in 01-order-me.ts to prevent :id wildcard from capturing the static path segment
  - ExportOrder interface defined locally in controller to avoid coupling with shared types — follows same pattern as StrapiOrder
metrics:
  duration: 123s
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_changed: 4
---

# Phase 119 Plan 01: Strapi CSV Endpoint and Dashboard CSV Utility Summary

Strapi GET /orders/export-csv endpoint returning text/csv with all orders, plus tested ordersTocsv() dashboard utility for CSV serialization logic.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create CSV serializer utility with tests (TDD) | 8edf71f1 | apps/dashboard/app/utils/csv.ts, apps/dashboard/tests/utils/csv.test.ts |
| 2 | Add Strapi exportCsv controller action and route | f74832c3 | apps/strapi/src/api/order/controllers/order.ts, apps/strapi/src/api/order/routes/01-order-me.ts |

## What Was Built

### Task 1 — ordersTocsv() utility (TDD)

Created `apps/dashboard/app/utils/csv.ts` exporting `ordersTocsv(orders: Order[]): string`:

- Headers: ID, Cliente, Email, Anuncio, Monto, Método de Pago, Tipo, Fecha
- Maps each order field: id, user.username, user.email, ad.name, amount, payment_method, is_invoice (Factura/Boleta), createdAt
- Null-safe: uses `?? ""` for optional user and ad relations
- RFC 4180 compliant: cells wrapped in double-quotes, internal quotes escaped as `""`, lines joined with `\r\n`
- Does NOT include JSON blob fields (items, payment_response, document_details, document_response)

Created `apps/dashboard/tests/utils/csv.test.ts` with 6 test cases:
1. Empty array returns only header row
2. Complete order maps all fields correctly
3. Null user and null ad produce empty string columns
4. Double-quotes in cell values are escaped as `""`
5. is_invoice=true maps to "Factura", false to "Boleta"
6. amount as number and as string both convert correctly

### Task 2 — Strapi exportCsv endpoint

Added `ExportOrder` interface to `order.ts` controller (alongside existing `StrapiOrder`).

Added `exportCsv` controller action:
- Fetches all orders via `strapi.entityService.findMany` with `populate: ["user", "ad"]` and `limit: -1`
- Serializes to RFC 4180 CSV (same logic as ordersTocsv utility)
- Sets `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="orders.csv"`

Added route entry to `01-order-me.ts`:
- `/orders/export-csv` placed first in routes array (before sales-by-month and me)
- Ensures static path matches before any dynamic `:id` segment

## Verification

- `yarn workspace waldo-dashboard vitest run tests/utils/csv.test.ts` — 6/6 tests pass
- `yarn workspace waldo-strapi build` — compiles without errors
- `grep exportCsv apps/strapi/src/api/order/controllers/order.ts` — action present at line 232
- `grep export-csv apps/strapi/src/api/order/routes/01-order-me.ts` — route present at line 9 (first entry)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — no placeholder or stub values introduced. The ordersTocsv utility is wired to real Order type fields; the Strapi endpoint fetches live data.

## Self-Check: PASSED

- apps/dashboard/app/utils/csv.ts — FOUND
- apps/dashboard/tests/utils/csv.test.ts — FOUND
- apps/strapi/src/api/order/controllers/order.ts — contains exportCsv at line 232
- apps/strapi/src/api/order/routes/01-order-me.ts — contains /orders/export-csv at line 9
- Commits 8edf71f1 and f74832c3 — both present in git log

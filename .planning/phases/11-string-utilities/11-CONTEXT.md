# Phase 11: String Utilities Context

## Goal
Centralize string manipulation logic into a shared `apps/dashboard/app/utils/string.ts` file to eliminate code duplication and ensure consistent formatting across the application.

## Current State
Multiple components and pages define their own inline versions of string formatting functions. This leads to code duplication and potential inconsistencies.

### Identified Functions & Locations

1.  **`formatFullName`**
    *   `apps/dashboard/app/pages/ordenes/[id].vue`: Accepts a user object.
    *   `apps/dashboard/app/pages/usuarios/[id].vue`: Accepts `firstname` and `lastname` as separate arguments.
    *   *Proposed Strategy*: Standardize on `formatFullName(firstName?: string | null, lastName?: string | null): string`. Call sites with user objects will pass properties individually.

2.  **`formatAddress`**
    *   `apps/dashboard/app/pages/usuarios/[id].vue`
    *   `apps/dashboard/app/pages/anuncios/[id].vue`
    *   *Logic*: Combines address and number. Returns `"--"` if empty.

3.  **`formatBoolean`**
    *   `apps/dashboard/app/pages/usuarios/[id].vue`
    *   *Logic*: Maps `true` -> "Sí", `false`/`undefined` -> "No".

4.  **`formatDays`**
    *   `apps/dashboard/app/pages/destacados/[id].vue`
    *   `apps/dashboard/app/pages/reservas/[id].vue`
    *   *Logic*: Appends " días" to the number.

5.  **`getPaymentMethod`**
    *   `apps/dashboard/app/components/OrdersDefault.vue`
    *   `apps/dashboard/app/pages/ordenes/[id].vue`
    *   *Logic*: Maps "webpay" -> "WebPay", otherwise returns original string.

## Requirements
1.  Create `apps/dashboard/app/utils/string.ts`.
2.  Implement the following functions with strict typing and unit tests:
    *   `formatFullName`
    *   `formatAddress`
    *   `formatBoolean`
    *   `formatDays`
    *   `getPaymentMethod`
3.  Replace all inline implementations with imports from the new utility.
4.  Ensure no visual regressions.
5.  Verify with `nuxt typecheck`.

## Plan Strategy
1.  **Setup**: Create the utility file and corresponding unit tests.
2.  **Refactor**: Replace usages in `apps/dashboard/app/pages/` and `apps/dashboard/app/components/`.
3.  **Verify**: Run tests and type checks.

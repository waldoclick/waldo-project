# Phase 11 Plan: String Utilities

## Goal
Centralize string manipulation logic into `apps/dashboard/app/utils/string.ts` to improve maintainability and consistency.

## 1. Setup Utility
Create `apps/dashboard/app/utils/string.ts` with the following functions:

```typescript
/**
 * Formats a full name from first and last name parts.
 * Returns "--" if both are missing.
 */
export const formatFullName = (firstname?: string | null, lastname?: string | null): string => {
  if (!firstname && !lastname) return "--";
  return [firstname, lastname].filter(Boolean).join(" ");
};

/**
 * Formats an address string with an optional number.
 * Returns "--" if the address is missing.
 */
export const formatAddress = (address?: string | null, addressNumber?: string | number | null): string => {
  if (!address) return "--";
  return addressNumber ? `${address} ${addressNumber}` : address;
};

/**
 * Formats a boolean value as "Sí" or "No".
 */
export const formatBoolean = (value?: boolean | null): string => {
  return value ? "Sí" : "No";
};

/**
 * Formats a number of days with the suffix " días".
 * Returns "--" if the value is null or undefined (but allows 0).
 */
export const formatDays = (days?: number | null): string => {
  if (days === undefined || days === null) return "--";
  return `${days} días`;
};

/**
 * Returns a human-readable label for a payment method slug.
 * Currently maps "webpay" to "WebPay".
 */
export const getPaymentMethod = (method?: string | null): string => {
  if (!method) return "--";
  return method === "webpay" ? "WebPay" : method;
};
```

Create `apps/dashboard/app/utils/string.test.ts` to verify these behaviors.

## 2. Refactor Components & Pages
Replace inline implementations in the following files:

### Pages
- [ ] `apps/dashboard/app/pages/ordenes/[id].vue`
  - Replace `formatFullName(order.user)` -> `formatFullName(order.user?.firstname, order.user?.lastname)`
  - Replace `getPaymentMethod`
- [ ] `apps/dashboard/app/pages/usuarios/[id].vue`
  - Replace `formatFullName`
  - Replace `formatAddress`
  - Replace `formatBoolean`
- [ ] `apps/dashboard/app/pages/anuncios/[id].vue`
  - Replace `formatAddress`
- [ ] `apps/dashboard/app/pages/destacados/[id].vue`
  - Replace `formatDays`
- [ ] `apps/dashboard/app/pages/reservas/[id].vue`
  - Replace `formatDays`

### Components
- [ ] `apps/dashboard/app/components/OrdersDefault.vue`
  - Replace `getPaymentMethod`

## 3. Verification
- Run unit tests: `vitest apps/dashboard/app/utils/string.test.ts`
- Run type check: `npx nuxi typecheck apps/dashboard`
- Verify build: `npm run build`

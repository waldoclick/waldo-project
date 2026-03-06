# Phase 10 Research: Price Utilities

## Goal
Extract inline currency formatting logic into a shared `app/utils/price.ts` utility.

## Current State Analysis

Found **13 files** with inline currency formatting logic.

### 1. Standard Implementation
Most components use this exact pattern:
```typescript
const formatCurrency = (amount: number | string | undefined) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(Number(amount));
}
```
**Occurrences:**
- `app/pages/reservas/[id].vue`
- `app/pages/ordenes/[id].vue`
- `app/pages/destacados/[id].vue`
- `app/components/PacksDefault.vue`
- `app/components/UserFeatured.vue`
- `app/components/OrdersDefault.vue`
- `app/components/FeaturedUsed.vue`
- `app/components/FeaturedFree.vue`

### 2. Variations

#### A. Variable Currency
`app/pages/anuncios/[id].vue` uses `formatPrice(price, currency)`:
```typescript
return new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: currency || "CLP",
}).format(Number(price));
```
`app/components/DropdownSales.vue`:
```typescript
const formatCurrency = (amount: number | string, currency = "CLP") => ...
```

#### B. Compact Formatting (Axis Labels)
`app/components/ChartSales.vue` has a **custom compact formatter** also named `formatCurrency` (e.g., "$1.5M", "$500K") and a standard one named `formatCurrencyTooltip`.
**Action:** Rename local compact formatter to `formatCompactCurrency` to avoid collision with import. Replace `formatCurrencyTooltip` with utility.

#### C. Variable Fraction Digits
`app/components/StatsDefault.vue`:
```typescript
return new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: unit === "Pesos" ? 0 : 2,
}).format(value);
```
**Action:** Utility must support `Intl.NumberFormatOptions` overrides.

## Proposed Utility Interface

```typescript
export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: string = "CLP",
  options?: Intl.NumberFormatOptions
): string => {
  if (amount === null || amount === undefined || amount === "") {
    return "--";
  }

  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return "--";
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    ...options,
  }).format(numericAmount);
};
```

## Plan
1. Create `app/utils/price.ts`.
2. Replace usages in all 13 files.
3. Verify with `nuxt typecheck`.

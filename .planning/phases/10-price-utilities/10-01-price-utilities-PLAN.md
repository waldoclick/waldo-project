# Phase 10: Price Utilities Plan

## Context
Part of [v1.3 Utility Extraction](.planning/ROADMAP.md).
Goal: Centralize currency formatting logic into `app/utils/price.ts`.

## Scope
- Create `app/utils/price.ts`
- Create `tests/utils/price.test.ts`
- Update 13 files in `apps/dashboard`

## Strategy
1. **Utility Creation**:
   - `formatCurrency` handles `number | string | null | undefined`.
   - Defaults to `CLP` and `es-CL`.
   - Returns `"--"` for invalid/empty inputs.
   - Accepts `Intl.NumberFormatOptions` for overrides (needed by `StatsDefault.vue`).

2. **Complex Replacements**:
   - `StatsDefault.vue`: Logic uses `maximumFractionDigits`. Map this to `options` arg.
   - `ChartSales.vue`: 
     - Rename local compact formatter `formatCurrency` -> `formatCompactCurrency` (internal only).
     - Replace `formatCurrencyTooltip` with imported `formatCurrency`.
   - `anuncios/[id].vue`: Replace `formatPrice(price, currency)` with `formatCurrency(price, currency)`.
   - `DropdownSales.vue`: Replace `formatCurrency(amount, currency)` with imported `formatCurrency(amount, currency)`.

3. **Simple Replacements**:
   - Direct replacement of local `formatCurrency` with import in:
     - `pages/reservas/[id].vue`
     - `pages/ordenes/[id].vue`
     - `pages/destacados/[id].vue`
     - `components/PacksDefault.vue`
     - `components/UserFeatured.vue`
     - `components/OrdersDefault.vue`
     - `components/FeaturedUsed.vue`
     - `components/FeaturedFree.vue`

## Verification
- `nuxt typecheck` must pass.
- Verify `StatsDefault.vue` retains correct fraction digit logic.
- Verify `tests/utils/price.test.ts` passes.

## Execution Steps
1. Create `app/utils/price.ts` and `tests/utils/price.test.ts`.
2. Perform replacements in waves:
   - Wave 1: Simple Components/Pages.
   - Wave 2: Complex Components (`StatsDefault`, `ChartSales`, `anuncios/[id]`, `DropdownSales`).
3. Run `nuxt typecheck`.

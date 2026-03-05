# Requirements: Waldo Project

**Defined:** 2026-03-05
**Milestone:** v1.3 Utility Extraction
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.3 Requirements

Requirements for v1.3. Each maps to roadmap phases.

### Utilities — Date

- [ ] **UTIL-01**: `app/utils/date.ts` exists with `formatDate(dateString: string | undefined): string` (full datetime, es-CL locale, undefined → "--") and `formatDateShort(dateString: string | undefined): string` (date only, no time component)
- [ ] **UTIL-02**: All inline `formatDate` / `formatDateShort` definitions removed from 33 components and pages; replaced with auto-imported calls — no duplicate definitions remain

### Utilities — Price

- [ ] **UTIL-03**: `app/utils/price.ts` exists with `formatCurrency(amount: number | string | undefined | null, currency?: string): string` (Intl.NumberFormat, es-CL, CLP default, null/undefined/falsy → "--")
- [ ] **UTIL-04**: All inline `formatCurrency` / bare `Intl.NumberFormat` currency patterns removed from 13 components and pages; replaced with auto-imported `formatCurrency` — no duplicate definitions remain

### Utilities — String

- [ ] **UTIL-05**: `app/utils/string.ts` exists with `formatFullName`, `formatAddress`, `formatBoolean`, `formatDays`, `getPaymentMethod` — all typed, all handle missing/undefined input gracefully
- [ ] **UTIL-06**: All inline string utility definitions removed from 6 components and pages; replaced with auto-imported calls — no duplicate definitions remain

### Build Validation

- [ ] **UTIL-07**: TypeScript build (`typeCheck: true`) passes with zero errors after all replacements; dashboard has no remaining inline duplicate function definitions for any of the above utilities

## Future Requirements

*(None identified — complete extraction in this milestone)*

## Out of Scope

| Feature | Reason |
|---------|--------|
| ChartSales abbreviation formatter (`$1.5M`, `$100K`) | Chart-axis-specific shorthand; not a general utility, kept inline |
| StatsDefault inline `Intl.NumberFormat` (unit-conditional) | Conditional formatting logic (Pesos vs other), not a simple formatCurrency call |
| Website or Strapi utility extraction | Dashboard-first approach; other apps out of scope |
| New utility functions beyond those with 2+ duplicates | Only extract verified duplicates — no speculative APIs |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UTIL-01 | Phase ? | Pending |
| UTIL-02 | Phase ? | Pending |
| UTIL-03 | Phase ? | Pending |
| UTIL-04 | Phase ? | Pending |
| UTIL-05 | Phase ? | Pending |
| UTIL-06 | Phase ? | Pending |
| UTIL-07 | Phase ? | Pending |

**Coverage:**
- v1.3 requirements: 7 total
- Mapped to phases: 0 (roadmap not yet created)
- Unmapped: 7 ⚠️

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after initial definition*

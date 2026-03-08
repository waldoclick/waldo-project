# Requirements: Waldo Project — v1.20

**Defined:** 2026-03-08
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.20 Requirements

TypeScript `any` elimination across Strapi services, controllers, type files, factories, middlewares, seeders, and test files. Excluded: `pro.service.ts`, `suscription.utils.ts`, `catch (error: any)` blocks, `useSanitize.ts`.

### Ad API (Strapi)

- [x] **TSANY-01**: All method `options: any` params in `ad.ts` service → `unknown`
- [x] **TSANY-02**: `computeAdStatus(ad: any)` in `ad.ts` service → `ad: unknown` with type narrowing
- [x] **TSANY-03**: `transformSortParameter(sort: any): any` in `ad.ts` service → `sort: unknown`, return `unknown`
- [x] **TSANY-04**: Internal `filters?: any` and `postProcessFilter` params in `ad.ts` service → typed or `unknown`
- [x] **TSANY-05**: All `ctx: any` params in `ad.ts` controller → `Context` (from `@strapi/strapi`)
- [x] **TSANY-06**: `options: any`, `filterClause: any`, `ads.map((ad: any) =>)` in `ad.ts` controller → `unknown` with narrowing
- [x] **TSANY-07**: Inline `filters?: any`, `sort?: any`, `populate?: any` locals in `ad.ts` controller → typed or `unknown`

### Type Files

- [ ] **TSANY-08**: `order.types.ts` — `filters?: any`, `sort?: any`, `populate?: any`, `payment_response: any`, `document_details: any` → `unknown`
- [ ] **TSANY-09**: `filter.types.ts` — all filter operator fields (`$eq`, `$ne`, `$lt`, `$lte`, `$gt`, `$gte`, `$in`, `$nin`, `$contains`, `$notContains`, `$containsi`, `$notContainsi`) and `icon?: any` → `unknown`

### Flow Service

- [ ] **TSANY-10**: `flow.factory.ts` — `type Strapi = any` → import `Core.Strapi` from `@strapi/strapi` or use `unknown`
- [ ] **TSANY-11**: `flow.types.ts` — `discount?: any`, `invoices?: any[]`, `items?: any[]`, `chargeAttemps?: any[]` → `unknown` or stub interfaces
- [ ] **TSANY-12**: `flow.service.ts` — `(responseData as any).message` and `(data as any).message` casts → typed with proper narrowing

### Zoho Service

- [ ] **TSANY-13**: `zoho.service.ts` — `Promise<any[]>`, `Promise<any>`, `Promise<any | null>` return types → `Promise<unknown[]>`, `Promise<unknown>`, `Promise<unknown | null>`
- [ ] **TSANY-14**: `zoho.service.ts` — `httpClient.post/get/put<{ data: any[] }>` generics → `<{ data: unknown[] }>`
- [ ] **TSANY-15**: `zoho/interfaces.ts` — interface method return types `Promise<any[]>`, `Promise<any>` → `Promise<unknown[]>`, `Promise<unknown>`
- [ ] **TSANY-16**: `zoho/http-client.ts` — `params?: any`, `data: any` params → `unknown`

### Facto / Electronic Documents

- [ ] **TSANY-17**: `facto.factory.ts` — `datos: any` param → `unknown`
- [ ] **TSANY-18**: `electronic-ticket.service.ts` + `electronic-invoice.service.ts` — SOAP callback `(err: any, result: any)` → `(err: unknown, result: unknown)`
- [ ] **TSANY-19**: `facto.config.ts` — `private client: any` and `getClient(): any` → `unknown` with cast at call sites

### Other Services

- [ ] **TSANY-20**: `indicador.service.ts` — `transformToEnglishFormat(data: any)` → `data: unknown` with narrowing
- [ ] **TSANY-21**: `google.types.ts` + `google-sheets.service.ts` — `appendToSheet(data: any[])` → `data: unknown[]`
- [ ] **TSANY-22**: `transbank` types + service — `error?: any`, `response?: any` in result interfaces → `unknown`; `handleError(error: any)` → `unknown`
- [ ] **TSANY-23**: `payment-gateway/types/gateway.interface.ts` — `error?: any`, `response?: any` → `unknown`

### Payment Types & Utils

- [ ] **TSANY-24**: `payment.type.ts` — `ad?: any`, `availableAdFeaturedReservation?: any`, `adFeaturedReservation?: any`, `[key: string]: any`, `order?: any` → typed or `unknown`
- [ ] **TSANY-25**: `order.utils.ts` — `payment_response?: any`, `document_details?: any`, `items?: any[]`, `document_response?: any`, `documentResponse: any` → `unknown`
- [ ] **TSANY-26**: `user.utils.ts` — `commune?: any`, `business_commune?: any`, `flowData: any` → `unknown`
- [ ] **TSANY-27**: `ad.utils.ts` — `details?: any` in `adData` union → `unknown`
- [ ] **TSANY-28**: `general.utils.ts` — `userDetails: any` → `unknown`
- [ ] **TSANY-29**: `payment.ts` controller — `error: any` in `errorHandler` → `unknown`; `(result as any)` cast → typed

### Middlewares

- [ ] **TSANY-30**: `image-uploader.ts` — `file: any` params → `unknown` with narrowing
- [ ] **TSANY-31**: `cache.ts` — `operation: () => Promise<any>` → `Promise<unknown>`
- [ ] **TSANY-32**: `user-registration.ts` — `[key: string]: any` index signature → `unknown`; `strapi: any` → typed

### Seeders

- [ ] **TSANY-33**: All 5 seeder files (`categories.ts`, `packs.ts`, `regions.ts`, `faqs.ts`, `conditions.ts`) — `strapi: any` param → proper Strapi type

### Test Files

- [ ] **TSANY-34**: `pack.zoho.test.ts` — `(global as any).strapi` → typed mock; `(result as any).success` → typed
- [ ] **TSANY-35**: `pack.service.test.ts` + `ad.service.test.ts` — `(await ...) as any` casts → typed with proper interfaces
- [ ] **TSANY-36**: `payment.controller.test.ts` — `(controller as any).packResponse` → typed accessor; `body: undefined as any` → typed stub

## Out of Scope

| Feature | Reason |
|---------|--------|
| `catch (error: any)` blocks | Valid ES2019 pattern; replacing with `unknown` adds verbose type guards for minimal benefit |
| `pro.service.ts` + `suscription.utils.ts` | Complex Flow subscription logic; deferred to dedicated payment refactor milestone |
| `useSanitize.ts` `(window as any).DOMPurify` | CDN-injected global; acceptable cast for runtime-injected library |
| `flow.test.ts` `mockStrapi = {} as any` | Test scaffolding; acceptable test cast |
| `indicador.test.ts` `as any` currency casts | Test scaffolding for invalid enum values; intentional |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TSANY-01 | Phase 47 | Complete |
| TSANY-02 | Phase 47 | Complete |
| TSANY-03 | Phase 47 | Complete |
| TSANY-04 | Phase 47 | Complete |
| TSANY-05 | Phase 47 | Complete |
| TSANY-06 | Phase 47 | Complete |
| TSANY-07 | Phase 47 | Complete |
| TSANY-08 | Phase 48 | Pending |
| TSANY-09 | Phase 48 | Pending |
| TSANY-10 | Phase 48 | Pending |
| TSANY-11 | Phase 48 | Pending |
| TSANY-12 | Phase 48 | Pending |
| TSANY-13 | Phase 49 | Pending |
| TSANY-14 | Phase 49 | Pending |
| TSANY-15 | Phase 49 | Pending |
| TSANY-16 | Phase 49 | Pending |
| TSANY-17 | Phase 49 | Pending |
| TSANY-18 | Phase 49 | Pending |
| TSANY-19 | Phase 49 | Pending |
| TSANY-20 | Phase 49 | Pending |
| TSANY-21 | Phase 49 | Pending |
| TSANY-22 | Phase 49 | Pending |
| TSANY-23 | Phase 49 | Pending |
| TSANY-24 | Phase 50 | Pending |
| TSANY-25 | Phase 50 | Pending |
| TSANY-26 | Phase 50 | Pending |
| TSANY-27 | Phase 50 | Pending |
| TSANY-28 | Phase 50 | Pending |
| TSANY-29 | Phase 50 | Pending |
| TSANY-30 | Phase 50 | Pending |
| TSANY-31 | Phase 50 | Pending |
| TSANY-32 | Phase 50 | Pending |
| TSANY-33 | Phase 51 | Pending |
| TSANY-34 | Phase 51 | Pending |
| TSANY-35 | Phase 51 | Pending |
| TSANY-36 | Phase 51 | Pending |

**Coverage:**
- v1.20 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after initial definition*

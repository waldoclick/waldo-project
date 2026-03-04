# Requirements: Waldo — Dashboard Technical Debt Reduction

**Defined:** 2026-03-04
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.0 Requirements (Completed)

### Payment Abstraction Layer

- [x] **PAY-01**: El sistema define una interfaz `IPaymentGateway` con métodos `createTransaction` y `commitTransaction` con firmas normalizadas
- [x] **PAY-02**: El sistema define tipos de respuesta normalizados `IGatewayInitResponse` e `IGatewayCommitResponse`
- [x] **PAY-03**: El sistema provee un `TransbankAdapter` que implementa `IPaymentGateway` delegando al `TransbankService` existente sin cambiar su comportamiento
- [x] **PAY-04**: El sistema provee un `PaymentGatewayRegistry` (factory) que retorna la pasarela activa según la variable de entorno `PAYMENT_GATEWAY` (default: `"transbank"`)
- [x] **PAY-05**: El registry valida que las env vars requeridas estén presentes al instanciar el adapter, lanzando un error claro al startup si faltan

### Wiring y Correcciones

- [x] **WIRE-01**: `ad.service.ts` usa `getPaymentGateway()` de la factory en lugar de importar `TransbankServices` directamente
- [x] **WIRE-02**: `pack.service.ts` usa `getPaymentGateway()` de la factory en lugar de importar `TransbankServices` directamente
- [x] **WIRE-03**: El controller reemplaza el string hardcodeado `"webpay"` con `process.env.PAYMENT_GATEWAY ?? "transbank"` al crear el registro de orden
- [x] **WIRE-04**: Se agrega `return` después de `ctx.redirect` en el flujo fallido de `packResponse` para evitar ejecución continua

## v1.1 Requirements

### Quick Wins

- [ ] **QUICK-01**: El double fetch al montar componentes de lista está eliminado (solo `watch({ immediate: true })`, sin `onMounted` duplicado)
- [ ] **QUICK-02**: Cada sección de avisos (pendientes, activos, archivados, baneados, rechazados, abandonados) tiene su propia clave de paginación en el settings store
- [ ] **QUICK-03**: Las versiones de `vue` y `vue-router` en `package.json` están pineadas a la versión actual instalada (no `"latest"`)
- [x] **QUICK-04**: Los errores de producción son visibles: `useLogger` tiene Sentry activo y `console.error` no es suprimido en `console.client.ts`
- [x] **QUICK-05**: El AppStore no contiene estado irrelevante al dashboard (`isSearchLightboxActive`, `isLoginLightboxActive`, `contactFormSent` eliminados)
- [ ] **QUICK-06**: Dependencias muertas (`vue-recaptcha`, `vue3-recaptcha-v2`, `fs: "0.0.1-security"`) y middleware redundante (`auth.ts`) están eliminados
- [x] **QUICK-07**: El código comentado en `nuxt.config.ts` (GTM module, i18n, image provider, manifest link) está limpio

### Component Consolidation

- [ ] **COMP-01**: Un componente `AdsTable.vue` genérico reemplaza los 6 componentes `Ads*` duplicados (`AdsPendings`, `AdsActives`, `AdsArchived`, `AdsBanned`, `AdsRejected`, `AdsAbandoned`)
- [ ] **COMP-02**: Las páginas de avisos renderizan `<AdsTable>` con props (`endpoint`, `status`) en lugar de su componente específico
- [ ] **COMP-03**: El comportamiento observable de cada vista de avisos es idéntico al pre-refactor (mismos filtros, paginación, acciones)
- [ ] **COMP-04**: El mismo patrón de consolidación se aplica a `Reservations*` y `Featured*` si el análisis detallado confirma duplicación equivalente

### Type Safety

- [ ] **TYPE-01**: Los tipos de dominio principales (`Ad`, `User`, `Order`, `Category`, `Pack`) están definidos en `app/types/` y compartidos entre componentes
- [ ] **TYPE-02**: Los componentes consolidados (`AdsTable`, páginas de avisos) usan los tipos compartidos en lugar de `any` o interfaces inline
- [ ] **TYPE-03**: `typeCheck: true` está habilitado en `nuxt.config.ts` y el build pasa sin errores de tipo

### Performance

- [ ] **PERF-01**: `CategoriesDefault.vue` obtiene el conteo de avisos por categoría en una sola llamada a Strapi (no N llamadas paralelas)
- [ ] **PERF-02**: `ChartSales.vue` obtiene datos de ventas agregados por mes desde un endpoint de Strapi, no paginando todos los órdenes en el cliente
- [ ] **PERF-03**: `StatisticsDefault.vue` las 16 llamadas paralelas están revisadas y consolidadas donde sea posible sin romper el layout de tarjetas

## Future Requirements

### Testing

- **TEST-01**: Composables (`useRut`, `useSanitize`, `useSlugify`, `useImageProxy`) tienen tests unitarios con Vitest
- **TEST-02**: El componente `AdsTable.vue` tiene tests de comportamiento (renderizado, filtros, paginación)
- **TEST-03**: Los middlewares `guard.global.ts` y `dev.global.ts` tienen tests de integración
- **TEST-04**: Cobertura mínima configurada (>70% en composables y stores)

### Additional Consolidation

- **COMP-05**: `StatisticsDefault.vue` refactorizado para reducir las 16 llamadas independientes a endpoints de agregación en Strapi
- **COMP-06**: `ChartSales.vue` soporta filtros por rango de fechas usando el endpoint de agregación

## Out of Scope

| Feature | Reason |
|---------|--------|
| Tests unitarios exhaustivos | Alcance propio para un milestone dedicado posterior |
| Cambios en Website o Strapi | Este milestone es exclusivamente `apps/dashboard` (ver nota PERF-01/PERF-02 en STATE.md) |
| Nueva UI o features del dashboard | Foco en calidad interna, no funcionalidad nueva |
| OAuth / mejoras de autenticación | No relacionado con deuda técnica identificada |
| Internacionalización (i18n) | Módulo comentado — deferido conscientemente |
| Adapter concreto para segunda pasarela | Fuera del scope de v1.1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAY-01 | Phase 1 | Complete |
| PAY-02 | Phase 1 | Complete |
| PAY-03 | Phase 1 | Complete |
| PAY-04 | Phase 1 | Complete |
| PAY-05 | Phase 1 | Complete |
| WIRE-01 | Phase 2 | Complete |
| WIRE-02 | Phase 2 | Complete |
| WIRE-03 | Phase 2 | Complete |
| WIRE-04 | Phase 2 | Complete |
| QUICK-01 | Phase 3 | Pending |
| QUICK-02 | Phase 3 | Pending |
| QUICK-03 | Phase 3 | Pending |
| QUICK-04 | Phase 3 | Complete |
| QUICK-05 | Phase 3 | Complete |
| QUICK-06 | Phase 3 | Pending |
| QUICK-07 | Phase 3 | Complete |
| COMP-01 | Phase 4 | Pending |
| COMP-02 | Phase 4 | Pending |
| COMP-03 | Phase 4 | Pending |
| COMP-04 | Phase 4 | Pending |
| TYPE-01 | Phase 5 | Pending |
| TYPE-02 | Phase 5 | Pending |
| TYPE-03 | Phase 5 | Pending |
| PERF-01 | Phase 6 | Pending |
| PERF-02 | Phase 6 | Pending |
| PERF-03 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after v1.1 roadmap creation*

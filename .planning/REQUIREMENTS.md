# Requirements: Waldo Project — Website Technical Debt

**Defined:** 2026-03-07
**Milestone:** v1.9
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.9 Requirements

Requirements for milestone v1.9. Each maps to roadmap phases.

### Bugs Críticos

- [ ] **BUG-01**: El plugin `$setStructuredData` está implementado y los datos estructurados JSON-LD se aplican correctamente en todas las páginas que lo invocan
- [ ] **BUG-02**: Las keys de `useAsyncData` son únicas — `"packs"` en `packs/index.vue` usa una key distinta a `"packs"` en `index.vue`, y `"adData"` en `anuncios/[slug].vue` incluye el slug dinámico
- [ ] **BUG-03**: `console.error`, `console.warn` y `console.info` están restaurados en producción — solo `console.log` y `console.debug` son suprimidos
- [ ] **BUG-04**: `useAsyncData` en `mis-anuncios.vue` tiene `await` y key explícita — SSR consistente con CSR
- [ ] **BUG-05**: `useAsyncData` en `mis-ordenes.vue` tiene `await` y key explícita — SSR consistente con CSR

### TypeScript

- [ ] **TS-01**: Las 17 páginas sin `lang="ts"` están migradas a TypeScript
- [ ] **TS-02**: Los tipos `any` en stores críticos están eliminados: `user.store.ts` (`loadUser`, `updateUserProfile`), `me.store.ts` (`me` ref tipado), `ad.store.ts` (`analytics.view_item_list`)
- [ ] **TS-03**: Los tipos `any` en composables críticos están eliminados: `useAdAnalytics.ts`, `useAdPaymentSummary.ts`, `usePackPaymentSummary.ts`
- [ ] **TS-04**: `typeCheck: true` está habilitado en `nuxt.config.ts` y el build pasa sin errores de TypeScript

### Data Fetching

- [ ] **FETCH-01**: `FormProfile.vue` carga sus datos vía `useAsyncData` o recibe los datos como props — no usa `onMounted(async)` para fetch
- [ ] **FETCH-02**: `FormCreateTwo.vue` carga comunas vía `useAsyncData` o desde store ya hidratado — no usa `onMounted(async)` para fetch
- [ ] **FETCH-03**: `ResumeDefault.vue` carga datos del anuncio vía `useAsyncData` o props — no usa `onMounted(async)` para fetch
- [ ] **FETCH-04**: `PaymentMethod.vue` carga el método de pago vía `useAsyncData` o props — no usa `onMounted(async)` para fetch
- [ ] **FETCH-05**: `CreateAd.vue` verifica el usuario vía store ya hidratado o `useAsyncData` en la página padre — no usa `onMounted(async)` para fetch
- [ ] **FETCH-06**: `FilterResults.vue` carga los filtros vía store con cache guard o `useAsyncData` — no usa `onMounted(async)` para fetch
- [ ] **FETCH-07**: `PackMethod.vue` carga los packs vía store con cache guard o `useAsyncData` — no usa `onMounted(async)` para fetch
- [ ] **FETCH-08**: Los 62 `onMounted` en componentes están auditados y clasificados como: (a) UI-only (permitido), (b) fetch que debe moverse, (c) ya corregido — resultado documentado en comentario o commit message

### Store Persistence

- [ ] **STORE-01**: Los 14 stores con `persist` tienen un comentario inline documentando si el persist es correcto (`// persist: CORRECT — cache between sessions`), innecesario (`// persist: REVIEW — volatile data`) o riesgoso (`// persist: RISK — sensitive/stale data`)

## v2 Requirements

Deferred to future release.

### Refactoring

- **REFAC-01**: `FormProfile.vue` (739 líneas) dividido en sub-componentes: `FormProfilePersonal`, `FormProfileCompany`, lógica de upload separada
- **REFAC-02**: Imports explícitos de componentes eliminados — aprovechar auto-import de Nuxt 4
- **REFAC-03**: Stores volátiles (`ads.store`, `related.store`) con `persist` removido tras validar impacto en UX

## Out of Scope

| Feature | Reason |
|---------|--------|
| Refactor de `FormProfile.vue` | Alta complejidad, riesgo de regresión en flujo de creación — defer a milestone dedicado |
| Eliminación de persist en stores | Requiere validación de UX (cache percibido por usuario) — documentar primero |
| Tests unitarios/e2e | Milestone dedicado (TEST-01 a TEST-04 en Future Requirements de PROJECT.md) |
| Migración a composables de lógica de stores | Fuera del scope de deuda técnica de este milestone |
| Optimizaciones de performance (bundle size, lazy loading) | No identificadas como problemas activos |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 25 | Pending |
| BUG-02 | Phase 25 | Pending |
| BUG-03 | Phase 25 | Pending |
| BUG-04 | Phase 25 | Pending |
| BUG-05 | Phase 25 | Pending |
| TS-01 | Phase 27 | Pending |
| TS-02 | Phase 27 | Pending |
| TS-03 | Phase 27 | Pending |
| TS-04 | Phase 28 | Pending |
| FETCH-01 | Phase 26 | Pending |
| FETCH-02 | Phase 26 | Pending |
| FETCH-03 | Phase 26 | Pending |
| FETCH-04 | Phase 26 | Pending |
| FETCH-05 | Phase 26 | Pending |
| FETCH-06 | Phase 26 | Pending |
| FETCH-07 | Phase 26 | Pending |
| FETCH-08 | Phase 26 | Pending |
| STORE-01 | Phase 28 | Pending |

**Coverage:**
- v1.9 requirements: 18 total
- Mapped to phases: 18 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after initial definition*

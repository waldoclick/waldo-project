# Requirements: Waldo Project

**Defined:** 2026-03-07
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.13 Requirements

### GTM Module Migration

- [x] **GTM-MOD-01**: `apps/website/app/plugins/gtm.client.ts` is deleted — the hand-rolled plugin no longer exists
- [x] **GTM-MOD-02**: `@saslavik/nuxt-gtm@0.1.3` is installed as a devDependency in `apps/website` and added to `modules` in `nuxt.config.ts`
- [x] **GTM-MOD-03**: Module configured with `enableRouterSync: true` for SPA page_view tracking; GTM ID sourced from `runtimeConfig.public.gtm.id` (env var `GTM_ID`); manual `gtmId` field removed from runtimeConfig
- [x] **GTM-MOD-04**: `useAppConfiguration` feature flag updated to `!!config.public.gtm?.id`; `npx nuxt typecheck` passes with zero errors

## v1.12 Requirements

### Ad Creation Analytics Gaps

- [ ] **ANA-01**: El import muerto de `useAdAnalytics` en `CreateAd.vue` está eliminado — `adAnalytics` no se instancia si no se usa (líneas 60–63)
- [ ] **ANA-02**: El overcounting de `step_view` está corregido — `watch(adStore.step)` en `index.vue` no usa `immediate: true`; step 1 se dispara explícitamente en el flujo correcto, después de que se restaura el URL param en `CreateAd.vue`
- [ ] **ANA-03**: El evento `redirect_to_payment` se emite justo antes del redirect a Webpay en `resumen.vue` — `pushEvent("redirect_to_payment", [], { payment_method: "webpay" })` antes de llamar `handleRedirect()`
- [ ] **ANA-04**: El evento `purchase` en `gracias.vue` está guardado con un ref `fired` — el evento se emite exactamente una vez aunque `watchEffect` se re-ejecute
- [ ] **ANA-05**: `DataLayerEvent` exportado desde `useAdAnalytics.ts` y declarado en `window.d.ts`; `window.dataLayer` tipado como `DataLayerEvent[]` en lugar de `unknown[]`

## v1.11 Requirements

### GTM / GA4 Tracking Fix

- [x] **GTM-01**: El plugin `gtm.client.ts` no pushea arrays al dataLayer — el shim local de `gtag()` y las llamadas muerta `gtag("js", ...)` / `gtag("config", ...)` pre-carga son eliminadas; el tracking de `page_view` para SPA usa `window.dataLayer.push({ event: "page_view", page_path, page_title })` directamente
- [x] **GTM-02**: Consent Mode v2 implementado — antes de que cargue el script GTM se pushea `{ "consent": "default", analytics_storage: "denied", ad_storage: "denied" }` al dataLayer; `LightboxCookies.vue` pushea `{ "consent": "update", analytics_storage: "granted", ad_storage: "granted" }` al aceptar (en lugar del evento `accept_cookies` actual)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Agregar eventos GA4 adicionales más allá del flujo de creación | Fuera del scope — el objetivo es la migración del módulo GTM |
| Cambiar el ID de GTM (`GTM-N4B8LDKS`) | Configuración de negocio, no técnica |
| Implementar granular consent (por categoría de cookie) | Versión simplificada (accept all / deny all) es suficiente para el cumplimiento actual |
| Refactorizar `useAdAnalytics.ts` | El composable está bien estructurado — no se modifica en esta migración |
| Modificar `LightboxCookies.vue` consent logic | El formato de array-command que usa ya es correcto — no necesita cambios |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GTM-MOD-01 | Phase 33 | Complete |
| GTM-MOD-02 | Phase 33 | Complete |
| GTM-MOD-03 | Phase 33 | Complete |
| GTM-MOD-04 | Phase 33 | Complete |
| ANA-01 | Phase 32 | Complete |
| ANA-02 | Phase 32 | Complete |
| ANA-03 | Phase 32 | Complete |
| ANA-04 | Phase 32 | Complete |
| ANA-05 | Phase 32 | Complete |
| GTM-01 | Phase 31 | Complete |
| GTM-02 | Phase 31 | Complete |

**Coverage:**
- v1.13 requirements: 4 total
- Mapped to phases: 4
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 — v1.13 complete, GTM-MOD-01 through GTM-MOD-04 marked Complete*

# Requirements: Waldo Project

**Defined:** 2026-03-07
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.11 Requirements

### GTM / GA4 Tracking Fix

- [ ] **GTM-01**: El plugin `gtm.client.ts` no pushea arrays al dataLayer — el shim local de `gtag()` y las llamadas muerta `gtag("js", ...)` / `gtag("config", ...)` pre-carga son eliminadas; el tracking de `page_view` para SPA usa `window.dataLayer.push({ event: "page_view", page_path, page_title })` directamente
- [ ] **GTM-02**: Consent Mode v2 implementado — antes de que cargue el script GTM se pushea `{ "consent": "default", analytics_storage: "denied", ad_storage: "denied" }` al dataLayer; `LightboxCookies.vue` pushea `{ "consent": "update", analytics_storage: "granted", ad_storage: "granted" }` al aceptar (en lugar del evento `accept_cookies` actual)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Migrar a una librería GTM de terceros (e.g. `@gtm-support/vue-gtm`) | Cambio de dependencia innecesario; el plugin actual es suficiente una vez corregido |
| Agregar eventos GA4 adicionales (purchase, add_to_cart, etc.) | Fuera del scope de este fix — el objetivo es restaurar el tracking básico |
| Cambiar el ID de GTM (`GTM-N4B8LDKS`) | Configuración de negocio, no técnica |
| Implementar granular consent (por categoría de cookie) | Versión simplificada (accept all / deny all) es suficiente para el cumplimiento actual |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GTM-01 | Phase 31 | Pending |
| GTM-02 | Phase 31 | Pending |

**Coverage:**
- v1.11 requirements: 2 total
- Mapped to phases: 2
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 — GTM-01, GTM-02 mapped to Phase 31*

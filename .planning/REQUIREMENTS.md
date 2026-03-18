# Requirements: Waldo — Ad Preview Error Handling (v1.41)

**Defined:** 2026-03-18
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.41 Requirements

El website nunca debe devolver 500. Toda la lógica de acceso a avisos vive en el endpoint de Strapi — el website solo renderiza lo que recibe y delega errores limpiamente.

### Ad Preview

- [ ] **PREV-01**: El website nunca devuelve 500 al cargar `/anuncios/[slug]` — cualquier error del endpoint se maneja limpiamente
- [ ] **PREV-02**: Si el endpoint devuelve 404 (aviso no existe, no accesible, o acceso denegado), el website muestra la página de error 404 correctamente
- [ ] **PREV-03**: `useAsyncData` en `[slug].vue` usa `default: () => null` para evitar estado `undefined` durante hidratación SSR
- [ ] **PREV-04**: Se elimina el `watchEffect` + `showError()` de `[slug].vue` — el error se lanza dentro del `useAsyncData` con `createError`

### Strapi Robustez

- [ ] **STRP-01**: El controller `findBySlug` tiene `try/catch` alrededor del service call — errores inesperados de DB devuelven respuesta limpia sin exponer stack trace

## Future Requirements

- **POLL-01**: Post-logout website Pinia stores reset cuando el logout se origina desde el dashboard (minor stale-data UX; sin riesgo de seguridad)
- Staging cross-domain verification: deploy `COOKIE_DOMAIN=.waldoclick.dev` en ambas apps en staging y smoke-test SESS-01–04

## Out of Scope

| Feature | Reason |
|---------|--------|
| Auditar otras páginas con `watchEffect` + `showError` | El usuario confirmó que solo `[slug].vue` tiene este patrón |
| Cambiar la lógica de acceso a avisos en Strapi | La lógica del endpoint es correcta — solo se mejora el manejo de errores inesperados |
| Cambiar el comportamiento de sesión compartida | El comportamiento actual (manager ve todo desde cualquier app) es el correcto |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PREV-01 | Phase 093 | Pending |
| PREV-02 | Phase 093 | Pending |
| PREV-03 | Phase 093 | Pending |
| PREV-04 | Phase 093 | Pending |
| STRP-01 | Phase 093 | Pending |

**Coverage:**
- v1.41 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-18*

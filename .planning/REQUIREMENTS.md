# Requirements: Waldo Project

**Defined:** 2026-03-05
**Milestone:** v1.4 URL Localization
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.4 Requirements

### URL Migration

- [x] **URL-01**: Navigating to `/ads` and all sub-routes (`/ads/active`, `/ads/pending`, etc.) works correctly
- [x] **URL-02**: Navigating to `/ads/abandoned`, `/ads/banned`, `/ads/expired`, `/ads/rejected` works correctly
- [ ] **URL-03**: Navigating to `/categories`, `/categories/new`, `/categories/[id]`, `/categories/[id]/edit` works correctly
- [ ] **URL-04**: Navigating to `/communes`, `/communes/new`, `/communes/[id]`, `/communes/[id]/edit` works correctly
- [ ] **URL-05**: Navigating to `/conditions`, `/conditions/new`, `/conditions/[id]`, `/conditions/[id]/edit` works correctly
- [ ] **URL-06**: Navigating to `/account/profile`, `/account/profile/edit`, `/account/change-password` works correctly
- [ ] **URL-07**: Navigating to `/featured`, `/featured/free`, `/featured/used`, `/featured/[id]` works correctly
- [ ] **URL-08**: Navigating to `/orders`, `/orders/[id]` works correctly
- [ ] **URL-09**: Navigating to `/regions`, `/regions/new`, `/regions/[id]`, `/regions/[id]/edit` works correctly
- [ ] **URL-10**: Navigating to `/reservations`, `/reservations/free`, `/reservations/used`, `/reservations/[id]` works correctly
- [ ] **URL-11**: Navigating to `/users`, `/users/[id]` works correctly

### Redirects

- [ ] **REDIR-01**: All old Spanish URLs redirect to their English equivalents (e.g., `/anuncios/pendientes` → `/ads/pending`)

### Internal Links

- [ ] **LINK-01**: All navigation menu links point to English URLs
- [ ] **LINK-02**: All component-internal `navigateTo` / `<NuxtLink>` calls use English URLs
- [ ] **LINK-03**: Dashboard builds with `nuxt typecheck` passing after changes

## Future Requirements

### Testing

- **TEST-01**: Composables (`useRut`, `useSanitize`, `useSlugify`, `useImageProxy`) tienen tests unitarios con Vitest
- **TEST-02**: El componente `AdsTable.vue` tiene tests de comportamiento (renderizado, filtros, paginación)
- **TEST-03**: Los middlewares `guard.global.ts` y `dev.global.ts` tienen tests de integración
- **TEST-04**: Cobertura mínima configurada (>70% en composables y stores)

### Additional Consolidation

- **COMP-05**: Consolidar Reservations*/Featured* una vez que tengan store keys dedicados y estrategias de fetch alineadas
- **COMP-06**: `ChartSales.vue` soporta filtros por rango de fechas usando el endpoint de agregación

## Out of Scope

| Feature | Reason |
|---------|--------|
| Website URL migration | Dashboard-only scope; website routes are separate |
| Strapi API endpoint renaming | Backend endpoints are internal, not user-facing |
| i18n / internationalization | Consciously deferred; i18n module is commented out |
| URL aliases (keep both working permanently) | Redirects are sufficient; dual routing adds complexity |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| URL-01 | Phase 12 | Complete |
| URL-02 | Phase 12 | Complete |
| URL-03 | Phase 13 | Pending |
| URL-04 | Phase 13 | Pending |
| URL-05 | Phase 13 | Pending |
| URL-06 | Phase 14 | Pending |
| URL-07 | Phase 14 | Pending |
| URL-08 | Phase 13 | Pending |
| URL-09 | Phase 13 | Pending |
| URL-10 | Phase 14 | Pending |
| URL-11 | Phase 13 | Pending |
| REDIR-01 | Phase 15 | Pending |
| LINK-01 | Phase 15 | Pending |
| LINK-02 | Phase 15 | Pending |
| LINK-03 | Phase 15 | Pending |

**Coverage:**
- v1.4 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after initial definition*

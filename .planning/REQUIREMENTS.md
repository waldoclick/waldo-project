# Requirements: Waldo Project — v1.43

**Defined:** 2026-03-18
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1 Requirements

### Sesión Compartida

- [x] **SESS-05**: Cuando el usuario confirma reemplazar la sesión activa en el dashboard, la cookie `waldo_jwt` existente se elimina correctamente (incluyendo la versión con `domain` compartido `.waldoclick.dev` / `.waldo.click`)
- [x] **SESS-06**: Después del reemplazo de sesión, la nueva cookie de manager persiste al refrescar en el dashboard
- [x] **SESS-07**: Después del reemplazo de sesión, la nueva cookie de manager es válida y visible en el website al refrescar
- [x] **SESS-08**: No existen cookies `waldo_jwt` duplicadas con distintos scopes de `domain` después del proceso de reemplazo

## v2 Requirements

(None)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Logout explícito del website antes de ir al dashboard | El usuario no debe tener que hacer logout manual — el dashboard maneja el reemplazo |
| Cambios en Strapi backend | El bug es 100% frontend — `FormLogin.vue` dashboard |
| Cambios en el website | El website no tiene bugs — lee correctamente la cookie compartida una vez que esté bien escrita |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SESS-05 | Phase 095 | Complete |
| SESS-06 | Phase 095 | Complete |
| SESS-07 | Phase 095 | Complete |
| SESS-08 | Phase 095 | Complete |

**Coverage:**
- v1 requirements: 4 total
- Mapped to phases: 4
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 after initial definition*

# Requirements: Waldo Project — v1.47 Rediseño visual

**Defined:** 2026-06-16
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

Milestone scope: migrar la maqueta nueva (en `/design`) a los componentes reales, área por área, sin cambiar comportamiento — solo el look. Trabajo de actualización, no de creación: los componentes y su SCSS ya existen.

## v1 Requirements

### Tokens compartidos (se establecen en la fase auth)

- [x] **TOK-01**: Se crean variables SCSS NUEVAS con los valores de la maqueta (ink, amber/amberH, ink2, muted, cream, line, error, éxito) y los componentes apuntan a ellas; las variables existentes NO se modifican
- [x] **TOK-02**: Poppins es la fuente global de la(s) app(s)
- [x] **TOK-03**: La iconografía Lucide se aplica según la maqueta

### Auth

- [x] **AUTH-01**: El login se ve según la maqueta nueva
- [x] **AUTH-02**: El registro se ve según la maqueta nueva
- [x] **AUTH-03**: La verificación de código se ve según la maqueta nueva
- [x] **AUTH-04**: El reset / forgot password se ve según la maqueta nueva

> Las áreas público, cuenta y dashboard se agregarán cuando el usuario apruebe cada rediseño. No se definen aún.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cambios de comportamiento / lógica | Es un rediseño visual; la funcionalidad no cambia |
| Componentes nuevos | El trabajo es actualizar los existentes; solo se crea algo si se confirma que no hay equivalente |
| Copiar el `.dc.html` literal (estilos inline) | El proyecto es Vue + BEM + SCSS; la maqueta se traduce, no se trasplanta |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOK-01 | Phase 04 | Complete |
| TOK-02 | Phase 04 | Complete |
| TOK-03 | Phase 04 | Complete |
| AUTH-01 | Phase 04 | Complete |
| AUTH-02 | Phase 04 | Complete |
| AUTH-03 | Phase 04 | Complete |
| AUTH-04 | Phase 04 | Complete |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-16*
*Last updated: 2026-06-16 after milestone v1.47 definition*

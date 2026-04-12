# Phase 124: InputPhone Component — Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Source:** Conversación directa con el usuario

<domain>
## Phase Boundary

Crear un componente Vue reutilizable `InputPhone` que combina un selector de prefijo de país + campo de número telefónico. Reemplazar todos los inputs de teléfono actuales en los formularios del dashboard (y website si aplica) con este componente. Sin cambios de schema en Strapi.

</domain>

<decisions>
## Implementation Decisions

### Storage Strategy (LOCKED)
- **Opción A — guardar combinado:** el valor emitido por el componente es el número completo: `+56912345678`
- El campo `phone` en Strapi no cambia (no hay migración, no hay campo `prefix` nuevo)
- El componente descompone el valor almacenado internamente para pre-poblar el selector al editar

### Data Source for Country Codes (LOCKED)
- **JSON estático hardcodeado** — sin dependencias externas nuevas
- El JSON contiene: `{ name, iso2, dialCode }` por país (aprox. 250 entradas)
- Chile (`+56`, `cl`) debe ser el default
- El JSON se importa directamente en el componente o como un archivo de datos del proyecto

### Component API (LOCKED)
- Emite un valor `v-model` con el número completo combinado (`+56XXXXXXXXX`)
- Al recibir un valor existente con prefijo, lo descompone para mostrar selector + número separados
- No agrega campos adicionales al schema de Strapi

### Scope (LOCKED)
- **Dashboard:** reemplazar `FormProfile.vue` (y cualquier otro form del dashboard que tenga campo phone)
- **Website:** revisar si hay forms con campo phone y reemplazar también
- El componente vive en `components/` de cada app que lo necesite (o en un shared layer si aplica)

### Styling (LOCKED)
- Seguir BEM — el bloque base es `input--phone` (bloque `input`, modificador `phone`)
- Respetar la paleta de colores del proyecto (CLAUDE.md)
- El selector de país debe ser un `<select>` nativo o un dropdown accesible — sin librerías UI externas

### Claude's Discretion
- Nombre exacto del archivo JSON de países y dónde ubicarlo dentro del proyecto
- Si el componente necesita SCSS propio o puede extender estilos existentes
- Cómo manejar el parsing del valor almacenado (ej. si ningún dialCode matchea, mostrar `+56` por default)
- Orden de los países en el selector (Chile primero, resto alfabético)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning o implementing.**

### Formularios existentes con campo phone
- `apps/dashboard/app/components/FormProfile.vue` — componente actual a modificar
- Buscar otros: `grep -r "phone" apps/dashboard/app/components/ apps/website/app/components/ --include="*.vue" -l`

### Patrones de componentes existentes
- Revisar un componente de input similar existente (ej. `InputText`, `InputSelect` si existen) para seguir el mismo patrón

### CLAUDE.md
- `./CLAUDE.md` — reglas BEM, colores, naming conventions, estructura de archivos

### Strapi schema (referencia — NO modificar)
- `apps/strapi/src/extensions/users-permissions/` — para confirmar que `phone` ya existe como campo string

</canonical_refs>

<specifics>
## Specific Ideas

- Chile `+56` debe ser la opción default seleccionada al cargar el componente por primera vez
- El selector debe mostrar bandera o ISO2 + dialCode (ej. `🇨🇱 +56`) — a criterio del planner según factibilidad con CSS puro
- Al pre-poblar desde un valor existente `+56912345678`, el componente debe identificar el prefix más largo que matchee y separar el resto como número
- El JSON de países puede basarse en la lista pública de `intl-tel-input` (datos de dominio público)

</specifics>

<deferred>
## Deferred Ideas

- Validación de formato del número por país (ej. largo mínimo/máximo según país) — demasiado complejo para esta fase, se puede agregar en el futuro
- Componente compartido entre website y dashboard en un package separado — por ahora duplicar si necesario
- Autocompletar / búsqueda en el selector de países — agregar en el futuro si el listado de 250 países resulta difícil de navegar

</deferred>

---

*Phase: 124-inputphone-component-country-code-selector-phone-number-field*
*Context gathered: 2026-04-12 via conversación directa*

---
quick_id: 260612-mob
description: Verificar seeders de Política de Privacidad y Términos y Condiciones en Strapi
date: 2026-06-12
status: ready
---

# Quick Task 260612-mob: Verificar seeders legales en Strapi

## Objective

Confirmar que los seeders actualizados de Política de Privacidad (20 secciones, `policies.ts`) y Términos y Condiciones (27 secciones, `terms.ts`) cargan correctamente en Strapi local con formato HTML.

## Context

Los seeders fueron reescritos con:
- Contenido de los PDFs oficiales v1.0-0626 (Política de Privacidad y Términos y Condiciones)
- Formato HTML rico: `<p>`, `<strong>`, `<em>`, `<ul>/<li>`, `<br>`
- Lógica delete-and-recreate (reemplaza registros anteriores)
- Confirmado que `AccordionDefault.vue` renderiza con `v-html` → el HTML es válido

Archivos modificados:
- `apps/strapi/seeders/policies.ts` — 20 secciones (Política de Privacidad v1.0-0626)
- `apps/strapi/seeders/terms.ts` — 27 secciones (Términos y Condiciones v1.0-0626)

## Tasks

### Task 1: Ejecutar seeders y verificar conteo en DB

**Action:** Arrancar Strapi con `APP_RUN_SEEDERS=true` y verificar logs de salida.

**Verify:**
- Log muestra "Eliminados N registros anteriores" (si había datos previos)
- Log muestra exactamente 20 líneas "Política creada: ..." 
- Log muestra exactamente 27 líneas "Término creado: ..."
- Log final: "Política de Privacidad poblada: 20 secciones" y "Términos y Condiciones poblados: 27 secciones"

**Done:** ✓ cuando ambos conteos son exactos en los logs de Strapi.

### Task 2: Verificar renderizado HTML en el sitio web

**Action:** Navegar a `/politicas-de-privacidad` y `/condiciones-de-uso` con la website corriendo.

**Verify:**
- Las secciones aparecen en acordeón (AccordionDefault)
- Al abrir una sección con listas (ej. "Ámbito de Aplicación", "Derechos de los Titulares") se ven `<ul>/<li>` renderizados como bullets reales
- Los subtítulos de definiciones (ej. "Dato Personal:", "Responsable del Tratamiento:") aparecen en **negrita**
- No hay tags HTML visibles como texto crudo (`<p>`, `<strong>`, etc.)
- El orden de las secciones es correcto (1→20 para policies, 1→27 para terms)

**Done:** ✓ cuando el HTML renderiza correctamente sin tags visibles y con estructura visual clara.

## How to run

```bash
# Desde la raíz del monorepo
cd apps/strapi
APP_RUN_SEEDERS=true pnpm dev

# En paralelo, arrancar el website
cd apps/website  
pnpm dev
```

O con turbo desde la raíz si el env está configurado:
```bash
APP_RUN_SEEDERS=true pnpm --filter strapi dev
```

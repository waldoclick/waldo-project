---
phase: quick-260412-lfh
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/components/FormCreateFive.vue
autonomous: true
requirements:
  - QUICK-260412-LFH
must_haves:
  truths:
    - "El texto introductorio del paso 5 (subir imágenes) menciona de forma natural que las imágenes deben tener al menos 750x420 píxeles"
    - "El texto sigue siendo legible y natural en español, no se lee como un requisito técnico pegado"
  artifacts:
    - path: "apps/website/app/components/FormCreateFive.vue"
      provides: "Texto introductorio del paso 5 actualizado con medidas mínimas"
      contains: "750"
  key_links:
    - from: "FormCreateFive.vue form__description"
      to: "UploadImages.vue validation (img.width >= 750 && img.height >= 420)"
      via: "consistencia textual entre copy y validación real"
      pattern: "750.*420|750x420"
---

<objective>
Agregar las medidas mínimas de imagen (750x420 píxeles) de forma natural al texto introductorio del paso 5 del flujo de creación de anuncio, para que el usuario sepa el requisito antes de subir y no falle silenciosamente la validación.

Purpose: Hoy `UploadImages.vue` rechaza imágenes menores a 750x420 (línea 119), pero el usuario no recibe esa información antes de intentar subir. El copy actual dice "Las imágenes son clave para destacar tu anuncio. Elige fotos claras y relevantes que muestren lo que ofreces." — hay que mencionar las medidas mínimas ahí, integradas naturalmente.

Output: `apps/website/app/components/FormCreateFive.vue` con el texto actualizado.
</objective>

<context>
@.planning/STATE.md
@apps/website/app/components/FormCreateFive.vue
@apps/website/app/components/UploadImages.vue

<interfaces>
Validación real de dimensiones en `apps/website/app/components/UploadImages.vue` línea 119:

```js
resolve(img.width >= 750 && img.height >= 420);
```

El copy del paso 5 vive en `apps/website/app/components/FormCreateFive.vue` líneas 9-15:

```vue
<h2 class="form__title">Añade imágenes a tu anuncio</h2>
<div class="form__description">
  <p>
    Las imágenes son clave para destacar tu anuncio. Elige fotos claras y
    relevantes que muestren lo que ofreges.
  </p>
</div>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Mencionar medidas mínimas 750x420 en el copy del paso 5</name>
  <files>apps/website/app/components/FormCreateFive.vue</files>
  <action>
    Editar el `<p>` dentro de `.form__description` (líneas 11-14) para incorporar de manera natural las medidas mínimas de 750x420 píxeles. No agregar nuevos elementos, no crear clases CSS, no cambiar estructura — solo reescribir el texto dentro del párrafo existente.

    Texto nuevo sugerido (ajustar fluidez si hace falta, manteniendo el tono):

    "Las imágenes son clave para destacar tu anuncio. Elige fotos claras y relevantes que muestren lo que ofreces, con un tamaño mínimo de 750x420 píxeles para que se vean bien en todas las pantallas."

    Reglas:
    - Mantener el texto en español (UI es español per CLAUDE.md).
    - No tocar el `<h2 class="form__title">` ni ninguna otra parte del template.
    - No agregar nuevas clases ni SCSS — es un cambio puramente de copy.
    - Verificar que el texto mencione explícitamente "750" y "420" (o "750x420") para que coincida con la validación real de UploadImages.vue.
  </action>
  <verify>
    <automated>grep -E "750.*420|750x420" apps/website/app/components/FormCreateFive.vue</automated>
  </verify>
  <done>El párrafo introductorio del paso 5 menciona el tamaño mínimo 750x420 píxeles de forma natural, sin romper el layout ni agregar elementos nuevos.</done>
</task>

</tasks>

<verification>
- `grep "750" apps/website/app/components/FormCreateFive.vue` retorna al menos una línea dentro del `<p>` de `.form__description`.
- Inspección visual del paso 5 en `/anunciar` muestra el texto actualizado sin cambios de diseño.
- El texto es gramaticalmente correcto en español y se lee de forma natural.
</verification>

<success_criteria>
- El copy del paso 5 menciona las medidas mínimas 750x420 píxeles.
- No hay cambios estructurales, de clases ni de SCSS.
- El texto sigue la regla del proyecto: UI en español, natural, sin tono técnico pegado.
</success_criteria>

<output>
Al completar, crear `.planning/quick/260412-lfh-en-el-paso-de-subir-imagenes-para-crear-/260412-lfh-01-SUMMARY.md`.
</output>

# Plan: Lightbox "Cómo anunciar"

## Objetivo

Lightbox en la vista de crear aviso (`/anunciar`) que explique los 5 pasos del flujo. Diseño: imagen a la izquierda (borde a borde), texto a la derecha (con padding), navegación anterior/siguiente por pasos, imagen con fade al cambiar de paso.

---

## 1. Componente del lightbox

**Archivo:** `app/components/LightboxComoAnunciar.vue`

- **Props:** `isOpen` (boolean).
- **Emits:** `close`.
- **Estado interno:** índice del paso actual (0–4).
- **Contenido:** array de 5 pasos; cada uno tiene: título, texto, imagen (por ahora misma placeholder en todos).
- **Estructura del template:**
  - Contenedor del lightbox (backdrop + caja).
  - Caja **sin padding** en el contenedor principal.
  - **Columna izquierda:** solo la imagen, ancho fijo o proporcional, **sin padding** (borde a borde con el borde izquierdo de la caja).
  - **Columna derecha:** título, texto, indicador “Paso X de 5”, botones “Anterior” y “Siguiente” (o “Entendido” en el último paso); **esta columna sí tiene padding**.
- **Comportamiento:**
  - Al abrir: resetear al paso 1.
  - Teclado: Escape = cerrar, flecha izquierda = anterior, flecha derecha = siguiente.
- **Transición de imagen:** al cambiar `currentStepIndex`, la imagen hace **fade** (opacity): por ejemplo `<Transition>` con nombre `fade` o clase CSS que anime opacidad al cambiar el paso.

---

## 2. Estilos SCSS

**Archivo:** `app/scss/components/_lightbox.scss`

- Añadir bloque **`.lightbox--como-anunciar`** (misma base que otros: fixed, full screen, backdrop, caja centrada).
- **Caja (\_\_box):**
  - Sin padding.
  - `overflow: hidden` si hace falta para que la imagen no sobresalga en bordes redondeados.
- **Cuerpo (\_\_body):** `display: flex`; primera columna = imagen, segunda = contenido.
- **Columna imagen (\_\_image):**
  - Sin padding.
  - Imagen que cubra/ajuste (object-fit) y ocupe todo el alto/ancho de la columna.
  - Ancho fijo en desktop (ej. 280–320px).
- **Columna contenido (\_\_content):**
  - Padding (ej. 24px o 32px) solo aquí.
  - Flex para título, texto y bloque de navegación.
- **Responsive:** en breakpoint pequeño, `flex-direction: column`; imagen arriba (altura controlada), contenido abajo con padding.
- **Transición fade:** clase o uso de Vue `<Transition>` para el elemento de la imagen; transición CSS `opacity` + duración (ej. 0.2–0.3s).

---

## 3. Imagen placeholder

- Usar una sola imagen placeholder por ahora (ej. `https://placehold.co/400x300` o asset local tipo `placeholder-anunciar.svg` / `placeholder-anunciar.png` en `public/images/`).
- En el componente, todos los pasos usan la misma URL de placeholder hasta tener imágenes definitivas.

---

## 4. Integración en la vista anunciar

**Archivo:** `app/components/CreateAd.vue`

- Añadir `ref` (ej. `isLightboxComoAnunciarOpen = false`).
- Añadir en el template un enlace o botón visible: texto tipo “¿Cómo anunciar?” o “Ver pasos”.
- Incluir `<LightboxComoAnunciar :is-open="..." @close="..." />` y enlazar al ref y al cerrar poner el ref en `false`.

---

## 5. Orden de implementación sugerido

1. Crear el componente `LightboxComoAnunciar.vue` con estructura (imagen izquierda sin padding, contenido derecha con padding), 5 pasos con texto y placeholder, navegación y fade en la imagen.
2. Añadir estilos en `_lightbox.scss` para layout y responsive.
3. Integrar en `CreateAd.vue` el trigger y el lightbox.
4. Probar: abrir/cerrar, anterior/siguiente, fade al cambiar paso, teclado y que solo la parte derecha tenga padding.

---

## 6. Checklist de diseño (recordatorio)

- [ ] Lightbox completo sin padding; solo la parte derecha con padding.
- [ ] Imagen izquierda de borde a borde.
- [ ] Imagen placeholder por ahora.
- [ ] Fade en la imagen al avanzar o retroceder de paso.

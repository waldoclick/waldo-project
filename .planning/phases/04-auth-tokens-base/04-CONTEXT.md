# Phase 04: Auth + tokens base - Context

**Gathered:** 2026-06-16 (via `/gsd:discuss-phase 04 --auto`)
**Status:** Ready for planning

<domain>
## Phase Boundary

Restilizar el flujo de auth del **sitio web** (`apps/website`) para que se vea como la maqueta `design/auth.dc.html`, y de paso establecer las **variables SCSS nuevas** (valores de la maqueta) que reusarán las áreas siguientes. Pantallas en scope: login, registro paso 1, registro paso 2, recuperar contraseña, reset contraseña, verificación 2FA (código). Trabajo de actualización: los componentes y su SCSS ya existen, no se crean nuevos. Comportamiento (lógica, validaciones, endpoints, flujos) NO cambia — solo el look.
</domain>

<decisions>
## Implementation Decisions

### Variables SCSS (regla dura)
- **D-01:** NO modificar las variables existentes en `apps/website/app/scss/abstracts/_variables.scss` (`$charcoal`, `$light_peach`, `$platinum`, etc. quedan intactas).
- **D-02:** Crear variables NUEVAS con los valores de la maqueta y apuntar los componentes de auth a ellas. Naming semántico espejando la maqueta: `$ink: #26252B`, `$ink2: #56535F`, `$muted: #8A8794`, `$placeholder: #B6B2BB`, `$amber: #F7C97E`, `$amber_hover: #EFB85C`, `$cream: #F6F4F1`, `$line: #ECE9E4`. Feedback: error `#E4534B`, warning `#E8902C`, success `#3B9E63`, success-strong `#1F8A5B`. (Nombres exactos a criterio del planner, pero deben ser nuevos y no colisionar.)
- **D-03:** Poppins NO se toca — ya es la fuente global (pesos 100–900 cargados en `nuxt.config.ts`). No hay font swap.

### Layout de auth (`.auth`)
- **D-04:** Split 50/50 (hoy es 45/55). Panel marca izquierda + panel formulario derecha, `height:100vh`, overflow controlado. Responsive: mantener el `flex-direction: column-reverse` en pantallas chicas que ya existe.

### Panel marca (`IntroduceAuth` / `.introduce--auth`)
- **D-05:** Reemplazar el fondo charcoal + imagen (`PictureDefault` / `bg-auth-login.png`) por una **tarjeta crema** (`$cream`, `border:1px $line`, `border-radius:20px`) con dos **glows radiales ámbar** vía CSS (no imágenes). Drop de `PictureDefault` en auth.
- **D-06:** Logo **negro** (`LogoBlack`/`logo-black.svg`) en vez de blanco (el fondo ahora es claro). Chip "Marketplace industrial" arriba a la derecha. Título dinámico por pantalla (ya existe `getTitle`). Lista de bullets con check en círculo ámbar. Línea de pie "Conexión protegida · datos cifrados…" con icono escudo.

### Formularios (`.form` + modificadores)
- **D-07:** Títulos **alineados a la izquierda** (hoy `text-align:center`), h2 31px/800, subtítulo 15px. Botón Google primario **ámbar** (`$amber`, hover `$amber_hover`, texto `$ink`) con el ícono Google a color en círculo blanco. Divisor "o con tu correo/datos". Inputs: label `$muted` 13px/600, input `border:1px $line` radius 7px, **focus ring ámbar** (`border-color:$amber_hover; box-shadow:0 0 0 3px rgba(247,201,126,.25)`). Botón secundario blanco con borde `$line`.
- **D-08:** Password con toggle texto "Mostrar/Ocultar" (no ícono). Medidor de fuerza de 4 barras con colores de feedback (rojo/naranja/verde/verde-fuerte) + nota de coincidencia de repetir. Botón "Generar segura" en registro/reset. Registro en 2 pasos (paso 1: tipo de cuenta, nombres, apellidos, RUT; paso 2: email, password, repetir, 3 checkboxes age/privacidad/condiciones). Verify: 6 cajas OTP (62px, radius 10px) + countdown de reenvío.

### Iconos
- **D-09:** Usar **`lucide-vue-next`** (ya instalado, `^0.486.0`) para los iconos de la maqueta (check, chevron, arrow-left/right, shield, sparkles, eye). El check de bullets actual (`NuxtImg IconCheck`) puede pasar a Lucide o mantenerse — a criterio del planner, pero preferir Lucide para alinear con la maqueta.

### Scope
- **D-10:** Solo `apps/website`. El auth del **dashboard** (`apps/dashboard`) NO está en esta fase. Comportamiento sin cambios (lógica de FormLogin/FormRegister/FormVerifyCode/etc. intacta). Sin componentes nuevos.

### Claude's Discretion
- Nombres exactos de las variables SCSS nuevas (deben ser nuevas, semánticas, sin colisión).
- Si los nuevos colores se agregan también a la tabla de Brand Colors de `CLAUDE.md` (recomendado para coherencia, pero no bloquea).
- Mantener o migrar el check de bullets a Lucide.
- Estructura BEM exacta de los modificadores nuevos respetando la convención del proyecto.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Maqueta (target visual)
- `design/auth.dc.html` — Maqueta de las 6 pantallas de auth (login, register1, register2, recover, reset, verify). Tokens en el `<div>` raíz (líneas ~23). Estilos inline a traducir a BEM/SCSS.
- `design/Design System.dc.html` — Sistema de diseño: paleta, tipografía, iconos, radios, componentes (botones, inputs, chips, medidor de contraseña).

### Código actual a actualizar
- `apps/website/app/scss/abstracts/_variables.scss` — Variables existentes (NO modificar; agregar nuevas).
- `apps/website/app/scss/components/_auth.scss` — Layout `.auth` (176 líneas).
- `apps/website/app/scss/components/_introduce.scss` — Panel marca `.introduce--auth` (131 líneas).
- `apps/website/app/scss/components/_form.scss` — `.form` títulos/inputs/botones (488 líneas).
- `apps/website/app/scss/components/_verify-code.scss` — OTP `.form--verify` (55 líneas).
- Componentes: `IntroduceAuth.vue`, `FormLogin.vue`, `FormRegister.vue`, `FormVerifyCode.vue`, `FormForgotPassword.vue`, `FormResetPassword.vue`, `PasswordStrength.vue`, `MenuAuth.vue`, `LinkLogin.vue`, `LoginWithGoogle.vue` (en `apps/website/app/components/`).
- Páginas: `login/index.vue`, `login/verificar.vue`, `registro/index.vue`, `registro/confirmar.vue`, `recuperar-contrasena.vue`, `restablecer-contrasena.vue` (en `apps/website/app/pages/`).

### Reglas de proyecto
- `CLAUDE.md` — BEM (block--modifier__element), un SCSS por componente, brand colors, no estilos inline, refactors subtractivos.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `IntroduceAuth.vue` ya tiene logo + título dinámico (`getTitle`) + subtítulo + lista de bullets — solo cambia el estilo (crema, logo negro, glows, check ámbar, footer seguridad) y se quita `PictureDefault`.
- `lucide-vue-next@^0.486.0` instalado → iconos como componentes Vue.
- `FormVerifyCode.vue` + `.form--verify` ya implementan 6 OTP inputs (split, auto-advance, backspace) — solo restyling (62px, radius 10px, focus ámbar).
- `PasswordStrength.vue` ya existe para el medidor de fuerza.
- Variables SCSS centralizadas en `_variables.scss`; mixins `screen-large` para responsive ya en uso en `_auth.scss`.

### Established Patterns
- BEM con modificador como namespace propio (`introduce--auth__content`, `form--verify__digits`).
- SCSS por componente bajo `apps/website/app/scss/components/`, importados desde `app.scss`.
- Colores siempre por variable `$...`, nunca hex inline.

### Integration Points
- Las variables nuevas viven en `_variables.scss` (importado por todos los componentes vía `@use "../abstracts/variables" as *`).
- Solo los componentes/SCSS de auth apuntan a las variables nuevas en esta fase; el resto del sitio sigue con las viejas.
</code_context>

<specifics>
## Specific Ideas

- Panel izquierdo: tarjeta crema redondeada (radius 20) con 2 glows radiales ámbar (top-right grande, bottom-left chico), como en la maqueta — todo CSS, sin imágenes.
- Focus ring ámbar exacto: `border-color:#EFB85C; box-shadow:0 0 0 3px rgba(247,201,126,.25)`.
- Botón primario (Google, enviar, registrarse, verificar, guardar): ámbar `#F7C97E` hover `#EFB85C`, texto `#26252B`, radius 9px.
- Botón secundario (iniciar sesión, siguiente, volver): blanco, borde `$line`, radius 7px, hover fondo `$cream`.
- Título por pantalla del panel izquierdo cambia según el contexto (login/registro/recuperar/reset/verify) — la maqueta lo define en `LEFT`.
</specifics>

<deferred>
## Deferred Ideas

- Auth del dashboard (`apps/dashboard`) — fase futura, no aprobada aún.
- Áreas público / cuenta / dashboard del sitio — fases futuras, no aprobadas.
- Actualizar la tabla de Brand Colors de `CLAUDE.md` con los valores nuevos — opcional, fuera del scope estricto de esta fase salvo que se decida en el plan.
</deferred>

---

*Phase: 04-auth-tokens-base*
*Context gathered: 2026-06-16 via /gsd:discuss-phase --auto*
*[auto] Gray areas auto-selected: Variables SCSS, Layout auth, Panel marca, Formularios, Iconos, Scope. Recommended defaults locked per maqueta `design/auth.dc.html`.*

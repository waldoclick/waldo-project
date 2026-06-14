# Revisión de seguridad — waldo.click (white-box + recon externo)

Fecha: 2026-06-12. Alcance: sitio en vivo (www / api.waldo.click) + código del monorepo (apps/website, apps/strapi). Revisión autorizada (plataforma propia). Solo lectura — no se modificó nada.

## Postura general (lo bueno)
- API `api.waldo.click` cerrada tras `proxy-auth` (header `x-proxy-key`, comparación timing-safe). Todo `/api/*` devuelve 401 sin la clave. El secreto NO se filtra al cliente (solo en rutas Nitro server-side).
- CORS de Strapi limitado a `FRONTEND_URL`; `x-powered-by` removido; `noSniff` activo.
- Verificación del ID token de Google correcta (firma, `aud`, `iss`, `exp`).
- OTP con CSPRNG, expiración 15 min, un solo uso, lockout 3 intentos. Token de reset robusto (64 bytes), sin enumeración de emails.
- Sin secretos commiteados (solo `.env.example`). Identidad de orden = `order.documentId` (regla de pago respetada). Sin SQL/command injection ni SSRF con host controlado por usuario.
- `ad.update`/`ad.delete` con chequeo de propiedad correcto; `PUT /users/:id` protegido por `isUsersOwner` + `protect-user-fields`. Endpoints `/ia/*`, cron-runner y analytics gateados con `isManager`.

## CRÍTICO / ALTO

### 1. IDOR en órdenes — `order.findOne` y `order.find` sin chequeo de propiedad (VERIFICADO)
`apps/strapi/src/api/order/controllers/order.ts:386` (findOne) y `:26` (find). `findOne` busca por id/documentId, popula `user` y `ad`, y retorna sin comparar `order.user.id` con `ctx.state.user.id`. `find` pasa `filters` del cliente directo a `strapi.db.query` sin scoping por usuario. Las órdenes contienen PII (email, teléfono, RUT, dirección) y datos de pago (`buy_order`, auth codes). Los documentId viajan al frontend (`/pagar/gracias?order=...`), no son secretos.
Condicional: depende de que el rol Authenticated tenga habilitado `order.findOne`/`find` en la BD.
Fix: comparar propiedad en `findOne` (patrón ya correcto en `payment.thankyou`, payment.ts:744); scopear `find` por `ctx.state.user`; gatear `exportCsv`/`salesByMonth` con `isManager`.

### 2. Retorno de Webpay sin re-validación de monto ni idempotencia (VERIFICADO)
`apps/strapi/src/api/payment/services/checkout.service.ts:166` — solo valida `status === "AUTHORIZED"`. `response.amount` se guarda (`:219`, `:390`) pero nunca se compara con el precio esperado del pack. Sin protección de replay: `buy_order` no es único en el schema, y `commit()` de Transbank es idempotente del lado de ellos, así que re-pedir la URL de retorno (GET, queda en historial) re-ejecuta creación de reservas/featured/publicación → múltiples beneficios por un solo pago. `pack.service.ts` tiene el mismo defecto.
Fix: recalcular monto esperado server-side y exigir `response.amount === esperado`; marcar `buy_order` como procesado (constraint unique + lookup) antes de otorgar beneficio; envolver en transacción.

### 3. CRUD abierto en `ad-pack` / `ad-reservation` / `ad-featured-reservation` (CONDICIONAL a rol BD)
Rutas con `config.policies: []` exponiendo find/findOne/create/update/delete. Las reservas son los "créditos" para publicar; `ad-pack` contiene precios. Si el rol no-manager puede llamarlos: minteo de créditos gratis (`POST /api/ad-reservations {user, price:0}`), reescritura de precios de packs a 0, o IDOR sobre reservas ajenas.
Fix: create/update/delete solo `isManager` (packs) o controladores owner-scoped (reservas, con `user` desde `ctx.state.user`, ignorando `price`/`user` del cliente).

### 4. Stored XSS por sanitizador SSR basado en regex (VERIFICADO)
`apps/website/app/composables/useSanitize.ts:13-40`. En SSR (la app es `ssr:true`) la sanitización usa regex, no DOMPurify. `on\w+=["']...` solo matchea handlers con comillas → `<svg onload=alert(1)>` sin comillas sobrevive. Sinks `v-html` con datos del vendedor: `AdSingle.vue:15` (descripción de aviso), `ArticleSingle.vue:12` (markdown con HTML inline). Payload se ejecuta en el HTML servido a cada visitante antes de la hidratación.
Fix: usar DOMPurify isomórfico (isomorphic-dompurify) también en server; deshabilitar HTML en `marked`; eliminar la rama regex. Idealmente sanitizar en Strapi antes de persistir.

### 5. Cookie de sesión JWT sin httpOnly (VERIFICADO parcialmente)
`waldo_jwt` legible por JS (dev-login.post.ts:32 `httpOnly:false`; useLogout lee `document.cookie`). Con `COOKIE_DOMAIN=.waldo.click` (wildcard subdominios) y el XSS del punto 4, esto escala a robo de sesión / account takeover. Verificar el cookie de producción del SDK @nuxtjs/strapi.
Fix: cookie `httpOnly + Secure + SameSite`; el proxy ya lee el JWT server-side. Si pasa a cookie auto-enviada, añadir CSRF.

### 6. Enlace de cuenta Google sin verificar `email_verified` (VERIFICADO)
`apps/strapi/src/services/google-one-tap/google-one-tap.service.ts` — `findOrCreateUser` enlaza `google_sub` a una cuenta local existente por coincidencia de email, sin chequear `payload.email_verified === true`. En dominios federados/Workspace donde el atacante controla el directorio, permite pre-hijack de cuentas.
Fix: rechazar si `email_verified !== true` antes de enlazar o crear.

### 7. Stored XSS en emails (autoescape off) — destinatarios admin (VERIFICADO en config)
`apps/strapi/src/services/mjml/index.ts:4` `autoescape:false`. Existe `escapeHtml()` pero solo se usa en contact. Crons diarios interpolan título de aviso / username / email sin escapar en reportes a `ADMIN_EMAILS` (`ad-expiry.cron.ts:131`, `ad-free-reservation-restore.cron.ts:59`). Emails transaccionales (aprobación/rechazo/ban al dueño) también.
Fix: `autoescape:true` global, o `escapeHtml()` en cada variable de usuario.

## MEDIO
- **Sin rate limiting en endpoints de auth** (login, forgot-password, verify-code, one-tap). Único gate es reCAPTCHA en el proxy. Permite password spraying y email bombing. (`config/middlewares.ts` sin ratelimit). Fix: rate limit por IP+cuenta.
- **reCAPTCHA solo en el proxy Nitro, no en Strapi** (`config/middlewares.ts:67` deshabilitado). Si el origen Strapi es alcanzable directo, no hay CAPTCHA en auth. Verificar aislamiento de red del origen Strapi.
- **reCAPTCHA ignora `action`/`hostname`** (`google-recaptcha.service.ts:22`) — solo `success && score>0.5`. Permite replay de token entre formularios.
- **Upload: MIME spoofeable, sin magic-byte, sin límite de tamaño** (`middlewares/upload.ts:35`); middlewares de re-encode (`image-uploader`/`image-converter`) comentados. SVG/html sí excluidos del allowlist (bien). Fix: verificar magic bytes, re-encode con sharp, `sizeLimit`.
- **`GET /api/users` (`getUserDataWithFilters`)** mergea `filters` del cliente sin sanitizar y devuelve PII (email/phone/RUT) saltándose el sanitizer. Fix: whitelist de filtros, strip de PII salvo manager.
- **`verification-code`, `contact`, `subscription-payment`** usan core router sin overrides de auth → exposición depende 100% del rol BD. `verification-code` almacena `code`/`pendingToken` en claro: si `find` queda público = 2FA bypass. Fix: deshabilitar rutas content-API por código.
- **Fallback de secreto JWT** `ad.ts:757` `process.env.JWT_SECRET ?? "strapi-jwt-secret"` — forja de tokens si JWT_SECRET vacío. Fix: quitar fallback / usar el servicio JWT del plugin.
- **JWT 30 días sin rotación**, `ACAO:*` fallback en proxy si `BASE_URL` ausente, monto de orden tomado del gateway alimenta reportes financieros.

## BAJO / INFO
- HSTS 180 días sin preload. Comparación OTP no constant-time (mitigada por lockout). `console.log("API Key:", ...)` en weather.service.ts:46. Backup cron arma comando shell por interpolación (inputs server-side). `DEV_PASSWORD=waldodev` como default en `.env.example` — confirmar dev-login deshabilitado en prod. CSP con `script-src 'unsafe-inline'` (debilita XSS; migrar a nonce).

## ACCIÓN MÁS VALIOSA
Exportar y auditar los permisos de rol (Public vs Authenticated) de la BD de Strapi. Varios hallazgos ALTO (1, 3, y los core-router del MEDIO) son explotables solo si esas acciones están habilitadas para no-managers — y eso no está en el código, está en la BD.

# Requirements: Waldo Project — v1.44 Google One Tap Sign-In

**Defined:** 2026-03-18
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.44 Requirements

### Infrastructure

- [ ] **GTAP-01**: `connect-src` en `nuxt.config.ts` incluye `https://accounts.google.com/gsi/` y `frame-src` incluye `https://accounts.google.com/gsi/`
- [ ] **GTAP-02**: `GOOGLE_CLIENT_ID` está presente en `apps/strapi/.env` y documentado en `.env.example`

### Strapi Backend

- [ ] **GTAP-03**: `POST /api/auth/google-one-tap` acepta un credential JWT de Google, lo verifica con `OAuth2Client.verifyIdToken()` vía `google-auth-library`, y retorna `{ jwt, user }`
- [ ] **GTAP-04**: Si el usuario ya existe (por `sub` o email), se autentica sin crear una cuenta nueva
- [ ] **GTAP-05**: Si el usuario no existe, se crea la cuenta automáticamente y se llama `createUserReservations()` para dar los 3 free ad slots
- [ ] **GTAP-06**: El endpoint bypassa el 2-step de verificación por código (mismo comportamiento que `/connect/google`)

### Nuxt Frontend

- [ ] **GTAP-07**: `apps/website/app/composables/useGoogleOneTap.ts` reescrito — redirect hack eliminado, global flag eliminado, métodos FedCM deprecated eliminados (`isNotDisplayed`, `getNotDisplayedReason`, `use_fedcm_for_prompt`)
- [ ] **GTAP-08**: `apps/website/app/plugins/google-one-tap.client.ts` creado — inicializa GIS una vez con guard de auth-state; SSR-safe por sufijo `.client.ts`
- [ ] **GTAP-09**: One Tap aparece automáticamente en páginas públicas para usuarios no autenticados
- [ ] **GTAP-10**: One Tap NO aparece en rutas privadas (`/cuenta/*`, `/pagar/*`, `/anunciar/*`, etc.)
- [ ] **GTAP-11**: Al completar One Tap, se llama `setToken(jwt)` + `fetchUser()` y el usuario queda autenticado con cookie `waldo_jwt` correcta

### Logout

- [ ] **GTAP-12**: `useLogout.ts` llama `window.google?.accounts?.id?.disableAutoSelect()` antes de `strapiLogout()` — previene el dead-loop post-logout

## v2 Requirements (deferred to v1.45)

### Auto Sign-In & Cross-Browser

- **GTAP-13**: `auto_select: true` — usuarios que ya han aprobado One Tap son autenticados automáticamente sin interacción (requiere confirmar GTAP-12 funcionando en producción primero)
- **GTAP-14**: `itp_support: true` — fallback de ITP para Safari/Firefox (welcome page + popup)
- **GTAP-15**: Redirect a completar perfil si `firstName`/`lastName` ausentes después de One Tap (igual que comportamiento de `login/google.vue`)

## Out of Scope

| Feature | Reason |
|---------|--------|
| One Tap en dashboard | Admin usa 2-step local login; One Tap es UX consumer-facing |
| Reemplazar el botón Google redirect existente | Coexistencia requerida por decisión de producto |
| Custom positioning del overlay | FedCM (Chrome 117+) controla la posición — no es configurable |
| `@types/google-one-tap` npm package | `window.d.ts` ya declara los tipos necesarios; instalar causaría declaraciones duplicadas |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GTAP-01 | Phase 096 | Pending |
| GTAP-02 | Phase 096 | Pending |
| GTAP-03 | Phase 097 | Pending |
| GTAP-04 | Phase 097 | Pending |
| GTAP-05 | Phase 097 | Pending |
| GTAP-06 | Phase 097 | Pending |
| GTAP-07 | Phase 098 | Pending |
| GTAP-08 | Phase 098 | Pending |
| GTAP-09 | Phase 098 | Pending |
| GTAP-10 | Phase 098 | Pending |
| GTAP-11 | Phase 098 | Pending |
| GTAP-12 | Phase 098 | Pending |

**Coverage:**
- v1.44 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 after initial definition*

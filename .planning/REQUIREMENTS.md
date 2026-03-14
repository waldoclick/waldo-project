# Requirements: Waldo Project — v1.36 Two-Step Login Verification

**Defined:** 2026-03-13
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.36 Requirements

Requirements for milestone v1.36. Each maps to roadmap phases.

### Strapi Backend

- [x] **VSTEP-01**: `POST /api/auth/local` validates credentials but does not issue a JWT — instead returns `{ pendingToken, email }` where `pendingToken` is an opaque identifier for the pending session
- [x] **VSTEP-02**: On successful credential validation, Strapi generates a random 6-digit numeric code, stores it (with `userId`, `code`, `expiresAt`, `attempts`, `pendingToken`) in a `verification-code` content type, and sends it via MJML email to the user
- [x] **VSTEP-03**: `POST /api/auth/verify-code` accepts `{ pendingToken, code }` — validates the code is correct, not expired (5-minute window), and under the attempt limit (max 3); on success issues the real JWT in the same response shape as normal Strapi login
- [x] **VSTEP-04**: Each failed `verify-code` attempt increments the `attempts` counter; when attempts reach 3, the code record is invalidated — user must restart login from scratch
- [x] **VSTEP-05**: `POST /api/auth/resend-code` accepts `{ pendingToken }` — generates a new code, replaces the previous record, and resends the email; rate-limited to one resend per minute per `pendingToken`
- [x] **VSTEP-06**: Verification code records are cleaned up after expiry (via cron or on-demand query) to prevent table bloat
- [x] **VSTEP-07**: Google OAuth (`/api/connect/google/callback`) is unaffected — bypasses the entire 2-step flow and issues JWT directly as before
- [x] **VSTEP-08**: `verification-code.mjml` email template in Spanish with the 6-digit code, a 5-minute expiry notice, and branding consistent with existing templates

### Dashboard Frontend

- [x] **VSTEP-09**: After submitting email+password on `/auth/login`, if the response contains `pendingToken` (not a JWT), `FormLogin` redirects to `/auth/verify-code` carrying the `pendingToken` in transient state (not in the URL)
- [x] **VSTEP-10**: `/auth/verify-code` page in dashboard contains a single 6-digit code input field, a "Verificar" submit button, and a "Reenviar código" resend button that is disabled for 60 seconds after each send
- [x] **VSTEP-11**: On successful code verification in dashboard, the JWT is stored via `useStrapiAuth()` and the user is redirected to `/` (same post-login behavior as today, including manager-role check)
- [x] **VSTEP-12**: On code expiry or max-attempts reached in dashboard, show a Swal error and redirect back to `/auth/login`

### Website Frontend

- [ ] **VSTEP-13**: After submitting email+password on `/login`, if the response contains `pendingToken` (not a JWT), `FormLogin` redirects to `/login/verificar` carrying the `pendingToken` in transient state (not in the URL)
- [ ] **VSTEP-14**: `/login/verificar` page in website contains a 6-digit code input field, a "Verificar" submit button, and a "Reenviar código" resend button that is disabled for 60 seconds after each send
- [ ] **VSTEP-15**: On successful code verification in website, the JWT is stored and the user is redirected per existing post-login logic (referer → `/anuncios` fallback), including profile-complete check
- [ ] **VSTEP-16**: On code expiry or max-attempts reached in website, show Swal error and redirect back to `/login`

## Future Requirements

*(None identified for this milestone)*

## Out of Scope

| Feature | Reason |
|---------|--------|
| Google OAuth 2-step | Google handles its own auth security; intercepting it adds complexity with no benefit |
| Opt-in 2-step per user | Mandatory for all users — no exceptions reduces attack surface |
| Admin bypass / whitelist | No bypass — consistency and security; disabling for dev/staging via config not needed |
| TOTP / authenticator app | Email code is the defined flow; TOTP can be added in a future milestone |
| SMS verification | No SMS provider integrated; email is the chosen delivery channel |
| Remember device (skip 2-step) | Deferred — adds session tracking complexity not scoped for this milestone |

## Traceability

| Requirement | Phase | Status  |
|-------------|-------|---------|
| VSTEP-01    | 077   | Complete |
| VSTEP-02    | 077   | Complete |
| VSTEP-03    | 077   | Complete |
| VSTEP-04    | 077   | Complete |
| VSTEP-05    | 077   | Complete |
| VSTEP-06    | 077   | Complete |
| VSTEP-07    | 077   | Complete |
| VSTEP-08    | 077   | Complete |
| VSTEP-09    | 078   | Complete |
| VSTEP-10    | 078   | Complete |
| VSTEP-11    | 078   | Complete |
| VSTEP-12    | 078   | Complete |
| VSTEP-13    | 079   | Pending |
| VSTEP-14    | 079   | Pending |
| VSTEP-15    | 079   | Pending |
| VSTEP-16    | 079   | Pending |

**Coverage:**
- v1.36 requirements: 16 total
- Mapped to phases: 16 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 — traceability filled after roadmap creation*

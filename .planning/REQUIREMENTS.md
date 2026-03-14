# Requirements: Waldo Project — v1.37 Email Authentication Flows

**Defined:** 2026-03-14
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.37 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Password Reset

- [x] **PWDR-01**: User receives a branded MJML email when requesting a password reset
- [x] **PWDR-02**: Password reset email link points to the website's reset page when requested from the website
- [x] **PWDR-03**: Password reset email link points to the dashboard's reset page when requested from the dashboard
- [x] **PWDR-04**: `verification-code.mjml` displays the correct 15-minute expiry (fix "5 minutos" → "15 minutos" copy error)

### Email Verification

- [ ] **REGV-01**: User who registers via form must confirm their email address before they can log in
- [ ] **REGV-02**: User who registers via Google OAuth is not required to confirm email (bypassed automatically)
- [x] **REGV-03**: After form registration, user is redirected to a confirmation page (`/registro/confirmar`) instead of `/login`
- [x] **REGV-04**: Confirmation page displays the user's email address and a resend confirmation email button
- [x] **REGV-05**: When an unconfirmed user tries to log in, a clear actionable error is shown with a resend option (not a generic error Swal)
- [ ] **REGV-06**: All existing users are migrated to `confirmed = true` before email confirmation is activated (prevents lockout)

## Future Requirements

### Email Verification Polish (v2)

- **REGV-F01**: Confirmation success banner shown on `/login?confirmed=true` after clicking confirmation link
- **REGV-F02**: Already-confirmed guard: second click of confirmation link shows friendly "ya confirmada — inicia sesión" instead of error state

### MJML Confirmation Email (v2)

- **MJML-F01**: Registration confirmation email uses branded MJML template (currently Strapi native plain-text)
  - Note: requires `plugin.services.user` factory override to intercept `sendConfirmationEmail` — same pattern as `plugin.controllers.auth`; fully documented in `.planning/research/STACK.md`

## Out of Scope

| Feature | Reason |
|---------|--------|
| MJML email for account confirmation | Strapi's native plain-text template is acceptable interim; service factory override is v2 work |
| Confirmation success banner on login | Deferred to v2 — not in scope for this milestone |
| Already-confirmed guard on second link click | Deferred to v2 — not in scope for this milestone |
| Email confirmation for Google/OAuth users | OAuth proves email ownership; Strapi sets `confirmed: true` automatically on OAuth registration |
| Confirmation token expiry/cleanup cron | Strapi v5 manages its own confirmation token lifecycle natively |
| Custom `email-confirmation` content type | Strapi's native `confirmed` + `confirmationToken` fields cover the need; no parallel system needed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PWDR-04     | 079   | Complete |
| PWDR-01     | 080   | Complete |
| PWDR-02     | 080   | Complete |
| PWDR-03     | 080   | Complete |
| REGV-03     | 081   | Complete |
| REGV-04     | 081   | Complete |
| REGV-05     | 081   | Complete |
| REGV-01     | 082   | Pending |
| REGV-02     | 082   | Pending |
| REGV-06     | 082   | Pending |

**Coverage:**
- v1.37 requirements: 10 total
- Mapped to phases: 10 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 — Traceability updated after roadmap creation (phases 079–082)*

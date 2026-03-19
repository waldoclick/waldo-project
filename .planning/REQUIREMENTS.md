# Requirements: Waldo Project

**Defined:** 2026-03-19
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.45 Requirements

Requirements for User Onboarding milestone. Each maps to roadmap phases.

### Onboarding Layout

- [ ] **LAYOUT-01**: `/onboarding` and `/onboarding/thankyou` use a dedicated `onboarding` layout with centered Waldo logo, no header, no footer, no navigation
- [x] **LAYOUT-02**: `OnboardingDefault` component uses BEM classes `onboarding onboarding--default` with logo centered above the form
- [x] **LAYOUT-03**: `OnboardingThankyou` component uses BEM classes `onboarding onboarding--thankyou` with thank you message and 2 action buttons

### Onboarding Guard

- [ ] **GUARD-01**: Authenticated users with incomplete profiles are redirected to `/onboarding` on any non-exempt page navigation
- [ ] **GUARD-02**: Users with complete profiles cannot access `/onboarding` (redirected to home)
- [ ] **GUARD-03**: Onboarding guard is client-only (SSR-safe) and runs after auth guard
- [ ] **GUARD-04**: Auth pages (`/login`, `/registro`, `/logout`) are exempt from onboarding redirect

### Profile Form

- [x] **FORM-01**: `/onboarding` page reuses `FormProfile` for profile completion
- [x] **FORM-02**: `FormProfile` emits a `@success` event (or accepts `redirectTo` prop) so parent controls post-submit navigation
- [x] **FORM-03**: Existing `FormProfile` behavior at `/cuenta/perfil/editar` is unchanged (backward compatible)

### Thank You Page

- [x] **THANK-01**: `/onboarding/thankyou` displays "Muchas gracias por registrarte" with descriptive text
- [x] **THANK-02**: Primary button "Crear mi primer anuncio" navigates to `/anunciar`
- [x] **THANK-03**: Secondary button "Volver a Waldo" navigates to the page the user was on before onboarding (via `appStore.referer`), defaulting to `/` if no referer

### Integration

- [ ] **INTEG-01**: Google One Tap is suppressed on `/onboarding` pages
- [ ] **INTEG-02**: `/onboarding` pages are excluded from `referer.global.ts` (not stored as return URLs)
- [ ] **INTEG-03**: Onboarding guard saves pre-redirect URL to `appStore.referer` before redirecting

## Future Requirements

(None deferred for this milestone)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-step onboarding wizard | Profile form is a single page; wizard adds complexity without value |
| `onboarding_completed` boolean on User schema | `isProfileComplete()` field checks are sufficient; no Strapi schema change needed |
| Aligning `isProfileComplete()` with full Yup schema | Current 5-field check (firstname, lastname, rut, phone, commune) is intentionally minimum viable |
| Onboarding for dashboard users | Dashboard is admin-only; onboarding is consumer-facing |
| Progress indicators / stepper UI | Single-page form doesn't need step indicators |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | Phase 099 | Pending |
| LAYOUT-02 | Phase 099 | Complete |
| LAYOUT-03 | Phase 099 | Complete |
| GUARD-01 | Phase 100 | Pending |
| GUARD-02 | Phase 100 | Pending |
| GUARD-03 | Phase 100 | Pending |
| GUARD-04 | Phase 100 | Pending |
| FORM-01 | Phase 099 | Complete |
| FORM-02 | Phase 099 | Complete |
| FORM-03 | Phase 099 | Complete |
| THANK-01 | Phase 099 | Complete |
| THANK-02 | Phase 099 | Complete |
| THANK-03 | Phase 099 | Complete |
| INTEG-01 | Phase 101 | Pending |
| INTEG-02 | Phase 101 | Pending |
| INTEG-03 | Phase 101 | Pending |

**Coverage:**
- v1.45 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*

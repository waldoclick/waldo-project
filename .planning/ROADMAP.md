# Roadmap: Waldo Project

## Milestones

- ⛔ **v1.25 Unified Checkout** — forcibly closed 2026-03-09. See `.planning/milestones/v1.25-ROADMAP.md`
- ✅ **v1.26 Mostrar comprobante Webpay** — Phase 060 (shipped 2026-03-11). See `.planning/milestones/v1.26-ROADMAP.md`
- ✅ **v1.27 Reparar eventos GA4 ecommerce** — Phase 061 (shipped 2026-03-12). See `.planning/milestones/v1.27-ROADMAP.md`
- ✅ **v1.28 Logout Store Cleanup** — Phase 062 (shipped 2026-03-12). See `.planning/milestones/v1.28-ROADMAP.md`
- ✅ **v1.29 News Manager** — Phases 063–064 (shipped 2026-03-12). See `.planning/milestones/v1.29-ROADMAP.md`
- ✅ **v1.30 Blog Public Views** — Phases 065–068 (shipped 2026-03-13). See `.planning/milestones/v1.30-ROADMAP.md`
- ✅ **v1.31 Article Manager Improvements** — Phases 069–070 (shipped 2026-03-13). See `.planning/milestones/v1.31-ROADMAP.md`
- ✅ **v1.32 Gemini AI Service** — Phase 071 (shipped 2026-03-13). See `.planning/milestones/v1.32-ROADMAP.md`
- ✅ **v1.33 Anthropic Claude AI Service** — Phase 072 (shipped 2026-03-13). See `.planning/milestones/v1.33-ROADMAP.md`
- ✅ **v1.34 LightBoxArticles** — Phases 073–074 (shipped 2026-03-13). See `.planning/milestones/v1.34-ROADMAP.md`
- ✅ **v1.35 Gift Reservations to Users** — Phases 075–076 (shipped 2026-03-13). See `.planning/milestones/v1.35-ROADMAP.md`
- ✅ **v1.36 Two-Step Login Verification** — Phases 077–078 (shipped 2026-03-14). See `.planning/milestones/v1.36-ROADMAP.md`
- 🚧 **v1.37 Email Authentication Flows** — Phases 079–082 (in progress)

## Phases

<details>
<summary>✅ v1.36 Two-Step Login Verification (Phases 077–078) — SHIPPED 2026-03-14</summary>

- [x] Phase 077: Strapi 2-Step Backend (4/4 plans) — completed 2026-03-13
- [x] Phase 078: Dashboard Verify Flow (2/2 plans) — completed 2026-03-14

</details>

<details>
<summary>✅ v1.35 Gift Reservations to Users (Phases 075–076) — SHIPPED 2026-03-13</summary>

- [x] Phase 075: Strapi Gift Endpoints (2/2 plans) — completed 2026-03-13
- [x] Phase 076: Dashboard Gift Lightbox (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.34 LightBoxArticles (Phases 073–074) — SHIPPED 2026-03-13</summary>

- [x] Phase 073: Tavily Search Backend (2/2 plans) — completed 2026-03-13
- [x] Phase 074: LightBoxArticles Dashboard (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.33 Anthropic Claude AI Service (Phase 072) — SHIPPED 2026-03-13</summary>

- [x] Phase 072: Anthropic Claude AI Service (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.32 Gemini AI Service (Phase 071) — SHIPPED 2026-03-13</summary>

- [x] Phase 071: Gemini AI Service (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.31 Article Manager Improvements (Phases 069–070) — SHIPPED 2026-03-13</summary>

- [x] Phase 069: Strapi Schema (1/1 plan) — completed 2026-03-13
- [x] Phase 070: Dashboard Form & Detail (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.30 Blog Public Views (Phases 065–068) — SHIPPED 2026-03-13</summary>

- [x] Phase 065: Strapi Slug Field (1/1 plan) — completed 2026-03-13
- [x] Phase 066: Article Infrastructure (2/2 plans) — completed 2026-03-13
- [x] Phase 067: Blog Listing Page (3/3 plans) — completed 2026-03-13
- [x] Phase 068: Blog Detail Page (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.29 News Manager (Phases 063–064) — SHIPPED 2026-03-12</summary>

- [x] Phase 063: News Content Type (1/1 plan) — completed 2026-03-12
- [x] Phase 064: Dashboard Articles UI (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.28 Logout Store Cleanup (Phase 062) — SHIPPED 2026-03-12</summary>

- [x] Phase 062: Logout Store Cleanup (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.27 Reparar eventos GA4 ecommerce (Phase 061) — SHIPPED 2026-03-12</summary>

- [x] Phase 061: Fix GA4 ecommerce events (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.26 Mostrar comprobante Webpay (Phase 060) — SHIPPED 2026-03-11</summary>

- [x] Phase 060: Mostrar comprobante Webpay (3/3 plans) — completed 2026-03-11

</details>

### v1.37 Email Authentication Flows (Phases 079–082)

- [x] **Phase 079: Website Verify Flow + MJML Fix** — Close the v1.36 carry-forward: execute the website 2-step verify UX + fix the "5 minutos" copy error in verification-code.mjml (completed 2026-03-14)
- [x] **Phase 080: Password Reset MJML + Context Routing** — Replace Strapi's plain-text password reset with a branded MJML email that routes to the correct app's reset page based on the requester's role (completed 2026-03-14)
- [ ] **Phase 081: Email Verification Frontend** — All Nuxt changes (confirmar page, register redirect, login unconfirmed handling) deployed and verified before the backend toggle is flipped
- [ ] **Phase 082: Email Verification Backend Activation** — DB migration + Strapi Admin Panel config + email_confirmation toggle ON; the risky atomic step that locks in the full email auth story

## Phase Details

### Phase 079: Website Verify Flow + MJML Fix
**Goal**: The website's 2-step login verify UX is formally complete and the verification email shows the correct 15-minute expiry
**Depends on**: Nothing (carry-forward code already exists; MJML fix is independent)
**Requirements**: PWDR-04 (VSTEP-13–16 are carry-forward from v1.36, formally executed here)
**Success Criteria** (what must be TRUE):
  1. A website user who logs in with email/password is redirected to `/login/verificar` and can complete 2-step verification to receive a session JWT
  2. A website user can request a resend of the verification code from the `/login/verificar` page, with a 60-second cooldown enforced in the UI
  3. The verification email received by the user reads "15 minutos" (not "5 minutos") for the code expiry
  4. Google OAuth login on the website bypasses the verify-code step entirely and logs the user in directly
**Plans**: 1 plan
Plans:
- [ ] 079-02-PLAN.md — Fix "5 minutos" → "15 minutos" in verification-code.mjml

### Phase 080: Password Reset MJML + Context Routing
**Goal**: Dashboard admins receive a branded MJML password reset email pointing to the dashboard's reset page; website users receive one pointing to the website's reset page
**Depends on**: Phase 079 (MJML templates are validated; independent otherwise)
**Requirements**: PWDR-01, PWDR-02, PWDR-03
**Success Criteria** (what must be TRUE):
  1. A user who requests password reset from the website receives a branded MJML email (not Strapi's plain-text email) containing a reset link to `waldo.click/auth/reset-password`
  2. A dashboard admin who requests password reset from the dashboard receives a branded MJML email containing a reset link to `dashboard.waldo.click/auth/reset-password`
  3. Only one email is sent per forgot-password request (no double-send from original controller + MJML override)
  4. The `DASHBOARD_URL` environment variable drives the dashboard reset URL; changing the env var correctly changes the link destination without a code deploy
**Plans**: 2 plans
Plans:
- [ ] 080-01-PLAN.md — TDD: overrideForgotPassword controller + strapi-server wire-up + DASHBOARD_URL env var
- [ ] 080-02-PLAN.md — reset-password.mjml template + context routing in both FormForgotPassword.vue components

### Phase 081: Email Verification Frontend
**Goal**: All Nuxt frontend changes for email confirmation are deployed and working in production before the Strapi toggle is activated
**Depends on**: Phase 079, Phase 080
**Requirements**: REGV-03, REGV-04, REGV-05
**Success Criteria** (what must be TRUE):
  1. After completing the registration form, the user lands on `/registro/confirmar` (not `/login`) and sees their email address displayed along with instructions to check their inbox
  2. The `/registro/confirmar` page has a working "Reenviar email" button that triggers a new confirmation email, with a 60-second cooldown shown in the UI
  3. When an unconfirmed user attempts to log in on the website, they see an actionable error message with a "Reenviar confirmación" option — not a generic error Swal
  4. When an unconfirmed user attempts to log in on the dashboard, they see the same actionable error handling with a resend option
  5. A new registration that returns no JWT (email confirmation mode) does NOT corrupt the auth state (`setToken(undefined)` never called)
**Plans**: 2 plans
Plans:
- [ ] 081-01-PLAN.md — FormRegister.vue setToken guard + /registro/confirmar page
- [ ] 081-02-PLAN.md — Both FormLogin.vue unconfirmed-user inline resend section

### Phase 082: Email Verification Backend Activation
**Goal**: Email confirmation is activated in production with all existing users migrated, completing the full email auth story
**Depends on**: Phase 081 (frontend must be deployed and verified first — the toggle is irreversible until manually undone)
**Requirements**: REGV-01, REGV-02, REGV-06
**Success Criteria** (what must be TRUE):
  1. All users registered before this phase have `confirmed = true` in the database (zero lockout risk from the migration)
  2. A new user who registers via the form cannot log in until they click the confirmation link in their email
  3. A new user who registers via Google OAuth is automatically confirmed and can log in immediately without any email confirmation step
  4. The confirmation link in the email redirects the user to `waldo.click/login` upon successful confirmation
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
| 060   | v1.26     | 3/3            | Complete    | 2026-03-11 |
| 061   | v1.27     | 2/2            | Complete    | 2026-03-12 |
| 062   | v1.28     | 2/2            | Complete    | 2026-03-12 |
| 063   | v1.29     | 1/1            | Complete    | 2026-03-12 |
| 064   | v1.29     | 2/2            | Complete    | 2026-03-12 |
| 065   | v1.30     | 1/1            | Complete    | 2026-03-13 |
| 066   | v1.30     | 2/2            | Complete    | 2026-03-13 |
| 067   | v1.30     | 3/3            | Complete    | 2026-03-13 |
| 068   | v1.30     | 2/2            | Complete    | 2026-03-13 |
| 069   | v1.31     | 1/1            | Complete    | 2026-03-13 |
| 070   | v1.31     | 1/1            | Complete    | 2026-03-13 |
| 071   | v1.32     | 1/1            | Complete    | 2026-03-13 |
| 072   | v1.33     | 1/1            | Complete    | 2026-03-13 |
| 073   | v1.34     | 2/2            | Complete    | 2026-03-13 |
| 074   | v1.34     | 2/2            | Complete    | 2026-03-13 |
| 075   | v1.35     | 2/2            | Complete    | 2026-03-13 |
| 076   | v1.35     | 2/2            | Complete    | 2026-03-13 |
| 077   | v1.36     | 4/4            | Complete    | 2026-03-13 |
| 078   | v1.36     | 2/2            | Complete    | 2026-03-14 |
| 079   | 1/1 | Complete    | 2026-03-14 | -          |
| 080   | 2/2 | Complete    | 2026-03-14 | -          |
| 081   | 1/2 | In Progress|  | -          |
| 082   | v1.37     | 0/?            | Not started | -          |

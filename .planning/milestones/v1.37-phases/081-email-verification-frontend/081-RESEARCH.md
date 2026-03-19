# Phase 081: Email Verification Frontend — Research

**Researched:** 2026-03-14
**Domain:** Nuxt 4 / Vue 3 frontend changes for email confirmation flow
**Confidence:** HIGH — all findings verified by reading current codebase directly
**Discovery level:** 0 — zero new dependencies; all patterns already in production

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REGV-03 | After form registration, user lands on `/registro/confirmar` instead of `/login` | `FormRegister.vue` calls `router.push('/login')` after `register()` — must redirect to `/registro/confirmar` instead; also requires `if (response.jwt)` guard before `setToken()` |
| REGV-04 | Confirmation page displays user email and a working resend button with 60s cooldown | New `/registro/confirmar` page using `useState('registrationEmail')` for email; `POST /api/auth/send-email-confirmation` is the native Strapi resend endpoint |
| REGV-05 | Unconfirmed user login shows actionable error with resend option (website + dashboard) | Both `FormLogin.vue` files detect `"Your account email is not confirmed"` error — currently show generic Swal; must show actionable UI with resend button calling `POST /api/auth/send-email-confirmation` |
</phase_requirements>

---

## Summary

Phase 081 is purely frontend — no Strapi code changes. All infrastructure already exists:
- `useStrapiClient()` for custom endpoint calls
- `useState()` for transient SSR-safe state (established pattern: `pendingToken`)
- `POST /api/auth/send-email-confirmation` — native Strapi endpoint, no custom code needed
- `/registro.vue` + `FormRegister.vue` — registration page exists, needs redirect + guard fix
- Both `FormLogin.vue` files already detect `"Your account email is not confirmed"` error text

**Two coordinated changes:**
1. **`FormRegister.vue`** — add `if (response.jwt)` guard before `setToken()` + redirect to `/registro/confirmar` with email in `useState`
2. **New `/registro/confirmar.vue` page** — display email from `useState`, resend button calling Strapi native endpoint, 60s cooldown (same pattern as `/login/verificar.vue`)
3. **Website `FormLogin.vue`** — replace generic Swal for unconfirmed error with inline resend button UI
4. **Dashboard `FormLogin.vue`** — same unconfirmed error handling as website

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `useStrapiClient()` | @nuxtjs/strapi v2 | Call `POST /api/auth/send-email-confirmation` directly | Already used in `FormVerifyCode.vue`, `FormLogin.vue` |
| `useState()` | Nuxt 4 | Pass `registrationEmail` from `FormRegister.vue` to `/registro/confirmar` | Established pattern: `pendingToken` uses same mechanism |
| `useStrapiAuth().register()` | @nuxtjs/strapi v2 | Current register call — returns `{ jwt?, user }` | Already in `FormRegister.vue` |
| Swal (useSweetAlert2) | existing | Error display for register/login failures | Already in both `FormLogin.vue` files |

---

## Architecture Patterns

### Pattern 1: Transient State via `useState()` (established)

Already used for `pendingToken` in both FormLogin files and FormVerifyCode. Same pattern for `registrationEmail`:

```typescript
// In FormRegister.vue (after successful register):
const registrationEmail = useState('registrationEmail', () => '')
registrationEmail.value = form.value.email
router.push('/registro/confirmar')

// In /registro/confirmar.vue:
const registrationEmail = useState('registrationEmail', () => '')
// Guard: if empty, user navigated directly → redirect to /registro
onMounted(() => {
  if (!registrationEmail.value) router.replace('/registro')
})
```

### Pattern 2: 60s Cooldown Resend (established in `/login/verificar.vue`)

`/login/verificar.vue` already has this exact pattern: `resendCooldown`, `startCountdown()`, `setInterval`, `onUnmounted` cleanup, `formRef` expose pattern. Replicate exactly.

### Pattern 3: Strapi Native Resend Endpoint

```typescript
// POST /api/auth/send-email-confirmation
// Body: { email: string }
// Response: { email: string } on success
// No auth required

const client = useStrapiClient()
await client('/auth/send-email-confirmation', {
  method: 'POST',
  body: { email: registrationEmail.value }
})
```

### Pattern 4: Register Response Guard (`if (response.jwt)`)

Currently, `FormRegister.vue` calls `useStrapiAuth().register()` which internally calls `setToken(response.jwt)`. When `email_confirmation: true` (Phase 082), Strapi returns `{ user }` only (no JWT). The `setToken(undefined)` corrupts auth state.

**Fix:** `register()` in `@nuxtjs/strapi v2` returns the full response object. Add:
```typescript
const response = await register({ ...form.value, recaptchaToken: token })
// Only set token / proceed with login if a JWT was returned
if (response.jwt) {
  // Phase 082 activation path: normal JWT login flow
  router.push('/login')
} else {
  // Email confirmation mode: redirect to confirm page
  registrationEmail.value = form.value.email
  router.push('/registro/confirmar')
}
```

**Important:** `useStrapiAuth().register()` in @nuxtjs/strapi v2 internally calls `setToken()`. With email confirmation active, it receives `undefined` for jwt — this corrupts the auth store. The fix is to call `useStrapiClient()` directly for registration instead of `useStrapiAuth().register()`, so we control the `setToken` call.

**Verified approach:** Call `useStrapiClient()` directly (same as FormLogin.vue does for login), check `if (response.jwt)`, only call `setToken(response.jwt)` when present.

### Pattern 5: Inline Resend Option for Unconfirmed Login Error

Both `FormLogin.vue` files currently show a Swal when `errorMessage === "Your account email is not confirmed"`. The requirement (REGV-05) is an actionable error — not necessarily a completely new component. Options:

- **Inline in form** (preferred): Show a different div below the submit button with the error message + resend button (hidden by default, visible when `showResendConfirmation` is `true`)
- This matches the website's existing login page structure (help section already exists below the form)

**Dashboard note:** The dashboard `FormLogin.vue` uses TypeScript (`<script setup lang="ts">`), website uses plain `<script setup>`. Both patterns work; maintain per-file consistency.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email resend | Custom Strapi endpoint | `POST /api/auth/send-email-confirmation` | Native Strapi — no custom code needed |
| State handoff | URL query params or localStorage | `useState('registrationEmail')` | SSR-safe, established pattern, cleared on navigation |
| Cooldown timer | Custom debounce/throttle | `setInterval` + `onUnmounted` cleanup | Exact pattern already in `/login/verificar.vue` |

---

## Common Pitfalls

### Pitfall 1: `setToken(undefined)` Corrupts Auth State
**What goes wrong:** `useStrapiAuth().register()` calls `setToken(response.jwt)` internally. When email_confirmation is active, `response.jwt` is `undefined` → `setToken(undefined)` wipes the auth cookie/localStorage with `undefined`.
**Why it happens:** `@nuxtjs/strapi v2` `register()` composable blindly calls `setToken` regardless of JWT presence.
**How to avoid:** Do NOT use `useStrapiAuth().register()`. Use `useStrapiClient()` to `POST /api/auth/local/register` directly. Check `if (response.jwt)` before calling `setToken(response.jwt)`.
**STATE.md decision:** "if (response.jwt) guard in FormRegister.vue before setToken() — email confirmation returns no JWT"

### Pitfall 2: `/registro/confirmar` Accessible by Logged-In Users
**What goes wrong:** Guest middleware (`apps/website/app/middleware/guest.ts`) redirects logged-in users to `/`. If `/registro/confirmar` uses `definePageMeta({ middleware: ['guest'] })`, logged-in users bounce.
**How to avoid:** Do NOT use `guest` middleware on `/registro/confirmar`. Use no auth middleware (or create a "no-middleware" page).

### Pitfall 3: `/registro/confirmar` State Lost on Refresh
**What goes wrong:** `useState('registrationEmail')` is transient — page refresh clears it. User sees blank email on confirmation page.
**How to avoid:** `onMounted` guard: `if (!registrationEmail.value) router.replace('/registro')` — redirects user back to registration form cleanly.

### Pitfall 4: Resend on `/registro/confirmar` vs Login Page Are Different Endpoints
**What goes wrong:** Reusing the `/auth/resend-code` endpoint (2-step verification) for email confirmation resend.
**How to avoid:** Email confirmation resend uses `POST /api/auth/send-email-confirmation` (Strapi native). The 2-step verification resend uses `POST /api/auth/resend-code` (custom). These are entirely different flows.

### Pitfall 5: Guest Middleware Blocks `/registro/confirmar` via `useStrapiUser` Check
**What goes wrong:** The website's `guest.ts` middleware checks `useStrapiUser()` — if user is null AND page has guest middleware, it passes through. But after registration with email confirmation, user object may partially be set (Strapi returns `{ user }` with confirmed=false).
**How to avoid:** Confirm that the registration flow using `useStrapiClient()` directly does NOT set `useStrapiUser()` (since no `setToken` call → no auth headers → no user fetch). The `/registro/confirmar` page should be accessible without auth.

---

## File Change Map

### Website (`apps/website`)

| File | Action | Change |
|------|--------|--------|
| `app/components/FormRegister.vue` | MODIFY | Replace `useStrapiAuth().register()` with direct client POST; add `if (response.jwt)` guard; redirect to `/registro/confirmar` |
| `app/pages/registro/confirmar.vue` | CREATE | New confirmation page with email display, resend button, 60s cooldown |

### Dashboard (`apps/dashboard`)

| File | Action | Change |
|------|--------|--------|
| `app/components/FormLogin.vue` | MODIFY | Add inline resend section for "Your account email is not confirmed" error |

### Website FormLogin

| File | Action | Change |
|------|--------|--------|
| `app/components/FormLogin.vue` (website) | MODIFY | Add inline resend section for unconfirmed error |

**Total files: 4 (1 new, 3 modified)**

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + @nuxt/test-utils |
| Config file | `apps/website/vitest.config.ts` (if exists) |
| Quick run command | `yarn workspace waldo-website test` |
| Full suite command | `yarn workspace waldo-website test` |
| Estimated runtime | ~10 seconds |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REGV-03 | `FormRegister.vue` redirects to `/registro/confirmar` (not `/login`) when no JWT returned | unit | `yarn workspace waldo-website test` | ❌ Wave 0 |
| REGV-03 | `FormRegister.vue` does NOT call `setToken(undefined)` when no JWT in response | unit | `yarn workspace waldo-website test` | ❌ Wave 0 |
| REGV-04 | `/registro/confirmar` redirects to `/registro` if `registrationEmail` is empty | manual | `navigate to /registro/confirmar directly` | manual only |
| REGV-04 | Resend button is disabled for 60 seconds after load | manual | `load page after register` | manual only |
| REGV-05 | Website FormLogin shows resend section when error is "Your account email is not confirmed" | unit | `yarn workspace waldo-website test` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `yarn workspace waldo-website test`
- **Per wave merge:** `yarn workspace waldo-website test`
- **Phase gate:** Full suite green + manual verification before `/gsd-verify-work`

### Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/registro/confirmar` shows correct email + resend button | REGV-04 | Visual/interactive | Complete registration form, verify redirect and email shown |
| Resend button cooldown visible countdown | REGV-04 | Timer-dependent UI | Click resend, observe countdown from 60s |
| Dashboard unconfirmed user sees resend option | REGV-05 | Integration (real Strapi) | Attempt login with unconfirmed account on dashboard |

### Wave 0 Gaps

- [ ] `apps/website/tests/components/FormRegister.test.ts` — stubs for REGV-03 (no-JWT redirect, no setToken)
- [ ] `apps/website/tests/components/FormLoginWebsite.test.ts` — stubs for REGV-05 (unconfirmed error shows resend)

---

## Sources

### Primary (HIGH confidence)
- `apps/website/app/components/FormRegister.vue` — current register implementation
- `apps/website/app/components/FormLogin.vue` — current login + error handling
- `apps/dashboard/app/components/FormLogin.vue` — current dashboard login
- `apps/website/app/pages/login/verificar.vue` — 60s cooldown pattern (exact template for confirmar page)
- `apps/website/app/components/FormVerifyCode.vue` — resend client pattern
- `.planning/research/STACK.md` — Strapi email_confirmation behavior, send-email-confirmation endpoint
- `.planning/STATE.md` — key decisions: `if (response.jwt)` guard, `setToken(undefined)` risk

### Secondary (MEDIUM confidence)
- `@nuxtjs/strapi v2` behavior for `register()` — inferred from STACK.md + existing FormLogin patterns

---

**Research date:** 2026-03-14
**Valid until:** Stable — all patterns from installed codebase

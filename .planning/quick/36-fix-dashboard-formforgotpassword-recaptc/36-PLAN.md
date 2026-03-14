---
phase: 36-fix-dashboard-formforgotpassword-recaptc
plan: 36
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/FormForgotPassword.vue
autonomous: true
requirements:
  - RECAPTCHA-DASHBOARD-01
must_haves:
  truths:
    - "Forgot-password POST body includes the reCAPTCHA token"
    - "Strapi recaptcha middleware accepts the request and sends the reset email"
  artifacts:
    - path: "apps/dashboard/app/components/FormForgotPassword.vue"
      provides: "reCAPTCHA token included in forgotPassword payload"
      contains: "recaptchaToken: token"
  key_links:
    - from: "apps/dashboard/app/components/FormForgotPassword.vue"
      to: "Strapi POST /api/auth/forgot-password"
      via: "forgotPassword({ email, recaptchaToken, context })"
      pattern: "recaptchaToken"
---

<objective>
Fix the dashboard `FormForgotPassword.vue` so the reCAPTCHA token obtained from `$recaptcha.execute()` is actually forwarded in the `forgotPassword` POST body.

Purpose: Without `recaptchaToken` in the payload, the Strapi `recaptcha.ts` middleware rejects every forgot-password request, making password recovery completely broken for dashboard users.
Output: One-line fix — `recaptchaToken: token` added to the `forgotPassword` call, mirroring the already-working website implementation.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Key interfaces for this fix -->
<interfaces>
<!-- From apps/website/app/components/FormForgotPassword.vue (working reference) -->
```typescript
// Correct call — token passed as recaptchaToken field
await forgotPassword({
  email: values.email,
  recaptchaToken: token,   // ← this line is missing in the dashboard version
  context: "website",
} as any);
```

<!-- From apps/dashboard/app/components/FormForgotPassword.vue (broken) -->
```typescript
// Bug: token is obtained but never forwarded
const token = await $recaptcha.execute("submit");

await forgotPassword({
  email: values.email as string,
  context: "dashboard",   // ← recaptchaToken: token is missing here
} as any);
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add recaptchaToken to dashboard forgotPassword payload</name>
  <files>apps/dashboard/app/components/FormForgotPassword.vue</files>
  <action>
    In `apps/dashboard/app/components/FormForgotPassword.vue`, inside the `onSubmit` handler, add `recaptchaToken: token` to the `forgotPassword` call — between `email` and `context`.

    Replace:
    ```typescript
    await forgotPassword({
      email: values.email as string,
      context: "dashboard",
    } as any);
    ```

    With:
    ```typescript
    await forgotPassword({
      email: values.email as string,
      recaptchaToken: token,
      context: "dashboard",
    } as any);
    ```

    No other changes. The `token` variable is already declared on the line above — it just wasn't being used.
  </action>
  <verify>
    <automated>grep -n "recaptchaToken" apps/dashboard/app/components/FormForgotPassword.vue</automated>
  </verify>
  <done>`recaptchaToken: token` is present in the forgotPassword payload and the file compiles without TypeScript errors (`yarn workspace dashboard typecheck` passes or reports no new errors on this file).</done>
</task>

</tasks>

<verification>
- `grep -n "recaptchaToken" apps/dashboard/app/components/FormForgotPassword.vue` returns line with `recaptchaToken: token`
- Dashboard and website FormForgotPassword.vue now pass the same fields to `forgotPassword` (email, recaptchaToken, context differ only in context value)
</verification>

<success_criteria>
Submitting the forgot-password form in the dashboard no longer results in a reCAPTCHA rejection from Strapi — the token is included in every POST and the middleware accepts the request.
</success_criteria>

<output>
After completion, create `.planning/quick/36-fix-dashboard-formforgotpassword-recaptc/36-SUMMARY.md`
</output>

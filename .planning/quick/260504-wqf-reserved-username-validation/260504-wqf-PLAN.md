---
phase: 260504-wqf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/shared/constants.ts
  - apps/website/app/components/FormRegister.vue
  - apps/website/app/components/FormUsername.vue
  - apps/website/app/pages/[slug].vue
  - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "A user cannot register with username 'login', 'blog', 'pro', or any other first-level route slug"
    - "Frontend shows 'Este nombre de usuario no está disponible' before hitting the API"
    - "Backend rejects reserved usernames in registerUserLocal with a 400 error"
    - "OAuth registration auto-appends a suffix if the derived username is reserved"
    - "[slug].vue uses RESERVED_USERNAMES as its excludedRoutes source — no separate maintenance"
  artifacts:
    - path: "apps/website/app/shared/constants.ts"
      provides: "RESERVED_USERNAMES constant"
      contains: "export const RESERVED_USERNAMES"
    - path: "apps/website/app/components/FormUsername.vue"
      provides: "Yup reserved-username test on username field"
    - path: "apps/strapi/src/extensions/users-permissions/controllers/authController.ts"
      provides: "Backend reserved-username rejection in registerUserLocal and registerUserAuth"
  key_links:
    - from: "FormUsername.vue"
      to: "RESERVED_USERNAMES"
      via: "import from @/shared/constants"
    - from: "[slug].vue"
      to: "RESERVED_USERNAMES"
      via: "import from @/shared/constants — replaces inline excludedRoutes array"
    - from: "authController.ts"
      to: "RESERVED_USERNAMES"
      via: "local const array — same list as frontend"
---

<objective>
Prevent route collisions caused by users registering with a username that matches a first-level page slug (e.g. `login`, `blog`, `pro`).

Purpose: `waldo.click/[slug]` serves user profile pages — if a user claims a slug that corresponds to a real page, that page becomes unreachable.
Output: RESERVED_USERNAMES constant shared across frontend components and [slug].vue; backend rejects reserved names at registration; OAuth registration appends a suffix when needed.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/app/shared/constants.ts
@apps/website/app/components/FormRegister.vue
@apps/website/app/components/FormUsername.vue
@apps/website/app/pages/[slug].vue
@apps/strapi/src/extensions/users-permissions/controllers/authController.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add RESERVED_USERNAMES constant and wire into frontend components</name>
  <files>
    apps/website/app/shared/constants.ts,
    apps/website/app/components/FormRegister.vue,
    apps/website/app/components/FormUsername.vue,
    apps/website/app/pages/[slug].vue
  </files>
  <action>
**Step A — Add constant to constants.ts**

Append after the existing exports:

```ts
export const RESERVED_USERNAMES = [
  'login',
  'registro',
  'blog',
  'anuncios',
  'anunciar',
  'contacto',
  'cuenta',
  'pagar',
  'pro',
  'packs',
  'sitemap',
  'onboarding',
  'recuperar-contrasena',
  'restablecer-contrasena',
  'preguntas-frecuentes',
  'condiciones-de-uso',
  'politicas-de-privacidad',
  'dev',
] as const;
```

**Step B — FormRegister.vue**

There is NO `username` yup rule in this component — username is derived programmatically from `email.split('@')[0]` inside `handleSubmit` at line ~350. The reserved check must go as a runtime guard in `handleSubmit`, immediately after `form.value.username = emailParts[0] ?? ""` and before the API call.

1. Add import at the top of the `<script setup>` block (alongside existing imports):
   ```ts
   import { RESERVED_USERNAMES } from '@/shared/constants';
   ```

2. In `handleSubmit`, after the line `form.value.username = emailParts[0] ?? ""`, add:
   ```ts
   if (RESERVED_USERNAMES.includes(form.value.username.toLowerCase() as typeof RESERVED_USERNAMES[number])) {
     loading.value = false;
     return Swal.fire('Error', 'Este nombre de usuario no está disponible', 'error');
   }
   ```

   Note: `loading.value` is set to `true` before this block — reset it before returning so the button is re-enabled.

**Step C — FormUsername.vue**

This component has an actual `username` yup schema with `.matches()`. Add a `.test()` chained after `.matches()`:

1. Add import at the top of `<script setup>`:
   ```js
   import { RESERVED_USERNAMES } from '@/shared/constants';
   ```

2. Update the schema:
   ```js
   const schema = yup.object({
     username: yup
       .string()
       .required('El nombre de usuario es requerido')
       .matches(
         /^[\w.]+$/,
         'Solo se permiten letras, números, puntos y guiones bajos',
       )
       .test(
         'reserved',
         'Este nombre de usuario no está disponible',
         (val) => !RESERVED_USERNAMES.includes(val?.toLowerCase() ?? ''),
       ),
   });
   ```

**Step D — [slug].vue**

This file already has a local `excludedRoutes` array at lines 44-55, but it is incomplete (missing `blog`, `pro`, `packs`, `pagar`, `onboarding`, `dev`, `condiciones-de-uso`, `sitemap`, `restablecer-contrasena`). Replace it with the shared constant to eliminate dual-maintenance:

1. Add import at the top of `<script setup lang="ts">`:
   ```ts
   import { RESERVED_USERNAMES } from '@/shared/constants';
   ```

2. Remove the entire `const excludedRoutes = [...]` declaration (lines 44-55).

3. Replace the `if (excludedRoutes.includes(slug))` guard with:
   ```ts
   if (RESERVED_USERNAMES.includes(slug as typeof RESERVED_USERNAMES[number])) {
   ```

The rest of the `throw createError(...)` block stays unchanged.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace website typecheck 2>&1 | tail -20</automated>
  </verify>
  <done>TypeScript compiles clean on website. RESERVED_USERNAMES is exported from constants.ts. FormUsername yup schema includes the reserved test. FormRegister handleSubmit has the early-return guard. [slug].vue uses RESERVED_USERNAMES instead of inline excludedRoutes.</done>
</task>

<task type="auto">
  <name>Task 2: Backend reserved-username validation in authController.ts</name>
  <files>
    apps/strapi/src/extensions/users-permissions/controllers/authController.ts
  </files>
  <action>
Add a local `RESERVED_USERNAMES` array at the top of the file (after the existing imports, before `createUserReservations`). Use the same list as the frontend constant — backend owns its own copy, no cross-app import:

```ts
const RESERVED_USERNAMES = new Set([
  'login',
  'registro',
  'blog',
  'anuncios',
  'anunciar',
  'contacto',
  'cuenta',
  'pagar',
  'pro',
  'packs',
  'sitemap',
  'onboarding',
  'recuperar-contrasena',
  'restablecer-contrasena',
  'preguntas-frecuentes',
  'condiciones-de-uso',
  'politicas-de-privacidad',
  'dev',
]);
```

Use a `Set` for O(1) lookup.

**In `registerUserLocal`:**

After the required-fields check (the `if (is_company === undefined || !firstname || ...)` block that returns `ctx.badRequest("All fields are required")`), and before `validatePasswordStrength`, insert:

```ts
if (RESERVED_USERNAMES.has(username.toLowerCase())) {
  return ctx.badRequest('Username not available');
}
```

Order must be: required-fields check → reserved-username check → password strength → ensureUniqueUsername.

**In `registerUserAuth`:**

The OAuth callback controller (`callbackController`) creates the user row before this code runs — so by the time we reach our wrapper, `user.username` already exists in the DB. The fix is a post-creation update:

After `const user = ctx.response.body?.user || ctx.state.user;`, add:

```ts
if (user?.id && RESERVED_USERNAMES.has((user.username ?? '').toLowerCase())) {
  const suffix = Math.random().toString(36).slice(2, 6);
  const newUsername = `${user.username}_${suffix}`;
  await strapi.db.query('plugin::users-permissions.user').update({
    where: { id: user.id },
    data: { username: newUsername },
  });
  // Reflect corrected username in response so the JWT carries the right value
  if (ctx.response.body?.user) {
    ctx.response.body.user.username = newUsername;
  }
}
```

Place this block before the `createUserReservations(user)` call.

Do NOT call `ensureUniqueUsername` for the OAuth suffix — the 4-char random string (`Math.random().toString(36).slice(2,6)`) provides ~36^4 = 1.7M combinations, sufficient for collision avoidance in practice. Keeping it simple avoids an extra DB query on every OAuth login.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace strapi ts:check 2>&1 | tail -20</automated>
  </verify>
  <done>TypeScript compiles clean on strapi. RESERVED_USERNAMES Set declared at module scope. registerUserLocal returns 400 for reserved usernames. registerUserAuth updates username and response body when the OAuth-derived username is reserved.</done>
</task>

</tasks>

<verification>
1. `yarn workspace website typecheck` — no errors
2. `yarn workspace strapi ts:check` — no errors
3. Manual check: FormUsername.vue schema has `.test('reserved', ...)` chained after `.matches()`
4. Manual check: [slug].vue no longer has an inline `excludedRoutes` const — uses RESERVED_USERNAMES import
5. Manual check: authController.ts `RESERVED_USERNAMES` Set includes all 18 slugs
6. Manual check: `registerUserLocal` reserved check appears between required-fields check and `validatePasswordStrength` call
</verification>

<success_criteria>
- RESERVED_USERNAMES exported from apps/website/app/shared/constants.ts with all 18 first-level slugs
- FormUsername.vue yup schema rejects reserved usernames with 'Este nombre de usuario no está disponible'
- FormRegister.vue handleSubmit returns Swal error before API call if derived username is reserved
- [slug].vue uses RESERVED_USERNAMES (import) — old inline excludedRoutes array removed, bug fixed (all 18 slugs now excluded)
- authController.ts registerUserLocal returns ctx.badRequest('Username not available') for reserved names
- authController.ts registerUserAuth appends random suffix and updates user row + response when OAuth derives a reserved username
- No TypeScript errors in website or strapi
</success_criteria>

<output>
After completion, create `.planning/quick/260504-wqf-reserved-username-validation/260504-wqf-SUMMARY.md` with what was built, files changed, and any decisions made.
</output>

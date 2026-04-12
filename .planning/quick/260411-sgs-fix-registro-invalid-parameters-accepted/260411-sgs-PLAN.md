---
phase: 260411-sgs
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
autonomous: false
requirements:
  - FIX-REGISTRO-01
must_haves:
  truths:
    - "A new user can complete the 2-step registration form on the website without receiving an 'Invalid parameters: accepted_age_confirmation, accepted_terms' error"
    - "The three consent booleans (accepted_age_confirmation, accepted_terms, accepted_usage_terms) are persisted to the created user row in Strapi"
    - "When the user does not check all three consents, Strapi still rejects the request with a clear 400 (server-side guard preserved)"
  artifacts:
    - path: "apps/strapi/src/extensions/users-permissions/controllers/authController.ts"
      provides: "registerUserLocal wrapper that strips consent fields before calling Strapi's built-in register, then writes them on the created user"
      contains: "accepted_usage_terms"
  key_links:
    - from: "apps/website/app/components/FormRegister.vue"
      to: "POST /api/auth/local/register"
      via: "useApiClient() body spreads form.value including accepted_age_confirmation, accepted_terms, accepted_usage_terms"
      pattern: "auth/local/register"
    - from: "registerUserLocal wrapper"
      to: "strapi.db.query('plugin::users-permissions.user').update"
      via: "post-register update of the three consent booleans on user.id"
      pattern: "plugin::users-permissions\\.user"
---

<objective>
Bug: on production/staging, submitting the website registration form returns
`Invalid parameters: accepted_age_confirmation, accepted_terms` from Strapi even
though the user checked every consent checkbox. Registration is completely
broken.

Root cause (confirmed by reading the code):

1. `apps/website/app/components/FormRegister.vue` sends `accepted_age_confirmation`,
   `accepted_terms` and `accepted_usage_terms` as top-level fields in the body of
   `POST /api/auth/local/register` (spread of `form.value`).
2. `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`
   exports `registerUserLocal`, a wrapper around the plugin's built-in register
   controller. It destructures the three custom fields from `ctx.request.body`,
   runs a guard, then **reassigns `ctx.request.body = userData`** — where
   `userData` still contains `accepted_age_confirmation` and `accepted_terms`.
3. In Strapi v5, the users-permissions `register` action validates the incoming
   body against an allow-list (`register.allowedFields` / schema attributes as
   whitelisted by the plugin). Custom attributes defined on the user schema are
   **not** automatically accepted by the register action — the plugin rejects
   them with `Invalid parameters: <field-list>`.
4. Additionally, the wrapper was never updated when quick task 260405-tf1 added
   `accepted_usage_terms`: it is not destructured, not validated, and not
   persisted.

Fix: make the wrapper (a) strip all three `accepted_*` fields from
`ctx.request.body` before calling the original `registerController`, and
(b) after the original controller succeeds, write the three booleans directly
onto the newly created user via `strapi.db.query('plugin::users-permissions.user').update`.
This matches the CLAUDE.md rule "Use middlewares/wrappers to extend plugin
behavior — custom controllers in plugin extensions are not supported in
Strapi v5".

Purpose: unblock new user signups on the website.
Output: updated `authController.ts` with a working `registerUserLocal` wrapper
plus verification that a fresh registration completes end to end.
</objective>

<context>
@.planning/STATE.md
@CLAUDE.md
@apps/website/app/components/FormRegister.vue
@apps/strapi/src/extensions/users-permissions/controllers/authController.ts
@apps/strapi/src/extensions/users-permissions/strapi-server.ts
@apps/strapi/src/extensions/users-permissions/content-types/user/schema.json

<interfaces>
<!-- Relevant slices executors must honour. Do NOT explore further — use these. -->

From apps/website/app/components/FormRegister.vue (handleSubmit):
```ts
const response = (await apiClient("/auth/local/register", {
  method: "POST",
  body: {
    ...form.value, // includes accepted_age_confirmation, accepted_terms, accepted_usage_terms
  },
})) as { jwt?: string; user?: { id: number } };
```

From apps/strapi/.../user/schema.json (attributes relevant to this fix):
```json
"accepted_age_confirmation": { "type": "boolean", "default": false },
"accepted_terms":            { "type": "boolean", "default": false },
"accepted_usage_terms":      { "type": "boolean", "default": false }
```

From apps/strapi/.../controllers/authController.ts (current broken wrapper):
```ts
export const registerUserLocal = (registerController) => async (ctx) => {
  const {
    is_company, firstname, lastname, email, rut, password, username,
    accepted_age_confirmation, accepted_terms, // accepted_usage_terms MISSING
  } = ctx.request.body;

  if (/* guard */) return ctx.badRequest("All fields are required");

  const userData = {
    is_company, firstname, lastname, rut, email, password, username,
    accepted_age_confirmation, accepted_terms, // <-- these leak into register
  };
  ctx.request.body = userData;               // still contains custom fields
  await registerController(ctx);             // throws "Invalid parameters"
  ...
};
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Fix registerUserLocal to strip consent fields before registration and persist them after</name>
  <files>apps/strapi/src/extensions/users-permissions/controllers/authController.ts</files>
  <behavior>
    Contract after fix (observable):
    - Request body includes `accepted_age_confirmation`, `accepted_terms`, `accepted_usage_terms` → registration succeeds (201 + user or jwt) and the created user row has the three booleans set to `true`.
    - Any of the three is missing or not strictly `true` → wrapper returns 400 `"All fields are required"` before calling the original controller (unchanged guard, extended to include `accepted_usage_terms`).
    - The body forwarded to the original `registerController(ctx)` contains only the native users-permissions fields (`username`, `email`, `password`, plus the already-allowed custom fields `firstname`, `lastname`, `rut`, `is_company`) — it MUST NOT contain any `accepted_*` key.
    - Side-effects already implemented (ad-reservation creation, MJML email-confirmation) remain intact and run in the same order as today.
  </behavior>
  <action>
    Edit `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`, function `registerUserLocal` only. Do not touch the other exports in the file.

    1. Add `accepted_usage_terms` to the destructuring block from `ctx.request.body`.
    2. Extend the required-fields guard: also reject when `accepted_usage_terms !== true`. Keep the existing Spanish/English mix as-is — the message stays `"All fields are required"` so the current website error handler continues to work.
    3. Build a `forwardBody` object that contains ONLY the fields the built-in register action accepts today:
       `{ is_company, firstname, lastname, rut, email, password, username }`.
       Do NOT include any `accepted_*` field in `forwardBody`. Assign `ctx.request.body = forwardBody` (replacing the old `userData` assignment).
    4. After `await registerController(ctx)`, read back the created user via
       `const user = ctx.response.body?.user || ctx.state.user;` (unchanged line).
       If `user?.id` is truthy, persist the three consent booleans directly:
       ```ts
       await strapi.db.query("plugin::users-permissions.user").update({
         where: { id: user.id },
         data: {
           accepted_age_confirmation,
           accepted_terms,
           accepted_usage_terms,
         },
       });
       ```
       Place this update BEFORE the existing `createUserReservations(user);` call so the consent booleans are on the row before any downstream logic reads them.
    5. Do not mutate `ctx.response.body` — the website expects the original Strapi shape (`{ jwt, user }` or `{ user }` when email confirmation is enabled). The MJML email-confirmation branch below must remain untouched.
    6. Keep all logging, comments, and existing try/catch structure. Update the top-of-function comment to document that consent fields are stripped from the forwarded body and written on the user after creation, citing CLAUDE.md "Use middlewares to extend plugin behavior — custom controllers in plugin extensions are not supported in Strapi v5".
    7. Do NOT introduce `any`. Type the destructured booleans as `boolean` via the existing implicit type; if TS complains, cast with `as unknown as { accepted_age_confirmation: boolean; accepted_terms: boolean; accepted_usage_terms: boolean; /* ...the rest */ }` on the destructure only if strictly necessary — document the cast inline.
    8. Do NOT create new files, do NOT touch `strapi-server.ts`, do NOT touch the website, do NOT touch the user schema (all three attributes already exist).

    Reference files: `apps/strapi/src/extensions/users-permissions/strapi-server.ts` already wires `registerUserLocal` into the auth controller factory — no changes needed there.
  </action>
  <verify>
    <automated>cd apps/strapi && yarn tsc --noEmit -p tsconfig.json</automated>
    Additional manual diff check: `git diff apps/strapi/src/extensions/users-permissions/controllers/authController.ts` must show (a) `accepted_usage_terms` added to the destructure and guard, (b) a new `forwardBody` object with NO `accepted_*` keys assigned to `ctx.request.body`, (c) a new `strapi.db.query("plugin::users-permissions.user").update` call in the success path before `createUserReservations(user)`.
  </verify>
  <done>
    - File compiles under Strapi's TS config (no new TS errors introduced by this change — pre-existing unrelated errors, if any, are acceptable as long as they are not in `authController.ts`).
    - Static review confirms `ctx.request.body` forwarded to `registerController` no longer contains `accepted_age_confirmation`, `accepted_terms`, or `accepted_usage_terms`.
    - Consent persistence call is wired before `createUserReservations`.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Human verification — register a brand-new user end to end</name>
  <what-built>
    `registerUserLocal` now strips the consent booleans from the body forwarded to Strapi's built-in register action and persists them on the created user row after registration. This should eliminate the `Invalid parameters: accepted_age_confirmation, accepted_terms` error.
  </what-built>
  <how-to-verify>
    1. Restart Strapi locally: `cd apps/strapi && yarn develop` (or the monorepo dev command you normally use).
    2. Start the website: `cd apps/website && yarn dev`.
    3. Open http://localhost:3000/registro (or whatever route hosts `FormRegister.vue`) in a private window.
    4. Fill step 1: Tipo = Persona Natural, nombre, apellido, RUT válido → Siguiente.
    5. Fill step 2: fresh email (not already in DB), password ≥ 6 chars, repetir contraseña, tick ALL THREE checkboxes (mayor de edad, políticas de privacidad, condiciones de uso) → Registrate.
    6. Expected:
       - No "Invalid parameters" SweetAlert.
       - Either redirect to `/login` with success toast (email confirmation disabled) or redirect to `/registro/confirmar` (email confirmation enabled).
    7. Open Strapi admin → Content Manager → User collection → locate the new user → confirm `accepted_age_confirmation`, `accepted_terms`, `accepted_usage_terms` are all `true`.
    8. Negative check: try registering again with one checkbox unticked — expected behavior: form button stays disabled (client-side yup blocks it). Optionally, force-send via devtools with `accepted_usage_terms: false` → Strapi must respond 400 `"All fields are required"`.
  </how-to-verify>
  <resume-signal>Type "approved" once registration succeeds and the three booleans are persisted, or describe any issue encountered.</resume-signal>
</task>

</tasks>

<verification>
- TypeScript compiles for apps/strapi.
- `git grep -n "accepted_usage_terms" apps/strapi/src/extensions/users-permissions/controllers/authController.ts` returns the new destructure, guard, and update call.
- `git grep -n "ctx.request.body = " apps/strapi/src/extensions/users-permissions/controllers/authController.ts` shows a body WITHOUT `accepted_*` fields.
- Manual end-to-end registration on localhost succeeds.
</verification>

<success_criteria>
- New users can register through `FormRegister.vue` without the "Invalid parameters" error.
- The three consent booleans land on the user row with value `true`.
- Existing behaviors (ad reservations, MJML confirmation email, 2-step login) remain intact.
- No changes outside `authController.ts`.
</success_criteria>

<output>
After completion, create `.planning/quick/260411-sgs-fix-registro-invalid-parameters-accepted/260411-sgs-SUMMARY.md`
</output>

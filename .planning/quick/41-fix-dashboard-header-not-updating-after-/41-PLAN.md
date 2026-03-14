---
phase: quick
plan: 41
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/FormEdit.vue
autonomous: true
requirements: []

must_haves:
  truths:
    - "After saving the profile form, the header shows the updated firstname immediately"
    - "The success alert fires and the form retains the saved values"
  artifacts:
    - path: "apps/dashboard/app/components/FormEdit.vue"
      provides: "Profile update form using flat PUT body via useStrapiClient"
  key_links:
    - from: "FormEdit.vue handleSubmit"
      to: "PUT /api/users/:id"
      via: "useStrapiClient() with flat body (not wrapped in { data })"
      pattern: "client.*users.*id"
    - from: "fetchUser()"
      to: "useState('strapi_user')"
      via: "user.value = await client('/users/me')"
      pattern: "fetchUser"
---

<objective>
Fix the profile name not updating in the dashboard header after saving changes in FormEdit.

Purpose: `strapi.update()` from `@nuxtjs/strapi` wraps the body in `{ data: {...} }` and sends
`PUT /api/users/:id`. The default Strapi `users-permissions` controller reads fields directly from
`ctx.request.body` (not from `ctx.request.body.data`) — so all sent fields are `undefined` and
nothing is saved. `fetchUser()` then returns the stale data, leaving the header unchanged.

Output: `FormEdit.vue` patched to use `useStrapiClient()` directly with a flat body, so the update
actually persists and `fetchUser()` returns the new name, which reactively updates `DropdownUser.vue`.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key facts:
- `strapi.update(contentType, id, data)` from `@nuxtjs/strapi` v5 SDK sends `PUT /:contentType/:id`
  with body `{ data: {...} }` — correct for content-type API, WRONG for users-permissions routes
- The default `PUT /api/users/:id` controller reads `ctx.request.body.email`, `ctx.request.body.username`
  etc. directly (flat), not from `ctx.request.body.data`
- Fix: use `useStrapiClient()` directly and send a flat body object
- `fetchUser()` from `useStrapiAuth()` does `user.value = await client("/users/me", ...)` — this
  mutates the `useState("strapi_user")` ref in place, triggering reactivity in `DropdownUser.vue`
- The `User` type lives in `apps/dashboard/app/types/user.ts` — has `id: number` (numeric id is fine
  for the users-permissions `PUT /api/users/:id` route, unlike content-type API)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix FormEdit to use flat body via useStrapiClient</name>
  <files>apps/dashboard/app/components/FormEdit.vue</files>
  <action>
    Replace `const strapi = useStrapi()` with `const client = useStrapiClient()`.

    In `handleSubmit`, replace:
    ```ts
    await strapi.update("users", user.value!.id, {
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      username: values.username,
    } as unknown as Parameters<typeof strapi.update>[2]);
    ```

    With:
    ```ts
    await client(`/users/${user.value!.id}`, {
      method: "PUT",
      body: {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        username: values.username,
      },
    });
    ```

    Remove the `useStrapi` import/usage entirely. `useStrapiClient` is auto-imported by @nuxtjs/strapi.

    The `await fetchUser()` call stays exactly as-is — it will now retrieve the freshly saved data
    and update `useState("strapi_user")`, which `DropdownUser.vue` reactively displays.

    No other changes needed: the success/error Swal flow, `sending` ref, and form initialization
    all remain unchanged.
  </action>
  <verify>
    TypeScript check: `yarn workspace @waldo/dashboard typecheck` passes (no new errors).
    Manual smoke test: Edit firstname in /account/profile, save → header greeting updates immediately.
  </verify>
  <done>
    The PUT request sends `{ firstname, lastname, email, username }` as a flat body.
    After save, `fetchUser()` returns the updated name, and the header shows it without a page reload.
  </done>
</task>

</tasks>

<verification>
- `yarn workspace @waldo/dashboard typecheck` passes
- Visit /account/profile in the running dashboard
- Change the firstname field and click "Guardar cambios"
- The "Hola {name}" greeting in the header dropdown updates immediately to the new name
</verification>

<success_criteria>
Profile name change persists to the server AND the header reflects the new name in the same session without page reload.
</success_criteria>

<output>
After completion, create `.planning/quick/41-fix-dashboard-header-not-updating-after-/41-SUMMARY.md`
</output>

---
phase: quick
plan: 41
subsystem: dashboard
tags: [bug-fix, strapi-client, profile-update, users-permissions]
dependency_graph:
  requires: []
  provides: [profile-update-flat-body]
  affects: [FormEdit.vue, DropdownUser.vue]
tech_stack:
  added: []
  patterns: [useStrapiClient-direct-call, flat-body-put]
key_files:
  modified:
    - apps/dashboard/app/components/FormEdit.vue
decisions:
  - "Use useStrapiClient() directly for users-permissions PUT — @nuxtjs/strapi update() wraps body in { data:{} } which is incompatible with users-permissions controller that reads flat ctx.request.body"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-14T22:59:26Z"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 41: Fix Dashboard Header Not Updating After Profile Save

## One-liner

Replaced `useStrapi().update()` with `useStrapiClient()` flat PUT body so profile changes actually persist and the header greeting updates reactively.

## What Was Done

Fixed `FormEdit.vue` so that saving the profile form correctly persists the data to Strapi and the header `DropdownUser.vue` reflects the new name immediately without a page reload.

**Root cause:** `@nuxtjs/strapi`'s `strapi.update(contentType, id, data)` wraps the payload as `{ data: {...} }` before sending `PUT /api/users/:id`. The `users-permissions` controller reads fields directly from `ctx.request.body` (flat), not from `ctx.request.body.data` — so all fields arrive as `undefined` and nothing is saved. `fetchUser()` then fetches stale data, leaving the header name unchanged.

**Fix:** Replaced `useStrapi()` with `useStrapiClient()` and called it directly with a flat body:
```ts
await client(`/users/${user.value!.id}`, {
  method: "PUT",
  body: { firstname, lastname, email, username },
});
```

`fetchUser()` (from `useStrapiAuth()`) was left unchanged — it calls `client('/users/me')` and mutates `useState('strapi_user')` in place, which triggers reactivity in `DropdownUser.vue`.

## Tasks

| Task | Description | Commit | Status |
|------|-------------|--------|--------|
| 1 | Fix FormEdit to use flat body via useStrapiClient | 51fac50 | ✅ Done |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `apps/dashboard/app/components/FormEdit.vue` — modified ✅
- Commit `51fac50` exists ✅
- TypeScript check (`nuxt typecheck`) — passed with no errors ✅

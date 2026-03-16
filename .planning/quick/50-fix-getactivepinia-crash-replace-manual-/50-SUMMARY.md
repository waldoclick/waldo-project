# Quick Task 50: Fix getActivePinia crash — Summary

**Date:** 2026-03-16
**Commit:** aa4f4c4

## What was done

Fixed `getActivePinia() was called but there was no active Pinia` crash on dashboard `/auth/login`.

### Root cause (investigated before fixing)

The Pinia 2→3 upgrade (commit 71b6791) converted stores to Setup Store API but kept the
`persist` storage config using a raw guard:

```ts
storage: typeof window !== "undefined" ? localStorage : undefined
```

In Pinia 3 + `pinia-plugin-persistedstate` 4.x + `@pinia-plugin-persistedstate/nuxt` 1.2.x,
this guard is **not sufficient**. The persist plugin runs during SSR hydration — when `storage`
is `undefined`, it fails to initialize the store state correctly, causing Pinia to throw
`getActivePinia()` during the initial navigation handled by `router.client.ts`.

The error appeared to be in `router.client.ts` (calling `useAppStore()`) but that was a symptom,
not the cause. Previous fixes (moving store call into `beforeEach`, adding `enforce: "post"`)
were addressing the symptom.

### Fix applied

Replaced `typeof window !== "undefined" ? localStorage : undefined` with
`persistedState.localStorage` in all 3 persist stores:

- `apps/dashboard/app/stores/app.store.ts`
- `apps/dashboard/app/stores/search.store.ts`
- `apps/dashboard/app/stores/settings.store.ts`

`persistedState.localStorage` is the SSR-safe wrapper exported by
`@pinia-plugin-persistedstate/nuxt` and auto-imported by Nuxt. It uses
`useNuxtApp().ssrContext` to detect SSR and safely returns `null`/no-ops on the server.

Also reverted `apps/dashboard/app/plugins/router.client.ts` to its original simple form
(removed the `enforce: "post"` workaround added in the previous fix attempts).

### Files changed

| File | Change |
|------|--------|
| `apps/dashboard/app/stores/app.store.ts` | `storage: persistedState.localStorage` |
| `apps/dashboard/app/stores/search.store.ts` | `storage: persistedState.localStorage` |
| `apps/dashboard/app/stores/settings.store.ts` | `storage: persistedState.localStorage` |
| `apps/dashboard/app/plugins/router.client.ts` | Reverted to simple `defineNuxtPlugin(() => {...})` |
</content>
</invoke>
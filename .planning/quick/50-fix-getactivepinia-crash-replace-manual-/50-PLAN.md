---
phase: quick-50
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/stores/app.store.ts
  - apps/dashboard/app/stores/search.store.ts
  - apps/dashboard/app/stores/settings.store.ts
  - apps/dashboard/app/plugins/router.client.ts
autonomous: true
requirements: [QUICK-50]
---

<objective>
Fix `getActivePinia() was called but there was no active Pinia` crash on dashboard `/auth/login`.

Root cause: Pinia 2→3 upgrade (commit 71b6791) converted app.store.ts to Setup Store API and
kept `persist: { storage: typeof window !== "undefined" ? localStorage : undefined }`. In Pinia 3
with pinia-plugin-persistedstate 4.x + @pinia-plugin-persistedstate/nuxt, this raw localStorage
guard is not sufficient — the plugin attempts to restore state during SSR where `storage` is
`undefined`, causing Pinia to throw during hydration. The error bubbles up as
`getActivePinia() was called but there was no active Pinia` at `router.client.ts`.

Fix: replace raw `localStorage` guard with `persistedState.localStorage` — the SSR-safe wrapper
exported by `@pinia-plugin-persistedstate/nuxt` (auto-imported by Nuxt). This wrapper uses
`useNuxtApp().ssrContext` to detect SSR and returns `null` from `getItem`/ignores `setItem`
on server, making the persist plugin fully SSR-safe.

Also: revert router.client.ts to its original simple form (previous enforce:post workaround
was addressing the symptom, not the cause).
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Replace raw localStorage guard with persistedState.localStorage in all 3 persist stores + revert router plugin</name>
  <files>
    apps/dashboard/app/stores/app.store.ts
    apps/dashboard/app/stores/search.store.ts
    apps/dashboard/app/stores/settings.store.ts
    apps/dashboard/app/plugins/router.client.ts
  </files>
  <done>COMPLETED — commit aa4f4c4</done>
</task>

</tasks>
</content>
</invoke>
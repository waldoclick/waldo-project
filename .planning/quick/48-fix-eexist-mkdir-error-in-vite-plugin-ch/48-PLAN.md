---
phase: quick-48
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/nuxt.config.ts
autonomous: true
requirements: [QUICK-48]

must_haves:
  truths:
    - "Dashboard dev server starts without EEXIST crash"
    - "Dashboard HMR WebSocket does not conflict with website on port 24678"
    - "Website typeCheck still runs (unchanged)"
  artifacts:
    - path: "apps/dashboard/nuxt.config.ts"
      provides: "typeCheck disabled + HMR port set to 24679"
      contains: "hmr"
  key_links:
    - from: "apps/dashboard/nuxt.config.ts"
      to: "vite-plugin-checker prepareVueTsc"
      via: "typescript.typeCheck: false removes checker invocation"
    - from: "apps/dashboard/nuxt.config.ts"
      to: "vite HMR server"
      via: "vite.server.hmr.port: 24679 isolates WebSocket from website"
---

<objective>
Fix two dashboard dev-server crashes:
1. `EEXIST: file already exists, mkdir '.../vite-plugin-checker/dist/checkers/vueTsc/typescript-vue-tsc/lib/pl'` — caused by website and dashboard running `prepareVueTsc` concurrently against the **same shared node_modules path**. The race: both processes check the flag file, both set `shouldBuildFixture = true`, process A does `rm -rf` + `mkdir`, process B then does `mkdir` on the already-recreated directory → EEXIST.
2. `WebSocket server error: Port 24678 is already in use` — both Nuxt apps default to Vite HMR port 24678. The root `dev` script kills it once at startup, but if dashboard restarts (after the crash above), the website still owns 24678.

Purpose: Unblock local development — both apps must start cleanly in parallel via `yarn dev`.
Output: Modified `apps/dashboard/nuxt.config.ts` with `typeCheck: false` and `vite.server.hmr.port: 24679`.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/dashboard/nuxt.config.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix typeCheck race and HMR port conflict in dashboard</name>
  <files>apps/dashboard/nuxt.config.ts</files>
  <action>
Two targeted edits to `apps/dashboard/nuxt.config.ts`:

**Edit 1 — Disable typeCheck in dashboard (line ~394):**

Current:
```ts
  typescript: {
    strict: true,
    typeCheck: true,
  },
```

Change to:
```ts
  typescript: {
    strict: true,
    // typeCheck disabled: both apps share the same node_modules/vite-plugin-checker/dist/checkers/vueTsc/typescript-vue-tsc
    // path. Running prepareVueTsc concurrently causes EEXIST race. Website runs typeCheck instead.
    // Use `yarn workspace waldo-dashboard nuxi typecheck` for standalone dashboard type checking.
    typeCheck: false,
  },
```

**Edit 2 — Set dedicated HMR port in the vite block (line ~422):**

Current:
```ts
  // Vite Configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Removemos additionalData ya que estamos importando app.scss en css
        },
      },
    },
  },
```

Change to:
```ts
  // Vite Configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Removemos additionalData ya que estamos importando app.scss en css
        },
      },
    },
    server: {
      hmr: {
        // Use 24679 (not default 24678) to avoid WebSocket port conflict with website when both dev servers run concurrently
        port: 24679,
      },
    },
  },
```

No other changes. Do NOT touch website/nuxt.config.ts — it keeps `typeCheck: true` and port 24678 as-is.
  </action>
  <verify>
    <automated>cd apps/dashboard && yarn nuxi typecheck 2>&1 | tail -5 || true; grep -n "typeCheck\|hmr" apps/dashboard/nuxt.config.ts</automated>
  </verify>
  <done>
    - `apps/dashboard/nuxt.config.ts` has `typeCheck: false` with explanatory comment
    - `apps/dashboard/nuxt.config.ts` has `vite.server.hmr.port: 24679`
    - `grep -n "typeCheck\|hmr" apps/dashboard/nuxt.config.ts` shows both changes
    - Starting `yarn dev` no longer crashes dashboard with EEXIST or port 24678 errors
  </done>
</task>

</tasks>

<verification>
After applying:
1. `grep -n "typeCheck\|hmr\|24679" apps/dashboard/nuxt.config.ts` — must show `typeCheck: false` and `port: 24679`
2. `grep -n "typeCheck\|hmr" apps/website/nuxt.config.ts` — must show `typeCheck: true` and no hmr override (unchanged)
3. Manual: `yarn dev` — dashboard starts without EEXIST crash or WebSocket port conflict
</verification>

<success_criteria>
- Dashboard dev server starts cleanly alongside website dev server
- No `EEXIST: file already exists, mkdir ...typescript-vue-tsc...` error
- No `WebSocket server error: Port 24678 is already in use` error
- Website type checking is unaffected (still runs on port 24678 with typeCheck: true)
</success_criteria>

<output>
After completion, create `.planning/quick/48-fix-eexist-mkdir-error-in-vite-plugin-ch/48-SUMMARY.md`
</output>

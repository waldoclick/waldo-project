---
phase: 260413-txa
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/stores/ad.store.ts
  - apps/website/app/stores/ads.store.ts
  - apps/website/app/stores/app.store.ts
  - apps/website/app/stores/categories.store.ts
  - apps/website/app/stores/communes.store.ts
  - apps/website/app/stores/conditions.store.ts
  - apps/website/app/stores/faqs.store.ts
  - apps/website/app/stores/filter.store.ts
  - apps/website/app/stores/history.store.ts
  - apps/website/app/stores/indicator.store.ts
  - apps/website/app/stores/pack.store.ts
  - apps/website/app/stores/policies.store.ts
  - apps/website/app/stores/regions.store.ts
  - apps/website/app/stores/related.store.ts
  - apps/website/app/stores/terms.store.ts
  - apps/dashboard/app/stores/app.store.ts
  - apps/dashboard/app/stores/search.store.ts
  - apps/dashboard/app/stores/settings.store.ts
autonomous: true
requirements:
  - TXA-01
must_haves:
  truths:
    - "Every persisted Pinia store has a _storeVersion field in its state"
    - "When hydrated state has a mismatched _storeVersion, persisted data is discarded and store resets to initial state"
    - "Users no longer need to clear cookies/localStorage after a deploy that bumps a store version"
    - "Stores with matching _storeVersion continue hydrating normally with no behavior change"
  artifacts:
    - path: "apps/website/app/stores/ad.store.ts"
      provides: "_storeVersion state field + beforeRestore guard"
      contains: "_storeVersion"
    - path: "apps/website/app/stores/ads.store.ts"
      provides: "_storeVersion state field + beforeRestore guard"
      contains: "_storeVersion"
    - path: "apps/dashboard/app/stores/settings.store.ts"
      provides: "_storeVersion state field + beforeRestore guard"
      contains: "_storeVersion"
  key_links:
    - from: "persist.beforeRestore hook"
      to: "ctx.store.$reset()"
      via: "_storeVersion mismatch check"
      pattern: "_storeVersion.*!==.*STORE_VERSION"
---

<objective>
Add a version guard to every persisted Pinia store so that bumping a constant invalidates stale hydrated state after a deploy. Users must stop having to clear cookies/localStorage when a store schema changes.

Purpose: Eliminate a recurring post-deploy footgun where persisted state hydrates into a newer store shape and causes runtime errors or stale UI.

Output: 18 persisted stores (15 website + 3 dashboard) each with a `_storeVersion` state field and a `beforeRestore` hook that calls `$reset()` on mismatch.
</objective>

<context>
@./CLAUDE.md
@.planning/STATE.md

# Persisted stores inventory (grep persist in apps/*/app/stores/**/*.ts)
# All stores use the options API with state(): State => ({ ... }) and persist as a sibling of actions.
# No store currently uses beforeRestore — this plan introduces the pattern.

Website (15):
- apps/website/app/stores/ad.store.ts
- apps/website/app/stores/ads.store.ts
- apps/website/app/stores/app.store.ts
- apps/website/app/stores/categories.store.ts
- apps/website/app/stores/communes.store.ts
- apps/website/app/stores/conditions.store.ts
- apps/website/app/stores/faqs.store.ts
- apps/website/app/stores/filter.store.ts
- apps/website/app/stores/history.store.ts
- apps/website/app/stores/indicator.store.ts
- apps/website/app/stores/pack.store.ts
- apps/website/app/stores/policies.store.ts
- apps/website/app/stores/regions.store.ts
- apps/website/app/stores/related.store.ts
- apps/website/app/stores/terms.store.ts

Dashboard (3):
- apps/dashboard/app/stores/app.store.ts
- apps/dashboard/app/stores/search.store.ts
- apps/dashboard/app/stores/settings.store.ts

Excluded (NOT persisted, do not touch):
- apps/website/app/stores/me.store.ts
- apps/website/app/stores/user.store.ts
- apps/website/app/stores/packs.store.ts
- apps/dashboard/app/stores/articles.store.ts (explicit "No persist" comment)
- apps/dashboard/app/stores/me.store.ts

<interfaces>
# Reference shape — existing options-style store
# File: apps/website/app/stores/history.store.ts

interface HistoryState {
  viewedAds: HistoryAd[];
  maxHistory: number;
}

export const useHistoryStore = defineStore("history", {
  state: (): HistoryState => ({
    viewedAds: [],
    maxHistory: 10,
  }),
  getters: { ... },
  actions: { ... },
  // persist: CORRECT — ...
  persist: {
    storage: persistedState.localStorage,
  },
});

# pinia-plugin-persistedstate beforeRestore signature:
# beforeRestore: (ctx: PiniaPluginContext) => void
# ctx.store.$state gives access to the about-to-be-hydrated state
# ctx.store.$reset() restores initial state and prevents stale hydration
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add _storeVersion + beforeRestore guard to all 15 website persisted stores</name>
  <files>
    apps/website/app/stores/ad.store.ts,
    apps/website/app/stores/ads.store.ts,
    apps/website/app/stores/app.store.ts,
    apps/website/app/stores/categories.store.ts,
    apps/website/app/stores/communes.store.ts,
    apps/website/app/stores/conditions.store.ts,
    apps/website/app/stores/faqs.store.ts,
    apps/website/app/stores/filter.store.ts,
    apps/website/app/stores/history.store.ts,
    apps/website/app/stores/indicator.store.ts,
    apps/website/app/stores/pack.store.ts,
    apps/website/app/stores/policies.store.ts,
    apps/website/app/stores/regions.store.ts,
    apps/website/app/stores/related.store.ts,
    apps/website/app/stores/terms.store.ts
  </files>
  <action>
For EACH of the 15 website stores listed in `<files>`, apply the same four-edit pattern. Do not refactor anything else, do not reorder existing state fields, do not touch actions/getters.

Pattern (keep identical across every file):

1) At the top of the file (after existing imports, before `defineStore`), declare a module-level constant:

```ts
const STORE_VERSION = 1;
```

2) In the State interface (or inline state type if no named interface — e.g. `pack.store.ts` uses an imported type, in which case add the field only to the state() return object AND widen the state type inline with `& { _storeVersion: number }` only if TypeScript complains; preferred path is still to extend the named interface where one exists), add a required field:

```ts
_storeVersion: number;
```

Where the state type is imported from `@/types/...` (e.g. `pack.store.ts` imports `PackSelectionState` from `@/types/pack`), do NOT modify the shared type file. Instead, cast the state function return type inline:

```ts
state: (): PackSelectionState & { _storeVersion: number } => ({
  pack: 1,
  is_invoice: false,
  _storeVersion: STORE_VERSION,
}),
```

For stores with a locally-declared interface (history.store.ts, ads.store.ts, ad.store.ts, app.store.ts, categories.store.ts, communes.store.ts, conditions.store.ts, faqs.store.ts, filter.store.ts, indicator.store.ts, policies.store.ts, regions.store.ts, related.store.ts, terms.store.ts), add `_storeVersion: number;` to the interface and `_storeVersion: STORE_VERSION,` to the state() return object.

3) In the `state(): State => ({ ... })` return object, add the initializer as the LAST field:

```ts
_storeVersion: STORE_VERSION,
```

4) In the `persist` object, add a `beforeRestore` hook. The exact shape depends on the existing persist value:

- If `persist: { storage: ... }` (object form), add `beforeRestore` as a sibling key:

```ts
persist: {
  storage: persistedState.localStorage,
  beforeRestore: (ctx) => {
    if (ctx.store.$state._storeVersion !== STORE_VERSION) {
      ctx.store.$reset();
    }
  },
},
```

- If `persist: true` (indicator.store.ts), convert to object form:

```ts
persist: {
  beforeRestore: (ctx) => {
    if (ctx.store.$state._storeVersion !== STORE_VERSION) {
      ctx.store.$reset();
    }
  },
},
```

- If `persist: { storage: ..., pick: [...] }` (app.store.ts website has `pick: ["referer", "contactFormSent", "isMobileMenuOpen"]`), you MUST also add `"_storeVersion"` to the `pick` array — otherwise the version is never persisted and the guard triggers a reset on every reload. Resulting shape:

```ts
persist: {
  storage: persistedState.localStorage,
  pick: ["referer", "contactFormSent", "isMobileMenuOpen", "_storeVersion"],
  beforeRestore: (ctx) => {
    if (ctx.store.$state._storeVersion !== STORE_VERSION) {
      ctx.store.$reset();
    }
  },
},
```

- Same rule for `search.store.ts` / `settings.store.ts` in the dashboard task below if they use `pick`.

Do NOT change the existing `// persist: CORRECT|REVIEW|RISK — ...` audit comments; leave them in place directly above the `persist:` key per CLAUDE.md rule.

Do NOT add new imports — `ctx` is typed implicitly by the plugin; if TypeScript complains about an implicit-any on `ctx`, type it as `ctx: { store: { $state: { _storeVersion: number }; $reset: () => void } }` inline (no new import).

Do NOT leave unused imports or variables (Codacy rule). Do NOT prefix anything with `_` to silence lint — delete instead.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | tail -40</automated>
  </verify>
  <done>
- All 15 website persisted stores declare `const STORE_VERSION = 1;` at module scope
- All 15 stores have `_storeVersion: STORE_VERSION` in their initial state
- All 15 stores have a `beforeRestore` hook that calls `ctx.store.$reset()` on mismatch
- `apps/website/app/stores/app.store.ts` includes `"_storeVersion"` in its `pick` array
- `nuxt typecheck` passes with zero new errors
- No audit comments (`// persist: CORRECT|REVIEW|RISK`) were removed or relocated
  </done>
</task>

<task type="auto">
  <name>Task 2: Add _storeVersion + beforeRestore guard to all 3 dashboard persisted stores</name>
  <files>
    apps/dashboard/app/stores/app.store.ts,
    apps/dashboard/app/stores/search.store.ts,
    apps/dashboard/app/stores/settings.store.ts
  </files>
  <action>
Apply the exact same four-edit pattern from Task 1 to the 3 dashboard persisted stores. Same rules:

1) `const STORE_VERSION = 1;` at module scope (after imports).
2) Add `_storeVersion: number` to the State interface (or inline-extend if the type is imported).
3) Add `_storeVersion: STORE_VERSION` as the last field in `state(): State => ({ ... })`.
4) Add `beforeRestore` to the `persist` object:

```ts
beforeRestore: (ctx) => {
  if (ctx.store.$state._storeVersion !== STORE_VERSION) {
    ctx.store.$reset();
  }
},
```

Special handling:

- `apps/dashboard/app/stores/search.store.ts` has `persist: { storage, key: "search", ... }`. Check whether it has a `pick` array; if it does, add `"_storeVersion"` to `pick`. If it has no `pick`, just add `beforeRestore`.
- `apps/dashboard/app/stores/settings.store.ts` has `persist: { storage, key: "settings", ... }`. Same rule — if `pick` exists, add `"_storeVersion"`; otherwise just add `beforeRestore`.
- `apps/dashboard/app/stores/app.store.ts` has no audit comment and uses `typeof window !== "undefined" ? localStorage : undefined`. Keep the ternary exactly as-is; just add `beforeRestore` as a sibling.

Do NOT touch `apps/dashboard/app/stores/articles.store.ts` (explicit "No persist — session-only cache" comment) or `apps/dashboard/app/stores/me.store.ts` (not persisted).

Respect the same Codacy rule: no unused imports, no `_`-prefixed ignored vars.
  </action>
  <verify>
    <automated>cd apps/dashboard && yarn nuxt typecheck 2>&1 | tail -40</automated>
  </verify>
  <done>
- All 3 dashboard persisted stores declare `const STORE_VERSION = 1;` at module scope
- All 3 stores have `_storeVersion: STORE_VERSION` in their initial state
- All 3 stores have a `beforeRestore` hook calling `$reset()` on mismatch
- If any of the 3 stores uses a `pick` array, `"_storeVersion"` is included in it
- `nuxt typecheck` passes with zero new errors
- `articles.store.ts` and `me.store.ts` are untouched
  </done>
</task>

<task type="auto">
  <name>Task 3: Smoke-test the guard by bumping STORE_VERSION in one store and verifying reset</name>
  <files>apps/website/app/stores/history.store.ts</files>
  <action>
Manual verification task (still automated via a one-off script). Do NOT commit the bump.

1) Run `yarn codacy` from the repo root to confirm the 18 modified files pass linting:

```bash
cd /home/gab/Code/waldo-project && yarn codacy 2>&1 | tail -30
```

2) Run both typechecks in parallel to confirm no regressions:

```bash
cd /home/gab/Code/waldo-project && yarn turbo run typecheck --filter=website --filter=dashboard 2>&1 | tail -40
```

3) Write a short standalone unit test at `apps/website/tests/stores/history.store.test.ts` (create the folder if missing) that:
   - Imports `useHistoryStore` via `@nuxt/test-utils`
   - Seeds `localStorage` with `{ viewedAds: [{ id: 1, title: "stale" }], _storeVersion: 0 }` under the correct persisted key (`history`)
   - Instantiates the store
   - Asserts `viewedAds.length === 0` after hydration (guard triggered `$reset()`)
   - Asserts `_storeVersion === 1` (the current STORE_VERSION)

Follow CLAUDE.md: test file MUST live under `apps/website/tests/` (mirror of `app/stores/`). Use Vitest + `@nuxt/test-utils`. Do NOT co-locate the test next to the store.

If `@nuxt/test-utils` setup in this repo does not make `localStorage` easy to seed pre-hydration, fall back to a minimal unit test that imports the raw store module, calls `$reset()` manually, and asserts the initial state shape includes `_storeVersion: 1`. Prefer the localStorage path if it works.

4) Run the test:

```bash
cd apps/website && yarn test tests/stores/history.store.test.ts
```
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn turbo run typecheck --filter=website --filter=dashboard 2>&1 | tail -20 && cd apps/website && yarn test tests/stores/history.store.test.ts 2>&1 | tail -20</automated>
  </verify>
  <done>
- `yarn codacy` passes on all 18 modified store files
- Both website and dashboard typecheck pass
- `apps/website/tests/stores/history.store.test.ts` exists and passes
- Test proves that stale `_storeVersion` in localStorage triggers `$reset()` on hydration
- No temporary STORE_VERSION bumps are left in any store file
  </done>
</task>

</tasks>

<verification>
Run from repo root before commit:

```bash
yarn turbo run typecheck --filter=website --filter=dashboard
yarn codacy
cd apps/website && yarn test tests/stores/history.store.test.ts
```

Spot-check by grepping that every persisted store now has the guard:

```bash
# Should return 18 matches (15 website + 3 dashboard)
grep -l "_storeVersion" apps/website/app/stores/*.ts apps/dashboard/app/stores/*.ts
grep -l "beforeRestore" apps/website/app/stores/*.ts apps/dashboard/app/stores/*.ts
```
</verification>

<success_criteria>
- 18 persisted Pinia stores have a module-level `STORE_VERSION` constant
- 18 persisted stores expose `_storeVersion` in their initial state
- 18 persisted stores have a `beforeRestore` hook that calls `$reset()` on version mismatch
- Stores with a `pick` array include `"_storeVersion"` in the pick list
- `yarn turbo run typecheck` passes for both website and dashboard
- `yarn codacy` passes with no new warnings
- Unit test proves the guard resets stale state on hydration
- Next time a store shape changes, bumping `STORE_VERSION` in that file alone clears users' stale cache automatically — no cookie/localStorage instructions required
</success_criteria>

<output>
After completion, create `.planning/quick/260413-txa-add-store-version-guards-to-all-persiste/260413-txa-SUMMARY.md` documenting:
- List of 18 stores modified
- The STORE_VERSION pattern (so future developers know to bump it when changing state shape)
- Confirmation that `pick` arrays were updated where applicable
- Test file added and what it proves
</output>

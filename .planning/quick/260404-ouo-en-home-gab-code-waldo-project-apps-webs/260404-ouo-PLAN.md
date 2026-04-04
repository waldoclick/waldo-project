---
phase: quick
plan: 260404-ouo
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/[slug].vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "Navigating to /{existing-username} renders the user profile page with ads"
    - "Navigating to /{non-existent-slug} shows a 404 error page"
    - "Client-side navigation to a user profile loads data correctly"
  artifacts:
    - path: "apps/website/app/pages/[slug].vue"
      provides: "User profile page with correct useAsyncData key"
  key_links:
    - from: "apps/website/app/pages/[slug].vue"
      to: "useAsyncData"
      via: "string key + handler function"
      pattern: 'useAsyncData\(\s*`adsData-'
---

<objective>
Fix [slug].vue showing 404 for existing users by correcting the useAsyncData key argument.

Purpose: The useAsyncData call passes a function as its first argument instead of a string key. Nuxt interprets the function as the handler (not the key), so the actual data-fetching function is never invoked. adsData.value ends up without a .user property, causing the 404 fallback to trigger even for valid users.

Output: Working [slug].vue that correctly loads user profile data.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/app/pages/[slug].vue
@apps/website/app/stores/user.store.ts

Root cause analysis:

Line 77-78 of [slug].vue:
```typescript
const { data: adsData, pending, error } = await useAsyncData<ProfileData | null>(
  () => `adsData-${route.params.slug}`,   // <-- BUG: function, not string
  async () => { ... },                     // <-- This is ignored by Nuxt
```

Nuxt's useAsyncData signature: `useAsyncData(key: string, handler, opts?)` or `useAsyncData(handler, opts?)`.
When the first argument is a function, Nuxt treats it as the handler. So:
- The "handler" becomes `() => \`adsData-${route.params.slug}\`` (returns a string)
- The actual data-fetching function (second arg) is treated as options and ignored
- adsData.value gets set to a string like "adsData-username" (truthy, but has no .user property)
- Template guard `v-if="adsData && adsData.user"` fails -> renders nothing
- onMounted fires showError 404

All other pages in the codebase use string keys correctly (e.g., `"faqs"`, `"categories"`, `"home-packs"`).

The fix: change the key from a function to a template literal string.
Since route.params.slug is available at setup time (before useAsyncData runs), a plain template literal works.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix useAsyncData key from function to string in [slug].vue</name>
  <files>apps/website/app/pages/[slug].vue</files>
  <action>
In apps/website/app/pages/[slug].vue, line 78, change:

FROM: `() => \`adsData-${route.params.slug}\``
TO:   `` `adsData-${route.params.slug}` ``

This is a one-character-class fix: remove the arrow function wrapper `() => ` so the key is a plain template literal string evaluated at call time. The slug value is already available from `const slug = String(route.params.slug || "")` on line 59, so the key can also use the existing `slug` variable: `\`adsData-${slug}\``.

No other changes needed. The rest of the useAsyncData call (handler, options, watch array) is correct.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn --cwd apps/website nuxt typecheck</automated>
  </verify>
  <done>useAsyncData receives a string key as first argument; the data-fetching handler is correctly passed as the second argument; navigating to /{existing-username} loads user profile data instead of showing 404.</done>
</task>

</tasks>

<verification>
1. `yarn --cwd apps/website nuxt typecheck` passes
2. Visit /{known-username} in browser -> profile page renders with user data and ads
3. Visit /{non-existent-slug} -> 404 error page
</verification>

<success_criteria>
- useAsyncData first argument is a string, not a function
- Existing user profiles load and render correctly
- Non-existent slugs still show 404
</success_criteria>

<output>
After completion, create `.planning/quick/260404-ouo-en-home-gab-code-waldo-project-apps-webs/260404-ouo-SUMMARY.md`
</output>

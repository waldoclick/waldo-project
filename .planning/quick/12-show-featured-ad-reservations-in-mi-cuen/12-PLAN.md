---
phase: quick
plan: 12
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/composables/useUser.ts
  - apps/website/app/components/AccountMain.vue
autonomous: true
requirements: [QUICK-12]

must_haves:
  truths:
    - "The /mi-cuenta page shows the number of featured ad reservations available to the user"
    - "Featured count is clearly labeled and visually distinct from free/paid counts"
    - "When the user has 0 featured reservations, nothing extra is shown (no clutter)"
  artifacts:
    - path: "apps/website/app/composables/useUser.ts"
      provides: "getFeaturedAdReservationsText() returning localised text or empty string"
    - path: "apps/website/app/components/AccountMain.vue"
      provides: "Renders featured reservation text below existing counters"
  key_links:
    - from: "apps/website/app/components/AccountMain.vue"
      to: "useUser().getFeaturedAdReservationsText()"
      via: "computed property → sanitizeText()"
      pattern: "getFeaturedAdReservationsText"
---

<objective>
Display featured ad reservation count on /mi-cuenta alongside the existing free/paid counters.

Purpose: Users who own featured ad reservations currently have no way to see them on their account page — making it hard to know whether they have credits to boost an ad.
Output: A new line in the announcements box shows "Tienes N anuncio(s) destacado(s)." when the user holds ≥1 unused featured reservation; nothing is shown when the count is 0.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key facts gathered during planning:

1. **Data is already available.** Strapi's `/users/me` middleware populates
   `ad_featured_reservations: { populate: ["ad"] }` — the array arrives on
   `useStrapiUser<User>()` without any backend change.

2. **`useUser.ts` already has `getAdFeaturedReservations()`** which filters
   unused reservations (`reservation.ad === null`). We only need a text helper
   that mirrors the style of `getAdReservationsText()`.

3. **`user.d.ts` types are complete** — `ad_featured_reservations?: AdFeaturedReservation[]`
   already declared; no type changes needed.

4. **Template approach:** `AccountMain.vue` uses `&__announcements__own` as a
   `flex-direction: column` container — adding a second `<span v-if>` is the
   natural, zero-SCSS-change approach.

5. **BEM rule:** Do NOT add new CSS classes. Reuse `&__announcements__own` span
   styling (already `line-height: 1.3; color: $charcoal;`).

<interfaces>
From apps/website/app/composables/useUser.ts:

```typescript
// Already exported from useUser():
const getAdFeaturedReservations = () => {
  const reservations = user.value?.ad_featured_reservations || [];
  const unusedReservations = reservations.filter(
    (reservation: AdFeaturedReservation) => reservation.ad === null,
  );
  return {
    unusedCount: unusedReservations.length,
    // ...
  };
};
```

From apps/website/app/components/AccountMain.vue (template snippet):
```vue
<div class="account--main__announcements__own">
  <span v-html="adReservationsText" />   <!-- existing free+paid line -->
  <!-- NEW: add span below for featured -->
</div>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add getFeaturedAdReservationsText() to useUser composable</name>
  <files>apps/website/app/composables/useUser.ts</files>
  <action>
Add a new `getFeaturedAdReservationsText` function to `useUser.ts` and export it.
It must call the existing `getAdFeaturedReservations()` and return a localised
Spanish string (or empty string when count is 0) — mirroring the style of
`getAdReservationsText()`.

Logic:
- `unusedCount === 0` → return `""` (empty — component will v-if on this)
- `unusedCount === 1` → return `"Tienes <strong>1</strong> anuncio destacado."`
- `unusedCount > 1`  → return `"Tienes <strong>${unusedCount}</strong> anuncios destacados."`

Place the function immediately after `getAdReservationsText` (before
`getAdFeaturedReservations`).

Add `getFeaturedAdReservationsText` to the returned object at the bottom of the
composable.

Do NOT modify any existing function. Do NOT add any new imports (all needed types
are already imported).
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "useUser|getFeaturedAdReservationsText" || echo "No type errors related to useUser"</automated>
  </verify>
  <done>
    - `getFeaturedAdReservationsText` is exported from `useUser()`
    - Returns `""` for 0 unused featured reservations
    - Returns singular/plural Spanish string with `&lt;strong&gt;` count for ≥1
    - TypeScript compiles with no errors in useUser.ts
  </done>
</task>

<task type="auto">
  <name>Task 2: Render featured reservation count in AccountMain.vue</name>
  <files>apps/website/app/components/AccountMain.vue</files>
  <action>
In `AccountMain.vue`:

**Script changes:**
1. Destructure `getFeaturedAdReservationsText` from `useUser()` (alongside the
   existing `getAdReservationsText`).
2. Add a new computed property:
   ```ts
   const featuredAdReservationsText = computed(() =>
     sanitizeText(getFeaturedAdReservationsText()),
   );
   ```

**Template changes:**
Inside `<div class="account--main__announcements__own">`, after the existing
`<span v-html="adReservationsText" />`, add:
```html
<span
  v-if="featuredAdReservationsText"
  v-html="featuredAdReservationsText"
/>
```

No new CSS classes, no SCSS changes. The existing `span` style in
`_account.scss` (`letter-spacing: 0.25px; color: $charcoal; line-height: 1.3`)
applies automatically.

Do NOT change any existing template structure, labels, or Spanish UI text.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "AccountMain|ERROR" | head -20 || echo "No type errors"</automated>
  </verify>
  <done>
    - `featuredAdReservationsText` computed is present in script
    - Template renders the second span only when text is non-empty (`v-if`)
    - TypeScript compiles with no errors in AccountMain.vue
    - Visual: user with featured reservations sees a second line "Tienes N anuncio(s) destacado(s)."
    - Visual: user with 0 featured reservations sees no change
  </done>
</task>

</tasks>

<verification>
1. Run TypeScript check across the website app:
   ```
   cd apps/website && yarn nuxt typecheck
   ```
   → Must pass with 0 errors.

2. Manual spot-check on localhost:3000/cuenta:
   - Log in as a user with featured ad reservations → second line appears
   - Log in as a user without featured reservations → only the original line shows
</verification>

<success_criteria>
- `useUser().getFeaturedAdReservationsText()` is callable and returns correct Spanish text
- `/mi-cuenta` shows featured reservation count when user has ≥1 unused featured reservation
- No SCSS changes required; existing span style covers the new line
- `yarn nuxt typecheck` passes in apps/website
</success_criteria>

<output>
After completion, create `.planning/quick/12-show-featured-ad-reservations-in-mi-cuen/12-SUMMARY.md`
</output>

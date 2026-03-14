---
phase: quick-40
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/components/AccountMain.vue
  - apps/website/app/scss/components/_account.scss
autonomous: true
requirements: [QUICK-40]
must_haves:
  truths:
    - "Ad count text and promo text are stacked vertically on the left"
    - "Buy button is aligned to the right in the same row as the text group"
    - "On mobile (≤768px) all elements stack vertically"
  artifacts:
    - path: "apps/website/app/components/AccountMain.vue"
      provides: "Wrapper div grouping __own and __pack"
    - path: "apps/website/app/scss/components/_account.scss"
      provides: "2-column grid layout for announcements banner"
  key_links:
    - from: "account--main__announcements"
      to: "account--main__announcements__text"
      via: "new wrapper div containing __own and __pack"
    - from: "account--main__announcements"
      to: ".btn--buy"
      via: "grid second column (auto width)"
---

<objective>
Fix the AccountMain announcements banner to display as a proper 2-column layout: left column stacks the ad count text and promo text vertically, right column holds the "Comprar" button.

Purpose: The current flex layout places all three children (ad counts, promo text, button) in a row, making the promo text a center column rather than grouped with the ad counts on the left.
Output: A clean 2-column grid banner with text on the left and action button on the right.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

The component in question is `AccountMain.vue`, which renders the ad-count + promo banner inside the user account page. The SCSS lives in `_account.scss` under the `.account--main__announcements` block.

Current structure (3 flex siblings):
```
.account--main__announcements          ← display: flex, gap: 20px, align-items: center
  .account--main__announcements__own   ← ad count spans
  .account--main__announcements__pack  ← promo text
  .btn--buy                            ← button (margin-left: auto pushes it right)
```

Goal structure (2-column grid: text group left, button right):
```
.account--main__announcements          ← display: grid, grid-template-columns: 1fr auto
  .account--main__announcements__text  ← NEW wrapper: flex-direction: column, gap: 12px
    .account--main__announcements__own
    .account--main__announcements__pack
  .btn--buy                            ← second column, self-aligned center
```
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wrap text blocks in __text div in AccountMain.vue</name>
  <files>apps/website/app/components/AccountMain.vue</files>
  <action>
In the template, wrap the two existing children `__own` and `__pack` inside a new div with class `account--main__announcements__text`. The `.btn--buy` nuxt-link stays as a sibling of `__text` (not inside it).

Before:
```html
<div class="account--main__announcements">
  <div class="account--main__announcements__own">...</div>
  <div class="account--main__announcements__pack">...</div>
  <nuxt-link to="/packs" class="btn btn--buy" title="Comprar">
    Comprar
  </nuxt-link>
</div>
```

After:
```html
<div class="account--main__announcements">
  <div class="account--main__announcements__text">
    <div class="account--main__announcements__own">...</div>
    <div class="account--main__announcements__pack">...</div>
  </div>
  <nuxt-link to="/packs" class="btn btn--buy" title="Comprar">
    Comprar
  </nuxt-link>
</div>
```

Do not change any other part of the template or script. Do not add or remove classes from existing elements.
  </action>
  <verify>
    <automated>grep -n "announcements__text" apps/website/app/components/AccountMain.vue</automated>
  </verify>
  <done>The `__own` and `__pack` divs are wrapped inside a single `account--main__announcements__text` div; `.btn--buy` remains a direct child of `account--main__announcements`.</done>
</task>

<task type="auto">
  <name>Task 2: Update SCSS to use 2-column grid for announcements banner</name>
  <files>apps/website/app/scss/components/_account.scss</files>
  <action>
In the `&__announcements` block (currently `display: flex`), change the layout to a 2-column grid and add a new `&__text` child element. Follow BEM nesting conventions exactly matching existing patterns.

Changes to `&__announcements`:
- Change `display: flex` → `display: grid`
- Change `grid-template-columns: 1fr auto` (text fills space, button takes its natural width)
- Keep `padding: 25px`, `border`, `border-radius`, `transition`, `gap: 20px`, `align-items: center`
- Remove the existing `&:hover { box-shadow: ... }` rule — project rules forbid adding box-shadow (it was already there; remove it to comply)
- On `@include screen-medium`: change to `grid-template-columns: 1fr` so everything stacks (button goes below text group)

Add new `&__text` child nested inside `&__announcements`:
```scss
&__text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

On `&__own`: remove `max-width: 300px` (the grid column handles width now). Keep font styles and the `@include screen-medium` margin rule.

On `&__pack`: no structural changes needed — it remains inside `__text`.

On `.btn--buy` inside `&__announcements`: remove `margin-left: auto` — the grid handles placement. Keep the `@include screen-medium` rule.

Do NOT add `box-shadow` anywhere. Do NOT add `transform: scale`. Keep all other existing rules untouched.
  </action>
  <verify>
    <automated>grep -n "announcements__text\|grid-template-columns" apps/website/app/scss/components/_account.scss</automated>
  </verify>
  <done>
- `account--main__announcements` uses `display: grid; grid-template-columns: 1fr auto`
- `account--main__announcements__text` element exists with `display: flex; flex-direction: column; gap: 12px`
- Mobile breakpoint collapses to single column
- No `margin-left: auto` on `.btn--buy` inside announcements
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `grep -n "announcements__text" apps/website/app/components/AccountMain.vue` → finds the wrapper div
2. `grep -n "grid-template-columns" apps/website/app/scss/components/_account.scss` → shows `1fr auto` for announcements
3. `grep -n "margin-left: auto" apps/website/app/scss/components/_account.scss` → `.btn--buy` rule inside announcements should be gone
</verification>

<success_criteria>
- AccountMain.vue template has `__text` wrapper around `__own` and `__pack`
- `_account.scss` uses grid layout for `__announcements` with `1fr auto` columns
- On desktop: text group (ad counts + promo) fills the left, button sits right
- On mobile (≤768px): everything stacks in a single column
- No box-shadow added, no transform: scale added
- No BEM violations introduced
</success_criteria>

<output>
After completion, create `.planning/quick/40-fix-heroprofile-component-layout-to-3-co/40-SUMMARY.md`
</output>

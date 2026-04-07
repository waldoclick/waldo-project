---
phase: quick
plan: 260406-tue
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/scss/components/_layout.scss
  - apps/dashboard/app/layouts/dashboard.vue
autonomous: true
requirements: [quick-task]
must_haves:
  truths:
    - "Opening the sidebar on mobile shows NO overlay/backdrop behind it"
    - "Sidebar takes 100% screen width on mobile when opened"
  artifacts:
    - path: "apps/dashboard/app/scss/components/_layout.scss"
      provides: "Updated mobile sidebar styles — no overlay, full-width menu"
    - path: "apps/dashboard/app/layouts/dashboard.vue"
      provides: "Overlay div removed from template"
  key_links: []
---

<objective>
Remove the dark overlay when the sidebar menu opens on mobile/tablet, and make the sidebar take 100% of the screen width instead of the fixed 350px.

Purpose: Cleaner mobile UX — the sidebar should feel like a full-screen menu, not a drawer with a backdrop.
Output: Updated SCSS and template with no overlay and full-width mobile sidebar.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/dashboard/app/scss/components/_layout.scss
@apps/dashboard/app/layouts/dashboard.vue
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove overlay and make sidebar full-width on mobile</name>
  <files>apps/dashboard/app/scss/components/_layout.scss, apps/dashboard/app/layouts/dashboard.vue</files>
  <action>
**In `_layout.scss`:**

1. Inside the `@include screen-large` block for `layout--dashboard`, remove all `__overlay` styles entirely (lines 130-138 approx — the `&__overlay` block with `display: none`, `position: fixed`, `background-color: rgba($jet, 0.4)`, etc.).

2. Inside the `layout--dashboard--open` modifier (within `@include screen-large`), remove the `.layout--dashboard__overlay` rule that sets `display: block; opacity: 1`.

3. Keep the `layout--dashboard--open .layout--dashboard__menu { transform: translateX(0) }` rule — that is still needed.

4. Inside the `@include screen-large` block, update the `&__menu` styles to add `width: 100%` so the sidebar takes full screen width on mobile/tablet instead of 350px.

5. Keep the desktop `&__overlay { display: none; }` rule at line 85-87 (outside the screen-large block) since it ensures the overlay div is invisible on desktop — OR remove it if the overlay div is removed from template entirely.

**In `dashboard.vue`:**

6. Remove the overlay div entirely: `<div class="layout--dashboard__overlay" @click="isSidebarOpen = false" />` — it is no longer needed.

After removing the overlay div, ensure the sidebar close behavior still works. The MenuDefault component already emits `@close` and the MenuMobile/HeaderDefault toggle the sidebar — no overlay click handler is needed.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && grep -c "overlay" apps/dashboard/app/layouts/dashboard.vue && echo "FAIL: overlay still in template" || echo "PASS: overlay removed from template" && grep -c "rgba" apps/dashboard/app/scss/components/_layout.scss | grep -q "0" && echo "PASS: no rgba overlay in SCSS" || echo "Check SCSS manually"</automated>
  </verify>
  <done>
    - No overlay div in dashboard.vue template
    - No overlay background-color styles in _layout.scss within screen-large block
    - Sidebar menu has width: 100% inside screen-large block
    - Desktop styles (350px width, no overlay) remain unchanged
    - TypeScript compiles: yarn --cwd apps/dashboard nuxi typecheck
  </done>
</task>

</tasks>

<verification>
- Open dashboard on mobile viewport (< 1024px)
- Tap hamburger to open sidebar
- Sidebar should fill entire screen width, no dark backdrop visible
- Sidebar close button / MenuDefault @close still works
- On desktop (>= 1024px), sidebar displays normally at 350px fixed width
</verification>

<success_criteria>
- Overlay completely removed (template + SCSS)
- Sidebar is 100% width on mobile/tablet (screen-large breakpoint)
- Desktop layout unchanged
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/260406-tue-quita-el-overlay-cuando-se-abre-el-menu-/260406-tue-SUMMARY.md`
</output>

---
phase: quick
plan: 260406-raw
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/scss/components/_layout.scss
  - apps/dashboard/app/scss/components/_header.scss
  - apps/dashboard/app/scss/components/_menu.scss
autonomous: true
requirements: [responsive-layout]
must_haves:
  truths:
    - "On tablet (<=1024px) the sidebar is hidden off-canvas and toggled via hamburger"
    - "On phone (<=530px) the sidebar menu takes full viewport width for easy tap targets"
    - "On phone the header padding and content areas scale down to avoid horizontal overflow"
    - "The overlay covers the screen behind the sidebar on both tablet and phone"
  artifacts:
    - path: "apps/dashboard/app/scss/components/_layout.scss"
      provides: "Responsive layout grid with phone-specific sidebar width"
    - path: "apps/dashboard/app/scss/components/_header.scss"
      provides: "Responsive header with reduced padding on small screens"
    - path: "apps/dashboard/app/scss/components/_menu.scss"
      provides: "Responsive menu with full-width on phones, reduced padding"
  key_links:
    - from: "apps/dashboard/app/layouts/dashboard.vue"
      to: "_layout.scss"
      via: "BEM classes layout--dashboard"
      pattern: "layout--dashboard"
---

<objective>
Make the dashboard layout fully responsive for tablet and phone screens. Only the structural layout (sidebar, header, content area) -- no page content changes.

Purpose: The dashboard currently has a basic responsive breakpoint at 1024px that hides the sidebar, but on phones (<=530px) the 350px sidebar is too wide and header/content padding doesn't scale down properly.

Output: Updated SCSS files for layout, header, and menu that work on tablet and phone screens.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/dashboard/app/layouts/dashboard.vue
@apps/dashboard/app/components/HeaderDefault.vue
@apps/dashboard/app/components/MenuDefault.vue
@apps/dashboard/app/scss/components/_layout.scss
@apps/dashboard/app/scss/components/_header.scss
@apps/dashboard/app/scss/components/_menu.scss
@apps/dashboard/app/scss/abstracts/_mixins.scss
@apps/dashboard/app/scss/abstracts/_variables.scss

<interfaces>
Breakpoint mixins (from _mixins.scss):
- `screen-small`: max-width 530px (phones)
- `screen-medium`: max-width 768px (small tablets)
- `screen-large`: max-width 1024px (tablets -- already used as sidebar toggle breakpoint)

Current layout structure (dashboard.vue):
- `.layout.layout--dashboard` wrapper with `.layout--dashboard--open` toggle
- `.layout--dashboard__overlay` (click to close sidebar)
- `.layout--dashboard__menu` (350px fixed sidebar)
- `.layout--dashboard__content` (flex:1 with margin-left:350px)
  - HeaderDefault (fixed top bar, left:350px, width:calc(100%-350px))
  - `.layout--dashboard__main` (padding-top:64px for header)
  - FooterDefault

BEM colors from _variables.scss:
- `$jet: #2d2d2e` (used for overlay rgba)
- `$charcoal: #313338` (hamburger icon color)
- `$platinum: #ededed` (hamburger hover bg)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Make layout, header, and menu SCSS responsive for tablet and phone</name>
  <files>
    apps/dashboard/app/scss/components/_layout.scss
    apps/dashboard/app/scss/components/_header.scss
    apps/dashboard/app/scss/components/_menu.scss
  </files>
  <action>
The existing `screen-large` (<=1024px) breakpoint already handles sidebar off-canvas + hamburger visibility. Add `screen-small` (<=530px) refinements for phones. All changes are SCSS-only -- do not modify Vue templates.

**_layout.scss** -- inside the existing `@include screen-large` block for `&--dashboard`:
- The sidebar menu width (350px) is fine for tablets but too wide for phones. Add a nested `@include screen-small` inside `&__menu` that sets `width: 100vw` so the sidebar takes the full screen on phones. This gives max tap target area and avoids a sliver of content peeking through.

**_header.scss** -- inside the existing `@include screen-large` block for `&--default`:
- Add `justify-content: space-between` so the hamburger (left) and toolbar/dropdown (right) spread to edges.
- Add a nested `@include screen-small` block that reduces `padding: 0 16px` (from 24px) for tighter phone screens.

**_menu.scss** -- add responsive refinements:
- Add `@include screen-small` inside `&--default` that reduces `&__logo` padding to `0 16px`, `&__link` padding to `11px 16px`, and `&__sublink` padding to `11px 16px` for slightly tighter horizontal spacing on phones. This is a subtle improvement, not a radical change.

IMPORTANT:
- Do NOT add box-shadow or transform: scale (per CLAUDE.md)
- Do NOT change any colors outside the brand palette
- Do NOT modify any Vue template files -- this is SCSS-only
- Keep all existing styles intact, only add new responsive rules
- Use existing BEM namespace (layout--dashboard, header--default, menu--default)
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn --cwd apps/dashboard nuxt typecheck 2>&1 | tail -5</automated>
  </verify>
  <done>
    - On desktop (>1024px): layout unchanged -- 350px fixed sidebar, header offset by sidebar width
    - On tablet (<=1024px): sidebar slides in from left at 350px wide, overlay visible, hamburger in header
    - On phone (<=530px): sidebar takes full viewport width, header and menu padding reduced to 16px
    - No horizontal overflow on any screen size
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Responsive dashboard layout for tablet and phone screens</what-built>
  <how-to-verify>
    1. Run `yarn --cwd apps/dashboard dev` and open http://localhost:3001
    2. Open browser DevTools and toggle device toolbar (Ctrl+Shift+M)
    3. Test at 1024px width (tablet): sidebar should be hidden, hamburger visible in header; clicking hamburger opens sidebar with overlay
    4. Test at 530px width (phone): sidebar should take full screen width when open; header padding should be tighter
    5. Test at 375px width (iPhone SE): no horizontal scrollbar, sidebar fills screen when open
    6. Close sidebar by tapping overlay or navigating -- should close smoothly
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `yarn --cwd apps/dashboard nuxt typecheck` passes (no template or script changes, but confirms no build breakage)
- Visual inspection on 3 breakpoints: desktop (>1024px), tablet (768-1024px), phone (<530px)
</verification>

<success_criteria>
- Dashboard layout works on tablet (sidebar toggleable, no overlap issues)
- Dashboard layout works on phone (sidebar full-width, no horizontal overflow, padding reduced)
- Desktop layout completely unchanged
- No new Vue template files modified -- SCSS only
</success_criteria>

<output>
After completion, create `.planning/quick/260406-raw-haz-que-el-layout-del-dashboard-funcione/260406-raw-SUMMARY.md`
</output>

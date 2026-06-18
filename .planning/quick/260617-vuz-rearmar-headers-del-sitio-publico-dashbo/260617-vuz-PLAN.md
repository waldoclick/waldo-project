---
phase: quick-260617-vuz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/components/HeaderDefault.vue
  - apps/website/app/components/MenuDefault.vue
  - apps/website/app/components/MenuAuth.vue
  - apps/website/app/components/SearchIcon.vue
  - apps/website/app/components/HeaderDashboard.vue
  - apps/website/app/components/ToolbarDefault.vue
  - apps/website/app/layouts/dashboard.vue
  - apps/website/app/scss/components/_header.scss
autonomous: true
requirements: [HDR-PUBLIC, HDR-DASHBOARD, HDR-RECHECK]
must_haves:
  truths:
    - "Logged-out public header matches index.dc.html:99-125 (logo wordmark visible, nav Anuncios/Por qué Waldo/Blog, search icon, Iniciar sesión + Regístrate + amber Anunciar ahora)"
    - "Logged-in public header matches mockup (search icon + amber Anunciar ahora + UserMenu, no Iniciar sesión/Regístrate)"
    - "Clicking the header search icon opens the search lightbox"
    - "Dashboard topbar matches dashboard.dc.html:69-134 (white bar, bottom $line, ~64px, right-side icon buttons + dropdowns + avatar)"
    - "Account header and search lightbox still match their mockups after the changes (visual re-check, no regression)"
  artifacts:
    - path: "apps/website/app/components/HeaderDefault.vue"
      provides: "Public/account header markup"
    - path: "apps/website/app/components/MenuDefault.vue"
      provides: "Public nav links (Anuncios / Por qué Waldo / Blog)"
    - path: "apps/website/app/components/HeaderDashboard.vue"
      provides: "Dashboard topbar markup"
    - path: "apps/website/app/scss/components/_header.scss"
      provides: "header--default and header--dashboard styles"
  key_links:
    - from: "apps/website/app/components/SearchIcon.vue"
      to: "appStore.openSearchLightbox"
      via: ".search--icon button @click"
      pattern: "openSearchLightbox"
    - from: "apps/website/app/layouts/dashboard.vue"
      to: "HeaderDashboard"
      via: "component in layout--dashboard__content"
      pattern: "HeaderDashboard"
    - from: "apps/website/app/components/HeaderDefault.vue"
      to: "MenuDefault / MenuAuth / MenuUser"
      via: "imported sub-components"
      pattern: "MenuDefault|MenuAuth|MenuUser"
---

<objective>
Rebuild the site HEADERS to match the /design mockups, with MANDATORY visual verification.
Redesign v1.47: UPDATE existing components/SCSS (never create new); translate mockup inline
styles to BEM with phase-04 tokens; do NOT modify existing SCSS variables.

SCOPE — headers only, NO sidebars. Three atomic tasks (one commit each):
- Area 1: public header (HeaderDefault + nav + search icon + auth) → index.dc.html:99-125
- Area 2: dashboard TOPBAR only (HeaderDashboard + topbar styles) → dashboard.dc.html:69-134
- Area 3: visual re-check of account header + search lightbox (already DONE, confirm no regression)

Purpose: the public and dashboard chrome currently diverge from the new brand mockups.
Output: updated header components/SCSS verified by screenshot against the .dc.html mockups.
</objective>

<context>
@.planning/STATE.md
@CLAUDE.md
@design/index.dc.html
@design/dashboard.dc.html
@.planning/quick/headers-redesign.md
@apps/website/app/components/HeaderDefault.vue
@apps/website/app/components/HeaderDashboard.vue
@apps/website/app/components/MenuDefault.vue
@apps/website/app/components/MenuAuth.vue
@apps/website/app/components/SearchIcon.vue
@apps/website/app/components/ToolbarDefault.vue
@apps/website/app/layouts/dashboard.vue
@apps/website/app/scss/components/_header.scss

<facts_resolved_during_planning>
These resolve contradictions between the task description and the actual mockup/codebase.
Follow the MOCKUP and these facts, not the looser prose in the description.

1. LOGO IS NOT A MISSING/BROKEN ASSET. `public/images/logo-black.svg` is width 152 and
   already contains the full "waldo" wordmark + icon. If the wordmark looks clipped in a
   screenshot it is a CSS render bug (e.g. `header--default__logo img { height: 28px }`
   clipping, fixed width, or overflow), NOT a bad asset. Diagnose via screenshot; do NOT
   swap or edit the SVG.

2. THE MOCKUP HEADER HAS A SEARCH ICON BUTTON ONLY — NO inline search bar in the header.
   index.dc.html:99-125 contains only the icon button (line 111). The two <input> elements
   in the mockup are the HERO search (line 231) and the LIGHTBOX search (line 165) — both
   OUT OF SCOPE. On public pages the header must be `searchIcon=true` (default) and
   `showSearch=false`. Do NOT add an inline form to the header.

3. PUBLIC NAV LINKS in the mockup are: "Anuncios" (/anuncios), "Por qué Waldo" (anchor),
   "Blog" (/blog). The current MenuDefault links (Categorías / ¿Cómo publicar? / Comprar
   packs) are the WRONG set and must be replaced.

4. DASHBOARD TOPBAR — LEFT SIDE (breadcrumb + page title) has NO global data source today.
   Dashboard pages render their breadcrumb+title INSIDE the page content via
   HeroHeaderDashboard/BreadcrumbsDashboard (per-page `title` + `breadcrumbs` props). Do NOT
   invent a new global title mechanism. Area 2 restyles the TOPBAR CHROME (white bar,
   $line bottom border, ~64px, right-side icon buttons + dropdowns + avatar via the existing
   ToolbarDefault + MenuUser). The left side keeps the existing hamburger (mobile) — leave
   the breadcrumb+title to the in-page Hero, which already matches the mockup visually.

5. RESOURCE/OOM RULE: never run the full Jest/Vitest suite. Use `vue-tsc --noEmit` for
   typecheck (nuxi typecheck fails on estree-walker per STATE.md). ONE heavy op at a time —
   one screenshot OR one tsc, never concurrent. Dev server is already running (Nuxt :3000,
   Strapi :1337) — do NOT start another.

6. phase-04 tokens already exist in _variables.scss: $ink #26252b, $ink2 #56535f,
   $muted #8a8794, $amber #f7c97e, $amber_hover #efb85c, $amber_tint #fef8ec, $tag #a9772e,
   $cream #f6f4f1, $line #ece9e4. Do NOT modify them. Add a NEW variable only if a mockup
   color is genuinely missing.
</facts_resolved_during_planning>

<screenshot_recipe>
Node ESM, dev server already running. Save PNGs to /tmp/waldo-shots/ and READ each PNG with
the Read tool (it renders the image — you can see it).

  import pkg from "/home/gab/Code/waldo-project/node_modules/playwright-core/index.js";
  const { chromium } = pkg;
  const b = await chromium.launch({ executablePath: "/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome", args: ["--no-sandbox"] });
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
  // logged-in pages only — add the cookie:
  await c.addCookies([{ name: "waldo_jwt", value: "<TOKEN>", domain: "localhost", path: "/", httpOnly: true, secure: false }]);
  // logged-out: context WITHOUT the cookie.
  // open the search lightbox: await page.evaluate(()=>document.querySelector('.search--icon button')?.click())

waldo_jwt (logged-in, manager id=2):
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzgxNjU4MjY4LCJleHAiOjE3ODQyNTAyNjh9.XL-fSUOh6yetSKrgT3ZxLDJhDjGCSpq70L-5S35f7mE
  If you get a 401/expired response, STOP and ask the user for a fresh token — do not guess.

Width note: at >1400px the public header CSS shows the inline form (where present) and hides
the icon; at <=1400px it shows the icon. Since we are removing the inline header form, the
search icon must be visible at the mockup's reference width (1440px / 1200px content). Verify
the icon is actually present and clickable at 1440px; adjust the `screen-huge`/`screen-large`
breakpoint rules in _header.scss if the icon is hidden there.

BUDGET DISCIPLINE (protects the ~40% context target): cap PNG reads. Do NOT produce a gallery.
Per area, take only the shots listed in that task's <verify>, ONE screenshot at a time
(OOM rule), and stop iterating once it visually matches the mockup.
</screenshot_recipe>
</context>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<tasks>

<task type="auto">
  <name>Task 1: Rebuild the public header to index.dc.html:99-125</name>
  <files>apps/website/app/components/HeaderDefault.vue, apps/website/app/components/MenuDefault.vue, apps/website/app/components/MenuAuth.vue, apps/website/app/components/SearchIcon.vue, apps/website/app/scss/components/_header.scss</files>
  <action>
    Match index.dc.html:99-125 1:1 for the PUBLIC header (used on /, /anuncios, /blog, etc.).

    LAYOUT / SCSS (_header.scss `.header--default`):
    - Bar: max-width 1200px, padding 0 32px, height 74px (currently 70px), align-items center,
      gap 32px between logo and nav. Keep position sticky/fixed top, z-index, transform hide-on-
      scroll behavior already present.
    - Backdrop: `backdrop-filter: blur(16px) saturate(1.08)` (currently 14px/1.06), matching
      `-webkit-backdrop-filter`; keep `border-bottom: 1px solid $line` and transparent bg.
    - LOGO: the wordmark is in logo-black.svg already (FACT 1). The mockup img is `height:30px`.
      Set `header--default__logo img { height: 30px; width: auto; }` and ensure NO clipping
      (remove any fixed width/overflow hidden on the wrapper). Confirm by screenshot that the
      full "waldo" wordmark renders, not just the icon.
    - NAV (`header--default__menu` / MenuDefault): nav links color $ink2, weight 500, font 15px,
      gap 24px, hover color $ink.
    - SEARCH ICON (`header--default__search` / SearchIcon): the mockup icon button is a 40x40
      box, `border:1px solid $line`, white bg, border-radius 4px, color $ink2, hover
      border-color $ink + color $ink, with an 18px magnifier. The icon MUST be visible at the
      1440px reference width — remove/adjust the `screen-huge` rule that hides
      `header--default__search` so the icon shows (we are not using an inline header form).
    - RIGHT CLUSTER (`header--default__right`): gap 14px, margin-left auto. Order per mockup:
      search icon, then (logged-out) Iniciar sesión + Regístrate text links + amber Anunciar
      ahora; (logged-in) amber Anunciar ahora + UserMenu.
    - Amber CTA `.btn--announcement` already styled (amber bg, $ink text, 4px radius, hover
      $amber_hover) — keep, confirm it matches `padding:11px 20px`, font 15px, weight 600.

    HeaderDefault.vue:
    - Ensure `searchIcon` default true and `showSearch` false on public pages (do NOT render the
      inline `header--default__form` / SearchDefault in the header — FACT 2). Leave the account
      override (searchIcon=false in account layout) untouched.
    - Logged-out: render MenuAuth (Iniciar sesión + Regístrate + amber Anunciar ahora).
      Logged-in: render amber Anunciar ahora + MenuUser, and NOT the Iniciar sesión/Regístrate
      links. Use the existing `user` ref to branch (existing v-if structure already does this —
      verify it produces the mockup result for both states).

    MenuDefault.vue: replace the three links with the mockup nav:
      Anuncios → to="/anuncios"; "Por qué Waldo" → to="/#por-que-waldo" (anchor on home);
      Blog → to="/blog". Keep the `menu menu--default` BEM block; titles in Spanish.

    MenuAuth.vue: confirm it renders "Iniciar sesión" (LinkLogin) + "Regístrate" + amber
    "Anunciar ahora" matching the mockup text-link style (color $ink2, weight 500, font 15px,
    padding 8px 11px, radius 4px, hover background $cream + color $ink for the two text links).

    SearchIcon.vue: REMOVE the two `console.log` debug lines (39, 44) — Codacy/clean-code.
    Keep the `.search--icon button @click="...openSearchLightbox()"` wiring intact (key_link;
    the verification recipe clicks `.search--icon button`).

    BEM: strict block--modifier__element, no standalone hyphenated compound classes. Use only
    phase-04 tokens. No box-shadow / transform:scale (CLAUDE.md). No unused vars/imports.
  </action>
  <verify>
    VISUAL (mandatory — typecheck alone is NOT sufficient):
    1. Run `vue-tsc --noEmit` from the worktree (per STATE.md note) — must be clean.
    2. Screenshot loop at viewport 1440x900 (ONE shot at a time):
       a. LOGGED-OUT (context WITHOUT cookie): open http://localhost:3000/ → screenshot
          /tmp/waldo-shots/public-header-out.png → Read it.
       b. LOGGED-IN (context WITH waldo_jwt cookie): open http://localhost:3000/ → screenshot
          /tmp/waldo-shots/public-header-in.png → Read it.
    3. Open design/index.dc.html lines 99-125 and compare element-by-element: logo wordmark
       FULLY visible, nav = Anuncios/Por qué Waldo/Blog, search icon present, right cluster
       correct for each state (out = Iniciar sesión+Regístrate+amber CTA; in = amber CTA+
       UserMenu), 74px height, blur, $line bottom border, gap/spacing.
    4. Click `.search--icon button` (page.evaluate) → screenshot → Read → confirm the search
       lightbox opens.
    5. Fix any discrepancy → re-screenshot → Read → repeat until it matches. Stop when matched.
  </verify>
  <done>
    Public header (logged-out AND logged-in) visually matches index.dc.html:99-125: full logo
    wordmark, correct nav links, search icon that opens the lightbox, correct right cluster per
    auth state, 74px/blur(16px)/$line. vue-tsc clean. SearchIcon console.logs removed.
    Atomic commit: "feat(260617-vuz): rebuild public header to index.dc.html mockup".
  </done>
</task>

<task type="auto">
  <name>Task 2: Restyle the dashboard TOPBAR to dashboard.dc.html:69-134</name>
  <files>apps/website/app/components/HeaderDashboard.vue, apps/website/app/components/ToolbarDefault.vue, apps/website/app/scss/components/_header.scss, apps/website/app/layouts/dashboard.vue</files>
  <action>
    Match dashboard.dc.html:69-134 for the TOPBAR ONLY. Do NOT touch the left sidebar
    (`layout--dashboard__menu`, MenuMain/MenuDashboard/etc.) — out of scope.

    SCSS (_header.scss `.header--dashboard`):
    - Bar: white bg (#fff), `border-bottom: 1px solid $line` (currently #e5e5e5 — switch to the
      token), ~64px height (mockup uses padding 12px 36px; keep height 64px and padding 0 36px
      or 12px 36px to match), display flex, align-items center. Keep the existing
      fixed/left:350px/width offset behavior tied to the sidebar (do NOT change sidebar width).
    - RIGHT (`header--dashboard__right`): gap 6px (mockup) for the icon-button row; align center.
    - The icon buttons in the mockup are 38x38, border-radius 8px, `border:1px solid $line`,
      white bg, color $ink2, hover bg $cream. The avatar pill is border 1px $line, radius 99px,
      with a 32px amber circle + name + chevron. These map to the existing ToolbarDefault
      dropdowns (DropdownApps=Servicios, DropdownSales=Órdenes, DropdownPendings=Notificaciones,
      fullscreen) + MenuUser (avatar). Restyle ToolbarDefault's trigger buttons
      (`toolbar--default__trigger`) to the 38x38 / radius 8px / $line border / $cream hover spec
      so they match the mockup icon buttons. Add the vertical `$line` divider (1px, height 26px)
      between the fullscreen button and the avatar if the mockup shows it (line 117).
    - LEFT: keep the existing hamburger (`header--dashboard__hamburger`) for mobile. Do NOT add a
      global breadcrumb+title to the topbar (FACT 4) — the per-page Hero already provides it.

    HeaderDashboard.vue: keep ToolbarDefault + MenuUser on the right; keep the hamburger on the
    left. Adjust markup only as needed for the restyle (no new global title source).

    layouts/dashboard.vue: only touch if the topbar restyle requires it (e.g. content top
    offset). Do NOT modify the sidebar markup.

    BEM strict, phase-04 tokens only, no box-shadow/scale, no unused vars/imports.
  </action>
  <verify>
    VISUAL (mandatory — typecheck alone is NOT sufficient):
    1. `vue-tsc --noEmit` clean.
    2. Screenshot (viewport 1440x900, context WITH waldo_jwt cookie, ONE shot):
       open http://localhost:3000/dashboard → screenshot /tmp/waldo-shots/dash-topbar.png → Read.
    3. Open design/dashboard.dc.html lines 69-134 and compare the TOPBAR: white bar, $line bottom
       border, ~64px, right-side 38x38 rounded icon buttons (Servicios/Órdenes/Notif/Fullscreen)
       + divider + avatar pill (amber circle + name + chevron). Sidebar must be unchanged.
    4. Click one dropdown trigger → screenshot → Read → confirm a dropdown panel opens and is
       styled (white, $line border, rounded). Fix discrepancies → re-screenshot → repeat.
  </verify>
  <done>
    Dashboard topbar visually matches dashboard.dc.html:69-134 (white bar, $line border, ~64px,
    rounded icon buttons + dropdowns + avatar pill); sidebar untouched; dropdowns open and are
    styled. vue-tsc clean. Atomic commit:
    "feat(260617-vuz): restyle dashboard topbar to dashboard.dc.html mockup".
  </done>
</task>

<task type="auto">
  <name>Task 3: Visual re-check of account header + search lightbox (no regression)</name>
  <files>apps/website/app/components/HeaderDefault.vue, apps/website/app/scss/components/_header.scss</files>
  <action>
    The account header (HeaderDefault with searchIcon=false in layouts/account.vue, commit
    d924de2d) and the search lightbox (LightboxSearch.vue, commit a06f2546) are already DONE and
    were previously verified. This task is a VISUAL RE-CHECK to confirm Task 1's changes did not
    regress them — NOT a rebuild.

    Only if the re-check reveals a regression: make the minimal fix needed to restore the match
    (most likely in _header.scss or HeaderDefault.vue, since Task 1 touched shared styles). If
    both match the mockup, make NO code change and record the re-check result.
  </action>
  <verify>
    VISUAL (mandatory):
    1. Account header (context WITH waldo_jwt cookie, 1440x900): open an account page
       (e.g. http://localhost:3000/cuenta — if it redirects, use the account landing route) →
       screenshot /tmp/waldo-shots/account-header.png → Read → compare to account.dc.html:28-37
       (logo + amber "Anunciar ahora" + UserMenu only; NO nav, NO search icon).
    2. Search lightbox: on the public home (logged-out is fine), click `.search--icon button`
       (page.evaluate) → screenshot /tmp/waldo-shots/lightbox-recheck.png → Read → compare to
       index.dc.html:159-212 (centered 620px box, search bar + Esc, recents + categories).
    3. If either regressed, fix minimally → re-screenshot → Read → confirm. If clean, no change.
  </verify>
  <done>
    Account header still matches account.dc.html:28-37 and the search lightbox still matches
    index.dc.html:159-212 after Task 1's shared-style changes. If a regression was fixed, an
    atomic commit "fix(260617-vuz): restore account header / search lightbox after header
    rebuild"; if no regression, note "re-check passed, no change" in the summary.
  </done>
</task>

</tasks>

<verification>
- Public header (logged-out + logged-in) matches index.dc.html:99-125 by screenshot.
- Dashboard topbar matches dashboard.dc.html:69-134 by screenshot; sidebar untouched.
- Account header + search lightbox still match their mockups (no regression).
- Search icon (`.search--icon button`) opens the lightbox.
- `vue-tsc --noEmit` clean. No full test suite run. No unused vars/imports. BEM strict,
  phase-04 tokens only, no box-shadow/scale.
</verification>

<success_criteria>
Each area screenshot-verified against its .dc.html mockup (screenshot → Read PNG → compare →
fix → repeat). Three atomic commits (or two + a re-check note). Existing SCSS variables
unmodified. No new components created.
</success_criteria>

<output>
After completion, create
`.planning/quick/260617-vuz-rearmar-headers-del-sitio-publico-dashbo/260617-vuz-SUMMARY.md`
recording: per-area commits, the resolved facts (logo not broken, header icon-only, dashboard
topbar left = in-page Hero), any regression fixed in Task 3, and the verified screenshot paths.
</output>

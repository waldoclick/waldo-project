# Quick: Headers + Search Lightbox redesign (v1.47)

Rebuild every area header to the `/design/*.dc.html` mockups + the search lightbox.
Visual work is verified by screenshot (Playwright + waldo_jwt cookie), one area per
loop iteration, atomic commits. NOT via blind executors (see
feedback_visual_work_screenshot_loop).

## Design map (source: Explore report)
- Public header `HeaderDefault` — index.dc.html:99-125. Already restyled (06-02);
  minor gaps (74 vs 70px, blur 16 vs 14).
- Account header — account.dc.html:28-37 = logo + "Anunciar ahora" + UserMenu only
  (no nav, no search). Was reusing full HeaderDefault.
- Dashboard — dashboard.dc.html:28-135. Sidebar 248px (design) vs 350px (current),
  topbar 64px, 6 icon buttons + dropdowns. Layout `layout--dashboard__menu` + HeaderDashboard.
- Search lightbox — index.dc.html:159-212 = centered 620px box, "Esc" hint, query/empty
  states, últimas búsquedas + category grid. Current `LightboxSearch.vue` is the OLD
  770px box + image/text. Needs full rebuild. Trigger = SearchIcon in header.

## Tokens / BEM
phase-04 tokens ($ink #26252B, $ink2 #56535F, $muted #8A8794, $amber #F7C97E,
$amber_hover #EFB85C, $amber_tint #FEF8EC, $cream #F6F4F1, $line #ECE9E4).
Update existing components/SCSS, never create new. BEM block--modifier__element.

## Progress
- [x] **Account header** — d924de2d. searchIcon prop (off in account), hamburger
      hidden >1024px globally. Verified desktop + mobile (public + account).
- [ ] **Search lightbox** — rebuild LightboxSearch.vue + _lightbox.scss to
      index.dc.html:159-212 (620px box, Esc hint, recientes + categorías).
- [ ] **Dashboard header/sidebar** — 248px sidebar, 64px topbar, dropdowns.
- [ ] **Public header polish** — 74px height, blur 16px vs index.dc.html.

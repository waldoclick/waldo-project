---
created: 2026-03-29T16:01:14.334Z
title: Unify backdrop styles with shared SCSS mixin
area: ui
files:
  - apps/website/assets/scss/ (gallery, lightbox, swal components)
---

## Problem

Backdrop overlays across the app (gallery lightbox, other lightboxes, SweetAlert2 modals) have inconsistent styles. The gallery backdrop currently has a blur effect (`backdrop-filter: blur(...)`) and is slightly less transparent than other backdrops. There is no shared source of truth for backdrop visual properties, leading to style drift across components.

## Solution

1. Find the gallery's backdrop SCSS rules (blur + opacity/transparency values).
2. Extract those values into a reusable SCSS mixin — e.g. `@mixin backdrop-lightbox` — defined in a shared partial (e.g. `_mixins.scss` or `_backdrop.scss`).
3. Apply the mixin to all lightbox backdrops that should have this treatment. Some lightboxes/swals may intentionally have no backdrop — those should be left alone or noted as exceptions.
4. Apply the mixin to SweetAlert2 backdrop overrides (`.swal2-backdrop-show` or equivalent).
5. Result: one mixin controls blur + transparency for all unified backdrops.

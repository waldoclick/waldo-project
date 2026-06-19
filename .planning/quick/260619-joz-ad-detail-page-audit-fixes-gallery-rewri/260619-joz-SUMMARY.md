---
id: 260619-joz
type: quick
phase: quick
plan: 260619-joz
subsystem: website/public
tags: [gallery, lightbox, redesign, ad-detail, css]
key-files:
  created: []
  modified:
    - apps/website/app/components/GalleryDefault.vue
    - apps/website/app/scss/components/_gallery.scss
    - apps/website/app/components/HeroAnnouncement.vue
    - apps/website/app/pages/anuncios/[slug].vue
    - apps/website/app/components/AdSingle.vue
    - apps/website/app/components/ReminderDefault.vue
    - apps/website/app/scss/components/_announcement.scss
    - apps/website/app/scss/components/_reminder.scss
    - apps/website/app/scss/components/_related.scss
    - apps/website/app/scss/components/_hero.scss
decisions:
  - Used $success_strong SCSS variable instead of hardcoded #1F8A5B for verified badge color (variable exists in _variables.scss)
  - Kept vue-easy-lightbox package installed (GalleryDashboard.vue still uses it); only removed import from GalleryDefault.vue
metrics:
  duration: ~25 min
  completed: 2026-06-19
  tasks_completed: 4
  files_modified: 10
---

# Quick Task 260619-joz: Ad Detail Page Audit Fixes + Gallery Rewrite — Summary

**One-liner:** Custom inline Vue lightbox replaces vue-easy-lightbox in GalleryDefault (5 square thumbnails, keyboard nav, Esc/arrow/click-outside close), plus 5 targeted CSS fixes and verified seller badge across AdSingle/ReminderDefault.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Gallery rewrite — custom lightbox, 5 thumbnails, remove vue-easy-lightbox | 80bc58c9 | GalleryDefault.vue, _gallery.scss |
| 2 | HeroAnnouncement views prop + wire in [slug].vue | 63930ebb | HeroAnnouncement.vue, [slug].vue |
| 3 | AdSingle verified badge + ReminderDefault verified prop | b964ab8b | AdSingle.vue, ReminderDefault.vue, _announcement.scss, _reminder.scss |
| 4 | CSS fixes — related section, gallery backdrop-filter, hero title, description | b881992b | _related.scss, _gallery.scss, _hero.scss, _announcement.scss |

## Key Changes

### Task 1: Gallery Rewrite
- Removed `VueEasyLightbox` import and `<client-only>` wrapper entirely
- Added custom inline lightbox as `gallery--default__lightbox` fixed overlay
- Keyboard handler via `onMounted`/`onUnmounted` (ArrowLeft/ArrowRight/Escape)
- Thumbnail strip at bottom; active thumbnail gets `$amber` border
- `thumbnailImages`: `slice(1, 4)` → `slice(1, 6)` (up to 5 thumbnails shown)
- `remainingImages`: threshold changed from `> 4` to `> 6`
- `imgIndex === 2` overlay check changed to `imgIndex === 4`
- Thumbnail `aspect-ratio: 4/3` → `1/1` in SCSS
- Full lightbox SCSS block added to `_gallery.scss`

### Task 2: Views meta in HeroAnnouncement
- New `views` prop (Number, default 0)
- Eye icon from lucide-vue-next; shown with `v-if="views > 0"` in meta row
- `[slug].vue` passes `:views="(adComputed as Record<string, any>)?.views ?? 0"`

### Task 3: Verified badge
- `isVerified` computed: `user.verified === true`
- Conditional v-if/v-else chips: green "Verificado" vs grey "Sin verificar"
- `__verified` SCSS in `_announcement.scss` uses `$success_strong` variable
- `ReminderDefault` gets `verified` Boolean prop + "Anunciante verificado por Waldo" line
- `__verified` SCSS in `_reminder.scss` also uses `$success_strong`

### Task 4: CSS Fixes
- **_related.scss**: `.related--ads` — `$cream` bg, `$line` top border, `56px 0` padding; title: Poppins 800 30px, -0.6px letter-spacing, 28px bottom margin; `__head` margin-bottom removed
- **_gallery.scss**: `backdrop-filter: blur(4px)` on `__badge` and `__condition`
- **_hero.scss**: `text-wrap: balance` on `--announcement__title`
- **_announcement.scss**: `text-wrap: pretty` on `--single__body__description__text`

## Deviations from Plan

**[Rule 2 - Enhancement] Used $success_strong SCSS variable instead of hardcoded hex**
- Found during: Task 3
- Issue: Plan specified `#1F8A5B` hardcoded. CLAUDE.md says never invent colors; `_variables.scss` has `$success_strong: #1f8a5b` (exact match)
- Fix: Used `$success_strong` variable in both `_announcement.scss` and `_reminder.scss`
- Files modified: Both SCSS files above

None other — plan executed as written.

## Verification

- `grep -r "VueEasyLightbox" apps/website/app/components/GalleryDefault.vue` → empty (clean)
- `git diff apps/website/app/components/GalleryDashboard.vue apps/website/app/scss/components/_easy.scss` → empty (untouched)
- `vue-tsc --noEmit` → exit code 0 (no type errors)
- Test URL: http://localhost:3000/anuncios/wylie-lane-1773673898884

## Self-Check: PASSED

- All 4 task commits exist: 80bc58c9, 63930ebb, b964ab8b, b881992b
- All 10 files modified
- vue-tsc clean (exit 0)
- GalleryDashboard.vue and _easy.scss untouched
- VueEasyLightbox fully removed from GalleryDefault.vue

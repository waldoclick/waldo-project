---
id: 260619-joz
type: quick
autonomous: true
files_modified:
  - apps/website/app/components/GalleryDefault.vue
  - apps/website/app/scss/components/_gallery.scss
  - apps/website/app/components/HeroAnnouncement.vue
  - apps/website/app/components/AdSingle.vue
  - apps/website/app/components/ReminderDefault.vue
  - apps/website/app/scss/components/_reminder.scss
  - apps/website/app/scss/components/_announcement.scss
  - apps/website/app/scss/components/_related.scss
  - apps/website/app/scss/components/_hero.scss
  - apps/website/app/pages/anuncios/[slug].vue
---

<objective>
Fix all issues found in the design audit of the ad detail page (anuncios/[slug]) and rewrite the gallery with a custom lightbox.

Test URL: http://localhost:3000/anuncios/wylie-lane-1773673898884
</objective>

<context>
@apps/website/app/components/GalleryDefault.vue
@apps/website/app/components/HeroAnnouncement.vue
@apps/website/app/components/AdSingle.vue
@apps/website/app/components/ReminderDefault.vue
@apps/website/app/scss/components/_gallery.scss
@apps/website/app/scss/components/_hero.scss
@apps/website/app/scss/components/_announcement.scss
@apps/website/app/scss/components/_reminder.scss
@apps/website/app/scss/components/_related.scss
@apps/website/app/pages/anuncios/[slug].vue

<interfaces>
<!-- SCSS variables in apps/website/app/scss/abstracts/_variables.scss -->
$ink: #26252b
$ink2: #56535f
$muted: (greyish — see _variables.scss)
$amber: #f7c97e
$amber_hover: #efb85c
$cream: #f6f4f1
$line: #ece9e4
$white: #ffffff

<!-- GalleryDefault.vue current structure (plain JS SFC) -->
- Props: media (Array), condition (String)
- Imports: VueEasyLightbox (to be REMOVED), Maximize2, Image as ImageIcon, useImageProxy
- Computed: mainImage, thumbnailImages (slice 1,4), imgs, photosLabel, remainingImages
- show(i) opens lightbox

<!-- HeroAnnouncement.vue current props -->
name (String, required), category (Object, required), user (Object, required), published (String, default "")
Imports: ChevronRight, Clock, ArrowLeft

<!-- AdSingle.vue current structure -->
- getUserFromAll computed: props.all?.user || null
- In __info__chips: hardcoded `<span class="...__unverified">Sin verificar</span>`
- ReminderDefault used as `<ReminderDefault />` (no props)
- Imports: Check already imported from lucide-vue-next

<!-- _announcement.scss __info__unverified selector path -->
.announcement--single__sidebar__contact__seller__info__chips → &__unverified
Position: line 458, inside &--single → &__sidebar → &__contact → &__seller → &__info → &__chips

<!-- anuncios/[slug].vue passes to HeroAnnouncement -->
:name :category :user :published — no views yet
adComputed.value?.views would be the new prop source
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Gallery rewrite — custom lightbox, 5 thumbnails, remove vue-easy-lightbox</name>
  <files>
    apps/website/app/components/GalleryDefault.vue
    apps/website/app/scss/components/_gallery.scss
  </files>
  <action>
Rewrite GalleryDefault.vue completely. Keep plain JS (no TypeScript — the file has no lang="ts"). Remove the `<client-only>` wrapper and all VueEasyLightbox references.

**Main image** (no changes needed — already has 16/10 aspect-ratio, amber border hover, veil, Ampliar badge, photos count badge, condition badge; `backdrop-filter: blur(4px)` will be added in CSS Task 4b).

**Thumbnails** — change `props.media.slice(1, 4)` to `props.media.slice(1, 6)` (5 thumbnails). Change aspect-ratio from 4/3 to 1/1 in SCSS. The +N overlay check: was `imgIndex === 2 && remainingImages > 0` → change to `imgIndex === 4 && remainingImages > 0`. Update `remainingImages` computed: was `props.media.length > 4 ? props.media.length - 4 : 0` → `props.media.length > 6 ? props.media.length - 6 : 0`.

**Custom lightbox** — add inline in the same SFC as a `<div class="gallery--default__lightbox" ...>` (no Teleport needed — fixed positioning works). Structure:

```html
<div
  v-if="lightboxVisible"
  class="gallery--default__lightbox"
  @click.self="lightboxVisible = false"
>
  <div class="gallery--default__lightbox__inner">
    <div class="gallery--default__lightbox__top">
      <span class="gallery--default__lightbox__top__counter">
        {{ lightboxIndex + 1 }} / {{ imgs.length }}
      </span>
      <button class="gallery--default__lightbox__top__close" @click="lightboxVisible = false">
        ✕ Cerrar
      </button>
    </div>

    <div class="gallery--default__lightbox__stage">
      <button class="gallery--default__lightbox__stage__arrow gallery--default__lightbox__stage__arrow--prev" @click="lightboxPrev">
        <ChevronLeft :size="22" />
      </button>
      <img
        class="gallery--default__lightbox__stage__image"
        :src="imgs[lightboxIndex]"
        alt="Imagen ampliada"
      />
      <button class="gallery--default__lightbox__stage__arrow gallery--default__lightbox__stage__arrow--next" @click="lightboxNext">
        <ChevronRight :size="22" />
      </button>
    </div>

    <div class="gallery--default__lightbox__strip">
      <div
        v-for="(img, i) in imgs"
        :key="i"
        class="gallery--default__lightbox__strip__item"
        :class="{ 'gallery--default__lightbox__strip__item--active': i === lightboxIndex }"
        @click="lightboxIndex = i"
      >
        <img :src="img" :alt="`Foto ${i + 1}`" />
      </div>
    </div>
  </div>
</div>
```

**Script changes:**
- Remove: `import VueEasyLightbox from "vue-easy-lightbox/dist/external-css/vue-easy-lightbox.esm.min.js"`
- Add imports: `ChevronLeft, ChevronRight` from lucide-vue-next (already has Maximize2, ImageIcon)
- Replace `const index = ref(0); const visible = ref(false);` with `const lightboxIndex = ref(0); const lightboxVisible = ref(false);`
- Replace `show(i)` with:
  ```js
  const show = (i) => { lightboxIndex.value = i; lightboxVisible.value = true; }
  const lightboxPrev = () => { lightboxIndex.value = (lightboxIndex.value - 1 + imgs.value.length) % imgs.value.length; }
  const lightboxNext = () => { lightboxIndex.value = (lightboxIndex.value + 1) % imgs.value.length; }
  ```
- Add keyboard handler (onMounted / onUnmounted):
  ```js
  import { ref, computed, onMounted, onUnmounted } from "vue";
  const handleKey = (e) => {
    if (!lightboxVisible.value) return;
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
    if (e.key === 'Escape') lightboxVisible.value = false;
  };
  onMounted(() => window.addEventListener('keydown', handleKey));
  onUnmounted(() => window.removeEventListener('keydown', handleKey));
  ```

**SCSS additions to _gallery.scss** — add under `.gallery--default` AFTER the existing `&__thumbnails` block:

```scss
    &__thumbnails {
      // existing styles — change aspect-ratio: 4/3 → 1/1
    }

    &__lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;

      &__inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      &__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        flex: none;

        &__counter {
          color: $white;
          font-size: 13px;
          font-weight: 500;
        }

        &__close {
          background: transparent;
          color: $white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }

      &__stage {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        min-height: 0;

        &__image {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          display: block;
        }

        &__arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: $white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          &--prev { left: 16px; }
          &--next { right: 16px; }
        }
      }

      &__strip {
        flex: none;
        display: flex;
        gap: 8px;
        justify-content: center;
        padding: 12px 16px;
        overflow-x: auto;

        &__item {
          flex: none;
          width: 64px;
          height: 48px;
          border-radius: 3px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          &--active {
            border-color: $amber;
          }
        }
      }
    }
```

Also in existing `&__thumbnails__item`: change `aspect-ratio: 4 / 3` to `aspect-ratio: 1 / 1`.
  </action>
  <verify>
    Visit http://localhost:3000/anuncios/wylie-lane-1773673898884:
    - Gallery shows main image + up to 5 thumbnails (square aspect ratio)
    - Clicking main image or thumbnail opens the custom lightbox (dark backdrop)
    - Counter shows "N / total" top-left; "✕ Cerrar" button top-right
    - Left/right arrows navigate; thumbnail strip at bottom highlights active
    - Esc closes lightbox; clicking outside the inner content closes it
    - No vue-easy-lightbox DOM artifacts visible
    Run: `grep -r "VueEasyLightbox" apps/website/app/components/GalleryDefault.vue` → empty
  </verify>
  <done>Custom lightbox works; vue-easy-lightbox fully removed from GalleryDefault.vue; 5 thumbnails shown; square thumbnail aspect ratio</done>
</task>

<task type="auto">
  <name>Task 2: HeroAnnouncement views prop + wire in [slug].vue</name>
  <files>
    apps/website/app/components/HeroAnnouncement.vue
    apps/website/app/pages/anuncios/[slug].vue
  </files>
  <action>
**HeroAnnouncement.vue:**

1. Add `views` prop:
   ```js
   views: {
     type: Number,
     default: 0,
   },
   ```

2. Add `Eye` to lucide imports: `import { ChevronRight, Clock, ArrowLeft, Eye } from "lucide-vue-next";`

3. After the existing `publishedLabel` meta item in the template, add:
   ```html
   <span v-if="views > 0" class="hero--announcement__meta__item">
     <Eye class="hero--announcement__meta__item__icon" :size="15" />
     {{ views }} vistas
   </span>
   ```
   Place it directly after the `<span v-if="publishedLabel" ...>` block, still inside `<div class="hero--announcement__meta">`.

**[slug].vue:**

Add `:views="(adComputed as Record<string, any>)?.views ?? 0"` to the `<HeroAnnouncement>` component call, after the `:published` prop.
  </action>
  <verify>
    Visit http://localhost:3000/anuncios/wylie-lane-1773673898884
    - If the ad has views > 0: an Eye icon followed by "N vistas" appears in the hero meta row alongside the published date
    - If views is 0 or absent: the vistas item is hidden (v-if="views > 0")
    Run: `grep -n "views" apps/website/app/components/HeroAnnouncement.vue` → shows prop + template usage
  </verify>
  <done>views prop added to HeroAnnouncement; [slug].vue passes adComputed.views; meta item renders when views > 0</done>
</task>

<task type="auto">
  <name>Task 3: AdSingle verified badge + ReminderDefault verified prop</name>
  <files>
    apps/website/app/components/AdSingle.vue
    apps/website/app/components/ReminderDefault.vue
    apps/website/app/scss/components/_announcement.scss
    apps/website/app/scss/components/_reminder.scss
  </files>
  <action>
**AdSingle.vue:**

1. Add `isVerified` computed after `isPro`:
   ```js
   const isVerified = computed(() => getUserFromAll.value?.verified === true);
   ```

2. Replace the hardcoded `<span class="...__unverified">Sin verificar</span>` in `__chips` with:
   ```html
   <span
     v-if="isVerified"
     class="announcement--single__sidebar__contact__seller__info__verified"
   >
     <Check :size="12" />
     Verificado
   </span>
   <span
     v-else
     class="announcement--single__sidebar__contact__seller__info__unverified"
   >
     Sin verificar
   </span>
   ```
   `Check` is already imported.

3. Pass `:verified="isVerified"` to `<ReminderDefault>`:
   ```html
   <ReminderDefault :verified="isVerified" />
   ```

**_announcement.scss:**

Add `&__verified` sibling rule next to the existing `&__unverified` block (line ~458). Mirror the same structure, different colors:

```scss
&__verified {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #E4F2EA;
  color: #1F8A5B;
  font-weight: 700;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
}
```

**ReminderDefault.vue:**

1. Add `verified` prop:
   ```js
   const props = defineProps({
     verified: {
       type: Boolean,
       default: false,
     },
   });
   ```

2. Add `Check` to lucide imports: `import { Lock, LogIn, Check } from "lucide-vue-next";`

3. Add below the "Crear cuenta gratis" nuxt-link (end of template, before closing `</div>`):
   ```html
   <span v-if="props.verified" class="reminder--default__verified">
     <Check :size="13" />
     Anunciante verificado por Waldo
   </span>
   ```

**_reminder.scss:**

Add `&__verified` inside the `&--default` block, after `&__register`:
```scss
&__verified {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 12.5px;
  color: #1F8A5B;
  font-weight: 600;
}
```
  </action>
  <verify>
    Visit http://localhost:3000/anuncios/wylie-lane-1773673898884
    - If logged out: ReminderDefault renders; if the seller is verified, green "Anunciante verificado por Waldo" text appears below the register button
    - If logged in as a user viewing an ad with a verified seller: green "Verificado" chip appears in the seller chips area instead of "Sin verificar"
    Run: `grep -n "isVerified\|__verified" apps/website/app/components/AdSingle.vue` → shows both
  </verify>
  <done>isVerified computed added; conditional verified/unverified chips in AdSingle; ReminderDefault verified prop wired; SCSS rules added for both components</done>
</task>

<task type="auto">
  <name>Task 4: CSS fixes — related section, gallery backdrop-filter, hero title, announcement description</name>
  <files>
    apps/website/app/scss/components/_related.scss
    apps/website/app/scss/components/_gallery.scss
    apps/website/app/scss/components/_hero.scss
    apps/website/app/scss/components/_announcement.scss
  </files>
  <action>
Apply 5 targeted CSS changes. Read each file before editing.

**a) _related.scss** — update `.related--ads` section only (do NOT touch `.related--articles`):

- `.related--ads`: replace `background-color: rgba(240, 240, 240, 0.3)` with `background-color: $cream`, add `border-top: 1px solid $line`, add `padding: 56px 0`
- `.related--ads__title`: replace the existing rule body with `font-family: "Poppins", sans-serif; font-weight: 800; font-size: 30px; letter-spacing: -0.6px; margin: 0 0 28px; display: flex; color: $charcoal; line-height: 1.2;` (keep display/color/line-height from original, update the rest)
- `.related--ads__head`: add `margin-bottom: 0` (or remove `margin-bottom: 50px` — the title now carries its own bottom margin)

**b) _gallery.scss** — add `backdrop-filter: blur(4px)` to the existing `&__badge` and `&__condition` rules inside `&--default__main`. Find the existing `&__badge` block and add it. Find `&__condition` and add it.

**c) _hero.scss** — find the `&--announcement__title` rule (line ~556) and add `text-wrap: balance;` to it.

**d) _announcement.scss** — find the `&--single__body__description__text` rule (line ~225) and add `text-wrap: pretty;` to it.
  </action>
  <verify>
    Visit http://localhost:3000/anuncios/wylie-lane-1773673898884:
    - Related ads section: cream background, visible top border, 56px vertical padding
    - Related section title: Poppins 800 30px, tighter letter-spacing
    - Gallery badges (Ampliar, X fotos, condition): frosted glass appearance (backdrop-filter blur)
    - Hero title: text wraps more naturally (text-wrap: balance)
    Run: `grep -n "text-wrap" apps/website/app/scss/components/_hero.scss apps/website/app/scss/components/_announcement.scss` → shows both additions
    Run: `grep -n "backdrop-filter" apps/website/app/scss/components/_gallery.scss` → shows blur on badge and condition
  </verify>
  <done>All 5 CSS changes applied; related section restyled; gallery badges have backdrop blur; hero title and description text-wrap added</done>
</task>

</tasks>

<verification>
After all tasks complete:
1. http://localhost:3000/anuncios/wylie-lane-1773673898884 loads without JS errors in browser console
2. Gallery custom lightbox opens, navigates, and closes correctly
3. No vue-easy-lightbox imports remain in GalleryDefault.vue
4. `vue-tsc --noEmit` from apps/website/ passes (or at minimum no new type errors introduced)
5. _easy.scss and GalleryDashboard.vue are untouched (confirm with git diff)
</verification>

<success_criteria>
- Gallery rewrite: custom lightbox fully functional, vue-easy-lightbox removed, 5 square thumbnails, +N overlay on 5th when more exist
- HeroAnnouncement: views meta item renders when views > 0
- AdSingle: verified/unverified conditional badge; ReminderDefault receives verified prop
- All 5 CSS fixes applied and visible at test URL
- No regressions in GalleryDashboard.vue or _easy.scss
</success_criteria>

<output>
No SUMMARY file needed for quick tasks.
</output>

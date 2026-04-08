---
phase: quick
plan: 260408-npv
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/anunciar/resumen.vue
  - apps/website/app/components/BarAnnouncement.vue
  - apps/website/app/scss/components/_button.scss
autonomous: true
requirements: [UX-loading-feedback]
must_haves:
  truths:
    - "When user clicks 'Crear anuncio' or 'Continuar al pago', a toast appears with 'Publicando tu anuncio...' message"
    - "The primary button shows a spinning loader icon while the operation is in progress"
    - "The button remains disabled and shows the spinner until the operation completes or fails"
    - "Toast disappears automatically after the normal 3-second timeout"
  artifacts:
    - path: "apps/website/app/pages/anunciar/resumen.vue"
      provides: "Toast trigger on confirmPay start"
    - path: "apps/website/app/components/BarAnnouncement.vue"
      provides: "Spinner icon inside primary button when loading"
    - path: "apps/website/app/scss/components/_button.scss"
      provides: "Inline spinner styles for btn--primary loading state"
  key_links:
    - from: "apps/website/app/pages/anunciar/resumen.vue"
      to: "useToast()"
      via: "toast.info() call at start of confirmPay"
      pattern: "toast\\.info"
    - from: "apps/website/app/components/BarAnnouncement.vue"
      to: "lucide-vue-next Loader2"
      via: "conditional icon render when primaryDisabled + loading"
      pattern: "IconLoader2"
---

<objective>
Add visual loading feedback when creating an ad with image uploads on the resumen (summary) page.

Purpose: Users clicking "Crear anuncio" or "Continuar al pago" currently see no immediate feedback while images upload and the API call processes. This causes confusion and potential double-clicks.
Output: Toast notification on action start + spinning loader icon in the primary button while processing.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/app/pages/anunciar/resumen.vue
@apps/website/app/components/BarAnnouncement.vue
@apps/website/app/scss/components/_button.scss
@apps/website/app/composables/useNotifications.ts
@apps/website/app/components/LoadingDefault.vue (for Loader2 import pattern)
</context>

<interfaces>
<!-- Existing toast system from useNotifications.ts -->
From apps/website/app/composables/useNotifications.ts:
```typescript
export function useToast(): {
  success(message: string): void;
  error(message: string): void;
  info(message: string): void;
  warning(message: string): void;
}
```

From apps/website/app/components/BarAnnouncement.vue props:
```typescript
{
  percentage?: number;
  currentStep?: number;
  totalSteps?: number;
  showSteps?: boolean;
  summaryText?: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  backDisabled?: boolean;
  showBack?: boolean;
}
```

Icon pattern from LoadingDefault.vue:
```typescript
import { Loader2 as IconLoader2 } from "lucide-vue-next";
// <IconLoader2 :size="32" class="loading--default__icon" />
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add loading prop and spinner icon to BarAnnouncement + button spinner SCSS</name>
  <files>apps/website/app/components/BarAnnouncement.vue, apps/website/app/scss/components/_button.scss</files>
  <action>
In BarAnnouncement.vue:
1. Add a new boolean prop `primaryLoading` (default: false) to the props interface.
2. Import `Loader2 as IconLoader2` from `lucide-vue-next` (same pattern as LoadingDefault.vue).
3. In the primary button template, wrap existing `<span>{{ primaryLabel }}</span>` in a conditional: when `primaryLoading` is true, show `<IconLoader2 :size="16" class="btn__spinner" />` followed by `<span>{{ primaryLabel }}</span>`. When false, show just `<span>{{ primaryLabel }}</span>`. Use a single template with v-if on the icon so the label always shows.

The button template should become:
```html
<button
  type="submit"
  class="btn btn--primary btn--block"
  :disabled="primaryDisabled"
  :title="primaryLabel"
  @click="emit('primary')"
>
  <IconLoader2 v-if="primaryLoading" :size="16" class="btn__spinner" />
  <span>{{ primaryLabel }}</span>
</button>
```

In _button.scss:
4. Add a `&__spinner` element inside `.btn` block (after the last modifier, before the closing brace):
```scss
&__spinner {
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}
```
The `spin` keyframe already exists in `_animations.scss` and is imported globally. The `.btn` already has `display: flex; align-items: center; justify-content: center;` so the icon will align naturally next to the label text. Add `gap: 8px` to `.btn--primary` so the spinner and label have spacing (only when spinner is present, flexbox gap handles this gracefully when there is no spinner).
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn --cwd apps/website nuxt typecheck 2>&1 | tail -5</automated>
  </verify>
  <done>BarAnnouncement accepts primaryLoading prop; when true, a 16px spinning Loader2 icon appears inside the primary button next to the label text. Styles use existing spin keyframe.</done>
</task>

<task type="auto">
  <name>Task 2: Show toast and pass loading state in resumen.vue</name>
  <files>apps/website/app/pages/anunciar/resumen.vue</files>
  <action>
In resumen.vue:
1. Import useToast: `const toast = useToast();` (auto-imported composable, same pattern as ShareDefault.vue and UploadImages.vue).
2. At the very start of the `confirmPay` function (before `isCreating.value = true`), add:
   ```typescript
   toast.info("Publicando tu anuncio...");
   ```
   This gives immediate feedback the moment the user clicks.
3. Pass the new `primaryLoading` prop to BarAnnouncement, binding it to `isCreating`:
   ```html
   <BarAnnouncement
     :percentage="100"
     :show-steps="false"
     :summary-text="paymentSummaryText"
     :primary-label="primaryButtonLabel"
     :primary-disabled="isCreating"
     :primary-loading="isCreating"
     @primary="confirmPay"
     @back="router.push('/anunciar/galeria-de-imagenes')"
   />
   ```
4. Remove the unused `isUploadingImages` ref (line 45) — it is declared but never read (only written to in uploadPendingImages). The `isCreating` ref already covers the full loading state. This avoids a Codacy unused-variable warning.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn --cwd apps/website nuxt typecheck 2>&1 | tail -5</automated>
  </verify>
  <done>Clicking "Crear anuncio" or "Continuar al pago" immediately shows an info toast "Publicando tu anuncio..." and the button displays a spinning loader icon next to the label text. Button is disabled during the entire operation. Toast auto-dismisses after 3 seconds per existing useNotifications behavior.</done>
</task>

</tasks>

<verification>
1. `yarn --cwd apps/website nuxt typecheck` passes with no errors
2. Manual: Navigate to /anunciar, fill out an ad, reach resumen page. Click the primary button. Verify:
   - Info toast appears immediately with "Publicando tu anuncio..."
   - Button shows spinning icon next to label text
   - Button is disabled during processing
   - Toast disappears after ~3 seconds
</verification>

<success_criteria>
- TypeScript compiles clean
- Toast notification appears on button click before any async work begins
- Spinner icon visible inside the button while isCreating is true
- No unused variables remain (isUploadingImages removed)
</success_criteria>

<output>
After completion, create `.planning/quick/260408-npv-add-loading-toast-and-button-spinner-whe/260408-npv-SUMMARY.md`
</output>

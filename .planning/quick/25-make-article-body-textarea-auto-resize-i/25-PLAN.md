---
phase: quick-25
plan: 25
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/TextareaArticle.vue
  - apps/dashboard/app/scss/components/_textarea.scss
autonomous: true
requirements: [QUICK-25]
must_haves:
  truths:
    - "Textarea grows taller automatically as the user types more content"
    - "On the edit page, textarea shows correct height for pre-filled content on mount"
    - "Textarea never shrinks below a minimum usable height"
  artifacts:
    - path: "apps/dashboard/app/components/TextareaArticle.vue"
      provides: "Auto-resize logic via resize() called on input, mount, and modelValue watch"
    - path: "apps/dashboard/app/scss/components/_textarea.scss"
      provides: "CSS with overflow:hidden, no fixed height, min-height kept"
  key_links:
    - from: "TextareaArticle.vue onInput"
      to: "resize()"
      via: "called inside onInput after emit"
    - from: "TextareaArticle.vue onMounted"
      to: "resize()"
      via: "handles pre-filled content on edit page"
    - from: "TextareaArticle.vue watch(modelValue)"
      to: "resize()"
      via: "handles programmatic value changes"
---

<objective>
Make the article body textarea in the dashboard auto-resize vertically as the user types, eliminating the fixed `rows="10"` cap and avoiding the need to manually drag the resize handle.

Purpose: Improves UX for article editing — the full content is always visible without scrolling inside the textarea.
Output: TextareaArticle.vue with auto-resize logic + updated SCSS removing resize handle and fixed height constraints.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/dashboard/app/components/TextareaArticle.vue
@apps/dashboard/app/scss/components/_textarea.scss
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add auto-resize logic to TextareaArticle.vue</name>
  <files>apps/dashboard/app/components/TextareaArticle.vue</files>
  <action>
    In `TextareaArticle.vue`:

    1. Add `onMounted` and `watch` to the vue import alongside `ref` (also import `nextTick` if not already imported — it is used in `applyFormat`).

    2. Add a `resize()` function that resets the textarea height then expands it to fit content:
       ```ts
       const resize = () => {
         const el = textareaRef.value;
         if (!el) return;
         el.style.height = 'auto';
         el.style.height = `${el.scrollHeight}px`;
       };
       ```

    3. Call `resize()` inside `onInput` AFTER the emit, so the textarea grows as the user types:
       ```ts
       const onInput = (e: Event) => {
         emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
         resize();
       };
       ```

    4. Call `resize()` inside the `nextTick` in `applyFormat` alongside `el.setSelectionRange(...)`, so formatting actions also trigger a resize.

    5. Add `onMounted(() => { nextTick(resize); })` to handle the edit page case where content is pre-filled when the component mounts.

    6. Add `watch(() => props.modelValue, () => { nextTick(resize); })` to handle programmatic value updates from the parent.

    7. Remove `rows="10"` from the `<textarea>` element in the template — height will be fully controlled by JS.

    The final import line should be:
    ```ts
    import { ref, nextTick, onMounted, watch } from "vue";
    ```
  </action>
  <verify>
    Open the article edit page in the dashboard. The textarea should display at the correct height for the existing content without scrollbars inside it. Typing new paragraphs should expand the textarea downward automatically.
  </verify>
  <done>Textarea height matches its content on mount and grows with typing — no fixed rows, no internal scroll.</done>
</task>

<task type="auto">
  <name>Task 2: Update textarea SCSS to support auto-resize</name>
  <files>apps/dashboard/app/scss/components/_textarea.scss</files>
  <action>
    In `_textarea.scss`, update the `&__editor` block:

    - Change `resize: vertical` to `resize: none` — with auto-resize via JS, the drag handle is no longer needed and would conflict.
    - Remove `min-height: 200px` — replace with a CSS `min-height` of `120px` (a smaller, more reasonable floor), since JS takes over height management. The `rows` attr is removed, so the initial height comes from JS; a small CSS floor prevents flash of zero-height on slow renders.
    - Add `overflow: hidden` — prevents scrollbar from appearing while JS is mid-resize (the `el.style.height = 'auto'` step momentarily makes content overflow).

    Final `&__editor` block:
    ```scss
    &__editor {
      display: block;
      width: 100%;
      padding: 10px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      font-family: inherit;
      resize: none;
      min-height: 120px;
      overflow: hidden;
      box-sizing: border-box;
      color: $charcoal;
    }
    ```
  </action>
  <verify>
    `yarn build --filter=dashboard` completes without SCSS errors. Visually: no scrollbar visible inside the textarea; height expands smoothly as content grows.
  </verify>
  <done>SCSS updated — resize handle removed, overflow hidden, min-height 120px.</done>
</task>

</tasks>

<verification>
After both tasks:
1. Navigate to an article edit page in the dashboard — textarea height matches the existing body content on load.
2. Type several lines of text — textarea expands after each newline.
3. Use a toolbar formatting button (e.g. Bold) — textarea resizes correctly after format insertion.
4. `yarn typecheck --filter=dashboard` passes with no new errors.
</verification>

<success_criteria>
- Textarea auto-grows as content is typed — no internal scrollbar, no fixed row cap
- Pre-filled content on edit page shows at correct height on mount
- No TypeScript errors introduced
- No manual resize handle visible
</success_criteria>

<output>
After completion, create `.planning/quick/25-make-article-body-textarea-auto-resize-i/25-SUMMARY.md`
</output>

---
phase: quick
plan: 260329-mva
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/types/user.d.ts
  - apps/website/app/composables/useUser.ts
  - apps/website/app/components/LightboxTerms.vue
  - apps/website/app/scss/components/_lightbox.scss
  - apps/website/app/layouts/default.vue
  - apps/website/app/layouts/account.vue
  - apps/website/app/layouts/about.vue
  - apps/website/app/layouts/auth.vue
autonomous: true
requirements: []

must_haves:
  truths:
    - "Logged-in users missing accepted_age_confirmation or accepted_terms see a modal lightbox asking them to accept"
    - "After accepting in the lightbox, the fields are saved to Strapi and the lightbox closes"
    - "Users who already have both fields marked true never see the lightbox"
    - "The lightbox appears across all layouts (default, account, about, auth)"
  artifacts:
    - path: "apps/website/app/components/LightboxTerms.vue"
      provides: "Modal lightbox for consent acceptance"
    - path: "apps/website/app/composables/useUser.ts"
      provides: "hasAcceptedTerms computed + acceptTerms function"
    - path: "apps/website/app/types/user.d.ts"
      provides: "accepted_age_confirmation and accepted_terms fields on User interface"
    - path: "apps/website/app/scss/components/_lightbox.scss"
      provides: "lightbox--terms modifier styles"
  key_links:
    - from: "apps/website/app/components/LightboxTerms.vue"
      to: "apps/website/app/composables/useUser.ts"
      via: "useUser().hasAcceptedTerms + acceptTerms()"
      pattern: "hasAcceptedTerms|acceptTerms"
    - from: "apps/website/app/components/LightboxTerms.vue"
      to: "PUT /api/users/:id"
      via: "Strapi client update to persist consent booleans"
      pattern: "updateUserProfile|update.*user"
---

<objective>
Create a LightboxTerms global component that checks whether the logged-in user has accepted_age_confirmation and accepted_terms. If either is missing, show a blocking modal lightbox. This covers legacy users (registered before checkboxes existed) and Google OAuth users (who bypass the registration form).

Purpose: Ensure all active users have consented to age confirmation and terms/privacy policies.
Output: LightboxTerms.vue component, useUser composable extension, User type update, SCSS styles, all layouts wired.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/app/components/LightboxCookies.vue (pattern reference for lightbox component structure)
@apps/website/app/components/LightboxRazon.vue (pattern reference for modal/backdrop lightbox)
@apps/website/app/composables/useUser.ts (extend with consent check)
@apps/website/app/types/user.d.ts (add consent fields)
@apps/website/app/scss/components/_lightbox.scss (add --terms modifier)
@apps/website/app/layouts/default.vue (wire LightboxTerms)
@apps/website/app/layouts/account.vue (wire LightboxTerms)
@apps/website/app/layouts/about.vue (wire LightboxTerms)
@apps/website/app/layouts/auth.vue (wire LightboxTerms)
@apps/website/app/stores/user.store.ts (updateUserProfile for persisting consent)

<interfaces>
From apps/website/app/types/user.d.ts (current — missing consent fields):
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  // ... other fields
  pro_status: "active" | "inactive" | "cancelled" | null;
  // NOTE: accepted_age_confirmation and accepted_terms are NOT yet on User interface
  // They exist on Strapi schema and FormRegister type but not on the User read type
}
```

From apps/website/app/composables/useUser.ts:
```typescript
export const useUser = () => {
  const user = useStrapiUser<User>();
  const canRequestInvoice = computed(() => { ... });
  // Returns: canRequestInvoice, getAdReservations, getAdReservationsText, etc.
};
```

From apps/website/app/stores/user.store.ts:
```typescript
const updateUserProfile = async (userId: string, userData: Record<string, unknown>) => { ... };
```

Lightbox BEM pattern (from _lightbox.scss):
- Base: `.lightbox` with `.lightbox__button` for close
- Modifier: `.lightbox--{name}` for each variant
- Modal pattern (LightboxRazon): `.lightbox--razon__backdrop` + `.lightbox--razon__box` with `is-open` toggle via opacity/visibility
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add User type fields and useUser consent logic</name>
  <files>apps/website/app/types/user.d.ts, apps/website/app/composables/useUser.ts</files>
  <action>
1. In `apps/website/app/types/user.d.ts`, add two boolean fields to the `User` interface (after `pro_card_last4` or similar, near the other boolean-like fields):
   - `accepted_age_confirmation: boolean;`
   - `accepted_terms: boolean;`

2. In `apps/website/app/composables/useUser.ts`, add:
   - A `hasAcceptedTerms` computed that returns `true` only when BOTH `user.value?.accepted_age_confirmation === true` AND `user.value?.accepted_terms === true`. If user is null/undefined (not logged in), return `true` (lightbox should only show for logged-in users).
   - An `acceptTerms` async function that:
     a. Gets the user store via `useUserStore()` from `@/stores/user.store`
     b. Calls `userStore.updateUserProfile(String(user.value!.id), { accepted_age_confirmation: true, accepted_terms: true })`
     c. After successful update, calls `fetchUser()` from `useStrapiAuth()` to refresh the user object in state
     d. Returns void (caller handles UI state)
   - Export both `hasAcceptedTerms` and `acceptTerms` from the composable return object
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx nuxi typecheck apps/website 2>&1 | tail -20</automated>
  </verify>
  <done>User type includes consent booleans; useUser exposes hasAcceptedTerms computed and acceptTerms async function</done>
</task>

<task type="auto">
  <name>Task 2: Create LightboxTerms component, add SCSS, wire into all layouts</name>
  <files>apps/website/app/components/LightboxTerms.vue, apps/website/app/scss/components/_lightbox.scss, apps/website/app/layouts/default.vue, apps/website/app/layouts/account.vue, apps/website/app/layouts/about.vue, apps/website/app/layouts/auth.vue</files>
  <action>
1. Create `apps/website/app/components/LightboxTerms.vue` following the LightboxRazon modal pattern (backdrop + centered box):
   - Template: `div.lightbox.lightbox--terms` with `:class="{ 'is-open': isOpen }"`. Contains:
     - `div.lightbox--terms__backdrop` (NO click-to-close — this is mandatory, user cannot dismiss)
     - `div.lightbox--terms__box` with `role="dialog"` and `aria-modal="true"`. Contains:
       - NO close button (mandatory acceptance required)
       - `div.lightbox--terms__title` — text: "Confirmacion de edad y terminos"
       - `div.lightbox--terms__text` — text explaining they must confirm being over 18 and accept terms/privacy policy, with a NuxtLink to `/politicas-de-privacidad` opening in `target="_blank"`
       - Two checkboxes (using standard HTML input[type=checkbox] + label, not vee-validate):
         - `input#terms-age-confirmation` v-model `ageConfirmed` — label: "Confirmo que soy mayor de edad"
         - `input#terms-accepted` v-model `termsAccepted` — label: "Acepto los terminos y las politicas de privacidad" (with NuxtLink to `/politicas-de-privacidad` in the label)
       - `div.lightbox--terms__actions` with a single `button.btn.btn--primary.btn--block` "Aceptar" that is `:disabled` unless BOTH checkboxes are checked AND not loading
   - Script setup:
     - Import `ref`, `computed`, `onMounted` from vue
     - Use `useUser()` to get `hasAcceptedTerms` and `acceptTerms`
     - Local refs: `isOpen = ref(false)`, `ageConfirmed = ref(false)`, `termsAccepted = ref(false)`, `loading = ref(false)`
     - `canSubmit` computed: `ageConfirmed.value && termsAccepted.value && !loading.value`
     - `onMounted`: check `if (!hasAcceptedTerms.value) { isOpen.value = true; }` — client-only check since user state is hydrated
     - Also `watch` on `hasAcceptedTerms` — if it becomes true (e.g., user logs in after mount), close the lightbox
     - `handleAccept` async function: set `loading = true`, call `await acceptTerms()`, set `isOpen = false`, set `loading = false` in finally block

2. Add `&--terms` modifier to `apps/website/app/scss/components/_lightbox.scss`, following the `&--razon` modal pattern exactly:
   - Fixed fullscreen overlay with opacity/visibility transitions
   - `&.is-open` shows with opacity 1 and visibility visible
   - `&__backdrop` — same as razon (rgba(0,0,0,0.4), backdrop-filter blur(2px), z-index 1)
   - `&__box` — centered white box, max-width 520px, padding 40px 30px 30px, border-radius 4px, box-shadow, z-index 2, flex column with gap 20px
   - `&__title` — font-weight 600, font-size 16px, color $charcoal
   - `&__text` — font-size 14px, color $charcoal, with `a` styled as `color: $dodger_blue; text-decoration: underline`
   - `&__checkboxes` — flex column with gap 12px, each checkbox row is flex row with gap 8px, align-items center. Labels font-size 14px, color $charcoal. Checkbox inputs styled minimally.
   - `&__actions` — flex justify-content flex-end

3. Wire LightboxTerms into all four layouts. In each layout file:
   - Add `import LightboxTerms from "@/components/LightboxTerms.vue";` to the script
   - Add `<LightboxTerms />` in the template alongside the other lightbox components
   - Layouts to update: default.vue, account.vue, about.vue, auth.vue
   - Do NOT add to onboarding.vue (it has no lightboxes and is a minimal layout)
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx nuxi typecheck apps/website 2>&1 | tail -20</automated>
  </verify>
  <done>LightboxTerms component renders a blocking modal for users missing consent; SCSS matches project lightbox patterns; all four layouts include the component</done>
</task>

</tasks>

<verification>
1. `cd apps/website && npx nuxi typecheck` passes with no errors related to LightboxTerms or User type
2. Visual check: Log in as a user without accepted_age_confirmation/accepted_terms set — lightbox appears, cannot be dismissed, checking both boxes + clicking Aceptar saves and closes
3. Visual check: Log in as a user with both fields already true — no lightbox appears
</verification>

<success_criteria>
- LightboxTerms.vue exists with BEM classes `lightbox lightbox--terms`
- useUser composable exports `hasAcceptedTerms` and `acceptTerms`
- User type includes `accepted_age_confirmation` and `accepted_terms` booleans
- SCSS `_lightbox.scss` has `&--terms` modifier with modal pattern
- All four layouts (default, account, about, auth) include `<LightboxTerms />`
- TypeScript typecheck passes
</success_criteria>

<output>
After completion, create `.planning/quick/260329-mva-lightboxterms-global-component-with-user/260329-mva-SUMMARY.md`
</output>

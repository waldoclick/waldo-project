---
phase: 260411-tcf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/components/OnboardingThankyou.vue
autonomous: true
requirements:
  - TCF-01
must_haves:
  truths:
    - "After logging in with an incomplete profile, the user is redirected to /onboarding (already working)"
    - "After submitting the onboarding profile, the user lands on /onboarding/thankyou (already working)"
    - "On /onboarding/thankyou the user sees two CTAs: 'Crear mi primer anuncio' and 'Ir al inicio'"
    - "'Crear mi primer anuncio' navigates to /anunciar"
    - "'Ir al inicio' navigates to / (the home), regardless of any stored referer"
  artifacts:
    - path: "apps/website/app/components/OnboardingThankyou.vue"
      provides: "Thankyou screen with two deterministic CTAs (create ad + home)"
      contains: 'to="/"'
  key_links:
    - from: "apps/website/app/components/OnboardingThankyou.vue"
      to: "/"
      via: "NuxtLink to='/'"
      pattern: 'NuxtLink\\s+to="/"'
    - from: "apps/website/app/components/OnboardingThankyou.vue"
      to: "/anunciar"
      via: "NuxtLink to='/anunciar'"
      pattern: 'NuxtLink\\s+to="/anunciar"'
---

<objective>
Ensure the post-login onboarding flow ends with a thankyou screen that lets the user explicitly choose between going to the home page or creating their first ad.

Purpose: The user requested that after an incomplete-profile login, the flow be: login → onboarding → gracias → choose home or create first ad. The login → onboarding → gracias path is already in place (FormVerifyCode redirects to /onboarding on incomplete profile; onboarding/index.vue navigates to /onboarding/thankyou on submit). The only gap is the second CTA on the thankyou page: today it reads "Volver a Waldo" and points to an arbitrary stored `referer` (or `/` as fallback), which is non-deterministic and does not match the requested "ir al home" choice.

Output: OnboardingThankyou.vue with two deterministic NuxtLink CTAs: "Crear mi primer anuncio" → `/anunciar`, and "Ir al inicio" → `/`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@CLAUDE.md
@apps/website/app/components/OnboardingThankyou.vue
@apps/website/app/pages/onboarding/thankyou.vue
@apps/website/app/pages/onboarding/index.vue
@apps/website/app/components/FormVerifyCode.vue
@apps/website/app/middleware/onboarding-guard.global.ts

<interfaces>
Current OnboardingThankyou.vue (apps/website/app/components/OnboardingThankyou.vue):

```vue
<template>
  <div class="onboarding onboarding--thankyou">
    <div class="onboarding--thankyou__content">
      <h1 class="onboarding--thankyou__title title">
        Muchas gracias por registrarte
      </h1>
      <p class="onboarding--thankyou__text paragraph">
        Tu perfil esta completo. Ya puedes publicar tu primer anuncio en
        Waldo.click&reg; y comenzar a conectar con compradores y vendedores.
      </p>
      <div class="onboarding--thankyou__actions">
        <NuxtLink to="/anunciar" class="btn btn--primary btn--block"
          >Crear mi primer anuncio</NuxtLink
        >
        <NuxtLink :to="returnUrl" class="btn btn--secondary btn--block"
          >Volver a Waldo</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const appStore = useAppStore();
const returnUrl = computed(() => appStore.getReferer || "/");
</script>
```

Flow context (already correct, do NOT modify):
- FormVerifyCode.vue line 160-164: on successful OTP, if `meStore.isProfileComplete()` is false → `router.push("/onboarding")`.
- pages/onboarding/index.vue: submits FormProfile in onboardingMode, on success → `navigateTo("/onboarding/thankyou")`.
- middleware/onboarding-guard.global.ts: lets incomplete users into /onboarding* and blocks complete users from /onboarding* (GUARD-02).

BEM note (CLAUDE.md): block is `onboarding`, modifier is `--thankyou`, elements are scoped under `onboarding--thankyou__*`. Do not introduce standalone compound class names.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace "Volver a Waldo" CTA with deterministic "Ir al inicio" link to /</name>
  <files>apps/website/app/components/OnboardingThankyou.vue</files>
  <action>
Edit apps/website/app/components/OnboardingThankyou.vue to make the second CTA deterministic and point to the home page, per the user requirement "puede elegir ir al home o a crear su primer anuncio".

Concrete changes (ONLY this file):

1. In the `<template>`, replace:
   ```
   <NuxtLink :to="returnUrl" class="btn btn--secondary btn--block"
     >Volver a Waldo</NuxtLink
   >
   ```
   with:
   ```
   <NuxtLink to="/" class="btn btn--secondary btn--block"
     >Ir al inicio</NuxtLink
   >
   ```
   Keep the existing first CTA (`<NuxtLink to="/anunciar" ...>Crear mi primer anuncio</NuxtLink>`) exactly as-is.

2. In the `<script setup lang="ts">` block, remove the now-unused code:
   - Delete `import { computed } from "vue";`
   - Delete `const appStore = useAppStore();`
   - Delete `const returnUrl = computed(() => appStore.getReferer || "/");`

   The script block will become empty (aside from `<script setup lang="ts">` tags) because the template no longer needs any reactive state. Leave the empty `<script setup lang="ts">` block in place (it is valid SFC) OR remove the script block entirely if lint prefers — verify by running typecheck/eslint after the change. Preferred: remove the empty script block entirely to avoid a dangling no-op, since nothing else in this component needs TS.

3. Do NOT touch appStore.getReferer logic elsewhere — the referer is still used by login flow (FormVerifyCode post-OTP redirect) for the normal (complete-profile) case. This change is scoped to the onboarding thankyou screen only.

4. Do NOT change SCSS, BEM classes, or page wrapper (apps/website/app/pages/onboarding/thankyou.vue). The BEM hierarchy `.onboarding--thankyou__actions` > `.btn.btn--primary.btn--block` + `.btn.btn--secondary.btn--block` is preserved.

5. Do NOT add any Spanish tilde/accent changes beyond the new label "Ir al inicio". Keep existing copy ("Muchas gracias por registrarte", "Tu perfil esta completo...") untouched — it is user-visible content.

Rationale recorded in the commit message: the user's spec is "elegir ir al home o a crear su primer anuncio" — the destination must be the literal home (`/`), not an arbitrary stored referer which could be `/anuncios`, `/pro`, `/pagar/gracias`, etc., depending on session history.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | tail -20</automated>
  </verify>
  <done>
    - apps/website/app/components/OnboardingThankyou.vue template contains `<NuxtLink to="/" class="btn btn--secondary btn--block">Ir al inicio</NuxtLink>`
    - The component no longer imports `computed` or uses `useAppStore()` / `returnUrl`
    - The component still contains `<NuxtLink to="/anunciar" class="btn btn--primary btn--block">Crear mi primer anuncio</NuxtLink>`
    - `yarn nuxt typecheck` in apps/website passes (no new errors introduced by this change)
    - No other files modified
  </done>
</task>

</tasks>

<verification>
End-to-end manual smoke check (optional, for the user after Claude finishes):
1. Log in as a user whose profile is incomplete (missing required fields for `meStore.isProfileComplete()`).
2. Complete OTP → should land on /onboarding.
3. Fill and submit FormProfile → should land on /onboarding/thankyou.
4. Confirm two buttons are visible: "Crear mi primer anuncio" (primary) and "Ir al inicio" (secondary).
5. Clicking "Ir al inicio" navigates to `/` regardless of any prior referer.
6. Clicking "Crear mi primer anuncio" navigates to `/anunciar`.

Automated: `yarn nuxt typecheck` in apps/website passes.
</verification>

<success_criteria>
- OnboardingThankyou.vue offers a deterministic choice between "Ir al inicio" (/) and "Crear mi primer anuncio" (/anunciar).
- No regression: login → onboarding → thankyou flow still works (already in place, not modified).
- No unused imports or variables left behind (CLAUDE.md: "Never leave unused variables or imports").
- `yarn nuxt typecheck` clean in apps/website.
</success_criteria>

<output>
After completion, create `.planning/quick/260411-tcf-cuando-un-usuario-inicia-sesion-y-el-per/260411-tcf-SUMMARY.md` describing the change and the commit hash.
</output>

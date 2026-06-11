---
phase: quick
plan: 260611-pyz
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/dashboard/account/profile.vue
  - apps/website/app/pages/dashboard/maintenance/packs/new.vue
  - apps/website/app/components/FormLoginDashboard.vue
  - apps/website/app/components/FormForgotPasswordDashboard.vue
  - apps/website/app/components/FormResetPasswordDashboard.vue
  - apps/website/app/components/FormVerifyCodeDashboard.vue
  - apps/website/app/components/IntroduceAuthDashboard.vue
  - apps/website/app/components/LightboxAdblockDashboard.vue
  - apps/website/app/components/LightboxCookiesDashboard.vue
  - apps/website/app/components/AvatarDashboard.vue
  - apps/website/app/components/LoadingDashboard.vue
  - apps/website/app/components/FormDevDashboard.vue
  - apps/website/app/components/LogoWhiteDashboard.vue
  - apps/website/app/components/PictureDashboard.vue
  - apps/website/app/components/AccountPacks.vue
  - apps/website/app/components/AdArchiveProfile.vue
  - apps/website/app/components/BarResume.vue
  - apps/website/app/components/MapDefault.vue
  - apps/website/app/components/ResumeAd.vue
  - apps/website/app/components/SellerContact.vue
  - apps/website/app/components/ThanksDefault.vue
autonomous: true
requirements: [QUICK-260611-pyz]

must_haves:
  truths:
    - "No unused explicit import statements reference deleted components"
    - "All 19 orphaned component files are removed from the repository"
    - "TypeScript build completes without errors after deletions"
  artifacts:
    - path: "apps/website/app/pages/dashboard/account/profile.vue"
      provides: "Profile page without stale FormPassword import"
    - path: "apps/website/app/pages/dashboard/maintenance/packs/new.vue"
      provides: "New pack page without stale FormPack import"
  key_links:
    - from: "apps/website/app/pages/dashboard/account/profile.vue"
      to: "FormPassword component"
      via: "Nuxt auto-import (no explicit import needed)"
      pattern: "FormPassword"
---

<objective>
Remove orphaned components left over from the dashboard-into-website migration and clean up the two stale explicit import lines that reference components now handled by Nuxt auto-import.

Purpose: These files and imports are dead code from the dashboard migration (Phase 125). Leaving them causes confusion, inflates the component surface, and may trigger Codacy unused-code warnings.
Output: 19 component files deleted, 2 import lines removed, TypeScript build clean.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove stale explicit imports from two pages</name>
  <files>
    apps/website/app/pages/dashboard/account/profile.vue
    apps/website/app/pages/dashboard/maintenance/packs/new.vue
  </files>
  <action>
    Delete the explicit import lines only — the components themselves are handled by Nuxt auto-import and must not be removed from their pages:

    1. In `apps/website/app/pages/dashboard/account/profile.vue` line 19:
       Delete the line: `import FormPassword from "@/components/FormPassword.vue";`
       Do NOT remove FormPassword usage from the template — only the import statement goes.

    2. In `apps/website/app/pages/dashboard/maintenance/packs/new.vue` line 15:
       Delete the line: `import FormPack from "@/components/FormPack.vue";`
       Do NOT remove FormPack usage from the template — only the import statement goes.

    Note: FormPassword.vue and FormPack.vue are ACTIVE components — do not delete them.
    Note: PacksDashboard.vue, FormPackDashboard.vue, FormPasswordDashboard.vue are also ACTIVE — do not touch them.
  </action>
  <verify>
    <automated>grep -n "import FormPassword\|import FormPack" /home/gab/Code/waldo-project/apps/website/app/pages/dashboard/account/profile.vue /home/gab/Code/waldo-project/apps/website/app/pages/dashboard/maintenance/packs/new.vue && echo "STILL PRESENT - FAIL" || echo "Imports removed - PASS"</automated>
  </verify>
  <done>Neither file contains an explicit import for FormPassword or FormPack. Both pages still render correctly via Nuxt auto-import.</done>
</task>

<task type="auto">
  <name>Task 2: Delete orphaned Dashboard auth variant and legacy components</name>
  <files>
    apps/website/app/components/FormLoginDashboard.vue
    apps/website/app/components/FormForgotPasswordDashboard.vue
    apps/website/app/components/FormResetPasswordDashboard.vue
    apps/website/app/components/FormVerifyCodeDashboard.vue
    apps/website/app/components/IntroduceAuthDashboard.vue
    apps/website/app/components/LightboxAdblockDashboard.vue
    apps/website/app/components/LightboxCookiesDashboard.vue
    apps/website/app/components/AvatarDashboard.vue
    apps/website/app/components/LoadingDashboard.vue
    apps/website/app/components/FormDevDashboard.vue
    apps/website/app/components/LogoWhiteDashboard.vue
    apps/website/app/components/PictureDashboard.vue
    apps/website/app/components/AccountPacks.vue
    apps/website/app/components/AdArchiveProfile.vue
    apps/website/app/components/BarResume.vue
    apps/website/app/components/MapDefault.vue
    apps/website/app/components/ResumeAd.vue
    apps/website/app/components/SellerContact.vue
    apps/website/app/components/ThanksDefault.vue
  </files>
  <action>
    Delete all 19 component files using `git rm` to preserve Git history:

    ```
    git -C /home/gab/Code/waldo-project rm \
      apps/website/app/components/FormLoginDashboard.vue \
      apps/website/app/components/FormForgotPasswordDashboard.vue \
      apps/website/app/components/FormResetPasswordDashboard.vue \
      apps/website/app/components/FormVerifyCodeDashboard.vue \
      apps/website/app/components/IntroduceAuthDashboard.vue \
      apps/website/app/components/LightboxAdblockDashboard.vue \
      apps/website/app/components/LightboxCookiesDashboard.vue \
      apps/website/app/components/AvatarDashboard.vue \
      apps/website/app/components/LoadingDashboard.vue \
      apps/website/app/components/FormDevDashboard.vue \
      apps/website/app/components/LogoWhiteDashboard.vue \
      apps/website/app/components/PictureDashboard.vue \
      apps/website/app/components/AccountPacks.vue \
      apps/website/app/components/AdArchiveProfile.vue \
      apps/website/app/components/BarResume.vue \
      apps/website/app/components/MapDefault.vue \
      apps/website/app/components/ResumeAd.vue \
      apps/website/app/components/SellerContact.vue \
      apps/website/app/components/ThanksDefault.vue
    ```

    Do NOT delete:
    - PacksDashboard.vue (active)
    - FormPackDashboard.vue (active)
    - FormPasswordDashboard.vue (active)
    - FormPassword.vue (active, referenced from profile.vue template)
    - FormPack.vue (active, referenced from packs/new.vue template)
  </action>
  <verify>
    <automated>ls /home/gab/Code/waldo-project/apps/website/app/components/FormLoginDashboard.vue /home/gab/Code/waldo-project/apps/website/app/components/AccountPacks.vue /home/gab/Code/waldo-project/apps/website/app/components/ThanksDefault.vue 2>&1 | grep -c "No such file" | grep -q "^3$" && echo "All deleted - PASS" || echo "Some files still exist - FAIL"</automated>
  </verify>
  <done>All 19 component files are removed from the working tree and staged for deletion in git.</done>
</task>

<task type="auto">
  <name>Task 3: Verify TypeScript build passes after deletions</name>
  <files></files>
  <action>
    Run vue-tsc type check (not nuxi typecheck — pre-existing ESM constraint documented in STATE.md):

    ```
    cd /home/gab/Code/waldo-project/apps/website && node ../../node_modules/.bin/vue-tsc --noEmit
    ```

    If it exits 0, the deletions are clean. If it reports errors referencing any of the deleted component filenames, investigate — the grep verification confirmed zero references but a stale auto-import cache could surface false positives.

    Do NOT re-add deleted files to fix TypeScript errors. Fix any errors in the files that reference them.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/website && node ../../node_modules/.bin/vue-tsc --noEmit; echo "Exit: $?"</automated>
  </verify>
  <done>vue-tsc exits 0 with no errors referencing deleted component files.</done>
</task>

</tasks>

<verification>
After all tasks complete:
1. `grep -r "FormLoginDashboard\|FormForgotPasswordDashboard\|FormResetPasswordDashboard\|FormVerifyCodeDashboard\|IntroduceAuthDashboard\|LightboxAdblockDashboard\|LightboxCookiesDashboard\|AvatarDashboard\|LoadingDashboard\|FormDevDashboard\|LogoWhiteDashboard\|PictureDashboard\|AccountPacks\|AdArchiveProfile\|BarResume\|MapDefault\|ResumeAd\|SellerContact\|ThanksDefault" apps/website/app/` returns no results
2. `grep -n "import FormPassword\|import FormPack" apps/website/app/pages/dashboard/account/profile.vue apps/website/app/pages/dashboard/maintenance/packs/new.vue` returns no results
3. vue-tsc exits 0
</verification>

<success_criteria>
- 19 orphaned component files deleted via git rm
- 2 stale import lines removed from page files
- vue-tsc --noEmit exits 0
- git status shows 21 deletions/modifications staged cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/260611-pyz-delete-orphaned-unused-components-and-fi/260611-pyz-SUMMARY.md`
</output>

---
phase: 16-implement-zoho-salesiq-chat-widget-plugi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/nuxt.config.ts
  - apps/website/app/plugins/zoho.client.ts
  - apps/website/app/types/window.d.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "Zoho SalesIQ chat widget loads when ZOHO_CHAT=true and ZOHO_WIDGET_CODE is set"
    - "No CSP violations in browser console for Zoho script/connect domains"
    - "Plugin returns early (no DOM injection) when ZOHO_CHAT=false"
  artifacts:
    - path: "apps/website/app/plugins/zoho.client.ts"
      provides: "Zoho SalesIQ script injection via defineNuxtPlugin"
    - path: "apps/website/nuxt.config.ts"
      provides: "zohoChat and zohoWidgetCode in runtimeConfig.public; Zoho domains in CSP"
    - path: "apps/website/app/types/window.d.ts"
      provides: "Window.$zoho type declaration"
  key_links:
    - from: "apps/website/app/plugins/zoho.client.ts"
      to: "apps/website/nuxt.config.ts"
      via: "useRuntimeConfig().public.zohoChat / zohoWidgetCode"
      pattern: "config\\.public\\.zoho"
---

<objective>
Wire the Zoho SalesIQ chat widget end-to-end: expose env vars via runtimeConfig, inject the script in a client plugin, and whitelist Zoho domains in the CSP.

Purpose: The chat widget silently fails because runtimeConfig keys are missing, no plugin exists, and CSP blocks Zoho origins.
Output: `zoho.client.ts` plugin, updated `nuxt.config.ts` (runtimeConfig + CSP), updated `window.d.ts`
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/nuxt.config.ts
@apps/website/app/plugins/logrocket.client.js
@apps/website/app/types/window.d.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add zohoChat and zohoWidgetCode to runtimeConfig and CSP</name>
  <files>apps/website/nuxt.config.ts</files>
  <action>
    Two changes in nuxt.config.ts:

    **A. runtimeConfig.public (lines ~307-328):** Add two keys after `devMode`:
    ```ts
    zohoChat: process.env.ZOHO_CHAT === "true",
    zohoWidgetCode: process.env.ZOHO_WIDGET_CODE || "",
    ```

    **B. CSP (only applied when NODE_ENV !== "local"):**
    - In `script-src` array (after the last sentry entry): add `"https://salesiq.zohopublic.com"` and `"https://salesiq.zoho.com"`
    - In `connect-src` array (after the last sentry entry): add `"https://salesiq.zohopublic.com"`, `"https://salesiq.zoho.com"`, `"wss://salesiq.zohopublic.com"`, `"wss://salesiq.zoho.com"`

    Do not touch any other CSP directives or runtimeConfig keys.
  </action>
  <verify>
    <automated>yarn --cwd apps/website nuxt typecheck 2>&1 | grep -E "error TS|zoho" || echo "OK"</automated>
  </verify>
  <done>runtimeConfig.public contains zohoChat (boolean) and zohoWidgetCode (string); CSP script-src and connect-src list all four Zoho origins</done>
</task>

<task type="auto">
  <name>Task 2: Create zoho.client.ts plugin and type Window.$zoho</name>
  <files>apps/website/app/plugins/zoho.client.ts, apps/website/app/types/window.d.ts</files>
  <action>
    **A. Create `apps/website/app/plugins/zoho.client.ts`:**
    ```ts
    export default defineNuxtPlugin(() => {
      const config = useRuntimeConfig();

      if (!config.public.zohoChat || !config.public.zohoWidgetCode) {
        return;
      }

      const widgetCode = config.public.zohoWidgetCode as string;

      window.$zoho = window.$zoho || {};
      window.$zoho.salesiq = window.$zoho.salesiq || {
        widgetcode: widgetCode,
        values: {},
        ready: function () {},
      };

      const d = document;
      const s = d.createElement("script");
      s.type = "text/javascript";
      s.id = "zsiqscript";
      s.defer = true;
      s.src = "https://salesiq.zohopublic.com/widget";
      const t = d.getElementsByTagName("script")[0];
      t.parentNode!.insertBefore(s, t);
    });
    ```

    **B. Extend `apps/website/app/types/window.d.ts`:** Add `$zoho` to the existing `Window` interface inside `declare global`:
    ```ts
    $zoho?: {
      salesiq?: {
        widgetcode: string;
        values: Record<string, unknown>;
        ready: () => void;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    ```
    Add this after the existing `handleCredentialResponse` property (before the closing `}`). Do not alter any other declarations.
  </action>
  <verify>
    <automated>yarn --cwd apps/website nuxt typecheck 2>&1 | grep -c "error TS" | xargs -I{} sh -c '[ "{}" = "0" ] && echo "PASS: 0 TS errors" || echo "FAIL: {} TS errors"'</automated>
  </verify>
  <done>Plugin file exists, reads config flags, injects Zoho script only when enabled. window.$zoho typed globally. No TypeScript errors.</done>
</task>

</tasks>

<verification>
- `yarn --cwd apps/website nuxt typecheck` exits 0
- `apps/website/app/plugins/zoho.client.ts` exists with `defineNuxtPlugin`
- `nuxt.config.ts` runtimeConfig.public contains `zohoChat` and `zohoWidgetCode`
- CSP `script-src` and `connect-src` include all four `salesiq.zoho*` entries
- `window.d.ts` declares `$zoho` on `Window`
</verification>

<success_criteria>
- TypeScript typecheck passes with 0 errors
- With ZOHO_CHAT=true + valid ZOHO_WIDGET_CODE: `<script id="zsiqscript">` is injected into the DOM on page load
- With ZOHO_CHAT=false: no Zoho script injected (early return in plugin)
- No CSP violations in browser console for Zoho domains
</success_criteria>

<output>
After completion, create `.planning/quick/16-implement-zoho-salesiq-chat-widget-plugi/16-SUMMARY.md`
</output>

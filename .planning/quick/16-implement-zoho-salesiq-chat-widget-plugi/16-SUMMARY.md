---
phase: 16-implement-zoho-salesiq-chat-widget-plugi
plan: "01"
subsystem: website/plugins
tags: [zoho, salesiq, chat-widget, csp, nuxt-plugin]
dependency_graph:
  requires: []
  provides: [zoho-salesiq-chat-widget]
  affects: [apps/website/nuxt.config.ts, apps/website/app/plugins/zoho.client.ts, apps/website/app/types/window.d.ts]
tech_stack:
  added: []
  patterns: [defineNuxtPlugin, runtimeConfig.public, nuxt-security CSP]
key_files:
  created:
    - apps/website/app/plugins/zoho.client.ts
  modified:
    - apps/website/nuxt.config.ts
    - apps/website/app/types/window.d.ts
decisions:
  - "Fallback to document.head.appendChild when no existing script tag found (guards HTMLScriptElement | undefined)"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-11"
  tasks_completed: 2
  files_changed: 3
---

# Quick Task 16: Implement Zoho SalesIQ Chat Widget Plugin — Summary

**One-liner:** Zoho SalesIQ chat widget wired end-to-end via runtimeConfig flags, client plugin with early-return guard, and four CSP origins (https + wss).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add zohoChat/zohoWidgetCode to runtimeConfig and CSP | cc651a3 | apps/website/nuxt.config.ts |
| 2 | Create zoho.client.ts plugin and type Window.$zoho | 36b6e58 | apps/website/app/plugins/zoho.client.ts, apps/website/app/types/window.d.ts |

## What Was Built

### Task 1 — nuxt.config.ts

Added to `runtimeConfig.public`:
```ts
zohoChat: process.env.ZOHO_CHAT === "true",
zohoWidgetCode: process.env.ZOHO_WIDGET_CODE || "",
```

Added to CSP `script-src`:
- `https://salesiq.zohopublic.com`
- `https://salesiq.zoho.com`

Added to CSP `connect-src`:
- `https://salesiq.zohopublic.com`
- `https://salesiq.zoho.com`
- `wss://salesiq.zohopublic.com`
- `wss://salesiq.zoho.com`

### Task 2 — zoho.client.ts + window.d.ts

Plugin reads `config.public.zohoChat` and `config.public.zohoWidgetCode`. Returns early (no DOM injection) when either is falsy. When enabled, initializes `window.$zoho.salesiq` and injects `<script id="zsiqscript" defer src="https://salesiq.zohopublic.com/widget">`. Falls back to `document.head.appendChild` if no existing `<script>` tag found in DOM.

`window.d.ts` extended with optional `$zoho` property on `Window`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Guarded HTMLScriptElement | undefined and t.parentNode**
- **Found during:** Task 2 (LSP errors on write)
- **Issue:** `getElementsByTagName("script")[0]` returns `HTMLScriptElement | undefined` in strict TS; `t.parentNode` also possibly null
- **Fix:** Cast to `HTMLScriptElement | undefined`, added `if (t?.parentNode)` guard with `document.head.appendChild(s)` fallback
- **Files modified:** apps/website/app/plugins/zoho.client.ts
- **Commit:** 36b6e58

## Verification

- ✅ `yarn --cwd apps/website nuxt typecheck` exits 0 (0 TS errors)
- ✅ `apps/website/app/plugins/zoho.client.ts` exists with `defineNuxtPlugin`
- ✅ `nuxt.config.ts` runtimeConfig.public contains `zohoChat` and `zohoWidgetCode`
- ✅ CSP `script-src` includes `salesiq.zohopublic.com` and `salesiq.zoho.com`
- ✅ CSP `connect-src` includes all four Zoho origins (https + wss)
- ✅ `window.d.ts` declares `$zoho` on `Window`

## Self-Check: PASSED

- `apps/website/app/plugins/zoho.client.ts` — FOUND
- `apps/website/nuxt.config.ts` — FOUND (zohoChat, zohoWidgetCode, CSP entries)
- `apps/website/app/types/window.d.ts` — FOUND ($zoho declaration)
- Commit cc651a3 — FOUND
- Commit 36b6e58 — FOUND

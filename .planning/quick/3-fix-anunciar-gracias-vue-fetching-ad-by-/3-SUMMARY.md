# Quick Task 3 Summary: Fix anunciar/gracias.vue fetching ad by documentId

**Date:** 2026-03-11
**Commit:** 8147801

## What was done

Fixed `apps/website/app/pages/anunciar/gracias.vue` — `useStrapi()` was being called inside the `useAsyncData` async callback, which is invalid in Nuxt's composable lifecycle. This caused the Strapi client to fail silently on SSR, returning a 404 error instead of fetching the ad data.

**Root cause:** Vue/Nuxt composables like `useStrapi()` must be called synchronously at the top level of `<script setup>`. Calling them inside async callbacks (like the `useAsyncData` handler) breaks the composable context.

**Fix:** Moved `const strapi = useStrapi()` to the top level of `<script setup>`, before `useAsyncData`. The captured instance is then used inside the callback.

## Files changed

- `apps/website/app/pages/anunciar/gracias.vue` — moved `useStrapi()` call to top level

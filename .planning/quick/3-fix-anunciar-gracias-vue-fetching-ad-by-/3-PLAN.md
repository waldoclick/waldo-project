# Quick Task 3: Fix anunciar/gracias.vue fetching ad by documentId

## Problem

`useStrapi()` was called inside the `useAsyncData` async callback instead of at the top level of `<script setup>`. In Nuxt/Vue composables, `useStrapi()` must be called synchronously at setup time — calling it inside an async callback causes it to fail silently on SSR, resulting in a 404 error page.

## Fix

Move `const strapi = useStrapi()` to the top level of `<script setup>`, before `useAsyncData`, so the composable is properly initialized.

## File

- `apps/website/app/pages/anunciar/gracias.vue`

---
phase: quick-260412-lfh
plan: "01"
subsystem: website
tags: [copy, ux, images, validation]
dependency_graph:
  requires: []
  provides: [informed-image-upload-ux]
  affects: [FormCreateFive.vue]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - apps/website/app/components/FormCreateFive.vue
decisions:
  - Texto reescrito inline en el <p> existente — sin nuevos elementos HTML, clases CSS ni SCSS
metrics:
  duration: "2m"
  completed_date: "2026-04-12"
---

# Quick Task 260412-lfh: Mencionar medidas mínimas 750x420 en el paso 5

**One-liner:** Updated step 5 intro copy to include 750x420px minimum image size, matching UploadImages.vue validation.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Mencionar medidas mínimas 750x420 en el copy del paso 5 | 5fed8d34 | apps/website/app/components/FormCreateFive.vue |

## What Was Built

The introductory paragraph in `FormCreateFive.vue` (step 5 of the ad creation wizard) now reads:

> "Las imágenes son clave para destacar tu anuncio. Elige fotos claras y relevantes que muestren lo que ofreces, con un tamaño mínimo de 750x420 píxeles para que se vean bien en todas las pantallas."

This surfaces the minimum dimension requirement (`img.width >= 750 && img.height >= 420` in `UploadImages.vue`) to the user before they attempt to upload, preventing silent validation failures.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- [x] `apps/website/app/components/FormCreateFive.vue` exists and contains "750x420"
- [x] Commit `5fed8d34` exists in git log

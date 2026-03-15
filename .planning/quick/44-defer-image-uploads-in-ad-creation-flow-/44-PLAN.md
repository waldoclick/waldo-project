---
phase: quick-44
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/types/ad.d.ts
  - apps/website/app/composables/usePendingUploads.ts
  - apps/website/app/components/UploadImages.vue
  - apps/website/app/pages/anunciar/resumen.vue
autonomous: true
requirements: [QUICK-44]

must_haves:
  truths:
    - "Selecting images does NOT trigger any API call — files accumulate in memory only"
    - "Multiple images can be selected at once via multi-select file input"
    - "Gallery shows blob: URL previews for pending images alongside any already-uploaded ones"
    - "Removing a pending image clears it from memory only — no DELETE API call"
    - "confirmPay() in resumen.vue uploads all pending files first, then saves the draft with their IDs"
    - "If user abandons the flow, nothing is uploaded and nothing needs cleanup"
  artifacts:
    - path: "apps/website/app/composables/usePendingUploads.ts"
      provides: "Module-level singleton holding File[] and blob URL previews for pending images"
      exports: ["usePendingUploads"]
    - path: "apps/website/app/types/ad.d.ts"
      provides: "Updated GalleryItem with optional pending flag"
      contains: "pending?: boolean"
    - path: "apps/website/app/components/UploadImages.vue"
      provides: "Deferred upload UI — multi-select, blob previews, no API on add"
    - path: "apps/website/app/pages/anunciar/resumen.vue"
      provides: "Upload-then-save-draft in confirmPay()"
  key_links:
    - from: "UploadImages.vue"
      to: "usePendingUploads"
      via: "addPending(), removePending(), pendingItems computed"
    - from: "resumen.vue"
      to: "usePendingUploads + uploadFile()"
      via: "upload loop in confirmPay() before apiClient('ads/save-draft')"
    - from: "resumen.vue"
      to: "adStore.updateGallery()"
      via: "replaces pending gallery items with uploaded ones before save-draft"
---

<objective>
Defer image uploads in the ad creation flow so files are only uploaded to Strapi when the user confirms at the resumen step, eliminating orphaned files from abandoned flows.

Purpose: Files are expensive — uploading at confirmation instead of on-select means only committed ads generate storage objects. Zero cleanup needed on abandonment.
Output: A singleton composable `usePendingUploads` holds File + blob URL pairs in memory; `UploadImages.vue` uses it instead of calling `uploadFile()` directly; `resumen.vue` drains the pending queue before `save-draft`.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/44-defer-image-uploads-in-ad-creation-flow-/44-PLAN.md

<interfaces>
<!-- Key types and patterns the executor must follow -->

From apps/website/app/types/ad.d.ts:
```typescript
export interface GalleryItem extends Media {
  id: string;
  url: string;
  type?: string;
  // NEW: pending?: boolean — marks items not yet uploaded (local preview only)
}
```

From apps/website/app/composables/useImage.ts:
```typescript
// uploadFile(file: File, type: string): Promise<{ id, url, formats, ... }>
// Returns Strapi upload response[0] — has .id, .url, .formats.thumbnail.url
const { transformUrl, uploadFile } = useImageProxy();
```

From apps/website/app/stores/ad.store.ts:
```typescript
// adStore.ad.gallery: GalleryItem[]
// adStore.updateGallery(gallery: GalleryItem[])
// adStore.removeFromGallery(image: GalleryItem)
// persist: localStorage — File objects CANNOT be serialized; keep pending files OUTSIDE store
```

From apps/website/app/pages/anunciar/resumen.vue (confirmPay):
```typescript
// Both paid and free paths call:
const draftResponse = await apiClient<{ data: { id: number } }>(
  "ads/save-draft",
  { method: "POST", body: { data: { ad: adStore.ad } } }
);
// adStore.ad.gallery is what gets sent — must contain uploaded IDs by this point
```

From apps/website/app/components/UploadImages.vue:
```typescript
// Current: handleUpload() calls uploadFile() immediately on file select
// Target: push to usePendingUploads instead; show blob preview in gallery
// removeImage currently calls DELETE /api/ads/upload/:id — skip for pending items
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create usePendingUploads composable and update GalleryItem type</name>
  <files>
    apps/website/app/composables/usePendingUploads.ts
    apps/website/app/types/ad.d.ts
  </files>
  <action>
**Step 1 — Update `GalleryItem` in `apps/website/app/types/ad.d.ts`:**

Add `pending?: boolean` field:

```typescript
export interface GalleryItem extends Media {
  id: string;
  url: string;
  type?: string;
  pending?: boolean; // true = local blob preview only, not yet uploaded to Strapi
}
```

**Step 2 — Create `apps/website/app/composables/usePendingUploads.ts`:**

This is a module-level singleton (state defined outside the function). Holds `File` objects + blob URLs in memory only — NOT in Pinia, NOT persisted, NOT serializable.

```typescript
import { ref, computed } from "vue";

interface PendingItem {
  file: File;
  blobUrl: string; // blob: URL for preview — created with URL.createObjectURL(file)
}

// Module-level singleton: shared across all component instances in the same page
const pendingItems = ref<PendingItem[]>([]);

export function usePendingUploads() {
  /**
   * Add one or more File objects as pending items.
   * Creates blob: URL preview for each.
   */
  const addPending = (files: File | File[]) => {
    const fileArray = Array.isArray(files) ? files : [files];
    for (const file of fileArray) {
      pendingItems.value.push({
        file,
        blobUrl: URL.createObjectURL(file),
      });
    }
  };

  /**
   * Remove a pending item by its blob URL.
   * Revokes the object URL to free memory.
   */
  const removePending = (blobUrl: string) => {
    const idx = pendingItems.value.findIndex((p) => p.blobUrl === blobUrl);
    if (idx !== -1) {
      URL.revokeObjectURL(pendingItems.value[idx].blobUrl);
      pendingItems.value.splice(idx, 1);
    }
  };

  /**
   * Returns pending items as GalleryItem[] for display in the gallery grid.
   * Each item has pending: true so UploadImages.vue knows it's local only.
   */
  const pendingGalleryItems = computed<import("@/types/ad").GalleryItem[]>(() =>
    pendingItems.value.map((p) => ({
      id: p.blobUrl, // use blobUrl as temporary id for keying
      url: p.blobUrl,
      pending: true,
      formats: { thumbnail: { url: p.blobUrl } },
    }))
  );

  /**
   * Returns count of pending items.
   */
  const pendingCount = computed(() => pendingItems.value.length);

  /**
   * Clears all pending items and revokes their blob URLs.
   * Call after successful upload or on flow abandonment (optional cleanup).
   */
  const clearAll = () => {
    for (const item of pendingItems.value) {
      URL.revokeObjectURL(item.blobUrl);
    }
    pendingItems.value = [];
  };

  /**
   * Returns the raw File[] for upload. Used by resumen.vue.
   */
  const getPendingFiles = () =>
    pendingItems.value.map((p) => ({ file: p.file, blobUrl: p.blobUrl }));

  return {
    pendingGalleryItems,
    pendingCount,
    addPending,
    removePending,
    clearAll,
    getPendingFiles,
  };
}
```
  </action>
  <verify>TypeScript: `cd apps/website && npx nuxi typecheck 2>&1 | grep -E "error|usePendingUploads|GalleryItem" | head -20`</verify>
  <done>Composable exported with correct types; GalleryItem has `pending?: boolean`; no TypeScript errors in these two files</done>
</task>

<task type="auto">
  <name>Task 2: Refactor UploadImages.vue to defer uploads via usePendingUploads</name>
  <files>apps/website/app/components/UploadImages.vue</files>
  <action>
Rewrite `UploadImages.vue` to:
1. Enable `multiple` on the file input so users can select multiple images at once
2. On file select: validate each file (type + dimensions), then call `addPending()` — NO upload
3. Show pending items (blob preview) merged with uploaded items in the gallery grid
4. On remove: if `image.pending === true` → call `removePending(image.url)` (no API). If not pending → call DELETE API as before (for editing published ads)
5. Remove `handleUpload()`, `handlePushImage()` — no upload logic here anymore
6. Remove `useApiClient` import (it's no longer used in this component after the refactor — the DELETE for pending doesn't need it; the DELETE for uploaded images still needs it)
7. Keep `isProcessing` only for the DELETE API call path on already-uploaded images

Key implementation notes:
- `images` computed must merge `adStore.ad.gallery` (uploaded) + `pendingGalleryItems` (pending) in display order
- `calculateMax` must account for BOTH uploaded and pending counts
- Multi-file validation: iterate `event.target.files`, validate each, collect valid ones, then `addPending(validFiles)` in one call
- Dimension check uses `Promise.all` for parallel image dimension validation
- The `fileInput.value.value = ""` reset after selection stays (allows re-selecting same files)
- The Swal confirmation dialog stays for both pending and uploaded removals (UX consistency)
- Keep the `useApiClient` import and `removeImage` API call for non-pending images (DELETE /api/ads/upload/:id)
- `isProcessing` lock applies only when a DELETE API call is in-flight (not during local add/remove)

```vue
<template>
  <div class="upload upload--images">
    <div
      :class="{
        'upload--images__grid--is-free': isFree,
        'upload--images__grid--disabled': isProcessing,
      }"
      class="upload--images__grid"
    >
      <!-- All images: uploaded (from store) + pending (blob previews) -->
      <div
        v-for="(image, index) in allImages"
        :key="`${image.id}-${index}`"
        :class="{ 'is-active': true }"
        class="upload--images__input"
      >
        <img
          class="upload--images__input__image"
          :src="image.url || ''"
          alt="Imagen"
        />
        <button
          class="upload--images__input__button"
          type="button"
          @click.stop="handleRemoveImage(image)"
        >
          <IconX :stroke="2" :size="16" />
        </button>
      </div>

      <!-- Empty slots -->
      <div
        v-for="index in calculateMax"
        :key="`upload-image-${index}`"
        class="upload--images__input"
        @click="handleFileOpen"
      >
        <IconPlusCircle class="upload--images__input__icon" :size="24" />
      </div>
    </div>

    <div class="upload--images__information">
      <IconInfo :size="24" />
      <p v-if="!isFree">
        Buenas fotos es clave para hacer destacar tu producto y tener una
        publicación de calidad.
      </p>
      <p v-else>
        Si usas un anuncio de pago puedes subir hasta 12 imágenes. Buenas fotos
        es clave para hacer destacar tu producto y tener una publicación de
        calidad.
      </p>
    </div>
    <input
      ref="fileInput"
      type="file"
      name="image"
      multiple
      class="upload--hidden"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
const { Swal } = useSweetAlert2();
import { useAdStore } from "@/stores/ad.store";
import { useToast } from "../composables/useNotifications";
import { useImageProxy } from "@/composables/useImage";
import { usePendingUploads } from "@/composables/usePendingUploads";
import { useApiClient } from "#imports";
import {
  X as IconX,
  PlusCircle as IconPlusCircle,
  Info as IconInfo,
} from "lucide-vue-next";

const adStore = useAdStore();
const toast = useToast();
const { transformUrl } = useImageProxy();
const apiClient = useApiClient();
const { pendingGalleryItems, pendingCount, addPending, removePending } =
  usePendingUploads();

const fileInput = ref(null);
const isProcessing = ref(false);

const isFree = computed(() => adStore.pack === "free");

// Uploaded images from store (real IDs and URLs)
const uploadedImages = computed(() => {
  const gallery = adStore.ad.gallery;
  return Array.isArray(gallery) ? gallery : [];
});

// All images to display: uploaded + pending previews
const allImages = computed(() => [
  ...uploadedImages.value,
  ...pendingGalleryItems.value,
]);

const maxImages = computed(() => (isFree.value ? 4 : 12));

const calculateMax = computed(() =>
  Math.max(0, maxImages.value - allImages.value.length)
);

const handleFileOpen = () => {
  if (!isProcessing.value) {
    fileInput.value.click();
  }
};

const validateImageDimensions = (file) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      resolve(img.width >= 750 && img.height >= 420);
    });
  });

const handleFileChange = async (event) => {
  const files = Array.from(event.target.files);
  fileInput.value.value = "";

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const remaining = maxImages.value - allImages.value.length;

  if (remaining <= 0) {
    toast.warning(
      `Ups, ya tienes ${maxImages.value} imágenes. No puedes agregar más.`
    );
    return;
  }

  // Limit selection to available slots
  const filesToProcess = files.slice(0, remaining);

  if (files.length > remaining) {
    toast.warning(
      `Solo puedes agregar ${remaining} imagen(es) más. Se procesarán las primeras ${remaining}.`
    );
  }

  const validFiles = [];

  for (const file of filesToProcess) {
    if (!validTypes.includes(file.type)) {
      toast.error(
        `"${file.name}" no es un formato válido. Solo aceptamos JPG, PNG o WebP.`
      );
      continue;
    }

    const hasValidDimensions = await validateImageDimensions(file);
    if (!hasValidDimensions) {
      toast.error(
        `"${file.name}" es muy pequeña. Necesitamos al menos 750x420 píxeles.`
      );
      continue;
    }

    validFiles.push(file);
  }

  if (validFiles.length > 0) {
    addPending(validFiles);
    toast.success(
      validFiles.length === 1
        ? "¡Imagen lista! Se subirá al confirmar."
        : `¡${validFiles.length} imágenes listas! Se subirán al confirmar.`
    );
  }
};

const handleRemoveImage = (image) => {
  if (isProcessing.value) return;

  Swal.fire({
    text: "¿Estás seguro de que quieres eliminar esta imagen?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "No, mantener",
  }).then((result) => {
    if (result.isConfirmed) {
      if (image.pending) {
        // Local-only removal — no API call needed
        removePending(image.url);
        toast.success("¡Listo! La imagen fue eliminada");
      } else {
        removeUploadedImage(image);
      }
    }
  });
};

const removeUploadedImage = async (image) => {
  isProcessing.value = true;
  document.body.style.cursor = "wait";

  try {
    await apiClient(`/api/ads/upload/${image.id}`, { method: "DELETE" });
    adStore.removeFromGallery(image);
    toast.success("¡Listo! La imagen fue eliminada");
  } catch {
    toast.error(
      "¡Ups! No pudimos eliminar la imagen. ¿Podrías intentarlo de nuevo?"
    );
  } finally {
    isProcessing.value = false;
    document.body.style.cursor = "";
  }
};
</script>
```
  </action>
  <verify>
    1. Open `/anunciar/galeria-de-imagenes` in browser — file picker has multi-select
    2. Select 2-3 images — no network requests to `/api/ads/upload` (check DevTools Network tab)
    3. Gallery shows blob: URL previews immediately
    4. Click X on a pending image — it disappears with no API call
    5. TypeScript: `cd apps/website && npx nuxi typecheck 2>&1 | grep "UploadImages" | head -10`
  </verify>
  <done>
    Multi-select file input works; images show as blob: previews without uploading; removing pending images makes no API call; TypeScript passes
  </done>
</task>

<task type="auto">
  <name>Task 3: Upload pending files in resumen.vue before save-draft</name>
  <files>apps/website/app/pages/anunciar/resumen.vue</files>
  <action>
Modify `confirmPay()` in `resumen.vue` to upload all pending images before calling `save-draft`.

The upload logic must:
1. Call `usePendingUploads().getPendingFiles()` to get `{ file, blobUrl }[]`
2. For each pending file: call `uploadFile(file, "gallery")` from `useImageProxy()`
3. Build `GalleryItem` from each upload result (same shape as the current `handlePushImage` logic in the old UploadImages.vue): `{ id: uploaded.id, url: transformUrl(uploaded.formats?.thumbnail?.url || uploaded.url) }`
4. Merge uploaded items with `adStore.ad.gallery` (already-uploaded items from editing context)
5. Call `adStore.updateGallery(mergedGallery)` — replaces the pending items' slot with real items
6. Call `usePendingUploads().clearAll()` to revoke blob URLs
7. THEN proceed with the existing `apiClient("ads/save-draft", ...)` call

The upload loop should be sequential (not Promise.all) to avoid hammering the upload endpoint. Show a loading/processing state via `isUploadingImages` ref. If any upload fails, show error and abort — do NOT call save-draft with partial images.

Add `isUploadingImages` ref and show it in the button label (optional — if `BarAnnouncement` accepts a loading prop, use it; otherwise just disable the button via CSS while uploading).

Updated `confirmPay` structure:

```typescript
import { ref } from "vue";
import { useImageProxy } from "@/composables/useImage";
import { usePendingUploads } from "@/composables/usePendingUploads";
import type { GalleryItem } from "@/types/ad";

// In script setup, alongside existing composables:
const { uploadFile, transformUrl } = useImageProxy();
const { getPendingFiles, clearAll: clearPendingUploads } = usePendingUploads();
const isUploadingImages = ref(false);

const uploadPendingImages = async (): Promise<boolean> => {
  const pending = getPendingFiles();
  if (pending.length === 0) return true;

  isUploadingImages.value = true;
  try {
    const uploadedItems: GalleryItem[] = [];

    for (const { file } of pending) {
      const result = await uploadFile(file, "gallery");
      uploadedItems.push({
        id: String(result.id),
        url: transformUrl(result.formats?.thumbnail?.url || result.url),
        formats: result.formats,
      });
    }

    // Merge with any already-uploaded gallery items (e.g. from editing)
    const currentGallery = adStore.ad.gallery.filter((item) => !item.pending);
    adStore.updateGallery([...currentGallery, ...uploadedItems]);
    clearPendingUploads();
    return true;
  } catch {
    Swal.fire({
      title: "Error al subir imágenes",
      text: "No pudimos subir una o más imágenes. Por favor, inténtalo de nuevo.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return false;
  } finally {
    isUploadingImages.value = false;
  }
};

// In confirmPay(), before both the paid and free paths, add:
const confirmPay = async () => {
  // Upload pending images first
  const uploaded = await uploadPendingImages();
  if (!uploaded) return;

  // ... rest of existing logic unchanged
};
```

Important: The `adStore.ad` passed to `save-draft` body must NOT include pending gallery items (items with `pending: true`). Since `uploadPendingImages()` calls `adStore.updateGallery([...currentGallery, ...uploadedItems])` before save-draft, the gallery is clean by the time the API call happens. Verify this by checking that no `pending: true` items exist in `adStore.ad.gallery` at the moment `save-draft` fires.
  </action>
  <verify>
    1. Add images in gallery step, proceed to resumen, click confirm
    2. DevTools Network: see sequential POST /api/ads/upload calls (one per pending image) BEFORE POST /api/ads/save-draft
    3. save-draft request body must contain `gallery` array with real numeric IDs (not blob: URLs)
    4. TypeScript: `cd apps/website && npx nuxi typecheck 2>&1 | grep "resumen" | head -10`
  </verify>
  <done>
    Images upload sequentially on confirm; save-draft receives real IDs; pending images cleared from memory after upload; no orphaned files if user never reaches resumen
  </done>
</task>

</tasks>

<verification>
End-to-end flow test:
1. Start ad creation, reach gallery step
2. Select 3 images — verify zero network requests to upload endpoint
3. Remove 1 pending image — verify no DELETE request
4. Proceed to resumen
5. Click confirm — observe: 2x POST /api/ads/upload then 1x POST /api/ads/save-draft
6. save-draft body contains `gallery: [{ id: "...", url: "..." }]` with real Strapi IDs

Abandon flow test:
1. Start ad creation, add images, close browser tab
2. Verify no orphaned files in Strapi media library
</verification>

<success_criteria>
- Images are NOT uploaded until user clicks confirm in resumen.vue
- Multi-select file input allows selecting multiple images at once
- Gallery shows blob: URL previews for pending images
- Removing a pending image requires no API call
- `save-draft` always receives real Strapi file IDs (no blob URLs, no pending flags)
- Abandoning the flow leaves no orphaned files in Strapi storage
- TypeScript passes with no new errors
</success_criteria>

<output>
After completion, create `.planning/quick/44-defer-image-uploads-in-ad-creation-flow-/44-SUMMARY.md`
</output>

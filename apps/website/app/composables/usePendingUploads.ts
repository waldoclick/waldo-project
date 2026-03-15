import { ref, computed } from "vue";
import type { GalleryItem } from "@/types/ad";

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
      const item = pendingItems.value[idx];
      if (item) URL.revokeObjectURL(item.blobUrl);
      pendingItems.value.splice(idx, 1);
    }
  };

  /**
   * Returns pending items as GalleryItem[] for display in the gallery grid.
   * Each item has pending: true so UploadImages.vue knows it's local only.
   */
  const pendingGalleryItems = computed<GalleryItem[]>(() =>
    pendingItems.value.map((p) => ({
      id: p.blobUrl, // use blobUrl as temporary id for keying
      url: p.blobUrl,
      pending: true,
      formats: { thumbnail: { url: p.blobUrl } },
    })),
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

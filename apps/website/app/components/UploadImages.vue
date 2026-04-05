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
import { usePendingUploads } from "@/composables/usePendingUploads";
import { useApiClient } from "#imports";
import {
  X as IconX,
  PlusCircle as IconPlusCircle,
  Info as IconInfo,
} from "lucide-vue-next";

const adStore = useAdStore();
const toast = useToast();
const apiClient = useApiClient();
const { pendingGalleryItems, addPending, removePending } = usePendingUploads();

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
  Math.max(0, maxImages.value - allImages.value.length),
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
  const files = [...event.target.files];
  fileInput.value.value = "";

  const validTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  const remaining = maxImages.value - allImages.value.length;

  if (remaining <= 0) {
    toast.warning(
      `Ups, ya tienes ${maxImages.value} imágenes. No puedes agregar más.`,
    );
    return;
  }

  // Limit selection to available slots
  const filesToProcess = files.slice(0, remaining);

  if (files.length > remaining) {
    toast.warning(
      `Solo puedes agregar ${remaining} imagen(es) más. Se procesarán las primeras ${remaining}.`,
    );
  }

  const validFiles = [];

  for (const file of filesToProcess) {
    if (!validTypes.has(file.type)) {
      toast.error(
        `"${file.name}" no es un formato válido. Solo aceptamos JPG, PNG o WebP.`,
      );
      continue;
    }

    const hasValidDimensions = await validateImageDimensions(file);
    if (!hasValidDimensions) {
      toast.error(
        `"${file.name}" es muy pequeña. Necesitamos al menos 750x420 píxeles.`,
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
        : `¡${validFiles.length} imágenes listas! Se subirán al confirmar.`,
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
    await apiClient(`/ads/upload/${image.id}`, { method: "DELETE" });
    adStore.removeFromGallery(image);
    toast.success("¡Listo! La imagen fue eliminada");
  } catch {
    toast.error(
      "¡Ups! No pudimos eliminar la imagen. ¿Podrías intentarlo de nuevo?",
    );
  } finally {
    isProcessing.value = false;
    document.body.style.cursor = "";
  }
};
</script>

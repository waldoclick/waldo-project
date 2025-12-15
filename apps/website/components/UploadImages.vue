<template>
  <div class="upload upload--images">
    <div
      :class="{
        'upload--images__grid--is-free': isFree,
        'upload--images__grid--disabled': isProcessing,
      }"
      class="upload--images__grid"
    >
      <!-- Imágenes cargadas -->
      <div
        v-for="(image, index) in images"
        :key="`${image?.id}-${index}`"
        :class="{ 'is-active': true }"
        class="upload--images__input"
      >
        <img
          class="upload--images__input__image"
          :src="image?.url || ''"
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

      <!-- Imágenes por subir -->
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
      class="upload--hidden"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
const { Swal } = useSweetAlert2();
import { useAdStore } from "@/stores/ad.store";
import { useRuntimeConfig } from "#app";
import { useToast } from "../composables/useNotifications";
import { useImageProxy } from "@/composables/useImage";
import {
  X as IconX,
  PlusCircle as IconPlusCircle,
  Info as IconInfo,
} from "lucide-vue-next";

const { $recaptcha } = useNuxtApp();

// Accede a la configuración de runtime
const adStore = useAdStore();
const token = useStrapiToken();
const toast = useToast();
const { transformUrl, uploadFile } = useImageProxy();

const form = ref({
  file: undefined,
});

const fileInput = ref(null);
const isProcessing = ref(false);

// Computed property to determine if the ad is free
const isFree = computed(() => adStore.pack === "free");

// Computed property for images
const images = computed(() => {
  const gallery = adStore.ad.gallery;
  return Array.isArray(gallery) ? gallery : [];
});

const calculateMax = computed(() => {
  const maxImages = isFree.value ? 4 : 12;
  const currentImages = images.value.length;
  return Math.max(0, maxImages - currentImages);
});

const handleFileOpen = () => {
  if (!isProcessing.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  const validTypes = ["image/jpeg", "image/png", "image/webp"];

  // Limpiar el input después de cada intento
  fileInput.value.value = "";

  // Verificar límite de imágenes según el pack
  const maxImages = isFree.value ? 4 : 12;
  if (images.value.length >= maxImages) {
    toast.warning(
      `Ups, ya tienes ${maxImages} imágenes. No puedes agregar más.`
    );
    return;
  }

  if (!validTypes.includes(file.type)) {
    toast.error(
      "Solo aceptamos imágenes en JPG, PNG o WebP. ¿Podrías intentar con otro formato?"
    );
    return;
  }

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.addEventListener("load", () => {
    if (img.width < 750 || img.height < 420) {
      toast.error(
        "Esta imagen es muy pequeña. Necesitamos una de al menos 750x420 píxeles para que se vea bien."
      );
      return;
    }

    form.value.file = file;
    handleUpload();
  });
};

const handleUpload = async () => {
  isProcessing.value = true;
  document.body.classList.add("cursor-wait");

  try {
    // Execute reCAPTCHA v3
    const recaptchaToken = await $recaptcha.execute("upload_image");

    const uploadedImage = await uploadFile(
      form.value.file,
      "gallery",
      recaptchaToken
    );
    handlePushImage(uploadedImage);
  } catch (error) {
    console.error("Upload error:", error);
    toast.error(
      "¡Ups! No pudimos subir tu imagen. ¿Podrías intentarlo de nuevo?"
    );
  } finally {
    isProcessing.value = false;
    document.body.classList.remove("cursor-wait");
  }
};

const handlePushImage = (uploadedImage) => {
  const imageUrl = uploadedImage.formats?.thumbnail?.url || uploadedImage.url;
  const newImage = {
    id: uploadedImage.id,
    url: transformUrl(imageUrl),
  };

  const updatedGallery = [...images.value, newImage];
  adStore.updateGallery(updatedGallery);
  fileInput.value.value = "";
  toast.success("¡Listo! Tu imagen se subió perfectamente");
};

const handleRemoveImage = (id) => {
  if (isProcessing.value) return;

  Swal.fire({
    text: "¿Estás seguro de que quieres eliminar esta imagen?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "No, mantener",
  }).then((result) => {
    if (result.isConfirmed) {
      removeImage(id);
    }
  });
};

const removeImage = async (image) => {
  isProcessing.value = true;
  document.body.style.cursor = "wait";

  try {
    adStore.removeFromGallery(image);
    toast.success("¡Listo! La imagen fue eliminada");
  } catch {
    toast.error(
      "¡Ups! No pudimos eliminar la imagen. ¿Podrías intentarlo de nuevo?"
    );
  } finally {
    isProcessing.value = false;
    document.body.classList.remove("cursor-wait");
  }
};
</script>

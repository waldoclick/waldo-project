<template>
  <div class="upload upload--media">
    <div class="upload--media__grid">
      <!-- Existing images -->
      <div
        v-for="(image, index) in modelValue"
        :key="`media-${image.id ?? index}`"
        class="upload--media__item upload--media__item--filled"
      >
        <img
          class="upload--media__item__image"
          :src="resolveUrl(image.url || image.formats?.thumbnail?.url || '')"
          alt="Imagen"
        />
        <button
          class="upload--media__item__remove"
          type="button"
          :disabled="uploading"
          @click="handleRemove(index)"
        >
          <X :size="14" :stroke-width="2.5" />
        </button>
      </div>

      <!-- Upload slot (shown when below maxFiles) -->
      <button
        v-if="modelValue.length < maxFiles"
        type="button"
        class="upload--media__item upload--media__item--empty"
        :disabled="uploading"
        @click="openPicker"
      >
        <LoaderCircle
          v-if="uploading"
          class="upload--media__item__spinner"
          :size="22"
        />
        <PlusCircle v-else class="upload--media__item__icon" :size="22" />
      </button>
    </div>

    <p v-if="hint" class="upload--media__hint">{{ hint }}</p>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      :multiple="maxFiles > 1"
      class="upload--media__hidden"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { PlusCircle, X, LoaderCircle } from "lucide-vue-next";

interface MediaItem {
  id?: number;
  url?: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
  };
}

const props = withDefaults(
  defineProps<{
    modelValue: MediaItem[];
    maxFiles?: number;
    hint?: string;
  }>(),
  {
    maxFiles: 1,
    hint: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: MediaItem[]): void;
}>();

const { Swal } = useSweetAlert2();
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);

const config = useRuntimeConfig();

const resolveUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) {
    if (config.public.apiDisableProxy) {
      return `${config.public.apiUrl}${url}`;
    }
    return `${config.public.baseUrl}${url.replace("/uploads/", "/api/images/")}`;
  }
  return `${config.public.baseUrl}${url}`;
};

const openPicker = () => {
  if (!uploading.value) {
    fileInput.value?.click();
  }
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = [...(input.files ?? [])];
  input.value = "";

  if (files.length === 0) return;

  const remaining = props.maxFiles - props.modelValue.length;
  const toUpload = files.slice(0, remaining);

  uploading.value = true;
  try {
    const uploaded: MediaItem[] = [];
    for (const file of toUpload) {
      const item = await uploadToStrapi(file);
      if (item) uploaded.push(item);
    }
    emit("update:modelValue", [...props.modelValue, ...uploaded]);
  } catch {
    await Swal.fire(
      "Error",
      "No se pudo subir la imagen. Intenta de nuevo.",
      "error",
    );
  } finally {
    uploading.value = false;
  }
};

const uploadToStrapi = async (file: File): Promise<MediaItem | null> => {
  const token = useSessionToken();
  const formData = new FormData();
  formData.append("files", file);

  const uploadUrl = config.public.apiDisableProxy
    ? `${config.public.apiUrl}/api/upload`
    : `/api/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  const result = await response.json();
  return result[0] ?? null;
};

const handleRemove = async (index: number) => {
  const result = await Swal.fire({
    text: "¿Estás seguro de que quieres eliminar esta imagen?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "No, mantener",
  });

  if (result.isConfirmed) {
    const updated = [...props.modelValue];
    updated.splice(index, 1);
    emit("update:modelValue", updated);
  }
};
</script>

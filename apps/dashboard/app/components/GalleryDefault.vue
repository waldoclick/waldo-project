<template>
  <div class="gallery gallery--default">
    <client-only>
      <VueEasyLightbox
        :visible="visible"
        :imgs="imgs"
        :index="lightboxIndex"
        :move-disabled="true"
        @hide="visible = false"
      />
    </client-only>
    <div
      class="gallery--default__container"
      :class="`gallery--default__container--cols-${columns}`"
    >
      <div
        v-for="(image, index) in images"
        :key="image.id ?? index"
        class="gallery--default__item"
      >
        <button
          type="button"
          class="gallery--default__delete"
          aria-label="Eliminar imagen"
          @click.stop="handleImageDelete(image, index)"
        >
          <IconX stroke="2" :size="16" />
        </button>
        <img
          :src="getImageUrl(image)"
          :alt="`${altPrefix} - Imagen ${index + 1}`"
          class="gallery--default__image"
          @click="handleImageClick(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
// @ts-expect-error - VueEasyLightbox types are not available for the dist version
import VueEasyLightbox from "vue-easy-lightbox/dist/external-css/vue-easy-lightbox.esm.min.js";
import { useImageProxy } from "@/composables/useImage";
import { X as IconX } from "lucide-vue-next";

const props = defineProps({
  images: {
    type: Array as () => Array<{ id?: number; url: string; formats?: any }>,
    required: true,
    default: () => [],
  },
  altPrefix: {
    type: String,
    default: "Imagen",
  },
  columns: {
    type: Number,
    default: 4,
  },
});

const emit = defineEmits<{
  (e: "image-click", index: number): void;
  (
    e: "image-delete",
    payload: {
      image: { id?: number; url: string; formats?: any };
      index: number;
    },
  ): void;
}>();

const { transformUrl } = useImageProxy();
const lightboxIndex = ref(0);
const visible = ref(false);

const imgs = computed(() =>
  Array.isArray(props.images)
    ? props.images.map((image) => {
        const imageUrl = image?.formats?.large?.url || image?.url || "";
        return transformUrl(imageUrl);
      })
    : [],
);

const getImageUrl = (image: { id?: number; url: string; formats?: any }) => {
  if (!image) return "";
  // Usar formato thumbnail si existe, sino la URL original
  const imageUrl = image.formats?.thumbnail?.url || image.url;
  if (!imageUrl) return "";
  return transformUrl(imageUrl);
};

const handleImageClick = (imageIndex: number) => {
  emit("image-click", imageIndex);
  if (imgs.value.length === 0) return;
  const safeIndex =
    imageIndex >= 0 && imageIndex < imgs.value.length ? imageIndex : 0;
  lightboxIndex.value = safeIndex;
  visible.value = true;
};

const handleImageDelete = (
  image: { id?: number; url: string; formats?: any },
  imageIndex: number,
) => {
  emit("image-delete", { image, index: imageIndex });
};
</script>

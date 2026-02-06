<template>
  <div class="gallery gallery--default">
    <div
      class="gallery--default__container"
      :class="`gallery--default__container--cols-${columns}`"
    >
      <img
        v-for="(image, index) in images"
        :key="index"
        :src="getImageUrl(image)"
        :alt="`${altPrefix} - Imagen ${index + 1}`"
        class="gallery--default__image"
        @click="handleImageClick(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  images: {
    type: Array as () => Array<{ url: string; formats?: any }>,
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
}>();

const { transformUrl } = useImageProxy();

const getImageUrl = (image: { url: string; formats?: any }) => {
  if (!image) return "";
  // Usar formato thumbnail si existe, sino la URL original
  const imageUrl = image.formats?.thumbnail?.url || image.url;
  if (!imageUrl) return "";
  return transformUrl(imageUrl);
};

const handleImageClick = (index: number) => {
  emit("image-click", index);
};
</script>

<template>
  <div class="gallery gallery--default">
    <client-only>
      <VueEasyLightbox
        :visible="visible"
        :imgs="imgs"
        :index="index"
        :move-disabled="true"
        @hide="visible = false"
      />
    </client-only>

    <div v-if="hasMainImage" class="gallery--default__main">
      <div class="gallery--default__image" @click="show(0)">
        <img
          loading="lazy"
          decoding="async"
          :src="mainImageUrl"
          alt="Imagen principal"
          title="Imagen principal"
        />
      </div>
    </div>

    <div v-if="hasThumbnailImages" class="gallery--default__thumbnails">
      <div
        v-for="(image, imgIndex) in thumbnailUrls"
        :key="imgIndex"
        class="gallery--default__image"
        @click="show(imgIndex + 1)"
      >
        <img
          loading="lazy"
          decoding="async"
          :src="image"
          alt="Imagen secundaria"
          title="Imagen secundaria"
        />
        <span
          v-if="imgIndex === 2 && remainingImages > 0"
          class="gallery--default__image--count"
        >
          +{{ remainingImages }} imágenes
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import VueEasyLightbox from "vue-easy-lightbox/dist/external-css/vue-easy-lightbox.esm.min.js";
import { useImageProxy } from "@/composables/useImage";

const props = defineProps({
  media: {
    type: Array,
    default: () => [],
  },
});

// Use the new useImageProxy composable to transform URLs
const { transformUrl } = useImageProxy();

const index = ref(0);
const visible = ref(false);

const mainImage = computed(() => props.media[0] || null);
const thumbnailImages = computed(() =>
  Array.isArray(props.media) ? props.media.slice(1, 4) : [],
);
const hasMainImage = computed(
  () => Array.isArray(props.media) && props.media.length > 0,
);
const hasThumbnailImages = computed(() => thumbnailImages.value.length > 0);

const mainImageUrl = computed(() => {
  if (!mainImage.value) return "";
  const originalUrl = mainImage.value.formats.large?.url || mainImage.value.url;
  return transformUrl(originalUrl);
});

const thumbnailUrls = computed(() => {
  return thumbnailImages.value.map((image) => {
    const originalUrl = image.formats.medium?.url || image.url;
    return transformUrl(originalUrl);
  });
});

const imgs = computed(() =>
  Array.isArray(props.media)
    ? props.media.map((image) => {
        const originalUrl = image.formats.large?.url || image.url;
        return transformUrl(originalUrl);
      })
    : [],
);

const remainingImages = computed(() =>
  props.media.length > 4 ? props.media.length - 4 : 0,
);

const isLastThumbnail = (index) => {
  return index === 2; // El índice 2 es el último thumbnail (0, 1, 2)
};

const show = (i) => {
  index.value = i;
  visible.value = true;
};
</script>

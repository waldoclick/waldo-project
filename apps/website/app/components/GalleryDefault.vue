<template>
  <div class="gallery gallery--default">
    <div v-if="hasMainImage" class="gallery--default__main" @click="show(0)">
      <img
        class="gallery--default__main__image"
        loading="lazy"
        decoding="async"
        :src="mainImageUrl"
        alt="Imagen principal"
        title="Imagen principal"
      />
      <span class="gallery--default__main__veil" />
      <span
        class="gallery--default__main__badge gallery--default__main__badge--zoom"
      >
        <Maximize2 :size="14" />
        Ampliar
      </span>
      <span
        class="gallery--default__main__badge gallery--default__main__badge--count"
      >
        <ImageIcon :size="14" />
        {{ photosLabel }}
      </span>
      <span v-if="condition" class="gallery--default__main__condition">
        {{ condition }}
      </span>
    </div>

    <div v-if="hasThumbnailImages" class="gallery--default__thumbnails">
      <div
        v-for="(image, imgIndex) in thumbnailUrls"
        :key="imgIndex"
        class="gallery--default__thumbnails__item"
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
          v-if="imgIndex === 4 && remainingImages > 0"
          class="gallery--default__thumbnails__item__count"
        >
          +{{ remainingImages }}
        </span>
      </div>
    </div>

    <Transition name="lb">
      <div
        v-if="lightboxVisible"
        class="gallery--default__lightbox"
        @mousedown.self="lightboxVisible = false"
      >
        <div class="gallery--default__lightbox__top">
          <span class="gallery--default__lightbox__top__counter">
            <ImageIcon :size="16" />
            {{ lightboxIndex + 1 }} / {{ imgs.length }}
          </span>
          <button
            class="gallery--default__lightbox__top__close"
            @click="lightboxVisible = false"
          >
            <X :size="16" />
            Cerrar
          </button>
        </div>

        <div class="gallery--default__lightbox__stage" @mousedown.stop>
          <button
            class="gallery--default__lightbox__stage__arrow gallery--default__lightbox__stage__arrow--prev"
            @click="lightboxPrev"
          >
            <ChevronLeft :size="22" />
          </button>
          <img
            class="gallery--default__lightbox__stage__image"
            :src="imgs[lightboxIndex]"
            alt="Imagen ampliada"
          />
          <button
            class="gallery--default__lightbox__stage__arrow gallery--default__lightbox__stage__arrow--next"
            @click="lightboxNext"
          >
            <ChevronRight :size="22" />
          </button>
        </div>

        <div class="gallery--default__lightbox__strip" @mousedown.stop>
          <div
            v-for="(img, i) in imgs"
            :key="i"
            class="gallery--default__lightbox__strip__item"
            :class="{
              'gallery--default__lightbox__strip__item--active':
                i === lightboxIndex,
            }"
            @click="lightboxIndex = i"
          >
            <img :src="img" :alt="`Foto ${i + 1}`" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  Maximize2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-vue-next";
import { useImageProxy } from "@/composables/useImage";

const props = defineProps({
  media: {
    type: Array,
    default: () => [],
  },
  condition: {
    type: String,
    default: "",
  },
});

// Use the new useImageProxy composable to transform URLs
const { transformUrl } = useImageProxy();

const lightboxIndex = ref(0);
const lightboxVisible = ref(false);

const mainImage = computed(() => props.media[0] || null);
const thumbnailImages = computed(() =>
  Array.isArray(props.media) ? props.media.slice(1, 6) : [],
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

const photosCount = computed(() =>
  Array.isArray(props.media) ? props.media.length : 0,
);

const photosLabel = computed(() => {
  const count = photosCount.value;
  return `${count} ${count === 1 ? "foto" : "fotos"}`;
});

const remainingImages = computed(() =>
  props.media.length > 6 ? props.media.length - 6 : 0,
);

const show = (i) => {
  lightboxIndex.value = i;
  lightboxVisible.value = true;
};

const lightboxPrev = () => {
  lightboxIndex.value =
    (lightboxIndex.value - 1 + imgs.value.length) % imgs.value.length;
};

const lightboxNext = () => {
  lightboxIndex.value = (lightboxIndex.value + 1) % imgs.value.length;
};

const handleKey = (e) => {
  if (!lightboxVisible.value) return;
  if (e.key === "ArrowLeft") lightboxPrev();
  if (e.key === "ArrowRight") lightboxNext();
  if (e.key === "Escape") lightboxVisible.value = false;
};

onMounted(() => window.addEventListener("keydown", handleKey));
onUnmounted(() => window.removeEventListener("keydown", handleKey));
</script>

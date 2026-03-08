<template>
  <div class="payment payment--ad">
    <div class="payment--ad__preview">
      <div class="payment--ad__preview__image">
        <NuxtImg
          v-if="firstImage"
          :src="firstImage"
          :alt="adName"
          loading="lazy"
          remote
        />
        <div v-else class="payment--ad__preview__image--placeholder" />
      </div>
      <div class="payment--ad__preview__info">
        <span class="payment--ad__preview__info__name">{{ adName }}</span>
        <span v-if="adPrice" class="payment--ad__preview__info__price">
          {{ formattedPrice }}
        </span>
      </div>
    </div>
    <ButtonEdit :show-edit-links="true" to="/anunciar" title="Editar anuncio" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAdStore } from "@/stores/ad.store";
import { useImageProxy } from "@/composables/useImage";

const adStore = useAdStore();
const { transformUrl } = useImageProxy();

const adName = computed(() => adStore.ad.name || "Sin título");

const adPrice = computed(() => adStore.ad.price);

const firstImage = computed(() => {
  const image = adStore.ad.gallery?.[0];
  if (!image?.url) return null;
  return transformUrl(image.url);
});

const formattedPrice = computed(() =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: adStore.ad.currency || "CLP",
  }).format(adPrice.value),
);
</script>

<template>
  <article class="payment payment--ad">
    <div class="payment--ad__left">
      <div class="payment--ad__images">
        <template v-for="index in 5" :key="index">
          <div
            v-if="!lastFiveImages[4 - (index - 1)]"
            class="payment--ad__images__placeholder"
          />
          <NuxtImg
            v-else
            class="payment--ad__images__img"
            loading="lazy"
            :src="lastFiveImages[4 - (index - 1)]"
            :alt="adStore.ad.name"
            remote
          />
        </template>
      </div>

      <div class="payment--ad__info">
        <div class="payment--ad__info__title">{{ today }}</div>
        <div class="payment--ad__info__text">{{ adStore.ad.name }}</div>
      </div>

      <div class="payment--ad__highlight">
        <div class="payment--ad__highlight__text">{{ formattedPrice }}</div>
      </div>
    </div>

    <div class="payment--ad__right">
      <div class="payment--ad__button">
        <ButtonIcon
          :icon="IconPencil"
          title="Editar anuncio"
          aria-label="Editar anuncio"
          @click="goToEdit"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Pencil as IconPencil } from "lucide-vue-next";
import { useAdStore } from "@/stores/ad.store";
import { useImageProxy } from "@/composables/useImage";
import ButtonIcon from "@/components/ButtonIcon.vue";
import type { GalleryItem } from "@/types/ad";

const adStore = useAdStore();
const { transformUrl } = useImageProxy();

const goToEdit = () => navigateTo("/anunciar");

const lastFiveImages = computed(() => {
  const gallery: GalleryItem[] = adStore.ad.gallery || [];
  const start = Math.max(0, gallery.length - 5);
  return gallery.slice(start).map((img: GalleryItem) => transformUrl(img.url));
});

const today = computed(() => {
  const date = new Date();
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()}`;
});

const formattedPrice = computed(() => {
  if (!adStore.ad.price) return "";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: adStore.ad.currency || "CLP",
    maximumFractionDigits: 0,
  }).format(Number(adStore.ad.price));
});
</script>

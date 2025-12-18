<template>
  <section class="related related--ads">
    <div class="related--ads__container">
      <div
        :class="[
          'related--ads__head',
          { 'related--ads__head--center': centerHead },
        ]"
      >
        <h2 class="related--ads__title">{{ title }}</h2>
        <div v-if="text" class="related--ads__text">{{ text }}</div>
      </div>

      <div v-if="loading" class="related--ads__loading">
        <LoadingDefault />
      </div>

      <div v-else-if="error" class="related--ads__error">
        {{ error }}
      </div>

      <div v-else-if="ads.length === 0" class="related--ads__empty">
        No se encontraron anuncios relacionados
      </div>

      <div v-else class="related--ads__grid">
        <CardAnnouncement v-for="ad in ads" :key="ad.id" :all="ad" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Ad } from "@/types/ad";
import CardAnnouncement from "@/components/CardAnnouncement.vue";
import LoadingDefault from "@/components/LoadingDefault.vue";

withDefaults(
  defineProps<{
    ads: Ad[];
    loading: boolean;
    error: string | null;
    title?: string;
    text?: string;
    centerHead?: boolean;
  }>(),
  {
    title: "Anuncios relacionados",
    text: "",
    centerHead: false,
  },
);
</script>

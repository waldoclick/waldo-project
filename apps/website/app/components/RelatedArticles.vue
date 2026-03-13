<template>
  <section class="related related--articles">
    <div class="related--articles__container">
      <div
        :class="[
          'related--articles__head',
          { 'related--articles__head--center': centerHead },
        ]"
      >
        <h2 class="related--articles__title">{{ title }}</h2>
        <div v-if="text" class="related--articles__text">{{ text }}</div>
      </div>

      <div v-if="loading" class="related--articles__loading">
        <LoadingDefault />
      </div>

      <div v-else-if="error" class="related--articles__error">
        {{ error }}
      </div>

      <div v-else-if="articles.length === 0" class="related--articles__empty">
        No se encontraron artículos relacionados
      </div>

      <div v-else class="related--articles__grid">
        <CardArticle
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Article } from "@/types/article";
import CardArticle from "@/components/CardArticle.vue";
import LoadingDefault from "@/components/LoadingDefault.vue";

withDefaults(
  defineProps<{
    articles: Article[];
    loading: boolean;
    error: string | null;
    title?: string;
    text?: string;
    centerHead?: boolean;
  }>(),
  {
    title: "Artículos relacionados",
    text: "",
    centerHead: false,
  },
);
</script>

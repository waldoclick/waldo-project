<template>
  <section class="article article--single">
    <div class="article--single__container">
      <!-- Body column -->
      <div class="article--single__body">
        <div class="article--single__body__gallery">
          <GalleryDefault :media="props.article.gallery" />
        </div>
        <div class="article--single__body__description">
          <div
            class="article--single__body__description__text"
            v-html="sanitizeRich(props.article.body)"
          />
        </div>
      </div>

      <!-- Sidebar column -->
      <div class="article--single__sidebar">
        <div
          v-if="props.article.categories.length > 0"
          class="article--single__sidebar__categories"
        >
          <h3>Categorías</h3>
          <ul>
            <li v-for="cat in props.article.categories" :key="cat.id">
              <NuxtLink :to="`/blog?category=${cat.slug}`">{{
                cat.name
              }}</NuxtLink>
            </li>
          </ul>
        </div>
        <div class="article--single__sidebar__share">
          <ShareDefault />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Article } from "@/types/article";
import GalleryDefault from "@/components/GalleryDefault.vue";
import ShareDefault from "@/components/ShareDefault.vue";
import { useSanitize } from "@/composables/useSanitize";

const props = defineProps<{ article: Article }>();

const { sanitizeRich } = useSanitize();
</script>

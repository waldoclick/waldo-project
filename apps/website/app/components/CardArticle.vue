<template>
  <article class="card card--article">
    <div class="card--article__image">
      <NuxtLink :to="`/blog/${article.slug}`">
        <NuxtImg
          :src="coverImage"
          :alt="article.title"
          width="400"
          height="300"
          loading="lazy"
          format="webp"
          remote
        />
      </NuxtLink>
    </div>

    <div class="card--article__info">
      <nav
        v-if="article.categories && article.categories.length > 0"
        class="card--article__info__categories"
      >
        <NuxtLink :to="`/blog?category=${article.categories[0]!.slug}`">
          {{ article.categories[0]!.name }}
        </NuxtLink>
      </nav>

      <h3 class="card--article__info__name">
        <NuxtLink :to="`/blog/${article.slug}`">
          {{ stringTruncate(article.title, 60) }}
        </NuxtLink>
      </h3>

      <p class="card--article__info__excerpt">
        {{ stringTruncate(article.header, 120) }}
      </p>

      <div v-if="article.publishedAt" class="card--article__info__date">
        {{
          new Intl.DateTimeFormat("es-CL", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(new Date(article.publishedAt))
        }}
      </div>

      <NuxtLink :to="`/blog/${article.slug}`" class="card--article__info__link">
        Leer más
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Article } from "@/types/article";
import { useImageProxy } from "@/composables/useImage";

const props = defineProps<{ article: Article }>();

const { transformUrl } = useImageProxy();

const stringTruncate = (str: string, length: number): string =>
  str.length > length ? str.slice(0, Math.max(0, length)) + "..." : str;

const coverImage = computed(() => {
  const cover = props.article.cover;
  if (cover && cover.length > 0) {
    const firstImage =
      cover[0]?.formats?.medium?.url || cover[0]?.formats?.thumbnail?.url || "";
    return transformUrl(firstImage);
  }
  return "";
});
</script>

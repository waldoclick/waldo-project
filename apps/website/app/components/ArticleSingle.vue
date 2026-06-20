<template>
  <div class="article article--single">
    <!-- Breadcrumb bar -->
    <section class="article--single__breadcrumb">
      <div class="article--single__breadcrumb__inner">
        <nav class="article--single__breadcrumb__nav" aria-label="Ruta de navegación">
          <NuxtLink to="/" class="article--single__breadcrumb__nav__link">Waldo</NuxtLink>
          <ChevronRight :size="14" class="article--single__breadcrumb__nav__sep" />
          <NuxtLink to="/blog" class="article--single__breadcrumb__nav__link">Blog</NuxtLink>
          <template v-if="categoryName">
            <ChevronRight :size="14" class="article--single__breadcrumb__nav__sep" />
            <span class="article--single__breadcrumb__nav__current">{{ categoryName }}</span>
          </template>
        </nav>
        <NuxtLink to="/blog" class="article--single__breadcrumb__back">
          <ArrowLeft :size="15" />
          Volver al blog
        </NuxtLink>
      </div>
    </section>

    <!-- Grid: article + aside -->
    <section class="article--single__layout">
      <div class="article--single__grid">
        <article class="article--single__main">
          <span
            v-if="categoryName"
            class="article--single__main__badge"
            :style="{ color: hue.onColor }"
          >
            <span
              class="article--single__main__badge__dot"
              :style="{ background: hue.baseColor }"
            ></span>
            {{ categoryName }}
          </span>

          <h1 class="article--single__main__title">{{ article.title }}</h1>

          <p v-if="article.header" class="article--single__main__excerpt">
            {{ article.header }}
          </p>

          <div class="article--single__main__meta">
            <span class="article--single__main__meta__author">
              <span class="article--single__main__meta__author__avatar">W</span>
              <span class="article--single__main__meta__author__name">Waldo</span>
            </span>
            <span class="article--single__main__meta__sep"></span>
            <span class="article--single__main__meta__date">{{ formattedDate }}</span>
            <span class="article--single__main__meta__sep"></span>
            <span class="article--single__main__meta__read">
              <Clock :size="14" class="article--single__main__meta__read__icon" />
              {{ getReadTime(article.body) }} min de lectura
            </span>
          </div>

          <div v-if="hasCover" class="article--single__main__cover">
            <NuxtImg
              :src="coverImage"
              :alt="article.title"
              width="720"
              height="405"
              format="webp"
              remote
            />
          </div>

          <div class="article--single__body">
            <div
              class="article--single__body__text"
              v-html="parseMarkdown(article.body)"
            />
          </div>
        </article>

        <aside class="article--single__aside">
          <!-- Filled in Task 4 -->
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Article } from "@/types/article";
import { useSanitize } from "@/composables/useSanitize";
import { useImageProxy } from "@/composables/useImage";
import { getReadTime } from "@/utils/readTime";
import { getCategoryHue } from "@/utils/categoryHue";
import { ChevronRight, ArrowLeft, Clock } from "lucide-vue-next";

const props = defineProps<{ article: Article }>();

const { parseMarkdown } = useSanitize();
const { transformUrl } = useImageProxy();

const categoryName = computed(() => props.article.categories?.[0]?.name || "");

const hue = computed(() => getCategoryHue(categoryName.value));

const hasCover = computed(() => {
  const cover = props.article.cover;
  return cover && cover.length > 0;
});

const coverImage = computed(() => {
  const cover = props.article.cover;
  const firstImage =
    cover[0]?.formats?.medium?.url || cover[0]?.formats?.thumbnail?.url || "";
  return transformUrl(firstImage);
});

const formattedDate = computed(() => {
  if (!props.article.createdAt) return "";
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(props.article.createdAt));
});
</script>

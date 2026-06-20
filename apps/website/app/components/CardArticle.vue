<template>
  <article class="card card--article">
    <NuxtLink :to="`/blog/${article.slug}`" class="card--article__media">
      <NuxtImg
        v-if="hasCover"
        :src="coverImage"
        :alt="article.title"
        width="400"
        height="225"
        loading="lazy"
        format="webp"
        remote
      />
      <span
        v-else
        class="card--article__media__wash"
        :style="{ background: hue.washBg }"
      >
        <span
          v-if="categoryName"
          class="card--article__media__kicker"
          :style="{ color: hue.onColor }"
        >
          {{ categoryName }}
        </span>
      </span>
      <span
        v-if="categoryName"
        class="card--article__media__cat"
        :style="{ color: hue.onColor }"
      >
        <span
          class="card--article__media__cat__dot"
          :style="{ background: hue.baseColor }"
        ></span>
        {{ categoryName }}
      </span>
    </NuxtLink>

    <div class="card--article__body">
      <h3 class="card--article__body__title">
        <NuxtLink :to="`/blog/${article.slug}`">
          {{ stringTruncate(article.title, 70) }}
        </NuxtLink>
      </h3>

      <p class="card--article__body__excerpt">
        {{ stringTruncate(article.header, 130) }}
      </p>

      <span class="card--article__body__footer">
        <span
          v-if="article.createdAt"
          class="card--article__body__footer__date"
        >
          {{ formattedDate }}
        </span>
        <span class="card--article__body__footer__sep"></span>
        <span class="card--article__body__footer__read">
          <IconClock
            :size="13"
            class="card--article__body__footer__read__icon"
          />
          {{ getReadTime(article.body) }} min de lectura
        </span>
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Article } from "@/types/article";
import { useImageProxy } from "@/composables/useImage";
import { getReadTime } from "@/utils/readTime";
import { getCategoryHue } from "@/utils/categoryHue";
import { Clock as IconClock } from "lucide-vue-next";

const props = defineProps<{ article: Article }>();

const { transformUrl } = useImageProxy();

const stringTruncate = (str: string, length: number): string =>
  str.length > length ? str.slice(0, Math.max(0, length)) + "..." : str;

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

const categoryName = computed(() => {
  const categories = props.article.categories;
  if (categories && categories.length > 0) {
    return categories[0]?.name || "";
  }
  return "";
});

const hue = computed(() => getCategoryHue(categoryName.value));

const formattedDate = computed(() => {
  if (!props.article.createdAt) return "";
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(props.article.createdAt));
});
</script>

<template>
  <section
    class="article article--archive"
    :class="{ 'article--archive--blog': blogSection }"
  >
    <div class="container">
      <div v-if="blogSection" class="article--archive__head">
        <div class="article--archive__head__intro">
          <span class="article--archive__head__eyebrow">
            <span class="article--archive__head__eyebrow__dot"></span>
            Blog Waldo
          </span>
          <h2 class="article--archive__head__title">
            Aprende a comprar y vender mejor
          </h2>
          <p class="article--archive__head__text">
            Guías, mercado y mantención de activos industriales, escritas para
            que tomes mejores decisiones.
          </p>
        </div>
        <NuxtLink to="/blog" class="article--archive__head__link">
          Ver todos los artículos
          <IconArrow :size="16" class="article--archive__head__link__icon" />
        </NuxtLink>
      </div>
      <div
        v-if="articles && articles.length > 0"
        class="article--archive__list"
        :class="{ 'article--archive__list--blog': blogSection || gridBlog }"
      >
        <CardArticle
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>
      <div
        v-if="articles && articles.length > 0"
        class="article--archive__paginate"
      >
        <span class="article--archive__paginate__range">{{ rangeText }}</span>
        <client-only>
          <div
            v-if="
              pagination &&
              pagination.pageCount > 1 &&
              pagination.total > pagination.pageSize
            "
            class="paginate article--archive__paginate__pages"
          >
            <vue-awesome-paginate
              v-model="pagination.page"
              :total-items="pagination.total"
              :items-per-page="pagination.pageSize"
              :max-pages-shown="5"
              @click="onClickHandler"
            />
          </div>
        </client-only>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { Article } from "@/types/article";
import type { Pagination } from "@/types/pagination";
import CardArticle from "@/components/CardArticle.vue";
import { ArrowRight as IconArrow } from "lucide-vue-next";

const props = defineProps<{
  articles: Article[];
  pagination: Pagination;
  blogSection?: boolean;
  gridBlog?: boolean;
}>();

const rangeText = computed(() => {
  const { page, pageSize, total } = props.pagination;
  if (!total) return "";
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Mostrando ${start}–${end} de ${total} artículos`;
});

const router = useRouter();
const route = useRoute();

const onClickHandler = (page: number) => {
  window.scrollTo(0, 0);
  router.push({
    query: {
      ...route.query,
      page: page.toString(),
    },
  });
};
</script>

<template>
  <section class="article article--archive">
    <div class="container">
      <div
        v-if="articles && articles.length > 0"
        class="article--archive__list"
      >
        <CardArticle
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>
      <div
        v-if="
          pagination &&
          pagination.pageCount > 1 &&
          pagination.total > pagination.pageSize
        "
        class="article--archive__paginate"
      >
        <client-only>
          <div class="paginate">
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
import { useRouter, useRoute } from "vue-router";
import type { Article } from "@/types/article";
import type { Pagination } from "@/types/pagination";
import CardArticle from "@/components/CardArticle.vue";

defineProps<{
  articles: Article[];
  pagination: Pagination;
}>();

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

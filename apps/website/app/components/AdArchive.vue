<template>
  <section class="announcement announcement--archive">
    <div class="container">
      <!-- <pre>{{ pagination }}</pre> -->
      <div v-if="ads && ads.length > 0" class="announcement--archive__list">
        <template v-for="ad in ads">
          <CardAnnouncement :all="ad as Ad" />
        </template>
      </div>
      <div
        v-if="pagination && pagination.pageCount > 1"
        class="announcement--archive__paginate"
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

// Components
import CardAnnouncement from "@/components/CardAnnouncement.vue";
import EmptyState from "@/components/EmptyState.vue";
import type { Ad } from "@/types/user";

// Props
const props = defineProps({
  ads: {
    type: Array as () => Ad[],
    default: () => [],
  },
  pagination: {
    type: Object,
    default: () => ({}),
  },
});

// Local state
const router = useRouter();
const route = useRoute();

const onClickHandler = (page: number) => {
  window.scrollTo(0, 0);

  // Modificar el parámetro 'page' en la URL
  router.push({
    query: {
      ...route.query, // Mantener los demás parámetros
      page: page.toString(), // Cambiar solo el parámetro 'page'
    },
  });
};
</script>

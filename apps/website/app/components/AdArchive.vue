<template>
  <section
    class="announcement announcement--archive"
    :class="{ 'announcement--archive--featured': featuredSection }"
  >
    <div class="container">
      <div v-if="featuredSection" class="announcement--archive__head">
        <div class="announcement--archive__head__intro">
          <span class="announcement--archive__head__eyebrow">
            <IconStar
              :size="15"
              class="announcement--archive__head__eyebrow__icon"
            />
            Destacados
          </span>
          <h2 class="announcement--archive__head__title">Avisos destacados</h2>
          <p class="announcement--archive__head__text">
            Equipos seleccionados de toda la industria. Explora y contacta
            directo al vendedor.
          </p>
        </div>
        <NuxtLink to="/anuncios" class="announcement--archive__head__link">
          Ver todos los anuncios
          <IconArrow
            :size="16"
            class="announcement--archive__head__link__icon"
          />
        </NuxtLink>
      </div>
      <!-- <pre>{{ pagination }}</pre> -->
      <div v-if="ads && ads.length > 0" class="announcement--archive__list">
        <template v-for="ad in ads">
          <CardAnnouncement :all="ad as Ad" />
        </template>
      </div>
      <div
        v-if="
          pagination &&
          pagination.pageCount > 1 &&
          pagination.total > pagination.pageSize
        "
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
import { Star as IconStar, ArrowRight as IconArrow } from "lucide-vue-next";
import type { Ad } from "@/types/ad";

// Props
defineProps({
  ads: {
    type: Array as () => Ad[],
    default: () => [],
  },
  pagination: {
    type: Object,
    default: () => ({}),
  },
  featuredSection: {
    type: Boolean,
    default: false,
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

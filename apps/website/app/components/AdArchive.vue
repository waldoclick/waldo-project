<template>
  <div
    class="announcement announcement--archive"
    :class="{ 'announcement--archive--featured': featuredSection }"
  >
    <div :class="featuredSection ? 'container' : null">
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
      <div v-if="ads && ads.length > 0" class="announcement--archive__list">
        <template v-for="ad in ads">
          <CardAnnouncement :all="ad as Ad" />
        </template>
      </div>
      <div
        v-else-if="emptyState"
        class="announcement--archive__empty"
        role="status"
      >
        <IconSearch :size="34" class="announcement--archive__empty__icon" />
        <p class="announcement--archive__empty__title">Sin resultados</p>
        <p class="announcement--archive__empty__text">
          Prueba ajustar o limpiar los filtros.
        </p>
        <NuxtLink to="/anuncios" class="announcement--archive__empty__button">
          Limpiar filtros
        </NuxtLink>
      </div>
      <div
        v-if="
          pagination &&
          pagination.pageCount > 1 &&
          pagination.total > pagination.pageSize
        "
        class="announcement--archive__paginate"
      >
        <PaginationDefault
          :current-page="pagination.page"
          :total-pages="pagination.pageCount"
          :total-records="pagination.total"
          :page-size="pagination.pageSize"
          @page-change="onClickHandler"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";

// Components
import CardAnnouncement from "@/components/CardAnnouncement.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";
import {
  Star as IconStar,
  ArrowRight as IconArrow,
  Search as IconSearch,
} from "lucide-vue-next";
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
  emptyState: {
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

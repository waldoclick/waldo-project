<template>
  <section
    class="account account--announcements"
    aria-labelledby="announcements-title"
  >
    <h2 id="announcements-title" class="account--announcements__title title">
      Mis anuncios
      <nuxt-link to="/#como-publicar" title="¿Cómo anunciar?">
        ¿Cómo anunciar?
      </nuxt-link>
    </h2>

    <div class="account--announcements__subtitle">
      {{ introText }}
    </div>

    <ClientOnly>
      <div class="account--announcements__list">
        <!-- Instrucciones para teclado - solo visibles para lectores de pantalla -->
        <div
          class="account--announcements__list__sr-only sr-only"
          aria-live="polite"
        >
          Use las flechas izquierda y derecha para navegar entre las pestañas
        </div>

        <!-- menu -->
        <div class="account--announcements__list__menu" role="tablist">
          <button
            v-for="(tab, index) in tabs"
            :id="`tab-${tab.value}`"
            :key="tab.value"
            type="button"
            role="tab"
            :aria-selected="currentFilter === tab.value"
            :aria-controls="`panel-${tab.value}`"
            :class="{ active: currentFilter === tab.value }"
            :title="tab.label"
            @click="$emit('filter-change', tab.value)"
            @keydown.right.prevent="focusNextTab(index)"
            @keydown.left.prevent="focusPrevTab(index)"
          >
            <component :is="tab.icon" :size="16" class="mr-2" />
            {{ tab.label }}
            <span>({{ tab.count }})</span>
          </button>
        </div>

        <!-- announcements  -->
        <div class="account--announcements__list__items">
          <div
            v-if="isLoading"
            class="account--announcements__loading"
            aria-live="polite"
          >
            <LoadingDefault />
          </div>

          <div
            v-if="!isLoading && ads.length > 0"
            :id="`panel-${currentFilter}`"
            class="account--announcements__list__items__wrapper"
            role="tabpanel"
            :aria-labelledby="`tab-${currentFilter}`"
          >
            <CardProfileAd v-for="ad in ads" :key="ad.id" :ad="ad" />

            <div
              v-if="pagination.total > pagination.pageSize"
              class="account--announcements__list__items__paginate"
            >
              <div class="paginate" aria-label="Paginación">
                <vue-awesome-paginate
                  :model-value="currentPage"
                  :total-items="pagination.total"
                  :items-per-page="pagination.pageSize"
                  :max-pages-shown="5"
                  @update:model-value="$emit('page-change', $event)"
                />
              </div>
            </div>
          </div>

          <div
            v-if="!isLoading && ads.length === 0"
            :id="`panel-${currentFilter}`"
            class="account--announcements__list__items__emptystate"
            role="tabpanel"
            :aria-labelledby="`tab-${currentFilter}`"
          >
            <EmptyState>
              <template #message> No hay anuncios </template>
            </EmptyState>
          </div>
        </div>
      </div>
    </ClientOnly>

    <div class="account--announcements__button">
      <ButtonCreate />
    </div>
  </section>
</template>

<script setup lang="ts">
import CardProfileAd from "@/components/CardProfileAd.vue";
import EmptyState from "@/components/EmptyState.vue";
import LoadingDefault from "@/components/LoadingDefault.vue";
import ButtonCreate from "@/components/ButtonCreate.vue";
import { ref } from "vue";

// Definir la interfaz localmente para evitar errores de importación
interface Announcement {
  id: number;
  [key: string]: any; // Permitir cualquier propiedad adicional
}

type FilterType = "published" | "review" | "expired" | "rejected" | "banned";

interface Pagination {
  total: number;
  pageSize: number;
}

const props = defineProps<{
  ads: Announcement[];
  currentFilter: string;
  currentPage: number;
  pagination: Pagination;
  isLoading: boolean;
  introText: string;
  tabs: Array<{
    value: FilterType;
    label: string;
    count: number;
    icon: any; // Tipo para el componente de icono
  }>;
}>();

defineEmits<{
  "filter-change": [filter: FilterType];
  "page-change": [page: number];
}>();

// Funciones para la navegación entre pestañas con teclado
const focusNextTab = (currentIndex: number) => {
  const tabs = document.querySelectorAll('[role="tab"]');
  const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
  (tabs[nextIndex] as HTMLElement).focus();
};

const focusPrevTab = (currentIndex: number) => {
  const tabs = document.querySelectorAll('[role="tab"]');
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
  (tabs[prevIndex] as HTMLElement).focus();
};
</script>

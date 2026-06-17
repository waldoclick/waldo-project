<template>
  <section
    class="account account--announcements"
    aria-labelledby="announcements-title"
  >
    <!-- Header -->
    <div class="account--announcements__header">
      <div class="account--announcements__header__left">
        <span class="account--announcements__header__eyebrow">Cuenta</span>
        <h1
          id="announcements-title"
          class="account--announcements__header__heading"
        >
          Mis anuncios
        </h1>
        <p class="account--announcements__header__intro">{{ introText }}</p>
      </div>
      <nuxt-link to="/anunciar" class="account--announcements__header__cta">
        <Plus :size="16" />
        Publicar anuncio
      </nuxt-link>
    </div>

    <!-- Tabs -->
    <div
      class="account--announcements__tabs"
      role="tablist"
      aria-label="Filtrar anuncios por estado"
    >
      <!-- SR hint -->
      <span class="sr-only" aria-live="polite">
        Use las flechas izquierda y derecha para navegar entre las pestañas
      </span>
      <button
        v-for="(tab, index) in tabs"
        :id="`tab-${tab.value}`"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="currentFilter === tab.value"
        :aria-controls="`panel-${tab.value}`"
        :class="[
          'account--announcements__tab',
          {
            'account--announcements__tab--active': currentFilter === tab.value,
          },
        ]"
        :title="tab.label"
        @click="$emit('filter-change', tab.value)"
        @keydown.right.prevent="focusNextTab(index)"
        @keydown.left.prevent="focusPrevTab(index)"
      >
        <component :is="tab.icon" :size="15" />
        {{ tab.label }}
        <span class="account--announcements__tab__count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Body -->
    <ClientOnly>
      <!-- Loading -->
      <div
        v-if="isLoading"
        class="account--announcements__loading"
        aria-live="polite"
      >
        <LoadingDefault />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="ads.length === 0"
        :id="`panel-${currentFilter}`"
        class="account--announcements__empty"
        role="tabpanel"
        :aria-labelledby="`tab-${currentFilter}`"
      >
        <span class="account--announcements__empty__icon">
          <component :is="emptyEntry.icon" :size="26" />
        </span>
        <span class="account--announcements__empty__title">{{
          emptyEntry.title
        }}</span>
        <span class="account--announcements__empty__msg">{{
          emptyEntry.msg
        }}</span>
      </div>

      <!-- Ad list -->
      <div
        v-else
        :id="`panel-${currentFilter}`"
        class="account--announcements__list"
        role="tabpanel"
        :aria-labelledby="`tab-${currentFilter}`"
      >
        <CardProfileAd v-for="ad in ads" :key="ad.id" :ad="ad" />
      </div>

      <!-- Pagination -->
      <div
        v-if="!isLoading && pagination.total > pagination.pageSize"
        class="account--announcements__pager"
        aria-label="Paginación"
      >
        <div class="paginate">
          <vue-awesome-paginate
            :model-value="currentPage"
            :total-items="pagination.total"
            :items-per-page="pagination.pageSize"
            :max-pages-shown="5"
            @update:model-value="$emit('page-change', $event)"
          />
        </div>
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus, Clock, Package, CircleOff, CircleX, Ban } from "lucide-vue-next";
import type { Component } from "vue";
import CardProfileAd from "@/components/CardProfileAd.vue";
import LoadingDefault from "@/components/LoadingDefault.vue";

type Announcement = Record<string, unknown> & { id: number };
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
    icon: Component;
  }>;
}>();

defineEmits<{
  "filter-change": [filter: FilterType];
  "page-change": [page: number];
}>();

const focusNextTab = (currentIndex: number) => {
  const tabEls = document.querySelectorAll('[role="tab"]');
  const nextIndex = currentIndex < tabEls.length - 1 ? currentIndex + 1 : 0;
  (tabEls[nextIndex] as HTMLElement).focus();
};

const focusPrevTab = (currentIndex: number) => {
  const tabEls = document.querySelectorAll('[role="tab"]');
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabEls.length - 1;
  (tabEls[prevIndex] as HTMLElement).focus();
};

interface EmptyEntry {
  icon: Component;
  title: string;
  msg: string;
}

const emptyMap: Record<FilterType, EmptyEntry> = {
  published: {
    icon: Package,
    title: "Aún no tienes anuncios activos",
    msg: "Publica tu primer anuncio y llega a compradores de toda la industria.",
  },
  review: {
    icon: Clock,
    title: "No tienes anuncios pendientes",
    msg: "Cuando publiques un anuncio nuevo aparecerá aquí mientras esperamos su aprobación.",
  },
  expired: {
    icon: CircleOff,
    title: "No tienes anuncios expirados",
    msg: "Aquí verás las publicaciones cuyo período de 45 días ya terminó.",
  },
  rejected: {
    icon: CircleX,
    title: "No tienes anuncios rechazados",
    msg: "Si un anuncio no cumple los requisitos te diremos cómo corregirlo.",
  },
  banned: {
    icon: Ban,
    title: "No tienes anuncios baneados",
    msg: "Tus publicaciones cumplen las reglas de la comunidad. ¡Sigue así!",
  },
};

const emptyEntry = computed<EmptyEntry>(
  () => emptyMap[props.currentFilter as FilterType] ?? emptyMap.published,
);
</script>

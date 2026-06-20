<template>
  <section class="filter filter--articles">
    <div class="filter--articles__container">
      <div class="filter--articles__drop">
        <button
          type="button"
          class="filter--articles__drop__button"
          @click="toggleDrop"
        >
          <IconList :size="15" />
          {{ activeCategoryLabel }}
          <IconChevron
            :size="14"
            class="filter--articles__drop__button__arrow"
          />
        </button>
        <div v-if="dropOpen" class="filter--articles__drop__panel">
          <button
            type="button"
            class="filter--articles__drop__panel__item"
            :class="{
              'filter--articles__drop__panel__item--active':
                selectedCategory === 'all',
            }"
            @click="selectCategory('all')"
          >
            <IconCheck v-if="selectedCategory === 'all'" :size="14" />
            Todas las categorías
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="filter--articles__drop__panel__item"
            :class="{
              'filter--articles__drop__panel__item--active':
                selectedCategory === cat.slug,
            }"
            @click="selectCategory(cat.slug)"
          >
            <IconCheck v-if="selectedCategory === cat.slug" :size="14" />
            {{ cat.name }}
          </button>
        </div>
      </div>

      <label class="filter--articles__search">
        <IconSearch :size="17" class="filter--articles__search__icon" />
        <input
          v-model="searchQuery"
          type="text"
          class="filter--articles__search__input"
          placeholder="Buscar artículos…"
          maxlength="80"
          @input="onSearchInput"
        />
      </label>

      <button
        v-if="hasFilters"
        type="button"
        class="filter--articles__clear"
        @click="clearFilters"
      >
        Limpiar filtros
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { BlogCategory } from "@/types/blog-category";
import {
  AlignLeft as IconList,
  ChevronDown as IconChevron,
  Check as IconCheck,
  Search as IconSearch,
} from "lucide-vue-next";

const props = defineProps<{
  categories: BlogCategory[];
}>();

const route = useRoute();
const router = useRouter();

const selectedCategory = ref(route.query.category?.toString() || "all");
const searchQuery = ref(route.query.q?.toString() || "");
const dropOpen = ref(false);

const activeCategoryLabel = computed(() => {
  if (selectedCategory.value === "all") return "Todas las categorías";
  const cat = props.categories.find((c) => c.slug === selectedCategory.value);
  return cat?.name || "Todas las categorías";
});

const hasFilters = computed(
  () => selectedCategory.value !== "all" || searchQuery.value.trim() !== "",
);

const toggleDrop = () => {
  dropOpen.value = !dropOpen.value;
};

const selectCategory = (slug: string) => {
  selectedCategory.value = slug;
  dropOpen.value = false;
  router.push({
    query: {
      ...route.query,
      category: slug !== "all" ? slug : undefined,
      page: 1,
    },
  });
};

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const onSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const value = searchQuery.value.trim();
    router.push({
      query: {
        ...route.query,
        q: value !== "" ? value : undefined,
        page: 1,
      },
    });
  }, 350);
};

const clearFilters = () => {
  selectedCategory.value = "all";
  searchQuery.value = "";
  router.push({ query: {} });
};

// Keep local state in sync with external route changes (back/forward, clear).
watch(
  () => route.query.category,
  (val) => {
    selectedCategory.value = val?.toString() || "all";
  },
);
watch(
  () => route.query.q,
  (val) => {
    searchQuery.value = val?.toString() || "";
  },
);

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".filter--articles__drop")) {
    dropOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

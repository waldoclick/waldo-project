<template>
  <section
    id="categorias"
    class="category category--archive"
    :class="isSeparator"
  >
    <div class="container">
      <h2 v-if="title" class="category--archive__title">
        {{ title }}
      </h2>
      <!-- <pre>{{ filterStore.filterCategories }}</pre> -->
      <nav v-if="categories.length > 0" class="category--archive__list">
        <CardCategory
          v-for="(item, index) in sortedCategories"
          :key="index"
          :title="item.name || ''"
          :color="item.color || ''"
          :slug="item.slug || ''"
          :icon="item.icon?.url || ''"
          :count="item.count || ''"
        />
      </nav>
      <div v-else>
        <p>No hay categorías disponibles</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { FilterCategory } from "@/types/filter";
import CardCategory from "@/components/CardCategory.vue";

const props = defineProps<{
  separator?: boolean;
  categories: FilterCategory[];
}>();

const separator = props.separator ?? false;
const title = "O explora equipos en cada categoría:";

const sortedCategories = computed(() => {
  return [...props.categories].sort((a, b) => (b.count || 0) - (a.count || 0));
});

const isSeparator = computed(() => {
  return separator ? "is-separator" : "";
});
</script>

<template>
  <section id="categorias" class="category category--archive">
    <div class="container">
      <div class="category--archive__head">
        <h2 class="category--archive__head__title">Explora por categoría</h2>
        <p class="category--archive__head__text">
          Cada industria tiene su color. Encuentra equipos organizados por la
          categoría a la que pertenecen.
        </p>
      </div>
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
  categories: FilterCategory[];
}>();

const sortedCategories = computed(() => {
  return [...props.categories].sort((a, b) => (b.count || 0) - (a.count || 0));
});
</script>

<template>
  <section class="filter filter--articles">
    <div class="filter--articles__container">
      <div class="filter--articles__selectors">
        <div class="filter--articles__selector">
          <select
            v-if="isClient"
            v-model="selectedCategory"
            class="filter--articles__select"
          >
            <option value="all">Todas las categorías</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
              {{ cat.name }}
            </option>
          </select>
          <div
            v-else
            class="filter--articles__select filter--articles__select--loading"
          >
            Cargando...
          </div>
        </div>
      </div>

      <div class="filter--articles__order">
        <label>Ordenar por:</label>
        <select
          v-if="isClient"
          v-model="selectedOrder"
          class="filter--articles__select filter--articles__select--simple"
        >
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguos</option>
        </select>
        <div
          v-else
          class="filter--articles__select filter--articles__select--simple filter--articles__select--loading"
        >
          Cargando...
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Category } from "@/types/category";

defineProps<{
  categories: Category[];
}>();

const route = useRoute();
const router = useRouter();
const isClient = ref(false);

const selectedCategory = ref("all");
const selectedOrder = ref("recent");

onMounted(() => {
  isClient.value = true;
  selectedCategory.value = route.query.category?.toString() || "all";
  selectedOrder.value = route.query.order?.toString() || "recent";
});

watch(selectedCategory, (val) => {
  router.push({
    query: {
      ...route.query,
      category: val !== "all" ? val : undefined,
      page: 1,
    },
  });
});

watch(selectedOrder, (val) => {
  router.push({
    query: {
      ...route.query,
      order: val,
      page: 1,
    },
  });
});
</script>

<template>
  <section class="filter filter--announcement">
    <div class="filter--announcement__container">
      <!-- <pre>{{ filterCommunes }}</pre> -->
      <div class="filter--announcement__selectors">
        <div class="filter--announcement__selector">
          <select
            v-if="isClient"
            id="ubication"
            v-model="selectedCommune"
            class="filter--announcement__select"
          >
            <option value="null">Ubicación</option>
            <option
              v-for="commune in filterStore.filterCommunes"
              :key="commune.id"
              :value="commune.id"
            >
              {{ commune.name }}
            </option>
          </select>
          <div
            v-else
            class="filter--announcement__select filter--announcement__select--loading"
          >
            Cargando...
          </div>
        </div>
      </div>

      <div class="filter--announcement__order">
        <label>Ordenar por:</label>
        <select
          v-if="isClient"
          v-model="selectedOrder"
          class="filter--announcement__select filter--announcement__select--simple"
        >
          <option value="featured">Destacados</option>
          <option value="recent">Recientes</option>
        </select>
        <div
          v-else
          class="filter--announcement__select filter--announcement__select--simple filter--announcement__select--loading"
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
import { useFilterStore } from "@/stores/filter.store";

const filterStore = useFilterStore();
const route = useRoute();
const router = useRouter();
const isClient = ref(false);

// Inicializar con valores por defecto
const selectedCommune = ref("null");
const selectedOrder = ref("featured");

// Cargar datos y establecer valores iniciales
onMounted(async () => {
  isClient.value = true;
  await filterStore.loadFilterCommunes();
  // Establecer los valores basados en los parámetros de la URL
  selectedCommune.value = route.query.commune?.toString() || "null";
  selectedOrder.value = route.query.order?.toString() || "featured";
});

// Watch para actualizar la URL cuando cambian los valores seleccionados
watch(selectedCommune, (newCommune) => {
  router.push({
    query: {
      ...route.query,
      commune: newCommune !== "null" ? newCommune : undefined,
      page: 1,
    },
  });
});

watch(selectedOrder, (newOrder) => {
  router.push({
    query: {
      ...route.query,
      order: newOrder,
      page: 1,
    },
  });
});
</script>

<template>
  <section class="filter filter--announcement">
    <div class="filter--announcement__container">
      <div class="filter--announcement__group">
        <div class="filter--announcement__selector">
          <IconFilter :size="16" class="filter--announcement__selector__icon" />
          <select
            v-if="isClient"
            id="ubication"
            v-model="selectedCommune"
            class="filter--announcement__select"
            aria-label="Filtrar por ubicación"
          >
            <option value="null">Todas las ubicaciones</option>
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

        <span v-if="total > 0" class="filter--announcement__count">
          <strong>{{ total }}</strong>
          {{ total === 1 ? "anuncio" : "anuncios" }}
        </span>
      </div>

      <label class="filter--announcement__order">
        <span class="filter--announcement__order__label">Ordenar por</span>
        <span class="filter--announcement__order__field">
          <select
            v-if="isClient"
            v-model="selectedOrder"
            class="filter--announcement__select"
            aria-label="Ordenar anuncios"
          >
            <option value="featured">Destacados</option>
            <option value="recent">Recientes</option>
          </select>
          <div
            v-else
            class="filter--announcement__select filter--announcement__select--loading"
          >
            Cargando...
          </div>
          <IconChevron
            :size="15"
            class="filter--announcement__order__chevron"
          />
        </span>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFilterStore } from "@/stores/filter.store";
import {
  Filter as IconFilter,
  ChevronDown as IconChevron,
} from "lucide-vue-next";

defineProps({
  total: {
    type: Number,
    default: 0,
  },
});

const filterStore = import.meta.client
  ? useFilterStore()
  : ({} as ReturnType<typeof useFilterStore>);
const route = useRoute();
const router = useRouter();
const isClient = ref(false);

// Inicializar con valores por defecto
const selectedCommune = ref("null");
const selectedOrder = ref("featured");

// onMounted: UI-only — sets client flag for SSR-conditional rendering; filterCommunes pre-loaded by parent page
onMounted(() => {
  isClient.value = true;
  // Initialize filter values from URL params
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

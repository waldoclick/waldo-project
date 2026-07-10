<template>
  <div class="filter filter--toolbar">
    <span class="filter--toolbar__count">
      <strong>{{ total }}</strong> {{ total === 1 ? "anuncio" : "anuncios" }}
    </span>
    <div class="filter--toolbar__controls">
      <label class="filter--toolbar__location">
        <span class="filter--toolbar__location__label">Ubicación</span>
        <span class="filter--toolbar__location__field">
          <select
            v-if="isClient"
            :value="route.query.commune || ''"
            class="filter--toolbar__select"
            aria-label="Filtrar por ubicación"
            @change="onCommune(($event.target as HTMLSelectElement).value)"
          >
            <option value="">Todas las ubicaciones</option>
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
            class="filter--toolbar__select filter--toolbar__select--loading"
          >
            Cargando...
          </div>
          <IconChevron :size="15" class="filter--toolbar__location__chevron" />
        </span>
      </label>
      <label class="filter--toolbar__order">
        <span class="filter--toolbar__order__label">Ordenar por</span>
        <span class="filter--toolbar__order__field">
          <select
            v-if="isClient"
            v-model="selectedOrder"
            class="filter--toolbar__select"
            aria-label="Ordenar anuncios"
          >
            <option value="featured">Destacados</option>
            <option value="recent">Recientes</option>
          </select>
          <div
            v-else
            class="filter--toolbar__select filter--toolbar__select--loading"
          >
            Cargando...
          </div>
          <IconChevron :size="15" class="filter--toolbar__order__chevron" />
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronDown as IconChevron } from "lucide-vue-next";
import { useFilterStore } from "@/stores/filter.store";

defineProps({
  total: {
    type: Number,
    default: 0,
  },
});

const route = useRoute();
const router = useRouter();
const isClient = ref(false);

// Store solo se usa client-side (el select va detrás de v-if="isClient")
const filterStore = import.meta.client
  ? useFilterStore()
  : ({} as ReturnType<typeof useFilterStore>);

const selectedOrder = ref("featured");

function onCommune(value: string) {
  router.push({
    query: {
      ...route.query,
      commune: value || undefined,
      page: 1,
    },
  });
}

onMounted(() => {
  isClient.value = true;
  selectedOrder.value = route.query.order?.toString() || "featured";
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

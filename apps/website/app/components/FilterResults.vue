<template>
  <div class="filter filter--toolbar">
    <span class="filter--toolbar__count">
      <strong>{{ total }}</strong> {{ total === 1 ? "anuncio" : "anuncios" }}
    </span>
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
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronDown as IconChevron } from "lucide-vue-next";

defineProps({
  total: {
    type: Number,
    default: 0,
  },
});

const route = useRoute();
const router = useRouter();
const isClient = ref(false);

const selectedOrder = ref("featured");

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

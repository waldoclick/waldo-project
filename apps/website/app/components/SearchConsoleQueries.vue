<template>
  <section class="search-console search-console--queries">
    <div class="search-console--queries__header">
      <h2 class="search-console--queries__title">Queries</h2>
    </div>
    <div class="search-console--queries__table-wrapper">
      <TableDefault :columns="columns">
        <TableRow v-for="(row, index) in rows" :key="index">
          <TableCell>{{ row.keys[0] }}</TableCell>
          <TableCell align="right">{{ formatNumber(row.clicks) }}</TableCell>
          <TableCell align="right">{{
            formatNumber(row.impressions)
          }}</TableCell>
          <TableCell align="right">{{ formatCtr(row.ctr) }}</TableCell>
          <TableCell align="right">{{
            formatPosition(row.position)
          }}</TableCell>
        </TableRow>
      </TableDefault>
      <div
        v-if="rows.length === 0 && !loading"
        class="search-console--queries__empty"
      >
        <p>No hay datos disponibles</p>
      </div>
      <div v-if="loading" class="search-console--queries__loading">
        <p>Cargando...</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";

interface SearchConsoleRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const columns = [
  { label: "Consulta" },
  { label: "Clicks", align: "right" as const },
  { label: "Impressiones", align: "right" as const },
  { label: "CTR", align: "right" as const },
  { label: "Posición", align: "right" as const },
];

const apiClient = useApiClient();
const loading = ref(true);
const rows = ref<SearchConsoleRow[]>([]);

const formatNumber = (n: number) => new Intl.NumberFormat("es-CL").format(n);
const formatCtr = (ctr: number) => `${(ctr * 100).toFixed(1)}%`;
const formatPosition = (pos: number) => pos.toFixed(1);

watch(
  () => true,
  async () => {
    try {
      loading.value = true;
      rows.value = (await apiClient("search-console/queries", {
        method: "GET",
      })) as SearchConsoleRow[];
    } catch (error) {
      console.error("Error fetching Search Console queries:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

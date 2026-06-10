<template>
  <section class="google-analytics google-analytics--pages">
    <div class="google-analytics--pages__header">
      <h2 class="google-analytics--pages__title">Páginas</h2>
    </div>
    <div class="google-analytics--pages__table-wrapper">
      <TableDefault :columns="columns">
        <TableRow v-for="(row, index) in rows" :key="index">
          <TableCell>
            <span class="google-analytics--pages__url" :title="row.page">{{
              row.page
            }}</span>
          </TableCell>
          <TableCell align="right">{{ formatNumber(row.sessions) }}</TableCell>
          <TableCell align="right">
            <span :class="bounceClass(row.bounceRate)">
              {{ formatBounceRate(row.bounceRate) }}
            </span>
          </TableCell>
        </TableRow>
      </TableDefault>
      <div
        v-if="rows.length === 0 && !loading"
        class="google-analytics--pages__empty"
      >
        <p>No hay datos disponibles</p>
      </div>
      <div v-if="loading" class="google-analytics--pages__loading">
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

interface GA4PageRow {
  page: string;
  pageTitle: string;
  sessions: number;
  pageViews: number;
  bounceRate: number;
}

const columns = [
  { label: "Página" },
  { label: "Sesiones", align: "right" as const },
  { label: "Bounce Rate", align: "right" as const },
];

const apiClient = useApiClient();
const loading = ref(true);
const rows = ref<GA4PageRow[]>([]);

const formatNumber = (n: number) => new Intl.NumberFormat("es-CL").format(n);
const formatBounceRate = (n: number) => `${(n * 100).toFixed(1)}%`;

const bounceClass = (bounceRate: number) => {
  if (bounceRate <= 0.3) return "google-analytics--pages__bounce--good";
  if (bounceRate <= 0.6) return "google-analytics--pages__bounce--warning";
  return "google-analytics--pages__bounce--bad";
};

watch(
  () => true,
  async () => {
    try {
      loading.value = true;
      rows.value = (await apiClient("google-analytics/pages", {
        method: "GET",
      })) as GA4PageRow[];
    } catch (error) {
      console.error("Error fetching Google Analytics pages:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

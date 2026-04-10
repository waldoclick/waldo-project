<template>
  <section class="cloudflare cloudflare--threats">
    <div class="cloudflare--threats__header">
      <h2 class="cloudflare--threats__title">Días con más amenazas</h2>
    </div>
    <div class="cloudflare--threats__table-wrapper">
      <TableDefault :columns="columns">
        <TableRow v-for="(row, index) in rows" :key="index">
          <TableCell>{{ row.date }}</TableCell>
          <TableCell align="right">{{ formatNumber(row.threats) }}</TableCell>
          <TableCell align="right">{{ formatNumber(row.requests) }}</TableCell>
        </TableRow>
      </TableDefault>
      <div
        v-if="rows.length === 0 && !loading"
        class="cloudflare--threats__empty"
      >
        <p>No hay datos disponibles</p>
      </div>
      <div v-if="loading" class="cloudflare--threats__loading">
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

interface CloudflareThreatRow {
  date: string;
  threats: number;
  requests: number;
}

const columns = [
  { label: "Fecha" },
  { label: "Amenazas", align: "right" as const },
  { label: "Requests Totales", align: "right" as const },
];

const apiClient = useApiClient();
const loading = ref(true);
const rows = ref<CloudflareThreatRow[]>([]);

const formatNumber = (n: number) => new Intl.NumberFormat("es-CL").format(n);

watch(
  () => true,
  async () => {
    try {
      loading.value = true;
      rows.value = (await apiClient("cloudflare/threats", {
        method: "GET",
      })) as CloudflareThreatRow[];
    } catch (error) {
      console.error("Error fetching Cloudflare threats:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

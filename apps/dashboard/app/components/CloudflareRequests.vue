<template>
  <section class="cloudflare cloudflare--requests">
    <div class="cloudflare--requests__header">
      <h2 class="cloudflare--requests__title">Top Páginas (ayer)</h2>
    </div>
    <div class="cloudflare--requests__table-wrapper">
      <TableDefault :columns="columns">
        <TableRow v-for="(row, index) in rows" :key="index">
          <TableCell>
            <span class="cloudflare--requests__url" :title="row.path">{{
              row.path
            }}</span>
          </TableCell>
          <TableCell align="right">{{ formatNumber(row.requests) }}</TableCell>
          <TableCell align="right">{{ formatBytes(row.bytes) }}</TableCell>
        </TableRow>
      </TableDefault>
      <div
        v-if="rows.length === 0 && !loading"
        class="cloudflare--requests__empty"
      >
        <p>No hay datos disponibles</p>
      </div>
      <div v-if="loading" class="cloudflare--requests__loading">
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

interface CloudflareRequestRow {
  path: string;
  requests: number;
  bytes: number;
}

const columns = [
  { label: "Página" },
  { label: "Requests", align: "right" as const },
  { label: "Ancho de Banda", align: "right" as const },
];

const apiClient = useApiClient();
const loading = ref(true);
const rows = ref<CloudflareRequestRow[]>([]);

const formatNumber = (n: number) => new Intl.NumberFormat("es-CL").format(n);
const formatBytes = (b: number): string => {
  if (b >= 1_073_741_824) return `${(b / 1_073_741_824).toFixed(1)} GB`;
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
};

watch(
  () => true,
  async () => {
    try {
      loading.value = true;
      rows.value = (await apiClient("cloudflare/requests", {
        method: "GET",
      })) as CloudflareRequestRow[];
    } catch (error) {
      console.error("Error fetching Cloudflare requests:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

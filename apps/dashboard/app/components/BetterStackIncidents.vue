<template>
  <section class="better-stack better-stack--incidents">
    <div class="better-stack--incidents__header">
      <h2 class="better-stack--incidents__title">Incidentes Recientes</h2>
    </div>
    <div class="better-stack--incidents__table-wrapper">
      <TableDefault :columns="columns">
        <TableRow v-for="row in incidents" :key="row.id">
          <TableCell>{{ row.monitorName }}</TableCell>
          <TableCell>{{ row.cause }}</TableCell>
          <TableCell align="right">{{ formatDate(row.startedAt) }}</TableCell>
          <TableCell align="right">
            {{ row.duration !== null ? `${row.duration} min` : "—" }}
          </TableCell>
        </TableRow>
      </TableDefault>
      <div
        v-if="incidents.length === 0 && !loading"
        class="better-stack--incidents__empty"
      >
        <p>No hay incidentes recientes</p>
      </div>
      <div v-if="loading" class="better-stack--incidents__loading">
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
import type { BetterStackIncident } from "@/types/better-stack";

const columns = [
  { label: "Monitor" },
  { label: "Causa" },
  { label: "Inicio", align: "right" as const },
  { label: "Duración", align: "right" as const },
];

const apiClient = useApiClient();
const loading = ref(true);
const incidents = ref<BetterStackIncident[]>([]);

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

watch(
  () => true,
  async () => {
    try {
      loading.value = true;
      incidents.value = (await apiClient("better-stack/incidents", {
        method: "GET",
      })) as BetterStackIncident[];
    } catch (error) {
      console.error("Error fetching Better Stack incidents:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

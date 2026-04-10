<template>
  <section class="better-stack better-stack--monitors">
    <div v-if="loading" class="better-stack--monitors__loading">
      <p>Cargando...</p>
    </div>
    <div
      v-else-if="monitors.length === 0"
      class="better-stack--monitors__empty"
    >
      <p>No hay monitores disponibles</p>
    </div>
    <template v-else>
      <CardMonitor
        v-for="monitor in monitors"
        :key="monitor.id"
        :name="monitor.name"
        :url="monitor.url"
        :status="monitor.status"
        :last-checked-at="monitor.lastCheckedAt"
        :check-frequency="monitor.checkFrequency"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import CardMonitor from "@/components/CardMonitor.vue";
import type { BetterStackMonitor } from "@/types/better-stack";

const apiClient = useApiClient();
const loading = ref(true);
const monitors = ref<BetterStackMonitor[]>([]);

watch(
  () => true,
  async () => {
    try {
      loading.value = true;
      monitors.value = (await apiClient("better-stack/monitors", {
        method: "GET",
      })) as BetterStackMonitor[];
    } catch (error) {
      console.error("Error fetching Better Stack monitors:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

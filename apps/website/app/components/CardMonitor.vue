<template>
  <article class="card card--monitor">
    <div class="card--monitor__title">
      <span
        class="card--monitor__dot"
        :class="`card--monitor__dot--${status}`"
      />
      {{ name }}
    </div>
    <div class="card--monitor__value">{{ statusLabel }}</div>
    <div class="card--monitor__meta">
      {{ url }}
    </div>
    <div class="card--monitor__meta">
      Cada {{ checkFrequency / 60 }} min
      <span v-if="lastCheckedAt"> · {{ formatDate(lastCheckedAt) }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MonitorStatus } from "@/types/better-stack";

const props = defineProps<{
  name: string;
  url: string;
  status: MonitorStatus;
  lastCheckedAt: string | null;
  checkFrequency: number;
}>();

const statusLabel = computed(() => {
  const labels: Record<MonitorStatus, string> = {
    up: "Operativo",
    down: "Caído",
    paused: "Pausado",
    pending: "Pendiente",
    maintenance: "Mantenimiento",
    validating: "Validando",
  };
  return labels[props.status];
});

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
</script>

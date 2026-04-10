<template>
  <section class="google-analytics google-analytics--chart">
    <div class="google-analytics--chart__header">
      <h2 class="google-analytics--chart__title">
        Sesiones y Usuarios (últimos 28 días)
      </h2>
    </div>
    <div class="google-analytics--chart__canvas">
      <div v-if="loading" class="google-analytics--chart__loading">
        <p>Cargando datos...</p>
      </div>
      <Line v-else :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

interface GA4StatsRow {
  date: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
}

const apiClient = useApiClient();
const loading = ref(true);
const stats = ref<GA4StatsRow[]>([]);

const chartData = computed(() => ({
  labels: stats.value.map((r) => r.date),
  datasets: [
    {
      label: "Sesiones",
      data: stats.value.map((r) => r.sessions),
      borderColor: "#2196f3",
      backgroundColor: "rgba(33,150,243,0.1)",
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
      yAxisID: "ySessions",
    },
    {
      label: "Usuarios",
      data: stats.value.map((r) => r.users),
      borderColor: "#7c3aed",
      backgroundColor: "rgba(124,58,237,0.05)",
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
      yAxisID: "yUsers",
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: "index" as const },
  plugins: {
    legend: { display: true, position: "top" as const },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, maxTicksLimit: 10 },
    },
    ySessions: {
      type: "linear" as const,
      position: "left" as const,
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.06)" },
      ticks: { font: { size: 11 } },
    },
    yUsers: {
      type: "linear" as const,
      position: "right" as const,
      beginAtZero: true,
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
  },
  animation: { duration: 0 },
}));

watch(
  () => true,
  async () => {
    try {
      loading.value = true;
      stats.value = (await apiClient("google-analytics/stats", {
        method: "GET",
      })) as GA4StatsRow[];
    } catch (error) {
      console.error("Error fetching Google Analytics stats:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

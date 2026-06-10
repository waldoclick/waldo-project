<template>
  <section class="search-console search-console--stats">
    <div class="search-console--stats__kpis">
      <CardStat
        title="Clicks"
        :value="kpis.clicks"
        :icon="MousePointerClick"
        icon-color="#2196f3"
        icon-bg-color="#e3f2fd"
      />
      <CardStat
        title="Impressiones"
        :value="kpis.impressions"
        :icon="Eye"
        icon-color="#7c3aed"
        icon-bg-color="#ede9fe"
      />
      <CardStat
        title="CTR Promedio"
        :value="kpis.ctr"
        :icon="TrendingUp"
        icon-color="#16a34a"
        icon-bg-color="#dcfce7"
      />
      <CardStat
        title="Posición Promedio"
        :value="kpis.position"
        :icon="Hash"
        icon-color="#ca8a04"
        icon-bg-color="#fef9c3"
      />
    </div>
    <div class="search-console--stats__chart">
      <div class="search-console--stats__chart__header">
        <h2 class="search-console--stats__chart__title">
          Performance (últimos 28 días)
        </h2>
      </div>
      <div class="search-console--stats__chart__canvas">
        <div v-if="loading" class="search-console--stats__chart__loading">
          <p>Cargando datos...</p>
        </div>
        <Line v-else :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Line } from "vue-chartjs";
import { MousePointerClick, Eye, TrendingUp, Hash } from "lucide-vue-next";
import CardStat from "@/components/CardStat.vue";
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

interface SearchConsolePerformanceRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const apiClient = useApiClient();
const loading = ref(true);
const performance = ref<SearchConsolePerformanceRow[]>([]);

const kpis = computed(() => {
  const rows = performance.value;
  if (rows.length === 0) {
    return { clicks: 0, impressions: 0, ctr: "0%", position: "0" };
  }
  const totalClicks = rows.reduce((acc, r) => acc + r.clicks, 0);
  const totalImpressions = rows.reduce((acc, r) => acc + r.impressions, 0);
  const avgCtr = rows.reduce((acc, r) => acc + r.ctr, 0) / rows.length;
  const avgPosition =
    rows.reduce((acc, r) => acc + r.position, 0) / rows.length;
  return {
    clicks: totalClicks,
    impressions: totalImpressions,
    ctr: `${(avgCtr * 100).toFixed(1)}%`,
    position: avgPosition.toFixed(1),
  };
});

const chartData = computed(() => ({
  labels: performance.value.map((r) => r.date),
  datasets: [
    {
      label: "Clicks",
      data: performance.value.map((r) => r.clicks),
      borderColor: "#2196f3",
      backgroundColor: "rgba(33,150,243,0.1)",
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
      yAxisID: "yClicks",
    },
    {
      label: "Impressiones",
      data: performance.value.map((r) => r.impressions),
      borderColor: "#7c3aed",
      backgroundColor: "rgba(124,58,237,0.05)",
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
      yAxisID: "yImpressions",
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
    yClicks: {
      type: "linear" as const,
      position: "left" as const,
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.06)" },
      ticks: { font: { size: 11 } },
    },
    yImpressions: {
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
      performance.value = (await apiClient("search-console/performance", {
        method: "GET",
      })) as SearchConsolePerformanceRow[];
    } catch (error) {
      console.error("Error fetching Search Console performance:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

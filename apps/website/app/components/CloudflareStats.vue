<template>
  <section class="cloudflare cloudflare--stats">
    <div class="cloudflare--stats__kpis">
      <CardStat
        title="Requests"
        :value="kpis.requests"
        :icon="Globe"
        icon-color="#f38020"
        icon-bg-color="#fef3e8"
      />
      <CardStat
        title="Ancho de Banda"
        :value="kpis.bytes"
        :icon="Wifi"
        icon-color="#2196f3"
        icon-bg-color="#e3f2fd"
      />
      <CardStat
        title="Page Views"
        :value="kpis.pageViews"
        :icon="Eye"
        icon-color="#16a34a"
        icon-bg-color="#dcfce7"
      />
      <CardStat
        title="Amenazas"
        :value="kpis.threats"
        :icon="ShieldAlert"
        icon-color="#dc2626"
        icon-bg-color="#fee2e2"
      />
    </div>
    <div class="cloudflare--stats__chart">
      <div class="cloudflare--stats__chart__header">
        <h2 class="cloudflare--stats__chart__title">
          Tráfico (últimos 30 días)
        </h2>
      </div>
      <div class="cloudflare--stats__chart__canvas">
        <div v-if="loading" class="cloudflare--stats__chart__loading">
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
import { Globe, Wifi, Eye, ShieldAlert } from "lucide-vue-next";
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

interface CloudflareTrafficRow {
  date: string;
  requests: number;
  bytes: number;
  pageViews: number;
  threats: number;
  cachedRequests: number;
}

const formatBytes = (b: number): string => {
  if (b >= 1_073_741_824) return `${(b / 1_073_741_824).toFixed(1)} GB`;
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
};

const apiClient = useApiClient();
const loading = ref(true);
const traffic = ref<CloudflareTrafficRow[]>([]);

const kpis = computed(() => {
  const rows = traffic.value;
  if (rows.length === 0) {
    return { requests: 0, bytes: "0 B", pageViews: 0, threats: 0 };
  }
  return {
    requests: rows.reduce((acc, r) => acc + r.requests, 0),
    bytes: formatBytes(rows.reduce((acc, r) => acc + r.bytes, 0)),
    pageViews: rows.reduce((acc, r) => acc + r.pageViews, 0),
    threats: rows.reduce((acc, r) => acc + r.threats, 0),
  };
});

const chartData = computed(() => ({
  labels: traffic.value.map((r) => r.date),
  datasets: [
    {
      label: "Requests",
      data: traffic.value.map((r) => r.requests),
      borderColor: "#f38020",
      backgroundColor: "rgba(243,128,32,0.1)",
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
      yAxisID: "yRequests",
    },
    {
      label: "Page Views",
      data: traffic.value.map((r) => r.pageViews),
      borderColor: "#2196f3",
      backgroundColor: "rgba(33,150,243,0.05)",
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
      yAxisID: "yPageViews",
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
    yRequests: {
      type: "linear" as const,
      position: "left" as const,
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.06)" },
      ticks: { font: { size: 11 } },
    },
    yPageViews: {
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
      traffic.value = (await apiClient("cloudflare/traffic", {
        method: "GET",
      })) as CloudflareTrafficRow[];
    } catch (error) {
      console.error("Error fetching Cloudflare traffic:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

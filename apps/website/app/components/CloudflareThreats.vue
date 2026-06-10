<template>
  <section class="cloudflare cloudflare--threats">
    <div class="cloudflare--threats__header">
      <h2 class="cloudflare--threats__title">Días con más amenazas</h2>
      <div class="cloudflare--threats__period-selector">
        <button
          ref="dropdownButton"
          class="cloudflare--threats__period-button"
          @click="toggleDropdown"
        >
          {{ selectedPeriod.label }}
          <ChevronDown
            class="cloudflare--threats__period-button__icon"
            :class="{
              'cloudflare--threats__period-button__icon--open': isDropdownOpen,
            }"
          />
        </button>
        <div
          v-if="isDropdownOpen"
          ref="dropdownMenu"
          class="cloudflare--threats__period-menu"
        >
          <button
            v-for="period in periods"
            :key="period.days"
            class="cloudflare--threats__period-menu__item"
            :class="{
              'cloudflare--threats__period-menu__item--active':
                period.days === selectedPeriod.days,
            }"
            @click="selectPeriod(period)"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </div>
    <div class="cloudflare--threats__chart">
      <div v-if="loading" class="cloudflare--threats__loading">
        <p>Cargando datos...</p>
      </div>
      <div v-else-if="rows.length === 0" class="cloudflare--threats__empty">
        <p>No hay amenazas en este período</p>
      </div>
      <Bar v-else :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { Bar } from "vue-chartjs";
import { ChevronDown } from "lucide-vue-next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { TooltipItem } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface CloudflareThreatRow {
  date: string;
  threats: number;
  requests: number;
}

interface Period {
  label: string;
  days: number;
}

const periods: Period[] = [
  { label: "Últimos 7 días", days: 7 },
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 90 días", days: 90 },
];

const apiClient = useApiClient();
const loading = ref(true);
const rows = ref<CloudflareThreatRow[]>([]);
const selectedPeriod = ref<Period>(periods[1]!);
const isDropdownOpen = ref(false);
const dropdownButton = ref<HTMLElement | null>(null);
const dropdownMenu = ref<HTMLElement | null>(null);

const formatNumber = (n: number) => new Intl.NumberFormat("es-CL").format(n);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectPeriod = (period: Period) => {
  selectedPeriod.value = period;
  isDropdownOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownButton.value &&
    dropdownMenu.value &&
    !dropdownButton.value.contains(event.target as Node) &&
    !dropdownMenu.value.contains(event.target as Node)
  ) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

watch(
  () => selectedPeriod.value.days,
  async (days) => {
    try {
      loading.value = true;
      rows.value = (await apiClient("cloudflare/threats", {
        method: "GET",
        params: { days } as unknown as Record<string, unknown>,
      })) as CloudflareThreatRow[];
    } catch (error) {
      console.error("Error fetching Cloudflare threats:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);

const chartData = computed(() => ({
  labels: rows.value.map((r) => r.date),
  datasets: [
    {
      label: "Amenazas",
      data: rows.value.map((r) => r.threats),
      backgroundColor: "#ff6b6b",
      borderColor: "#ff6b6b",
      borderWidth: 0,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: "index" as const },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      displayColors: false,
      backgroundColor: "#fff",
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 4,
      padding: 8,
      titleColor: "#000",
      bodyColor: "#000",
      titleFont: { size: 11, weight: "normal" as const },
      bodyFont: { size: 11, weight: "normal" as const },
      callbacks: {
        label: (context: TooltipItem<"bar">) =>
          `${formatNumber(context.parsed.y)} amenazas`,
      },
      caretSize: 0,
      cornerRadius: 4,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, maxTicksLimit: 10 },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.06)" },
      ticks: {
        font: { size: 11 },
        callback: (value: number | string) => formatNumber(Number(value)),
      },
    },
  },
  animation: { duration: 0 },
}));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && ad"
      class="stats--ad__backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="`Estadísticas del anuncio: ${ad.name}`"
      @click.self="$emit('close')"
    >
      <div class="stats--ad__dialog">
        <!-- Header -->
        <div class="stats--ad__header">
          <div class="stats--ad__header__info">
            <span class="stats--ad__header__eyebrow"
              >Estadísticas del anuncio</span
            >
            <h3 class="stats--ad__header__title">{{ ad.name }}</h3>
            <div class="stats--ad__header__meta">
              <span
                :class="[
                  'stats--ad__badge',
                  `stats--ad__badge--${ad.status ?? 'active'}`,
                ]"
                >{{ badgeLabel }}</span
              >
              <span v-if="ad.category" class="stats--ad__header__cat">{{
                ad.category
              }}</span>
            </div>
          </div>
          <button
            type="button"
            class="stats--ad__close"
            aria-label="Cerrar estadísticas"
            @click="$emit('close')"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- KPI tiles -->
        <div class="stats--ad__kpis">
          <div class="stats--ad__kpi">
            <span class="stats--ad__kpi__label">Vistas totales</span>
            <div class="stats--ad__kpi__value">
              {{ loading ? "—" : stats.total }}
            </div>
          </div>
          <div class="stats--ad__kpi">
            <span class="stats--ad__kpi__label">Contactos</span>
            <div class="stats--ad__kpi__value">
              {{ loading ? "—" : stats.contacts }}
            </div>
          </div>
          <div class="stats--ad__kpi">
            <span class="stats--ad__kpi__label">Conversión</span>
            <div class="stats--ad__kpi__value">
              {{ loading ? "—" : `${stats.conversion}%` }}
            </div>
          </div>
        </div>

        <!-- Chart section -->
        <div class="stats--ad__chart-section">
          <div class="stats--ad__chart-section__row">
            <span class="stats--ad__chart-section__heading"
              >Vistas en los últimos 14 días</span
            >
            <span class="stats--ad__chart-section__avg"
              >Prom. {{ loading ? "—" : stats.avgPerDay }} / día</span
            >
          </div>
          <div class="stats--ad__chart-section__canvas">
            <Bar
              v-if="!loading && chartData"
              :data="chartData"
              :options="chartOptions"
            />
            <div v-else class="stats--ad__chart-section__loading">
              Cargando...
            </div>
          </div>
        </div>

        <!-- Info note -->
        <div class="stats--ad__note">
          <Info :size="16" class="stats--ad__note__icon" />
          <span class="stats--ad__note__text">
            Podrás renovar este anuncio cuando venza. Para ganar visibilidad
            antes, destácalo desde Mis anuncios.
          </span>
        </div>

        <!-- Footer -->
        <div class="stats--ad__footer">
          <button
            type="button"
            class="stats--ad__footer__close"
            @click="$emit('close')"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { X, Info } from "lucide-vue-next";
import { buildStatsChartData } from "@/utils/stats";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface AdStatsModalProp {
  documentId: string;
  name: string;
  category?: string;
  status?: string;
}

const props = defineProps<{
  open: boolean;
  ad: AdStatsModalProp | null;
}>();

defineEmits<{
  close: [];
}>();

const userStore = useUserStore();

interface StatsState {
  total: number;
  series: number[];
  contacts: number;
  conversion: number;
  avgPerDay: number;
}

const stats = ref<StatsState>({
  total: 0,
  series: [],
  contacts: 0,
  conversion: 0,
  avgPerDay: 0,
});

const loading = ref(false);

watch(
  () => [props.open, props.ad?.documentId] as const,
  async ([isOpen, documentId]) => {
    if (!isOpen || !documentId) return;
    loading.value = true;
    try {
      const result = await userStore.loadAdStats(documentId, 14);
      stats.value = result;
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);

const chartData = computed(() => {
  if (stats.value.series.length === 0) return null;
  return buildStatsChartData(stats.value.series);
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
      backgroundColor: "#fff",
      borderColor: "#ece9e4",
      borderWidth: 1,
      titleColor: "#26252b",
      bodyColor: "#56535f",
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: "#8a8794" },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.06)" },
      ticks: { font: { size: 11 }, color: "#8a8794" },
    },
  },
};

const badgeLabel = computed(() => {
  const s = props.ad?.status;
  if (s === "published") return "Activo";
  if (s === "review") return "En revisión";
  if (s === "expired") return "Expirado";
  if (s === "rejected") return "Rechazado";
  if (s === "banned") return "Baneado";
  return "Activo";
});
</script>

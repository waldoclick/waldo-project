<template>
  <section class="google-analytics google-analytics--summary">
    <div class="google-analytics--summary__kpis">
      <div v-if="loading" class="google-analytics--summary__kpi">
        <p>Cargando...</p>
      </div>
      <template v-else>
        <div class="google-analytics--summary__kpi">
          <CardStat
            title="Sesiones"
            :value="formatNumber(summary.sessions.current)"
            :icon="Activity"
            icon-color="#2196f3"
            icon-bg-color="#e3f2fd"
          />
          <span
            class="google-analytics--summary__delta"
            :class="deltaClass(summary.sessions.delta, false)"
          >
            {{ formatDelta(summary.sessions.delta) }}
          </span>
        </div>

        <div class="google-analytics--summary__kpi">
          <CardStat
            title="Usuarios"
            :value="formatNumber(summary.users.current)"
            :icon="Users"
            icon-color="#7c3aed"
            icon-bg-color="#ede9fe"
          />
          <span
            class="google-analytics--summary__delta"
            :class="deltaClass(summary.users.delta, false)"
          >
            {{ formatDelta(summary.users.delta) }}
          </span>
        </div>

        <div class="google-analytics--summary__kpi">
          <CardStat
            title="Bounce Rate"
            :value="formatBounceRate(summary.bounceRate.current)"
            :icon="LogOut"
            icon-color="#ca8a04"
            icon-bg-color="#fef9c3"
          />
          <span
            class="google-analytics--summary__delta"
            :class="deltaClass(summary.bounceRate.delta, true)"
          >
            {{ formatDelta(summary.bounceRate.delta) }}
          </span>
        </div>

        <div class="google-analytics--summary__kpi">
          <CardStat
            title="Duración Prom."
            :value="formatDuration(summary.avgDuration.current)"
            :icon="Clock"
            icon-color="#16a34a"
            icon-bg-color="#dcfce7"
          />
          <span
            class="google-analytics--summary__delta"
            :class="deltaClass(summary.avgDuration.delta, false)"
          >
            {{ formatDelta(summary.avgDuration.delta) }}
          </span>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Activity, Users, LogOut, Clock } from "lucide-vue-next";
import CardStat from "@/components/CardStat.vue";

interface GA4SummaryMetric {
  current: number;
  previous: number;
  delta: number;
}

interface GA4Summary {
  sessions: GA4SummaryMetric;
  users: GA4SummaryMetric;
  bounceRate: GA4SummaryMetric;
  avgDuration: GA4SummaryMetric;
}

const defaultMetric = (): GA4SummaryMetric => ({
  current: 0,
  previous: 0,
  delta: 0,
});

const apiClient = useApiClient();
const loading = ref(true);
const summary = ref<GA4Summary>({
  sessions: defaultMetric(),
  users: defaultMetric(),
  bounceRate: defaultMetric(),
  avgDuration: defaultMetric(),
});

const formatNumber = (n: number) =>
  new Intl.NumberFormat("es-CL").format(Math.round(n));

const formatBounceRate = (n: number) => `${(n * 100).toFixed(1)}%`;

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
};

const formatDelta = (delta: number) => {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
};

const deltaClass = (delta: number, inverted: boolean) => {
  const positive = inverted ? delta < 0 : delta >= 0;
  return positive
    ? "google-analytics--summary__delta--positive"
    : "google-analytics--summary__delta--negative";
};

watch(
  () => true,
  async () => {
    try {
      loading.value = true;
      summary.value = (await apiClient("google-analytics/summary", {
        method: "GET",
      })) as GA4Summary;
    } catch (error) {
      console.error("Error fetching Google Analytics summary:", error);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

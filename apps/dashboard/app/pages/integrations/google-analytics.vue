<template>
  <div>
    <HeroDefault title="Google Analytics" :breadcrumbs="breadcrumbs">
      <template #actions>
        <a
          href="https://analytics.google.com"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn--primary"
        >
          <ExternalLink :size="16" />
          Google Analytics
        </a>
      </template>
    </HeroDefault>
    <div class="google-analytics google-analytics--page">
      <div class="google-analytics--page__container">
        <GoogleAnalyticsSummary />
        <GoogleAnalyticsChart />
        <GoogleAnalyticsPages />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import GoogleAnalyticsSummary from "@/components/GoogleAnalyticsSummary.vue";
import GoogleAnalyticsChart from "@/components/GoogleAnalyticsChart.vue";
import GoogleAnalyticsPages from "@/components/GoogleAnalyticsPages.vue";
import { ExternalLink } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Integraciones", to: "/integrations" },
  { label: "Google Analytics" },
];
</script>

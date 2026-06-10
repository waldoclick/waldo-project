<template>
  <div>
    <HeroHeaderDashboard title="Search Console" :breadcrumbs="breadcrumbs">
      <template #actions>
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn--primary"
        >
          <ExternalLink :size="16" />
          Search Console
        </a>
      </template>
    </HeroHeaderDashboard>
    <div class="search-console search-console--page">
      <div class="search-console--page__container">
        <SearchConsoleStats />
        <SearchConsoleQueries />
        <SearchConsolePages />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchConsoleStats from "@/components/SearchConsoleStats.vue";
import SearchConsoleQueries from "@/components/SearchConsoleQueries.vue";
import SearchConsolePages from "@/components/SearchConsolePages.vue";
import { ExternalLink } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Integraciones", to: "/dashboard/integrations" },
  { label: "Search Console" },
];
</script>

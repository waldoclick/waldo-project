<template>
  <div>
    <HeroDefault title="Better Stack" :breadcrumbs="breadcrumbs">
      <template #actions>
        <a
          href="https://uptime.betterstack.com"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn--primary"
        >
          <ExternalLink :size="16" />
          Better Stack
        </a>
      </template>
    </HeroDefault>
    <div class="better-stack better-stack--page">
      <div class="better-stack--page__container">
        <BetterStackMonitors />
        <BetterStackIncidents />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BetterStackMonitors from "@/components/BetterStackMonitors.vue";
import BetterStackIncidents from "@/components/BetterStackIncidents.vue";
import { ExternalLink } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Integraciones", to: "/integrations" },
  { label: "Better Stack" },
];
</script>

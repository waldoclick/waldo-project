<template>
  <div>
    <HeroDefault title="Cloudflare" :breadcrumbs="breadcrumbs">
      <template #actions>
        <a
          href="https://dash.cloudflare.com"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn--primary"
        >
          <ExternalLink :size="16" />
          Cloudflare
        </a>
      </template>
    </HeroDefault>
    <div class="cloudflare cloudflare--page">
      <div class="cloudflare--page__container">
        <CloudflareStats />
        <CloudflareRequests />
        <CloudflareThreats />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import CloudflareStats from "@/components/CloudflareStats.vue";
import CloudflareRequests from "@/components/CloudflareRequests.vue";
import CloudflareThreats from "@/components/CloudflareThreats.vue";
import { ExternalLink } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Integraciones", to: "/integrations" },
  { label: "Cloudflare" },
];
</script>

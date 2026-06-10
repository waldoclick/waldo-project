<template>
  <div>
    <HeroHeaderDashboard title="FAQs" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/dashboard/maintenance/faqs/new">
          Agregar FAQ
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <FaqsDefault />
  </div>
</template>

<script setup lang="ts">
import FaqsDefault from "@/components/FaqsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "FAQs" }];
</script>

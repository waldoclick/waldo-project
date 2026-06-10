<template>
  <div>
    <HeroHeaderDashboard title="Condiciones" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          to="/dashboard/maintenance/conditions/new"
        >
          Agregar condición
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <ConditionsDefault />
  </div>
</template>

<script setup lang="ts">
import ConditionsDefault from "@/components/ConditionsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Condiciones" }];
</script>

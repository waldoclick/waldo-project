<template>
  <div>
    <HeroHeaderDashboard
      title="Politicas de Privacidad"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/maintenance/policies/new">
          Agregar Politica
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <PoliciesDashboard />
  </div>
</template>

<script setup lang="ts">
import PoliciesDefault from "@/components/PoliciesDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Politicas" }];
</script>

<template>
  <div>
    <HeroHeaderDashboard title="Condiciones de Uso" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          to="/dashboard/maintenance/terms/new"
        >
          Agregar Condicion
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <TermsDashboard />
  </div>
</template>

<script setup lang="ts">
import TermsDefault from "@/components/TermsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Condiciones de Uso" }];
</script>

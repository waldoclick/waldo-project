<template>
  <div>
    <HeroHeaderDashboard title="Regiones" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          to="/dashboard/maintenance/regions/new"
        >
          Agregar región
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <RegionsDefault />
  </div>
</template>

<script setup lang="ts">
import RegionsDefault from "@/components/RegionsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Regiones" }];
</script>

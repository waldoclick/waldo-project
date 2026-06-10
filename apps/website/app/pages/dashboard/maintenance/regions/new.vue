<template>
  <div>
    <HeroDefaultDashboard title="Nueva región" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva región" :columns="1">
          <FormRegion />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormRegion from "@/components/FormRegion.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Regiones", to: "/dashboard/maintenance/regions" },
  { label: "Nueva" },
];
</script>

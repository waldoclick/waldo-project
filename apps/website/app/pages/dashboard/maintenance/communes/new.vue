<template>
  <div>
    <HeroHeaderDashboard title="Nueva comuna" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva comuna" :columns="1">
          <FormCommune />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormCommune from "@/components/FormCommune.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Comunas", to: "/dashboard/maintenance/communes" },
  { label: "Nueva" },
];
</script>

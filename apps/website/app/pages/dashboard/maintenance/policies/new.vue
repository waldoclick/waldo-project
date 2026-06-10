<template>
  <div>
    <HeroDefaultDashboard title="Nueva Politica" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva Politica" :columns="1">
          <FormPolicy />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormPolicy from "@/components/FormPolicy.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Politicas", to: "/dashboard/maintenance/policies" },
  { label: "Nueva" },
];
</script>

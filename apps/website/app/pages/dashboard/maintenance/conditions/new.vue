<template>
  <div>
    <HeroDefaultDashboard title="Nueva condición" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva condición" :columns="1">
          <FormCondition />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormCondition from "@/components/FormCondition.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Condiciones", to: "/dashboard/maintenance/conditions" },
  { label: "Nueva" },
];
</script>

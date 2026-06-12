<template>
  <div>
    <HeroHeaderDashboard title="Nuevo pack" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nuevo pack" :columns="1">
          <FormPackDashboard />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Packs", to: "/dashboard/maintenance/packs" },
  { label: "Nuevo" },
];
</script>

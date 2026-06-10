<template>
  <div>
    <HeroDefaultDashboard title="Nueva categoría" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva categoría" :columns="1">
          <FormCategory />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormCategory from "@/components/FormCategory.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Categorías", to: "/dashboard/maintenance/categories" },
  { label: "Nueva" },
];
</script>

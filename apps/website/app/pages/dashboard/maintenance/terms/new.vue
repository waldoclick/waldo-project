<template>
  <div>
    <HeroDefaultDashboard
      title="Nueva Condicion de Uso"
      :breadcrumbs="breadcrumbs"
    />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva Condicion de Uso" :columns="1">
          <FormTerm />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormTerm from "@/components/FormTerm.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Condiciones de Uso", to: "/maintenance/terms" },
  { label: "Nueva" },
];
</script>

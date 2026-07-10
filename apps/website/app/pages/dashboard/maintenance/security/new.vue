<template>
  <div>
    <HeroHeaderDashboard
      title="Nueva Sección de Política de Seguridad"
      :breadcrumbs="breadcrumbs"
    />
    <BoxContent>
      <template #content>
        <BoxInformation
          title="Nueva Sección de Política de Seguridad"
          :columns="1"
        >
          <FormSecurityPolicy />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormSecurityPolicy from "@/components/FormSecurityPolicy.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Política de Seguridad", to: "/dashboard/maintenance/security" },
  { label: "Nueva" },
];
</script>

<template>
  <div>
    <HeroHeaderDashboard
      title="Nueva Sección de Política de Cookies"
      :breadcrumbs="breadcrumbs"
    />
    <BoxContent>
      <template #content>
        <BoxInformation
          title="Nueva Sección de Política de Cookies"
          :columns="1"
        >
          <FormCookiePolicy />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormCookiePolicy from "@/components/FormCookiePolicy.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Política de Cookies", to: "/dashboard/maintenance/cookies" },
  { label: "Nueva" },
];
</script>

<template>
  <div>
    <HeroHeaderDashboard title="Nuevo FAQ" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nuevo FAQ" :columns="1">
          <FormFaq />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormFaq from "@/components/FormFaq.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "FAQs", to: "/dashboard/maintenance/faqs" },
  { label: "Nuevo" },
];
</script>
